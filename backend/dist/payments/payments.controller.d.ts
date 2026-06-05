import { PaymentsService } from './payments.service';
export declare class PaymentsController {
    private readonly payments;
    constructor(payments: PaymentsService);
    listAll(): Promise<import("../domain").Payment[]>;
    confirm(id: string, body: {
        confirmed: boolean;
    }): Promise<import("../domain").Payment>;
    listInstallmentPlans(): Promise<import("../domain").InstallmentPlan[]>;
    createInstallmentPlan(body: {
        orderId: string;
        customerId: string;
        installmentCount: number;
    }): Promise<import("../domain").InstallmentPlan>;
    attachPaymentToInstallmentPlan(planId: string, paymentId: string): Promise<import("../domain").InstallmentPlan>;
}
