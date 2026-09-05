"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import {
  bindRouteLoaderDispatch,
  stopRouteLoading,
} from "@/src/Store/action/loader";

/**
 * Binds route-loader dispatch and clears the overlay when the destination
 * route commits. Safety timeout lives in startRouteLoading.
 */
export function NavigationLoader() {
  const dispatch = useDispatch();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams?.toString() ?? "";
  const key = `${pathname}?${search}`;
  const prevKey = useRef(key);

  bindRouteLoaderDispatch(dispatch);

  useEffect(() => {
    bindRouteLoaderDispatch(dispatch);
  }, [dispatch]);

  useEffect(() => {
    if (prevKey.current === key) return;
    prevKey.current = key;
    stopRouteLoading();
  }, [key]);

  return null;
}
