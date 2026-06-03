import type { ReactNode } from 'react';
import Link from 'next/link';

// Renders the auth shell section.
export function AuthShell({ children, title, subtitle, footerLink, footerText }: {
  children: ReactNode;
  title: string;
  subtitle: string;
  footerLink: { href: string; label: string };
  footerText: ReactNode;
}) {
  return (
    <main className="app-shell">
      <div className="topbar">
        <div className="brand">Favourite Books</div>
        <nav className="nav-links">
          <Link href="/">Home</Link>
          <Link href={footerLink.href}>{footerLink.label}</Link>
        </nav>
      </div>

      <section
        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}
      >
        <div style={{ maxWidth: 500, width: '100%' }}>
          <div className="hero-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: 32, background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(240,249,255,0.98) 100%)' }}>
              <h1 style={{ textAlign: 'center', marginBottom: 8, fontFamily: 'var(--font-display), serif', fontSize: 34, lineHeight: 1.1 }}>
                {title}
              </h1>
              <p style={{ textAlign: 'center', margin: 0, color: '#6b7280', lineHeight: 1.7 }}>
                {subtitle}
              </p>
            </div>
            <div style={{ padding: 32 }}>{children}</div>
          </div>
          <p style={{ textAlign: 'center', display: 'block', marginTop: 20, color: '#6b7280' }}>
            {footerText}
          </p>
        </div>
      </section>
    </main>
  );
}
