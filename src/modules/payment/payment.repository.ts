import Stripe from "stripe";
import { BadRequestError, InternalServerError } from "../../common/error";



export default class StripeService{
    private stripe;
    private secretKey = process.env.STRIPE_SECRETKEY!;
    private signingKey = process.env.STRIPE_SIGNINGKEY!;
    constructor(){
        this.stripe =  new Stripe(this.secretKey,
            {apiVersion: '2022-11-15',  maxNetworkRetries: 3,  timeout: 1000})
    }

    public createCheckOutSession = async(listingId:string, userEmail:string, price:"1500" | "2500" | "3500")=>{
        const priceId = this.assignPriceId(price);
        try{
            const session = await this.stripe.checkout.sessions.create({
                client_reference_id: listingId,
                customer_email: userEmail,
                payment_method_types: ["card"],
                mode: "payment",
                currency:"LKR",
                line_items:[{
                    price:priceId,
                    quantity:1,
                }],
                success_url: "https://smebud.onrender.com",
                cancel_url: "https://smebud.onrender.com" })
            return session;
        }catch(error){
            throw new InternalServerError(`Failed to create a checkout session, ${error}`);
    }}

    public getEvent = (payload:any, signature:string)=>{
        let event;
        try{
            event = this.stripe.webhooks.constructEvent(payload, signature, this.signingKey)
        }catch(err:any){
            console.log({err})
            throw new BadRequestError(`WebHook Error ${err.message}`)
        }
        return event;
    }

    public retrieveIdFromSession = async(sessionId:string)=>{
        const session = await this.stripe.checkout.sessions.retrieve(sessionId);
        return session.client_reference_id;  // actually returns the listing Id
    }

    private assignPriceId = (price:"1500" | "2500" | "3500")=>{
        let priceId:string = "";
        switch(price){
            case("1500"):
                priceId = "price_1MynixB7eY2bXlKvFD9YOUVo";
                break;
            case("2500"):
                priceId = "price_1Myo9lB7eY2bXlKvJjthdo9S";
                break;
            case("3500"):
                priceId = "price_1MyoBkB7eY2bXlKvObndBFBA";
                break;
            default:
                throw new BadRequestError("Invalid Price!")
        }
        return priceId;
        
    }

        
    
}


