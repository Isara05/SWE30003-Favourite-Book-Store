import { Button, Tag, Typography } from 'antd';
import { ArrowRightOutlined } from '@ant-design/icons';
import { BookCard } from './BookCard';
import { getGenreMeta, type Book } from './landing-data';

type GenreSectionProps = {
  genre: string;
  books: Book[];
  totalCount: number;
  isVisible: boolean;
  onShowAll: (genre: string) => void;
  onAddToCart: (book: Book) => void;
  addedMap: Record<string, boolean>;
};

const { Title, Text } = Typography;

// Renders the genre section section.
export function GenreSection({
  genre,
  books,
  totalCount,
  isVisible,
  onShowAll,
  onAddToCart,
  addedMap,
}: GenreSectionProps) {
  const meta = getGenreMeta(genre);

  return (
    <section
      id={genre.toLowerCase().replace(/\s+/g, '-')}
      data-genre-section
      data-genre={genre}
      className={`fb-genre-section ${isVisible ? 'is-visible' : ''}`}
    >
      <header className="fb-genre-header">
        <div className="fb-genre-heading">
          <span className="fb-genre-icon" style={{ backgroundColor: meta.color, color: meta.text }}>
            {meta.icon}
          </span>
          <div>
            <Title level={4} className="fb-genre-title">
              {genre}
            </Title>
            <Text className="fb-genre-count">{totalCount} titles</Text>
          </div>
          <Tag color={meta.badge} style={{ marginLeft: 4, borderRadius: 999, paddingInline: 10 }}>
            Curated
          </Tag>
        </div>
        <Button type="text" className="fb-see-all" onClick={() => onShowAll(genre)} icon={<ArrowRightOutlined />}>
          See all
        </Button>
      </header>

      <div className="fb-books-grid">
        {books.map((book, index) => (
          <BookCard
            key={book.isbn}
            book={book}
            index={index}
            isAdded={Boolean(addedMap[book.isbn])}
            onAddToCart={onAddToCart}
          />
        ))}
      </div>
    </section>
  );
}
