import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseProxyService } from '../database/database-proxy.service';
import { Customer } from '../domain/models';
import { TradeInRecordEntity } from '../domain/entities/tradein.entity';
import { BookEntity } from '../domain/entities/book.entity';
import {
  assertAddress,
  assertEmail,
  assertName,
  assertPhoneNumber,
  normalizeAddress,
  normalizeEmail,
  normalizeName,
  normalizePhoneNumber,
} from './customer-validation';

interface CreateCustomerInput {
  name: string;
  address: string;
  email: string;
  phoneNumber: string;
  passwordHash?: string;
}

interface UpdateCustomerInput {
  name?: string;
  address?: string;
  email?: string;
  phoneNumber?: string;
}

type TradeInCondition = 'Good' | 'Fair' | 'Poor';

const TRADE_IN_MULTIPLIERS: Record<TradeInCondition, number> = {
  Good: 0.4,
  Fair: 0.25,
  Poor: 0.1,
};

@Injectable()
export class CustomersService {
  constructor(private readonly db: DatabaseProxyService) {}

  // Loads the customers list.
  async listCustomers(): Promise<Customer[]> {
    return this.db.getCustomers();
  }

  // Finds the customers with outstanding balances details.
  async getCustomersWithOutstandingBalances() {
    return this.db.getCustomersWithOutstandingBalances();
  }

  // Finds the customer details.
  async getCustomer(customerId: string): Promise<Customer> {
    const customer = await this.db.getCustomerByID(customerId);
    // Handles the if logic.
    if (!customer) {
      throw new NotFoundException('Customer not found.');
    }
    return customer;
  }

  // Creates a new customer record.
  async createCustomer(input: CreateCustomerInput): Promise<Customer> {
    const name = assertName(input.name);
    const address = assertAddress(input.address);
    const email = assertEmail(input.email);
    const phoneNumber = assertPhoneNumber(input.phoneNumber);

    const existingUsers = await this.db.getUsers();
    if (existingUsers.some((user) => user.email.toLowerCase() === email)) {
      throw new BadRequestException('A customer with that email already exists.');
    }

    const customer: Customer = {
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

  // Updates the customer details details.
  async updateCustomerDetails(customerId: string, input: UpdateCustomerInput) {
    const customers = await this.db.getCustomers();
    const currentCustomer = customers.find((customer) => customer.customerId === customerId);
    // Handles the if logic.
    if (!currentCustomer) {
      throw new NotFoundException('Customer not found.');
    }

    const nextName = input.name === undefined ? currentCustomer.name : assertName(input.name);
    const nextAddress = input.address === undefined ? currentCustomer.address : assertAddress(input.address);
    const nextEmail = input.email === undefined ? currentCustomer.email : assertEmail(input.email);
    const nextPhoneNumber = input.phoneNumber === undefined ? currentCustomer.phoneNumber : assertPhoneNumber(input.phoneNumber);

    const existingUsers = await this.db.getUsers();
    const emailTaken = existingUsers.some((user) => user.email.toLowerCase() === nextEmail && user.userId !== customerId);
    // Handles the if logic.
    if (emailTaken) {
      throw new BadRequestException('A customer with that email already exists.');
    }

    const updated = await this.db.updateCustomerDetails(customerId, {
      name: normalizeName(nextName),
      address: normalizeAddress(nextAddress),
      email: normalizeEmail(nextEmail),
      phoneNumber: normalizePhoneNumber(nextPhoneNumber),
    });
    // Handles the if logic.
    if (!updated) {
      throw new NotFoundException('Customer not found.');
    }
    return updated;
  }

  // Updates the customer balance details.
  async updateCustomerBalance(customerId: string, newBalance: number) {
    if (!Number.isFinite(newBalance)) {
      throw new BadRequestException('New balance must be a valid number.');
    }
    const updated = await this.db.updateCustomerBalance(customerId, newBalance);
    // Handles the if logic.
    if (!updated) {
      throw new NotFoundException('Customer not found.');
    }
    return updated;
  }

  // Deletes the selected customer record.
  async deleteCustomer(customerId: string) {
    try {
      const deleted = await this.db.deleteCustomer(customerId);
      // Handles the if logic.
      if (!deleted) {
        throw new NotFoundException('Customer not found.');
      }
      return { deleted: true, customerId };
    } catch (error) {
      if (error instanceof Error && error.message.includes('historical order')) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  // Handles the trade in flow.
  async processTradeIn(customerId: string, bookIsbn: string, condition: TradeInCondition) {
    // Handles the if logic.
    if (!customerId || !bookIsbn || !condition) {
      throw new BadRequestException('Invalid trade-in request.');
    }

    const customers = await this.db.getCustomers();
    const idx = customers.findIndex((c) => c.customerId === customerId);
    if (idx === -1) throw new NotFoundException('Customer not found.');

    const orders = await this.db.getOrders();
    const purchased = orders.some((order) => order.customerId === customerId && order.lines.some((line) => line.isbn === bookIsbn));
    // Handles the if logic.
    if (!purchased) {
      throw new BadRequestException('Trade-in book must appear in the customer order history.');
    }

    const books = await this.db.getBooks();
    const book = books.find((item) => item.isbn === bookIsbn);
    // Handles the if logic.
    if (!book) {
      throw new NotFoundException('Book not found in catalog.');
    }

    const multiplier = TRADE_IN_MULTIPLIERS[condition];
    // Handles the if logic.
    if (!multiplier) {
      throw new BadRequestException('Invalid trade-in condition.');
    }

    const creditIssued = Number((book.price * multiplier).toFixed(2));

    const tradeIn = TradeInRecordEntity.fromRaw({
      tradeInId: this.db.generateId('TDI'),
      customerId: customers[idx].customerId,
      bookIsbn,
      condition,
      creditIssued,
      status: 'Pending',
    } as any);

    // Persist pending trade-in request without applying credit. Staff must approve.
    const records = await this.db.getTradeIns();
    records.push(tradeIn.toRaw());
    await this.db.saveTradeIns(records);

    return tradeIn.toRaw();
  }

  // Loads the pending trade ins list.
  async listPendingTradeIns() {
    const records = await this.db.getTradeIns();
    return records.filter((r) => (r.status ?? 'Pending') === 'Pending');
  }

  // Finds the trade in history by customer details.
  async getTradeInHistoryByCustomer(customerId: string) {
    const records = await this.db.getTradeIns();
    return records.filter((record) => record.customerId === customerId);
  }

  // Handles the approve trade in logic.
  async approveTradeIn(tradeInId: string, approverId: string, approve: boolean, notes?: string) {
    const records = await this.db.getTradeIns();
    const idx = records.findIndex((r) => r.tradeInId === tradeInId);
    if (idx === -1) throw new NotFoundException('Trade-in record not found.');

    const recRaw = records[idx];
    const record = TradeInRecordEntity.fromRaw(recRaw as any);
    if ((record.status ?? 'Pending') !== 'Pending') {
      throw new BadRequestException('Trade-in already processed.');
    }

    // Handles the if logic.
    if (!approve) {
      record.status = 'Rejected';
      record.approverId = approverId;
      record.approvalDate = new Date().toISOString();
      record.notes = notes;
      records[idx] = record.toRaw();
      await this.db.saveTradeIns(records);
      return record.toRaw();
    }

    // Approve: apply credit to customer and update inventory (if book exists)
    const customers = await this.db.getCustomers();
    const cIdx = customers.findIndex((c) => c.customerId === record.customerId);
    if (cIdx === -1) throw new NotFoundException('Customer not found.');

    // Acquire lock on book to simulate safe inventory update
    const bookKey = `book:${record.bookIsbn}`;
    return this.db.withLocks([bookKey], async () => {
      const books = await this.db.getBooks();
      const book = books.find((b) => b.isbn === record.bookIsbn);
      // Handles the if logic.
      if (book) {
        book.stockLevel = (book.stockLevel ?? 0) + 1;
        const usedBook = BookEntity.fromRaw(book as any);
        usedBook.markAsUsed(0.3);
        Object.assign(book, usedBook.toRaw());
      } else {
        // create minimal placeholder used-book entry
        books.push({
          isbn: record.bookIsbn,
          title: `Used - ${record.bookIsbn}`,
          author: 'Unknown',
          genre: 'Used',
          format: 'Paperback' as any,
          condition: 'Used' as any,
          source: 'Used',
          price: BookEntity.calculateUsedBookPrice(record.creditIssued || 0, 0.3),
          stockLevel: 1,
        } as any);
      }

      // apply credit
      customers[cIdx].accountBalance = (customers[cIdx].accountBalance ?? 0) + record.creditIssued;

      // set approval metadata
      record.status = 'Approved';
      record.approverId = approverId;
      record.approvalDate = new Date().toISOString();
      record.notes = notes;

      // persist
      records[idx] = record.toRaw();
      await this.db.saveTradeIns(records);
      await this.db.saveCustomers(customers);
      await this.db.saveBooks(books);

      return record.toRaw();
    });
  }
}
