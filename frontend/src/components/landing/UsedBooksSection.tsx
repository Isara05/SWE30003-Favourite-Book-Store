import { Typography, Card, Row, Col } from 'antd';
import { ReloadOutlined, SafetyOutlined, DollarOutlined, HeartOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

// Renders the used books section.
export function UsedBooksSection() {
  return (
    <section id="used-books" className="fb-used-books">
      <Title level={2} className="fb-used-books-title">
        Pre-Loved & Used Books
      </Title>

      {/* Used Books Highlights */}
      <div className="fb-used-books-highlights">
        <Row gutter={[24, 24]} className="fb-used-books-cards">
          <Col xs={24} sm={12} lg={6}>
            <Card className="fb-used-books-card">
              <ReloadOutlined className="fb-used-books-icon" />
              <Text strong>Sustainable Reading</Text>
              <div className="fb-used-books-desc">Reduce waste, extend book life</div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="fb-used-books-card">
              <DollarOutlined className="fb-used-books-icon" />
              <Text strong>Save 30-50%</Text>
              <div className="fb-used-books-desc">Discounted prices on quality reads</div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="fb-used-books-card">
              <SafetyOutlined className="fb-used-books-icon" />
              <Text strong>Quality Verified</Text>
              <div className="fb-used-books-desc">All books inspected & graded</div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="fb-used-books-card">
              <HeartOutlined className="fb-used-books-icon" />
              <Text strong>Trade-In Program</Text>
              <div className="fb-used-books-desc">Exchange your books for credit</div>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Used Books Categories */}
      <div className="fb-used-books-categories">
        <Row gutter={[32, 32]}>
          <Col xs={24} sm={12} lg={8}>
            <div className="fb-used-books-category">
              <Title level={4}>Book Conditions</Title>
              <ul className="fb-used-books-links">
                <li><a href="#like-new">Like New</a></li>
                <li><a href="#very-good">Very Good</a></li>
                <li><a href="#good">Good</a></li>
                <li><a href="#acceptable">Acceptable</a></li>
              </ul>
            </div>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <div className="fb-used-books-category">
              <Title level={4}>Popular Genres</Title>
              <ul className="fb-used-books-links">
                <li><a href="#used-fiction">Fiction Classics</a></li>
                <li><a href="#used-mystery">Mystery & Thrillers</a></li>
                <li><a href="#used-romance">Romance</a></li>
                <li><a href="#used-non-fiction">Non-Fiction</a></li>
              </ul>
            </div>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <div className="fb-used-books-category">
              <Title level={4}>Seller Info</Title>
              <ul className="fb-used-books-links">
                <li><a href="#sell-books">Sell Your Books</a></li>
                <li><a href="#condition-guide">Condition Guide</a></li>
                <li><a href="#pricing">Our Pricing</a></li>
                <li><a href="#bulk-orders">Bulk Orders</a></li>
              </ul>
            </div>
          </Col>
        </Row>
      </div>

      {/* Used Books Info */}
      <div className="fb-used-books-info">
        <Card className="fb-used-books-info-card">
          <Title level={4}>Sustainable. Affordable. Trusted.</Title>
          <Text>Our used book collection gives great reads a second life. Every purchase is graded for quality, and every sale supports our commitment to making reading more accessible and sustainable.</Text>
        </Card>
      </div>
    </section>
  );
}
