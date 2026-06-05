import { DatabaseProxyService } from '../database/database-proxy.service';
import { Invoice } from '../domain/models';
export declare class InvoicesService {
    private readonly db;
    constructor(db: DatabaseProxyService);
    getInvoice(invoiceId: string): Promise<Invoice>;
    getInvoiceByOrderID(orderId: string): Promise<Invoice>;
    updateInvoice(): Promise<never>;
    deleteInvoice(): Promise<never>;
}
