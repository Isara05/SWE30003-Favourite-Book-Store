import { Typography, Card, Row, Col } from 'antd';
import { RocketOutlined, TeamOutlined, StarOutlined, CheckCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

// Renders the comics section.
export function ComicsSection() {
  return (
    <section id="comics" className="fb-comics">
      <Title level={2} className="fb-comics-title">
        Comics & Graphic Novels
      </Title>

      {/* Comics Highlights */}
      <div className="fb-comics-highlights">
        <Row gutter={[24, 24]} className="fb-comics-cards">
          <Col xs={24} sm={12} lg={6}>
            <Card className="fb-comics-card">
              <RocketOutlined className="fb-comics-icon" />
              <Text strong>Superhero Classics</Text>
              <div className="fb-comics-desc">Marvel, DC, and timeless collections</div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="fb-comics-card">
              <TeamOutlined className="fb-comics-icon" />
              <Text strong>Manga & Anime</Text>
              <div className="fb-comics-desc">Japanese manga in all genres</div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="fb-comics-card">
              <StarOutlined className="fb-comics-icon" />
              <Text strong>Independent Press</Text>
              <div className="fb-comics-desc">Indie & underground graphic novels</div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="fb-comics-card">
              <CheckCircleOutlined className="fb-comics-icon" />
              <Text strong>Rare & Limited</Text>
              <div className="fb-comics-desc">Collectible first editions & variants</div>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Comics Categories */}
      <div className="fb-comics-categories">
        <Row gutter={[32, 32]}>
          <Col xs={24} sm={12} lg={8}>
            <div className="fb-comics-category">
              <Title level={4}>Popular Titles</Title>
              <ul className="fb-comics-links">
                <li><a href="#sandman">The Sandman</a></li>
                <li><a href="#saga">Saga</a></li>
                <li><a href="#dune">Dune Adaptation</a></li>
                <li><a href="#fables">Fables Collection</a></li>
              </ul>
            </div>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <div className="fb-comics-category">
              <Title level={4}>Manga Series</Title>
              <ul className="fb-comics-links">
                <li><a href="#onepiece">One Piece</a></li>
                <li><a href="#demon-slayer">Demon Slayer</a></li>
                <li><a href="#attack-on-titan">Attack on Titan</a></li>
                <li><a href="#jujutsu-kaisen">Jujutsu Kaisen</a></li>
              </ul>
            </div>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <div className="fb-comics-category">
              <Title level={4}>Collectibles</Title>
              <ul className="fb-comics-links">
                <li><a href="#graded-comics">CGC Graded Comics</a></li>
                <li><a href="#variant-covers">Variant Covers</a></li>
                <li><a href="#signed">Signed & Autographed</a></li>
                <li><a href="#first-editions">First Editions</a></li>
              </ul>
            </div>
          </Col>
        </Row>
      </div>

      {/* Comics Info */}
      <div className="fb-comics-info">
        <Card className="fb-comics-info-card">
          <Title level={4}>Curated for Collectors</Title>
          <Text>From mainstream blockbusters to hidden indie gems, we stock the comics that matter. Expert staff can help you complete your collection or discover your next favourite series.</Text>
        </Card>
      </div>
    </section>
  );
}
