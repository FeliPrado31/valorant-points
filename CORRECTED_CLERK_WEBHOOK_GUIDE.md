# 🔧 **CORRECTED Clerk Webhook Configuration Guide**

## **❌ IMPORTANT CORRECTION**

**Clerk does NOT have dedicated subscription webhook events.** The events `subscription.created`, `subscription.updated`, `subscription.deleted`, and `subscription.cancelled` **DO NOT EXIST** in Clerk's webhook system.

## **✅ Correct Approach: Use User Events + Metadata**

### **Step 1: Correct Webhook Events in Clerk Dashboard**

1. Go to [Clerk Dashboard](https://dashboard.clerk.com) → **Webhooks**
2. Create/Edit your webhook endpoint
3. **Subscribe to these events ONLY:**

```
✅ user.created    - When a new user registers
✅ user.updated    - When user data changes (including metadata)
✅ user.deleted    - When a user account is deleted (optional)
```

### **Step 2: Subscription Data Storage Strategy**

Instead of dedicated subscription events, store subscription data in Clerk user metadata:

#### **Option A: Private Metadata (Recommended)**
```javascript
// When user subscribes (in your subscription handler)
await clerkClient.users.updateUserMetadata(userId, {
  privateMetadata: {
    subscription: {
      planId: 'cplan_2xb4nXJsuap2kli8KvX3bIgIPAA',
      status: 'active',
      subscriptionId: 'sub_123',
      tier: 'standard'
    }
  }
});
```

#### **Option B: Public Metadata**
```javascript
// If you need frontend access to subscription data
await clerkClient.users.updateUserMetadata(userId, {
  publicMetadata: {
    subscription: {
      planId: 'cplan_2xb4nXJsuap2kli8KvX3bIgIPAA',
      status: 'active',
      tier: 'standard'
    }
  }
});
```

### **Step 3: Webhook Handler Logic**

The corrected webhook handler now:

1. **user.created**: Creates new user profile with free tier defaults
2. **user.updated**: Checks for subscription data in metadata and updates accordingly
3. **user.deleted**: Cleans up user data and missions

### **Step 4: Integration with External Billing (Stripe/Paddle)**

If using external billing providers, update Clerk metadata in your billing webhooks:

```javascript
// In your Stripe webhook handler
app.post('/api/webhooks/stripe', async (req, res) => {
  const event = req.body;
  
  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      // Update Clerk user metadata
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
          subscription: {
            planId: getPlanIdFromStripePrice(event.data.object.items.data[0].price.id),
            status: event.data.object.status,
            subscriptionId: event.data.object.id,
            tier: getTierFromStripePrice(event.data.object.items.data[0].price.id)
          }
        }
      });
      break;
  }
});
```

### **Step 5: Environment Variables**

```bash
# .env.local
CLERK_WEBHOOK_SECRET=whsec_your_actual_webhook_secret_here
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

### **Step 6: Testing the Corrected Setup**

1. **Test user.created**: Register a new user
2. **Test user.updated**: Update user metadata with subscription data
3. **Test user.deleted**: Delete a user account

## **📋 Migration Checklist**

- [ ] **Remove non-existent subscription events from webhook configuration**
- [ ] **Add user.created, user.updated, user.deleted events**
- [ ] **Update webhook handler to use correct event types**
- [ ] **Implement metadata-based subscription management**
- [ ] **Test webhook with actual Clerk events**
- [ ] **Update documentation and deployment guides**

## **🎯 Key Takeaways**

1. **Clerk webhooks are user-centric, not subscription-centric**
2. **Use metadata to store subscription information**
3. **Handle subscription changes via user.updated events**
4. **Integrate with external billing providers through their webhooks**
5. **Always verify webhook signatures for security**

This corrected approach aligns with Clerk's actual webhook system and provides a robust foundation for subscription management in your Valorant application.
