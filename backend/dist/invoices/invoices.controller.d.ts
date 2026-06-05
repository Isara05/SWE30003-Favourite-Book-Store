import { InvoicesService } from './invoices.service';
export declare class InvoicesController {
    private readonly invoicesService;
    constructor(invoicesService: InvoicesService);
    getInvoice(id: string): Promise<import("../domain").Invoice>;
    getInvoiceByOrderId(orderId: string): Promise<import("../domain").Invoice>;
    updateInvoice(): Promise<void>;
    deleteInvoice(): Promise<void>;
}
