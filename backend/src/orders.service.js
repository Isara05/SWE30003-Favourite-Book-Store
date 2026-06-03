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
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const database_proxy_service_1 = require("../database/database-proxy.service");
const enums_1 = require("../domain/enums");
const order_entity_1 = require("../domain/entities/order.entity");
const order_line_entity_1 = require("../domain/entities/order-line.entity");
const payment_entity_1 = require("../domain/entities/payment.entity");
const payments_service_1 = require("../payments/payments.service");
const stock_level_conflict_exception_1 = require("../domain/errors/stock-level-conflict.exception");
let OrdersService = class OrdersService {
    db;
    payments;
    constructor(db, payments) {
        this.db = db;
        this.payments = payments;
    }
    async listOrdersForCustomer(customerId) {
        const raw = await this.db.getOrders();
        const entities = raw.map((r) => order_entity_1.OrderEntity.fromRaw(r));
        const filtered = entities.filter((o) => o.customerId === customerId).sort((l, r) => r.date.localeCompare(l.date));
        return filtered.map((o) => o.toRaw());
    }
    async listAllOrders() {
        const raw = await this.db.getOrders();
        return raw.map((r) => order_entity_1.OrderEntity.fromRaw(r).toRaw()).sort((left, right) => right.date.localeCompare(left.date));
    }
    async getRevenueSummary() {
        const raw = await this.db.getOrders();
        const orders = raw.map((entry) => order_entity_1.OrderEntity.fromRaw(entry));
        const paidOrders = orders.filter((order) => order.status === enums_1.OrderStatus.Paid);
        const grossRevenue = paidOrders.reduce((sum, order) => sum + (order.totalAmount ?? 0), 0);
        const totalItemsSold = paidOrders.reduce((sum, order) => sum + (order.lines || []).reduce((lineSum, line) => lineSum + (line.quantity || 0), 0), 0);
        const paidOrderCount = paidOrders.length;
        const averageOrderValue = paidOrderCount > 0 ? grossRevenue / paidOrderCount : 0;
        return {
            grossRevenue: Math.round(grossRevenue * 100) / 100,
            paidOrderCount,
            totalItemsSold,
            averageOrderValue: Math.round(averageOrderValue * 100) / 100,
        };
    }
    async getCustomerPurchaseHistory(customerId) {
        return this.listOrdersForCustomer(customerId);
    }
    async getOrderDetails(orderId) {
        return this.getOrder(orderId);
    }
    async createOrder(input) {
        if (!input.items?.length) {
            throw new common_1.BadRequestException('Customer and order items are required.');
        }
        let customerId = input.customerId?.trim();
        if (!customerId) {
            const guestCustomer = await this.db.insertCustomer({
                customerId: this.db.generateId('CUS'),
                name: 'Guest Checkout',
                address: 'Guest address',
                email: `guest-${Date.now()}@local`,
                phoneNumber: 'N/A',
                accountBalance: 0,
            });
            customerId = guestCustomer.customerId;
        }
        else {
            const customers = await this.db.getCustomers();
            const customer = customers.find((item) => item.customerId === customerId);
            if (!customer) {
                throw new common_1.NotFoundException('Customer not found.');
            }
        }
        const itemMap = new Map();
        input.items.forEach((item) => {
            if (item.quantity <= 0) {
                throw new common_1.BadRequestException('Quantity must be greater than zero.');
            }
            const current = itemMap.get(item.isbn) ?? 0;
            itemMap.set(item.isbn, current + item.quantity);
        });
        const isbns = Array.from(itemMap.keys());
        const lockKeys = isbns.map((i) => `book:${i}`);
        return this.db.withLocks(lockKeys, async () => {
            const books = await this.db.getBooks();
            const lines = Array.from(itemMap.entries()).map(([isbn, quantity]) => {
                const book = books.find((entry) => entry.isbn === isbn);
                if (!book) {
                    throw new common_1.NotFoundException(`Book ${isbn} not found.`);
                }
                if (book.stockLevel < quantity) {
                    throw new stock_level_conflict_exception_1.StockLevelConflictException(book.isbn, quantity, book.stockLevel);
                }
                return {
                    isbn: book.isbn,
                    quantity,
                    priceAtSale: book.price,
                    lineTotal: book.price * quantity,
                };
            });
            lines.forEach((line) => {
                const book = books.find((entry) => entry.isbn === line.isbn);
                if (book) {
                    book.stockLevel -= line.quantity;
                }
            });
            const lineEntities = lines.map((l) => order_line_entity_1.OrderLineEntity.fromRaw(l));
            const orderEntity = new order_entity_1.OrderEntity(this.db.generateId('ORD'), new Date().toISOString(), enums_1.OrderStatus.Created, customerId, input.staffId, lineEntities, [], undefined, 0);
            orderEntity.recalculateTotal();
            const orders = await this.db.getOrders();
            orders.push(orderEntity.toRaw());
            await this.db.saveOrders(orders);
            await this.db.saveBooks(books);
            return orderEntity.toRaw();
        });
    }
    async getOrder(orderId) {
        const orders = await this.db.getOrders();
        const raw = orders.find((item) => item.orderId === orderId);
        if (!raw)
            throw new common_1.NotFoundException('Order not found.');
        const entity = order_entity_1.OrderEntity.fromRaw(raw);
        return entity.toRaw();
    }
    async updateOrderStatus(orderId, newStatus) {
        return this.db.withLocks([`order:${orderId}`], async () => {
            const orders = await this.db.getOrders();
            const idx = orders.findIndex((item) => item.orderId === orderId);
            if (idx === -1) {
                throw new common_1.NotFoundException('Order not found.');
            }
            const orderEntity = order_entity_1.OrderEntity.fromRaw(orders[idx]);
            if (orderEntity.status === newStatus) {
                return orderEntity.toRaw();
            }
            const allowedStatuses = [enums_1.OrderStatus.Created, enums_1.OrderStatus.Paid, enums_1.OrderStatus.Shipped, enums_1.OrderStatus.Cancelled];
            if (!allowedStatuses.includes(newStatus)) {
                throw new common_1.BadRequestException('Invalid order status.');
            }
            if (newStatus === enums_1.OrderStatus.Cancelled && orderEntity.balanceRemaining() === 0) {
                throw new common_1.BadRequestException('Refund flow required before cancelling a paid order.');
            }
            orderEntity.status = newStatus;
            orders[idx] = orderEntity.toRaw();
            await this.db.saveOrders(orders);
            return orderEntity.toRaw();
        });
    }
    async addPayment(orderId, input) {
        if (!input.amount || input.amount <= 0) {
            throw new common_1.BadRequestException('Payment amount must be greater than zero.');
        }
        const orders = await this.db.getOrders();
        const raw = orders.find((item) => item.orderId === orderId);
        if (!raw)
            throw new common_1.NotFoundException('Order not found.');
        const orderEntity = order_entity_1.OrderEntity.fromRaw(raw);
        const remaining = orderEntity.balanceRemaining();
        if (input.amount > remaining) {
            throw new common_1.BadRequestException('Payment exceeds remaining balance.');
        }
        let paymentResult;
        const method = input.method ?? 'CardDetails';
        if (method === 'CardDetails') {
            const cardLast4 = '4242';
            paymentResult = await this.payments.processCard(orderEntity.orderId, input.amount, cardLast4);
        }
        else if (method === 'DirectTransfer') {
            paymentResult = await this.payments.processDirectTransfer(orderEntity.orderId, input.amount, 'acct-unknown');
        }
        else if (method === 'AccountCredit') {
            paymentResult = await this.payments.processAccountCredit(orderEntity.orderId, input.amount, orderEntity.customerId);
        }
        else {
            paymentResult = await this.payments.processCard(orderEntity.orderId, input.amount);
        }
        const paymentsList = await this.db.getPayments();
        if (paymentResult.status === enums_1.PaymentStatus.Processed) {
            orderEntity.payments.push(paymentResult);
            paymentsList.push(paymentResult);
            await this.db.savePayments(paymentsList);
        }
        else {
        }
        if (orderEntity.balanceRemaining() === 0) {
            orderEntity.status = enums_1.OrderStatus.Paid;
            if (!orderEntity.invoiceId) {
                const invoice = {
                    invoiceId: this.db.generateId('INV'),
                    orderId: orderEntity.orderId,
                    issueDate: new Date().toISOString(),
                    totalAmount: orderEntity.totalAmount,
                    immutable: true,
                    auditComment: 'Generated from a paid order and locked for compliance review.',
                };
                orderEntity.invoiceId = invoice.invoiceId;
                await this.db.insertInvoice(invoice, orderEntity.orderId);
            }
        }
        const updated = orders.map((o) => (o.orderId === orderEntity.orderId ? orderEntity.toRaw() : o));
        await this.db.saveOrders(updated);
        return {
            orderId: orderEntity.orderId,
            status: orderEntity.status,
            payment: paymentResult,
            remainingBalance: Math.max(orderEntity.totalAmount - orderEntity.payments.reduce((s, p) => s + (p.amount || 0), 0), 0),
            invoiceId: orderEntity.invoiceId,
        };
    }
    async getReceipts(orderId) {
        const orders = await this.db.getOrders();
        const raw = orders.find((item) => item.orderId === orderId);
        if (!raw)
            throw new common_1.NotFoundException('Order not found.');
        const orderEntity = order_entity_1.OrderEntity.fromRaw(raw);
        const receipts = (orderEntity.payments || []).map((p) => {
            try {
                const pe = payment_entity_1.PaymentEntity.fromRaw(p);
                return pe.generateReceipt();
            }
            catch (e) {
                return `Payment ${p.paymentId || 'unknown'} - $${p.amount}`;
            }
        });
        return receipts;
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_proxy_service_1.DatabaseProxyService, payments_service_1.PaymentsService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map