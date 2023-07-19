import Stripe from "stripe";
import { BadRequestError, InternalServerError } from "../../common/error";
import { Distributor, SubscriptionStatus } from "@prisma/client";
import logger from "../../utils/logging/winston";
import { injectable, inject } from "inversify";
import { IDistributorRepository, Types} from "../distributor/distributor.interface";
import { IPaymentService } from "./payment.dtos";



// // Check if the customer has bank details attached
// async function hasBankDetails(customerId: string): Promise<boolean> {
//   try {
//     const customer = await stripe.customers.retrieve(customerId);
//     return customer.bank_account !== null;
//   } catch (error) {
//     console.error('Error checking customer bank details:', error);
//     throw error;
//   }
// }

// // Transfer funds to the customer's bank account
// async function transferFunds(customerId: string, amount: number): Promise<boolean> {
//   try {
//     // Check if the customer has bank details attached
//     const hasBankInfo = await hasBankDetails(customerId);

//     if (!hasBankInfo) {
//       console.log('Customer does not have bank details attached');
//       return false;
//     }

//     // Create a transfer to the customer's bank account
//     const transfer = await stripe.transfers.create({
//       amount,
//       currency: 'usd',
//       destination: customerId,
//     });

//     // Check the status of the transfer
//     if (transfer.status === 'paid') {
//       // Transfer succeeded
//       return true;
//     } else {
//       // Transfer failed
//       return false;
//     }
//   } catch (error) {
//     console.error('Error transferring funds:', error);
//     throw error;
//   }
// }

// // Example usage
// async function processPayment(customerId: string, amount: number): Promise<void> {
//   try {
//     // Create a payment intent
//     const paymentIntentId = await createPaymentIntent(customerId, amount);

//     // Confirm the payment intent
//     const paymentSucceeded = await confirmPaymentIntent(paymentIntentId);

//     if (paymentSucceeded) {
//       // Transfer funds to the customer's bank account
//       const transferSucceeded = await transferFunds(customerId, amount);

//       if (transferSucceeded) {
//         console.log('Payment processed and funds transferred successfully');
//       } else {
//         console.log('Payment processed but failed to transfer funds');
//       }
//     } else {
//       console.log('Payment failed');
//     }
//   } catch (error) {
//     console.error('Error processing payment:', error);
//   }
// }

// // Usage example
// const customerId = 'CUSTOMER_ID'; // Replace with actual customer ID
// const amount = 1000; // Replace with the desired payment amount

// processPayment(customerId, amount);


@injectable()
export default class PaymentService implements IPaymentService{
    private stripe:Stripe;
    private secretKey;
    private signingKey;
      constructor(@inject(Types.IDistributorRepository)private readonly distributorRepository:IDistributorRepository){
        this.secretKey = process.env.STRIPE_SECRETKEY!;
        this.signingKey = process.env.STRIPE_SIGNINGKEY!
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

        // Create a payment intent and initiate the payment process
    public createPaymentIntent = async(customerId: string, amount: number):Promise<string>=>{
        try {
        // Create the payment intent
        const paymentIntent = await this.stripe.paymentIntents.create({
            amount,
            currency: 'usd',
            customer: customerId,
        });
    
        // Return the payment intent ID
        return paymentIntent.id;
        } catch (error) {
            throw new BadRequestError("Error Crediting Customer, Please try again!")
        }
    }
    // Confirm a payment intent and process the payment
    confirmPaymentIntent = async(paymentIntentId: string): Promise<boolean> =>{
    try {
        // Confirm the payment intent
        const paymentIntent = await this.stripe.paymentIntents.confirm(paymentIntentId);

        // Check the status of the payment
        if (paymentIntent.status === 'succeeded') {
        // Payment succeeded
        return true;
        } else {
        // Payment failed
        return false;
        }
    } catch (error) {
        throw new BadRequestError("Error Crediting Customer, Please try again!")
    }
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


    public retrieveSubscription = async(subscriptionId: string): Promise<Stripe.Subscription>=>{
        try {
        const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);

        return subscription;
        } catch (error:any) {
        throw new BadRequestError(`Failed to retrieve subscription: ${error.message}`);
        }
    }

    public handleSubscriptionEvents = async(payload:any, signature:string)=>{
        const event = this.getEvent(payload, signature)
        const session = event.data.object as Stripe.Checkout.Session;
        const distributorStripeId = session.customer as string;
        const amount = session.amount_total as number;
        switch(event.type){
            /* For this case, we set the distributor subscription status as true and add 50% of the sign 
            up to the sponsporing distributor if any*/
            case("checkout.session.completed" || "invoice.paid" || "invoice.payment_succeeded"):
                await this.distributorRepository.updateDistributorSubscriptionStatus(distributorStripeId, 
                SubscriptionStatus.PAID);
                await this.addSignUpFee(distributorStripeId, amount);
                break;
            case("invoice.payment_failed"):
                /*update the distributor subscription status ... optionally add the logic to redirect the user to 
                their subscription portal*/
                await this.distributorRepository.updateDistributorSubscriptionStatus(distributorStripeId, 
                    SubscriptionStatus.NOT_PAID)
                break;    
        }
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
            await this.distributorRepository.updateDistributorCommission(sponsoringId, signUpBonus);
        }
    }

    public getEvent = (payload:any, signature:string):Stripe.Event=>{
        let event;
        try{
            event = this.stripe.webhooks.constructEvent(payload, signature, this.signingKey)
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


