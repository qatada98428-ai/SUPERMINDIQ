"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { User, Session } from "@supabase/supabase-js";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { UserProfile, UserRole } from "@/lib/supabase/types";
import {
  getGuestProgress,
  hasGuestProgress,
  recordGuestAnswer,
  migrateGuestProgressToSupabase,
  GuestProgressData,
} from "@/lib/guest-storage";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  role: UserRole | "guest";
  isGuest: boolean;
  isLoading: boolean;
  isSupabaseReady: boolean;
  isGoogleConfigured: boolean;
  guestProgress: GuestProgressData;
  hasUnmigratedGuestData: boolean;
  signInWithEmail: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signUpWithEmail: (
    email: string,
    pass: string,
    name: string,
    phone?: string,
    requestedRole?: "student" | "trainer"
  ) => Promise<{ success: boolean; error?: string }>;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  resetPasswordForEmail: (email: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  enterGuestMode: () => void;
  migrateGuestDataNow: () => Promise<{ success: boolean; migratedAnswers: number; error?: string }>;
  recordProgressAnswer: (params: {
    answerId: string;
    exerciseType: string;
    level: string;
    isCorrect: boolean;
    score?: number;
    durationSeconds?: number;
  }) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY_GUEST_FLAG = "supermind_active_mode";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isGuest, setIsGuest] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [guestProgress, setGuestProgress] = useState<GuestProgressData>(getGuestProgress());
  const [isGoogleConfigured, setIsGoogleConfigured] = useState<boolean>(false);

  const supabaseReady = isSupabaseConfigured();

  // Fetch or refresh user profile from public.profiles
  const fetchProfile = useCallback(async (userId: string, userEmail?: string | null) => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (!error && data) {
        setProfile(data as UserProfile);
      } else {
        // Fallback default profile if trigger hasn't fired yet
        setProfile({
          id: userId,
          email: userEmail || null,
          name: "بطل العقل الخارق",
          role: "student",
          status: "active",
          created_at: new Date().toISOString(),
          last_activity: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.error("Error fetching user profile:", err);
    }
  }, []);

  // Initialize auth state
  useEffect(() => {
    const supabase = getSupabaseClient();

    if (!supabase) {
      // Supabase is not configured yet - default smoothly to Guest Mode
      setIsGuest(true);
      setIsLoading(false);
      return;
    }

    // Check if Google OAuth is configured via environment flag if desired
    setIsGoogleConfigured(true);

    // Get current session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (currentSession?.user) {
        setIsGuest(false);
        fetchProfile(currentSession.user.id, currentSession.user.email);
      } else {
        const mode = localStorage.getItem(STORAGE_KEY_GUEST_FLAG);
        setIsGuest(mode !== "auth");
      }
      setIsLoading(false);
    });

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (newSession?.user) {
          setIsGuest(false);
          localStorage.setItem(STORAGE_KEY_GUEST_FLAG, "auth");
          await fetchProfile(newSession.user.id, newSession.user.email);
        } else {
          setProfile(null);
          setIsGuest(true);
          localStorage.setItem(STORAGE_KEY_GUEST_FLAG, "guest");
        }
        setIsLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  // Keep guestProgress in sync
  useEffect(() => {
    setGuestProgress(getGuestProgress());
  }, [isGuest]);

  // Actions
  const enterGuestMode = useCallback(() => {
    setIsGuest(true);
    localStorage.setItem(STORAGE_KEY_GUEST_FLAG, "guest");
    setGuestProgress(getGuestProgress());
  }, []);

  const signInWithEmail = useCallback(
    async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
      const supabase = getSupabaseClient();
      if (!supabase) {
        return {
          success: false,
          error: "خدمة المصادقة السحابية (Supabase) غير مهيأة بعد. يرجى إدخال مفاتيح الربط في ملف البيئة.",
        };
      }

      setIsLoading(true);
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: pass,
        });

        if (error) {
          setIsLoading(false);
          return { success: false, error: error.message };
        }

        if (data.user) {
          setUser(data.user);
          setSession(data.session);
          setIsGuest(false);
          localStorage.setItem(STORAGE_KEY_GUEST_FLAG, "auth");
          await fetchProfile(data.user.id, data.user.email);
        }

        setIsLoading(false);
        return { success: true };
      } catch (err: unknown) {
        setIsLoading(false);
        const msg = err instanceof Error ? err.message : "فشل تسجيل الدخول";
        return { success: false, error: msg };
      }
    },
    [fetchProfile]
  );

  const signUpWithEmail = useCallback(
    async (
      email: string,
      pass: string,
      name: string,
      phone?: string,
      requestedRole: "student" | "trainer" = "student"
    ): Promise<{ success: boolean; error?: string }> => {
      const supabase = getSupabaseClient();
      if (!supabase) {
        return {
          success: false,
          error: "خدمة المصادقة السحابية (Supabase) غير مهيأة بعد. يرجى إدخال مفاتيح الربط في ملف البيئة.",
        };
      }

      setIsLoading(true);
      try {
        // Enforce safe role: normal signups are strictly "student" by default in auth.users
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password: pass,
          options: {
            data: {
              name: name.trim(),
              full_name: name.trim(),
              phone: phone?.trim() || null,
              requested_role: requestedRole,
            },
          },
        });

        if (error) {
          setIsLoading(false);
          return { success: false, error: error.message };
        }

        // If user submitted request as trainer, create a pending trainer application
        if (requestedRole === "trainer" && data.user) {
          try {
            await supabase.from("trainer_applications").insert([
              {
                name: name.trim(),
                phone: phone?.trim() || "",
                email: email.trim(),
                bio: `طلب ترقية إلى مدرب معتمد عند التسجيل`,
                status: "pending",
                annual_fee_iqd: 25000,
              },
            ]);
          } catch {
            // Non-blocking
          }
        }

        if (data.user) {
          setUser(data.user);
          setSession(data.session);
          setIsGuest(false);
          localStorage.setItem(STORAGE_KEY_GUEST_FLAG, "auth");
          await fetchProfile(data.user.id, data.user.email);
        }

        setIsLoading(false);
        return { success: true };
      } catch (err: unknown) {
        setIsLoading(false);
        const msg = err instanceof Error ? err.message : "فشل إنشاء الحساب";
        return { success: false, error: msg };
      }
    },
    [fetchProfile]
  );

  const signInWithGoogle = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return {
        success: false,
        error: "خدمة المصادقة السحابية (Supabase) غير مهيأة بعد.",
      };
    }

    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${origin}/dashboard`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "فشل المتابعة باستخدام Google";
      return { success: false, error: msg };
    }
  }, []);

  const resetPasswordForEmail = useCallback(async (email: string): Promise<{ success: boolean; error?: string }> => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return { success: false, error: "خدمة المصادقة غير مهيأة بعد." };
    }

    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${origin}/login?reset=true`,
      });

      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "فشل إرسال رابط الاستعادة";
      return { success: false, error: msg };
    }
  }, []);

  const signOut = useCallback(async () => {
    const supabase = getSupabaseClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setSession(null);
    setProfile(null);
    setIsGuest(true);
    localStorage.setItem(STORAGE_KEY_GUEST_FLAG, "guest");
  }, []);

  const migrateGuestDataNow = useCallback(async () => {
    const supabase = getSupabaseClient();
    if (!supabase || !user) {
      return { success: false, migratedAnswers: 0, error: "يجب تسجيل الدخول أولاً لنقل البيانات" };
    }

    const res = await migrateGuestProgressToSupabase(supabase, user.id);
    if (res.success) {
      setGuestProgress(getGuestProgress());
      await fetchProfile(user.id, user.email);
    }
    return res;
  }, [user, fetchProfile]);

  // Unified answer recorder
  const recordProgressAnswer = useCallback(
    async (params: {
      answerId: string;
      exerciseType: string;
      level: string;
      isCorrect: boolean;
      score?: number;
      durationSeconds?: number;
    }) => {
      // 1. Always record locally (fast, zero latency, offline-friendly)
      const updatedGuest = recordGuestAnswer(params);
      setGuestProgress(updatedGuest);

      // 2. If user is logged in and Supabase is configured, sync to database
      const supabase = getSupabaseClient();
      if (supabase && user) {
        try {
          const { data: currentProg } = await supabase
            .from("user_progress")
            .select("*")
            .eq("user_id", user.id)
            .maybeSingle();

          const newTotal = (currentProg?.total_answers || 0) + 1;
          const newCorrect = (currentProg?.correct_answers || 0) + (params.isCorrect ? 1 : 0);
          const newWrong = (currentProg?.wrong_answers || 0) + (params.isCorrect ? 0 : 1);
          const newAccuracy = Math.round((newCorrect / newTotal) * 100);
          const newBestScore = Math.max(currentProg?.best_score || 0, params.score || 0);

          await supabase.from("user_progress").upsert({
            user_id: user.id,
            total_answers: newTotal,
            correct_answers: newCorrect,
            wrong_answers: newWrong,
            accuracy_rate: newAccuracy,
            current_level: params.level,
            last_exercise: params.exerciseType,
            best_score: newBestScore,
            last_activity: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        } catch (err) {
          console.warn("Background progress sync notice:", err);
        }
      }
    },
    [user]
  );

  const effectiveRole: UserRole | "guest" = isGuest
    ? "guest"
    : profile?.role || "student";

  const hasUnmigratedGuestData = !isGuest && hasGuestProgress();

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        role: effectiveRole,
        isGuest,
        isLoading,
        isSupabaseReady: supabaseReady,
        isGoogleConfigured,
        guestProgress,
        hasUnmigratedGuestData,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        resetPasswordForEmail,
        signOut,
        enterGuestMode,
        migrateGuestDataNow,
        recordProgressAnswer,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
