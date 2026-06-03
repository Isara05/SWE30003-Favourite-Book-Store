import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseProxyService } from '../database/database-proxy.service';
import { Staff } from '../domain/models';

@Injectable()
export class StaffService {
  constructor(private readonly db: DatabaseProxyService) {}

  // Loads the staff list.
  async listStaff(): Promise<Staff[]> {
    return this.db.getStaff();
  }

  // Finds the staff details.
  async getStaff(employeeId: string): Promise<Staff> {
    const staff = await this.db.getStaff();
    const member = staff.find((item) => item.employeeId === employeeId);
    // Handles the if logic.
    if (!member) {
      throw new NotFoundException('Staff member not found.');
    }
    return member;
  }
}
