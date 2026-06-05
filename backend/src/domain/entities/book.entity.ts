import { Book as IBook } from '../models';
import { BookFormat, BookCondition } from '../enums';

export class BookEntity implements IBook {
  constructor(
    public isbn: string,
    public title: string,
    public author: string,
    public genre: string,
    public format: BookFormat,
    public condition: BookCondition,
    public source: 'New' | 'Used' = 'New',
    public price: number,
    public stockLevel: number,
  ) {}

  static calculateUsedBookPrice(price: number, markdownRate = 0.25): number {
    const safeRate = Math.min(Math.max(markdownRate, 0), 0.9);
    return Math.round(price * (1 - safeRate) * 100) / 100;
  }

  // Handles the mark as used logic.
  markAsUsed(markdownRate = 0.25): void {
    this.condition = BookCondition.Used;
    this.source = 'Used';
    this.price = BookEntity.calculateUsedBookPrice(this.price, markdownRate);
  }

  static fromRaw(raw: Partial<IBook> & { isbn: string }): BookEntity {
    return new BookEntity(
      raw.isbn,
      raw.title || '',
      raw.author || '',
      raw.genre || '',
      (raw.format as BookFormat) || BookFormat.Paperback,
      (raw.condition as BookCondition) || BookCondition.New,
      raw.source === 'Used' ? 'Used' : 'New',
      raw.price ?? 0,
      raw.stockLevel ?? 0,
    );
  }

  // Converts the entity back into plain stored data.
  toRaw(): IBook {
    return {
      isbn: this.isbn,
      title: this.title,
      author: this.author,
      genre: this.genre,
      format: this.format,
      condition: this.condition,
      source: this.source,
      price: this.price,
      stockLevel: this.stockLevel,
    };
  }

  // Handles the is low stock logic.
  isLowStock(threshold = 5): boolean {
    return this.stockLevel <= threshold;
  }

  // Handles the decrease stock logic.
  decreaseStock(quantity: number): void {
    if (quantity <= 0) return;
    // Handles the if logic.
    if (quantity > this.stockLevel) {
      throw new Error('Insufficient stock');
    }
    this.stockLevel -= quantity;
  }

  // Handles the increase stock logic.
  increaseStock(quantity: number): void {
    if (quantity <= 0) return;
    this.stockLevel += quantity;
  }
}
