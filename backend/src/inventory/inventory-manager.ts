import { DatabaseProxyService } from '../database/database-proxy.service';
import { InventoryVariance } from '../domain/models';
import { NotFoundException, BadRequestException } from '@nestjs/common';

interface StocktakeItem {
  isbn: string;
  actual: number;
}

export class InventoryManager {
  constructor(private readonly db: DatabaseProxyService) {}

  // Runs the stocktake process.
  async performStocktake(staffId: string, counts: StocktakeItem[]): Promise<InventoryVariance[]> {
    // Handles the if logic.
    if (!staffId) {
      throw new BadRequestException('Staff ID is required.');
    }
    const staff = await this.db.getStaff();
    const member = staff.find((item) => item.employeeId === staffId);
    // Handles the if logic.
    if (!member) {
      throw new NotFoundException('Staff member not found.');
    }

    const books = await this.db.getBooks();
    const variances: InventoryVariance[] = counts.map((count) => {
      const book = books.find((entry) => entry.isbn === count.isbn);
      // Handles the if logic.
      if (!book) {
        throw new NotFoundException(`Book ${count.isbn} not found.`);
      }
      // Handles the if logic.
      if (count.actual < 0) {
        throw new BadRequestException('Actual stock cannot be negative.');
      }
      const variance = count.actual - book.stockLevel;
      const expected = book.stockLevel;
      book.stockLevel = count.actual;
      return {
        isbn: book.isbn,
        expected,
        actual: count.actual,
        difference: variance,
      } as InventoryVariance;
    });

    await this.db.saveBooks(books);

    const nonZeroVariances = variances.filter((item) => item.difference !== 0);
    // Handles the if logic.
    if (nonZeroVariances.length > 0) {
      await Promise.all(nonZeroVariances.map((item) => this.db.insertInventoryAudit({
        auditId: this.db.generateId('AUD'),
        staffId,
        isbn: item.isbn,
        expected: item.expected,
        actual: item.actual,
        difference: item.difference,
        recordedAt: new Date().toISOString(),
      })));
    }

    return variances;
  }
}
