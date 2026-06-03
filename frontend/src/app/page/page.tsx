"use client";

import { useEffect } from 'react';
import Link from 'next/link';
import { Button, Form, Input, message } from 'antd';
import { useRouter } from 'next/navigation';
import { apiPost } from '@/lib/api';
import { getAuthSession, setAuthSession, type AuthResponse } from '@/lib/auth';
import { AuthShell } from '@/components/auth/AuthShell';
import { migrateGuestCartToUser } from '@/components/profile/cart-storage';

// Renders the login page section.
export default function LoginPage() {
  const [form] = Form.useForm();
  const router = useRouter();

  useEffect(() => {
    if (getAuthSession()) {
      router.replace('/profile');
    }
  }, [router]);

  // Renders the handle submit section.
  async function handleSubmit(values: { email: string; password: string }) {
    try {
      const session = await apiPost<AuthResponse>('/auth/login', values);
      setAuthSession(session);
      message.success(`Welcome back, ${session.user.name}`);
      const migratedCart = migrateGuestCartToUser(session.user.id);
      router.push(migratedCart.length > 0 ? '/checkout' : '/profile');
    } catch (error) {
      message.error('Invalid email or password.');
    }
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to access your orders, carts, and account details."
      footerLink={{ href: '/signup', label: 'Sign up' }}
      footerText={
        <>
          Don't have an account?{' '}
          <Link href="/signup" style={{ color: '#1e40af', fontWeight: 600 }}>
            Create one
          </Link>
        </>
      }
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item label="Email address" name="email" rules={[{ required: true, message: 'Please enter your email' }]}>
          <Input placeholder="you@example.com" size="large" style={{ borderRadius: 10 }} />
        </Form.Item>
        <Form.Item label="Password" name="password" rules={[{ required: true, message: 'Please enter your password' }]}>
          <Input.Password placeholder="••••••••" size="large" style={{ borderRadius: 10 }} />
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
          Sign in
        </Button>
      </Form>
    </AuthShell>
  );
}
