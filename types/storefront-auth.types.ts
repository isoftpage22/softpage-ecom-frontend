/**
 * Contracts for storefront customer identity (`/api/v1/storefront/auth/*`).
 */

export interface StorefrontTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export type StorefrontLoginMethod = "otp" | "password";

export interface SignupInfoResult {
  success: boolean;
  identityFound: boolean;
  hasProfileForStore: boolean;
  isNewCustomer: boolean;
  availableMethods: StorefrontLoginMethod[];
  otpSent: boolean;
  nextStep: "otp" | "password" | "choose";
  message: string;
}

export interface StorefrontIdentity {
  id: number;
  email: string | null;
  phone: string | null;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  hasPassword?: boolean;
}

export interface StorefrontProfile {
  id: number;
  businessId: number;
  firstName: string | null;
  lastName: string | null;
  displayName: string | null;
  fullName?: string | null;
  email: string | null;
  phone: string | null;
}

export interface AuthResult {
  tokens: StorefrontTokens;
  identity: Pick<StorefrontIdentity, "id" | "email" | "phone">;
  profile: StorefrontProfile;
}

export interface StorefrontMe {
  identity: StorefrontIdentity;
  profile: StorefrontProfile;
}

export interface CustomerAddress {
  id: number;
  fullName: string | null;
  phone: string | null;
  line1: string;
  line2: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
  latitude?: number | null;
  longitude?: number | null;
  label?: string | null;
  isDefaultShipping: boolean;
  isDefaultBilling: boolean;
}

export interface AddressInput {
  fullName?: string;
  phone?: string;
  line1: string;
  line2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  label?: string;
  isDefaultShipping?: boolean;
  isDefaultBilling?: boolean;
}
