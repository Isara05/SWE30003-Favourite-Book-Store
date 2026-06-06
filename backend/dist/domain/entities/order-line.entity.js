"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderLineEntity = void 0;
class OrderLineEntity {
    isbn;
    quantity;
    priceAtSale;
    lineTotal;
    constructor(isbn, quantity, priceAtSale, lineTotal) {
        this.isbn = isbn;
        this.quantity = quantity;
        this.priceAtSale = priceAtSale;
        this.lineTotal = lineTotal;
    }
    static fromRaw(raw) {
        const lineTotal = raw.lineTotal ?? raw.quantity * raw.priceAtSale;
        return new OrderLineEntity(raw.isbn, raw.quantity, raw.priceAtSale, lineTotal);
    }
    toRaw() {
        return {
            isbn: this.isbn,
            quantity: this.quantity,
            priceAtSale: this.priceAtSale,
            lineTotal: this.lineTotal,
        };
    }
}
exports.OrderLineEntity = OrderLineEntity;
//# sourceMappingURL=order-line.entity.js.map