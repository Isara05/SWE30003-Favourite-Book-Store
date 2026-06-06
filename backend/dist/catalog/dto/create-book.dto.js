"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeIsbn = normalizeIsbn;
exports.isValidIsbn13 = isValidIsbn13;
exports.assertIsbn13 = assertIsbn13;
function normalizeIsbn(isbn) {
    return (isbn ?? '').replace(/[-\s]/g, '').trim();
}
function isValidIsbn13(isbn) {
    const value = normalizeIsbn(isbn);
    return value.length === 13;
}
function assertIsbn13(isbn) {
    const value = normalizeIsbn(isbn);
    if (!isValidIsbn13(value)) {
        throw new Error('ISBN must be exactly 13 characters.');
    }
    return value;
}
//# sourceMappingURL=create-book.dto.js.map