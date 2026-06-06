"use client";

import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { apiGet } from '@/lib/api';
import { LandingFilters } from './LandingFilters';
import { LandingHero } from './LandingHero';
import { GenreSection } from './GenreSection';
import { PromoGrid } from './PromoGrid';
import { ServicesSection } from './ServicesSection';
import { LandingFooter } from './LandingFooter';
import { CartDrawer } from './CartDrawer';
import { normalizeBook, sortGenres, type Book, type CartItem } from './landing-data';
import { readGuestCart, writeGuestCart } from '@/components/profile/cart-storage';

type ScrollState = Record<string, boolean>;

type CatalogBook = {
  isbn: string;
  title: string;
  author: string;
  genre: string;
  format: string;
  condition: string;
  price: number;
  stockLevel: number;
};

type ShopExperienceProps = {
  renderHeader?: (args: { cartCount: number; onOpenCart: () => void }) => ReactNode;
};

// Renders the shop experience section.
export function ShopExperience({ renderHeader }: ShopExperienceProps) {
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState<string | undefined>();
  const [format, setFormat] = useState<string | undefined>();
  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [addedMap, setAddedMap] = useState<Record<string, boolean>>({});
  const [visibleGenres, setVisibleGenres] = useState<ScrollState>({});
  const [books, setBooks] = useState<Book[]>([]);
  const [loadingBooks, setLoadingBooks] = useState(true);

  useEffect(() => {
    setCart(readGuestCart());
  }, []);

  useEffect(() => {
    let active = true;

    // Renders the load books section.
    async function loadBooks() {
      try {
        const query = new URLSearchParams();
        if (search.trim()) query.set('search', search.trim());
        if (genre) query.set('genre', genre);
        if (format) query.set('format', format);

        const path = query.toString() ? `/catalog/books?${query.toString()}` : '/catalog/books';
        const catalog = await apiGet<CatalogBook[]>(path);
        if (!active) return;
        setBooks(catalog.map((book) => normalizeBook(book)));
      } finally {
        if (active) setLoadingBooks(false);
      }
    }

    loadBooks();

    return () => {
      active = false;
    };
  }, [search, genre, format]);

  const filteredBooks = books;

  const genreOptions = useMemo(() => sortGenres([...new Set(books.map((book) => book.genre))]), [books]);

  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);
  const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);

  useEffect(() => {
    writeGuestCart(cart);
  }, [cart]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        setVisibleGenres((current) => {
          const next = { ...current };
          entries.forEach((entry) => {
            // Renders the if section.
            if (entry.isIntersecting) {
              const key = entry.target.getAttribute('data-genre') ?? '';
              if (key) next[key] = true;
            }
          });
          return next;
        });
      },
      { threshold: 0.2 },
    );

    document.querySelectorAll('[data-genre-section], .reveal-on-scroll').forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [filteredBooks]);

  // Renders the add to cart section.
  function addToCart(book: Book) {
    setCart((current) => {
      const existing = current.find((item) => item.isbn === book.isbn);
      // Renders the if section.
      if (existing) {
        return current.map((item) =>
          item.isbn === book.isbn ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }
      return [...current, { ...book, quantity: 1 }];
    });
    setAddedMap((current) => ({ ...current, [book.isbn]: true }));
    window.setTimeout(() => {
      setAddedMap((current) => ({ ...current, [book.isbn]: false }));
    }, 900);
  }

  // Renders the change quantity section.
  function changeQuantity(isbn: string, nextQuantity: number) {
    setCart((current) =>
      current
        .map((item) => (item.isbn === isbn ? { ...item, quantity: nextQuantity } : item))
        .filter((item) => item.quantity > 0),
    );
  }

  // Renders the books for genre section.
  function booksForGenre(currentGenre: string) {
    return filteredBooks.filter((book) => book.genre === currentGenre).slice(0, 4);
  }

  return (
    <>
      {renderHeader ? renderHeader({ cartCount, onOpenCart: () => setCartOpen(true) }) : null}
      <LandingHero
        onExploreCatalog={() => document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })}
        onViewServices={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
        bookCount={books.length}
        genreCount={genreOptions.length}
      />
      <LandingFilters
        search={search}
        genre={genre}
        format={format}
        genreOptions={genreOptions}
        onSearchChange={setSearch}
        onGenreChange={setGenre}
        onFormatChange={setFormat}
        resultCount={filteredBooks.length}
      />

      <main className="fb-catalog" id="catalog">
        {loadingBooks ? (
          <div className="fb-empty fb-reveal reveal-on-scroll">Loading catalog...</div>
        ) : null}

        {genreOptions.map((currentGenre) => {
          const books = booksForGenre(currentGenre);
          if (books.length === 0) return null;
          return (
            <GenreSection
              key={currentGenre}
              genre={currentGenre}
              books={books}
              totalCount={filteredBooks.filter((book) => book.genre === currentGenre).length}
              isVisible={Boolean(visibleGenres[currentGenre])}
              onShowAll={setGenre}
              onAddToCart={addToCart}
              addedMap={addedMap}
            />
          );
        })}

        {!loadingBooks && filteredBooks.length === 0 ? (
          <div className="fb-empty fb-reveal reveal-on-scroll">
            No books match your search. Try adjusting your filters.
          </div>
        ) : null}

        <PromoGrid />
        <ServicesSection />
      </main>

      <LandingFooter />
      <CartDrawer
        open={cartOpen}
        cart={cart}
        cartCount={cartCount}
        cartTotal={cartTotal}
        onClose={() => setCartOpen(false)}
        onIncrement={(isbn, currentQuantity) => changeQuantity(isbn, currentQuantity + 1)}
        onDecrement={(isbn, currentQuantity) => changeQuantity(isbn, currentQuantity - 1)}
        onRemove={(isbn) => setCart((current) => current.filter((item) => item.isbn !== isbn))}
      />
    </>
  );
}
