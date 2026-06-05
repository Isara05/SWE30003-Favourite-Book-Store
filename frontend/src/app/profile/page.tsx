"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Form, Input, InputNumber, Select, message } from 'antd';
import ProfileShell from '@/components/profile/ProfileShell';
import { clearAuthSession, getAuthSession, type AuthUser } from '@/lib/auth';
import { apiGet, apiPost } from '@/lib/api';
import type { Book, CartItem } from '@/components/landing/landing-data';
import type { ProfileOrder } from '@/components/profile/OrdersList';
import { readProfileCart, upsertProfileCartItem, writeProfileCart } from '@/components/profile/cart-storage';

const BOOK_FORMAT_OPTIONS = ['Paperback', 'Hardcover', 'Ebook'] as const;
const BOOK_CONDITION_OPTIONS = ['New', 'Used'] as const;

type BookFormatValue = (typeof BOOK_FORMAT_OPTIONS)[number];
type BookConditionValue = (typeof BOOK_CONDITION_OPTIONS)[number];

type StaffBookFormValues = {
  isbn: string;
  title: string;
  author: string;
  genre: string;
  format: BookFormatValue;
  condition: BookConditionValue;
  price: number;
  stockLevel: number;
};

type CreatedBook = StaffBookFormValues;

type CatalogBook = Book;

type CustomerProfile = {
  customerId: string;
  name: string;
  address: string;
  email: string;
  phoneNumber: string;
  accountBalance: number;
};

// Renders the build recommendations section.
function buildRecommendations(orders: ProfileOrder[], books: CatalogBook[]): Book[] {
  const purchasedGenres = new Map<string, number>();
  const purchasedIsbns = new Set<string>();

  orders.forEach((order) => {
    order.lines.forEach((line) => purchasedIsbns.add(line.isbn));
  });

  books.forEach((book) => {
    if (purchasedIsbns.has(book.isbn)) return;
    const current = purchasedGenres.get(book.genre) ?? 0;
    purchasedGenres.set(book.genre, current + 1);
  });

  const favoriteGenres = [...purchasedGenres.entries()]
    .sort((left, right) => right[1] - left[1])
    .map(([genre]) => genre);

  const ranked = books
    .filter((book) => !purchasedIsbns.has(book.isbn))
    .sort((left, right) => {
      const leftGenreRank = favoriteGenres.indexOf(left.genre);
      const rightGenreRank = favoriteGenres.indexOf(right.genre);

      // Renders the if section.
      if (leftGenreRank !== rightGenreRank) {
        return (leftGenreRank === -1 ? Number.MAX_SAFE_INTEGER : leftGenreRank) - (rightGenreRank === -1 ? Number.MAX_SAFE_INTEGER : rightGenreRank);
      }

      return right.stockLevel - left.stockLevel;
    });

  return ranked.slice(0, 6);
}

// Renders the profile page section.
export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [recentBooks, setRecentBooks] = useState<CreatedBook[]>([]);
  const [orders, setOrders] = useState<ProfileOrder[]>([]);
  const [catalog, setCatalog] = useState<CatalogBook[]>([]);
  const [customerProfile, setCustomerProfile] = useState<CustomerProfile | null>(null);
  const [loadingProfileData, setLoadingProfileData] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartHydrated, setCartHydrated] = useState(false);
  const [form] = Form.useForm<StaffBookFormValues>();

  useEffect(() => {
    const session = getAuthSession();
    // Renders the if section.
    if (!session) {
      router.replace('/login');
      return;
    }
    setUser(session.user);
  }, [router]);

  useEffect(() => {
    if (!user) return;

    const currentUser = user;

    let active = true;

    // Renders the load profile data section.
    async function loadProfileData() {
      try {
        const [books, customerOrders, customerDetails] = await Promise.all([
          apiGet<CatalogBook[]>('/catalog/books'),
          currentUser.role === 'customer' ? apiGet<ProfileOrder[]>('/orders/me') : Promise.resolve([]),
          currentUser.role === 'customer' ? apiGet<CustomerProfile>(`/customers/${currentUser.id}`) : Promise.resolve(null),
        ]);

        if (!active) return;

        setCatalog(books);
        setOrders(customerOrders);
        setCustomerProfile(customerDetails);
        setCart(readProfileCart(currentUser.id));
        setCartHydrated(true);
      } finally {
        if (active) setLoadingProfileData(false);
      }
    }

    loadProfileData();

    return () => {
      active = false;
    };
  }, [user]);

  // Renders the handle logout section.
  function handleLogout() {
    clearAuthSession();
    router.push('/');
  }

  // Renders the handle add to cart section.
  function handleAddToCart(book: Book) {
    if (!user) return;
    setCart((current) => upsertProfileCartItem(user.id, current, book));
    setCartOpen(true);
    message.success(`${book.title} added to your cart.`);
  }

  // Renders the handle close cart section.
  function handleCloseCart() {
    setCartOpen(false);
  }

  // Renders the change quantity section.
  function changeQuantity(isbn: string, nextQuantity: number) {
    setCart((current) =>
      current
        .map((item) => (item.isbn === isbn ? { ...item, quantity: nextQuantity } : item))
        .filter((item) => item.quantity > 0),
    );
  }

  // Renders the remove from cart section.
  function removeFromCart(isbn: string) {
    setCart((current) => current.filter((item) => item.isbn !== isbn));
  }

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  useEffect(() => {
    if (!user || !cartHydrated) return;
    writeProfileCart(user.id, cart);
  }, [cart, user, cartHydrated]);

  // Renders the handle create book section.
  async function handleCreateBook(values: StaffBookFormValues) {
    try {
      const createdBook = await apiPost<CreatedBook>('/catalog/books', values);
      setRecentBooks((current) => [createdBook, ...current].slice(0, 5));
      form.resetFields();
      const refreshedBooks = await apiGet<CatalogBook[]>('/catalog/books?limit=250&offset=0');
      setCatalog(refreshedBooks);
      message.success(`Saved ${createdBook.title} to the catalog.`);
    } catch (error) {
      message.error('Could not save the book. Check the ISBN and the required fields.');
    }
  }

  // Renders the handle refresh books section.
  async function handleRefreshBooks() {
    const refreshedBooks = await apiGet<CatalogBook[]>('/catalog/books?limit=250&offset=0');
    setCatalog(refreshedBooks);
  }

  // Renders the if section.
  if (!user) {
    return null;
  }

  const recommendations = buildRecommendations(orders, catalog);

  return (
    <main className="fb-shell">
      <ProfileShell
        user={user}
        onLogout={handleLogout}
        recentBooks={recentBooks}
        onCreateBook={handleCreateBook}
        onRefreshBooks={handleRefreshBooks}
        orders={orders}
        recommendations={recommendations}
        books={catalog}
        loadingProfileData={loadingProfileData}
        cart={cart}
        cartCount={cartCount}
        cartTotal={cartTotal}
        cartOpen={cartOpen}
        onOpenCart={() => setCartOpen(true)}
        onCloseCart={handleCloseCart}
        onAddToCart={handleAddToCart}
        onIncrementCartItem={(isbn, currentQuantity) => changeQuantity(isbn, currentQuantity + 1)}
        onDecrementCartItem={(isbn, currentQuantity) => changeQuantity(isbn, currentQuantity - 1)}
        onRemoveCartItem={removeFromCart}
        customerProfile={customerProfile}
      />

    </main>
  );
}
