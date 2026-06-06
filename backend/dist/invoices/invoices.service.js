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
exports.InvoicesService = void 0;
const common_1 = require("@nestjs/common");
const database_proxy_service_1 = require("../database/database-proxy.service");
let InvoicesService = class InvoicesService {
    db;
    constructor(db) {
        this.db = db;
    }
    async getInvoice(invoiceId) {
        const invoices = await this.db.getInvoices();
        const invoice = invoices.find((item) => item.invoiceId === invoiceId);
        if (!invoice) {
            throw new common_1.NotFoundException('Invoice not found.');
        }
        return invoice;
    }
    async getInvoiceByOrderID(orderId) {
        const invoices = await this.db.getInvoices();
        const invoice = invoices.find((item) => item.orderId === orderId);
        if (!invoice) {
            throw new common_1.NotFoundException('Invoice not found.');
        }
        return invoice;
    }
    async updateInvoice() {
        throw new common_1.BadRequestException('Invoices are immutable and cannot be updated.');
    }
    async deleteInvoice() {
        throw new common_1.BadRequestException('Invoices are immutable and cannot be deleted.');
    }
};
exports.InvoicesService = InvoicesService;
exports.InvoicesService = InvoicesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_proxy_service_1.DatabaseProxyService])
], InvoicesService);
//# sourceMappingURL=invoices.service.js.map