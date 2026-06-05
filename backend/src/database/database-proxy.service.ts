import { BadRequestException, Injectable } from '@nestjs/common';
import { AccountRole, StaffRole } from '../domain/enums';
import { Book, Customer, Staff, Invoice, Order, Payment, TradeInRecord, UserAccount, InstallmentPlan, InventoryAuditRecord } from '../domain/models';
import { CustomerEntity, StaffEntity } from '../domain/entities/person.entity';
import { readJson, writeJson } from './storage';

@Injectable()
export class DatabaseProxyService {
  private static instance: DatabaseProxyService | null = null;
  private readonly booksFile = 'books.json';
  private readonly usersFile = 'users.json';
  private readonly ordersFile = 'orders.json';
  private readonly invoicesFile = 'invoices.json';
  private readonly tradeInsFile = 'tradeins.json';
  private readonly paymentsFile = 'payments.json';
  private readonly installmentPlansFile = 'installment-plans.json';
  private readonly inventoryAuditsFile = 'inventory-audits.json';

  constructor() {
    // Handles the if logic.
    if (!DatabaseProxyService.instance) {
      DatabaseProxyService.instance = this;
    }
  }

  // Simple keyed mutex implementation to simulate SELECT ... FOR UPDATE
  // semantics in the file-backed store. Keys are arbitrary strings (e.g.
  // `book:ISBN-1234`). Locks are acquired in FIFO order per-key. Use
  // withLocks([...keys], async () => { ... }) to atomically operate on
  // multiple resources.
  private keyLocks: Map<string, Promise<void>> = new Map();

  private async acquireLock(key: string): Promise<() => void> {
    const tail = this.keyLocks.get(key) ?? Promise.resolve();
    let releaseFn!: () => void;
    const lockPromise = tail.then(() => new Promise<void>((res) => (releaseFn = res)));
    // set the new tail
    this.keyLocks.set(key, lockPromise);
    // wait for previous tail to complete before returning (ensures ordering)
    await tail;
    // return a release function that resolves the promise and cleans up
    return () => {
      try {
        releaseFn();
      } finally {
        // only remove if this lockPromise is still the tail
        if (this.keyLocks.get(key) === lockPromise) this.keyLocks.delete(key);
      }
    };
  }

  /**
   * Acquire locks for the provided keys in a deterministic order to avoid
   * deadlocks, run the callback, and release the locks. Locks are released
   * even if the callback throws.
   */
  async withLocks<T>(keys: string[], callback: () => Promise<T>): Promise<T> {
    // deterministic order
    const ordered = [...new Set(keys)].sort();
    const releases: Array<() => void> = [];
    try {
      // Handles the for logic.
      for (const k of ordered) {
        // eslint-disable-next-line no-await-in-loop
        const rel = await this.acquireLock(k);
        releases.push(rel);
      }
      return await callback();
    } finally {
      // release in reverse order
      for (let i = releases.length - 1; i >= 0; i--) {
        try {
          releases[i]();
        } catch (e) {
          // swallow release errors
        }
      }
    }
  }

  static getInstance(): DatabaseProxyService {
    // Handles the if logic.
    if (!DatabaseProxyService.instance) {
      DatabaseProxyService.instance = new DatabaseProxyService();
    }
    return DatabaseProxyService.instance;
  }

  private toCustomer(user: UserAccount): CustomerEntity {
    return CustomerEntity.fromUserAccount(user);
  }

  private toStaff(user: UserAccount): StaffEntity {
    return StaffEntity.fromUserAccount(user);
  }

  private fromCustomer(customer: any): UserAccount {
    // Handles the if logic.
    if (customer && typeof customer.toUserAccount === 'function') {
      return customer.toUserAccount();
    }
    return {
      userId: customer.customerId,
      role: AccountRole.Customer,
      name: customer.name,
      address: customer.address,
      email: customer.email,
      phoneNumber: customer.phoneNumber,
      accountBalance: customer.accountBalance,
      passwordHash: customer.passwordHash,
    };
  }

  private fromStaff(staff: any): UserAccount {
    // Handles the if logic.
    if (staff && typeof staff.toUserAccount === 'function') {
      return staff.toUserAccount();
    }
    return {
      userId: staff.employeeId,
      role: staff.role === StaffRole.Manager ? AccountRole.Manager : AccountRole.Staff,
      name: staff.name,
      address: staff.address,
      email: staff.email,
      phoneNumber: staff.phoneNumber,
      passwordHash: staff.passwordHash,
    };
  }

  // Finds the users details.
  async getUsers(): Promise<UserAccount[]> {
    return readJson<UserAccount[]>(this.usersFile, []);
  }

  // Saves the users data.
  async saveUsers(users: UserAccount[]): Promise<void> {
    await writeJson(this.usersFile, users);
  }

  // Finds the books details.
  async getBooks(): Promise<Book[]> {
    return readJson<Book[]>(this.booksFile, []);
  }

  // Finds the all books details.
  async getAllBooks(limit = 250, offset = 0): Promise<Book[]> {
    const books = await this.getBooks();
    return books.slice(offset, offset + limit);
  }

  // Finds the book by isbn details.
  async getBookByISBN(isbn: string): Promise<Book | undefined> {
    const books = await this.getBooks();
    return books.find((book) => book.isbn === isbn);
  }

  // Handles the insert book logic.
  async insertBook(book: Book): Promise<Book> {
    const books = await this.getBooks();
    if (books.some((item) => item.isbn === book.isbn)) {
      throw new BadRequestException('A book with that ISBN already exists.');
    }
    books.push(book);
    await this.saveBooks(books);
    return book;
  }

  // Updates the book details details.
  async updateBookDetails(isbn: string, updatedBook: Book): Promise<Book | null> {
    return this.withLocks([`book:${isbn}`], async () => {
      const books = await this.getBooks();
      const idx = books.findIndex((item) => item.isbn === isbn);
      // Handles the if logic.
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

  // Deletes the selected book record.
  async deleteBook(isbn: string): Promise<boolean> {
    return this.withLocks([`book:${isbn}`], async () => {
      const books = await this.getBooks();
      const next = books.filter((book) => book.isbn !== isbn);
      // Handles the if logic.
      if (next.length === books.length) {
        return false;
      }
      await this.saveBooks(next);
      return true;
    });
  }

  // Finds the books page details.
  async getBooksPage(limit = 250, offset = 0): Promise<Book[]> {
    const books = await this.getBooks();
    return books.slice(offset, offset + limit);
  }

  // Handles the execute reader logic.
  async executeReader(limit = 250, offset = 0): Promise<Book[]> {
    return this.getBooksPage(limit, offset);
  }

  // Saves the books data.
  async saveBooks(books: Book[]): Promise<void> {
    await writeJson(this.booksFile, books);
  }

  // Handles the check book exists logic.
  async checkBookExists(isbn: string): Promise<boolean> {
    const books = await this.getBooks();
    return books.some((book) => book.isbn === isbn);
  }

  // Updates the stock level details.
  async updateStockLevel(isbn: string, quantity: number): Promise<Book | null> {
    return this.withLocks([`book:${isbn}`], async () => {
      const books = await this.getBooks();
      const book = books.find((item) => item.isbn === isbn);
      // Handles the if logic.
      if (!book) {
        return null;
      }
      book.stockLevel += quantity;
      await this.saveBooks(books);
      return book;
    });
  }

  // Finds the customers details.
  async getCustomers(): Promise<Customer[]> {
    const users = await this.getUsers();
    return users.filter((user) => user.role === AccountRole.Customer).map((user) => this.toCustomer(user));
  }

  // Finds the customer by id details.
  async getCustomerByID(customerId: string): Promise<Customer | undefined> {
    const customers = await this.getCustomers();
    return customers.find((customer) => customer.customerId === customerId);
  }

  // Finds the customers with outstanding balances details.
  async getCustomersWithOutstandingBalances(): Promise<Array<Customer & { outstandingBalance: number }>> {
    const customers = await this.getCustomers();
    const orders = await this.getOrders();
    return customers
      .map((customer) => {
        const outstandingBalance = orders
          .filter((order) => order.customerId === customer.customerId)
          .reduce((sum, order) => {
            const balanceRemaining = typeof (order as any).balanceRemaining === 'function'
              ? (order as any).balanceRemaining()
              : Math.max((order.totalAmount ?? 0) - ((order.payments || []).reduce((paymentSum: number, payment: Payment) => paymentSum + (payment.amount || 0), 0)), 0);
            return sum + balanceRemaining;
          }, 0);

        return { ...customer, outstandingBalance };
      })
      .filter((customer) => customer.outstandingBalance > 0);
  }

  // Saves the customers data.
  async saveCustomers(customers: Customer[]): Promise<void> {
    const users = await this.getUsers();
    const preservedUsers = users.filter((user) => user.role !== AccountRole.Customer);
    await this.saveUsers([...preservedUsers, ...customers.map((customer) => this.fromCustomer(customer))]);
  }

  // Handles the insert customer logic.
  async insertCustomer(customer: Customer): Promise<Customer> {
    const customers = await this.getCustomers();
    customers.push(customer);
    await this.saveCustomers(customers);
    return customer;
  }

  // Updates the customer balance details.
  async updateCustomerBalance(customerId: string, newBalance: number): Promise<Customer | null> {
    return this.withLocks([`customer:${customerId}`], async () => {
      const customers = await this.getCustomers();
      const idx = customers.findIndex((customer) => customer.customerId === customerId);
      // Handles the if logic.
      if (idx === -1) {
        return null;
      }
      customers[idx].accountBalance = newBalance;
      await this.saveCustomers(customers);
      return customers[idx];
    });
  }

  // Updates the customer details details.
  async updateCustomerDetails(customerId: string, details: Partial<Customer>): Promise<Customer | null> {
    return this.withLocks([`customer:${customerId}`], async () => {
      const customers = await this.getCustomers();
      const idx = customers.findIndex((customer) => customer.customerId === customerId);
      // Handles the if logic.
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

  // Deletes the selected customer record.
  async deleteCustomer(customerId: string): Promise<boolean> {
    return this.withLocks([`customer:${customerId}`], async () => {
      const orders = await this.getOrders();
      const hasHistory = orders.some((order) => order.customerId === customerId);
      // Handles the if logic.
      if (hasHistory) {
        throw new BadRequestException('Customer has historical order records and cannot be deleted.');
      }

      const customers = await this.getCustomers();
      const next = customers.filter((customer) => customer.customerId !== customerId);
      // Handles the if logic.
      if (next.length === customers.length) {
        return false;
      }
      await this.saveCustomers(next);
      return true;
    });
  }

  // Finds the staff details.
  async getStaff(): Promise<Staff[]> {
    const users = await this.getUsers();
    return users
      .filter((user) => user.role === AccountRole.Staff || user.role === AccountRole.Manager)
      .map((user) => this.toStaff(user));
  }

  // Saves the staff data.
  async saveStaff(staff: Staff[]): Promise<void> {
    const users = await this.getUsers();
    const preservedUsers = users.filter((user) => user.role === AccountRole.Customer);
    await this.saveUsers([...preservedUsers, ...staff.map((item) => this.fromStaff(item))]);
  }

  // Finds the orders details.
  async getOrders(): Promise<Order[]> {
    return readJson<Order[]>(this.ordersFile, []);
  }

  // Saves the orders data.
  async saveOrders(orders: Order[]): Promise<void> {
    await writeJson(this.ordersFile, orders);
  }

  // Finds the invoices details.
  async getInvoices(): Promise<Invoice[]> {
    return readJson<Invoice[]>(this.invoicesFile, []);
  }

  // Saves the invoices data.
  async saveInvoices(invoices: Invoice[]): Promise<void> {
    await writeJson(this.invoicesFile, invoices);
  }

  // Handles the insert invoice logic.
  async insertInvoice(invoice: Invoice, orderId: string): Promise<Invoice> {
    const invoices = await this.getInvoices();
    const nextInvoice = { ...invoice, orderId };
    invoices.push(nextInvoice);
    await this.saveInvoices(invoices);
    return nextInvoice;
  }

  // Saves the invoice data.
  async saveInvoice(invoice: Invoice): Promise<Invoice> {
    const invoices = await this.getInvoices();
    invoices.push(invoice);
    await this.saveInvoices(invoices);
    return invoice;
  }

  // Finds the trade ins details.
  async getTradeIns(): Promise<TradeInRecord[]> {
    return readJson<TradeInRecord[]>(this.tradeInsFile, []);
  }

  // Saves the trade ins data.
  async saveTradeIns(records: TradeInRecord[]): Promise<void> {
    await writeJson(this.tradeInsFile, records);
  }

  // Finds the installment plans details.
  async getInstallmentPlans(): Promise<InstallmentPlan[]> {
    return readJson<InstallmentPlan[]>(this.installmentPlansFile, []);
  }

  // Saves the installment plans data.
  async saveInstallmentPlans(plans: InstallmentPlan[]): Promise<void> {
    await writeJson(this.installmentPlansFile, plans);
  }

  // Handles the insert installment plan logic.
  async insertInstallmentPlan(plan: InstallmentPlan): Promise<InstallmentPlan> {
    const plans = await this.getInstallmentPlans();
    plans.push(plan);
    await this.saveInstallmentPlans(plans);
    return plan;
  }

  // Finds the inventory audits details.
  async getInventoryAudits(): Promise<InventoryAuditRecord[]> {
    return readJson<InventoryAuditRecord[]>(this.inventoryAuditsFile, []);
  }

  // Saves the inventory audits data.
  async saveInventoryAudits(records: InventoryAuditRecord[]): Promise<void> {
    await writeJson(this.inventoryAuditsFile, records);
  }

  // Handles the insert inventory audit logic.
  async insertInventoryAudit(record: InventoryAuditRecord): Promise<InventoryAuditRecord> {
    const records = await this.getInventoryAudits();
    records.push(record);
    await this.saveInventoryAudits(records);
    return record;
  }

  // Finds the payments details.
  async getPayments(): Promise<Payment[]> {
    return readJson<Payment[]>(this.paymentsFile, []);
  }

  // Saves the payments data.
  async savePayments(payments: Payment[]): Promise<void> {
    await writeJson(this.paymentsFile, payments);
  }

  // Handles the insert payment logic.
  async insertPayment(payment: Payment, orderId: string): Promise<Payment> {
    const payments = await this.getPayments();
    const nextPayment = { ...payment, orderId };
    payments.push(nextPayment);
    await this.savePayments(payments);
    return nextPayment;
  }

  // Generates the id value.
  generateId(prefix: string): string {
    const seed = Math.random().toString(36).slice(2, 8);
    return `${prefix}-${Date.now()}-${seed}`;
  }
}
