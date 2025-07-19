const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    console.log('🔧 Creating test user...');
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { username: 'testuser' }
    });
    
    if (existingUser) {
      console.log('✅ Test user already exists');
      return existingUser;
    }
    
    // Create test user
    const hashedPassword = await bcrypt.hash('testpass123', 10);
    
    const user = await prisma.user.create({
      data: {
        username: 'testuser',
        password_hash: hashedPassword,
        role: 'admin'
      }
    });
    
    console.log('✅ Test user created:', user);
    return user;
  } catch (error) {
    console.error('❌ Error creating test user:', error);
    throw error;
  }
}

async function testLogin() {
  try {
    console.log('🔐 Testing login...');
    
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'testuser',
        password: 'testpass123'
      }),
    });

    console.log('📥 Login response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Login successful:', data);
      
      const cookies = response.headers.get('set-cookie');
      console.log('🍪 Cookies:', cookies);
      
      return cookies;
    } else {
      const errorData = await response.text();
      console.log('❌ Login failed:', errorData);
      return null;
    }
  } catch (error) {
    console.error('❌ Login test error:', error);
    return null;
  }
}

async function testFlightSchedulesAPI(cookies) {
  try {
    console.log('📊 Testing flight schedules API...');
    
    const response = await fetch('http://localhost:3000/api/events/2/flight-schedules', {
      method: 'GET',
      headers: {
        'Cookie': cookies || '',
        'Content-Type': 'application/json'
      }
    });

    console.log('📥 API response status:', response.status);
    
    const data = await response.text();
    console.log('📥 API response data:', data);
    
    return response.ok;
  } catch (error) {
    console.error('❌ API test error:', error);
    return false;
  }
}

async function main() {
  try {
    // Create test user
    await createTestUser();
    
    // Test login
    const cookies = await testLogin();
    
    if (cookies) {
      // Test flight schedules API
      const apiSuccess = await testFlightSchedulesAPI(cookies);
      
      if (apiSuccess) {
        console.log('🎉 All tests passed!');
      } else {
        console.log('❌ API test failed');
      }
    } else {
      console.log('❌ Login failed');
    }
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 