import { Book as IBook } from '../models';
import { BookFormat, BookCondition } from '../enums';
export declare class BookEntity implements IBook {
    isbn: string;
    title: string;
    author: string;
    genre: string;
    format: BookFormat;
    condition: BookCondition;
    source: 'New' | 'Used';
    price: number;
    stockLevel: number;
    constructor(isbn: string, title: string, author: string, genre: string, format: BookFormat, condition: BookCondition, source: "New" | "Used" | undefined, price: number, stockLevel: number);
    static calculateUsedBookPrice(price: number, markdownRate?: number): number;
    markAsUsed(markdownRate?: number): void;
    static fromRaw(raw: Partial<IBook> & {
        isbn: string;
    }): BookEntity;
    toRaw(): IBook;
    isLowStock(threshold?: number): boolean;
    decreaseStock(quantity: number): void;
    increaseStock(quantity: number): void;
}
