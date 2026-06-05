import { OnModuleInit } from '@nestjs/common';
import { DatabaseProxyService } from '../database/database-proxy.service';
import { Book } from '../domain/models';
import type { CreateBookDto } from './dto/create-book.dto';
interface BookFilters {
    search?: string;
    genre?: string;
    author?: string;
    format?: string;
    condition?: string;
    priceMin?: string;
    priceMax?: string;
    limit?: string;
    offset?: string;
}
export declare class CatalogService implements OnModuleInit {
    private readonly db;
    constructor(db: DatabaseProxyService);
    onModuleInit(): Promise<void>;
    listBooks(filters: BookFilters): Promise<Book[]>;
    getBook(isbn: string): Promise<Book>;
    createBook(input: CreateBookDto): Promise<Book>;
    updateBookDetails(isbn: string, input: Partial<CreateBookDto>): Promise<Book>;
    updateBookStock(isbn: string, quantity: number): Promise<Book>;
    deleteBook(isbn: string): Promise<void>;
}
export {};
