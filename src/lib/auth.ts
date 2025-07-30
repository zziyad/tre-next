import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { prisma } from './prisma';
import type { UserRole } from '@/types';

export interface UserData {
  email: string;
  password: string;
  name: string;
  surname: string;
  role?: UserRole;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export async function createUser(userData: UserData) {
  const { email, password, name, surname, role } = userData;
  const password_hash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      email,
      password_hash,
      name,
      surname,
      role: role || 'USER',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
  });

  return { ...user, password_hash: undefined };
}

export async function createSession(userId: number) {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET!, {
    expiresIn: '7d',
  });

  const expires = new Date();
  expires.setDate(expires.getDate() + 7);

  const response = new Response(null, {
    status: 200,
    headers: {
      'Set-Cookie': `session_token=${token}; HttpOnly; Path=/; SameSite=Lax; ${
        process.env.NODE_ENV === 'production' ? 'Secure;' : ''
      } Expires=${expires.toUTCString()}`
    }
  });

  return { token, response };
}

export async function validateSession(token: string) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number };
    
    const user = await prisma.user.findUnique({
      where: {
        user_id: decoded.userId,
      },
      select: {
        user_id: true,
        email: true,
        name: true,
        surname: true,
        role: true,
        is_active: true,
        last_login: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (!user || !user.is_active) {
      return null;
    }

    return user;
  } catch {
    return null;
  }
}

export async function getSessionFromCookie() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session_token')?.value;
  if (!token) return null;
  return validateSession(token);
}

export async function deleteSession(token: string) {
  const response = new Response(null, {
    status: 200,
    headers: {
      'Set-Cookie': 'session_token=; HttpOnly; Path=/; Max-Age=0'
    }
  });

  return response;
} 