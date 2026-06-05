import { TradeInRecord as ITradeInRecord } from '../models';
export declare class TradeInRecordEntity implements ITradeInRecord {
    tradeInId: string;
    customerId: string;
    bookIsbn: string;
    condition: string;
    creditIssued: number;
    status: 'Pending' | 'Approved' | 'Rejected';
    approverId?: string | undefined;
    approvalDate?: string | undefined;
    notes?: string | undefined;
    recordDate: string;
    constructor(tradeInId: string, customerId: string, bookIsbn: string, condition: string, creditIssued: number, status?: 'Pending' | 'Approved' | 'Rejected', approverId?: string | undefined, approvalDate?: string | undefined, notes?: string | undefined, recordDate?: string);
    static fromRaw(raw: Partial<ITradeInRecord> & {
        tradeInId: string;
        customerId: string;
        bookIsbn: string;
        creditIssued: number;
    }): TradeInRecordEntity;
    toRaw(): ITradeInRecord;
    applyToCustomer(consumer: {
        accountBalance?: number;
    }): void;
}
