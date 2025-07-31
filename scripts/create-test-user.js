const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { username: 'admin' }
    });

    if (existingUser) {
      // Update existing user with email
      const updatedUser = await prisma.user.update({
        where: { username: 'admin' },
        data: {
          email: 'admin@test.com',
          is_active: true
        }
      });
      
      console.log('Test user updated successfully:', {
        user_id: updatedUser.user_id,
        username: updatedUser.username,
        email: updatedUser.email
      });

      console.log('\nLogin credentials:');
      console.log('Email: admin@test.com');
      console.log('Password: admin123');
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 12);

    // Create test user
    const user = await prisma.user.create({
      data: {
        username: 'admin',
        email: 'admin@test.com',
        password_hash: hashedPassword,
        is_active: true,
        created_at: new Date()
      }
    });

    console.log('Test user created successfully:', {
      user_id: user.user_id,
      username: user.username,
      email: user.email
    });

    console.log('\nLogin credentials:');
    console.log('Email: admin@test.com');
    console.log('Password: admin123');
  } catch (error) {
    console.error('Error creating test user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser(); 