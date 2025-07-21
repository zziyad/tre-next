'use client';

import React from 'react';
import Link from 'next/link';
import AuthForm from '@/components/auth/AuthForm';

export default function LoginPage() {

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8 px-4 sm:py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6 sm:space-y-8">
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
            Welcome to TRS
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-medium text-primary hover:text-primary/90">
              Create one now
            </Link>
          </p>
        </div>

        <AuthForm mode="login" />
      </div>
    </div>
  );
} 