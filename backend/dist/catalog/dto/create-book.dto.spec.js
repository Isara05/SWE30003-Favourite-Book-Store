"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const create_book_dto_1 = require("./create-book.dto");
describe('ISBN validation helpers', () => {
    it('normalizes ISBN strings', () => {
        expect((0, create_book_dto_1.normalizeIsbn)('978-0-306-40615-7')).toBe('9780306406157');
    });
    it('accepts exactly 13 characters after normalization', () => {
        expect((0, create_book_dto_1.isValidIsbn13)('9780306406157')).toBe(true);
        expect((0, create_book_dto_1.isValidIsbn13)('978-030-640-6157')).toBe(true);
    });
    it('rejects values that are not 13 characters long', () => {
        expect((0, create_book_dto_1.isValidIsbn13)('123456789012')).toBe(false);
        expect((0, create_book_dto_1.isValidIsbn13)('12345678901234')).toBe(false);
        expect(() => (0, create_book_dto_1.assertIsbn13)('123456789012')).toThrow('ISBN must be exactly 13 characters.');
    });
});
//# sourceMappingURL=create-book.dto.spec.js.map