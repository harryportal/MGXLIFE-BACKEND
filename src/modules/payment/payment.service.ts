import PaymentRepository from "./payment.repository";

export default class PaymentService {
    private paymentRepository;

    constructor(){
        this.paymentRepository = new PaymentRepository();
    }

    public addSubscription = async()=>{
        /*
        1. Create a stripe customer object with the distributor email address 
        2. Create 
        */
    }

}