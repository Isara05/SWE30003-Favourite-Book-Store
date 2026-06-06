"use client";

import { useEffect } from 'react';
import Link from 'next/link';
import { Button, Form, Input, message } from 'antd';
import { useRouter } from 'next/navigation';
import { apiPost } from '@/lib/api';
import { getAuthSession, setAuthSession, type AuthResponse } from '@/lib/auth';
import { AuthShell } from '@/components/auth/AuthShell';
import { migrateGuestCartToUser } from '@/components/profile/cart-storage';

// Renders the signup page section.
export default function SignupPage() {
  const [form] = Form.useForm();
  const router = useRouter();

  useEffect(() => {
    if (getAuthSession()) {
      router.replace('/profile');
    }
  }, [router]);

  // Renders the handle submit section.
  async function handleSubmit(values: { name: string; address: string; email: string; phoneNumber: string; password: string }) {
    try {
      const session = await apiPost<AuthResponse>('/auth/register', values);
      setAuthSession(session);
      message.success(`Account created for ${session.user.name}`);
      const migratedCart = migrateGuestCartToUser(session.user.id);
      router.push(migratedCart.length > 0 ? '/checkout' : '/profile');
    } catch (error) {
      message.error('Could not create your account. Check your email and the phone number.');
    }
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Join to track orders, manage cart items, and save your reading journey."
      footerLink={{ href: '/login', label: 'Login' }}
      footerText={
        <>
          Already have an account?{' '}
          <Link href="/login" style={{ color: '#1e40af', fontWeight: 600 }}>
            Sign in
          </Link>
        </>
      }
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item label="Full name" name="name" rules={[{ required: true, whitespace: true, min: 2, message: 'Name must be at least 2 characters' }]}>
          <Input placeholder="John Doe" size="large" style={{ borderRadius: 10 }} />
        </Form.Item>
        <Form.Item label="Address" name="address" rules={[{ required: true, whitespace: true, min: 5, message: 'Address must be at least 5 characters' }]}>
          <Input placeholder="12 Glenferrie Rd, Hawthorn" size="large" style={{ borderRadius: 10 }} />
        </Form.Item>
        <Form.Item label="Email address" name="email" rules={[{ required: true, whitespace: true, type: 'email', message: 'Please enter a valid email' }]}>
          <Input placeholder="you@example.com" size="large" style={{ borderRadius: 10 }} />
        </Form.Item>
        <Form.Item label="Phone number" name="phoneNumber" rules={[{ required: true, whitespace: true, pattern: /^[+]?[-()\d\s.]+$/, message: 'Please enter a valid phone number' }]}>
          <Input placeholder="0412 345 678" size="large" style={{ borderRadius: 10 }} />
        </Form.Item>
        <Form.Item label="Password" name="password" rules={[{ required: true, min: 6, message: 'Password must be at least 6 characters' }]}>
          <Input.Password placeholder="Create a strong password" size="large" style={{ borderRadius: 10 }} />
        </Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          size="large"
          block
          style={{
            background: 'linear-gradient(135deg, #1e40af 0%, #0d9488 100%)',
            border: 'none',
            borderRadius: 10,
            height: 44,
            fontWeight: 600,
          }}
        >
          Create account
        </Button>
      </Form>
    </AuthShell>
  );
}
