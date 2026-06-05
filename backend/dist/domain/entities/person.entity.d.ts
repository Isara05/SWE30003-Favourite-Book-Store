import { PersonBase, Customer as ICustomer, Staff as IStaff, UserAccount } from '../models';
import { StaffRole } from '../enums';
export declare abstract class PersonEntity implements PersonBase {
    name: string;
    address: string;
    email: string;
    phoneNumber: string;
    constructor(name: string, address: string, email: string, phoneNumber: string);
}
export declare class CustomerEntity implements ICustomer {
    customerId: string;
    name: string;
    address: string;
    email: string;
    phoneNumber: string;
    accountBalance: number;
    permissions: string[];
    passwordHash?: string | undefined;
    constructor(customerId: string, name: string, address: string, email: string, phoneNumber: string, accountBalance?: number, permissions?: string[], passwordHash?: string | undefined);
    static fromUserAccount(user: UserAccount): CustomerEntity;
    toUserAccount(): UserAccount;
}
export declare class StaffEntity implements IStaff {
    employeeId: string;
    name: string;
    address: string;
    email: string;
    phoneNumber: string;
    role: StaffRole;
    permissions: string[];
    passwordHash?: string | undefined;
    constructor(employeeId: string, name: string, address: string, email: string, phoneNumber: string, role?: StaffRole, permissions?: string[], passwordHash?: string | undefined);
    static fromUserAccount(user: UserAccount): StaffEntity;
    toUserAccount(): UserAccount;
}
