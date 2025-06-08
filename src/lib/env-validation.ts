/**
 * Environment Variable Validation
 * Validates required environment variables for Ko-fi integration
 */

interface EnvironmentConfig {
  // Clerk Authentication (Required)
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: string;
  CLERK_SECRET_KEY: string;

  // Ko-fi Integration (Required for billing)
  KOFI_API_KEY?: string;
  KOFI_WEBHOOK_SECRET?: string;
  KOFI_API_BASE_URL?: string;
  KOFI_PAGE_URL?: string;
  NEXT_PUBLIC_APP_URL?: string;

  // Firebase (Required)
  FIREBASE_PROJECT_ID: string;
  FIREBASE_PRIVATE_KEY: string;
  FIREBASE_CLIENT_EMAIL: string;

  // Valorant API (Required)
  VALORANT_API_KEY: string;

  // Environment
  NODE_ENV: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  config: Partial<EnvironmentConfig>;
}

/**
 * Validates all required environment variables
 */
export function validateEnvironmentVariables(): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const config: Partial<EnvironmentConfig> = {};

  // Required Clerk variables
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    errors.push('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is required for authentication');
  } else {
    config.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  }

  if (!process.env.CLERK_SECRET_KEY) {
    errors.push('CLERK_SECRET_KEY is required for authentication');
  } else {
    config.CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;
  }

  // Ko-fi variables (warnings if missing, as billing might be optional in development)
  if (!process.env.KOFI_API_KEY) {
    warnings.push('KOFI_API_KEY is not set - Ko-fi subscription features will not work');
  } else {
    config.KOFI_API_KEY = process.env.KOFI_API_KEY;
    
    // Validate Ko-fi API key format
    if (!process.env.KOFI_API_KEY.startsWith('KF_API_')) {
      warnings.push('KOFI_API_KEY should start with "KF_API_" - please verify the format');
    }
  }

  if (!process.env.KOFI_WEBHOOK_SECRET) {
    warnings.push('KOFI_WEBHOOK_SECRET is not set - Ko-fi webhooks will not work');
  } else {
    config.KOFI_WEBHOOK_SECRET = process.env.KOFI_WEBHOOK_SECRET;
  }

  if (!process.env.KOFI_PAGE_URL) {
    warnings.push('KOFI_PAGE_URL is not set - using default Ko-fi page URL');
    config.KOFI_PAGE_URL = 'https://ko-fi.com/valorantmissions';
  } else {
    config.KOFI_PAGE_URL = process.env.KOFI_PAGE_URL;

    // Validate Ko-fi page URL format
    if (!process.env.KOFI_PAGE_URL.startsWith('https://ko-fi.com/')) {
      warnings.push('KOFI_PAGE_URL should start with "https://ko-fi.com/" - please verify the URL');
    }
  }

  config.KOFI_API_BASE_URL = process.env.KOFI_API_BASE_URL || 'https://ko-fi.com/api/v2';

  if (!process.env.NEXT_PUBLIC_APP_URL) {
    warnings.push('NEXT_PUBLIC_APP_URL is not set - Ko-fi redirects may not work correctly');
  } else {
    config.NEXT_PUBLIC_APP_URL = process.env.NEXT_PUBLIC_APP_URL;
  }

  // Required Firebase variables
  if (!process.env.FIREBASE_PROJECT_ID) {
    errors.push('FIREBASE_PROJECT_ID is required for database operations');
  } else {
    config.FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID;
  }

  if (!process.env.FIREBASE_PRIVATE_KEY) {
    errors.push('FIREBASE_PRIVATE_KEY is required for database operations');
  } else {
    config.FIREBASE_PRIVATE_KEY = process.env.FIREBASE_PRIVATE_KEY;
  }

  if (!process.env.FIREBASE_CLIENT_EMAIL) {
    errors.push('FIREBASE_CLIENT_EMAIL is required for database operations');
  } else {
    config.FIREBASE_CLIENT_EMAIL = process.env.FIREBASE_CLIENT_EMAIL;
  }

  // Required Valorant API
  if (!process.env.VALORANT_API_KEY) {
    errors.push('VALORANT_API_KEY is required for Valorant data integration');
  } else {
    config.VALORANT_API_KEY = process.env.VALORANT_API_KEY;
  }

  // Environment
  config.NODE_ENV = process.env.NODE_ENV || 'development';

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    config
  };
}

/**
 * Logs environment validation results
 */
export function logEnvironmentValidation(): ValidationResult {
  const result = validateEnvironmentVariables();

  console.log('\n🔧 Environment Variable Validation');
  console.log('=====================================');

  if (result.isValid) {
    console.log('✅ All required environment variables are set');
  } else {
    console.log('❌ Missing required environment variables:');
    result.errors.forEach(error => console.log(`   • ${error}`));
  }

  if (result.warnings.length > 0) {
    console.log('\n⚠️ Warnings:');
    result.warnings.forEach(warning => console.log(`   • ${warning}`));
  }

  console.log('\n📋 Configuration Summary:');
  console.log(`   • Environment: ${result.config.NODE_ENV}`);
  console.log(`   • Clerk Auth: ${result.config.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? '✅' : '❌'}`);
  console.log(`   • Ko-fi API: ${result.config.KOFI_API_KEY ? '✅' : '⚠️'}`);
  console.log(`   • Ko-fi Webhooks: ${result.config.KOFI_WEBHOOK_SECRET ? '✅' : '⚠️'}`);
  console.log(`   • Ko-fi Page: ${result.config.KOFI_PAGE_URL ? '✅' : '⚠️'}`);
  console.log(`   • Firebase: ${result.config.FIREBASE_PROJECT_ID ? '✅' : '❌'}`);
  console.log(`   • Valorant API: ${result.config.VALORANT_API_KEY ? '✅' : '❌'}`);

  console.log('=====================================\n');

  return result;
}

/**
 * Validates Ko-fi specific configuration
 */
export function validateKofiConfiguration(): boolean {
  const hasApiKey = Boolean(process.env.KOFI_API_KEY);
  const hasWebhookSecret = Boolean(process.env.KOFI_WEBHOOK_SECRET);
  const hasAppUrl = Boolean(process.env.NEXT_PUBLIC_APP_URL);
  const hasPageUrl = Boolean(process.env.KOFI_PAGE_URL);

  if (!hasApiKey || !hasWebhookSecret || !hasAppUrl) {
    console.warn('⚠️ Ko-fi configuration incomplete:');
    if (!hasApiKey) console.warn('   • KOFI_API_KEY missing');
    if (!hasWebhookSecret) console.warn('   • KOFI_WEBHOOK_SECRET missing');
    if (!hasAppUrl) console.warn('   • NEXT_PUBLIC_APP_URL missing');
    if (!hasPageUrl) console.warn('   • KOFI_PAGE_URL missing (will use default)');
    console.warn('   Ko-fi billing features will be disabled');
    return false;
  }

  // Validate Ko-fi page URL format if provided
  if (hasPageUrl && !process.env.KOFI_PAGE_URL?.startsWith('https://ko-fi.com/')) {
    console.warn('⚠️ KOFI_PAGE_URL should start with "https://ko-fi.com/"');
  }

  console.log('✅ Ko-fi configuration validated successfully');
  return true;
}

/**
 * Gets Ko-fi configuration status
 */
export function getKofiConfigStatus(): {
  isConfigured: boolean;
  hasApiKey: boolean;
  hasWebhookSecret: boolean;
  hasAppUrl: boolean;
  hasPageUrl: boolean;
} {
  return {
    isConfigured: validateKofiConfiguration(),
    hasApiKey: Boolean(process.env.KOFI_API_KEY),
    hasWebhookSecret: Boolean(process.env.KOFI_WEBHOOK_SECRET),
    hasAppUrl: Boolean(process.env.NEXT_PUBLIC_APP_URL),
    hasPageUrl: Boolean(process.env.KOFI_PAGE_URL)
  };
}

// Auto-validate on import in development
if (process.env.NODE_ENV === 'development') {
  logEnvironmentValidation();
}
