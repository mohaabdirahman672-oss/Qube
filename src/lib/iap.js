import { Platform } from 'react-native';
import Purchases, { LOG_LEVEL } from 'react-native-purchases';

// RevenueCat wrapper (docs/plans/freemium-paywall-v2.md, decision 6). RevenueCat is
// the source of truth for *displaying* subscription state instantly in the app, but
// never the source of truth the server trusts — supabase/functions/solve and
// flashcard-example check public.user_entitlements instead, kept in sync by
// supabase/functions/revenuecat-webhook. A client-reported "I'm premium" is never
// enough on its own (see that migration's header comment).
//
// `app_user_id` is always set to our own Supabase auth uid (via loginPurchases,
// called right after a session appears) so the webhook's app_user_id === our uid
// with no separate alias-mapping step. Purchases are only ever available to signed-in
// users for exactly this reason — see PaywallScreen.js, which routes a guest to sign
// in before it will start a purchase.

// Must match the entitlement identifier configured in the RevenueCat dashboard
// (Project > Entitlements) for both the monthly and annual products.
export const PREMIUM_ENTITLEMENT_ID = 'premium';

const REVENUECAT_IOS_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY;

let configured = false;

export function initPurchases() {
  if (configured) return;
  if (!REVENUECAT_IOS_KEY) {
    console.log('[iap] EXPO_PUBLIC_REVENUECAT_IOS_KEY not set — purchases disabled');
    return;
  }
  if (Platform.OS !== 'ios') return; // Android/Play Store config is a later addition, not built yet

  if (__DEV__) Purchases.setLogLevel(LOG_LEVEL.DEBUG);
  Purchases.configure({ apiKey: REVENUECAT_IOS_KEY });
  configured = true;
}

// Call once a Supabase session appears (sign-in or app launch with an existing
// session) so RevenueCat's app_user_id matches our uid — required for the webhook
// to know which user_entitlements row to update.
export async function loginPurchases(userId) {
  if (!configured || !userId) return null;
  try {
    const { customerInfo } = await Purchases.logIn(userId);
    return customerInfo;
  } catch (e) {
    console.log('[iap] logIn failed', e?.message);
    return null;
  }
}

export async function logoutPurchases() {
  if (!configured) return;
  try {
    await Purchases.logOut();
  } catch (e) {
    console.log('[iap] logOut failed', e?.message);
  }
}

// Current offering's packages (expects a RevenueCat "Offering" with monthly + annual
// packages, both carrying the 7-day trial intro offer — configured in App Store
// Connect / RevenueCat dashboard, not in code).
export async function getOfferings() {
  if (!configured) return null;
  const offerings = await Purchases.getOfferings();
  return offerings.current;
}

export async function purchasePackage(pkg) {
  const { customerInfo } = await Purchases.purchasePackage(pkg);
  return {
    isPremium: !!customerInfo.entitlements.active[PREMIUM_ENTITLEMENT_ID],
    customerInfo,
  };
}

export async function restorePurchases() {
  const customerInfo = await Purchases.restorePurchases();
  return {
    isPremium: !!customerInfo.entitlements.active[PREMIUM_ENTITLEMENT_ID],
    customerInfo,
  };
}

// Fast, optimistic local read — for UI only. Server-side checks (solve function,
// flashcard-example) never trust this; see file header.
export async function getLocalIsPremium() {
  if (!configured) return false;
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return !!customerInfo.entitlements.active[PREMIUM_ENTITLEMENT_ID];
  } catch (e) {
    console.log('[iap] getCustomerInfo failed', e?.message);
    return false;
  }
}
