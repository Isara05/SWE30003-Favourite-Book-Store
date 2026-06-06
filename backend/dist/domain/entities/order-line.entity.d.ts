import { OrderLine as IOrderLine } from '../models';
export declare class OrderLineEntity implements IOrderLine {
    isbn: string;
    quantity: number;
    priceAtSale: number;
    lineTotal: number;
    constructor(isbn: string, quantity: number, priceAtSale: number, lineTotal: number);
    static fromRaw(raw: Partial<IOrderLine> & {
        isbn: string;
        quantity: number;
        priceAtSale: number;
    }): OrderLineEntity;
    toRaw(): IOrderLine;
}
