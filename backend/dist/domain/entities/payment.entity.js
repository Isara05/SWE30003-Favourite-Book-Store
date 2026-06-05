"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentEntity = void 0;
const enums_1 = require("../enums");
class PaymentEntity {
    paymentId;
    orderId;
    amount;
    paymentDate;
    method;
    status;
    message;
    constructor(paymentId, orderId, amount, paymentDate, method, status, message) {
        this.paymentId = paymentId;
        this.orderId = orderId;
        this.amount = amount;
        this.paymentDate = paymentDate;
        this.method = method;
        this.status = status;
        this.message = message;
    }
    static fromRaw(raw) {
        return new PaymentEntity(raw.paymentId, raw.orderId, raw.amount ?? 0, raw.paymentDate ?? new Date().toISOString(), raw.method ?? 'unknown', raw.status ?? enums_1.PaymentStatus.Processed, raw.message ?? '');
    }
    toRaw() {
        return {
            paymentId: this.paymentId,
            orderId: this.orderId,
            amount: this.amount,
            paymentDate: this.paymentDate,
            method: this.method,
            status: this.status,
            message: this.message,
        };
    }
    generateReceipt() {
        return `Receipt: ${this.paymentId} | Order: ${this.orderId} | Amount: ${this.amount} | Date: ${this.paymentDate}`;
    }
}
exports.PaymentEntity = PaymentEntity;
//# sourceMappingURL=payment.entity.js.map