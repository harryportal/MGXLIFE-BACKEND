import Stripe from "stripe";
import { BadRequestError } from "../../common/error";
import { Distributor, SubscriptionStatus } from "@prisma/client";
import logger from "../../utils/logging/winston";
import { injectable, inject } from "inversify";
import { IDistributorRepository, Types} from "../distributor/distributor.interface";
import { IPaymentService } from "./payment.interface";

@injectable()
export default class PaymentService implements IPaymentService{
    private stripe:Stripe;
    constructor(@inject(Types.IDistributorRepository)private readonly distributorRepository:IDistributorRepository,
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

    public handleWebhookEvents = async(payload:any, signature:string)=>{
        const event = this.getEvent(payload, signature, this.signingKey)
        switch(event.type){
            case("invoice.payment_succeeded"):
                await this.handlePaymentEvent(event, SubscriptionStatus.PAID);
                break;
            case("invoice.paid"):
                await this.handlePaymentEvent(event, SubscriptionStatus.PENDING);
                break;
            case("invoice.payment_failed"):
                await this.handlePaymentEvent(event, SubscriptionStatus.NOT_PAID);
                break;
            case("transfer.created"):
                await this.handleTransferEvent(event);
                break;
            }
    }

    private handlePaymentEvent = async(event:Stripe.Event, status:SubscriptionStatus)=>{
      const session = event.data.object as Stripe.Invoice;
      const distributorStripeId = session.customer as string;
      const amount = session.amount_paid as number;
      await this.distributorRepository.updateDistributorSubscriptionStatus(distributorStripeId, status);
      if(status == SubscriptionStatus.PAID){
        await this.addSignUpFee(distributorStripeId, amount);  // for the parent distributor
      }
    }

    private handleTransferEvent = async(event:Stripe.Event)=>{
        const transfer = event.data.object as Stripe.Transfer;
        const disitributorAccountId = transfer.destination as string;
        await this.distributorRepository.resetDistributorBalance(disitributorAccountId)
    }

    /**
     * Gets the distributor from the stripeId, check
     * @param distibutorStripeId 
     * @param amount 
     */
    private addSignUpFee = async(stripeId:string, amount:number):Promise<void>=>{
        const disitributor = await this.distributorRepository.getDistributorwithStripeId(stripeId) as Distributor;
        const signUpBonus = (50/100) * amount;
        const sponsoringId = disitributor.referredById;
        if(sponsoringId){
            console.log(signUpBonus)
            console.log(sponsoringId)
            await this.distributorRepository.updateDistributorCommission(sponsoringId, signUpBonus);
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


