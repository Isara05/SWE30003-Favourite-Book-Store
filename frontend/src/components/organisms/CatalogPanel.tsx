import { Book } from "@/lib/types";
import { SearchBar } from "../molecules/SearchBar";
import { BookRow } from "../molecules/BookRow";

interface CatalogPanelProps {
  search: string;
  onSearchChange: (value: string) => void;
  onSearch: () => void;
  books: Book[];
}

// Renders the catalog panel section.
export function CatalogPanel({ search, onSearchChange, onSearch, books }: CatalogPanelProps) {
  return (
    <section className="panel stack">
      <div>
        <h2 className="section-title">Catalog</h2>
        <p className="muted">Search by title, author, or ISBN.</p>
      </div>
      <SearchBar value={search} onChange={onSearchChange} onSearch={onSearch} />
      <div className="list">
        {books.length === 0 ? <p className="muted">No books found.</p> : null}
        {books.map((book) => (
          <BookRow key={book.isbn} book={book} />
        ))}
      </div>
    </section>
  );
}
