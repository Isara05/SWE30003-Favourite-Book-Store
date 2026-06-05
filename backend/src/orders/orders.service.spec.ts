import { OrdersService } from './orders.service';
import { StockLevelConflictException } from '../domain/errors/stock-level-conflict.exception';

describe('OrdersService stock validation', () => {
  it('throws a stock conflict when requested quantity exceeds stock', async () => {
    const db = {
      getOrders: jest.fn().mockResolvedValue([]),
      getCustomers: jest.fn().mockResolvedValue([{ customerId: 'CUS-1' }]),
      getBooks: jest.fn().mockResolvedValue([
        { isbn: '9780306406157', title: 'Test', author: 'A', genre: 'Fiction', format: 'Paperback', condition: 'New', source: 'New', price: 10, stockLevel: 0 },
      ]),
      insertCustomer: jest.fn(),
      generateId: jest.fn().mockReturnValue('ORD-1'),
      withLocks: jest.fn(async (_keys: string[], callback: () => Promise<unknown>) => callback()),
      saveOrders: jest.fn(),
      saveBooks: jest.fn(),
    } as any;
    const payments = {} as any;
    const service = new OrdersService(db, payments);

    await expect(service.createOrder({ customerId: 'CUS-1', items: [{ isbn: '9780306406157', quantity: 1 }] })).rejects.toBeInstanceOf(StockLevelConflictException);
  });
});