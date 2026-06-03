import { Controller, Get, Query } from '@nestjs/common';
import { MenuService } from './menu.service';

@Controller('menu')
export class MenuController {
  constructor(private readonly menu: MenuService) {}

  @Get()
  getMenu(@Query('role') role?: string) {
    return this.menu.getMenuForRole(role || 'customer');
  }
}
