import { Button, Card, Space, Typography } from 'antd';

type LandingHeroProps = {
  onExploreCatalog: () => void;
  onViewServices: () => void;
  bookCount?: number;
  genreCount?: number;
};

const { Title, Paragraph, Text } = Typography;

// Renders the landing hero section.
export function LandingHero({ onExploreCatalog, onViewServices, bookCount, genreCount }: LandingHeroProps) {
  return (
    <section className="fb-hero fb-fade">
      <div className="fb-hero-copy">
        <div className="fb-eyebrow">Hawthorn store · Est. 1998</div>
        <Title className="fb-hero-title">
          Books that feel like <em>a destination</em>
        </Title>
        <Paragraph className="fb-hero-description">
          Discover new releases, used classics, and rare picks across every genre. Real-time
          stock, polished service, and a calm browsing experience built to feel premium.
        </Paragraph>
        <Space className="fb-hero-actions" wrap>
          <Button className="fb-hero-btn" type="primary" onClick={onExploreCatalog}>
            Explore catalog
          </Button>
          <Button className="fb-hero-outline" onClick={onViewServices}>
            Store services
          </Button>
        </Space>
      </div>

      <div className="fb-stats-grid">
        <StatCard className="fb-stat-card-a fb-floating" value={bookCount ? String(bookCount) : '0'} label="Books in catalog" />
        <StatCard className="fb-stat-card-b fb-floating" value="150+" label="Daily transactions" />
        <StatCard className="fb-stat-card-c fb-floating" value={genreCount ? String(genreCount) : '0'} label="Genre collections" />
        <StatCard className="fb-stat-card-d fb-floating" value="24/7" label="Online ordering" />
      </div>
    </section>
  );
}

// Renders the stat card section.
function StatCard({ value, label, className }: { value: string; label: string; className: string }) {
  return (
    <Card className={`fb-stat-card ${className}`}>
      <Text className="fb-stat-value">{value}</Text>
      <Text className="fb-stat-label">{label}</Text>
    </Card>
  );
}
