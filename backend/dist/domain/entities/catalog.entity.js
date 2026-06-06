"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Catalog = void 0;
const book_entity_1 = require("./book.entity");
class Catalog {
    db;
    static instance = null;
    pageCache = new Map();
    pageSize = 250;
    constructor(db) {
        this.db = db;
    }
    static async init(db) {
        if (!Catalog.instance) {
            const c = new Catalog(db);
            await c.reload();
            Catalog.instance = c;
        }
        return Catalog.instance;
    }
    static getInstance() {
        if (!Catalog.instance)
            throw new Error('Catalog not initialized. Call Catalog.init(db) first.');
        return Catalog.instance;
    }
    async reload() {
        if (!this.db)
            return;
        this.pageCache.clear();
        const first = await this.getPage(0, this.pageSize);
        if (first)
            this.pageCache.set(0, first);
    }
    getAll() {
        const out = [];
        for (const [, page] of this.pageCache) {
            out.push(...page);
        }
        return out;
    }
    findByIsbn(isbn) {
        for (const [, page] of this.pageCache) {
            const found = page.find((b) => b.isbn === isbn);
            if (found)
                return found;
        }
        return undefined;
    }
    isAvailable(isbn) {
        const b = this.findByIsbn(isbn);
        return !!b && b.stockLevel > 0;
    }
    search(opts) {
        return this.getAll().filter((b) => {
            if (opts.author && !b.author.toLowerCase().includes(opts.author.toLowerCase()))
                return false;
            if (opts.genre && b.genre.toLowerCase() !== opts.genre.toLowerCase())
                return false;
            if (opts.title && !b.title.toLowerCase().includes(opts.title.toLowerCase()))
                return false;
            if (opts.minPrice != null && b.price < opts.minPrice)
                return false;
            if (opts.maxPrice != null && b.price > opts.maxPrice)
                return false;
            return true;
        });
    }
    async updateBook(book) {
        for (const [p, page] of this.pageCache) {
            const idx = page.findIndex((b) => b.isbn === book.isbn);
            if (idx >= 0)
                page[idx] = book;
            this.pageCache.set(p, page);
        }
        if (this.db) {
            const allRaw = await this.db.getBooks();
            const existing = allRaw.findIndex((r) => r.isbn === book.isbn);
            if (existing >= 0) {
                allRaw[existing] = book.toRaw();
            }
            else {
                allRaw.push(book.toRaw());
            }
            await this.db.saveBooks(allRaw);
        }
    }
    async getPage(page = 0, limit = this.pageSize) {
        const cached = this.pageCache.get(page);
        if (cached)
            return cached;
        if (!this.db)
            return [];
        const raw = await this.db.executeReader(limit, page * limit);
        const entities = raw.map((r) => book_entity_1.BookEntity.fromRaw(r));
        this.pageCache.set(page, entities);
        return entities;
    }
    async *iteratePages(limit = this.pageSize) {
        let page = 0;
        while (true) {
            const raw = await this.db.executeReader(limit, page * limit);
            if (!raw || raw.length === 0)
                break;
            yield raw.map((r) => book_entity_1.BookEntity.fromRaw(r));
            if (raw.length < limit)
                break;
            page += 1;
        }
    }
    async findByIsbnStreaming(isbn) {
        const cached = this.findByIsbn(isbn);
        if (cached)
            return cached;
        if (!this.db)
            return undefined;
        let page = 0;
        while (true) {
            const raw = await this.db.executeReader(this.pageSize, page * this.pageSize);
            if (!raw || raw.length === 0)
                break;
            const found = raw.find((r) => r.isbn === isbn);
            if (found)
                return book_entity_1.BookEntity.fromRaw(found);
            if (raw.length < this.pageSize)
                break;
            page += 1;
        }
        return undefined;
    }
    async filterByOptions(opts) {
        const out = [];
        for await (const page of this.iteratePages(this.pageSize)) {
            for (const rawEntity of page) {
                if (opts.author && !rawEntity.author.toLowerCase().includes(opts.author.toLowerCase()))
                    continue;
                if (opts.genre && rawEntity.genre.toLowerCase() !== opts.genre.toLowerCase())
                    continue;
                if (opts.title && !rawEntity.title.toLowerCase().includes(opts.title.toLowerCase()))
                    continue;
                if (opts.format && rawEntity.format.toLowerCase() !== opts.format.toLowerCase())
                    continue;
                if (opts.condition && rawEntity.condition.toLowerCase() !== opts.condition.toLowerCase())
                    continue;
                if (opts.minPrice != null && rawEntity.price < opts.minPrice)
                    continue;
                if (opts.maxPrice != null && rawEntity.price > opts.maxPrice)
                    continue;
                out.push(rawEntity);
            }
        }
        return out;
    }
    async filterByAuthor(author) {
        return this.filterByOptions({ author });
    }
    async filterByGenre(genre) {
        return this.filterByOptions({ genre });
    }
    async filterByPriceRange(min, max) {
        return this.filterByOptions({ minPrice: min, maxPrice: max });
    }
}
exports.Catalog = Catalog;
//# sourceMappingURL=catalog.entity.js.map