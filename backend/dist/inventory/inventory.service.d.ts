import { DatabaseProxyService } from '../database/database-proxy.service';
import { InventoryVariance } from '../domain/models';
interface StocktakeItem {
    isbn: string;
    actual: number;
}
export declare class InventoryService {
    private readonly db;
    constructor(db: DatabaseProxyService);
    performStocktake(staffId: string, counts: StocktakeItem[]): Promise<InventoryVariance[]>;
}
export {};
