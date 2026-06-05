"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstallmentPlanEntity = void 0;
class InstallmentPlanEntity {
    planId;
    orderId;
    customerId;
    totalAmount;
    balanceRemaining;
    installmentCount;
    payments;
    status;
    createdDate;
    lastUpdatedDate;
    constructor(planId, orderId, customerId, totalAmount, balanceRemaining, installmentCount, payments = [], status = 'Active', createdDate = new Date().toISOString(), lastUpdatedDate = new Date().toISOString()) {
        this.planId = planId;
        this.orderId = orderId;
        this.customerId = customerId;
        this.totalAmount = totalAmount;
        this.balanceRemaining = balanceRemaining;
        this.installmentCount = installmentCount;
        this.payments = payments;
        this.status = status;
        this.createdDate = createdDate;
        this.lastUpdatedDate = lastUpdatedDate;
    }
    static fromRaw(raw) {
        return new InstallmentPlanEntity(raw.planId, raw.orderId, raw.customerId, raw.totalAmount, raw.balanceRemaining ?? raw.totalAmount, raw.installmentCount ?? 1, raw.payments ?? [], raw.status ?? 'Active', raw.createdDate ?? new Date().toISOString(), raw.lastUpdatedDate ?? new Date().toISOString());
    }
    toRaw() {
        return {
            planId: this.planId,
            orderId: this.orderId,
            customerId: this.customerId,
            totalAmount: this.totalAmount,
            balanceRemaining: this.balanceRemaining,
            installmentCount: this.installmentCount,
            payments: this.payments,
            status: this.status,
            createdDate: this.createdDate,
            lastUpdatedDate: this.lastUpdatedDate,
        };
    }
    attachPayment(payment) {
        this.payments.push(payment);
        this.balanceRemaining = Math.max(0, Math.round((this.balanceRemaining - payment.amount) * 100) / 100);
        this.status = this.balanceRemaining === 0 ? 'Paid' : 'Active';
        this.lastUpdatedDate = new Date().toISOString();
    }
}
exports.InstallmentPlanEntity = InstallmentPlanEntity;
//# sourceMappingURL=installment-plan.entity.js.map