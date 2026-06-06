"use client";

import React from "react";
import Sidebar from "./Sidebar";
import StaffBookForm from "./StaffBookForm";
import ManagerBooksPanel from "./ManagerBooksPanel";
import ManagerCustomersPanel from "./ManagerCustomersPanel";
import ManagerOrdersPanel from "./ManagerOrdersPanel";
import StaffTradeInPanel from "./StaffTradeInPanel";
import CustomerCatalogPanel from "./CustomerCatalogPanel";
import RecommendedGrid from "./RecommendedGrid";
import OrdersList from "./OrdersList";
import InvoicePanel from "@/components/organisms/InvoicePanel";
import TradeInPanel from "@/components/profile/TradeInPanel";
import StaffPaymentsPanel from "@/components/profile/StaffPaymentsPanel";
import { CartDrawer } from "@/components/landing/CartDrawer";
import { Skeleton, Typography } from "antd";
import type { AuthUser } from "@/lib/auth";
import type { CartItem } from "@/components/landing/landing-data";

const { Title } = Typography;

type ProfileShellProps = {
  user: AuthUser;
  onLogout: () => void;
  recentBooks: any[];
  onCreateBook: (v: any) => Promise<void>;
  onRefreshBooks: () => Promise<void>;
  orders: any[];
  recommendations: any[];
  books: any[];
  loadingProfileData: boolean;
  cart: CartItem[];
  cartCount: number;
  cartTotal: number;
  cartOpen: boolean;
  onOpenCart: () => void;
  onCloseCart: () => void;
  onAddToCart: (book: any) => void;
  onIncrementCartItem: (isbn: string, currentQuantity: number) => void;
  onDecrementCartItem: (isbn: string, currentQuantity: number) => void;
  onRemoveCartItem: (isbn: string) => void;
  customerProfile?: {
    customerId: string;
    name: string;
    address: string;
    email: string;
    phoneNumber: string;
    accountBalance: number;
  } | null;
};

// Renders the profile shell section.
export default function ProfileShell({
  user,
  onLogout,
  recentBooks,
  onCreateBook,
  onRefreshBooks,
  orders,
  recommendations,
  books,
  loadingProfileData,
  cart,
  cartCount,
  cartTotal,
  cartOpen,
  onOpenCart,
  onCloseCart,
  onAddToCart,
  onIncrementCartItem,
  onDecrementCartItem,
  onRemoveCartItem,
  customerProfile,
}: ProfileShellProps) {
  const isStaff = user.role !== 'customer';

  return (
    <div>
      <style jsx>{`
        .pf-wrap { padding: 32px clamp(16px,5vw,80px) 0; }
        .pf-hero { margin-bottom: 24px; }
        .pf-grid { display: grid; grid-template-columns: 300px 1fr; gap: 24px; align-items: start; }
        .pf-main { min-width: 0; }
        .pf-panel { margin-bottom: 20px; }
      `}</style>

      <section className="pf-wrap">
        <div className="pf-hero">
          <Title level={2} style={{ margin: 0 }}>{isStaff ? `Welcome, ${user.name}` : `Welcome, ${user.name}`}</Title>
          <div style={{ color: '#64748b', marginTop: 8 }}>{user.email}</div>
        </div>

        <div className="pf-grid">
          <Sidebar user={user} onLogout={onLogout} customerProfile={customerProfile} cartCount={cartCount} onOpenCart={onOpenCart} />

          <main className="pf-main">
            {user.role !== 'customer' && (
              <div className="pf-panel">
                <StaffBookForm onCreate={onCreateBook} recentBooks={recentBooks} />
              </div>
            )}

            {user.role === 'customer' ? (
              <>
                <div className="pf-panel">
                  {loadingProfileData ? <Skeleton active paragraph={{ rows: 4 }} /> : <CustomerCatalogPanel books={books} />}
                </div>

                <div className="pf-panel">
                  {loadingProfileData ? <Skeleton active paragraph={{ rows: 4 }} /> : <RecommendedGrid books={recommendations} onAddToCart={onAddToCart} />}
                </div>

                <div className="pf-panel">
                  {loadingProfileData ? <Skeleton active paragraph={{ rows: 3 }} /> : <OrdersList orders={orders} />}
                </div>

                <div className="pf-panel">
                  {loadingProfileData ? <Skeleton active paragraph={{ rows: 3 }} /> : <TradeInPanel customerId={customerProfile?.customerId ?? user.id} orders={orders} books={books} />}
                </div>

                <div className="pf-panel">
                  {loadingProfileData ? <Skeleton active paragraph={{ rows: 3 }} /> : <InvoicePanel />}
                </div>
              </>
            ) : (
              <>
                <div className="pf-panel">
                  <ManagerBooksPanel books={books} onRefresh={onRefreshBooks} />
                </div>
                <div className="pf-panel">
                  <ManagerCustomersPanel />
                </div>
                <div className="pf-panel">
                  <ManagerOrdersPanel />
                </div>
                <div className="pf-panel">
                  <StaffTradeInPanel approverId={user.id} />
                </div>
                <div className="pf-panel">
                  <StaffPaymentsPanel />
                </div>
              </>
            )}
          </main>
        </div>
      </section>

      <CartDrawer
        open={cartOpen}
        cart={cart}
        cartCount={cartCount}
        cartTotal={cartTotal}
        checkoutHref="/checkout"
        onClose={onCloseCart}
        onIncrement={onIncrementCartItem}
        onDecrement={onDecrementCartItem}
        onRemove={onRemoveCartItem}
      />
    </div>
  );
}
