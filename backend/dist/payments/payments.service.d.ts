import { DatabaseProxyService } from '../database/database-proxy.service';
export declare class PaymentsService {
    private readonly db;
    constructor(db: DatabaseProxyService);
    processCard(orderId: string, amount: number, cardLast4?: string): Promise<import("../domain").Payment>;
    processDirectTransfer(orderId: string, amount: number, accountReference: string): Promise<import("../domain").Payment>;
    confirmDirectTransfer(paymentId: string, confirmed: boolean): Promise<import("../domain").Payment>;
    listPayments(): Promise<import("../domain").Payment[]>;
    processAccountCredit(orderId: string, amount: number, customerId: string): Promise<import("../domain").Payment>;
    createInstallmentPlan(orderId: string, customerId: string, installmentCount: number): Promise<import("../domain").InstallmentPlan>;
    attachPaymentToInstallmentPlan(planId: string, paymentId: string): Promise<import("../domain").InstallmentPlan>;
    listInstallmentPlans(): Promise<import("../domain").InstallmentPlan[]>;
}
