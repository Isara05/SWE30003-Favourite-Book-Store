"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoiceEntity = void 0;
class InvoiceEntity {
    invoiceId;
    orderId;
    issueDate;
    totalAmount;
    immutable;
    auditComment;
    constructor(invoiceId, orderId, issueDate, totalAmount, immutable = true, auditComment = 'Generated invoice locked for audit compliance.') {
        this.invoiceId = invoiceId;
        this.orderId = orderId;
        this.issueDate = issueDate;
        this.totalAmount = totalAmount;
        this.immutable = immutable;
        this.auditComment = auditComment;
    }
    static fromRaw(raw) {
        return new InvoiceEntity(raw.invoiceId, raw.orderId, raw.issueDate ?? new Date().toISOString(), raw.totalAmount, raw.immutable ?? true, raw.auditComment ?? 'Generated invoice locked for audit compliance.');
    }
    toRaw() {
        return {
            invoiceId: this.invoiceId,
            orderId: this.orderId,
            issueDate: this.issueDate,
            totalAmount: this.totalAmount,
            immutable: this.immutable,
            auditComment: this.auditComment,
        };
    }
}
exports.InvoiceEntity = InvoiceEntity;
//# sourceMappingURL=invoice.entity.js.map