import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { fetchWeeklyUsage, mergeGuestUsageIntoAccount } from '../lib/weeklyUsage';
import { initPurchases, loginPurchases, logoutPurchases, getLocalIsPremium } from '../lib/iap';

// Single source of app-wide subscription/usage state (docs/plans/freemium-paywall-v2.md).
// isPremium here is the SERVER-verified value from weekly-usage (which checks
// public.user_entitlements) — not the RevenueCat SDK's local cache, which is only
// used as an optimistic hint right after a purchase, before the webhook/DB catch up.

const SubscriptionContext = createContext(null);

export function useSubscription() {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) throw new Error('useSubscription must be used inside SubscriptionProvider');
  return ctx;
}

export function SubscriptionProvider({ children }) {
  const { session } = useAuth();
  const [isPremium, setIsPremium] = useState(false);
  const [weeklyRemaining, setWeeklyRemaining] = useState(null);
  const [weeklyLimit, setWeeklyLimit] = useState(20);
  const [resetsOn, setResetsOn] = useState(null);
  const [loading, setLoading] = useState(true);
  const initedRef = useRef(false);

  const refresh = useCallback(async () => {
    try {
      const data = await fetchWeeklyUsage();
      setIsPremium(!!data.isPremium);
      setWeeklyRemaining(data.remaining);
      setWeeklyLimit(data.limit);
      setResetsOn(data.resetsOn);
    } catch (e) {
      console.log('[Subscription] refresh failed', e?.message);
      // Leave prior state in place rather than guessing — SolveScreen still gates
      // on the last known-good value, and a transient network blip shouldn't flash
      // the paywall for someone who had solves remaining a second ago.
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!initedRef.current) {
      initPurchases();
      initedRef.current = true;
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function syncForSession() {
      setLoading(true);
      if (session?.user?.id) {
        await loginPurchases(session.user.id);
        await mergeGuestUsageIntoAccount();
        // Optimistic local hint so the UI doesn't flash "free tier" for a split
        // second on a freshly-purchased device before the webhook lands — refresh()
        // right after still gets the server-verified value.
        const localPremium = await getLocalIsPremium();
        if (!cancelled && localPremium) setIsPremium(true);
      } else {
        await logoutPurchases();
      }
      if (!cancelled) await refresh();
    }

    syncForSession();
    return () => { cancelled = true; };
  }, [session?.user?.id, refresh]);

  return (
    <SubscriptionContext.Provider
      value={{ isPremium, weeklyRemaining, weeklyLimit, resetsOn, loading, refresh }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}
