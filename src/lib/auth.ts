import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { prisma } from './prisma';

export interface UserData {
  username: string;
  email: string;
  password: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export async function createUser(userData: UserData) {
  const { username, email, password } = userData;
  const password_hash = await hashPassword(password);

  // Get default permissions
  const defaultPermissions = await prisma.defaultPermission.findMany({
    include: {
      Permission: true,
    },
  });

  const user = await prisma.user.create({
    data: {
      username,
      email,
      password_hash,
      is_active: true,
      created_at: new Date(),
    },
  });

  // Assign default permissions to the new user
  if (defaultPermissions.length > 0) {
    const userPermissions = defaultPermissions.map(dp => ({
      user_id: user.user_id,
      permission_id: dp.permission_id,
    }));

    await prisma.userPermission.createMany({
      data: userPermissions,
    });
  }

  return { ...user, password_hash: undefined };
}

export async function createSession(userId: number) {
  // Get user with permissions
  const user = await prisma.user.findUnique({
    where: { user_id: userId },
    include: {
      UserPermission_UserPermission_user_idToUser: {
        include: {
          Permission: true,
        },
      },
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const permissions = user.UserPermission_UserPermission_user_idToUser.map(up => up.Permission.name);

  const token = jwt.sign(
    { 
      userId, 
      permissions,
      username: user.username,
      email: user.email,
    }, 
    process.env.JWT_SECRET!, 
    {
      expiresIn: '7d',
    }
  );

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

  return { token, response, permissions };
}

export async function validateSession(token: string) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { 
      userId: number;
      permissions: string[];
      username: string;
      email: string;
    };
    
    const user = await prisma.user.findUnique({
      where: {
        user_id: decoded.userId,
      },
      select: {
        user_id: true,
        username: true,
        email: true,
        is_active: true,
      },
    });

    if (!user || !user.is_active) {
      return null;
    }

    return {
      ...user,
      permissions: decoded.permissions,
    };
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

// Permission checking utilities
export async function hasPermission(userId: number, permissionName: string): Promise<boolean> {
  const userPermission = await prisma.userPermission.findFirst({
    where: {
      user_id: userId,
      Permission: {
        name: permissionName,
      },
    },
  });

  return !!userPermission;
}

export async function requirePermission(userId: number, permissionName: string): Promise<void> {
  const hasAccess = await hasPermission(userId, permissionName);
  if (!hasAccess) {
    throw new Error(`Insufficient permissions. Required: ${permissionName}`);
  }
}

export async function getUserPermissions(userId: number): Promise<string[]> {
  const userPermissions = await prisma.userPermission.findMany({
    where: { user_id: userId },
    include: {
      Permission: true,
    },
  });

  return userPermissions.map(up => up.Permission.name);
} 