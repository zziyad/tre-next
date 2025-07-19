const fs = require('fs');

// Read the Excel file
const fileBuffer = fs.readFileSync('test-real-format.xlsx');

// Create FormData using built-in FormData
const formData = new FormData();
formData.append('file', new Blob([fileBuffer], { 
  type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
}), 'test-real-format.xlsx');

// Test the upload endpoint
async function testUpload() {
  try {
    console.log('🚀 Testing upload with authentication...');
    
    // First, let's try to login to get a session
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      }),
    });

    console.log('📥 Login response status:', loginResponse.status);
    
    if (loginResponse.ok) {
      const cookies = loginResponse.headers.get('set-cookie');
      console.log('🍪 Cookies received:', cookies);
      
      // Now try the upload with authentication
      const uploadResponse = await fetch('http://localhost:3000/api/events/2/flight-schedules/upload', {
        method: 'POST',
        body: formData,
        headers: {
          'Cookie': cookies || ''
        }
      });

      console.log('📥 Upload response status:', uploadResponse.status);
      const uploadData = await uploadResponse.text();
      console.log('📥 Upload response data:', uploadData);
    } else {
      console.log('❌ Login failed');
      const loginData = await loginResponse.text();
      console.log('📥 Login response:', loginData);
    }
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testUpload(); 