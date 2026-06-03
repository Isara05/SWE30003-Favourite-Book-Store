import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { AccountRole } from '../domain/enums';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}

  @Get()
  // Loads the all list.
  async listAll() {
    return this.payments.listPayments();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AccountRole.Staff, AccountRole.Manager)
  @Post(':id/confirm')
  async confirm(@Param('id') id: string, @Body() body: { confirmed: boolean }) {
    return this.payments.confirmDirectTransfer(id, body.confirmed);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AccountRole.Staff, AccountRole.Manager)
  @Get('installments')
  // Loads the installment plans list.
  async listInstallmentPlans() {
    return this.payments.listInstallmentPlans();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AccountRole.Staff, AccountRole.Manager)
  @Post('installments')
  async createInstallmentPlan(@Body() body: { orderId: string; customerId: string; installmentCount: number }) {
    return this.payments.createInstallmentPlan(body.orderId, body.customerId, Number(body.installmentCount));
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AccountRole.Staff, AccountRole.Manager)
  @Post('installments/:planId/payments/:paymentId')
  async attachPaymentToInstallmentPlan(@Param('planId') planId: string, @Param('paymentId') paymentId: string) {
    return this.payments.attachPaymentToInstallmentPlan(planId, paymentId);
  }
}
