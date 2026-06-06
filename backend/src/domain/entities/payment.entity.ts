import { Payment as IPayment } from '../models';
import { PaymentStatus } from '../enums';

export class PaymentEntity implements IPayment {
  constructor(
    public paymentId: string,
    public orderId: string,
    public amount: number,
    public paymentDate: string,
    public method: string,
    public status: PaymentStatus,
    public message: string,
  ) {}

  static fromRaw(raw: Partial<IPayment> & { paymentId: string; orderId: string }): PaymentEntity {
    return new PaymentEntity(
      raw.paymentId,
      raw.orderId,
      raw.amount ?? 0,
      raw.paymentDate ?? new Date().toISOString(),
      raw.method ?? 'unknown',
      (raw.status as PaymentStatus) ?? PaymentStatus.Processed,
      raw.message ?? '',
    );
  }

  // Converts the entity back into plain stored data.
  toRaw(): IPayment {
    return {
      paymentId: this.paymentId,
      orderId: this.orderId,
      amount: this.amount,
      paymentDate: this.paymentDate,
      method: this.method,
      status: this.status,
      message: this.message,
    };
  }

  // Generates the receipt value.
  generateReceipt(): string {
    return `Receipt: ${this.paymentId} | Order: ${this.orderId} | Amount: ${this.amount} | Date: ${this.paymentDate}`;
  }
}
