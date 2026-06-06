import { Payment as IPayment } from '../models';
import { PaymentStatus } from '../enums';
export declare class PaymentEntity implements IPayment {
    paymentId: string;
    orderId: string;
    amount: number;
    paymentDate: string;
    method: string;
    status: PaymentStatus;
    message: string;
    constructor(paymentId: string, orderId: string, amount: number, paymentDate: string, method: string, status: PaymentStatus, message: string);
    static fromRaw(raw: Partial<IPayment> & {
        paymentId: string;
        orderId: string;
    }): PaymentEntity;
    toRaw(): IPayment;
    generateReceipt(): string;
}
