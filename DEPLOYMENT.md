# Deployment Guide

## Environment Variables for Production

When deploying to Vercel or other cloud platforms, you need to set the following environment variables:

### Clerk Authentication
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_WEBHOOK_SECRET=whsec_your_webhook_secret_from_clerk_dashboard
```

### Valorant API
```
VALORANT_API_KEY=your_henrik_api_key
VALORANT_API_BASE_URL=https://api.henrikdev.xyz/valorant/v3
```

### Firebase Admin SDK
Instead of using the `serviceAccountKey.json` file, set these environment variables:

```
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY_ID=your_private_key_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour_private_key_content\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_CLIENT_ID=your_client_id
FIREBASE_CLIENT_X509_CERT_URL=your_cert_url
```

### Next.js
```
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your_secure_random_secret
```

## Clerk Webhook Configuration

### Required Webhook Events
Configure these events in Clerk Dashboard → Webhooks:
```
✅ user.created    - When a new user registers
✅ user.updated    - When user data changes (including subscription metadata)
✅ user.deleted    - When a user account is deleted (optional)
```

**Note:** Clerk does not have dedicated "subscription.*" events. Subscription data should be stored in user metadata and handled via `user.updated` events.

## Security Notes

1. **Never commit the `serviceAccountKey.json` file to version control**
2. **Use environment variables for all sensitive data**
3. **Ensure Firebase security rules are properly configured**
4. **Rotate API keys regularly**
5. **Verify webhook signatures using CLERK_WEBHOOK_SECRET**

## Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Set all environment variables in the Vercel dashboard
3. Deploy the application
4. Verify that Firebase Admin SDK works correctly with environment variables

## Firebase Security Rules

The current Firestore security rules are production-ready:
- Users can only access their own data
- Mission and leaderboard collections are read-only for users
- Proper authentication checks are enforced

## Testing Environment Variables

To test the environment variable setup locally:
1. Remove or rename `serviceAccountKey.json`
2. Ensure all environment variables are set in `.env.local`
3. Start the development server
4. Verify Firebase operations work correctly
