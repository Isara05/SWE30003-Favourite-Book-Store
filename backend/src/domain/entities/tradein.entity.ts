import { TradeInRecord as ITradeInRecord } from '../models';

export class TradeInRecordEntity implements ITradeInRecord {
  constructor(
    public tradeInId: string,
    public customerId: string,
    public bookIsbn: string,
    public condition: string,
    public creditIssued: number,
    public status: 'Pending' | 'Approved' | 'Rejected' = 'Pending',
    public approverId?: string,
    public approvalDate?: string,
    public notes?: string,
    public recordDate: string = new Date().toISOString(),
  ) {}

  static fromRaw(raw: Partial<ITradeInRecord> & { tradeInId: string; customerId: string; bookIsbn: string; creditIssued: number }): TradeInRecordEntity {
    return new TradeInRecordEntity(
      raw.tradeInId,
      raw.customerId,
      raw.bookIsbn,
      raw.condition ?? 'Used',
      raw.creditIssued,
      (raw.status as any) ?? 'Pending',
      raw.approverId,
      raw.approvalDate,
      raw.notes,
      raw.recordDate ?? new Date().toISOString(),
    );
  }

  // Converts the entity back into plain stored data.
  toRaw(): ITradeInRecord {
    return {
      tradeInId: this.tradeInId,
      customerId: this.customerId,
      bookIsbn: this.bookIsbn,
      condition: this.condition,
      creditIssued: this.creditIssued,
      status: this.status,
      approverId: this.approverId,
      approvalDate: this.approvalDate,
      notes: this.notes,
      recordDate: this.recordDate,
    };
  }

  // Handles the apply to customer logic.
  applyToCustomer(consumer: { accountBalance?: number }) {
    consumer.accountBalance = (consumer.accountBalance ?? 0) + this.creditIssued;
  }
}
