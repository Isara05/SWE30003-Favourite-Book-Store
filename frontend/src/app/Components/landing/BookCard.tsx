import { Button, Card, Tag, Typography } from 'antd';
import { CheckOutlined, PlusOutlined } from '@ant-design/icons';
import { getFormatMeta, getGenreMeta, type Book } from './landing-data';

type BookCardProps = {
  book: Book;
  index: number;
  isAdded: boolean;
  onAddToCart: (book: Book) => void;
};

const { Title, Text } = Typography;

// Renders the book card section.
export function BookCard({ book, index, isAdded, onAddToCart }: BookCardProps) {
  const genreMeta = getGenreMeta(book.genre);
  const formatMeta = getFormatMeta(book.format);

  return (
    <Card
      className="fb-book-card"
      style={{ animationDelay: `${index * 0.07}s` }}
      styles={{ body: { padding: 0 } }}
    >
      <div className="fb-book-cover" style={{ background: `linear-gradient(135deg, ${genreMeta.color} 0%, #ffffff 100%)` }}>
        <span className="fb-book-cover-icon">{genreMeta.icon}</span>
        <span className="fb-book-format-badge" style={{ background: formatMeta.bg, color: formatMeta.text }}>
          {book.format}
        </span>
      </div>
      <div className="fb-book-body">
        <Title level={5} className="fb-book-title" title={book.title}>
          {book.title}
        </Title>
        <Text className="fb-book-author">{book.author}</Text>

        <div className="fb-book-meta-row">
          <Tag color={book.condition === 'New' ? 'green' : 'gold'} style={{ borderRadius: 999 }}>
            {book.condition}
          </Tag>
          <Text className="fb-stock-text">
            <span
              className={`fb-stock-dot ${book.stockLevel > 0 ? 'in-stock' : 'out-stock'}`}
              style={{ background: book.stockLevel > 0 ? '#16a34a' : '#dc2626' }}
            />
            {book.stockLevel > 0 ? `${book.stockLevel} in stock` : 'Out of stock'}
          </Text>
        </div>

        <div className="fb-book-footer-row">
          <Text className="fb-book-price">${book.price.toFixed(2)}</Text>
          <Button
            className="fb-add-btn"
            type="primary"
            shape="circle"
            icon={isAdded ? <CheckOutlined /> : <PlusOutlined />}
            onClick={() => onAddToCart(book)}
            disabled={book.stockLevel <= 0}
            aria-label={`Add ${book.title} to cart`}
          />
        </div>
      </div>
    </Card>
  );
}
