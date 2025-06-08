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

    console.log('🔧 Ko-fi API Client initialized:', {
      hasApiKey: !!this.apiKey,
      hasWebhookSecret: !!this.webhookSecret,
      baseUrl: this.baseUrl,
      kofiPageUrl: process.env.KOFI_PAGE_URL || 'https://ko-fi.com/valorantmissions'
    });
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
      console.log('🌐 Making Ko-fi API request:', { url, method: options.method || 'GET' });

      const response = await fetch(url, {
        ...options,
        headers,
      });

      console.log('📡 Ko-fi API response:', {
        status: response.status,
        statusText: response.statusText,
        contentType: response.headers.get('content-type')
      });

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      const isJson = contentType && contentType.includes('application/json');

      let data;
      if (isJson) {
        data = await response.json();
      } else {
        // Response is not JSON (likely HTML error page)
        const textResponse = await response.text();
        console.warn('⚠️ Ko-fi API returned non-JSON response:', textResponse.substring(0, 200));

        return {
          success: false,
          error: `Ko-fi API is not available. The service may be down or the endpoint doesn't exist. (HTTP ${response.status})`,
          message: 'Please try visiting Ko-fi directly'
        };
      }

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
   * Note: This is a mock implementation since Ko-fi doesn't have a public API for subscription creation
   * In production, users would subscribe directly on Ko-fi and webhooks would update our system
   */
  async createSubscription(request: CreateSubscriptionRequest): Promise<KofiApiResponse<KofiSubscription>> {
    console.log('🔔 Ko-fi subscription creation requested:', {
      tier: request.tier,
      user_id: request.user_id,
      email: request.email
    });

    // Since Ko-fi doesn't have a public subscription API, we'll return a mock response
    // and direct users to the Ko-fi page for actual subscription
    console.warn('⚠️ Ko-fi API is not available for subscription creation. Redirecting to Ko-fi page.');

    return {
      success: false,
      error: 'Ko-fi subscription API is not available',
      message: 'Please visit our Ko-fi page to subscribe directly'
    };
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
   * Redirects to the actual Ko-fi page with membership tiers
   */
  getCheckoutUrl(tier: 'standard' | 'premium', userId: string, email: string): string {
    const kofiPageUrl = process.env.KOFI_PAGE_URL || 'https://ko-fi.com/valorantmissions';

    // For Ko-fi memberships, we redirect to the main Ko-fi page
    // Users will select their membership tier on the Ko-fi page
    // Ko-fi will handle the subscription creation and send webhooks back to our app

    console.log('🔗 Generating Ko-fi checkout URL:', {
      tier,
      userId,
      email,
      kofiPageUrl
    });

    // Add query parameters to help Ko-fi identify the user and tier preference
    const params = new URLSearchParams({
      // These parameters may be used by Ko-fi for tracking
      source: 'valorant-points',
      tier: tier,
      user_id: userId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription?success=true`
    });

    // Return the Ko-fi page URL with optional parameters
    return `${kofiPageUrl}?${params.toString()}`;
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
 * Handles both English and Spanish tier names from Ko-fi
 */
export function mapKofiTierToInternal(kofiTier: string): 'free' | 'standard' | 'premium' {
  switch (kofiTier.toLowerCase()) {
    case 'standard':
    case 'estandar': // Spanish version from Ko-fi page
      return 'standard';
    case 'premium':
      return 'premium';
    default:
      console.warn('⚠️ Unknown Ko-fi tier:', kofiTier, '- defaulting to free');
      return 'free';
  }
}
