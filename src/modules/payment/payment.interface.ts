import Stripe from 'stripe';

export interface IPaymentCard {
    firstName: string,
    lastName: string,
    cardNo: string,
    cvv: number
    expDate: string
}


export interface IPaymentService {
  createPortalSession(email: string): Promise<Stripe.BillingPortal.Session>;
  createCheckOutSession(email: string): Promise<string>;
  createConnectedAccount(distibutorEmail:string):Promise<string>;
  createCustomer(email: string): Promise<string>;
  retrieveSubscription(subscriptionId: string): Promise<Stripe.Subscription>;
  handleSubscriptionEvents(payload: any, signature: string): Promise<void>;
  handleAccountEvent(payload: any, signature: string): Promise<void>
  retrieveIdFromSession(sessionId: string): Promise<string | null>;
  getAccountOnboardingLink(customerEmail:string):Promise<string>;
  payOutCustomer(accountId:string, amount:number):Promise<Stripe.Transfer>;
  getConnectedAccountLoginLink(accountId:string):Promise<Stripe.Response<Stripe.LoginLink>>
}

export const PTypes = {
    IPaymentService:Symbol("IPaymentService")
};
