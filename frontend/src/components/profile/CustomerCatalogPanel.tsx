"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Card, Collapse, Input, Select, Tag, Typography } from "antd";
import { apiGet } from "@/lib/api";
import { getFormatMeta, getGenreMeta, sortGenres, type Book } from "@/components/landing/landing-data";

const { Title, Text } = Typography;

type CustomerCatalogPanelProps = {
  books: Book[];
};

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

// Renders the group books by genre section.
function groupBooksByGenre(books: Book[]) {
  const groups = new Map<string, Book[]>();

  books.forEach((book) => {
    const current = groups.get(book.genre) ?? [];
    groups.set(book.genre, [...current, book]);
  });

  return sortGenres([...groups.keys()]).map((genre) => ({
    genre,
    books: (groups.get(genre) ?? []).slice(0, 3),
  }));
}

// Renders the customer catalog panel section.
export default function CustomerCatalogPanel({ books }: CustomerCatalogPanelProps) {
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState<string | undefined>();
  const [format, setFormat] = useState<string | undefined>();
  const [catalog, setCatalog] = useState<Book[]>(books);
  const [loading, setLoading] = useState(false);
  const [activeKeys, setActiveKeys] = useState<string[]>([]);

  useEffect(() => {
    let active = true;

    // Renders the load catalog section.
    async function loadCatalog() {
      setLoading(true);
      try {
        const query = new URLSearchParams();
        if (search.trim()) query.set('search', search.trim());
        if (genre) query.set('genre', genre);
        if (format) query.set('format', format);

        const path = query.toString() ? `/catalog/books?${query.toString()}` : '/catalog/books';
        const result = await apiGet<CatalogBook[]>(path);
        if (!active) return;
        setCatalog(result.map((book) => ({
          isbn: book.isbn,
          title: book.title,
          author: book.author,
          genre: book.genre,
          format: book.format as Book['format'],
          condition: book.condition as Book['condition'],
          price: Number(book.price),
          stockLevel: Number(book.stockLevel),
        })));
      } finally {
        if (active) setLoading(false);
      }
    }

    loadCatalog();

    return () => {
      active = false;
    };
  }, [search, genre, format]);

  const groupedBooks = useMemo(() => groupBooksByGenre(catalog), [catalog]);
  const genreOptions = useMemo(() => sortGenres([...new Set(books.map((book) => book.genre))]), [books]);

  const collapseItems = groupedBooks.map(({ genre, books: genreBooks }) => {
    const meta = getGenreMeta(genre);

    return {
      key: genre,
      label: (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}>
          <span style={{ width: 40, height: 40, borderRadius: 999, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: meta.color, color: meta.text }}>
            {meta.icon}
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 800, lineHeight: 1.2 }}>{genre}</div>
            <div style={{ color: '#64748b', fontSize: 13 }}>{genreBooks.length} books available</div>
          </div>
          <Tag color={meta.badge} style={{ borderRadius: 999, marginInlineEnd: 0 }}>Section</Tag>
        </div>
      ),
      children: (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, paddingTop: 4 }}>
          {genreBooks.map((book) => {
            const formatMeta = getFormatMeta(book.format);

            return (
              <Card key={book.isbn} style={{ borderRadius: 14 }} styles={{ body: { padding: 16 } }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
                  <div>
                    <div style={{ fontWeight: 700, lineHeight: 1.3 }}>{book.title}</div>
                    <div style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>{book.author}</div>
                  </div>
                  <div style={{ fontWeight: 700 }}>${book.price.toFixed(2)}</div>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                  <Tag color={book.condition === 'New' ? 'green' : 'gold'} style={{ borderRadius: 999 }}>{book.condition}</Tag>
                  <Tag style={{ borderRadius: 999, background: formatMeta.bg, color: formatMeta.text, marginInlineEnd: 0 }}>{book.format}</Tag>
                </div>

                <div style={{ color: '#64748b', fontSize: 13 }}>
                  {book.stockLevel > 0 ? `${book.stockLevel} in stock` : 'Out of stock'}
                </div>
              </Card>
            );
          })}
        </div>
      ),
    };
  });

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <h3 style={{ marginBottom: 6 }}>Books available to buy</h3>
        <div style={{ color: '#64748b' }}>Choose a section to view the books in that category.</div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        <Input.Search
          placeholder="Search title, author, or ISBN..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          allowClear
          style={{ width: 280 }}
        />
        <Select
          placeholder="All genres"
          allowClear
          value={genre}
          onChange={setGenre}
          style={{ width: 180 }}
          options={genreOptions.map((item) => ({ label: item, value: item }))}
        />
        <Select
          placeholder="All formats"
          allowClear
          value={format}
          onChange={setFormat}
          style={{ width: 180 }}
          options={['Paperback', 'Hardcover', 'Ebook'].map((item) => ({ label: item, value: item }))}
        />
        <div style={{ color: '#64748b', alignSelf: 'center' }}>
          {loading ? 'Loading catalog...' : `${catalog.length} result${catalog.length === 1 ? '' : 's'}`}
        </div>
      </div>

      <div style={{ display: 'grid', gap: 16 }}>
        {groupedBooks.length === 0 ? (
          <Card style={{ borderRadius: 12 }}>
            <div style={{ color: '#64748b' }}>No books are available right now.</div>
          </Card>
        ) : null}
        <Collapse
          activeKey={activeKeys}
          onChange={(keys) => setActiveKeys(Array.isArray(keys) ? keys.map(String) : [String(keys)])}
          items={collapseItems}
          ghost
        />
      </div>
    </div>
  );
}