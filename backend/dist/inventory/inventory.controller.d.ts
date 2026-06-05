import { InventoryService } from './inventory.service';
export declare class InventoryController {
    private readonly inventoryService;
    constructor(inventoryService: InventoryService);
    stocktake(body: {
        staffId: string;
        counts: {
            isbn: string;
            actual: number;
        }[];
    }): Promise<import("../domain").InventoryVariance[]>;
}
