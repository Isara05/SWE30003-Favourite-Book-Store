import { Input, Select, Space } from 'antd';
import type { BookFormat } from './landing-data';

type LandingFiltersProps = {
  search: string;
  genre?: string;
  format?: string;
  genreOptions: readonly string[];
  onSearchChange: (value: string) => void;
  onGenreChange: (value?: string) => void;
  onFormatChange: (value?: string) => void;
  resultCount: number;
};

// Renders the landing filters section.
export function LandingFilters({
  search,
  genre,
  format,
  genreOptions,
  onSearchChange,
  onGenreChange,
  onFormatChange,
  resultCount,
}: LandingFiltersProps) {
  return (
    <section className="fb-filter-bar fb-reveal reveal-on-scroll" id="catalog">
      <div className="fb-filter-panel">
        <span className="fb-filter-label">Filter</span>
        <Input.Search
          placeholder="Search title, author, or ISBN..."
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          allowClear
          style={{ width: 320 }}
        />
        <Select
          placeholder="All genres"
          allowClear
          value={genre}
          onChange={onGenreChange}
          style={{ width: 160 }}
          options={genreOptions.map((item) => ({ label: item, value: item }))}
        />
        <Select
          placeholder="All formats"
          allowClear
          value={format}
          onChange={onFormatChange}
          style={{ width: 160 }}
          options={['Paperback', 'Hardcover', 'Ebook'].map((item) => ({ label: item, value: item as BookFormat }))}
        />
        <span className="fb-result-count">
          {resultCount} result{resultCount !== 1 ? 's' : ''}
        </span>
      </div>
    </section>
  );
}
