"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryManager = void 0;
const common_1 = require("@nestjs/common");
class InventoryManager {
    db;
    constructor(db) {
        this.db = db;
    }
    async performStocktake(staffId, counts) {
        if (!staffId) {
            throw new common_1.BadRequestException('Staff ID is required.');
        }
        const staff = await this.db.getStaff();
        const member = staff.find((item) => item.employeeId === staffId);
        if (!member) {
            throw new common_1.NotFoundException('Staff member not found.');
        }
        const books = await this.db.getBooks();
        const variances = counts.map((count) => {
            const book = books.find((entry) => entry.isbn === count.isbn);
            if (!book) {
                throw new common_1.NotFoundException(`Book ${count.isbn} not found.`);
            }
            if (count.actual < 0) {
                throw new common_1.BadRequestException('Actual stock cannot be negative.');
            }
            const variance = count.actual - book.stockLevel;
            const expected = book.stockLevel;
            book.stockLevel = count.actual;
            return {
                isbn: book.isbn,
                expected,
                actual: count.actual,
                difference: variance,
            };
        });
        await this.db.saveBooks(books);
        const nonZeroVariances = variances.filter((item) => item.difference !== 0);
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
exports.InventoryManager = InventoryManager;
//# sourceMappingURL=inventory-manager.js.map