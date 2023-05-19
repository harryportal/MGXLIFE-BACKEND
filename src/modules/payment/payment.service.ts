import Stripe from "stripe";
import { BadRequestError, InternalServerError } from "../../common/error";
import ICard from "./payment.interface";

export default class StripeService{
    private stripe:Stripe;
    private secretKey = process.env.STRIPE_SECRETKEY!;
    private signingKey = process.env.STRIPE_SIGNINGKEY!;
    constructor(){
        this.stripe =  new Stripe(this.secretKey,
            {apiVersion: '2022-11-15',  maxNetworkRetries: 3,  timeout: 1000})
    }
    
    public createCustomer = async(email:string):Promise<Stripe.Customer>=>{
        let customer: Stripe.Customer;
        try {
            customer = await this.stripe.customers.create({
                email
            });
        }catch(err:any){
            throw new Error(`Failed to create subscription: ${err.message}`)
        }
        return customer;
    }


    public createPaymentMethod = async(cardToken: string): Promise<Stripe.PaymentMethod>=>{
        try {
          const paymentMethod = await this.stripe.paymentMethods.create({
            type: 'card',
            card: {
             /*This card token is gotten when the client uses stripe.js to tokenise the 
             card details actually: should have used in the other project lol!*/
              token: cardToken,  
            },
          });
    
          return paymentMethod;
        } catch (err:any) {
          throw new Error(`Failed to create payment method: ${err.message}`);
        }
      }
    
      public attachPaymentMethodToCustomer = async(paymentMethodId: string, customerId: string): Promise<void>=>{
        try {
          await this.stripe.paymentMethods.attach(paymentMethodId, {
            customer: customerId,
          });
        } catch (err:any) {
          throw new Error(`Failed to attach payment method to customer: ${err.message}`);
        }
      }
    
    
    public createSubscription = async(customerId: string, priceId: string): Promise<Stripe.Subscription>=>{
    try {
      const subscription = await this.stripe.subscriptions.create({
        customer: customerId,
        items: [
          { price: priceId },
        ],
      });

      return subscription;
    } catch (error:any) {
      throw new Error(`Failed to create subscription: ${error.message}`);
    }
  }

    public retrieveSubscription = async(subscriptionId: string): Promise<Stripe.Subscription>=>{
    try {
      const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);

      return subscription;
    } catch (error:any) {
      throw new Error(`Failed to retrieve subscription: ${error.message}`);
    }
  }

   public cancelSubscription = async(subscriptionId: string): Promise<Stripe.Subscription>=>{
    try {
      const canceledSubscription = await this.stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      });

      return canceledSubscription;
    } catch (error:any) {
      throw new Error(`Failed to cancel subscription: ${error.message}`);
    }
  }

    public getEvent = (payload:any, signature:string):Stripe.Event=>{
        let event;
        try{
            event = this.stripe.webhooks.constructEvent(payload, signature, this.signingKey)
        }catch(err:any){
            console.log({err})
            throw new BadRequestError(`WebHook Error ${err.message}`)
        }
        return event;
    }

    public retrieveIdFromSession = async(sessionId:string):Promise<string | null>=>{
        const session = await this.stripe.checkout.sessions.retrieve(sessionId);
        return session.client_reference_id;  // actually returns the listing Id
    }
        
    
}


