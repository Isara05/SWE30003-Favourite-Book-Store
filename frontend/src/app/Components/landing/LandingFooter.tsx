import Link from 'next/link';
import { Typography } from 'antd';

const { Text } = Typography;

// Renders the landing footer section.
export function LandingFooter() {
  return (
    <footer className="fb-footer">
      <div>
        <div className="fb-footer-brand">Favourite Books Online</div>
        <Text className="fb-footer-meta">Premium books · Hawthorn</Text>
      </div>
      <div className="fb-footer-links">
        <Link href="/login">Login</Link>
        <Link href="/signup">Sign up</Link>
        <a href="#catalog">Catalog</a>
        <a href="#services">Services</a>
      </div>
    </footer>
  );
}
