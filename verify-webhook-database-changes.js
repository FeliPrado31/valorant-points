#!/usr/bin/env node

/**
 * Verify Ko-fi Webhook Database Changes
 * Checks the actual database state after webhook processing
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin SDK
const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID || 'mentoria-b5874',
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID || 'fd2d91faa34422ad86e93d765bad38c8af91ec6c',
  private_key: (process.env.FIREBASE_PRIVATE_KEY || `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDTmbMaaXoCQrgq
LYO7Ps+zxYrl27nRFa2X55ZBjzZzEsAhDnrEiWUH44OST+6+iWUY0IUN0HRdobH8
f52aiWMS+RmHG5s+2jHAtqoBbrZpytrOPYZm8d1KmwENICkOIRwjPyghEYJiAzVi
sJs07ejDatEqDR3Pe8ebdoDCiAsQHXrqlqMIDBxa0TnkNNZLgry4k+ijI31q6IKT
vK61C4Dc5EHVebnI21tITTXFgCfNUiiNUAo+KSRZNACQHKtKTI17fFDgWRbTGKc3
phXoTnjY1U5X9ZjenDCtpmp0fpRcqCxiSyFZcidra9WeURzpdwKZ74pqV4b69yHC
fyoyqnl9AgMBAAECggEAE/roIMcTZHnA0oi8LtbSPW8ae7RY8h96JgUR2MxpT4nW
dvibSooPrmRDBPKDwF2QXHy6B5Emn724JPe23cP5xS2cxbdrXA610nTdDigSVOB4
8y73jSpq4xPKUF84STOCqOhahW7WESOs643yBdguGZ+xMueMqE4PjcQtidDXPJTk
E5XkF85z54OMFFITlicoe1ASjHvou3x9XcTj+Qb00Jj2PE5AJB/2v0LSA3fTEfnc
8cNdib/V0qd96JJsoDJWDIiet8Iekvbjh4lAbOC28PDMa52IkY03hfIyP2QsFaKr
LQZuqqejOLKLJPMc+Uk0G8RJhdQRkqmlj6+Mo9H7AQKBgQDkkHf0rvWWxyJ3Rij2
Q1WbWEnkwi9e4fiztnh6nQp8bt7JReJ+xGeZXtept+81x49MXJQsbKLSROLXt6E8
UjSHABNIu5G4B05/Zyet1mokwKk9mCoVx5+hyMT8p3MJgt+DgM1Qj9Cc1+TipzEl
2B48GigIkLvh8XwDf9yg90s1AQKBgQDs//KdsF0ef2yg4vsdQizq/4aDJbMmrbRQ
yvM8Ig875ysnh3kDTIMcTbvx/okNf+UN/jsC2Vvk3cpWFwyGrcF+EvfLkxW6xqQL
et6cb/VmjH22XLK22VCN5Pw6UwVhI2jg0vIllwOfD4TYh++OeJsqjPWnA9odk2/A
01vavnmYfQKBgDIYZ/I9Fp7BbpBt1DSFdZHiu+9jkDZfmL7q02UsXkv/kNzUcFwQ
eBRpcSNFqSxEXOgDsoY6GUW0y3M0UCaEbfbY0WEzmzCWiWHrHgs/32vGvlE9tJup
cRdohaRKnzAKeyq7ZESwAK0ftI7oziDZSWcq5HNcJZHT97Zco+Kz0MwBAoGBAJXR
krh2ZddCrBPkiOPNEoIXuButuFuqEUPFmA+aZFD06IXbkPcx5ev9g+MNiev7vnuj
DADYEMxUHHVhqqx0qM2fBgAt4d2pdsg/CvyPle0WwN2IKf2G0PJyH7RrCQqIDOOa
1jJHDaX+dHdBL4G74jL62suSls59hna55eYY5NstAoGBAIPMVMfLXTZDdlZo5q28
769YC03D6iZ37sVBMb2L7uDr3stoAhV2sn/JKp38TyoYEoRpaq3auO+Kf84oF2rV
X/nzClRR70a0GGpJ7G9Au6RPh+5yRjxVnV7B7JiSA8li3q0hz0ItalQIX7dZEY/K
ERWzcXuTWqZlhn4IQpSpW7XY
-----END PRIVATE KEY-----`).replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL || 'firebase-adminsdk-2zbav@mentoria-b5874.iam.gserviceaccount.com',
  client_id: process.env.FIREBASE_CLIENT_ID || '102986691011653072439',
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL || 'https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-2zbav%40mentoria-b5874.iam.gserviceaccount.com',
  universe_domain: "googleapis.com"
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id,
  });
}

const db = admin.firestore();

const TEST_USER_ID = 'user_2xcBNbvR9Ft7KghNRQcEi3nPPpE';

async function verifyWebhookDatabaseChanges() {
  console.log('🔍 VERIFYING KO-FI WEBHOOK DATABASE CHANGES');
  console.log('='.repeat(70));
  console.log(`📋 Test User ID: ${TEST_USER_ID}`);
  console.log('');

  try {
    // Get current user data
    const userDoc = await db.collection('users').doc(TEST_USER_ID).get();
    
    if (!userDoc.exists) {
      throw new Error('Test user not found in database');
    }

    const userData = userDoc.data();
    
    console.log('📊 CURRENT USER DATA:');
    console.log('='.repeat(50));
    
    // Basic user info
    console.log('👤 User Information:');
    console.log(`   📧 Email: ${userData.email}`);
    console.log(`   👤 Username: ${userData.username}`);
    console.log(`   🎮 Valorant Tag: ${userData.valorantTag}`);
    console.log(`   📅 Created: ${userData.createdAt?.toDate?.()?.toISOString() || userData.createdAt}`);
    console.log(`   🔄 Updated: ${userData.updatedAt?.toDate?.()?.toISOString() || userData.updatedAt}`);
    
    // Subscription details
    console.log('\n💳 Subscription Information:');
    if (userData.subscription) {
      console.log(`   🎯 Tier: ${userData.subscription.tier}`);
      console.log(`   📊 Status: ${userData.subscription.status}`);
      console.log(`   🏪 Provider: ${userData.subscription.provider}`);
      console.log(`   🆔 Ko-fi Subscription ID: ${userData.subscription.kofiSubscriptionId || 'Not set'}`);
      console.log(`   🏷️ Ko-fi Tier ID: ${userData.subscription.kofiTierId || 'Not set'}`);
      console.log(`   📅 Period Start: ${userData.subscription.currentPeriodStart?.toDate?.()?.toISOString() || userData.subscription.currentPeriodStart || 'Not set'}`);
      console.log(`   📅 Period End: ${userData.subscription.currentPeriodEnd?.toDate?.()?.toISOString() || userData.subscription.currentPeriodEnd || 'Not set'}`);
    } else {
      console.log('   ❌ No subscription data found');
    }
    
    // Mission limits
    console.log('\n🎯 Mission Limits:');
    if (userData.missionLimits) {
      console.log(`   📊 Max Active Missions: ${userData.missionLimits.maxActiveMissions}`);
      console.log(`   🎫 Available Slots: ${userData.missionLimits.availableSlots}`);
      console.log(`   🔄 Last Refresh: ${userData.missionLimits.lastRefresh?.toDate?.()?.toISOString() || userData.missionLimits.lastRefresh}`);
      console.log(`   ⏰ Next Refresh: ${userData.missionLimits.nextRefresh?.toDate?.()?.toISOString() || userData.missionLimits.nextRefresh}`);
    } else {
      console.log('   ❌ No mission limits data found');
    }

    // Validation
    console.log('\n✅ WEBHOOK INTEGRATION VALIDATION:');
    console.log('='.repeat(50));
    
    const validations = [];
    
    // Check subscription tier
    if (userData.subscription?.tier === 'standard') {
      validations.push('✅ Subscription tier updated to "standard"');
    } else {
      validations.push(`❌ Expected tier "standard", got "${userData.subscription?.tier}"`);
    }
    
    // Check subscription status
    if (userData.subscription?.status === 'active') {
      validations.push('✅ Subscription status is "active"');
    } else {
      validations.push(`❌ Expected status "active", got "${userData.subscription?.status}"`);
    }
    
    // Check Ko-fi subscription ID
    if (userData.subscription?.kofiSubscriptionId === 'kofi_sub_test_standard_123') {
      validations.push('✅ Ko-fi subscription ID set correctly');
    } else {
      validations.push(`❌ Expected Ko-fi subscription ID "kofi_sub_test_standard_123", got "${userData.subscription?.kofiSubscriptionId}"`);
    }
    
    // Check mission limits
    if (userData.missionLimits?.maxActiveMissions === 5) {
      validations.push('✅ Max active missions updated to 5 (standard tier)');
    } else {
      validations.push(`❌ Expected max active missions 5, got ${userData.missionLimits?.maxActiveMissions}`);
    }
    
    // Check available slots
    if (userData.missionLimits?.availableSlots === 5) {
      validations.push('✅ Available slots reset to 5');
    } else {
      validations.push(`❌ Expected available slots 5, got ${userData.missionLimits?.availableSlots}`);
    }
    
    // Print validation results
    validations.forEach(validation => console.log(`   ${validation}`));
    
    // Overall result
    const allPassed = validations.every(v => v.startsWith('✅'));
    console.log('\n🎯 OVERALL RESULT:');
    if (allPassed) {
      console.log('   🎉 ALL VALIDATIONS PASSED - Ko-fi webhook integration working correctly!');
    } else {
      console.log('   ❌ Some validations failed - Ko-fi webhook integration needs attention');
    }
    
    return allPassed;

  } catch (error) {
    console.error('❌ Error verifying webhook database changes:', error);
    throw error;
  }
}

// Run the verification
if (require.main === module) {
  verifyWebhookDatabaseChanges()
    .then((success) => {
      console.log('\n🏁 Verification completed');
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('\n💥 Verification failed:', error);
      process.exit(1);
    });
}

module.exports = { verifyWebhookDatabaseChanges };
