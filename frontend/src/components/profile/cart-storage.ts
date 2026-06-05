import type { CartItem, Book } from '@/components/landing/landing-data';

const CART_PREFIX = 'fb_profile_cart_';
const GUEST_CART_KEY = 'fb_guest_cart';

// Finds the cart key details.
function getCartKey(userId: string) {
  return `${CART_PREFIX}${userId}`;
}

// Reads the profile cart data.
export function readProfileCart(userId: string): CartItem[] {
  // Handles the if logic.
  if (typeof window === 'undefined') {
    return [];
  }

  const raw = window.localStorage.getItem(getCartKey(userId));
  // Handles the if logic.
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as CartItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// Writes the profile cart data.
export function writeProfileCart(userId: string, cart: CartItem[]): void {
  // Handles the if logic.
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(getCartKey(userId), JSON.stringify(cart));
}

// Reads the guest cart data.
export function readGuestCart(): CartItem[] {
  // Handles the if logic.
  if (typeof window === 'undefined') {
    return [];
  }

  const raw = window.localStorage.getItem(GUEST_CART_KEY);
  // Handles the if logic.
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as CartItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// Writes the guest cart data.
export function writeGuestCart(cart: CartItem[]): void {
  // Handles the if logic.
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
}

// Handles the clear guest cart logic.
export function clearGuestCart(): void {
  // Handles the if logic.
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(GUEST_CART_KEY);
}

// Moves the guest cart to user data into the right place.
export function migrateGuestCartToUser(userId: string): CartItem[] {
  const guestCart = readGuestCart();
  // Handles the if logic.
  if (guestCart.length === 0) {
    return [];
  }

  writeProfileCart(userId, guestCart);
  clearGuestCart();
  return guestCart;
}

// Adds or updates the profile cart item item.
export function upsertProfileCartItem(userId: string, cart: CartItem[], book: Book): CartItem[] {
  const existing = cart.find((item) => item.isbn === book.isbn);
  const next = existing
    ? cart.map((item) => (item.isbn === book.isbn ? { ...item, quantity: item.quantity + 1 } : item))
    : [...cart, { ...book, quantity: 1 }];

  writeProfileCart(userId, next);
  return next;
}
