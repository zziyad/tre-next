'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthForm from '@/components/auth/AuthForm';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = async (data: { username: string; password: string }) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Failed to login');
      throw err; // Re-throw to be handled by the form
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Welcome to TRS
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Don't have an account?{' '}
            <Link href="/register" className="font-medium text-primary hover:text-primary/90">
              Create one now
            </Link>
          </p>
        </div>

        <AuthForm mode="login" onSubmit={handleLogin} />
      </div>
    </div>
  );
} 