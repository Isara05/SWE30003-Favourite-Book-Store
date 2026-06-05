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
var DatabaseProxyService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseProxyService = void 0;
const common_1 = require("@nestjs/common");
const enums_1 = require("../domain/enums");
const person_entity_1 = require("../domain/entities/person.entity");
const storage_1 = require("./storage");
let DatabaseProxyService = class DatabaseProxyService {
    static { DatabaseProxyService_1 = this; }
    static instance = null;
    booksFile = 'books.json';
    usersFile = 'users.json';
    ordersFile = 'orders.json';
    invoicesFile = 'invoices.json';
    tradeInsFile = 'tradeins.json';
    paymentsFile = 'payments.json';
    installmentPlansFile = 'installment-plans.json';
    inventoryAuditsFile = 'inventory-audits.json';
    constructor() {
        if (!DatabaseProxyService_1.instance) {
            DatabaseProxyService_1.instance = this;
        }
    }
    keyLocks = new Map();
    async acquireLock(key) {
        const tail = this.keyLocks.get(key) ?? Promise.resolve();
        let releaseFn;
        const lockPromise = tail.then(() => new Promise((res) => (releaseFn = res)));
        this.keyLocks.set(key, lockPromise);
        await tail;
        return () => {
            try {
                releaseFn();
            }
            finally {
                if (this.keyLocks.get(key) === lockPromise)
                    this.keyLocks.delete(key);
            }
        };
    }
    async withLocks(keys, callback) {
        const ordered = [...new Set(keys)].sort();
        const releases = [];
        try {
            for (const k of ordered) {
                const rel = await this.acquireLock(k);
                releases.push(rel);
            }
            return await callback();
        }
        finally {
            for (let i = releases.length - 1; i >= 0; i--) {
                try {
                    releases[i]();
                }
                catch (e) {
                }
            }
        }
    }
    static getInstance() {
        if (!DatabaseProxyService_1.instance) {
            DatabaseProxyService_1.instance = new DatabaseProxyService_1();
        }
        return DatabaseProxyService_1.instance;
    }
    toCustomer(user) {
        return person_entity_1.CustomerEntity.fromUserAccount(user);
    }
    toStaff(user) {
        return person_entity_1.StaffEntity.fromUserAccount(user);
    }
    fromCustomer(customer) {
        if (customer && typeof customer.toUserAccount === 'function') {
            return customer.toUserAccount();
        }
        return {
            userId: customer.customerId,
            role: enums_1.AccountRole.Customer,
            name: customer.name,
            address: customer.address,
            email: customer.email,
            phoneNumber: customer.phoneNumber,
            accountBalance: customer.accountBalance,
            passwordHash: customer.passwordHash,
        };
    }
    fromStaff(staff) {
        if (staff && typeof staff.toUserAccount === 'function') {
            return staff.toUserAccount();
        }
        return {
            userId: staff.employeeId,
            role: staff.role === enums_1.StaffRole.Manager ? enums_1.AccountRole.Manager : enums_1.AccountRole.Staff,
            name: staff.name,
            address: staff.address,
            email: staff.email,
            phoneNumber: staff.phoneNumber,
            passwordHash: staff.passwordHash,
        };
    }
    async getUsers() {
        return (0, storage_1.readJson)(this.usersFile, []);
    }
    async saveUsers(users) {
        await (0, storage_1.writeJson)(this.usersFile, users);
    }
    async getBooks() {
        return (0, storage_1.readJson)(this.booksFile, []);
    }
    async getAllBooks(limit = 250, offset = 0) {
        const books = await this.getBooks();
        return books.slice(offset, offset + limit);
    }
    async getBookByISBN(isbn) {
        const books = await this.getBooks();
        return books.find((book) => book.isbn === isbn);
    }
    async insertBook(book) {
        const books = await this.getBooks();
        if (books.some((item) => item.isbn === book.isbn)) {
            throw new common_1.BadRequestException('A book with that ISBN already exists.');
        }
        books.push(book);
        await this.saveBooks(books);
        return book;
    }
    async updateBookDetails(isbn, updatedBook) {
        return this.withLocks([`book:${isbn}`], async () => {
            const books = await this.getBooks();
            const idx = books.findIndex((item) => item.isbn === isbn);
            if (idx === -1) {
                return null;
            }
            const current = books[idx];
            books[idx] = {
                ...current,
                ...updatedBook,
                isbn: current.isbn,
                stockLevel: updatedBook.stockLevel ?? current.stockLevel,
            };
            await this.saveBooks(books);
            return books[idx];
        });
    }
    async deleteBook(isbn) {
        return this.withLocks([`book:${isbn}`], async () => {
            const books = await this.getBooks();
            const next = books.filter((book) => book.isbn !== isbn);
            if (next.length === books.length) {
                return false;
            }
            await this.saveBooks(next);
            return true;
        });
    }
    async getBooksPage(limit = 250, offset = 0) {
        const books = await this.getBooks();
        return books.slice(offset, offset + limit);
    }
    async executeReader(limit = 250, offset = 0) {
        return this.getBooksPage(limit, offset);
    }
    async saveBooks(books) {
        await (0, storage_1.writeJson)(this.booksFile, books);
    }
    async checkBookExists(isbn) {
        const books = await this.getBooks();
        return books.some((book) => book.isbn === isbn);
    }
    async updateStockLevel(isbn, quantity) {
        return this.withLocks([`book:${isbn}`], async () => {
            const books = await this.getBooks();
            const book = books.find((item) => item.isbn === isbn);
            if (!book) {
                return null;
            }
            book.stockLevel += quantity;
            await this.saveBooks(books);
            return book;
        });
    }
    async getCustomers() {
        const users = await this.getUsers();
        return users.filter((user) => user.role === enums_1.AccountRole.Customer).map((user) => this.toCustomer(user));
    }
    async getCustomerByID(customerId) {
        const customers = await this.getCustomers();
        return customers.find((customer) => customer.customerId === customerId);
    }
    async getCustomersWithOutstandingBalances() {
        const customers = await this.getCustomers();
        const orders = await this.getOrders();
        return customers
            .map((customer) => {
            const outstandingBalance = orders
                .filter((order) => order.customerId === customer.customerId)
                .reduce((sum, order) => {
                const balanceRemaining = typeof order.balanceRemaining === 'function'
                    ? order.balanceRemaining()
                    : Math.max((order.totalAmount ?? 0) - ((order.payments || []).reduce((paymentSum, payment) => paymentSum + (payment.amount || 0), 0)), 0);
                return sum + balanceRemaining;
            }, 0);
            return { ...customer, outstandingBalance };
        })
            .filter((customer) => customer.outstandingBalance > 0);
    }
    async saveCustomers(customers) {
        const users = await this.getUsers();
        const preservedUsers = users.filter((user) => user.role !== enums_1.AccountRole.Customer);
        await this.saveUsers([...preservedUsers, ...customers.map((customer) => this.fromCustomer(customer))]);
    }
    async insertCustomer(customer) {
        const customers = await this.getCustomers();
        customers.push(customer);
        await this.saveCustomers(customers);
        return customer;
    }
    async updateCustomerBalance(customerId, newBalance) {
        return this.withLocks([`customer:${customerId}`], async () => {
            const customers = await this.getCustomers();
            const idx = customers.findIndex((customer) => customer.customerId === customerId);
            if (idx === -1) {
                return null;
            }
            customers[idx].accountBalance = newBalance;
            await this.saveCustomers(customers);
            return customers[idx];
        });
    }
    async updateCustomerDetails(customerId, details) {
        return this.withLocks([`customer:${customerId}`], async () => {
            const customers = await this.getCustomers();
            const idx = customers.findIndex((customer) => customer.customerId === customerId);
            if (idx === -1) {
                return null;
            }
            const nextDetails = Object.fromEntries(Object.entries(details).filter(([, value]) => value !== undefined));
            customers[idx] = {
                ...customers[idx],
                ...nextDetails,
                customerId: customers[idx].customerId,
                accountBalance: details.accountBalance ?? customers[idx].accountBalance,
            };
            await this.saveCustomers(customers);
            return customers[idx];
        });
    }
    async deleteCustomer(customerId) {
        return this.withLocks([`customer:${customerId}`], async () => {
            const orders = await this.getOrders();
            const hasHistory = orders.some((order) => order.customerId === customerId);
            if (hasHistory) {
                throw new common_1.BadRequestException('Customer has historical order records and cannot be deleted.');
            }
            const customers = await this.getCustomers();
            const next = customers.filter((customer) => customer.customerId !== customerId);
            if (next.length === customers.length) {
                return false;
            }
            await this.saveCustomers(next);
            return true;
        });
    }
    async getStaff() {
        const users = await this.getUsers();
        return users
            .filter((user) => user.role === enums_1.AccountRole.Staff || user.role === enums_1.AccountRole.Manager)
            .map((user) => this.toStaff(user));
    }
    async saveStaff(staff) {
        const users = await this.getUsers();
        const preservedUsers = users.filter((user) => user.role === enums_1.AccountRole.Customer);
        await this.saveUsers([...preservedUsers, ...staff.map((item) => this.fromStaff(item))]);
    }
    async getOrders() {
        return (0, storage_1.readJson)(this.ordersFile, []);
    }
    async saveOrders(orders) {
        await (0, storage_1.writeJson)(this.ordersFile, orders);
    }
    async getInvoices() {
        return (0, storage_1.readJson)(this.invoicesFile, []);
    }
    async saveInvoices(invoices) {
        await (0, storage_1.writeJson)(this.invoicesFile, invoices);
    }
    async insertInvoice(invoice, orderId) {
        const invoices = await this.getInvoices();
        const nextInvoice = { ...invoice, orderId };
        invoices.push(nextInvoice);
        await this.saveInvoices(invoices);
        return nextInvoice;
    }
    async saveInvoice(invoice) {
        const invoices = await this.getInvoices();
        invoices.push(invoice);
        await this.saveInvoices(invoices);
        return invoice;
    }
    async getTradeIns() {
        return (0, storage_1.readJson)(this.tradeInsFile, []);
    }
    async saveTradeIns(records) {
        await (0, storage_1.writeJson)(this.tradeInsFile, records);
    }
    async getInstallmentPlans() {
        return (0, storage_1.readJson)(this.installmentPlansFile, []);
    }
    async saveInstallmentPlans(plans) {
        await (0, storage_1.writeJson)(this.installmentPlansFile, plans);
    }
    async insertInstallmentPlan(plan) {
        const plans = await this.getInstallmentPlans();
        plans.push(plan);
        await this.saveInstallmentPlans(plans);
        return plan;
    }
    async getInventoryAudits() {
        return (0, storage_1.readJson)(this.inventoryAuditsFile, []);
    }
    async saveInventoryAudits(records) {
        await (0, storage_1.writeJson)(this.inventoryAuditsFile, records);
    }
    async insertInventoryAudit(record) {
        const records = await this.getInventoryAudits();
        records.push(record);
        await this.saveInventoryAudits(records);
        return record;
    }
    async getPayments() {
        return (0, storage_1.readJson)(this.paymentsFile, []);
    }
    async savePayments(payments) {
        await (0, storage_1.writeJson)(this.paymentsFile, payments);
    }
    async insertPayment(payment, orderId) {
        const payments = await this.getPayments();
        const nextPayment = { ...payment, orderId };
        payments.push(nextPayment);
        await this.savePayments(payments);
        return nextPayment;
    }
    generateId(prefix) {
        const seed = Math.random().toString(36).slice(2, 8);
        return `${prefix}-${Date.now()}-${seed}`;
    }
};
exports.DatabaseProxyService = DatabaseProxyService;
exports.DatabaseProxyService = DatabaseProxyService = DatabaseProxyService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], DatabaseProxyService);
//# sourceMappingURL=database-proxy.service.js.map