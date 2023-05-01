import ListingRepository from "../lisiting/lisiting.repository";
import StripeService from "./payment.repository"
import { Response, Request } from "express";
import {Stripe} from "stripe";
import { PaymentStatus } from "@prisma/client";

export default class PaymentController {
    // handle event after checkout
    // 3 events to handle:
    // 1. Checkout completed - change the status of the listing to pending
    // 2. Checkout payment succeded - change the status of the listing to paid
    // 3. Checkout payment failed - change the status of the listing to failed
    // Todo: Also don't forget to only display listings that the payment have suceeded except 
    // the user is for the user and in this case I have to add the status of the listing as rejected
    // so basically i need a status field for listing table that goes inline with the payment status
    static stripeService = new StripeService();
    static listingRepository = new ListingRepository();
    static eventHandler = async(req:Request, res:Response)=>{
        let payload = req.body as Buffer;
        const signature = req.headers['stripe-signature'] as string;
        const event = this.stripeService.getEvent(payload, signature)
        const session = event.data.object as Stripe.Checkout.Session;
        const listingId = await this.stripeService.retrieveIdFromSession(session.id) as string;
        switch(event.type){
            case ("checkout.session.completed"):
                await this.listingRepository.updateListingPaymentStatus(listingId, PaymentStatus.PENDING)
                break;
            case("checkout.session.async_payment_succeeded"):
                await this.listingRepository.updateListingPaymentStatus(listingId, PaymentStatus.PAID)
                break;
            case("checkout.session.async_payment_failed"):
                await this.listingRepository.updateListingPaymentStatus(listingId, PaymentStatus.FAILED)
                break;
            case("checkout.session.expired"):
                await this.listingRepository.updateListingPaymentStatus(listingId, PaymentStatus.NOT_PAID)
                break;
            }
        return res.status(200);
    }
}