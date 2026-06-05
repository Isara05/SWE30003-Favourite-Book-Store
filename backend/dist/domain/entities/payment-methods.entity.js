"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountCreditEntity = exports.DirectTransferEntity = exports.CardDetailsEntity = exports.PaymentMethodEntity = void 0;
const enums_1 = require("../enums");
class PaymentMethodEntity {
    methodId;
    methodName;
    constructor(methodId, methodName) {
        this.methodId = methodId;
        this.methodName = methodName;
    }
}
exports.PaymentMethodEntity = PaymentMethodEntity;
class CardDetailsEntity extends PaymentMethodEntity {
    methodId;
    cardholderName;
    last4;
    expiry;
    constructor(methodId, cardholderName, last4, expiry) {
        super(methodId, 'card');
        this.methodId = methodId;
        this.cardholderName = cardholderName;
        this.last4 = last4;
        this.expiry = expiry;
    }
    toPayment(orderId, amount, message = '') {
        return {
            paymentId: `pm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            orderId,
            amount,
            paymentDate: new Date().toISOString(),
            method: `card:${this.last4}`,
            status: enums_1.PaymentStatus.Processed,
            message,
        };
    }
}
exports.CardDetailsEntity = CardDetailsEntity;
class DirectTransferEntity extends PaymentMethodEntity {
    methodId;
    accountReference;
    constructor(methodId, accountReference) {
        super(methodId, 'direct_transfer');
        this.methodId = methodId;
        this.accountReference = accountReference;
    }
    toPayment(orderId, amount, message = '') {
        return {
            paymentId: `pm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            orderId,
            amount,
            paymentDate: new Date().toISOString(),
            method: `direct:${this.accountReference}`,
            status: enums_1.PaymentStatus.Processed,
            message,
        };
    }
}
exports.DirectTransferEntity = DirectTransferEntity;
class AccountCreditEntity extends PaymentMethodEntity {
    methodId;
    customerId;
    constructor(methodId, customerId) {
        super(methodId, 'account_credit');
        this.methodId = methodId;
        this.customerId = customerId;
    }
    toPayment(orderId, amount, message = '') {
        return {
            paymentId: `pm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            orderId,
            amount,
            paymentDate: new Date().toISOString(),
            method: `credit:${this.customerId}`,
            status: enums_1.PaymentStatus.Processed,
            message,
        };
    }
}
exports.AccountCreditEntity = AccountCreditEntity;
//# sourceMappingURL=payment-methods.entity.js.map