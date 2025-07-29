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
      console.log('Test user already exists');
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 12);

    // Create test user
    const user = await prisma.user.create({
      data: {
        username: 'admin',
        password_hash: hashedPassword,
        role: 'admin',
        created_at: new Date()
      }
    });

    console.log('Test user created successfully:', {
      user_id: user.user_id,
      username: user.username,
      role: user.role
    });

    console.log('\nLogin credentials:');
    console.log('Username: admin');
    console.log('Password: admin123');
  } catch (error) {
    console.error('Error creating test user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser(); 