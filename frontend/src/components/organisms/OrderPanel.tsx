import { Book, Order } from "@/lib/types";
import { Button } from "../atoms/Button";
import { Input } from "../atoms/Input";

interface OrderItem {
  isbn: string;
  quantity: number;
}

interface OrderPanelProps {
  customerId: string;
  staffId: string;
  items: OrderItem[];
  lastOrder?: Order;
  onCustomerChange: (value: string) => void;
  onStaffChange: (value: string) => void;
  onAddItem: (isbn: string, quantity: number) => void;
  onSubmit: () => void;
  books: Book[];
}

// Renders the order panel section.
export function OrderPanel({
  customerId,
  staffId,
  items,
  lastOrder,
  onCustomerChange,
  onStaffChange,
  onAddItem,
  onSubmit,
  books,
}: OrderPanelProps) {
  return (
    <section className="panel stack">
      <div>
        <h2 className="section-title">Create Order</h2>
        <p className="muted">Add order lines using ISBN and quantity.</p>
      </div>
      <div className="row">
        <Input label="Customer ID" value={customerId} onChange={(event) => onCustomerChange(event.target.value)} />
        <Input label="Staff ID (optional)" value={staffId} onChange={(event) => onStaffChange(event.target.value)} />
      </div>
      <OrderItemInput onAddItem={onAddItem} books={books} />
      <div className="stack">
        {items.map((item, index) => (
          <div key={`${item.isbn}-${index}`} className="card-meta">
            {item.isbn} • Qty {item.quantity}
          </div>
        ))}
      </div>
      <Button type="button" onClick={onSubmit}>
        Create Order
      </Button>
      {lastOrder ? (
        <div className="banner">
          Order {lastOrder.orderId} created. Total: $ {lastOrder.totalAmount.toFixed(2)}
        </div>
      ) : null}
    </section>
  );
}

// Renders the order item input section.
function OrderItemInput({ onAddItem, books }: { onAddItem: (isbn: string, quantity: number) => void; books: Book[] }) {
  return (
    <div className="row">
      <select
        className="input"
        defaultValue=""
        onChange={(event) => {
          const isbn = event.target.value;
          // Renders the if section.
          if (isbn) {
            onAddItem(isbn, 1);
            event.currentTarget.value = "";
          }
        }}
      >
        <option value="" disabled>
          Select ISBN to add
        </option>
        {books.map((book) => (
          <option key={book.isbn} value={book.isbn}>
            {book.title} ({book.isbn})
          </option>
        ))}
      </select>
      <span className="muted">Adds quantity 1 per selection.</span>
    </div>
  );
}
