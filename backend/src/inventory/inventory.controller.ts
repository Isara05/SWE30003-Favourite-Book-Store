import { Body, Controller, Post } from '@nestjs/common';
import { InventoryService } from './inventory.service';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post('stocktake')
  async stocktake(
    @Body() body: { staffId: string; counts: { isbn: string; actual: number }[] },
  ) {
    return this.inventoryService.performStocktake(body.staffId, body.counts);
  }
}
