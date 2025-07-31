'use client';

import React from 'react';
import Link from 'next/link';
import AuthForm from '@/components/auth/AuthForm';
import { Container } from '@/components/layout/Container';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Container>
        <AuthForm />
      </Container>
    </div>
  );
} 