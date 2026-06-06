import { Payment } from '../models';
export declare abstract class PaymentMethodEntity {
    methodId: string;
    methodName: string;
    constructor(methodId: string, methodName: string);
    abstract toPayment(orderId: string, amount: number, message?: string): Payment;
}
export declare class CardDetailsEntity extends PaymentMethodEntity {
    methodId: string;
    cardholderName: string;
    last4: string;
    expiry: string;
    constructor(methodId: string, cardholderName: string, last4: string, expiry: string);
    toPayment(orderId: string, amount: number, message?: string): Payment;
}
export declare class DirectTransferEntity extends PaymentMethodEntity {
    methodId: string;
    accountReference: string;
    constructor(methodId: string, accountReference: string);
    toPayment(orderId: string, amount: number, message?: string): Payment;
}
export declare class AccountCreditEntity extends PaymentMethodEntity {
    methodId: string;
    customerId: string;
    constructor(methodId: string, customerId: string);
    toPayment(orderId: string, amount: number, message?: string): Payment;
}
