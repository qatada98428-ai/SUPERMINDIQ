import { SupabaseClient } from "@supabase/supabase-js";
import { UserProgressRecord, TrainingSessionRecord } from "./supabase/types";

export interface GuestProgressData {
  guestId: string;
  isGuest: true;
  currentLevel: string;
  lastExercise: string;
  totalAnswers: number;
  correctAnswers: number;
  wrongAnswers: number;
  accuracyRate: number;
  completedExercises: number;
  trainingDurationSeconds: number;
  bestScore: number;
  lastActivity: string;
  sessions: TrainingSessionRecord[];
}

const STORAGE_KEY_GUEST = "supermind_guest_progress_v1";
const STORAGE_KEY_ANSWER_IDS = "supermind_guest_answer_ids_v1";

const DEFAULT_GUEST_DATA: GuestProgressData = {
  guestId: "guest-" + Math.random().toString(36).substring(2, 9),
  isGuest: true,
  currentLevel: "المستوى التمهيدي",
  lastExercise: "فلاش أنزان - أرقام فردية",
  totalAnswers: 0,
  correctAnswers: 0,
  wrongAnswers: 0,
  accuracyRate: 0,
  completedExercises: 0,
  trainingDurationSeconds: 0,
  bestScore: 0,
  lastActivity: new Date().toISOString(),
  sessions: [],
};

// Safe retrieval from localStorage
export function getGuestProgress(): GuestProgressData {
  if (typeof window === "undefined") {
    return DEFAULT_GUEST_DATA;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY_GUEST);
    if (!raw) {
      const fresh = { ...DEFAULT_GUEST_DATA, guestId: "guest-" + Math.random().toString(36).substring(2, 9) };
      localStorage.setItem(STORAGE_KEY_GUEST, JSON.stringify(fresh));
      return fresh;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_GUEST_DATA;
  }
}

export function hasGuestProgress(): boolean {
  if (typeof window === "undefined") return false;
  const data = getGuestProgress();
  return data.totalAnswers > 0 || data.completedExercises > 0;
}

// Record an individual answer idempotently
export function recordGuestAnswer(params: {
  answerId: string; // Unique ID to prevent double counting
  exerciseType: string;
  level: string;
  isCorrect: boolean;
  score?: number;
  durationSeconds?: number;
}): GuestProgressData {
  if (typeof window === "undefined") return DEFAULT_GUEST_DATA;

  try {
    // Check answer registry for deduplication
    const registryRaw = localStorage.getItem(STORAGE_KEY_ANSWER_IDS);
    const registry: string[] = registryRaw ? JSON.parse(registryRaw) : [];

    if (registry.includes(params.answerId)) {
      // Already recorded, skip
      return getGuestProgress();
    }

    // Add to registry (keep latest 500)
    registry.push(params.answerId);
    if (registry.length > 500) registry.shift();
    localStorage.setItem(STORAGE_KEY_ANSWER_IDS, JSON.stringify(registry));

    const current = getGuestProgress();
    const newTotal = current.totalAnswers + 1;
    const newCorrect = current.correctAnswers + (params.isCorrect ? 1 : 0);
    const newWrong = current.wrongAnswers + (params.isCorrect ? 0 : 1);
    const newAccuracy = Math.round((newCorrect / newTotal) * 100);
    const newDuration = current.trainingDurationSeconds + (params.durationSeconds || 1);
    const newBestScore = Math.max(current.bestScore, params.score || 0);

    const updated: GuestProgressData = {
      ...current,
      totalAnswers: newTotal,
      correctAnswers: newCorrect,
      wrongAnswers: newWrong,
      accuracyRate: newAccuracy,
      trainingDurationSeconds: newDuration,
      bestScore: newBestScore,
      currentLevel: params.level || current.currentLevel,
      lastExercise: params.exerciseType || current.lastExercise,
      lastActivity: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEY_GUEST, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error("Failed to record guest answer:", err);
    return getGuestProgress();
  }
}

// Record a completed training session
export function recordGuestSession(session: Omit<TrainingSessionRecord, "id" | "user_id" | "created_at"> & { id?: string }): GuestProgressData {
  if (typeof window === "undefined") return DEFAULT_GUEST_DATA;

  try {
    const current = getGuestProgress();
    const newSession: TrainingSessionRecord = {
      id: session.id || "sess-" + Math.random().toString(36).substring(2, 9),
      user_id: current.guestId,
      session_type: session.session_type,
      level: session.level,
      total_questions: session.total_questions,
      correct_answers: session.correct_answers,
      wrong_answers: session.wrong_answers,
      accuracy_rate: session.accuracy_rate,
      duration_seconds: session.duration_seconds,
      score: session.score,
      metadata: session.metadata,
      created_at: new Date().toISOString(),
    };

    const newSessions = [newSession, ...(current.sessions || [])].slice(0, 50); // Keep last 50
    const updated: GuestProgressData = {
      ...current,
      completedExercises: current.completedExercises + 1,
      bestScore: Math.max(current.bestScore, session.score),
      lastActivity: new Date().toISOString(),
      sessions: newSessions,
    };

    localStorage.setItem(STORAGE_KEY_GUEST, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error("Failed to record guest session:", err);
    return getGuestProgress();
  }
}

// Clear guest progress when migrated or reset
export function clearGuestStorage(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY_GUEST);
    localStorage.removeItem(STORAGE_KEY_ANSWER_IDS);
  } catch (err) {
    console.error("Failed to clear guest storage:", err);
  }
}

// Migrate guest progress into an authorized Supabase account safely
export async function migrateGuestProgressToSupabase(
  supabase: SupabaseClient,
  userId: string
): Promise<{ success: boolean; migratedAnswers: number; error?: string }> {
  try {
    const guestData = getGuestProgress();

    if (guestData.totalAnswers === 0 && guestData.completedExercises === 0) {
      return { success: true, migratedAnswers: 0 };
    }

    // 1. Fetch current user progress in DB
    const { data: existingProgress, error: fetchErr } = await supabase
      .from("user_progress")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (fetchErr && fetchErr.code !== "PGRST116") {
      return { success: false, migratedAnswers: 0, error: fetchErr.message };
    }

    // 2. Merge progress data safely (additive for totals, max for best score)
    const mergedTotalAnswers = (existingProgress?.total_answers || 0) + guestData.totalAnswers;
    const mergedCorrect = (existingProgress?.correct_answers || 0) + guestData.correctAnswers;
    const mergedWrong = (existingProgress?.wrong_answers || 0) + guestData.wrongAnswers;
    const mergedAccuracy = mergedTotalAnswers > 0 ? Math.round((mergedCorrect / mergedTotalAnswers) * 100) : 0;
    const mergedCompleted = (existingProgress?.completed_exercises || 0) + guestData.completedExercises;
    const mergedDuration = (existingProgress?.training_duration_seconds || 0) + guestData.trainingDurationSeconds;
    const mergedBestScore = Math.max(existingProgress?.best_score || 0, guestData.bestScore);

    const updatedRecord: Partial<UserProgressRecord> = {
      user_id: userId,
      current_level: guestData.currentLevel || existingProgress?.current_level || "المستوى الأول",
      last_exercise: guestData.lastExercise || existingProgress?.last_exercise || "فلاش أنزان",
      total_answers: mergedTotalAnswers,
      correct_answers: mergedCorrect,
      wrong_answers: mergedWrong,
      accuracy_rate: mergedAccuracy,
      completed_exercises: mergedCompleted,
      training_duration_seconds: mergedDuration,
      best_score: mergedBestScore,
      last_activity: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (existingProgress) {
      const { error: updateErr } = await supabase
        .from("user_progress")
        .update(updatedRecord)
        .eq("user_id", userId);
      if (updateErr) throw updateErr;
    } else {
      const { error: insertErr } = await supabase
        .from("user_progress")
        .insert([updatedRecord]);
      if (insertErr) throw insertErr;
    }

    // 3. Migrate past sessions if any
    if (guestData.sessions && guestData.sessions.length > 0) {
      const sessionsToInsert = guestData.sessions.map((s) => ({
        user_id: userId,
        session_type: s.session_type,
        level: s.level,
        total_questions: s.total_questions,
        correct_answers: s.correct_answers,
        wrong_answers: s.wrong_answers,
        accuracy_rate: s.accuracy_rate,
        duration_seconds: s.duration_seconds,
        score: s.score,
        metadata: s.metadata || {},
        created_at: s.created_at || new Date().toISOString(),
      }));

      await supabase.from("training_sessions").insert(sessionsToInsert);
    }

    // 4. Clear local guest data after successful migration
    clearGuestStorage();

    return {
      success: true,
      migratedAnswers: guestData.totalAnswers,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "خطأ غير متوقع أثناء نقل البيانات";
    return { success: false, migratedAnswers: 0, error: msg };
  }
}
