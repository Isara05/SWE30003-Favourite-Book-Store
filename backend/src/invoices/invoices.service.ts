import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseProxyService } from '../database/database-proxy.service';
import { Invoice } from '../domain/models';

@Injectable()
export class InvoicesService {
  constructor(private readonly db: DatabaseProxyService) {}

  // Finds the invoice details.
  async getInvoice(invoiceId: string): Promise<Invoice> {
    const invoices = await this.db.getInvoices();
    const invoice = invoices.find((item) => item.invoiceId === invoiceId);
    // Handles the if logic.
    if (!invoice) {
      throw new NotFoundException('Invoice not found.');
    }
    return invoice;
  }

  // Finds the invoice by order id details.
  async getInvoiceByOrderID(orderId: string): Promise<Invoice> {
    const invoices = await this.db.getInvoices();
    const invoice = invoices.find((item) => item.orderId === orderId);
    // Handles the if logic.
    if (!invoice) {
      throw new NotFoundException('Invoice not found.');
    }
    return invoice;
  }

  // Updates the invoice details.
  async updateInvoice(): Promise<never> {
    throw new BadRequestException('Invoices are immutable and cannot be updated.');
  }

  // Deletes the selected invoice record.
  async deleteInvoice(): Promise<never> {
    throw new BadRequestException('Invoices are immutable and cannot be deleted.');
  }
}
