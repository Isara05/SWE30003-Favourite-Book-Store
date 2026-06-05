import { Invoice as IInvoice } from '../models';

export class InvoiceEntity implements IInvoice {
  constructor(
    public invoiceId: string,
    public orderId: string,
    public issueDate: string,
    public totalAmount: number,
    public immutable: boolean = true,
    public auditComment: string = 'Generated invoice locked for audit compliance.',
  ) {}

  static fromRaw(raw: Partial<IInvoice> & { invoiceId: string; orderId: string; totalAmount: number }): InvoiceEntity {
    return new InvoiceEntity(
      raw.invoiceId,
      raw.orderId,
      raw.issueDate ?? new Date().toISOString(),
      raw.totalAmount,
      raw.immutable ?? true,
      raw.auditComment ?? 'Generated invoice locked for audit compliance.',
    );
  }

  // Converts the entity back into plain stored data.
  toRaw(): IInvoice {
    return {
      invoiceId: this.invoiceId,
      orderId: this.orderId,
      issueDate: this.issueDate,
      totalAmount: this.totalAmount,
      immutable: this.immutable,
      auditComment: this.auditComment,
    };
  }
}
