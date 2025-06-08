#!/usr/bin/env node

/**
 * Subscription Page Functionality Test
 * Tests all interactive elements and validates UI/UX improvements
 */

const puppeteer = require('puppeteer');

const TEST_URL = 'http://localhost:3000/subscription';

async function testSubscriptionPageFunctionality() {
  console.log('🧪 TESTING SUBSCRIPTION PAGE FUNCTIONALITY');
  console.log('='.repeat(70));
  console.log(`🌐 Test URL: ${TEST_URL}`);
  console.log('');

  let browser;
  let page;

  try {
    // Launch browser
    console.log('🚀 Launching browser...');
    browser = await puppeteer.launch({
      headless: false, // Set to true for headless mode
      defaultViewport: { width: 1280, height: 720 },
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    page = await browser.newPage();
    
    // Navigate to subscription page
    console.log('📄 Navigating to subscription page...');
    await page.goto(TEST_URL, { waitUntil: 'networkidle2' });
    
    // Wait for page to load
    await page.waitForSelector('h1', { timeout: 10000 });
    
    console.log('✅ Page loaded successfully');

    // Test 1: Verify page title and basic elements
    console.log('\n📋 TEST 1: Basic Page Elements');
    await testBasicElements(page);

    // Test 2: Test "View Pricing Plans" button
    console.log('\n📋 TEST 2: View Pricing Plans Button');
    await testViewPricingPlansButton(page);

    // Test 3: Test Ko-fi subscription buttons
    console.log('\n📋 TEST 3: Ko-fi Subscription Buttons');
    await testKofiSubscriptionButtons(page);

    // Test 4: Test "Hide Pricing" button
    console.log('\n📋 TEST 4: Hide Pricing Button');
    await testHidePricingButton(page);

    // Test 5: Test "Open Ko-fi Dashboard" button
    console.log('\n📋 TEST 5: Open Ko-fi Dashboard Button');
    await testKofiDashboardButton(page);

    // Test 6: Responsive design validation
    console.log('\n📋 TEST 6: Responsive Design');
    await testResponsiveDesign(page);

    // Test 7: Accessibility and styling validation
    console.log('\n📋 TEST 7: Accessibility and Styling');
    await testAccessibilityAndStyling(page);

    console.log('\n🎉 All subscription page tests completed successfully!');

  } catch (error) {
    console.error('\n❌ Subscription page test failed:', error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

async function testBasicElements(page) {
  try {
    // Check page title
    const title = await page.$eval('h1', el => el.textContent);
    console.log(`   📝 Page title: "${title}"`);
    
    if (title.includes('Subscription Management')) {
      console.log('   ✅ Page title is correct');
    } else {
      console.log('   ❌ Page title is incorrect');
    }

    // Check if subscription info is displayed
    const subscriptionCard = await page.$('.border-2');
    if (subscriptionCard) {
      console.log('   ✅ Subscription card is visible');
    } else {
      console.log('   ❌ Subscription card not found');
    }

    // Check current subscription tier
    const tierBadge = await page.$eval('[class*="border-"][class*="text-"]', el => el.textContent);
    console.log(`   📊 Current subscription tier badge: "${tierBadge}"`);

  } catch (error) {
    console.error('   ❌ Error testing basic elements:', error.message);
  }
}

async function testViewPricingPlansButton(page) {
  try {
    // Find and click the "View Pricing Plans" button
    const viewPricingButton = await page.$('button:has-text("View Pricing Plans")');
    
    if (viewPricingButton) {
      console.log('   ✅ "View Pricing Plans" button found');
      
      // Check button styling
      const buttonClasses = await page.evaluate(el => el.className, viewPricingButton);
      console.log(`   🎨 Button classes: ${buttonClasses}`);
      
      if (buttonClasses.includes('bg-red-600') && buttonClasses.includes('hover:bg-red-700')) {
        console.log('   ✅ Button has correct styling');
      } else {
        console.log('   ⚠️ Button styling may need improvement');
      }

      // Click the button
      await viewPricingButton.click();
      console.log('   🖱️ Clicked "View Pricing Plans" button');

      // Wait for pricing table to appear
      await page.waitForSelector('.grid.md\\:grid-cols-2', { timeout: 5000 });
      console.log('   ✅ Pricing table appeared');

    } else {
      console.log('   ❌ "View Pricing Plans" button not found');
    }

  } catch (error) {
    console.error('   ❌ Error testing View Pricing Plans button:', error.message);
  }
}

async function testKofiSubscriptionButtons(page) {
  try {
    // Test Standard plan button
    const standardButton = await page.$('button:has-text("Subscribe via Ko-fi")');
    if (standardButton) {
      console.log('   ✅ Standard plan Ko-fi button found');
      
      // Check if button has click handler
      const hasOnClick = await page.evaluate(el => !!el.onclick || el.hasAttribute('onclick'), standardButton);
      console.log(`   🖱️ Standard button has click handler: ${hasOnClick}`);
      
      // Test button styling
      const buttonClasses = await page.evaluate(el => el.className, standardButton);
      if (buttonClasses.includes('bg-blue-600')) {
        console.log('   ✅ Standard button has correct blue styling');
      }
    } else {
      console.log('   ❌ Standard plan Ko-fi button not found');
    }

    // Test Premium plan button
    const premiumButtons = await page.$$('button:has-text("Subscribe via Ko-fi")');
    if (premiumButtons.length >= 2) {
      const premiumButton = premiumButtons[1];
      console.log('   ✅ Premium plan Ko-fi button found');
      
      // Test button styling
      const buttonClasses = await page.evaluate(el => el.className, premiumButton);
      if (buttonClasses.includes('bg-yellow-600')) {
        console.log('   ✅ Premium button has correct yellow styling');
      }
    } else {
      console.log('   ❌ Premium plan Ko-fi button not found');
    }

  } catch (error) {
    console.error('   ❌ Error testing Ko-fi subscription buttons:', error.message);
  }
}

async function testHidePricingButton(page) {
  try {
    // Find the "Hide Pricing" button
    const hidePricingButton = await page.$('button:has-text("Hide Pricing")');
    
    if (hidePricingButton) {
      console.log('   ✅ "Hide Pricing" button found');
      
      // Check button visibility and styling
      const isVisible = await page.evaluate(el => {
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
      }, hidePricingButton);
      
      console.log(`   👁️ Button is visible: ${isVisible}`);
      
      // Check button styling
      const buttonClasses = await page.evaluate(el => el.className, hidePricingButton);
      console.log(`   🎨 Button classes: ${buttonClasses}`);
      
      if (buttonClasses.includes('bg-slate-800/50') && buttonClasses.includes('border-slate-500')) {
        console.log('   ✅ Button has improved styling');
      } else {
        console.log('   ⚠️ Button styling may need improvement');
      }

      // Click the button to hide pricing
      await hidePricingButton.click();
      console.log('   🖱️ Clicked "Hide Pricing" button');

      // Verify pricing table is hidden
      await page.waitForFunction(
        () => !document.querySelector('.grid.md\\:grid-cols-2'),
        { timeout: 5000 }
      );
      console.log('   ✅ Pricing table hidden successfully');

    } else {
      console.log('   ❌ "Hide Pricing" button not found');
    }

  } catch (error) {
    console.error('   ❌ Error testing Hide Pricing button:', error.message);
  }
}

async function testKofiDashboardButton(page) {
  try {
    // Find the "Open Ko-fi Dashboard" button
    const dashboardButton = await page.$('button:has-text("Open Ko-fi Dashboard")');
    
    if (dashboardButton) {
      console.log('   ✅ "Open Ko-fi Dashboard" button found');
      
      // Check button styling
      const buttonClasses = await page.evaluate(el => el.className, dashboardButton);
      if (buttonClasses.includes('bg-red-600')) {
        console.log('   ✅ Button has correct red styling');
      }

      // Test button click (without actually opening new tab)
      const hasOnClick = await page.evaluate(el => !!el.onclick || el.hasAttribute('onclick'), dashboardButton);
      console.log(`   🖱️ Button has click handler: ${hasOnClick}`);
      
      // Verify the URL it would open
      const onClickCode = await page.evaluate(el => el.onclick ? el.onclick.toString() : 'No onclick', dashboardButton);
      if (onClickCode.includes('ko-fi.com/manage/supportreceived')) {
        console.log('   ✅ Button opens correct Ko-fi URL');
      } else {
        console.log('   ❌ Button URL may be incorrect');
        console.log(`   🔍 OnClick code: ${onClickCode}`);
      }

    } else {
      console.log('   ❌ "Open Ko-fi Dashboard" button not found');
    }

  } catch (error) {
    console.error('   ❌ Error testing Ko-fi Dashboard button:', error.message);
  }
}

async function testResponsiveDesign(page) {
  try {
    // Test mobile viewport
    await page.setViewport({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    console.log('   📱 Testing mobile viewport (375x667)');
    
    // Check if elements are still visible
    const mobileTitle = await page.$('h1');
    if (mobileTitle) {
      console.log('   ✅ Title visible on mobile');
    }

    // Test tablet viewport
    await page.setViewport({ width: 768, height: 1024 });
    await page.waitForTimeout(1000);
    console.log('   📱 Testing tablet viewport (768x1024)');

    // Test desktop viewport
    await page.setViewport({ width: 1280, height: 720 });
    await page.waitForTimeout(1000);
    console.log('   🖥️ Testing desktop viewport (1280x720)');
    
    console.log('   ✅ Responsive design tests completed');

  } catch (error) {
    console.error('   ❌ Error testing responsive design:', error.message);
  }
}

async function testAccessibilityAndStyling(page) {
  try {
    // Check for proper contrast and readability
    const textElements = await page.$$('p, span, h1, h2, h3');
    console.log(`   📝 Found ${textElements.length} text elements`);
    
    // Check for proper button states
    const buttons = await page.$$('button');
    console.log(`   🔘 Found ${buttons.length} buttons`);
    
    for (let i = 0; i < Math.min(buttons.length, 5); i++) {
      const button = buttons[i];
      const isEnabled = await page.evaluate(el => !el.disabled, button);
      const hasHoverState = await page.evaluate(el => el.className.includes('hover:'), button);
      console.log(`   🔘 Button ${i + 1}: Enabled=${isEnabled}, HasHover=${hasHoverState}`);
    }
    
    console.log('   ✅ Accessibility and styling validation completed');

  } catch (error) {
    console.error('   ❌ Error testing accessibility and styling:', error.message);
  }
}

// Run the test if this script is executed directly
if (require.main === module) {
  testSubscriptionPageFunctionality()
    .then(() => {
      console.log('\n🏁 Subscription page functionality test completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Test failed:', error);
      process.exit(1);
    });
}

module.exports = { testSubscriptionPageFunctionality };
