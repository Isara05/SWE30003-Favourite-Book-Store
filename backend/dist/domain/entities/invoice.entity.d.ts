import { Invoice as IInvoice } from '../models';
export declare class InvoiceEntity implements IInvoice {
    invoiceId: string;
    orderId: string;
    issueDate: string;
    totalAmount: number;
    immutable: boolean;
    auditComment: string;
    constructor(invoiceId: string, orderId: string, issueDate: string, totalAmount: number, immutable?: boolean, auditComment?: string);
    static fromRaw(raw: Partial<IInvoice> & {
        invoiceId: string;
        orderId: string;
        totalAmount: number;
    }): InvoiceEntity;
    toRaw(): IInvoice;
}
