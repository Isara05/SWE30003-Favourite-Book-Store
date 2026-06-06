import { Injectable } from '@nestjs/common';
import { AccountRole } from '../domain/enums';

@Injectable()
export class MenuService {
  // Finds the menu for role details.
  getMenuForRole(role: AccountRole | string) {
    const r = typeof role === 'string' ? (role as string).toLowerCase() : AccountRole[role];
    // Handles the switch logic.
    switch (r) {
      case 'manager':
      case AccountRole.Manager:
        return [
          { id: 'dashboard', label: 'Dashboard' },
          { id: 'manage-books', label: 'Manage Books' },
          { id: 'inventory', label: 'Inventory' },
          { id: 'orders', label: 'Orders' },
        ];
      case 'staff':
      case AccountRole.Staff:
        return [
          { id: 'dashboard', label: 'Dashboard' },
          { id: 'inventory', label: 'Inventory' },
          { id: 'orders', label: 'Orders' },
        ];
      default:
        return [
          { id: 'shop', label: 'Shop' },
          { id: 'orders', label: 'My Orders' },
          { id: 'profile', label: 'Profile' },
        ];
    }
  }
}
