import { assertIsbn13, isValidIsbn13, normalizeIsbn } from './create-book.dto';

describe('ISBN validation helpers', () => {
  it('normalizes ISBN strings', () => {
    expect(normalizeIsbn('978-0-306-40615-7')).toBe('9780306406157');
  });

  it('accepts exactly 13 characters after normalization', () => {
    expect(isValidIsbn13('9780306406157')).toBe(true);
    expect(isValidIsbn13('978-030-640-6157')).toBe(true);
  });

  it('rejects values that are not 13 characters long', () => {
    expect(isValidIsbn13('123456789012')).toBe(false);
    expect(isValidIsbn13('12345678901234')).toBe(false);
    expect(() => assertIsbn13('123456789012')).toThrow('ISBN must be exactly 13 characters.');
  });
});