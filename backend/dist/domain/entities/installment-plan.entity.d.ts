import { InstallmentPlan as IInstallmentPlan, Payment as IPayment } from '../models';
export declare class InstallmentPlanEntity implements IInstallmentPlan {
    planId: string;
    orderId: string;
    customerId: string;
    totalAmount: number;
    balanceRemaining: number;
    installmentCount: number;
    payments: IPayment[];
    status: 'Active' | 'Paid' | 'Cancelled';
    createdDate: string;
    lastUpdatedDate: string;
    constructor(planId: string, orderId: string, customerId: string, totalAmount: number, balanceRemaining: number, installmentCount: number, payments?: IPayment[], status?: 'Active' | 'Paid' | 'Cancelled', createdDate?: string, lastUpdatedDate?: string);
    static fromRaw(raw: Partial<IInstallmentPlan> & {
        planId: string;
        orderId: string;
        customerId: string;
        totalAmount: number;
    }): InstallmentPlanEntity;
    toRaw(): IInstallmentPlan;
    attachPayment(payment: IPayment): void;
}
