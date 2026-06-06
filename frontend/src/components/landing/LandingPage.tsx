"use client";

import { useEffect, useState } from 'react';
import { LandingHeader } from './LandingHeader';
import { ShopExperience } from './ShopExperience';
import { clearAuthSession, getAuthSession, type AuthUser } from '@/lib/auth';

// Renders the landing page section.
export function LandingPage() {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const session = getAuthSession();
    setUser(session ? session.user : null);
  }, []);

  return (
    <main className="fb-shell">
      <ShopExperience
        renderHeader={({ cartCount, onOpenCart }) => (
          <LandingHeader
            cartCount={cartCount}
            onOpenCart={onOpenCart}
            user={user}
            onLogout={
              user
                ? () => {
                    clearAuthSession();
                    setUser(null);
                  }
                : undefined
            }
          />
        )}
      />
    </main>
  );
}
