// Base translation interface
export interface BaseTranslations {
  [key: string]: string | BaseTranslations;
}

// Namespace-specific interfaces (will be extended by parallel tasks)
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface CommonTranslations extends BaseTranslations {}
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface NavigationTranslations extends BaseTranslations {}
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface DashboardTranslations extends BaseTranslations {}
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ProfileTranslations extends BaseTranslations {}
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface SetupTranslations extends BaseTranslations {}
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface SubscriptionTranslations extends BaseTranslations {}
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface MissionsTranslations extends BaseTranslations {}
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ErrorsTranslations extends BaseTranslations {}

// Global translation interface
export interface Translations {
  common: CommonTranslations;
  navigation: NavigationTranslations;
  dashboard: DashboardTranslations;
  profile: ProfileTranslations;
  setup: SetupTranslations;
  subscription: SubscriptionTranslations;
  missions: MissionsTranslations;
  errors: ErrorsTranslations;
}

// Utility types for parallel development
export type TranslationKey<T extends keyof Translations> = keyof Translations[T];
export type TranslationValue<T extends keyof Translations, K extends TranslationKey<T>> = 
  Translations[T][K];
