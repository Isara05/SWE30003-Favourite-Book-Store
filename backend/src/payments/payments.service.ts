import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseProxyService } from '../database/database-proxy.service';
import { PaymentStatus } from '../domain/enums';
import { PaymentEntity } from '../domain/entities/payment.entity';
import { InstallmentPlanEntity } from '../domain/entities/installment-plan.entity';

@Injectable()
export class PaymentsService {
  constructor(private readonly db: DatabaseProxyService) {}

  /** Simulated card gateway: immediate processed or random failure */
  async processCard(orderId: string, amount: number, cardLast4 = '0000') {
    // In a real gateway we'd talk to external API
    const payment = PaymentEntity.fromRaw({
      paymentId: this.db.generateId('PAY'),
      orderId,
      amount,
      paymentDate: new Date().toISOString(),
      method: `card:${cardLast4}`,
      status: PaymentStatus.Processed,
      message: 'Card charged (simulated).',
    } as any);
    await this.db.insertPayment(payment.toRaw(), orderId);
    return payment.toRaw();
  }

  /** Direct transfer: create pending payment and return tracking info */
  async processDirectTransfer(orderId: string, amount: number, accountReference: string) {
    const payment = PaymentEntity.fromRaw({
      paymentId: this.db.generateId('PAY'),
      orderId,
      amount,
      paymentDate: new Date().toISOString(),
      method: `direct:${accountReference}`,
      status: PaymentStatus.Pending,
      message: 'Awaiting bank confirmation (simulated).',
    } as any);
    await this.db.insertPayment(payment.toRaw(), orderId);
    return payment.toRaw();
  }

  /** Confirm a pending direct transfer (admin/staff action) */
  async confirmDirectTransfer(paymentId: string, confirmed: boolean) {
    const payments = await this.db.getPayments();
    const idx = payments.findIndex((p) => p.paymentId === paymentId);
    if (idx === -1) throw new NotFoundException('Payment not found.');
    const p = payments[idx];
    if (p.status !== PaymentStatus.Pending) throw new BadRequestException('Payment is not pending.');
    p.status = confirmed ? PaymentStatus.Processed : PaymentStatus.Failed;
    p.message = confirmed ? 'Bank transfer confirmed.' : 'Bank transfer rejected.';
    await this.db.savePayments(payments);

    // If confirmed, also update related order/invoice
    if (confirmed) {
      const orders = await this.db.getOrders();
      const raw = orders.find((o) => o.orderId === p.orderId);
      // Handles the if logic.
      if (raw) {
        const order = raw as any;
        order.payments = order.payments || [];
        order.payments.push(p);
        // recalc status -> if fully paid, create invoice
        const totalPaid = (order.payments || []).reduce((s, x) => s + (x.amount || 0), 0);
        // Handles the if logic.
        if (totalPaid >= order.totalAmount) {
          order.status = 'Paid';
          // Handles the if logic.
          if (!order.invoiceId) {
            const invoice = {
              invoiceId: this.db.generateId('INV'),
              orderId: order.orderId,
              issueDate: new Date().toISOString(),
              totalAmount: order.totalAmount,
              immutable: true,
              auditComment: 'Generated from a confirmed direct transfer and locked for compliance review.',
            };
            await this.db.insertInvoice(invoice, order.orderId);
            order.invoiceId = invoice.invoiceId;
          }
        }
        const updated = orders.map((o) => (o.orderId === order.orderId ? order : o));
        await this.db.saveOrders(updated);
      }
    }

    return p;
  }

  // Loads the payments list.
  async listPayments() {
    return this.db.getPayments();
  }

  /** Account credit: decrement customer's balance atomically */
  async processAccountCredit(orderId: string, amount: number, customerId: string) {
    // Acquire lock on customer to prevent races
    const key = `customer:${customerId}`;
    return this.db.withLocks([key], async () => {
      const customers = await this.db.getCustomers();
      const idx = customers.findIndex((c) => c.customerId === customerId);
      if (idx === -1) throw new NotFoundException('Customer not found.');
      const customer = customers[idx];
      if ((customer.accountBalance ?? 0) < amount) throw new BadRequestException('Insufficient account credit.');
      customer.accountBalance = (customer.accountBalance ?? 0) - amount;
      customers[idx] = customer;
      await this.db.saveCustomers(customers);

      const payment = PaymentEntity.fromRaw({
        paymentId: this.db.generateId('PAY'),
        orderId,
        amount,
        paymentDate: new Date().toISOString(),
        method: `credit:${customerId}`,
        status: PaymentStatus.Processed,
        message: 'Account credit applied.',
      } as any);
      await this.db.insertPayment(payment.toRaw(), orderId);
      return payment.toRaw();
    });
  }

  // Creates a new installment plan record.
  async createInstallmentPlan(orderId: string, customerId: string, installmentCount: number) {
    if (!Number.isInteger(installmentCount) || installmentCount < 2) {
      throw new BadRequestException('Installment count must be at least 2.');
    }

    const orders = await this.db.getOrders();
    const order = orders.find((item) => item.orderId === orderId);
    // Handles the if logic.
    if (!order) {
      throw new NotFoundException('Order not found.');
    }

    const plan = InstallmentPlanEntity.fromRaw({
      planId: this.db.generateId('PLN'),
      orderId,
      customerId,
      totalAmount: order.totalAmount,
      balanceRemaining: order.totalAmount,
      installmentCount,
      payments: [],
      status: 'Active',
      createdDate: new Date().toISOString(),
      lastUpdatedDate: new Date().toISOString(),
    }).toRaw();

    await this.db.insertInstallmentPlan(plan);
    return plan;
  }

  // Handles the attach payment to installment plan logic.
  async attachPaymentToInstallmentPlan(planId: string, paymentId: string) {
    const plans = await this.db.getInstallmentPlans();
    const planIdx = plans.findIndex((item) => item.planId === planId);
    // Handles the if logic.
    if (planIdx === -1) {
      throw new NotFoundException('Installment plan not found.');
    }

    const payments = await this.db.getPayments();
    const payment = payments.find((item) => item.paymentId === paymentId);
    // Handles the if logic.
    if (!payment) {
      throw new NotFoundException('Payment not found.');
    }

    const plan = InstallmentPlanEntity.fromRaw(plans[planIdx] as any);
    // Handles the if logic.
    if (plan.orderId !== payment.orderId) {
      throw new BadRequestException('Payment does not belong to this installment plan order.');
    }

    plan.attachPayment(payment);
    plans[planIdx] = plan.toRaw();
    await this.db.saveInstallmentPlans(plans);
    return plan.toRaw();
  }

  // Loads the installment plans list.
  async listInstallmentPlans() {
    return this.db.getInstallmentPlans();
  }
}
