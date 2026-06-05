import { Book } from "@/lib/types";
import { Card } from "../atoms/Card";
import { Pill } from "../atoms/Pill";

// Renders the book row section.
export function BookRow({ book }: { book: Book }) {
  return (
    <Card>
      <div className="row" style={{ justifyContent: "space-between" }}>
        <div>
          <div className="card-title">{book.title}</div>
          <div className="card-meta">
            {book.author} • {book.genre}
          </div>
        </div>
        <Pill>{book.condition}</Pill>
      </div>
      <div className="row">
        <span className="card-meta">ISBN: {book.isbn}</span>
        <span className="card-meta">Format: {book.format}</span>
        <span className="card-meta">Stock: {book.stockLevel}</span>
        <span className="card-meta">$ {book.price.toFixed(2)}</span>
      </div>
    </Card>
  );
}
