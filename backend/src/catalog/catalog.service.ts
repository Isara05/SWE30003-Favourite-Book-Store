import { BadRequestException, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { DatabaseProxyService } from '../database/database-proxy.service';
import { Book } from '../domain/models';
import type { CreateBookDto } from './dto/create-book.dto';
import { Catalog, BookEntity } from '../domain';
import { assertIsbn13, normalizeIsbn } from './dto/create-book.dto';

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

@Injectable()
export class CatalogService implements OnModuleInit {
  constructor(private readonly db: DatabaseProxyService) {}

  // Handles the on module init logic.
  async onModuleInit() {
    await Catalog.init(this.db);
  }

  // Loads the books list.
  async listBooks(filters: BookFilters): Promise<Book[]> {
    const catalog = Catalog.getInstance();
    const limit = Math.max(1, Number(filters.limit ?? 250) || 250);
    const offset = Math.max(0, Number(filters.offset ?? 0) || 0);
    // If any search/filtering parameters are present, perform a streaming
    // filter so we scan pages without loading the whole dataset into memory.
    if (filters.author || filters.genre || filters.search || filters.format || filters.condition || filters.priceMin || filters.priceMax) {
      const opts: any = {};
      if (filters.author) opts.author = filters.author;
      if (filters.genre) opts.genre = filters.genre;
      if (filters.search) opts.title = filters.search;
      if (filters.format) opts.format = filters.format;
      if (filters.condition) opts.condition = filters.condition;
      if (filters.priceMin) opts.minPrice = Number(filters.priceMin);
      if (filters.priceMax) opts.maxPrice = Number(filters.priceMax);
      const results = await catalog.filterByOptions(opts);
      return results.slice(offset, offset + limit).map((b) => b.toRaw());
    }

    // No filters: return a paginated chunk using LIMIT/OFFSET semantics.
    return this.db.getAllBooks(limit, offset);
  }

  // Finds the book details.
  async getBook(isbn: string): Promise<Book> {
    try {
      const catalog = Catalog.getInstance();
      const normalized = normalizeIsbn(isbn);
      let b = catalog.findByIsbn(normalized);
      // Handles the if logic.
      if (!b) {
        // attempt a streaming lookup across pages without populating full cache
        b = await catalog.findByIsbnStreaming(normalized);
      }
      if (!b) throw new NotFoundException('Book not found.');
      return b.toRaw();
    } catch (error) {
      if (error instanceof Error && error.message.includes('ISBN must be exactly 13 characters')) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  // Creates a new book record.
  async createBook(input: CreateBookDto): Promise<Book> {
    // Handles the if logic.
    if (!input.isbn || !input.title || !input.author) {
      throw new BadRequestException('ISBN, title, and author are required.');
    }

    // Handles the if logic.
    if (!input.isbn || !input.title || !input.author) {
      throw new BadRequestException('ISBN, title, and author are required.');
    }

    const catalog = Catalog.getInstance();
    let normalizedIsbn: string;
    try {
      normalizedIsbn = assertIsbn13(input.isbn);
    } catch (error) {
      throw new BadRequestException(error instanceof Error ? error.message : 'ISBN must be exactly 13 characters.');
    }

    const existing = catalog.findByIsbn(normalizedIsbn);
    // Handles the if logic.
    if (!existing) {
      // streaming check to avoid false negatives when catalog is paged
      const streamed = await catalog.findByIsbnStreaming(normalizedIsbn);
      if (streamed) throw new BadRequestException('A book with that ISBN already exists.');
    } else {
      throw new BadRequestException('A book with that ISBN already exists.');
    }

    const entity = BookEntity.fromRaw({
      isbn: normalizedIsbn,
      title: input.title.trim(),
      author: input.author.trim(),
      genre: input.genre?.trim() ?? '',
      format: input.format as any,
      condition: input.condition as any,
      price: Number(input.price) || 0,
      stockLevel: Number(input.stockLevel) || 0,
    });

    await this.db.insertBook(entity.toRaw());
    await catalog.reload();
    return entity.toRaw();
  }

  // Updates the book details details.
  async updateBookDetails(isbn: string, input: Partial<CreateBookDto>): Promise<Book> {
    let normalizedIsbn: string;
    try {
      normalizedIsbn = assertIsbn13(isbn);
    } catch (error) {
      throw new BadRequestException(error instanceof Error ? error.message : 'ISBN must be exactly 13 characters.');
    }
    if (input.isbn && normalizeIsbn(input.isbn) !== normalizedIsbn) {
      throw new BadRequestException('ISBN cannot be changed during update.');
    }

    const current = await this.db.getBookByISBN(normalizedIsbn);
    // Handles the if logic.
    if (!current) {
      throw new NotFoundException('Book not found.');
    }

    const updated = BookEntity.fromRaw({
      ...current,
      title: input.title?.trim() ?? current.title,
      author: input.author?.trim() ?? current.author,
      genre: input.genre?.trim() ?? current.genre,
      format: (input.format as any) ?? current.format,
      condition: (input.condition as any) ?? current.condition,
      price: input.price != null ? Number(input.price) : current.price,
      stockLevel: input.stockLevel != null ? Number(input.stockLevel) : current.stockLevel,
    });

    const result = await this.db.updateBookDetails(normalizedIsbn, updated.toRaw());
    // Handles the if logic.
    if (!result) {
      throw new NotFoundException('Book not found.');
    }

    await Catalog.getInstance().reload();
    return updated.toRaw();
  }

  // Updates the book stock details.
  async updateBookStock(isbn: string, quantity: number): Promise<Book> {
    if (!Number.isFinite(quantity)) {
      throw new BadRequestException('Quantity is required.');
    }
    let normalizedIsbn: string;
    try {
      normalizedIsbn = assertIsbn13(isbn);
    } catch (error) {
      throw new BadRequestException(error instanceof Error ? error.message : 'ISBN must be exactly 13 characters.');
    }
    const updated = await this.db.updateStockLevel(normalizedIsbn, quantity);
    // Handles the if logic.
    if (!updated) {
      throw new NotFoundException('Book not found.');
    }
    await Catalog.getInstance().reload();
    return updated;
  }

  // Deletes the selected book record.
  async deleteBook(isbn: string): Promise<void> {
    let normalizedIsbn: string;
    try {
      normalizedIsbn = assertIsbn13(isbn);
    } catch (error) {
      throw new BadRequestException(error instanceof Error ? error.message : 'ISBN must be exactly 13 characters.');
    }
    const deleted = await this.db.deleteBook(normalizedIsbn);
    // Handles the if logic.
    if (!deleted) {
      throw new NotFoundException('Book not found.');
    }
    await Catalog.getInstance().reload();
  }
}
