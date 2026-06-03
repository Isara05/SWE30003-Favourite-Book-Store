export type BookFormat = 'Paperback' | 'Hardcover' | 'Ebook';
export type BookCondition = 'New' | 'Used';

export type Book = {
  isbn: string;
  title: string;
  author: string;
  genre: string;
  format: BookFormat;
  condition: BookCondition;
  price: number;
  stockLevel: number;
};

export type CartItem = Book & { quantity: number };

export const DEFAULT_GENRE_ORDER = ['Kids', 'Comics', 'Fiction', 'Science', 'Mystery', 'Fantasy'] as const;

export const GENRE_META: Record<
  string,
  { icon: string; color: string; text: string; badge: string; promo: string }
> = {
  Kids: { icon: '🧸', color: '#fff7ed', text: '#9a3412', badge: 'orange', promo: '#fef3c7' },
  Comics: { icon: '💥', color: '#fdf4ff', text: '#7e22ce', badge: 'purple', promo: '#f5d0fe' },
  Fiction: { icon: '📖', color: '#eff6ff', text: '#1d4ed8', badge: 'blue', promo: '#dbeafe' },
  Science: { icon: '🔬', color: '#f0fdf4', text: '#166534', badge: 'green', promo: '#dcfce7' },
  Mystery: { icon: '🕵️', color: '#fff7ed', text: '#c2410c', badge: 'volcano', promo: '#ffedd5' },
  Fantasy: { icon: '🪄', color: '#fff1f2', text: '#be123c', badge: 'magenta', promo: '#ffe4e6' },
};

export const FORMAT_META: Record<BookFormat, { bg: string; text: string }> = {
  Paperback: { bg: '#e1f5ee', text: '#085041' },
  Hardcover: { bg: '#e6f1fb', text: '#0c447c' },
  Ebook: { bg: '#eeedfe', text: '#3c3489' },
};

// Finds the genre meta details.
export function getGenreMeta(genre: string) {
  return (
    GENRE_META[genre] ?? {
      icon: '📚',
      color: '#f8fafc',
      text: '#334155',
      badge: 'default',
      promo: '#e2e8f0',
    }
  );
}

// Finds the format meta details.
export function getFormatMeta(format: string) {
  if (format === 'Paperback') return FORMAT_META.Paperback;
  if (format === 'Hardcover') return FORMAT_META.Hardcover;
  return FORMAT_META.Ebook;
}

// Cleans up the format value before it is used.
export function normalizeFormat(format: string): BookFormat {
  return format === 'E-book' ? 'Ebook' : (format as BookFormat);
}

// Cleans up the book value before it is used.
export function normalizeBook(book: {
  isbn: string;
  title: string;
  author: string;
  genre: string;
  format: string;
  condition: string;
  price: number;
  stockLevel: number;
}): Book {
  return {
    isbn: book.isbn,
    title: book.title,
    author: book.author,
    genre: book.genre,
    format: normalizeFormat(book.format),
    condition: book.condition as BookCondition,
    price: Number(book.price),
    stockLevel: Number(book.stockLevel),
  };
}

// Handles the sort genres logic.
export function sortGenres(genres: string[]): string[] {
  return [...genres].sort((left, right) => {
    const leftIndex = DEFAULT_GENRE_ORDER.indexOf(left as (typeof DEFAULT_GENRE_ORDER)[number]);
    const rightIndex = DEFAULT_GENRE_ORDER.indexOf(right as (typeof DEFAULT_GENRE_ORDER)[number]);

    if (leftIndex !== -1 && rightIndex !== -1) return leftIndex - rightIndex;
    if (leftIndex !== -1) return -1;
    if (rightIndex !== -1) return 1;
    return left.localeCompare(right);
  });
}
