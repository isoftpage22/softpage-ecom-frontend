"use client";

import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import {
  hasStorefrontToken,
  setPostAuthRedirect,
  STOREFRONT_AUTH_CHANGED,
} from "@/lib/auth/persistAuth";
import { toggleUserFormDrawer } from "@/src/Store/action/modalsNDrawers";

export function useRequireStorefrontAuth(
  redirectPath: string,
  { autoOpen = true }: { autoOpen?: boolean } = {},
) {
  const dispatch = useDispatch();
  const [loggedIn, setLoggedIn] = useState(() =>
    typeof window !== "undefined" ? hasStorefrontToken() : false,
  );
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => setLoggedIn(hasStorefrontToken());
    sync();
    setReady(true);
    window.addEventListener(STOREFRONT_AUTH_CHANGED, sync);
    return () => window.removeEventListener(STOREFRONT_AUTH_CHANGED, sync);
  }, []);

  const promptLogin = useCallback(() => {
    setPostAuthRedirect(redirectPath);
    dispatch(toggleUserFormDrawer(true));
  }, [dispatch, redirectPath]);

  useEffect(() => {
    if (autoOpen && ready && !loggedIn) {
      promptLogin();
    }
  }, [autoOpen, ready, loggedIn, promptLogin]);

  return { loggedIn, ready, promptLogin };
}
