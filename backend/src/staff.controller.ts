import { Controller, Get, Param } from '@nestjs/common';
import { StaffService } from './staff/staff.service';

@Controller('staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Get()
  // Loads the staff list.
  async listStaff() {
    return this.staffService.listStaff();
  }

  @Get(':id')
  async getStaff(@Param('id') id: string) {
    return this.staffService.getStaff(id);
  }
}
