#!/usr/bin/env node

/**
 * Manual script to update subscription status via API
 * This simulates what should happen after a successful subscription purchase
 */

const baseUrl = 'http://localhost:3000';

async function updateSubscription() {
  console.log('🧪 Manually updating subscription to Premium\n');

  try {
    // First, let's check the current subscription status
    console.log('📊 Checking current subscription status...');
    const getResponse = await fetch(`${baseUrl}/api/subscriptions`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Note: In a real scenario, this would need proper authentication
        // For testing, we'll rely on the fact that the user is logged in
      }
    });

    if (getResponse.ok) {
      const currentData = await getResponse.json();
      console.log('📋 Current subscription:', JSON.stringify(currentData, null, 2));
    } else {
      console.log('❌ Failed to get current subscription:', getResponse.status);
    }

    // Now update to Premium
    console.log('\n🚀 Updating subscription to Premium...');
    const updatePayload = {
      tier: 'premium',
      planId: 'cplan_2xb4qlrucukzKqSlMKtE7pvJdq9',
      clerkSubscriptionId: 'sub_test_premium_manual'
    };

    console.log('📋 Update payload:', JSON.stringify(updatePayload, null, 2));

    const updateResponse = await fetch(`${baseUrl}/api/subscriptions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatePayload)
    });

    console.log(`📊 Update response status: ${updateResponse.status}`);
    
    if (updateResponse.ok) {
      const updateResult = await updateResponse.json();
      console.log('✅ Subscription updated successfully!');
      console.log('📄 Update result:', JSON.stringify(updateResult, null, 2));
    } else {
      console.log('❌ Subscription update failed');
      const errorText = await updateResponse.text();
      console.log('📄 Error response:', errorText);
    }

    // Check the subscription status again
    console.log('\n📊 Checking updated subscription status...');
    const finalResponse = await fetch(`${baseUrl}/api/subscriptions`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (finalResponse.ok) {
      const finalData = await finalResponse.json();
      console.log('📋 Final subscription:', JSON.stringify(finalData, null, 2));
      
      if (finalData.tier === 'premium') {
        console.log('\n✅ SUCCESS: User is now on Premium tier!');
        console.log(`🎯 Max missions: ${finalData.maxActiveMissions}`);
        console.log(`📊 Available slots: ${finalData.availableSlots}`);
      } else {
        console.log('\n❌ FAILED: User is still on', finalData.tier, 'tier');
      }
    } else {
      console.log('❌ Failed to get final subscription status:', finalResponse.status);
    }

  } catch (error) {
    console.error('❌ Error updating subscription:', error.message);
  }

  console.log('\n📋 Next steps:');
  console.log('1. Refresh the browser at http://localhost:3000/subscription');
  console.log('2. Check if the subscription status shows "Premium Plan"');
  console.log('3. Verify that mission limits show 10 instead of 3');
}

// Run the update
updateSubscription().catch(console.error);
