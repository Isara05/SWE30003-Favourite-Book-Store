import { Button, Card, Drawer, Input, Typography } from 'antd';
import { MinusOutlined, PlusOutlined } from '@ant-design/icons';
import type { CartItem } from './landing-data';

const { Text } = Typography;

type CartDrawerProps = {
  open: boolean;
  cart: CartItem[];
  cartCount: number;
  cartTotal: number;
  checkoutHref?: string;
  onClose: () => void;
  onIncrement: (isbn: string, currentQuantity: number) => void;
  onDecrement: (isbn: string, currentQuantity: number) => void;
  onRemove: (isbn: string) => void;
};

// Renders the cart drawer section.
export function CartDrawer({
  open,
  cart,
  cartCount,
  cartTotal,
  checkoutHref = '/signup',
  onClose,
  onIncrement,
  onDecrement,
  onRemove,
}: CartDrawerProps) {
  return (
    <Drawer
      className="fb-drawer"
      title={
        <span style={{ fontFamily: 'var(--font-display), serif', fontSize: 20, fontWeight: 700 }}>
          Your cart {cartCount > 0 ? `(${cartCount})` : ''}
        </span>
      }
      onClose={onClose}
      open={open}
      width={420}
      footer={
        cart.length > 0 ? (
          <Button type="primary" className="fb-checkout-btn" block href={checkoutHref}>
            Proceed to checkout · ${cartTotal.toFixed(2)}
          </Button>
        ) : null
      }
    >
      <div className="fb-cart-panel">
        {cart.length === 0 ? (
          <div className="fb-empty">
            <div style={{ fontSize: 40, marginBottom: 12 }}>🛒</div>
            Your cart is empty.
            <br />Add some books to get started.
          </div>
        ) : (
          cart.map((item) => (
            <Card key={item.isbn} className="fb-cart-item" size="small" styles={{ body: { padding: 0 } }}>
              <div className="fb-cart-row">
                <div style={{ minWidth: 0 }}>
                  <Text strong>{item.title}</Text>
                  <div>
                    <Text type="secondary">{item.author}</Text>
                  </div>
                </div>
                <Text strong>${(item.price * item.quantity).toFixed(2)}</Text>
              </div>

              <div className="fb-cart-actions">
                <Button
                  className="fb-cart-icon-btn"
                  icon={<MinusOutlined />}
                  onClick={() => onDecrement(item.isbn, item.quantity)}
                />
                <Text strong style={{ width: 24, textAlign: 'center' }}>
                  {item.quantity}
                </Text>
                <Button
                  className="fb-cart-icon-btn"
                  icon={<PlusOutlined />}
                  onClick={() => onIncrement(item.isbn, item.quantity)}
                />
                <button className="fb-cart-remove" onClick={() => onRemove(item.isbn)}>
                  Remove
                </button>
              </div>
            </Card>
          ))
        )}

        {cart.length > 0 ? (
          <div className="fb-cart-total">
            <Text strong>Total</Text>
            <Text strong>${cartTotal.toFixed(2)}</Text>
          </div>
        ) : null}
      </div>
    </Drawer>
  );
}
