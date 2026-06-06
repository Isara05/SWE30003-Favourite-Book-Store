"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderEntity = void 0;
const order_line_entity_1 = require("./order-line.entity");
class OrderEntity {
    orderId;
    date;
    status;
    customerId;
    staffId;
    lines;
    payments;
    invoiceId;
    totalAmount;
    constructor(orderId, date, status, customerId, staffId, lines, payments, invoiceId, totalAmount) {
        this.orderId = orderId;
        this.date = date;
        this.status = status;
        this.customerId = customerId;
        this.staffId = staffId;
        this.lines = lines;
        this.payments = payments;
        this.invoiceId = invoiceId;
        this.totalAmount = totalAmount;
    }
    static fromRaw(raw) {
        const lines = (raw.lines || []).map((l) => order_line_entity_1.OrderLineEntity.fromRaw(l));
        const total = raw.totalAmount ?? lines.reduce((s, l) => s + l.lineTotal, 0);
        return new OrderEntity(raw.orderId, raw.date, raw.status ?? "Created", raw.customerId, raw.staffId, lines, raw.payments || [], raw.invoiceId, total);
    }
    toRaw() {
        return {
            orderId: this.orderId,
            date: this.date,
            status: this.status,
            customerId: this.customerId,
            staffId: this.staffId,
            lines: this.lines.map((l) => l.toRaw()),
            payments: this.payments,
            invoiceId: this.invoiceId,
            totalAmount: this.totalAmount,
        };
    }
    addLine(line) {
        this.lines.push(line);
        this.recalculateTotal();
    }
    recalculateTotal(gstRate = 0.1) {
        const subtotal = this.lines.reduce((s, l) => s + l.lineTotal, 0);
        const gst = subtotal * gstRate;
        this.totalAmount = Math.round((subtotal + gst) * 100) / 100;
    }
    paymentsTotal() {
        return (this.payments || []).reduce((s, p) => s + (p.amount || 0), 0);
    }
    balanceRemaining() {
        return Math.max(0, this.totalAmount - this.paymentsTotal());
    }
}
exports.OrderEntity = OrderEntity;
//# sourceMappingURL=order.entity.js.map