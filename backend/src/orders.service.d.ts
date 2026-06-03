import { DatabaseProxyService } from '../database/database-proxy.service';
import { Order as IOrder, Payment as IPayment } from '../domain/models';
import { OrderStatus } from '../domain/enums';
import { PaymentsService } from '../payments/payments.service';
interface OrderItemInput {
    isbn: string;
    quantity: number;
}
interface CreateOrderInput {
    customerId?: string;
    staffId?: string;
    items: OrderItemInput[];
}
interface PaymentInput {
    amount: number;
    method: string;
}
type OrderStatusInput = OrderStatus.Created | OrderStatus.Paid | OrderStatus.Shipped | OrderStatus.Cancelled;
type RevenueSummary = {
    grossRevenue: number;
    paidOrderCount: number;
    totalItemsSold: number;
    averageOrderValue: number;
};
export declare class OrdersService {
    private readonly db;
    private readonly payments;
    constructor(db: DatabaseProxyService, payments: PaymentsService);
    listOrdersForCustomer(customerId: string): Promise<IOrder[]>;
    listAllOrders(): Promise<IOrder[]>;
    getRevenueSummary(): Promise<RevenueSummary>;
    getCustomerPurchaseHistory(customerId: string): Promise<IOrder[]>;
    getOrderDetails(orderId: string): Promise<IOrder>;
    createOrder(input: CreateOrderInput): Promise<IOrder>;
    getOrder(orderId: string): Promise<IOrder>;
    updateOrderStatus(orderId: string, newStatus: OrderStatusInput): Promise<IOrder>;
    addPayment(orderId: string, input: PaymentInput): Promise<{
        orderId: string;
        status: OrderStatus;
        payment: IPayment;
        remainingBalance: number;
        invoiceId: string | undefined;
    }>;
    getReceipts(orderId: string): Promise<string[]>;
}
export {};
