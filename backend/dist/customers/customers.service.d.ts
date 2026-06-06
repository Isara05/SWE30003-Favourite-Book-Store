import { DatabaseProxyService } from '../database/database-proxy.service';
import { Customer } from '../domain/models';
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
export declare class CustomersService {
    private readonly db;
    constructor(db: DatabaseProxyService);
    listCustomers(): Promise<Customer[]>;
    getCustomersWithOutstandingBalances(): Promise<(Customer & {
        outstandingBalance: number;
    })[]>;
    getCustomer(customerId: string): Promise<Customer>;
    createCustomer(input: CreateCustomerInput): Promise<Customer>;
    updateCustomerDetails(customerId: string, input: UpdateCustomerInput): Promise<Customer>;
    updateCustomerBalance(customerId: string, newBalance: number): Promise<Customer>;
    deleteCustomer(customerId: string): Promise<{
        deleted: boolean;
        customerId: string;
    }>;
    processTradeIn(customerId: string, bookIsbn: string, condition: TradeInCondition): Promise<import("../domain/models").TradeInRecord>;
    listPendingTradeIns(): Promise<import("../domain/models").TradeInRecord[]>;
    getTradeInHistoryByCustomer(customerId: string): Promise<import("../domain/models").TradeInRecord[]>;
    approveTradeIn(tradeInId: string, approverId: string, approve: boolean, notes?: string): Promise<import("../domain/models").TradeInRecord>;
}
export {};
