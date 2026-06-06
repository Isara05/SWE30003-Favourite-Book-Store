import { ConflictException } from '@nestjs/common';

export class StockLevelConflictException extends ConflictException {
  constructor(isbn: string, requested: number, available: number) {
    super(`Stock level conflict for ${isbn}: requested ${requested}, available ${available}.`);
  }
}