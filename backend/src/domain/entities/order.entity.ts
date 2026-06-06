import { Order as IOrder, OrderLine as IOrderLine, Payment as IPayment } from '../models';
import { OrderLineEntity } from './order-line.entity';

export class OrderEntity implements IOrder {
  constructor(
    public orderId: string,
    public date: string,
    public status: IOrder['status'],
    public customerId: string,
    public staffId: string | undefined,
    public lines: OrderLineEntity[],
    public payments: IPayment[],
    public invoiceId: string | undefined,
    public totalAmount: number,
  ) {}

  static fromRaw(raw: Partial<IOrder> & { orderId: string; date: string; customerId: string }): OrderEntity {
    const lines = (raw.lines || []).map((l) => OrderLineEntity.fromRaw(l as IOrderLine));
    const total = raw.totalAmount ?? lines.reduce((s, l) => s + l.lineTotal, 0);
    return new OrderEntity(raw.orderId, raw.date, raw.status ?? ("Created" as any), raw.customerId, raw.staffId, lines, raw.payments || [], raw.invoiceId, total);
  }

  // Converts the entity back into plain stored data.
  toRaw(): IOrder {
    return {
      orderId: this.orderId,
      date: this.date,
      status: this.status as any,
      customerId: this.customerId,
      staffId: this.staffId,
      lines: this.lines.map((l) => l.toRaw()),
      payments: this.payments,
      invoiceId: this.invoiceId,
      totalAmount: this.totalAmount,
    };
  }

  // Handles the add line logic.
  addLine(line: OrderLineEntity) {
    this.lines.push(line);
    this.recalculateTotal();
  }

  // Handles the recalculate total logic.
  recalculateTotal(gstRate = 0.1) {
    const subtotal = this.lines.reduce((s, l) => s + l.lineTotal, 0);
    const gst = subtotal * gstRate;
    this.totalAmount = Math.round((subtotal + gst) * 100) / 100;
  }

  // Handles the payments total logic.
  paymentsTotal(): number {
    return (this.payments || []).reduce((s, p) => s + (p.amount || 0), 0);
  }

  // Handles the balance remaining logic.
  balanceRemaining(): number {
    return Math.max(0, this.totalAmount - this.paymentsTotal());
  }
}
