"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const SESSION_STORAGE_KEY = "supermind_traffic_session_id";
let fallbackSessionId: string | null = null;

function createOpaqueId(prefix: string): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}_${crypto.randomUUID().replace(/-/g, "")}`;
  }
  const rand = Math.random().toString(36).slice(2, 12);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function getOrCreateSessionId(): string {
  try {
    const existing = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (existing && /^[A-Za-z0-9_-]{8,128}$/.test(existing)) {
      return existing;
    }
    const created = createOpaqueId("sess");
    window.sessionStorage.setItem(SESSION_STORAGE_KEY, created);
    return created;
  } catch {
    if (!fallbackSessionId) {
      fallbackSessionId = createOpaqueId("sess");
    }
    return fallbackSessionId;
  }
}

function isProductionClientHost(): boolean {
  if (process.env.NODE_ENV !== "production") return false;
  if (
    process.env.NEXT_PUBLIC_VERCEL_ENV &&
    process.env.NEXT_PUBLIC_VERCEL_ENV !== "production"
  ) {
    return false;
  }
  if (typeof window === "undefined") return false;

  const host = window.location.hostname.toLowerCase();
  if (
    !host ||
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "::1" ||
    host === "[::1]" ||
    host === "0.0.0.0" ||
    host.endsWith(".local")
  ) {
    return false;
  }
  return true;
}

/**
 * Tracks real browsing sessions & pageviews strictly in production for both
 * guests and signed-in users without storing any personal names or IP addresses.
 */
export default function TrafficTracker() {
  const pathname = usePathname();
  const lastTrackedPathRef = useRef<string | null>(null);
  const pageCounterRef = useRef<number>(0);

  useEffect(() => {
    if (!pathname) return;
    if (!isProductionClientHost()) return;
    if (lastTrackedPathRef.current === pathname) return;

    lastTrackedPathRef.current = pathname;
    pageCounterRef.current += 1;

    const sessionId = getOrCreateSessionId();
    const eventId = createOpaqueId(`pv${pageCounterRef.current}`);

    void fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, eventId }),
      keepalive: true,
    }).catch(() => {
      // Fail silently on transient visitor network errors; never impact UX
    });
  }, [pathname]);

  return null;
}
