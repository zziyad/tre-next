const puppeteer = require('puppeteer');

async function testFrontend() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('🌐 Testing frontend with authentication...');
    
    // Go to login page
    await page.goto('http://localhost:3000/login');
    console.log('📄 Loaded login page');
    
    // Fill login form
    await page.type('input[name="username"]', 'testuser');
    await page.type('input[name="password"]', 'testpass123');
    console.log('📝 Filled login form');
    
    // Submit form
    await page.click('button[type="submit"]');
    console.log('🔐 Submitted login form');
    
    // Wait for redirect
    await page.waitForNavigation();
    console.log('✅ Login successful, redirected to dashboard');
    
    // Go to flight schedules page
    await page.goto('http://localhost:3000/events/2/flight-schedules');
    console.log('📄 Loaded flight schedules page');
    
    // Wait for page to load
    await page.waitForTimeout(3000);
    
    // Check if flight schedules are displayed
    const schedulesText = await page.evaluate(() => {
      const element = document.querySelector('h1');
      return element ? element.textContent : 'No h1 found';
    });
    
    console.log('📊 Page title:', schedulesText);
    
    // Check for flight schedules
    const hasSchedules = await page.evaluate(() => {
      const table = document.querySelector('table');
      const rows = table ? table.querySelectorAll('tbody tr') : [];
      return rows.length > 0;
    });
    
    console.log('📋 Has flight schedules:', hasSchedules);
    
    // Take screenshot
    await page.screenshot({ path: 'flight-schedules-page.png' });
    console.log('📸 Screenshot saved as flight-schedules-page.png');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

testFrontend(); 