'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthForm from '@/components/auth/AuthForm';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Container } from '@/components/layout'

export default function RegisterPage() {
  const router = useRouter();

  const handleRegister = async (data: { username: string; password: string; role?: string }) => {
    try {
      const response = await fetch('/api/auth/register', {
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

      // After successful registration, log the user in
      const loginResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: data.username, password: data.password }),
      });

      if (!loginResponse.ok) {
        throw new Error('Failed to log in after registration');
      }

      router.push('/dashboard');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to register';
      toast.error(errorMessage);
      throw err; // Re-throw to be handled by the form
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Container className="flex flex-col items-center justify-center py-8 sm:py-12">
        <div className="w-full max-w-md space-y-6 sm:space-y-8">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
              Create your account
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-primary hover:text-primary/90">
                Sign in instead
              </Link>
            </p>
          </div>
          <AuthForm mode="register" />
        </div>
      </Container>
    </div>
  );
} 