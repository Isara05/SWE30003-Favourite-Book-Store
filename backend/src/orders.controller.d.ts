import { OrdersService } from './orders.service';
import { OrderStatus } from '../domain/enums';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    createOrder(body: {
        customerId?: string;
        staffId?: string;
        items: {
            isbn: string;
            quantity: number;
        }[];
    }): Promise<import("../domain").Order>;
    getMyOrders(request: {
        user: {
            id: string;
            role: string;
        };
    }): Promise<import("../domain").Order[]>;
    listAllOrders(): Promise<import("../domain").Order[]>;
    getRevenueSummary(): Promise<{
        grossRevenue: number;
        paidOrderCount: number;
        totalItemsSold: number;
        averageOrderValue: number;
    }>;
    getOrder(id: string): Promise<import("../domain").Order>;
    getOrderDetails(id: string): Promise<import("../domain").Order>;
    getCustomerPurchaseHistory(customerId: string): Promise<import("../domain").Order[]>;
    updateOrderStatus(id: string, body: {
        newStatus: OrderStatus;
    }): Promise<import("../domain").Order>;
    addPayment(id: string, body: {
        amount: number;
        method: string;
    }): Promise<{
        orderId: string;
        status: OrderStatus;
        payment: import("../domain").Payment;
        remainingBalance: number;
        invoiceId: string | undefined;
    }>;
    getReceipts(id: string): Promise<string[]>;
}
