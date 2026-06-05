import { InstallmentPlan as IInstallmentPlan, Payment as IPayment } from '../models';

export class InstallmentPlanEntity implements IInstallmentPlan {
  constructor(
    public planId: string,
    public orderId: string,
    public customerId: string,
    public totalAmount: number,
    public balanceRemaining: number,
    public installmentCount: number,
    public payments: IPayment[] = [],
    public status: 'Active' | 'Paid' | 'Cancelled' = 'Active',
    public createdDate: string = new Date().toISOString(),
    public lastUpdatedDate: string = new Date().toISOString(),
  ) {}

  static fromRaw(raw: Partial<IInstallmentPlan> & { planId: string; orderId: string; customerId: string; totalAmount: number }): InstallmentPlanEntity {
    return new InstallmentPlanEntity(
      raw.planId,
      raw.orderId,
      raw.customerId,
      raw.totalAmount,
      raw.balanceRemaining ?? raw.totalAmount,
      raw.installmentCount ?? 1,
      raw.payments ?? [],
      raw.status ?? 'Active',
      raw.createdDate ?? new Date().toISOString(),
      raw.lastUpdatedDate ?? new Date().toISOString(),
    );
  }

  // Converts the entity back into plain stored data.
  toRaw(): IInstallmentPlan {
    return {
      planId: this.planId,
      orderId: this.orderId,
      customerId: this.customerId,
      totalAmount: this.totalAmount,
      balanceRemaining: this.balanceRemaining,
      installmentCount: this.installmentCount,
      payments: this.payments,
      status: this.status,
      createdDate: this.createdDate,
      lastUpdatedDate: this.lastUpdatedDate,
    };
  }

  // Handles the attach payment logic.
  attachPayment(payment: IPayment): void {
    this.payments.push(payment);
    this.balanceRemaining = Math.max(0, Math.round((this.balanceRemaining - payment.amount) * 100) / 100);
    this.status = this.balanceRemaining === 0 ? 'Paid' : 'Active';
    this.lastUpdatedDate = new Date().toISOString();
  }
}