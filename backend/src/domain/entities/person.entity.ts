import { PersonBase, Customer as ICustomer, Staff as IStaff, UserAccount } from '../models';
import { StaffRole, AccountRole } from '../enums';

export abstract class PersonEntity implements PersonBase {
  constructor(
    public name: string,
    public address: string,
    public email: string,
    public phoneNumber: string,
  ) {}
}

export class CustomerEntity implements ICustomer {
  constructor(
    public customerId: string,
    public name: string,
    public address: string,
    public email: string,
    public phoneNumber: string,
    public accountBalance: number = 0,
    public permissions: string[] = ['shop', 'orders', 'profile'],
    public passwordHash?: string,
  ) {}

  static fromUserAccount(user: UserAccount): CustomerEntity {
    return new CustomerEntity(
      user.userId,
      user.name,
      user.address,
      user.email,
      user.phoneNumber,
      user.accountBalance ?? 0,
      user.permissions ?? ['shop', 'orders', 'profile'],
      user.passwordHash,
    );
  }

  // Handles the to user account logic.
  toUserAccount(): UserAccount {
    return {
      userId: this.customerId,
      role: AccountRole.Customer,
      name: this.name,
      address: this.address,
      email: this.email,
      phoneNumber: this.phoneNumber,
      accountBalance: this.accountBalance,
      permissions: this.permissions,
      passwordHash: this.passwordHash,
    };
  }
}

export class StaffEntity implements IStaff {
  constructor(
    public employeeId: string,
    public name: string,
    public address: string,
    public email: string,
    public phoneNumber: string,
    public role: StaffRole = StaffRole.Staff,
    public permissions: string[] = ['dashboard', 'inventory', 'orders'],
    public passwordHash?: string,
  ) {}

  static fromUserAccount(user: UserAccount): StaffEntity {
    const role = user.role === AccountRole.Manager ? StaffRole.Manager : StaffRole.Staff;
    return new StaffEntity(
      user.userId,
      user.name,
      user.address,
      user.email,
      user.phoneNumber,
      role,
      role === StaffRole.Manager ? ['dashboard', 'manage-books', 'inventory', 'orders'] : ['dashboard', 'inventory', 'orders'],
      user.passwordHash,
    );
  }

  // Handles the to user account logic.
  toUserAccount(): UserAccount {
    return {
      userId: this.employeeId,
      role: this.role === StaffRole.Manager ? AccountRole.Manager : AccountRole.Staff,
      name: this.name,
      address: this.address,
      email: this.email,
      phoneNumber: this.phoneNumber,
      permissions: this.permissions,
      passwordHash: this.passwordHash,
    };
  }
}
