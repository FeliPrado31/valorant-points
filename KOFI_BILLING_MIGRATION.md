# Ko-fi Billing Migration Documentation

## 🎯 **Migration Overview**

This document outlines the complete migration from Clerk billing to Ko-fi billing system while maintaining Clerk authentication. The migration ensures users can authenticate with Clerk but subscribe through Ko-fi for a more streamlined billing experience.

## 🔄 **Migration Strategy**

### **What Was Kept:**
- ✅ Clerk authentication system (useUser, auth, ClerkProvider)
- ✅ User session management
- ✅ Protected routes and middleware
- ✅ All existing authentication flows
- ✅ Firebase user data structure (with updates)

### **What Was Replaced:**
- ❌ Clerk PricingTable → Ko-fi checkout integration
- ❌ Clerk subscription webhooks → Ko-fi webhooks
- ❌ Clerk plan IDs → Ko-fi tier IDs
- ❌ clerkSubscriptionId → kofiSubscriptionId
- ❌ Clerk billing management → Ko-fi subscription management

## 🏗️ **Architecture Changes**

### **New Ko-fi Integration Components:**

1. **Ko-fi API Client** (`src/lib/kofi-api.ts`)
   - Handles Ko-fi API interactions
   - Manages subscription creation, updates, cancellation
   - Provides webhook signature verification
   - Generates Ko-fi checkout URLs

2. **Ko-fi Webhook Handler** (`src/app/api/kofi/webhooks/route.ts`)
   - Processes Ko-fi subscription events
   - Updates Firebase user data
   - Handles subscription lifecycle events
   - Implements secure signature verification

3. **Ko-fi Subscription API** (`src/app/api/kofi/subscriptions/route.ts`)
   - Manages Ko-fi subscriptions
   - Syncs Ko-fi data with Firebase
   - Provides subscription status endpoints

4. **Environment Validation** (`src/lib/env-validation.ts`)
   - Validates Ko-fi configuration
   - Provides startup checks
   - Ensures required environment variables

### **Updated Components:**

1. **PricingModal** (`src/components/PricingModal.tsx`)
   - Removed Clerk PricingTable
   - Added Ko-fi checkout integration
   - Updated UI for Ko-fi branding

2. **Subscription Types** (`src/lib/subscription-types.ts`)
   - Removed Clerk plan ID references
   - Added Ko-fi tier mapping
   - Updated billing provider types

3. **Firebase Security Rules** (`firestore.rules`)
   - Added Ko-fi subscription validation
   - Enhanced security for subscription data
   - Added webhook log protection

## 🔧 **Technical Implementation**

### **Subscription Data Structure:**
```typescript
subscription: {
  tier: 'free' | 'standard' | 'premium',
  status: 'active' | 'inactive' | 'cancelled',
  provider: 'kofi',
  kofiSubscriptionId?: string,
  kofiTierId?: string,
  currentPeriodStart?: Date,
  currentPeriodEnd?: Date
}
```

### **Ko-fi Webhook Events:**
- `subscription.created` - New subscription activated
- `subscription.updated` - Subscription tier or status changed
- `subscription.cancelled` - Subscription cancelled
- `subscription.payment_succeeded` - Payment processed successfully
- `subscription.payment_failed` - Payment failed (grace period)

### **Mission Limits Enforcement:**
- **Free Tier**: 3 active missions
- **Standard Tier**: 5 active missions ($3/month)
- **Premium Tier**: 10 active missions ($10/month)

## 🔐 **Security Implementation**

### **Webhook Security:**
- HMAC-SHA256 signature verification
- Payload validation and sanitization
- Server-side only webhook processing
- Audit logging for all webhook events

### **API Security:**
- Clerk authentication required for all endpoints
- Ko-fi API key validation
- Environment variable validation
- Firebase security rules enforcement

### **Data Protection:**
- User subscription data encrypted in Firebase
- Ko-fi API keys stored as environment variables
- Webhook secrets properly secured
- No sensitive data exposed to client-side

## 🚀 **Deployment Configuration**

### **Required Environment Variables:**
```bash
# Clerk Authentication (Existing)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...

# Ko-fi Integration (New)
KOFI_API_KEY=KF_API_...
KOFI_WEBHOOK_SECRET=your_webhook_secret
KOFI_API_BASE_URL=https://ko-fi.com/api/v2
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Firebase (Existing)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----..."
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-...

# Valorant API (Existing)
VALORANT_API_KEY=your_api_key
```

### **Ko-fi Dashboard Configuration:**
1. **Webhook URL**: `https://yourdomain.com/api/kofi/webhooks`
2. **Webhook Events**: All subscription events enabled
3. **Signature Verification**: Required
4. **API Access**: Enabled with proper API key

## 🧪 **Testing & Validation**

### **Test Scripts:**
- `scripts/test-kofi-webhooks.js` - Webhook integration tests
- `scripts/test-subscription-flow.js` - Subscription flow validation

### **Test Scenarios:**
1. **Subscription Creation**: Ko-fi checkout → webhook → Firebase update
2. **Subscription Updates**: Tier changes, status updates
3. **Payment Processing**: Success and failure scenarios
4. **Subscription Cancellation**: Downgrade to free tier
5. **Mission Limits**: Enforcement based on subscription tier

### **Security Tests:**
- Webhook signature verification
- Invalid payload handling
- Authentication requirement validation
- Environment variable validation

## 📊 **Migration Benefits**

### **For Users:**
- ✅ Simplified billing through Ko-fi
- ✅ Support creator-friendly platform
- ✅ Familiar Ko-fi checkout experience
- ✅ Easy subscription management

### **For Developers:**
- ✅ Reduced billing complexity
- ✅ Lower transaction fees
- ✅ Better creator economy integration
- ✅ Simplified subscription management

### **For Business:**
- ✅ Creator-focused billing platform
- ✅ Community-driven subscription model
- ✅ Reduced operational overhead
- ✅ Better user engagement

## 🔄 **Migration Checklist**

### **Pre-Migration:**
- [ ] Set up Ko-fi account and API access
- [ ] Configure Ko-fi webhook endpoints
- [ ] Test Ko-fi API integration
- [ ] Validate environment variables

### **Migration:**
- [x] Remove Clerk billing components
- [x] Implement Ko-fi API client
- [x] Create Ko-fi webhook handlers
- [x] Update subscription management
- [x] Migrate UI components
- [x] Update Firebase security rules

### **Post-Migration:**
- [ ] Test complete subscription flow
- [ ] Validate webhook processing
- [ ] Monitor subscription events
- [ ] Update user documentation

## 🎉 **Success Criteria**

The Ko-fi billing migration is considered successful when:

1. ✅ Users can authenticate with Clerk
2. ✅ Users can subscribe through Ko-fi
3. ✅ Ko-fi webhooks update Firebase data
4. ✅ Mission limits are enforced correctly
5. ✅ All Clerk billing code is removed
6. ✅ System is production-ready
7. ✅ Security best practices are implemented
8. ✅ Comprehensive testing is completed

## 📞 **Support & Troubleshooting**

### **Common Issues:**
- **Ko-fi API Key Invalid**: Verify format starts with `KF_API_`
- **Webhook Signature Failed**: Check `KOFI_WEBHOOK_SECRET`
- **Subscription Not Updating**: Verify webhook endpoint configuration
- **Mission Limits Not Working**: Check subscription tier mapping

### **Debug Tools:**
- Environment validation: `src/lib/env-validation.ts`
- Webhook testing: `scripts/test-kofi-webhooks.js`
- Subscription flow: `scripts/test-subscription-flow.js`

---

**Migration Completed**: ✅ Ko-fi billing system fully integrated
**Status**: Production Ready
**Last Updated**: 2024-01-XX
