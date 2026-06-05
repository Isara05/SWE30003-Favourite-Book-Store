"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TradeInRecordEntity = void 0;
class TradeInRecordEntity {
    tradeInId;
    customerId;
    bookIsbn;
    condition;
    creditIssued;
    status;
    approverId;
    approvalDate;
    notes;
    recordDate;
    constructor(tradeInId, customerId, bookIsbn, condition, creditIssued, status = 'Pending', approverId, approvalDate, notes, recordDate = new Date().toISOString()) {
        this.tradeInId = tradeInId;
        this.customerId = customerId;
        this.bookIsbn = bookIsbn;
        this.condition = condition;
        this.creditIssued = creditIssued;
        this.status = status;
        this.approverId = approverId;
        this.approvalDate = approvalDate;
        this.notes = notes;
        this.recordDate = recordDate;
    }
    static fromRaw(raw) {
        return new TradeInRecordEntity(raw.tradeInId, raw.customerId, raw.bookIsbn, raw.condition ?? 'Used', raw.creditIssued, raw.status ?? 'Pending', raw.approverId, raw.approvalDate, raw.notes, raw.recordDate ?? new Date().toISOString());
    }
    toRaw() {
        return {
            tradeInId: this.tradeInId,
            customerId: this.customerId,
            bookIsbn: this.bookIsbn,
            condition: this.condition,
            creditIssued: this.creditIssued,
            status: this.status,
            approverId: this.approverId,
            approvalDate: this.approvalDate,
            notes: this.notes,
            recordDate: this.recordDate,
        };
    }
    applyToCustomer(consumer) {
        consumer.accountBalance = (consumer.accountBalance ?? 0) + this.creditIssued;
    }
}
exports.TradeInRecordEntity = TradeInRecordEntity;
//# sourceMappingURL=tradein.entity.js.map