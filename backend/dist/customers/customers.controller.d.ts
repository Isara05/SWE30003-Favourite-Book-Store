import { CustomersService } from './customers.service';
export declare class CustomersController {
    private readonly customersService;
    constructor(customersService: CustomersService);
    listCustomers(): Promise<import("../domain").Customer[]>;
    outstandingBalances(): Promise<(import("../domain").Customer & {
        outstandingBalance: number;
    })[]>;
    getCustomer(id: string): Promise<import("../domain").Customer>;
    createCustomer(body: {
        name: string;
        address: string;
        email: string;
        phoneNumber: string;
    }): Promise<import("../domain").Customer>;
    updateCustomer(id: string, body: {
        name?: string;
        address?: string;
        email?: string;
        phoneNumber?: string;
    }): Promise<import("../domain").Customer>;
    updateBalance(id: string, body: {
        newBalance: number;
    }): Promise<import("../domain").Customer>;
    deleteCustomer(id: string): Promise<{
        deleted: boolean;
        customerId: string;
    }>;
    tradeIn(id: string, body: {
        isbn: string;
        condition: 'Good' | 'Fair' | 'Poor';
    }): Promise<import("../domain").TradeInRecord>;
    tradeInHistory(id: string): Promise<import("../domain").TradeInRecord[]>;
    listPendingTradeIns(): Promise<import("../domain").TradeInRecord[]>;
    approveTradeIn(id: string, body: {
        approverId: string;
        approve: boolean;
        notes?: string;
    }): Promise<import("../domain").TradeInRecord>;
}
