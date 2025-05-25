# Clerk Subscription Plan Configuration

## 🎯 **Plan ID Integration**

The Valorant Missions application has been configured to work with your specific Clerk subscription plan IDs:

### **Plan Mapping**
- **Standard Plan**: `cplan_2xb4nXJsuap2kli8KvX3bIgIPAA`
  - Price: $3/month
  - Features: Up to 5 active missions
  
- **Premium Plan**: `cplan_2xb4qlrucukzKqSlMKtE7pvJdq9`
  - Price: $10/month
  - Features: Up to 10 active missions

## 🔧 **Implementation Details**

### **1. Firebase Admin Configuration**
```typescript
// src/lib/firebase-admin.ts
export const SUBSCRIPTION_TIERS = {
  standard: {
    clerkPlanId: 'cplan_2xb4nXJsuap2kli8KvX3bIgIPAA',
    maxActiveMissions: 5,
    price: 3
  },
  premium: {
    clerkPlanId: 'cplan_2xb4qlrucukzKqSlMKtE7pvJdq9',
    maxActiveMissions: 10,
    price: 10
  }
}
```

### **2. Plan ID Utilities**
- `getTierFromClerkPlanId(planId)` - Convert plan ID to tier
- `getClerkPlanIdFromTier(tier)` - Convert tier to plan ID
- Automatic validation of plan ID and tier consistency

### **3. API Integration**
- `/api/subscriptions` POST endpoint validates plan IDs
- `/api/webhooks/clerk` handles subscription events with plan IDs
- Automatic tier assignment based on Clerk plan IDs

### **4. UI Components**
- PricingTable displays your specific plans
- Plan IDs shown in subscription management interface
- Automatic plan selection and validation

## 🔄 **Webhook Configuration**

### **Webhook Endpoint**
- URL: `https://your-domain.com/api/webhooks/clerk`
- Events: `subscription.created`, `subscription.updated`, `subscription.deleted`

### **Webhook Events Handled**
1. **subscription.created/updated**:
   - Extracts `plan_id` from webhook data
   - Maps to correct tier using `getTierFromClerkPlanId()`
   - Updates user subscription and mission limits

2. **subscription.deleted/cancelled**:
   - Downgrades user to free tier
   - Resets mission limits to 3

### **Security**
- Webhook signature verification using svix
- Environment variable: `CLERK_WEBHOOK_SECRET`

## 🧪 **Testing Plan ID Integration**

### **1. Manual Testing**
```bash
# Test plan ID to tier conversion
curl -X POST /api/subscriptions \
  -H "Content-Type: application/json" \
  -d '{"planId": "cplan_2xb4nXJsuap2kli8KvX3bIgIPAA"}'
# Should return tier: "standard"

curl -X POST /api/subscriptions \
  -H "Content-Type: application/json" \
  -d '{"planId": "cplan_2xb4qlrucukzKqSlMKtE7pvJdq9"}'
# Should return tier: "premium"
```

### **2. Webhook Testing**
- Use Clerk dashboard webhook testing
- Verify subscription events update user tiers correctly
- Check mission limit adjustments

### **3. UI Testing**
- Verify PricingTable shows correct plans
- Test subscription flow end-to-end
- Confirm plan IDs are correctly handled

## 🚀 **Deployment Checklist**

### **Environment Variables**
```bash
# Required for webhook verification
CLERK_WEBHOOK_SECRET=whsec_your_webhook_secret

# Existing Clerk variables
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

### **Clerk Dashboard Setup**
1. ✅ Enable billing/commerce features
2. ✅ Create plans with exact IDs:
   - Standard: `cplan_2xb4nXJsuap2kli8KvX3bIgIPAA`
   - Premium: `cplan_2xb4qlrucukzKqSlMKtE7pvJdq9`
3. ✅ Configure webhook endpoint
4. ✅ Enable subscription events

### **Application Deployment**
1. Deploy with updated plan ID configuration
2. Test webhook endpoint accessibility
3. Verify plan ID mapping works correctly
4. Monitor subscription events in logs

## 🔍 **Monitoring & Debugging**

### **Log Messages to Watch**
```
✅ Subscription updated via webhook: userId, { tier, planId }
📝 Updating subscription for user: userId, { planId, tier }
🔔 Clerk webhook received: subscription.created
```

### **Common Issues**
1. **Plan ID Mismatch**: Check if plan IDs in code match Clerk dashboard
2. **Webhook Failures**: Verify webhook secret and endpoint URL
3. **Tier Assignment**: Ensure plan ID mapping is correct

### **Debug Endpoints**
- `GET /api/subscriptions` - Check current user subscription
- Webhook logs in Clerk dashboard
- Application logs for subscription updates

## ✅ **Success Criteria**

- ✅ Plan IDs correctly mapped to tiers
- ✅ Webhook integration working
- ✅ PricingTable shows correct plans
- ✅ Mission limits adjust based on plan
- ✅ Subscription flow works end-to-end
- ✅ Plan validation prevents mismatches

## 🎯 **Next Steps**

1. **Test Integration**: Verify plan IDs work with your Clerk setup
2. **Monitor Webhooks**: Check subscription events are processed
3. **User Testing**: Test upgrade/downgrade flows
4. **Analytics**: Track subscription conversion rates

The implementation is now fully configured to work with your specific Clerk plan IDs and will automatically handle subscription management, mission limits, and tier assignments based on the plans users select.
