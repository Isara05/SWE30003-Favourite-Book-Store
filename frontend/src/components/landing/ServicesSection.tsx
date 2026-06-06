import { Typography, Card, Row, Col } from 'antd';
import { ShoppingCartOutlined, CreditCardOutlined, TruckOutlined, BookOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

// Renders the services section section.
export function ServicesSection() {
  return (
    <section id="services" className="fb-services">
      <Title level={2} className="fb-services-title">
        Store Services
      </Title>

      {/* Service Highlights */}
      <div className="fb-services-highlights">
        <Row gutter={[24, 24]} className="fb-highlight-cards">
          <Col xs={24} sm={12} lg={6}>
            <Card className="fb-highlight-card">
              <ShoppingCartOutlined className="fb-highlight-icon" />
              <Text strong>Trade-In Credits</Text>
              <div className="fb-highlight-desc">Applied instantly at checkout</div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="fb-highlight-card">
              <CreditCardOutlined className="fb-highlight-icon" />
              <Text strong>Flexible Payment Plans</Text>
              <div className="fb-highlight-desc">For rare & high-value editions</div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="fb-highlight-card">
              <BookOutlined className="fb-highlight-icon" />
              <Text strong>Real-Time Inventory</Text>
              <div className="fb-highlight-desc">Synced with Hawthorn store</div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="fb-highlight-card">
              <TruckOutlined className="fb-highlight-icon" />
              <Text strong>Free Pickup & Delivery</Text>
              <div className="fb-highlight-desc">In-store & local options</div>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Service Categories */}
      <div className="fb-services-categories">
        <Row gutter={[32, 32]} className="fb-service-categories-row">
          <Col xs={24} sm={12} lg={8}>
            <div className="fb-service-category">
              <Title level={4} className="fb-category-title">About Our Services</Title>
              <ul className="fb-service-links">
                <li><a href="#about">About Favourite Books</a></li>
                <li><a href="#mission">Our Mission</a></li>
                <li><a href="#locations">Store Locations</a></li>
                <li><a href="#careers">Careers</a></li>
              </ul>
            </div>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <div className="fb-service-category">
              <Title level={4} className="fb-category-title">Customer Support</Title>
              <ul className="fb-service-links">
                <li><a href="#shipping">Shipping & Delivery</a></li>
                <li><a href="#returns">Returns & Exchanges</a></li>
                <li><a href="#faq">FAQ</a></li>
                <li><a href="#contact">Contact Us</a></li>
              </ul>
            </div>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <div className="fb-service-category">
              <Title level={4} className="fb-category-title">Community & Rewards</Title>
              <ul className="fb-service-links">
                <li><a href="#loyalty">Loyalty Program</a></li>
                <li><a href="#events">Book Events</a></li>
                <li><a href="#newsletter">Newsletter</a></li>
                <li><a href="#socials">Follow Us</a></li>
              </ul>
            </div>
          </Col>
        </Row>
      </div>

      {/* Additional Info */}
      <div className="fb-services-info">
        <Card className="fb-services-info-card">
          <Title level={4}>Why Choose Favourite Books?</Title>
          <Text>We combine premium inventory, flexible payment options, and seamless local service to create a destination for book lovers. Every purchase supports our curated collection and community-focused mission.</Text>
        </Card>
      </div>
    </section>
  );
}
