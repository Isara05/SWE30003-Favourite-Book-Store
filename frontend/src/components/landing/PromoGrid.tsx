import { Card, Typography } from 'antd';

type Promo = {
  icon: string;
  title: string;
  desc: string;
  bg: string;
  label: string;
  descColor: string;
};

const { Title, Text, Paragraph } = Typography;

const PROMOS: Promo[] = [
  {
    icon: '✨',
    title: 'New arrivals weekly',
    desc: 'Bestseller highlights and local author features, curated every Monday by our Hawthorn team.',
    bg: 'linear-gradient(135deg, #fefce8 0%, #fde68a 100%)',
    label: '#854d0e',
    descColor: '#a16207',
  },
  {
    icon: '♻️',
    title: 'Trade-in program',
    desc: 'Bring in your used books and earn store credit applied instantly at checkout.',
    bg: 'linear-gradient(135deg, #f0fdf4 0%, #bbf7d0 100%)',
    label: '#14532d',
    descColor: '#15803d',
  },
  {
    icon: '💳',
    title: 'Instalment plans',
    desc: 'Split payments for high-value or rare editions into manageable monthly instalments.',
    bg: 'linear-gradient(135deg, #eff6ff 0%, #c7d2fe 100%)',
    label: '#1e3a8a',
    descColor: '#1d4ed8',
  },
];

// Renders the promo grid section.
export function PromoGrid() {
  return (
    <section className="fb-promo-grid fb-reveal reveal-on-scroll">
      {PROMOS.map((promo) => (
        <Card key={promo.title} className="fb-promo-card" styles={{ body: { padding: 22 } }}>
          <div className="fb-promo-icon" style={{ background: promo.bg }}>
            {promo.icon}
          </div>
          <Text className="fb-promo-label" style={{ color: promo.label }}>
            {promo.title}
          </Text>
          <Title level={4} className="fb-promo-title">
            {promo.title}
          </Title>
          <Paragraph className="fb-promo-desc" style={{ color: promo.descColor }}>
            {promo.desc}
          </Paragraph>
        </Card>
      ))}
    </section>
  );
}
