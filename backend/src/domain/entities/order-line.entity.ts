import { OrderLine as IOrderLine } from '../models';

export class OrderLineEntity implements IOrderLine {
  constructor(public isbn: string, public quantity: number, public priceAtSale: number, public lineTotal: number) {}

  static fromRaw(raw: Partial<IOrderLine> & { isbn: string; quantity: number; priceAtSale: number }): OrderLineEntity {
    const lineTotal = raw.lineTotal ?? raw.quantity * raw.priceAtSale;
    return new OrderLineEntity(raw.isbn, raw.quantity, raw.priceAtSale, lineTotal);
  }

  // Converts the entity back into plain stored data.
  toRaw(): IOrderLine {
    return {
      isbn: this.isbn,
      quantity: this.quantity,
      priceAtSale: this.priceAtSale,
      lineTotal: this.lineTotal,
    };
  }
}
