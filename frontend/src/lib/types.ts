export interface Book {
  isbn: string;
  title: string;
  author: string;
  genre: string;
  format: string;
  condition: string;
  price: number;
  stockLevel: number;
}

export interface Customer {
  customerId: string;
  name: string;
  email: string;
}

export interface OrderLine {
  isbn: string;
  quantity: number;
  priceAtSale: number;
  lineTotal: number;
}

export interface Order {
  orderId: string;
  status: string;
  totalAmount: number;
  lines: OrderLine[];
  invoiceId?: string;
}

export interface PaymentResult {
  orderId: string;
  status: string;
  remainingBalance: number;
  invoiceId?: string;
  payment: {
    paymentId: string;
    amount: number;
    method: string;
    message: string;
  };
}
