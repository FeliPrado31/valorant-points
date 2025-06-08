/**
 * Ko-fi API Client for subscription management
 * Handles Ko-fi API interactions for the Valorant Points application
 */

import { validateKofiConfiguration } from './env-validation';

// Ko-fi API Types
export interface KofiSubscription {
  id: string;
  status: 'active' | 'cancelled' | 'expired' | 'pending';
  tier: 'standard' | 'premium';
  amount: number;
  currency: string;
  created_at: string;
  next_payment_date?: string;
  user_id: string;
  email: string;
}

export interface KofiWebhookEvent {
  type: 'subscription.created' | 'subscription.updated' | 'subscription.cancelled' | 'subscription.payment_succeeded' | 'subscription.payment_failed';
  data: {
    subscription_id: string;
    user_id: string;
    email: string;
    amount: number;
    currency: string;
    tier: string;
    status: string;
    created_at: string;
    next_payment_date?: string;
  };
  timestamp: string;
  signature: string;
}

export interface KofiApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface CreateSubscriptionRequest {
  user_id: string;
  email: string;
  tier: 'standard' | 'premium';
  return_url?: string;
  cancel_url?: string;
}

export interface UpdateSubscriptionRequest {
  subscription_id: string;
  tier?: 'standard' | 'premium';
  status?: 'active' | 'cancelled';
}

/**
 * Ko-fi API Client Class
 * Provides methods for managing subscriptions through Ko-fi API
 */
export class KofiApiClient {
  private apiKey: string;
  private baseUrl: string;
  private webhookSecret: string;

  constructor() {
    this.apiKey = process.env.KOFI_API_KEY || '';
    this.baseUrl = process.env.KOFI_API_BASE_URL || 'https://ko-fi.com/api/v2';
    this.webhookSecret = process.env.KOFI_WEBHOOK_SECRET || '';

    // Validate Ko-fi configuration on initialization
    const isConfigured = validateKofiConfiguration();
    if (!isConfigured) {
      console.warn('⚠️ Ko-fi configuration incomplete. Some features may not work.');
    }

    if (!this.apiKey) {
      console.warn('⚠️ KOFI_API_KEY environment variable is not set. Ko-fi API calls will fail.');
    }
    if (!this.webhookSecret) {
      console.warn('⚠️ KOFI_WEBHOOK_SECRET environment variable is not set. Webhook verification will fail.');
    }
  }

  /**
   * Validates the Ko-fi API key format
   */
  private validateApiKey(): boolean {
    return Boolean(this.apiKey && this.apiKey.startsWith('KF_API_') && this.apiKey.length > 20);
  }

  /**
   * Makes authenticated requests to Ko-fi API
   */
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<KofiApiResponse<T>> {
    if (!this.validateApiKey()) {
      throw new Error('Invalid Ko-fi API key format');
    }

    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'User-Agent': 'ValorantPoints/1.0',
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Ko-fi API Error:', {
          status: response.status,
          statusText: response.statusText,
          data
        });
        
        return {
          success: false,
          error: data.error || `HTTP ${response.status}: ${response.statusText}`,
          message: data.message
        };
      }

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Ko-fi API Request Failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Create a new Ko-fi subscription
   */
  async createSubscription(request: CreateSubscriptionRequest): Promise<KofiApiResponse<KofiSubscription>> {
    const endpoint = '/subscriptions';
    
    // Map tier to Ko-fi pricing
    const tierPricing = {
      standard: { amount: 3, currency: 'USD' },
      premium: { amount: 10, currency: 'USD' }
    };

    const pricing = tierPricing[request.tier];
    
    const payload = {
      user_id: request.user_id,
      email: request.email,
      amount: pricing.amount,
      currency: pricing.currency,
      tier: request.tier,
      return_url: request.return_url || `${process.env.NEXT_PUBLIC_APP_URL}/subscription?success=true`,
      cancel_url: request.cancel_url || `${process.env.NEXT_PUBLIC_APP_URL}/subscription?cancelled=true`,
      metadata: {
        app: 'valorant-points',
        tier: request.tier
      }
    };

    return this.makeRequest<KofiSubscription>(endpoint, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  /**
   * Get subscription details by ID
   */
  async getSubscription(subscriptionId: string): Promise<KofiApiResponse<KofiSubscription>> {
    const endpoint = `/subscriptions/${subscriptionId}`;
    return this.makeRequest<KofiSubscription>(endpoint);
  }

  /**
   * Get subscriptions by user ID
   */
  async getUserSubscriptions(userId: string): Promise<KofiApiResponse<KofiSubscription[]>> {
    const endpoint = `/subscriptions?user_id=${encodeURIComponent(userId)}`;
    return this.makeRequest<KofiSubscription[]>(endpoint);
  }

  /**
   * Update an existing subscription
   */
  async updateSubscription(request: UpdateSubscriptionRequest): Promise<KofiApiResponse<KofiSubscription>> {
    const endpoint = `/subscriptions/${request.subscription_id}`;
    
    const payload = {
      ...(request.tier && { tier: request.tier }),
      ...(request.status && { status: request.status })
    };

    return this.makeRequest<KofiSubscription>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(subscriptionId: string): Promise<KofiApiResponse<void>> {
    const endpoint = `/subscriptions/${subscriptionId}/cancel`;
    return this.makeRequest<void>(endpoint, {
      method: 'POST'
    });
  }

  /**
   * Verify Ko-fi webhook signature
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    if (!signature || !payload) {
      console.error('❌ Missing signature or payload for webhook verification');
      return false;
    }

    if (!this.webhookSecret) {
      console.error('❌ KOFI_WEBHOOK_SECRET not configured');
      return false;
    }

    try {
      // Ko-fi uses HMAC-SHA256 for webhook signatures
      const crypto = require('crypto');

      // Remove any prefix from signature (e.g., "sha256=")
      const cleanSignature = signature.replace(/^sha256=/, '');

      const expectedSignature = crypto
        .createHmac('sha256', this.webhookSecret)
        .update(payload, 'utf8')
        .digest('hex');

      console.log('🔐 Webhook signature verification:', {
        signatureLength: cleanSignature.length,
        expectedLength: expectedSignature.length,
        payloadLength: payload.length
      });

      // Compare signatures using timing-safe comparison
      const isValid = crypto.timingSafeEqual(
        Buffer.from(cleanSignature, 'hex'),
        Buffer.from(expectedSignature, 'hex')
      );

      if (!isValid) {
        console.error('❌ Webhook signature verification failed');
      } else {
        console.log('✅ Webhook signature verified successfully');
      }

      return isValid;
    } catch (error) {
      console.error('❌ Webhook signature verification error:', error);
      return false;
    }
  }

  /**
   * Get checkout URL for a subscription tier
   */
  getCheckoutUrl(tier: 'standard' | 'premium', userId: string, email: string): string {
    const tierPricing = {
      standard: { amount: 3, name: 'Standard Plan' },
      premium: { amount: 10, name: 'Premium Plan' }
    };

    const pricing = tierPricing[tier];
    const baseUrl = 'https://ko-fi.com/s';
    
    // Ko-fi checkout URL format (this may need adjustment based on actual Ko-fi API)
    const params = new URLSearchParams({
      amount: pricing.amount.toString(),
      currency: 'USD',
      title: pricing.name,
      user_id: userId,
      email: email,
      tier: tier,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription?cancelled=true`
    });

    return `${baseUrl}?${params.toString()}`;
  }
}

// Singleton instance
let kofiApiClient: KofiApiClient | null = null;

/**
 * Get Ko-fi API client instance
 */
export function getKofiApiClient(): KofiApiClient {
  if (!kofiApiClient) {
    kofiApiClient = new KofiApiClient();
  }
  return kofiApiClient;
}

/**
 * Utility function to map Ko-fi subscription status to our internal status
 */
export function mapKofiStatusToInternal(kofiStatus: string): 'active' | 'inactive' | 'cancelled' {
  switch (kofiStatus.toLowerCase()) {
    case 'active':
      return 'active';
    case 'cancelled':
    case 'expired':
      return 'cancelled';
    case 'pending':
    default:
      return 'inactive';
  }
}

/**
 * Utility function to map Ko-fi tier to our internal tier
 */
export function mapKofiTierToInternal(kofiTier: string): 'free' | 'standard' | 'premium' {
  switch (kofiTier.toLowerCase()) {
    case 'standard':
      return 'standard';
    case 'premium':
      return 'premium';
    default:
      return 'free';
  }
}
