"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const stripe_1 = __importDefault(require("stripe"));
const error_1 = require("../../common/error");
class StripeService {
    constructor() {
        this.secretKey = process.env.STRIPE_SECRETKEY;
        this.signingKey = process.env.STRIPE_SIGNINGKEY;
        this.createCustomer = (email) => __awaiter(this, void 0, void 0, function* () {
            let customer;
            try {
                customer = yield this.stripe.customers.create({
                    email
                });
            }
            catch (err) {
                throw new Error(`Failed to create subscription: ${err.message}`);
            }
            return customer;
        });
        this.createPaymentMethod = (cardToken) => __awaiter(this, void 0, void 0, function* () {
            try {
                const paymentMethod = yield this.stripe.paymentMethods.create({
                    type: 'card',
                    card: {
                        /*This card token is gotten when the client uses stripe.js to tokenise the
                        card details actually: should have used in the other project lol!*/
                        token: cardToken,
                    },
                });
                return paymentMethod;
            }
            catch (err) {
                throw new Error(`Failed to create payment method: ${err.message}`);
            }
        });
        this.attachPaymentMethodToCustomer = (paymentMethodId, customerId) => __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.stripe.paymentMethods.attach(paymentMethodId, {
                    customer: customerId,
                });
            }
            catch (err) {
                throw new Error(`Failed to attach payment method to customer: ${err.message}`);
            }
        });
        this.createSubscription = (customerId, priceId) => __awaiter(this, void 0, void 0, function* () {
            try {
                const subscription = yield this.stripe.subscriptions.create({
                    customer: customerId,
                    items: [
                        { price: priceId },
                    ],
                });
                return subscription;
            }
            catch (error) {
                throw new Error(`Failed to create subscription: ${error.message}`);
            }
        });
        this.retrieveSubscription = (subscriptionId) => __awaiter(this, void 0, void 0, function* () {
            try {
                const subscription = yield this.stripe.subscriptions.retrieve(subscriptionId);
                return subscription;
            }
            catch (error) {
                throw new Error(`Failed to retrieve subscription: ${error.message}`);
            }
        });
        this.cancelSubscription = (subscriptionId) => __awaiter(this, void 0, void 0, function* () {
            try {
                const canceledSubscription = yield this.stripe.subscriptions.update(subscriptionId, {
                    cancel_at_period_end: true,
                });
                return canceledSubscription;
            }
            catch (error) {
                throw new Error(`Failed to cancel subscription: ${error.message}`);
            }
        });
        this.getEvent = (payload, signature) => {
            let event;
            try {
                event = this.stripe.webhooks.constructEvent(payload, signature, this.signingKey);
            }
            catch (err) {
                console.log({ err });
                throw new error_1.BadRequestError(`WebHook Error ${err.message}`);
            }
            return event;
        };
        this.retrieveIdFromSession = (sessionId) => __awaiter(this, void 0, void 0, function* () {
            const session = yield this.stripe.checkout.sessions.retrieve(sessionId);
            return session.client_reference_id; // actually returns the listing Id
        });
        this.stripe = new stripe_1.default(this.secretKey, { apiVersion: '2022-11-15', maxNetworkRetries: 3, timeout: 1000 });
    }
}
exports.default = StripeService;
