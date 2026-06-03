export interface CreateBookDto {
  isbn: string;
  title: string;
  author: string;
  genre: string;
  format: string;
  condition: string;
  price: number;
  stockLevel: number;
}

// Cleans up the isbn value before it is used.
export function normalizeIsbn(isbn: string): string {
  return (isbn ?? '').replace(/[-\s]/g, '').trim();
}

// Handles the is valid isbn13 logic.
export function isValidIsbn13(isbn: string): boolean {
  const value = normalizeIsbn(isbn);
  return value.length === 13;
}

// Checks that the isbn13 value is valid.
export function assertIsbn13(isbn: string): string {
  const value = normalizeIsbn(isbn);
  if (!isValidIsbn13(value)) {
    throw new Error('ISBN must be exactly 13 characters.');
  }
  return value;
}
