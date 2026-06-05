"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const database_proxy_service_1 = require("../database/database-proxy.service");
const enums_1 = require("../domain/enums");
const payment_entity_1 = require("../domain/entities/payment.entity");
const installment_plan_entity_1 = require("../domain/entities/installment-plan.entity");
let PaymentsService = class PaymentsService {
    db;
    constructor(db) {
        this.db = db;
    }
    async processCard(orderId, amount, cardLast4 = '0000') {
        const payment = payment_entity_1.PaymentEntity.fromRaw({
            paymentId: this.db.generateId('PAY'),
            orderId,
            amount,
            paymentDate: new Date().toISOString(),
            method: `card:${cardLast4}`,
            status: enums_1.PaymentStatus.Processed,
            message: 'Card charged (simulated).',
        });
        await this.db.insertPayment(payment.toRaw(), orderId);
        return payment.toRaw();
    }
    async processDirectTransfer(orderId, amount, accountReference) {
        const payment = payment_entity_1.PaymentEntity.fromRaw({
            paymentId: this.db.generateId('PAY'),
            orderId,
            amount,
            paymentDate: new Date().toISOString(),
            method: `direct:${accountReference}`,
            status: enums_1.PaymentStatus.Pending,
            message: 'Awaiting bank confirmation (simulated).',
        });
        await this.db.insertPayment(payment.toRaw(), orderId);
        return payment.toRaw();
    }
    async confirmDirectTransfer(paymentId, confirmed) {
        const payments = await this.db.getPayments();
        const idx = payments.findIndex((p) => p.paymentId === paymentId);
        if (idx === -1)
            throw new common_1.NotFoundException('Payment not found.');
        const p = payments[idx];
        if (p.status !== enums_1.PaymentStatus.Pending)
            throw new common_1.BadRequestException('Payment is not pending.');
        p.status = confirmed ? enums_1.PaymentStatus.Processed : enums_1.PaymentStatus.Failed;
        p.message = confirmed ? 'Bank transfer confirmed.' : 'Bank transfer rejected.';
        await this.db.savePayments(payments);
        if (confirmed) {
            const orders = await this.db.getOrders();
            const raw = orders.find((o) => o.orderId === p.orderId);
            if (raw) {
                const order = raw;
                order.payments = order.payments || [];
                order.payments.push(p);
                const totalPaid = (order.payments || []).reduce((s, x) => s + (x.amount || 0), 0);
                if (totalPaid >= order.totalAmount) {
                    order.status = 'Paid';
                    if (!order.invoiceId) {
                        const invoice = {
                            invoiceId: this.db.generateId('INV'),
                            orderId: order.orderId,
                            issueDate: new Date().toISOString(),
                            totalAmount: order.totalAmount,
                            immutable: true,
                            auditComment: 'Generated from a confirmed direct transfer and locked for compliance review.',
                        };
                        await this.db.insertInvoice(invoice, order.orderId);
                        order.invoiceId = invoice.invoiceId;
                    }
                }
                const updated = orders.map((o) => (o.orderId === order.orderId ? order : o));
                await this.db.saveOrders(updated);
            }
        }
        return p;
    }
    async listPayments() {
        return this.db.getPayments();
    }
    async processAccountCredit(orderId, amount, customerId) {
        const key = `customer:${customerId}`;
        return this.db.withLocks([key], async () => {
            const customers = await this.db.getCustomers();
            const idx = customers.findIndex((c) => c.customerId === customerId);
            if (idx === -1)
                throw new common_1.NotFoundException('Customer not found.');
            const customer = customers[idx];
            if ((customer.accountBalance ?? 0) < amount)
                throw new common_1.BadRequestException('Insufficient account credit.');
            customer.accountBalance = (customer.accountBalance ?? 0) - amount;
            customers[idx] = customer;
            await this.db.saveCustomers(customers);
            const payment = payment_entity_1.PaymentEntity.fromRaw({
                paymentId: this.db.generateId('PAY'),
                orderId,
                amount,
                paymentDate: new Date().toISOString(),
                method: `credit:${customerId}`,
                status: enums_1.PaymentStatus.Processed,
                message: 'Account credit applied.',
            });
            await this.db.insertPayment(payment.toRaw(), orderId);
            return payment.toRaw();
        });
    }
    async createInstallmentPlan(orderId, customerId, installmentCount) {
        if (!Number.isInteger(installmentCount) || installmentCount < 2) {
            throw new common_1.BadRequestException('Installment count must be at least 2.');
        }
        const orders = await this.db.getOrders();
        const order = orders.find((item) => item.orderId === orderId);
        if (!order) {
            throw new common_1.NotFoundException('Order not found.');
        }
        const plan = installment_plan_entity_1.InstallmentPlanEntity.fromRaw({
            planId: this.db.generateId('PLN'),
            orderId,
            customerId,
            totalAmount: order.totalAmount,
            balanceRemaining: order.totalAmount,
            installmentCount,
            payments: [],
            status: 'Active',
            createdDate: new Date().toISOString(),
            lastUpdatedDate: new Date().toISOString(),
        }).toRaw();
        await this.db.insertInstallmentPlan(plan);
        return plan;
    }
    async attachPaymentToInstallmentPlan(planId, paymentId) {
        const plans = await this.db.getInstallmentPlans();
        const planIdx = plans.findIndex((item) => item.planId === planId);
        if (planIdx === -1) {
            throw new common_1.NotFoundException('Installment plan not found.');
        }
        const payments = await this.db.getPayments();
        const payment = payments.find((item) => item.paymentId === paymentId);
        if (!payment) {
            throw new common_1.NotFoundException('Payment not found.');
        }
        const plan = installment_plan_entity_1.InstallmentPlanEntity.fromRaw(plans[planIdx]);
        if (plan.orderId !== payment.orderId) {
            throw new common_1.BadRequestException('Payment does not belong to this installment plan order.');
        }
        plan.attachPayment(payment);
        plans[planIdx] = plan.toRaw();
        await this.db.saveInstallmentPlans(plans);
        return plan.toRaw();
    }
    async listInstallmentPlans() {
        return this.db.getInstallmentPlans();
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_proxy_service_1.DatabaseProxyService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map