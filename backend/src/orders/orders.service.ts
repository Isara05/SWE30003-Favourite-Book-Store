import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseProxyService } from '../database/database-proxy.service';
import { Order as IOrder, OrderLine as IOrderLine, Payment as IPayment } from '../domain/models';
import { OrderStatus, PaymentStatus } from '../domain/enums';
import { OrderEntity } from '../domain/entities/order.entity';
import { OrderLineEntity } from '../domain/entities/order-line.entity';
import { PaymentEntity } from '../domain/entities/payment.entity';
import { PaymentsService } from '../payments/payments.service';
import { StockLevelConflictException } from '../domain/errors/stock-level-conflict.exception';

interface OrderItemInput {
  isbn: string;
  quantity: number;
}

interface CreateOrderInput {
  customerId?: string;
  staffId?: string;
  items: OrderItemInput[];
}

interface PaymentInput {
  amount: number;
  method: string;
}

type OrderStatusInput = OrderStatus.Created | OrderStatus.Paid | OrderStatus.Shipped | OrderStatus.Cancelled;

type RevenueSummary = {
  grossRevenue: number;
  paidOrderCount: number;
  totalItemsSold: number;
  averageOrderValue: number;
};

@Injectable()
export class OrdersService {
  constructor(private readonly db: DatabaseProxyService, private readonly payments: PaymentsService) {}

  // Loads the orders for customer list.
  async listOrdersForCustomer(customerId: string): Promise<IOrder[]> {
    const raw = await this.db.getOrders();
    const entities = raw.map((r) => OrderEntity.fromRaw(r as any));
    const filtered = entities.filter((o) => o.customerId === customerId).sort((l, r) => r.date.localeCompare(l.date));
    return filtered.map((o) => o.toRaw());
  }

  // Loads the all orders list.
  async listAllOrders(): Promise<IOrder[]> {
    const raw = await this.db.getOrders();
    return raw.map((r) => OrderEntity.fromRaw(r as any).toRaw()).sort((left, right) => right.date.localeCompare(left.date));
  }

  // Finds the revenue summary details.
  async getRevenueSummary(): Promise<RevenueSummary> {
    const raw = await this.db.getOrders();
    const orders = raw.map((entry) => OrderEntity.fromRaw(entry as any));
    const paidOrders = orders.filter((order) => order.status === OrderStatus.Paid);

    const grossRevenue = paidOrders.reduce((sum, order) => sum + (order.totalAmount ?? 0), 0);
    const totalItemsSold = paidOrders.reduce(
      (sum, order) => sum + (order.lines || []).reduce((lineSum, line) => lineSum + (line.quantity || 0), 0),
      0,
    );
    const paidOrderCount = paidOrders.length;
    const averageOrderValue = paidOrderCount > 0 ? grossRevenue / paidOrderCount : 0;

    return {
      grossRevenue: Math.round(grossRevenue * 100) / 100,
      paidOrderCount,
      totalItemsSold,
      averageOrderValue: Math.round(averageOrderValue * 100) / 100,
    };
  }

  // Finds the customer purchase history details.
  async getCustomerPurchaseHistory(customerId: string): Promise<IOrder[]> {
    return this.listOrdersForCustomer(customerId);
  }

  // Finds the order details details.
  async getOrderDetails(orderId: string): Promise<IOrder> {
    return this.getOrder(orderId);
  }

  // Creates a new order record.
  async createOrder(input: CreateOrderInput): Promise<IOrder> {
    // Handles the if logic.
    if (!input.items?.length) {
      throw new BadRequestException('Customer and order items are required.');
    }

    let customerId = input.customerId?.trim();
    // Handles the if logic.
    if (!customerId) {
      const guestCustomer = await this.db.insertCustomer({
        customerId: this.db.generateId('CUS'),
        name: 'Guest Checkout',
        address: 'Guest address',
        email: `guest-${Date.now()}@local`,
        phoneNumber: 'N/A',
        accountBalance: 0,
      });
      customerId = guestCustomer.customerId;
    } else {
      const customers = await this.db.getCustomers();
      const customer = customers.find((item) => item.customerId === customerId);
      // Handles the if logic.
      if (!customer) {
        throw new NotFoundException('Customer not found.');
      }
    }

    const itemMap = new Map<string, number>();

    input.items.forEach((item) => {
      // Handles the if logic.
      if (item.quantity <= 0) {
        throw new BadRequestException('Quantity must be greater than zero.');
      }
      const current = itemMap.get(item.isbn) ?? 0;
      itemMap.set(item.isbn, current + item.quantity);
    });

    // Acquire locks for all involved books to simulate SELECT ... FOR UPDATE
    const isbns = Array.from(itemMap.keys());
    const lockKeys = isbns.map((i) => `book:${i}`);

    return this.db.withLocks(lockKeys, async () => {
      // read fresh data while holding locks
      const books = await this.db.getBooks();

      const lines: IOrderLine[] = Array.from(itemMap.entries()).map(([isbn, quantity]) => {
        const book = books.find((entry) => entry.isbn === isbn);
        // Handles the if logic.
        if (!book) {
          throw new NotFoundException(`Book ${isbn} not found.`);
        }
        // Handles the if logic.
        if (book.stockLevel < quantity) {
          throw new StockLevelConflictException(book.isbn, quantity, book.stockLevel);
        }
        return {
          isbn: book.isbn,
          quantity,
          priceAtSale: book.price,
          lineTotal: book.price * quantity,
        };
      });

      // update stock levels
      lines.forEach((line) => {
        const book = books.find((entry) => entry.isbn === line.isbn);
        // Handles the if logic.
        if (book) {
          book.stockLevel -= line.quantity;
        }
      });

      // create OrderEntity and persist
      const lineEntities = lines.map((l) => OrderLineEntity.fromRaw(l as any));
      const orderEntity = new OrderEntity(this.db.generateId('ORD'), new Date().toISOString(), OrderStatus.Created as any, customerId as string, input.staffId, lineEntities, [], undefined, 0);
      orderEntity.recalculateTotal();

      const orders = await this.db.getOrders();
      orders.push(orderEntity.toRaw());
      await this.db.saveOrders(orders);
      await this.db.saveBooks(books);

      return orderEntity.toRaw();
    });
  }

  // Finds the order details.
  async getOrder(orderId: string): Promise<IOrder> {
    const orders = await this.db.getOrders();
    const raw = orders.find((item) => item.orderId === orderId);
    if (!raw) throw new NotFoundException('Order not found.');
    const entity = OrderEntity.fromRaw(raw as any);
    return entity.toRaw();
  }

  // Updates the order status details.
  async updateOrderStatus(orderId: string, newStatus: OrderStatusInput): Promise<IOrder> {
    return this.db.withLocks([`order:${orderId}`], async () => {
      const orders = await this.db.getOrders();
      const idx = orders.findIndex((item) => item.orderId === orderId);
      // Handles the if logic.
      if (idx === -1) {
        throw new NotFoundException('Order not found.');
      }

      const orderEntity = OrderEntity.fromRaw(orders[idx] as any);
      // Handles the if logic.
      if (orderEntity.status === newStatus) {
        return orderEntity.toRaw();
      }

      const allowedStatuses: OrderStatusInput[] = [OrderStatus.Created, OrderStatus.Paid, OrderStatus.Shipped, OrderStatus.Cancelled];
      if (!allowedStatuses.includes(newStatus)) {
        throw new BadRequestException('Invalid order status.');
      }

      if (newStatus === OrderStatus.Cancelled && orderEntity.balanceRemaining() === 0) {
        throw new BadRequestException('Refund flow required before cancelling a paid order.');
      }

      orderEntity.status = newStatus as any;
      orders[idx] = orderEntity.toRaw();
      await this.db.saveOrders(orders);
      return orderEntity.toRaw();
    });
  }

  // Handles the add payment logic.
  async addPayment(orderId: string, input: PaymentInput) {
    // Handles the if logic.
    if (!input.amount || input.amount <= 0) {
      throw new BadRequestException('Payment amount must be greater than zero.');
    }

    const orders = await this.db.getOrders();
    const raw = orders.find((item) => item.orderId === orderId);
    if (!raw) throw new NotFoundException('Order not found.');
    const orderEntity = OrderEntity.fromRaw(raw as any);

    const remaining = orderEntity.balanceRemaining();
    // Handles the if logic.
    if (input.amount > remaining) {
      throw new BadRequestException('Payment exceeds remaining balance.');
    }

    // determine payment flow
    let paymentResult: IPayment;
    const method = input.method ?? 'CardDetails';
    // Handles the if logic.
    if (method === 'CardDetails') {
      const cardLast4 = '4242';
      paymentResult = await this.payments.processCard(orderEntity.orderId, input.amount, cardLast4);
    } else if (method === 'DirectTransfer') {
      paymentResult = await this.payments.processDirectTransfer(orderEntity.orderId, input.amount, 'acct-unknown');
    } else if (method === 'AccountCredit') {
      // apply account credit for the customer
      paymentResult = await this.payments.processAccountCredit(orderEntity.orderId, input.amount, orderEntity.customerId);
    } else {
      // default to card
      paymentResult = await this.payments.processCard(orderEntity.orderId, input.amount);
    }

    // attach payment to order record if processed immediately
    const paymentsList = await this.db.getPayments();
    // if payment is processed, ensure it's attached to the order here
    if (paymentResult.status === PaymentStatus.Processed) {
      orderEntity.payments.push(paymentResult as any);
      paymentsList.push(paymentResult as any);
      await this.db.savePayments(paymentsList);
    } else {
      // pending payments already persisted by PaymentsService
    }

    // update status and possibly invoice if payment processed
    if (orderEntity.balanceRemaining() === 0) {
      orderEntity.status = OrderStatus.Paid as any;
      // Handles the if logic.
      if (!orderEntity.invoiceId) {
        const invoice = {
          invoiceId: this.db.generateId('INV'),
          orderId: orderEntity.orderId,
          issueDate: new Date().toISOString(),
          totalAmount: orderEntity.totalAmount,
          immutable: true,
          auditComment: 'Generated from a paid order and locked for compliance review.',
        };
        orderEntity.invoiceId = invoice.invoiceId;
        await this.db.insertInvoice(invoice, orderEntity.orderId);
      }
    }

    // save updated order back to storage
    const updated = orders.map((o) => (o.orderId === orderEntity.orderId ? orderEntity.toRaw() : o));
    await this.db.saveOrders(updated);

    return {
      orderId: orderEntity.orderId,
      status: orderEntity.status,
      payment: paymentResult,
      remainingBalance: Math.max(orderEntity.totalAmount - orderEntity.payments.reduce((s, p) => s + (p.amount || 0), 0), 0),
      invoiceId: orderEntity.invoiceId,
    };
  }

  // Finds the receipts details.
  async getReceipts(orderId: string): Promise<string[]> {
    const orders = await this.db.getOrders();
    const raw = orders.find((item) => item.orderId === orderId);
    if (!raw) throw new NotFoundException('Order not found.');
    const orderEntity = OrderEntity.fromRaw(raw as any);
    const receipts = (orderEntity.payments || []).map((p) => {
      try {
        const pe = PaymentEntity.fromRaw(p as any);
        return pe.generateReceipt();
      } catch (e) {
        return `Payment ${p.paymentId || 'unknown'} - $${p.amount}`;
      }
    });
    return receipts;
  }
}
