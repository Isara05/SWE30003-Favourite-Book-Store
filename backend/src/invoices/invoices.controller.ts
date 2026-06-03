import { BadRequestException, Controller, Delete, Get, Param, Put } from '@nestjs/common';
import { InvoicesService } from './invoices.service';

@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get(':id')
  async getInvoice(@Param('id') id: string) {
    return this.invoicesService.getInvoice(id);
  }

  @Get('order/:orderId')
  async getInvoiceByOrderId(@Param('orderId') orderId: string) {
    return this.invoicesService.getInvoiceByOrderID(orderId);
  }

  @Put(':id')
  // Updates the invoice details.
  async updateInvoice() {
    throw new BadRequestException('Invoices are immutable and cannot be updated.');
  }

  @Delete(':id')
  // Deletes the selected invoice record.
  async deleteInvoice() {
    throw new BadRequestException('Invoices are immutable and cannot be deleted.');
  }
}
