"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CatalogService = void 0;
const common_1 = require("@nestjs/common");
const database_proxy_service_1 = require("../database/database-proxy.service");
const domain_1 = require("../domain");
const create_book_dto_1 = require("./dto/create-book.dto");
let CatalogService = class CatalogService {
    db;
    constructor(db) {
        this.db = db;
    }
    async onModuleInit() {
        await domain_1.Catalog.init(this.db);
    }
    async listBooks(filters) {
        const catalog = domain_1.Catalog.getInstance();
        const limit = Math.max(1, Number(filters.limit ?? 250) || 250);
        const offset = Math.max(0, Number(filters.offset ?? 0) || 0);
        if (filters.author || filters.genre || filters.search || filters.format || filters.condition || filters.priceMin || filters.priceMax) {
            const opts = {};
            if (filters.author)
                opts.author = filters.author;
            if (filters.genre)
                opts.genre = filters.genre;
            if (filters.search)
                opts.title = filters.search;
            if (filters.format)
                opts.format = filters.format;
            if (filters.condition)
                opts.condition = filters.condition;
            if (filters.priceMin)
                opts.minPrice = Number(filters.priceMin);
            if (filters.priceMax)
                opts.maxPrice = Number(filters.priceMax);
            const results = await catalog.filterByOptions(opts);
            return results.slice(offset, offset + limit).map((b) => b.toRaw());
        }
        return this.db.getAllBooks(limit, offset);
    }
    async getBook(isbn) {
        try {
            const catalog = domain_1.Catalog.getInstance();
            const normalized = (0, create_book_dto_1.normalizeIsbn)(isbn);
            let b = catalog.findByIsbn(normalized);
            if (!b) {
                b = await catalog.findByIsbnStreaming(normalized);
            }
            if (!b)
                throw new common_1.NotFoundException('Book not found.');
            return b.toRaw();
        }
        catch (error) {
            if (error instanceof Error && error.message.includes('ISBN must be exactly 13 characters')) {
                throw new common_1.BadRequestException(error.message);
            }
            throw error;
        }
    }
    async createBook(input) {
        if (!input.isbn || !input.title || !input.author) {
            throw new common_1.BadRequestException('ISBN, title, and author are required.');
        }
        if (!input.isbn || !input.title || !input.author) {
            throw new common_1.BadRequestException('ISBN, title, and author are required.');
        }
        const catalog = domain_1.Catalog.getInstance();
        let normalizedIsbn;
        try {
            normalizedIsbn = (0, create_book_dto_1.assertIsbn13)(input.isbn);
        }
        catch (error) {
            throw new common_1.BadRequestException(error instanceof Error ? error.message : 'ISBN must be exactly 13 characters.');
        }
        const existing = catalog.findByIsbn(normalizedIsbn);
        if (!existing) {
            const streamed = await catalog.findByIsbnStreaming(normalizedIsbn);
            if (streamed)
                throw new common_1.BadRequestException('A book with that ISBN already exists.');
        }
        else {
            throw new common_1.BadRequestException('A book with that ISBN already exists.');
        }
        const entity = domain_1.BookEntity.fromRaw({
            isbn: normalizedIsbn,
            title: input.title.trim(),
            author: input.author.trim(),
            genre: input.genre?.trim() ?? '',
            format: input.format,
            condition: input.condition,
            price: Number(input.price) || 0,
            stockLevel: Number(input.stockLevel) || 0,
        });
        await this.db.insertBook(entity.toRaw());
        await catalog.reload();
        return entity.toRaw();
    }
    async updateBookDetails(isbn, input) {
        let normalizedIsbn;
        try {
            normalizedIsbn = (0, create_book_dto_1.assertIsbn13)(isbn);
        }
        catch (error) {
            throw new common_1.BadRequestException(error instanceof Error ? error.message : 'ISBN must be exactly 13 characters.');
        }
        if (input.isbn && (0, create_book_dto_1.normalizeIsbn)(input.isbn) !== normalizedIsbn) {
            throw new common_1.BadRequestException('ISBN cannot be changed during update.');
        }
        const current = await this.db.getBookByISBN(normalizedIsbn);
        if (!current) {
            throw new common_1.NotFoundException('Book not found.');
        }
        const updated = domain_1.BookEntity.fromRaw({
            ...current,
            title: input.title?.trim() ?? current.title,
            author: input.author?.trim() ?? current.author,
            genre: input.genre?.trim() ?? current.genre,
            format: input.format ?? current.format,
            condition: input.condition ?? current.condition,
            price: input.price != null ? Number(input.price) : current.price,
            stockLevel: input.stockLevel != null ? Number(input.stockLevel) : current.stockLevel,
        });
        const result = await this.db.updateBookDetails(normalizedIsbn, updated.toRaw());
        if (!result) {
            throw new common_1.NotFoundException('Book not found.');
        }
        await domain_1.Catalog.getInstance().reload();
        return updated.toRaw();
    }
    async updateBookStock(isbn, quantity) {
        if (!Number.isFinite(quantity)) {
            throw new common_1.BadRequestException('Quantity is required.');
        }
        let normalizedIsbn;
        try {
            normalizedIsbn = (0, create_book_dto_1.assertIsbn13)(isbn);
        }
        catch (error) {
            throw new common_1.BadRequestException(error instanceof Error ? error.message : 'ISBN must be exactly 13 characters.');
        }
        const updated = await this.db.updateStockLevel(normalizedIsbn, quantity);
        if (!updated) {
            throw new common_1.NotFoundException('Book not found.');
        }
        await domain_1.Catalog.getInstance().reload();
        return updated;
    }
    async deleteBook(isbn) {
        let normalizedIsbn;
        try {
            normalizedIsbn = (0, create_book_dto_1.assertIsbn13)(isbn);
        }
        catch (error) {
            throw new common_1.BadRequestException(error instanceof Error ? error.message : 'ISBN must be exactly 13 characters.');
        }
        const deleted = await this.db.deleteBook(normalizedIsbn);
        if (!deleted) {
            throw new common_1.NotFoundException('Book not found.');
        }
        await domain_1.Catalog.getInstance().reload();
    }
};
exports.CatalogService = CatalogService;
exports.CatalogService = CatalogService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_proxy_service_1.DatabaseProxyService])
], CatalogService);
//# sourceMappingURL=catalog.service.js.map