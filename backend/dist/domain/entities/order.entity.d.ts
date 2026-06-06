import { Order as IOrder, Payment as IPayment } from '../models';
import { OrderLineEntity } from './order-line.entity';
export declare class OrderEntity implements IOrder {
    orderId: string;
    date: string;
    status: IOrder['status'];
    customerId: string;
    staffId: string | undefined;
    lines: OrderLineEntity[];
    payments: IPayment[];
    invoiceId: string | undefined;
    totalAmount: number;
    constructor(orderId: string, date: string, status: IOrder['status'], customerId: string, staffId: string | undefined, lines: OrderLineEntity[], payments: IPayment[], invoiceId: string | undefined, totalAmount: number);
    static fromRaw(raw: Partial<IOrder> & {
        orderId: string;
        date: string;
        customerId: string;
    }): OrderEntity;
    toRaw(): IOrder;
    addLine(line: OrderLineEntity): void;
    recalculateTotal(gstRate?: number): void;
    paymentsTotal(): number;
    balanceRemaining(): number;
}
