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
export declare function normalizeIsbn(isbn: string): string;
export declare function isValidIsbn13(isbn: string): boolean;
export declare function assertIsbn13(isbn: string): string;
