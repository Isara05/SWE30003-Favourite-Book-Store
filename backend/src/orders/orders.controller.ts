import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { OrderStatus } from '../domain/enums';
import { AccountRole } from '../domain/enums';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async createOrder(
    @Body() body: { customerId?: string; staffId?: string; items: { isbn: string; quantity: number }[] },
  ) {
    return this.ordersService.createOrder(body);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMyOrders(@Req() request: { user: { id: string; role: string } }) {
    return this.ordersService.listOrdersForCustomer(request.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AccountRole.Staff, AccountRole.Manager)
  @Get()
  // Loads the all orders list.
  async listAllOrders() {
    return this.ordersService.listAllOrders();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AccountRole.Manager)
  @Get('revenue/summary')
  // Finds the revenue summary details.
  async getRevenueSummary() {
    return this.ordersService.getRevenueSummary();
  }

  @Get(':id')
  async getOrder(@Param('id') id: string) {
    return this.ordersService.getOrder(id);
  }

  @Get(':id/details')
  async getOrderDetails(@Param('id') id: string) {
    return this.ordersService.getOrderDetails(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('customer/:customerId/history')
  async getCustomerPurchaseHistory(@Param('customerId') customerId: string) {
    return this.ordersService.getCustomerPurchaseHistory(customerId);
  }

  @Patch(':id/status')
  async updateOrderStatus(@Param('id') id: string, @Body() body: { newStatus: OrderStatus }) {
    return this.ordersService.updateOrderStatus(id, body.newStatus);
  }

  @Post(':id/payments')
  async addPayment(@Param('id') id: string, @Body() body: { amount: number; method: string }) {
    return this.ordersService.addPayment(id, body);
  }

  @Get(':id/receipts')
  async getReceipts(@Param('id') id: string) {
    return this.ordersService.getReceipts(id);
  }
}
