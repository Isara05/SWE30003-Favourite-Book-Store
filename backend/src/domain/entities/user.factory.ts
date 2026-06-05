import { AccountRole, StaffRole } from '../enums';
import { CustomerEntity, StaffEntity } from './person.entity';

export class UserFactory {
  static createUser(
    roleType: AccountRole | StaffRole | string,
    payload: {
      userId: string;
      name: string;
      address: string;
      email: string;
      phoneNumber: string;
      accountBalance?: number;
      passwordHash?: string;
    },
  ) {
    const normalized = typeof roleType === 'string' ? roleType.toLowerCase() : roleType;

    // Handles the if logic.
    if (normalized === AccountRole.Customer || normalized === 'customer') {
      return new CustomerEntity(
        payload.userId,
        payload.name,
        payload.address,
        payload.email,
        payload.phoneNumber,
        payload.accountBalance ?? 0,
        ['shop', 'orders', 'profile'],
        payload.passwordHash,
      );
    }

    const staffRole = normalized === AccountRole.Manager || normalized === StaffRole.Manager || normalized === 'manager'
      ? StaffRole.Manager
      : StaffRole.Staff;

    return new StaffEntity(
      payload.userId,
      payload.name,
      payload.address,
      payload.email,
      payload.phoneNumber,
      staffRole,
      staffRole === StaffRole.Manager ? ['dashboard', 'manage-books', 'inventory', 'orders'] : ['dashboard', 'inventory', 'orders'],
      payload.passwordHash,
    );
  }
}
