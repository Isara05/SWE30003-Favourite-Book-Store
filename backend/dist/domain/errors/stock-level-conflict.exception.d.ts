import { ConflictException } from '@nestjs/common';
export declare class StockLevelConflictException extends ConflictException {
    constructor(isbn: string, requested: number, available: number);
}
