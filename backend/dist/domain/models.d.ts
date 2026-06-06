import { AccountRole, BookCondition, BookFormat, OrderStatus, PaymentStatus, StaffRole } from './enums';
export interface PersonBase {
    name: string;
    address: string;
    email: string;
    phoneNumber: string;
}
export interface Customer extends PersonBase {
    customerId: string;
    accountBalance: number;
    permissions?: string[];
    passwordHash?: string;
}
export interface Staff extends PersonBase {
    employeeId: string;
    role: StaffRole;
    permissions?: string[];
    passwordHash?: string;
}
export interface AuthUser {
    id: string;
    role: AccountRole;
    name: string;
    email: string;
}
export interface UserAccount extends PersonBase {
    userId: string;
    role: AccountRole;
    accountBalance?: number;
    permissions?: string[];
    passwordHash?: string;
}
export interface Book {
    isbn: string;
    title: string;
    author: string;
    genre: string;
    format: BookFormat;
    condition: BookCondition;
    source?: 'New' | 'Used';
    price: number;
    stockLevel: number;
}
export interface OrderLine {
    isbn: string;
    quantity: number;
    priceAtSale: number;
    lineTotal: number;
}
export interface Payment {
    paymentId: string;
    orderId: string;
    amount: number;
    paymentDate: string;
    method: string;
    status: PaymentStatus;
    message: string;
}
export interface Invoice {
    invoiceId: string;
    orderId: string;
    issueDate: string;
    totalAmount: number;
    immutable?: boolean;
    auditComment?: string;
}
export interface InstallmentPlan {
    planId: string;
    orderId: string;
    customerId: string;
    totalAmount: number;
    balanceRemaining: number;
    installmentCount: number;
    payments: Payment[];
    status: 'Active' | 'Paid' | 'Cancelled';
    createdDate: string;
    lastUpdatedDate: string;
}
export interface Order {
    orderId: string;
    date: string;
    status: OrderStatus;
    customerId: string;
    staffId?: string;
    lines: OrderLine[];
    payments: Payment[];
    invoiceId?: string;
    totalAmount: number;
}
export interface TradeInRecord {
    tradeInId: string;
    customerId: string;
    bookIsbn: string;
    condition: string;
    creditIssued: number;
    status?: 'Pending' | 'Approved' | 'Rejected';
    approverId?: string;
    approvalDate?: string;
    notes?: string;
    recordDate: string;
}
export interface InventoryVariance {
    isbn: string;
    expected: number;
    actual: number;
    difference: number;
}
export interface InventoryAuditRecord extends InventoryVariance {
    auditId: string;
    staffId: string;
    recordedAt: string;
}
