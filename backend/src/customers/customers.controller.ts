import { Body, Controller, Delete, Get, Param, Patch, Post, Put, UseGuards } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { AccountRole } from '../domain/enums';

@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  // Loads the customers list.
  async listCustomers() {
    return this.customersService.listCustomers();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AccountRole.Staff, AccountRole.Manager)
  @Get('outstanding')
  // Handles the outstanding balances logic.
  async outstandingBalances() {
    return this.customersService.getCustomersWithOutstandingBalances();
  }

  @Get(':id')
  async getCustomer(@Param('id') id: string) {
    return this.customersService.getCustomer(id);
  }

  @Post()
  async createCustomer(
    @Body() body: { name: string; address: string; email: string; phoneNumber: string },
  ) {
    return this.customersService.createCustomer(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AccountRole.Staff, AccountRole.Manager)
  @Put(':id')
  async updateCustomer(@Param('id') id: string, @Body() body: { name?: string; address?: string; email?: string; phoneNumber?: string }) {
    return this.customersService.updateCustomerDetails(id, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AccountRole.Staff, AccountRole.Manager)
  @Patch(':id/balance')
  async updateBalance(@Param('id') id: string, @Body() body: { newBalance: number }) {
    return this.customersService.updateCustomerBalance(id, Number(body.newBalance));
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AccountRole.Staff, AccountRole.Manager)
  @Delete(':id')
  async deleteCustomer(@Param('id') id: string) {
    return this.customersService.deleteCustomer(id);
  }

  @Post(':id/tradein')
  async tradeIn(@Param('id') id: string, @Body() body: { isbn: string; condition: 'Good' | 'Fair' | 'Poor' }) {
    return this.customersService.processTradeIn(id, body.isbn, body.condition);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/tradeins')
  async tradeInHistory(@Param('id') id: string) {
    return this.customersService.getTradeInHistoryByCustomer(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AccountRole.Staff, AccountRole.Manager)
  @Get('tradeins/pending')
  // Loads the pending trade ins list.
  async listPendingTradeIns() {
    return this.customersService.listPendingTradeIns();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AccountRole.Staff, AccountRole.Manager)
  @Post('tradeins/:id/approve')
  async approveTradeIn(
    @Param('id') id: string,
    @Body() body: { approverId: string; approve: boolean; notes?: string },
  ) {
    return this.customersService.approveTradeIn(id, body.approverId, body.approve, body.notes);
  }
}
