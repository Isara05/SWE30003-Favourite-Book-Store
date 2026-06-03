import { Typography } from 'antd';

const { Title } = Typography;

// Renders the services section section.
export function ServicesSection() {
  return (
    <section id="services" className="fb-services fb-reveal reveal-on-scroll">
      <Title level={3} className="fb-services-title">
        Store services
      </Title>
      <div className="fb-services-list">
        <div className="fb-service-item">Trade-in credits applied instantly at checkout</div>
        <div className="fb-service-item">Flexible instalment plans for rare and high-value editions</div>
        <div className="fb-service-item">Real-time inventory synced with Hawthorn store</div>
      </div>
    </section>
  );
}
