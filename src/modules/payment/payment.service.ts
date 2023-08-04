import Stripe from "stripe";
import { BadRequestError } from "../../common/error";
import { Distributor, SubscriptionStatus } from "@prisma/client";
import logger from "../../utils/logging/winston";
import { injectable, inject } from "inversify";
import { IDistributorRepository, Types} from "../distributor/distributor.interface";
import { IPaymentService } from "./payment.interface";
import { notifyCustomerSubscription } from "../mail/mailTemplates/subscriptionConfirmation";
import { IMailService, MTypes } from "../mail/mail.dto";
import { notifyCustomerSubscriptionFailed } from "../mail/mailTemplates/subscriptionUnsuccessful";

@injectable()
export default class PaymentService implements IPaymentService{
    private stripe:Stripe;
    constructor(@inject(Types.IDistributorRepository)private readonly distributorRepository:IDistributorRepository,
        @inject(MTypes.IMailService)private readonly mailService:IMailService,
        private readonly secretKey = process.env.STRIPE_SECRETKEY!, 
        private readonly signingKey = process.env.STRIPE_SIGNINGKEY!,
        private readonly accSigningKey = process.env.STRIPE_CONNECTEDACC_SIGNING_KEY! // key for connected accounts events
      ){
        this.stripe =  new Stripe(this.secretKey,
            {apiVersion: '2022-11-15',  maxNetworkRetries: 3,  timeout: 1000})
    }

    public createPortalSession = async(email:string)=>{
      const distributor = await this.distributorRepository.getDistributorwithEmail(email);
      const portalSession = await this.stripe.billingPortal.sessions.create({
        customer:distributor!.stripeCustomerId
    });
      return portalSession;
    }

    public createCheckOutSession = async(email:string):Promise<string>=>{
      const priceId = "price_1NBpCIB7eY2bXlKvxEIK2GJ3";
      const distributor = await this.distributorRepository.getDistributorwithEmail(email);
      try{
          const session = await this.stripe.checkout.sessions.create({
              customer: distributor!.stripeCustomerId,
              payment_method_types: ["card"],
              mode: "subscription",
              line_items:[{
                  price:priceId,
                  quantity:1,
              }],
              success_url: process.env.HOMEPAGE_URL!,
              cancel_url:  process.env.HOMEPAGE_URL!
             }) 
          return session.url as string;
      }catch(error){
          throw new BadRequestError(`Failed to create a checkout session, ${error}`);
  }}

    
    public createCustomer = async(email:string):Promise<string>=>{
        let customer: Stripe.Customer;
        try {
            customer = await this.stripe.customers.create({
                email
            });
        }catch(err:any){
            throw new Error(`Failed to create subscription: ${err.message}`)
        }
        return customer.id;  
    }

    public createConnectedAccount = async(distibutorEmail:string):Promise<string>=>{
      const account =  await this.stripe.accounts.create({
        type: "express",
        email:distibutorEmail,
        capabilities: {
          card_payments: {requested :true},
          transfers: {requested:true}
        }});
        return account.id;
    }

    public getConnectedAccountLoginLink = async(email:string):Promise<Stripe.Response<Stripe.LoginLink>>=>{
      const disitributor = await this.distributorRepository.getDistributorwithEmail(email) as Distributor;
      const loginLink = await this.stripe.accounts.createLoginLink( disitributor.accountId );
      return loginLink;
    }

    public getAccountOnboardingLink = async(email:string):Promise<string>=>{
      const {accountId} = await this.distributorRepository.getDistributorwithEmail(email) as Distributor;
      const accountCreationLink = await this.stripe.accountLinks.create({
          account: accountId,
          type: "account_onboarding",
          refresh_url: process.env.HOMEPAGE_URL,
          return_url: process.env.HOMEPAGE_URL
      });
      return accountCreationLink.url;
    }

    public payOutCustomer = async(accountId:string, amount:number):Promise<Stripe.Transfer>=>{
        return await this.stripe.transfers.create({
          amount,
          currency: "usd", 
          destination: accountId
        })
    }

    public retrieveSubscription = async(subscriptionId: string): Promise<Stripe.Subscription>=>{
        try {
        const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);
        return subscription;
        } catch (error:any) {
        throw new BadRequestError(`Failed to retrieve subscription: ${error.message}`);
        }
    }

    public handleAccountEvents = async(payload:any, signature:string)=>{
        const event = this.getEvent(payload, signature, this.signingKey)
        switch(event.type){
            case("invoice.payment_succeeded"):
                await this.handlePaymentEvent(event, SubscriptionStatus.PAID);
                break;
            case("invoice.payment_failed"):
                await this.handlePaymentEvent(event, SubscriptionStatus.UNPAID);
                break;
            case("transfer.created"):
                await this.handleTransferEvent(event);
                break;
            }
    }

    private handlePaymentEvent = async(event:Stripe.Event, status:SubscriptionStatus)=>{
      const session = event.data.object as Stripe.Invoice;
      const invoiceId = session.id;
      const distributorStripeId = session.customer as string;
      const amount = session.amount_paid as number;

      // check if this invoice object has been sent before -- to avoid idempotency
      const transaction = await this.distributorRepository.getSubsriptionTransaction(invoiceId);
      if(!transaction){
        await this.distributorRepository.createSubscriptionTransaction(invoiceId, distributorStripeId)
        const disitributor = await this.distributorRepository.updateDistributorSubscriptionStatus(distributorStripeId, status);
        if(status == SubscriptionStatus.UNPAID){ await this.sendSubcriptionFailedMail(session); }
        if(status == SubscriptionStatus.PAID){
        await this.addSignUpFee(disitributor, amount/100);  // for the parent distributor
        await this.sendSubcriptionMail(session);
        }
      }
      }

    /**
     * Sends a mail to notify the distributor of a successfull annual subscription
     * @param session 
     */
    private sendSubcriptionMail = async(session:Stripe.Invoice)=>{
        const email = session.customer_email as string;
        const { lastName }= await this.distributorRepository.getDistributorwithEmail(email) as Distributor;
        const distributorStripeLink = await this.createPortalSession(email);
        const template = notifyCustomerSubscription(lastName, distributorStripeLink.url);
        this.mailService.sendMail({to:email, subject:"Subscription to MXGLIFE Successful", html:template})
    }

    private sendSubcriptionFailedMail = async(session:Stripe.Invoice)=>{
        // send a mail to notify the distributor of a successfull annual subscription
        const email = session.customer_email as string;
        const { lastName }= await this.distributorRepository.getDistributorwithEmail(email) as Distributor;
        const distributorStripeLink = await this.createPortalSession(email);
        const template = notifyCustomerSubscriptionFailed(lastName, distributorStripeLink.url);
        this.mailService.sendMail({to:email, subject:"Subscription to MXGLIFE Failed", html:template})
    }

    private handleTransferEvent = async(event:Stripe.Event)=>{
        const transfer = event.data.object as Stripe.Transfer;
        const disitributorAccountId = transfer.destination as string;
        await this.distributorRepository.resetDistributorBalance(disitributorAccountId)
    }

    public handleConnectedAccountsEvents = async(payload:any, signature:string)=>{
      const event = this.getEvent(payload, signature, this.accSigningKey)
      const account = event.data.object as Stripe.Account;
      const distibutorEmail = account.email as string;
      await this.distributorRepository.updateDistributorAccountStatus(distibutorEmail);
    }

    /**
     * Gets the distributor sponsor, check if the sponsor is currently subscribed
     * Adds the sign up bonus and group volume (sign up fee) to the direct sponsor's commission
     * Then call a recursive function that adds the sign up fee as a group volume to every upline of the 
     * current sponsoring distributors
     * @param distibutorStripeId 
     * @param amount 
     */
    private addSignUpFee = async(distributor:Distributor, amount:number):Promise<void>=>{
        console.log(amount) // todo: comment this out after testing the logic with Tayo
        const signUpBonus = Math.round(((20/100) * amount));
        const sponsoringId = distributor.referredById;
        if(sponsoringId){
            const SponsoringDistributor = await this.distributorRepository.getProfile(sponsoringId) as Distributor;
            if(SponsoringDistributor.subscriptionStatus == "PAID"){
                await this.distributorRepository.updateDistributorCommission(sponsoringId, signUpBonus, amount);
                await this.distributorRepository.addVolumeToAllUplines(SponsoringDistributor.referredById, amount);
            }
        }        
    }

    private getEvent = (payload:any, signature:string, signingKey:string):Stripe.Event=>{
        let event;
        try{
            event = this.stripe.webhooks.constructEvent(payload, signature, signingKey)
        }catch(err:any){
            logger.error("Stripe Webhook Failure", err.message);
            throw new BadRequestError(`WebHook Error ${err.message}`)
        }
        return event;
    }

    public retrieveIdFromSession = async(sessionId:string):Promise<string | null>=>{
        const session = await this.stripe.checkout.sessions.retrieve(sessionId);
        return session.client_reference_id;  // actually returns the listing Id
    }
        
    
}


