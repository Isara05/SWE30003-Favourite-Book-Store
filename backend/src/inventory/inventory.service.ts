import { Injectable } from '@nestjs/common';
import { DatabaseProxyService } from '../database/database-proxy.service';
import { InventoryManager } from './inventory-manager';
import { InventoryVariance } from '../domain/models';

interface StocktakeItem {
  isbn: string;
  actual: number;
}

@Injectable()
export class InventoryService {
  constructor(private readonly db: DatabaseProxyService) {}

  // Runs the stocktake process.
  async performStocktake(staffId: string, counts: StocktakeItem[]): Promise<InventoryVariance[]> {
    const manager = new InventoryManager(this.db);
    return manager.performStocktake(staffId, counts);
  }
}
