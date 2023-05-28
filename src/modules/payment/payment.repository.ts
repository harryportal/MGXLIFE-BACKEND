import Stripe from "stripe";
import { BadRequestError, InternalServerError } from "../../common/error";
import AuthRepository from "../auth/auth.repositories";

export default class PaymentRepository{
    private stripe:Stripe;
    private secretKey;
    private signingKey;
    private distributorRepository;  // find a better way to do this!
    constructor(){
        this.distributorRepository = new AuthRepository();
        this.secretKey = process.env.STRIPE_SECRETKEY!;
        this.signingKey = process.env.STRIPE_SIGNINGKEY!
        this.stripe =  new Stripe(this.secretKey,
            {apiVersion: '2022-11-15',  maxNetworkRetries: 3,  timeout: 1000})
    }

    public createPortalSession = async(email:string)=>{
      const distributor = await this.distributorRepository.getDistributor(email);
      const portalSession = await this.stripe.billingPortal.sessions.create({
        customer:distributor!.stripeCustomerId
        //return_url: returnUrl,
      });
      return portalSession;
    }

    public createCheckOutSession = async(email:string):Promise<string>=>{
      const priceId = "price_1NBpCIB7eY2bXlKvxEIK2GJ3";
      const distributor = await this.distributorRepository.getDistributor(email);
      try{
          const session = await this.stripe.checkout.sessions.create({
              customer: distributor!.stripeCustomerId,
              payment_method_types: ["card"],
              mode: "subscription",
              line_items:[{
                  price:priceId,
                  quantity:1,
              }],
              success_url: "https://smebud.onrender.com",
              cancel_url: "https://smebud.onrender.com" })
          return session.url as string;
      }catch(error){
          throw new InternalServerError(`Failed to create a checkout session, ${error}`);
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


