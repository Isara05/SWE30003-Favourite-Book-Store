import { CatalogService } from './catalog.service';
import type { CreateBookDto } from './dto/create-book.dto';
export declare class CatalogController {
    private readonly catalogService;
    constructor(catalogService: CatalogService);
    listBooks(search?: string, genre?: string, author?: string, format?: string, condition?: string, limit?: string, offset?: string): Promise<import("../domain").Book[]>;
    getBook(isbn: string): Promise<import("../domain").Book>;
    createBook(body: CreateBookDto, request: {
        user: {
            role: string;
        };
    }): Promise<import("../domain").Book>;
    updateBook(isbn: string, body: Partial<CreateBookDto>): Promise<import("../domain").Book>;
    updateStock(isbn: string, body: {
        quantity: number;
    }): Promise<import("../domain").Book>;
    deleteBook(isbn: string): Promise<{
        deleted: boolean;
        isbn: string;
    }>;
}
