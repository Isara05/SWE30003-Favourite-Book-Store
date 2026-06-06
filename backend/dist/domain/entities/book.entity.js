"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookEntity = void 0;
const enums_1 = require("../enums");
class BookEntity {
    isbn;
    title;
    author;
    genre;
    format;
    condition;
    source;
    price;
    stockLevel;
    constructor(isbn, title, author, genre, format, condition, source = 'New', price, stockLevel) {
        this.isbn = isbn;
        this.title = title;
        this.author = author;
        this.genre = genre;
        this.format = format;
        this.condition = condition;
        this.source = source;
        this.price = price;
        this.stockLevel = stockLevel;
    }
    static calculateUsedBookPrice(price, markdownRate = 0.25) {
        const safeRate = Math.min(Math.max(markdownRate, 0), 0.9);
        return Math.round(price * (1 - safeRate) * 100) / 100;
    }
    markAsUsed(markdownRate = 0.25) {
        this.condition = enums_1.BookCondition.Used;
        this.source = 'Used';
        this.price = BookEntity.calculateUsedBookPrice(this.price, markdownRate);
    }
    static fromRaw(raw) {
        return new BookEntity(raw.isbn, raw.title || '', raw.author || '', raw.genre || '', raw.format || enums_1.BookFormat.Paperback, raw.condition || enums_1.BookCondition.New, raw.source === 'Used' ? 'Used' : 'New', raw.price ?? 0, raw.stockLevel ?? 0);
    }
    toRaw() {
        return {
            isbn: this.isbn,
            title: this.title,
            author: this.author,
            genre: this.genre,
            format: this.format,
            condition: this.condition,
            source: this.source,
            price: this.price,
            stockLevel: this.stockLevel,
        };
    }
    isLowStock(threshold = 5) {
        return this.stockLevel <= threshold;
    }
    decreaseStock(quantity) {
        if (quantity <= 0)
            return;
        if (quantity > this.stockLevel) {
            throw new Error('Insufficient stock');
        }
        this.stockLevel -= quantity;
    }
    increaseStock(quantity) {
        if (quantity <= 0)
            return;
        this.stockLevel += quantity;
    }
}
exports.BookEntity = BookEntity;
//# sourceMappingURL=book.entity.js.map