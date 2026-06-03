"use client";

import Link from 'next/link';
import { Badge, Button } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';
import type { AuthUser } from '@/lib/auth';

type LandingHeaderProps = {
  cartCount?: number;
  onOpenCart?: () => void;
  user?: AuthUser | null;
  onLogout?: () => void;
};

// Renders the landing header section.
export function LandingHeader({ cartCount = 0, onOpenCart, user, onLogout }: LandingHeaderProps) {
  return (
    <header className="fb-topbar fb-fade">
      <div className="fb-brand">
        <span className="fb-brand-mark">◆</span>
        Favourite Books
      </div>

      <nav className="fb-nav" aria-label="Primary navigation">
        <a href="#catalog">Catalog</a>
        <a href="#kids">Kids</a>
        <a href="#comics">Comics</a>
        <a href="#used-books">Used books</a>
        <a href="#services">Services</a>
      </nav>

      <div className="fb-topbar-right">
        {user ? (
          <>
            <Link href="/profile" className="fb-login-link">
              Profile
            </Link>
            <Button className="fb-signup-btn" type="primary" onClick={onLogout}>
              Logout
            </Button>
          </>
        ) : (
          <>
            <Link href="/login" className="fb-login-link">
              Login
            </Link>
            <Button className="fb-signup-btn" type="primary" href="/signup">
              Sign up
            </Button>
          </>
        )}
        {onOpenCart ? (
          <Badge count={cartCount} color="#c2410c" offset={[-2, 2]}>
            <Button className="fb-cart-btn" icon={<ShoppingCartOutlined />} onClick={onOpenCart}>
              Cart
            </Button>
          </Badge>
        ) : null}
      </div>
    </header>
  );
}
