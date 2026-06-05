import { Payment } from '../models';
import { PaymentStatus } from '../enums';

export abstract class PaymentMethodEntity {
  constructor(public methodId: string, public methodName: string) {}

  abstract toPayment(orderId: string, amount: number, message?: string): Payment;
}

export class CardDetailsEntity extends PaymentMethodEntity {
  constructor(
    public methodId: string,
    public cardholderName: string,
    public last4: string,
    public expiry: string,
  ) {
    super(methodId, 'card');
  }

  // Handles the to payment logic.
  toPayment(orderId: string, amount: number, message = ''): Payment {
    return {
      paymentId: `pm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      orderId,
      amount,
      paymentDate: new Date().toISOString(),
      method: `card:${this.last4}`,
      status: PaymentStatus.Processed,
      message,
    };
  }
}

export class DirectTransferEntity extends PaymentMethodEntity {
  constructor(public methodId: string, public accountReference: string) {
    super(methodId, 'direct_transfer');
  }

  // Handles the to payment logic.
  toPayment(orderId: string, amount: number, message = ''): Payment {
    return {
      paymentId: `pm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      orderId,
      amount,
      paymentDate: new Date().toISOString(),
      method: `direct:${this.accountReference}`,
      status: PaymentStatus.Processed,
      message,
    };
  }
}

export class AccountCreditEntity extends PaymentMethodEntity {
  constructor(public methodId: string, public customerId: string) {
    super(methodId, 'account_credit');
  }

  // Handles the to payment logic.
  toPayment(orderId: string, amount: number, message = ''): Payment {
    return {
      paymentId: `pm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      orderId,
      amount,
      paymentDate: new Date().toISOString(),
      method: `credit:${this.customerId}`,
      status: PaymentStatus.Processed,
      message,
    };
  }
}
