import { DatabaseProxyService } from '../../database/database-proxy.service';
import { BookEntity } from './book.entity';
export interface BookSearchOptions {
    author?: string;
    genre?: string;
    title?: string;
    minPrice?: number;
    maxPrice?: number;
    format?: string;
    condition?: string;
}
export declare class Catalog {
    private readonly db?;
    private static instance;
    private pageCache;
    private pageSize;
    private constructor();
    static init(db: DatabaseProxyService): Promise<Catalog>;
    static getInstance(): Catalog;
    reload(): Promise<void>;
    getAll(): BookEntity[];
    findByIsbn(isbn: string): BookEntity | undefined;
    isAvailable(isbn: string): boolean;
    search(opts: BookSearchOptions): BookEntity[];
    updateBook(book: BookEntity): Promise<void>;
    getPage(page?: number, limit?: number): Promise<BookEntity[]>;
    iteratePages(limit?: number): AsyncGenerator<BookEntity[], void, unknown>;
    findByIsbnStreaming(isbn: string): Promise<BookEntity | undefined>;
    filterByOptions(opts: BookSearchOptions): Promise<BookEntity[]>;
    filterByAuthor(author: string): Promise<BookEntity[]>;
    filterByGenre(genre: string): Promise<BookEntity[]>;
    filterByPriceRange(min?: number, max?: number): Promise<BookEntity[]>;
}
