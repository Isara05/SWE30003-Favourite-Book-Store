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
exports.CustomersService = void 0;
const common_1 = require("@nestjs/common");
const database_proxy_service_1 = require("../database/database-proxy.service");
const tradein_entity_1 = require("../domain/entities/tradein.entity");
const book_entity_1 = require("../domain/entities/book.entity");
const customer_validation_1 = require("./customer-validation");
const TRADE_IN_MULTIPLIERS = {
    Good: 0.4,
    Fair: 0.25,
    Poor: 0.1,
};
let CustomersService = class CustomersService {
    db;
    constructor(db) {
        this.db = db;
    }
    async listCustomers() {
        return this.db.getCustomers();
    }
    async getCustomersWithOutstandingBalances() {
        return this.db.getCustomersWithOutstandingBalances();
    }
    async getCustomer(customerId) {
        const customer = await this.db.getCustomerByID(customerId);
        if (!customer) {
            throw new common_1.NotFoundException('Customer not found.');
        }
        return customer;
    }
    async createCustomer(input) {
        const name = (0, customer_validation_1.assertName)(input.name);
        const address = (0, customer_validation_1.assertAddress)(input.address);
        const email = (0, customer_validation_1.assertEmail)(input.email);
        const phoneNumber = (0, customer_validation_1.assertPhoneNumber)(input.phoneNumber);
        const existingUsers = await this.db.getUsers();
        if (existingUsers.some((user) => user.email.toLowerCase() === email)) {
            throw new common_1.BadRequestException('A customer with that email already exists.');
        }
        const customer = {
            customerId: this.db.generateId('CUS'),
            name,
            address,
            email,
            phoneNumber,
            accountBalance: 0,
            passwordHash: input.passwordHash,
        };
        return this.db.insertCustomer(customer);
    }
    async updateCustomerDetails(customerId, input) {
        const customers = await this.db.getCustomers();
        const currentCustomer = customers.find((customer) => customer.customerId === customerId);
        if (!currentCustomer) {
            throw new common_1.NotFoundException('Customer not found.');
        }
        const nextName = input.name === undefined ? currentCustomer.name : (0, customer_validation_1.assertName)(input.name);
        const nextAddress = input.address === undefined ? currentCustomer.address : (0, customer_validation_1.assertAddress)(input.address);
        const nextEmail = input.email === undefined ? currentCustomer.email : (0, customer_validation_1.assertEmail)(input.email);
        const nextPhoneNumber = input.phoneNumber === undefined ? currentCustomer.phoneNumber : (0, customer_validation_1.assertPhoneNumber)(input.phoneNumber);
        const existingUsers = await this.db.getUsers();
        const emailTaken = existingUsers.some((user) => user.email.toLowerCase() === nextEmail && user.userId !== customerId);
        if (emailTaken) {
            throw new common_1.BadRequestException('A customer with that email already exists.');
        }
        const updated = await this.db.updateCustomerDetails(customerId, {
            name: (0, customer_validation_1.normalizeName)(nextName),
            address: (0, customer_validation_1.normalizeAddress)(nextAddress),
            email: (0, customer_validation_1.normalizeEmail)(nextEmail),
            phoneNumber: (0, customer_validation_1.normalizePhoneNumber)(nextPhoneNumber),
        });
        if (!updated) {
            throw new common_1.NotFoundException('Customer not found.');
        }
        return updated;
    }
    async updateCustomerBalance(customerId, newBalance) {
        if (!Number.isFinite(newBalance)) {
            throw new common_1.BadRequestException('New balance must be a valid number.');
        }
        const updated = await this.db.updateCustomerBalance(customerId, newBalance);
        if (!updated) {
            throw new common_1.NotFoundException('Customer not found.');
        }
        return updated;
    }
    async deleteCustomer(customerId) {
        try {
            const deleted = await this.db.deleteCustomer(customerId);
            if (!deleted) {
                throw new common_1.NotFoundException('Customer not found.');
            }
            return { deleted: true, customerId };
        }
        catch (error) {
            if (error instanceof Error && error.message.includes('historical order')) {
                throw new common_1.BadRequestException(error.message);
            }
            throw error;
        }
    }
    async processTradeIn(customerId, bookIsbn, condition) {
        if (!customerId || !bookIsbn || !condition) {
            throw new common_1.BadRequestException('Invalid trade-in request.');
        }
        const customers = await this.db.getCustomers();
        const idx = customers.findIndex((c) => c.customerId === customerId);
        if (idx === -1)
            throw new common_1.NotFoundException('Customer not found.');
        const orders = await this.db.getOrders();
        const purchased = orders.some((order) => order.customerId === customerId && order.lines.some((line) => line.isbn === bookIsbn));
        if (!purchased) {
            throw new common_1.BadRequestException('Trade-in book must appear in the customer order history.');
        }
        const books = await this.db.getBooks();
        const book = books.find((item) => item.isbn === bookIsbn);
        if (!book) {
            throw new common_1.NotFoundException('Book not found in catalog.');
        }
        const multiplier = TRADE_IN_MULTIPLIERS[condition];
        if (!multiplier) {
            throw new common_1.BadRequestException('Invalid trade-in condition.');
        }
        const creditIssued = Number((book.price * multiplier).toFixed(2));
        const tradeIn = tradein_entity_1.TradeInRecordEntity.fromRaw({
            tradeInId: this.db.generateId('TDI'),
            customerId: customers[idx].customerId,
            bookIsbn,
            condition,
            creditIssued,
            status: 'Pending',
        });
        const records = await this.db.getTradeIns();
        records.push(tradeIn.toRaw());
        await this.db.saveTradeIns(records);
        return tradeIn.toRaw();
    }
    async listPendingTradeIns() {
        const records = await this.db.getTradeIns();
        return records.filter((r) => (r.status ?? 'Pending') === 'Pending');
    }
    async getTradeInHistoryByCustomer(customerId) {
        const records = await this.db.getTradeIns();
        return records.filter((record) => record.customerId === customerId);
    }
    async approveTradeIn(tradeInId, approverId, approve, notes) {
        const records = await this.db.getTradeIns();
        const idx = records.findIndex((r) => r.tradeInId === tradeInId);
        if (idx === -1)
            throw new common_1.NotFoundException('Trade-in record not found.');
        const recRaw = records[idx];
        const record = tradein_entity_1.TradeInRecordEntity.fromRaw(recRaw);
        if ((record.status ?? 'Pending') !== 'Pending') {
            throw new common_1.BadRequestException('Trade-in already processed.');
        }
        if (!approve) {
            record.status = 'Rejected';
            record.approverId = approverId;
            record.approvalDate = new Date().toISOString();
            record.notes = notes;
            records[idx] = record.toRaw();
            await this.db.saveTradeIns(records);
            return record.toRaw();
        }
        const customers = await this.db.getCustomers();
        const cIdx = customers.findIndex((c) => c.customerId === record.customerId);
        if (cIdx === -1)
            throw new common_1.NotFoundException('Customer not found.');
        const bookKey = `book:${record.bookIsbn}`;
        return this.db.withLocks([bookKey], async () => {
            const books = await this.db.getBooks();
            const book = books.find((b) => b.isbn === record.bookIsbn);
            if (book) {
                book.stockLevel = (book.stockLevel ?? 0) + 1;
                const usedBook = book_entity_1.BookEntity.fromRaw(book);
                usedBook.markAsUsed(0.3);
                Object.assign(book, usedBook.toRaw());
            }
            else {
                books.push({
                    isbn: record.bookIsbn,
                    title: `Used - ${record.bookIsbn}`,
                    author: 'Unknown',
                    genre: 'Used',
                    format: 'Paperback',
                    condition: 'Used',
                    source: 'Used',
                    price: book_entity_1.BookEntity.calculateUsedBookPrice(record.creditIssued || 0, 0.3),
                    stockLevel: 1,
                });
            }
            customers[cIdx].accountBalance = (customers[cIdx].accountBalance ?? 0) + record.creditIssued;
            record.status = 'Approved';
            record.approverId = approverId;
            record.approvalDate = new Date().toISOString();
            record.notes = notes;
            records[idx] = record.toRaw();
            await this.db.saveTradeIns(records);
            await this.db.saveCustomers(customers);
            await this.db.saveBooks(books);
            return record.toRaw();
        });
    }
};
exports.CustomersService = CustomersService;
exports.CustomersService = CustomersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_proxy_service_1.DatabaseProxyService])
], CustomersService);
//# sourceMappingURL=customers.service.js.map