import { DatabaseProxyService } from '../../database/database-proxy.service';
import { Book as IBook } from '../models';
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

export class Catalog {
  private static instance: Catalog | null = null;
  // page cache: page number -> entities
  private pageCache: Map<number, BookEntity[]> = new Map();
  private pageSize = 250;

  private constructor(private readonly db?: DatabaseProxyService) {}

  static async init(db: DatabaseProxyService) {
    // Handles the if logic.
    if (!Catalog.instance) {
      const c = new Catalog(db);
      await c.reload();
      Catalog.instance = c;
    }
    return Catalog.instance;
  }

  static getInstance(): Catalog {
    if (!Catalog.instance) throw new Error('Catalog not initialized. Call Catalog.init(db) first.');
    return Catalog.instance;
  }

  // Reloads the latest data into memory.
  async reload() {
    if (!this.db) return;
    // Clear cached pages and preload the first page to keep memory bounded
    this.pageCache.clear();
    const first = await this.getPage(0, this.pageSize);
    if (first) this.pageCache.set(0, first);
  }

  /**
   * Returns concatenation of cached pages only. This is intentionally bounded by
   * the pages currently loaded into memory. To traverse the full dataset use
   * getPage or iteratePages.
   */
  getAll(): BookEntity[] {
    const out: BookEntity[] = [];
    // Handles the for logic.
    for (const [, page] of this.pageCache) {
      out.push(...page);
    }
    return out;
  }

  // Finds the matching by isbn record.
  findByIsbn(isbn: string): BookEntity | undefined {
    // First search cached pages
    for (const [, page] of this.pageCache) {
      const found = page.find((b) => b.isbn === isbn);
      if (found) return found;
    }
    // If not in cache, perform a streaming scan across pages without caching all pages
    return undefined; // call site may trigger a loader if necessary
  }

  // Handles the is available logic.
  isAvailable(isbn: string): boolean {
    const b = this.findByIsbn(isbn);
    return !!b && b.stockLevel > 0;
  }

  // Searches the list using the selected filters.
  search(opts: BookSearchOptions): BookEntity[] {
    return this.getAll().filter((b) => {
      if (opts.author && !b.author.toLowerCase().includes(opts.author.toLowerCase())) return false;
      if (opts.genre && b.genre.toLowerCase() !== opts.genre.toLowerCase()) return false;
      if (opts.title && !b.title.toLowerCase().includes(opts.title.toLowerCase())) return false;
      if (opts.minPrice != null && b.price < opts.minPrice) return false;
      if (opts.maxPrice != null && b.price > opts.maxPrice) return false;
      return true;
    });
  }

  // Updates the book details.
  async updateBook(book: BookEntity) {
    // Update local cached pages where present
    for (const [p, page] of this.pageCache) {
      const idx = page.findIndex((b) => b.isbn === book.isbn);
      if (idx >= 0) page[idx] = book;
      this.pageCache.set(p, page);
    }

    // Persist authoritative full dataset via the database proxy
    if (this.db) {
      const allRaw = await this.db.getBooks();
      const existing = allRaw.findIndex((r) => r.isbn === book.isbn);
      // Handles the if logic.
      if (existing >= 0) {
        allRaw[existing] = book.toRaw();
      } else {
        allRaw.push(book.toRaw());
      }
      await this.db.saveBooks(allRaw);
    }
  }

  /**
   * Fetches a page from the database or cache.
   */
  async getPage(page = 0, limit = this.pageSize): Promise<BookEntity[]> {
    const cached = this.pageCache.get(page);
    if (cached) return cached;
    if (!this.db) return [];
    const raw = await this.db.executeReader(limit, page * limit);
    const entities = raw.map((r: IBook) => BookEntity.fromRaw(r));
    this.pageCache.set(page, entities);
    return entities;
  }

  /**
   * Iterates pages sequentially. Useful for streaming scans without loading
   * the entire dataset into memory at once. Caller should break when done.
   */
  async *iteratePages(limit = this.pageSize) {
    let page = 0;
    // Handles the while logic.
    while (true) {
      const raw = await this.db!.executeReader(limit, page * limit);
      if (!raw || raw.length === 0) break;
      yield raw.map((r: IBook) => BookEntity.fromRaw(r));
      if (raw.length < limit) break;
      page += 1;
    }
  }

  /**
   * Streaming lookup for an ISBN without populating the cache permanently.
   */
  async findByIsbnStreaming(isbn: string): Promise<BookEntity | undefined> {
    // search cached pages first
    const cached = this.findByIsbn(isbn);
    if (cached) return cached;
    if (!this.db) return undefined;
    let page = 0;
    // Handles the while logic.
    while (true) {
      const raw = await this.db.executeReader(this.pageSize, page * this.pageSize);
      if (!raw || raw.length === 0) break;
      const found = raw.find((r) => r.isbn === isbn);
      if (found) return BookEntity.fromRaw(found);
      if (raw.length < this.pageSize) break;
      page += 1;
    }
    return undefined;
  }

  /**
   * Stream and filter pages by the provided search options. This scans the
   * dataset page-by-page and returns the matching entities without caching
   * every page in memory.
   */
  async filterByOptions(opts: BookSearchOptions): Promise<BookEntity[]> {
    const out: BookEntity[] = [];
    for await (const page of this.iteratePages(this.pageSize)) {
      // Handles the for logic.
      for (const rawEntity of page) {
        if (opts.author && !rawEntity.author.toLowerCase().includes(opts.author.toLowerCase())) continue;
        if (opts.genre && rawEntity.genre.toLowerCase() !== opts.genre.toLowerCase()) continue;
        if (opts.title && !rawEntity.title.toLowerCase().includes(opts.title.toLowerCase())) continue;
        if (opts.format && rawEntity.format.toLowerCase() !== opts.format.toLowerCase()) continue;
        if (opts.condition && rawEntity.condition.toLowerCase() !== opts.condition.toLowerCase()) continue;
        if (opts.minPrice != null && rawEntity.price < opts.minPrice) continue;
        if (opts.maxPrice != null && rawEntity.price > opts.maxPrice) continue;
        out.push(rawEntity);
      }
    }
    return out;
  }

  // Filters the list using the selected options.
  async filterByAuthor(author: string): Promise<BookEntity[]> {
    return this.filterByOptions({ author });
  }

  // Filters the list using the selected options.
  async filterByGenre(genre: string): Promise<BookEntity[]> {
    return this.filterByOptions({ genre });
  }

  // Filters the list using the selected options.
  async filterByPriceRange(min?: number, max?: number): Promise<BookEntity[]> {
    return this.filterByOptions({ minPrice: min, maxPrice: max });
  }
}
