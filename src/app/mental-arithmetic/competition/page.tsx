"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import {
  Trophy,
  Timer,
  Clock,
  CheckCircle2,
  Play,
  RotateCcw,
  Settings2,
  Volume2,
  LayoutGrid,
  Target,
  ArrowRight,
  ArrowLeft,
  Award,
  Printer,
  Plus,
  Trash2,
  Copy,
  Layers,
  Shuffle,
  ListOrdered,
  Keyboard,
  ListChecks,
  Medal,
  Users,
  Lock,
  LogIn,
  UserPlus,
  ShieldCheck,
} from "lucide-react";
import {
  generateFlashAnzanSeries,
  playSoundEffect,
  speakSorobanCountdown,
  speakQuestionSequence,
  stopActiveSpeech,
  warmupSpeechEngine,
  ArithmeticLevel,
} from "@/lib/soroban-engine";
import { soundSynth } from "@/lib/audio-synthesizer";
import { useAuth } from "@/context/AuthContext";
import { getWhatsAppLink } from "@/lib/constants";
import {
  PlatformAssignment,
  SubmissionRuleBreakdown,
  SubmissionQuestionDetail,
  formatAttemptLabelAr,
  getStudentAssignmentAttemptCount,
  getExtendedProfile,
  evaluateSubscription,
  getMonthlyTrialStatus,
  consumeMonthlyTrialQuestions,
  parseAssignmentFromSearchParams,
  syncExtendedProfileFromSupabase,
  recordRealTrainingSession,
  getAllAssignments,
  SUBSCRIPTION_PLANS,
  MONTHLY_FREE_QUESTIONS_LIMIT,
  MONTHLY_FREE_MINUTES_LIMIT,
} from "@/lib/platform-store";
import {
  TrainerTournamentModal,
  TrainerTournamentsBoard,
} from "@/components/competition/TrainerTournamentPanel";

// ============================================================
// TYPES & CONSTANTS
// ============================================================
type TimeMode = "countdown" | "stopwatch";
type DisplayMode = "sheet" | "focus";
type AnswerMode = "typing" | "choices";
type ChoicesCount = 2 | 3 | 4 | 5;
type VoiceMode = "arabic" | "english" | "off";
type CompetitionStage = "setup" | "countdown" | "running" | "results";
type ReviewFilter = "all" | "wrong" | "correct";
type OrderMode = "sequential" | "shuffled";

export interface QuestionRuleGroup {
  id: string;
  count: number;
  digitsCount: number; // 1: آحاد, 2: عشرات, 3: مئات, 4: ألوف
  level: ArithmeticLevel; // simple, complex_5, complex_10, mixed, general
  targetRules: number[]; // e.g. [4] for قاعدة 4
  termsCount: number; // 3, 4, 5, 7, 10
  allowSubtraction: boolean;
}

interface CompetitionQuestion {
  id: number;
  groupId: string;
  groupIndex: number;
  groupLabel: string;
  numbers: number[];
  correctAnswer: number;
  choices: number[];
  userAnswer: string;
}

const MAX_TOTAL_QUESTIONS = 1000;
const SHEET_PAGE_SIZE = 100;
const PRESET_MINUTES = [5, 7, 10, 15, 20, 25, 30];
const QUICK_GROUP_COUNTS = [10, 25, 50, 100, 200, 500, 1000];
const CHOICES_COUNT_OPTIONS: ChoicesCount[] = [2, 3, 4, 5];

const DIGITS_LABELS: Record<number, string> = {
  1: "آحاد",
  2: "عشرات",
  3: "مئات",
  4: "ألوف",
};

const LEVEL_LABELS: Record<ArithmeticLevel, string> = {
  simple: "بسيط",
  complex_5: "مركب 5",
  complex_10: "مركب 10",
  mixed: "مركب 5 و 10",
  general: "عام شامل",
};

function formatGroupLabel(group: QuestionRuleGroup): string {
  const digitsName =
    DIGITS_LABELS[group.digitsCount] || `${group.digitsCount} خانات`;
  const levelName = LEVEL_LABELS[group.level] || group.level;
  const rulesSuffix =
    (group.level === "complex_5" || group.level === "complex_10") &&
    group.targetRules.length > 0
      ? ` (قاعدة ${group.targetRules.join("، ")})`
      : "";
  return `${digitsName} • ${levelName}${rulesSuffix}`;
}

/**
 * Generates realistic Soroban multiple-choice options (2, 3, 4, or 5 choices)
 * including the exact `correctAnswer`.
 */
function generateChoicesForAnswer(
  correctAnswer: number,
  choicesCount: ChoicesCount
): number[] {
  const set = new Set<number>([correctAnswer]);

  // Plausible Soroban bead errors (off by 1, 2, 5, 10, 3, 4, 9, 11, etc.)
  const candidateOffsets = [
    1, -1, 2, -2, 5, -5, 10, -10, 3, -3, 4, -4, 6, -6, 9, -9, 11, -11, 15, 20,
  ];

  // Shuffle candidate offsets
  for (let i = candidateOffsets.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = candidateOffsets[i];
    candidateOffsets[i] = candidateOffsets[j];
    candidateOffsets[j] = tmp;
  }

  for (const offset of candidateOffsets) {
    if (set.size >= choicesCount) break;
    const candidate = correctAnswer + offset;
    if (candidate >= 0 && !set.has(candidate)) {
      set.add(candidate);
    }
  }

  // Fallback if still fewer than choicesCount
  let fallbackAdd = 1;
  while (set.size < choicesCount) {
    const candidate = correctAnswer + fallbackAdd;
    if (candidate >= 0 && !set.has(candidate)) {
      set.add(candidate);
    }
    fallbackAdd++;
  }

  const result = Array.from(set);
  // Shuffle final choices
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = result[i];
    result[i] = result[j];
    result[j] = tmp;
  }

  return result;
}

export default function MentalMathCompetitionPage() {
  const router = useRouter();
  const { user, profile: authProfile, role: authRole, isGuest, recordProgressAnswer } = useAuth();
  const activeUserId = user?.id || (authRole === "admin" ? "admin-local" : "guest-local");
  const isOfficialAccount = !isGuest && (Boolean(user) || authRole === "admin");
  const [activeAssignment, setActiveAssignment] = useState<PlatformAssignment | null>(null);
  const [priorAttemptCount, setPriorAttemptCount] = useState<number>(0);
  const [completedAttemptNumber, setCompletedAttemptNumber] = useState<number>(1);

  const navigateToOfficialAuth = useCallback(
    (targetPath: "/login" | "/register") => {
      if (typeof window !== "undefined") {
        try {
          sessionStorage.setItem(
            "supermind_post_login_redirect",
            `${window.location.pathname}${window.location.search}`
          );
        } catch {}
      }
      router.push(targetPath);
    },
    [router]
  );
  const [showTrainerTournamentModal, setShowTrainerTournamentModal] = useState(false);
  const [showTrainerResultsBoard, setShowTrainerResultsBoard] = useState(false);
  const [trainerTournamentsCount, setTrainerTournamentsCount] = useState(0);
  const [tournamentsRefreshTick, setTournamentsRefreshTick] = useState(0);
  const [showSubPaywallModal, setShowSubPaywallModal] = useState(false);
  const [paywallReason, setPaywallReason] = useState<string>("");
  const [showCertificateModal, setShowCertificateModal] = useState(false);

  const isTrainerOrAdminUser =
    authRole === "trainer" ||
    authRole === "admin" ||
    authProfile?.role === "trainer" ||
    authProfile?.role === "admin";

  useEffect(() => {
    if (!isTrainerOrAdminUser) return;
    const all = getAllAssignments();
    const mine =
      authRole === "admin" || authProfile?.role === "admin"
        ? all
        : all.filter((a) => a.creatorId === activeUserId || a.creatorId === "trainer-qatada");
    setTrainerTournamentsCount(mine.length);
  }, [isTrainerOrAdminUser, authRole, authProfile?.role, activeUserId, tournamentsRefreshTick]);

  // ── Setup Configuration State ──────────────────────────────
  const [timeMode, setTimeMode] = useState<TimeMode>("countdown");
  const [durationMinutes, setDurationMinutes] = useState<number>(10); // 5 to 30 mins
  const [orderMode, setOrderMode] = useState<OrderMode>("sequential");
  const [displayMode, setDisplayMode] = useState<DisplayMode>("focus");
  const [answerMode, setAnswerMode] = useState<AnswerMode>("typing");
  const [choicesCount, setChoicesCount] = useState<ChoicesCount>(4);
  const [voiceMode, setVoiceMode] = useState<VoiceMode>("arabic");

  // Multi-rule groups state (supports 1 to N groups, up to 1000 questions total)
  const [ruleGroups, setRuleGroups] = useState<QuestionRuleGroup[]>([
    {
      id: "group-1",
      count: 20,
      digitsCount: 1,
      level: "simple",
      targetRules: [],
      termsCount: 4,
      allowSubtraction: true,
    },
  ]);

  // ── Runtime State ──────────────────────────────────────────
  const [stage, setStage] = useState<CompetitionStage>("setup");
  const [countdownNum, setCountdownNum] = useState<number>(3);
  const [questions, setQuestions] = useState<CompetitionQuestion[]>([]);
  const [activeQuestionIdx, setActiveQuestionIdx] = useState<number>(0);
  const [sheetPage, setSheetPage] = useState<number>(0);
  const [resultsPage, setResultsPage] = useState<number>(0);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(600);
  const [reviewFilter, setReviewFilter] = useState<ReviewFilter>("all");
  const [reviewGroupFilter, setReviewGroupFilter] = useState<string>("all");

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const inputRefs = useRef<Record<number, HTMLInputElement | null>>({});
  const focusInputRef = useRef<HTMLInputElement | null>(null);
  const questionsRef = useRef<CompetitionQuestion[]>([]);
  const lastSpokenQuestionKeyRef = useRef<string>("");

  questionsRef.current = questions;

  const clearCompetitionTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      clearCompetitionTimer();
      stopActiveSpeech();
    };
  }, [clearCompetitionTimer]);

  // Total requested questions across all groups (capped at MAX_TOTAL_QUESTIONS)
  const rawTotalQuestions = ruleGroups.reduce(
    (sum, g) => sum + Math.max(1, Math.floor(g.count || 1)),
    0
  );
  const totalQuestionsCount = Math.min(MAX_TOTAL_QUESTIONS, rawTotalQuestions);

  // ── Group Builder Handlers ─────────────────────────────────
  const updateGroup = (id: string, patch: Partial<QuestionRuleGroup>) => {
    setRuleGroups((prev) =>
      prev.map((g) => {
        if (g.id !== id) return g;
        const updated = { ...g, ...patch };
        if (
          patch.level &&
          patch.level !== "complex_5" &&
          patch.level !== "complex_10"
        ) {
          updated.targetRules = [];
        } else if (patch.level === "complex_5") {
          updated.targetRules = updated.targetRules.filter(
            (r) => r >= 1 && r <= 4
          );
        }
        return updated;
      })
    );
  };

  const toggleGroupSubRule = (id: string, ruleNum: number) => {
    setRuleGroups((prev) =>
      prev.map((g) => {
        if (g.id !== id) return g;
        const exists = g.targetRules.includes(ruleNum);
        return {
          ...g,
          targetRules: exists
            ? g.targetRules.filter((r) => r !== ruleNum)
            : [...g.targetRules, ruleNum].sort((a, b) => a - b),
        };
      })
    );
  };

  const addNewGroup = () => {
    const remainingCapacity = Math.max(
      10,
      MAX_TOTAL_QUESTIONS - rawTotalQuestions
    );
    const defaultCount = Math.min(50, remainingCapacity);
    const lastGroup = ruleGroups[ruleGroups.length - 1];
    const newGroup: QuestionRuleGroup = {
      id: `group-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      count: defaultCount > 0 ? defaultCount : 25,
      digitsCount: lastGroup ? lastGroup.digitsCount : 1,
      level: "complex_5",
      targetRules: [],
      termsCount: lastGroup ? lastGroup.termsCount : 4,
      allowSubtraction: lastGroup ? lastGroup.allowSubtraction : true,
    };
    setRuleGroups((prev) => [...prev, newGroup]);
  };

  const duplicateGroup = (group: QuestionRuleGroup) => {
    const copy: QuestionRuleGroup = {
      ...group,
      id: `group-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      targetRules: [...group.targetRules],
    };
    setRuleGroups((prev) => [...prev, copy]);
  };

  const removeGroup = (id: string) => {
    if (ruleGroups.length <= 1) return;
    setRuleGroups((prev) => prev.filter((g) => g.id !== id));
  };

  const applyMultiRuleExamplePreset = () => {
    setRuleGroups([
      {
        id: "preset-1",
        count: 100,
        digitsCount: 1,
        level: "simple",
        targetRules: [],
        termsCount: 4,
        allowSubtraction: true,
      },
      {
        id: "preset-2",
        count: 50,
        digitsCount: 2,
        level: "simple",
        targetRules: [],
        termsCount: 4,
        allowSubtraction: true,
      },
      {
        id: "preset-3",
        count: 50,
        digitsCount: 1,
        level: "complex_5",
        targetRules: [4],
        termsCount: 4,
        allowSubtraction: true,
      },
    ]);
  };

  // Re-generate choices when choicesCount changes mid-session
  useEffect(() => {
    if (questions.length === 0) return;
    setQuestions((prev) =>
      prev.map((q) => ({
        ...q,
        choices: generateChoicesForAnswer(q.correctAnswer, choicesCount),
      }))
    );
  }, [choicesCount, questions.length]);

  // ── Generate All Competition Questions Across Rule Groups ──
  const generateCompetitionSheet = useCallback((): CompetitionQuestion[] => {
    const rawList: Omit<CompetitionQuestion, "id">[] = [];

    for (let gIdx = 0; gIdx < ruleGroups.length; gIdx++) {
      const group = ruleGroups[gIdx];
      const groupLabel = formatGroupLabel(group);
      const countForGroup = Math.max(
        1,
        Math.min(MAX_TOTAL_QUESTIONS, Math.floor(group.count || 1))
      );

      for (let i = 0; i < countForGroup; i++) {
        if (rawList.length >= MAX_TOTAL_QUESTIONS) break;

        const series = generateFlashAnzanSeries({
          termsCount: group.termsCount,
          digitsCount: group.digitsCount,
          showDelayMs: 0,
          clearDelayMs: 0,
          allowSubtraction: group.allowSubtraction,
          allowNegativeTotal: false,
          level: group.level,
          targetRules:
            group.targetRules.length > 0 ? group.targetRules : undefined,
          numeralSystem: "western",
        });

        const sum = series.reduce((acc, n) => acc + n, 0);
        rawList.push({
          groupId: group.id,
          groupIndex: gIdx,
          groupLabel,
          numbers: series,
          correctAnswer: sum,
          choices: generateChoicesForAnswer(sum, choicesCount),
          userAnswer: "",
        });
      }
      if (rawList.length >= MAX_TOTAL_QUESTIONS) break;
    }

    if (orderMode === "shuffled" && rawList.length > 1) {
      for (let i = rawList.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = rawList[i];
        rawList[i] = rawList[j];
        rawList[j] = temp;
      }
    }

    return rawList.map((item, idx) => ({
      ...item,
      id: idx + 1,
    }));
  }, [ruleGroups, orderMode, choicesCount]);

  // ── Load Assignment / Admin Competition if ?assignmentId= is in URL & Sync Cloud Profile ──
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (activeUserId && activeUserId !== "guest-local") {
      syncExtendedProfileFromSupabase(activeUserId);
    }

    const params = new URLSearchParams(window.location.search);
    const found = parseAssignmentFromSearchParams(params);
    if (!found) return;

    setActiveAssignment(found);
    setPriorAttemptCount(getStudentAssignmentAttemptCount(found.id, activeUserId));
    setTimeMode(found.timeMode || "countdown");
    setDurationMinutes(found.timeLimitMinutes || 5);
    setAnswerMode(found.answerMode || "typing");
    setChoicesCount(found.choicesCount || 4);
    if (found.orderMode) setOrderMode(found.orderMode);
    if (found.displayMode) setDisplayMode(found.displayMode);
    if (found.voiceMode) setVoiceMode(found.voiceMode);

    if (found.ruleGroups && found.ruleGroups.length > 0) {
      setRuleGroups(
        found.ruleGroups.map((g, i) => ({
          id: g.id || `assign-group-${i + 1}`,
          count: g.count || 20,
          digitsCount: g.digitsCount || 1,
          level: g.level || "simple",
          targetRules: Array.isArray(g.targetRules) ? g.targetRules : [],
          termsCount: g.termsCount || 4,
          allowSubtraction: g.allowSubtraction !== false,
        }))
      );
    } else {
      const digMap: Record<string, number> = {
        units: 1,
        tens: 2,
        hundreds: 3,
        thousands: 4,
      };
      setRuleGroups([
        {
          id: "assign-group-1",
          count: found.questionsCount || 20,
          digitsCount: digMap[found.digitPlace] || 1,
          level: found.rulesLevel || "simple",
          targetRules: [],
          termsCount: found.termsCount || 4,
          allowSubtraction: found.allowSubtraction !== false,
        },
      ]);
    }
  }, [activeUserId]);

  // ── Launch Competition ─────────────────────────────────────
  const startCompetition = () => {
    // Strict Official Account Gate: unregistered/guest users cannot participate in any competition
    if (activeAssignment && !isOfficialAccount) {
      navigateToOfficialAuth("/login");
      return;
    }

    const extProf = getExtendedProfile(activeUserId, {
      email: user?.email || authProfile?.email,
      name: authProfile?.name,
      role: (authProfile?.role as "student" | "trainer" | "admin") || "student",
    });
    const subEval = evaluateSubscription(extProf.subscription);
    const isTrainerOrAdmin =
      extProf.role === "trainer" ||
      extProf.role === "admin" ||
      authProfile?.role === "trainer" ||
      authProfile?.role === "admin";
    const hasUnlimitedAccess =
      subEval.isActive || isTrainerOrAdmin || (activeAssignment !== null && isOfficialAccount);

    if (!hasUnlimitedAccess) {
      if (isGuest) {
        setPaywallReason(
          "سجّل دخولك بحسابك الرسمي أولاً للحصول على حصتك التجريبية المجانية شهرياً (100 سؤال أو 10 دقائق)، أو اشترك في إحدى باقات المحاكي للوصول المفتوح بلا حدود."
        );
        setShowSubPaywallModal(true);
        return;
      }

      const trial = getMonthlyTrialStatus(activeUserId);
      if (!trial.hasTrialRemaining) {
        setPaywallReason(
          `لقد استنفدت حصتك التجريبية المجانية لهذا الشهر (${MONTHLY_FREE_QUESTIONS_LIMIT} سؤال). اشترك الآن في إحدى الباقات لفتح المحاكي بلا حدود (حتى 1000 سؤال في الجلسة)!`
        );
        setShowSubPaywallModal(true);
        return;
      }

      if (totalQuestionsCount > trial.questionsRemaining) {
        setPaywallReason(
          `متبقي لك في حصتك الشهرية المجانية (${trial.questionsRemaining} سؤال فقط من أصل 100 سؤال). قلل عدد الأسئلة إلى ${trial.questionsRemaining} أو اشترك الآن لفتح حتى 1000 سؤال بلا حدود!`
        );
        setShowSubPaywallModal(true);
        return;
      }

      if (timeMode !== "countdown" || durationMinutes > MONTHLY_FREE_MINUTES_LIMIT) {
        setPaywallReason(
          `التجربة المجانية الشهرية تتيح وقتاً بحد أقصى ${MONTHLY_FREE_MINUTES_LIMIT} دقائق. اختر 5 أو 7 أو 10 دقائق، أو اشترك بالباقة الكاملة لفتح الوقت حتى 30 دقيقة والتايمر المفتوح!`
        );
        setShowSubPaywallModal(true);
        return;
      }

      // Consume questions from the student's monthly free trial
      consumeMonthlyTrialQuestions(activeUserId, totalQuestionsCount);
    }

    clearCompetitionTimer();
    warmupSpeechEngine();

    const generated = generateCompetitionSheet();
    setQuestions(generated);
    setActiveQuestionIdx(0);
    setSheetPage(0);
    setResultsPage(0);
    setElapsedSeconds(0);
    setRemainingSeconds(durationMinutes * 60);
    setReviewFilter("all");
    setReviewGroupFilter("all");
    setCountdownNum(3);
    setStage("countdown");
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // ── Pre-game Countdown (3..2..1..Go) ───────────────────────
  useEffect(() => {
    if (stage !== "countdown") return;

    speakSorobanCountdown(3, voiceMode);
    let c = 3;
    const interval = setInterval(() => {
      c -= 1;
      if (c <= 0) {
        clearInterval(interval);
        // Play crisp ready chime only — avoids "ابدأ" colliding with Question #1 speech!
        soundSynth.playFlashCue("ready");
        stopActiveSpeech();
        setStage("running");
      } else {
        setCountdownNum(c);
        speakSorobanCountdown(c, voiceMode);
      }
    }, 900);

    return () => clearInterval(interval);
  }, [stage, voiceMode]);

  // ── Submit & Grade Competition ─────────────────────────────
  const finishAndGrade = useCallback(
    (overrideQuestions?: CompetitionQuestion[]) => {
      clearCompetitionTimer();
      const targetQuestions = overrideQuestions || questions;
      setStage("results");
      setResultsPage(0);

      const correctCnt = targetQuestions.filter(
        (q) =>
          q.userAnswer.trim() !== "" &&
          parseInt(q.userAnswer.trim(), 10) === q.correctAnswer
      ).length;

      const unansweredCnt = targetQuestions.filter(
        (q) => q.userAnswer.trim() === ""
      ).length;

      const wrongCnt = Math.max(0, targetQuestions.length - correctCnt - unansweredCnt);

      const ratio = correctCnt / Math.max(1, targetQuestions.length);
      if (ratio >= 0.8) {
        soundSynth.playOutcomeSound("excellent");
      } else {
        soundSynth.playOutcomeSound("complete");
      }

      const primaryLevel: ArithmeticLevel = ruleGroups[0]?.level || "simple";

      // Compute detailed per-rule breakdown & question-by-question sheet for trainer/admin reports
      const breakdownMap = new Map<
        string,
        { total: number; correct: number; wrong: number; unanswered: number }
      >();
      const questionDetails: SubmissionQuestionDetail[] = targetQuestions.map((q) => {
        const trimmed = q.userAnswer.trim();
        const isUnanswered = trimmed === "";
        const isCorrect =
          !isUnanswered && parseInt(trimmed, 10) === q.correctAnswer;
        const lbl = q.groupLabel || "عام";
        const cur = breakdownMap.get(lbl) || {
          total: 0,
          correct: 0,
          wrong: 0,
          unanswered: 0,
        };
        cur.total += 1;
        if (isCorrect) {
          cur.correct += 1;
        } else if (isUnanswered) {
          cur.unanswered += 1;
        } else {
          cur.wrong += 1;
        }
        breakdownMap.set(lbl, cur);

        return {
          id: q.id,
          groupLabel: lbl,
          numbers: q.numbers,
          correctAnswer: q.correctAnswer,
          userAnswer: trimmed,
          isCorrect,
        };
      });

      const ruleBreakdown: SubmissionRuleBreakdown[] = Array.from(
        breakdownMap.entries()
      ).map(([groupLabel, stats]) => ({
        groupLabel,
        total: stats.total,
        correct: stats.correct,
        wrong: stats.wrong,
        unanswered: stats.unanswered,
        accuracy:
          stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0,
      }));

      // Record full official student session & detailed competition result (synced locally & to cloud)
      const participantDisplayName =
        authProfile?.name ||
        user?.email?.split("@")[0] ||
        "بطل العقل الخارق";

      const nextAttemptNumber = activeAssignment
        ? getStudentAssignmentAttemptCount(activeAssignment.id, activeUserId) + 1
        : 1;
      setCompletedAttemptNumber(nextAttemptNumber);
      if (activeAssignment) {
        setPriorAttemptCount(nextAttemptNumber);
      }

      recordRealTrainingSession({
        userId: activeUserId,
        userName: participantDisplayName,
        studentEmail: user?.email || authProfile?.email || undefined,
        type: "competition",
        title: activeAssignment
          ? activeAssignment.title
          : `محاكي المسابقة (${targetQuestions.length} سؤال)`,
        level: LEVEL_LABELS[primaryLevel] || primaryLevel,
        totalQuestions: targetQuestions.length,
        correctAnswers: correctCnt,
        wrongAnswers: wrongCnt,
        unansweredCount: unansweredCnt,
        durationSeconds: Math.max(1, elapsedSeconds),
        assignmentId: activeAssignment?.id,
        assignmentCreatorId: activeAssignment?.creatorId,
        assignmentTitle: activeAssignment?.title,
        attemptNumber: nextAttemptNumber,
        ruleBreakdown,
        questionDetails,
      });

      if (correctCnt > 0) {
        recordProgressAnswer({
          answerId: `comp-${Date.now()}`,
          exerciseType: "competition",
          level: primaryLevel,
          isCorrect: true,
          score: correctCnt * 10,
          durationSeconds: elapsedSeconds,
        });
      }

      if (correctCnt / Math.max(1, targetQuestions.length) >= 0.7) {
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch {
          // Ignore
        }
      }
    },
    [
      clearCompetitionTimer,
      questions,
      recordProgressAnswer,
      ruleGroups,
      elapsedSeconds,
      activeUserId,
      authProfile?.name,
      authProfile?.email,
      user?.email,
      activeAssignment,
    ]
  );

  // ── Main Competition Timer (Countdown or Stopwatch) ────────
  useEffect(() => {
    if (stage !== "running") return;

    timerRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);

      if (timeMode === "countdown") {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearCompetitionTimer();
  }, [stage, timeMode, clearCompetitionTimer]);

  // Auto-finish when countdown hits 0
  useEffect(() => {
    if (
      stage === "running" &&
      timeMode === "countdown" &&
      remainingSeconds === 0
    ) {
      finishAndGrade();
    }
  }, [stage, timeMode, remainingSeconds, finishAndGrade]);

  // Auto-speak active question ONCE in Focus Mode (never re-speaks on typing!)
  useEffect(() => {
    if (stage !== "running") {
      lastSpokenQuestionKeyRef.current = "";
      if (stage === "setup" || stage === "results") {
        stopActiveSpeech();
      }
      return;
    }

    if (displayMode === "focus") {
      const currentQ = questionsRef.current[activeQuestionIdx];
      if (voiceMode !== "off" && currentQ) {
        const speakKey = `${currentQ.id}:${currentQ.numbers.join(",")}:${voiceMode}`;
        if (lastSpokenQuestionKeyRef.current !== speakKey) {
          lastSpokenQuestionKeyRef.current = speakKey;
          speakQuestionSequence(currentQ.numbers, voiceMode);
        }
      }
      if (answerMode === "typing") {
        setTimeout(() => {
          focusInputRef.current?.focus();
        }, 60);
      }
    }
  }, [stage, displayMode, activeQuestionIdx, voiceMode, answerMode]);

  // Focus first input when entering sheet mode
  useEffect(() => {
    if (
      stage === "running" &&
      displayMode === "sheet" &&
      answerMode === "typing"
    ) {
      const firstIdxOnPage = sheetPage * SHEET_PAGE_SIZE;
      setTimeout(() => {
        inputRefs.current[firstIdxOnPage]?.focus();
      }, 100);
    }
  }, [stage, displayMode, sheetPage, answerMode]);

  // ── Answer Update Handlers ─────────────────────────────────
  const updateAnswer = (index: number, val: string) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, userAnswer: val } : q))
    );
  };

  // Select a multiple-choice option and auto-advance!
  const handleSelectChoice = (qIndex: number, choiceVal: number) => {
    playSoundEffect("tick");
    const updatedList = questions.map((q, i) =>
      i === qIndex ? { ...q, userAnswer: String(choiceVal) } : q
    );
    setQuestions(updatedList);

    if (displayMode === "focus") {
      // Auto-advance to next question in Focus mode!
      if (qIndex + 1 < updatedList.length) {
        setTimeout(() => {
          setActiveQuestionIdx(qIndex + 1);
        }, 120);
      } else {
        // Last question answered -> auto-grade or let user finish
        setTimeout(() => {
          finishAndGrade(updatedList);
        }, 180);
      }
    } else {
      // In Sheet mode, highlight next question
      if (qIndex + 1 < updatedList.length) {
        const nextIdx = qIndex + 1;
        setActiveQuestionIdx(nextIdx);
        const targetPage = Math.floor(nextIdx / SHEET_PAGE_SIZE);
        if (targetPage !== sheetPage) {
          setSheetPage(targetPage);
        }
      }
    }
  };

  const advanceFocusQuestion = () => {
    playSoundEffect("tick");
    if (activeQuestionIdx + 1 < questions.length) {
      setActiveQuestionIdx((p) => p + 1);
    } else {
      finishAndGrade();
    }
  };

  const handleSheetKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    idx: number
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      playSoundEffect("tick");
      const nextIdx = idx + 1;
      if (nextIdx < questions.length) {
        const targetPage = Math.floor(nextIdx / SHEET_PAGE_SIZE);
        setActiveQuestionIdx(nextIdx);
        if (targetPage !== sheetPage) {
          setSheetPage(targetPage);
          setTimeout(() => {
            inputRefs.current[nextIdx]?.focus();
            inputRefs.current[nextIdx]?.select();
          }, 80);
        } else {
          inputRefs.current[nextIdx]?.focus();
          inputRefs.current[nextIdx]?.select();
        }
      } else {
        finishAndGrade();
      }
    }
  };

  // Format MM:SS
  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Calculated stats
  const answeredCount = questions.filter(
    (q) => q.userAnswer.trim() !== ""
  ).length;
  const correctCount = questions.filter(
    (q) =>
      q.userAnswer.trim() !== "" &&
      parseInt(q.userAnswer.trim(), 10) === q.correctAnswer
  ).length;
  const wrongCount = answeredCount - correctCount;
  const unansweredCount = questions.length - answeredCount;
  const accuracyPct =
    questions.length > 0
      ? Math.round((correctCount / questions.length) * 100)
      : 0;
  const avgSecondsPerQuestion =
    answeredCount > 0 ? (elapsedSeconds / answeredCount).toFixed(1) : "—";

  const activeQuestion = questions[activeQuestionIdx];
  const totalSheetPages = Math.ceil(questions.length / SHEET_PAGE_SIZE);
  const currentSheetQuestions = questions.slice(
    sheetPage * SHEET_PAGE_SIZE,
    (sheetPage + 1) * SHEET_PAGE_SIZE
  );

  // Filtered questions for Results review
  const filteredReviewQuestions = questions.filter((q) => {
    if (reviewGroupFilter !== "all" && q.groupId !== reviewGroupFilter) {
      return false;
    }
    const isRight =
      q.userAnswer.trim() !== "" &&
      parseInt(q.userAnswer.trim(), 10) === q.correctAnswer;
    if (reviewFilter === "correct") return isRight;
    if (reviewFilter === "wrong") return !isRight;
    return true;
  });

  const totalResultsPages = Math.ceil(
    filteredReviewQuestions.length / SHEET_PAGE_SIZE
  );
  const paginatedReviewQuestions = filteredReviewQuestions.slice(
    resultsPage * SHEET_PAGE_SIZE,
    (resultsPage + 1) * SHEET_PAGE_SIZE
  );

  return (
    <div
      className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${
        stage === "running"
          ? "py-3 sm:py-4 space-y-3"
          : "py-6 sm:py-8 space-y-6"
      }`}
    >
      {/* Top Header Bar (Full in Setup/Results, Ultra-Compact when Running) */}
      {stage !== "running" && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/70 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-black">
              <Trophy className="w-3.5 h-3.5 text-amber-600" />
              <span>محاكي المسابقات الرسمية (حتى 1000 سؤال بقواعد متعددة)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              محاكي مسابقة الحساب الذهني 🏅
            </h1>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {stage !== "setup" && !activeAssignment && (
              <button
                type="button"
                onClick={() => {
                  clearCompetitionTimer();
                  setStage("setup");
                }}
                className="px-3.5 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <Settings2 className="w-4 h-4" />
                <span>إعدادات المسابقة</span>
              </button>
            )}
            <Link
              href="/mental-arithmetic"
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              <ArrowRight className="w-4 h-4" />
              <span>رجوع</span>
            </Link>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. SETUP STAGE (إعدادات المسابقة والوقت وبناء مجموعات القواعد)              */}
      {/* ========================================================================= */}
      {stage === "setup" && (
        <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300">
          {/* Active Homework / Admin Competition — STRICTLY LOCKED (Read-Only, Start Button Only) */}
          {activeAssignment && (
            <div className="max-w-3xl mx-auto rounded-[2rem] bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 text-white border-2 border-amber-400/50 shadow-2xl overflow-hidden">
              {/* Top Locked Ribbon */}
              <div className="px-6 py-3 bg-gradient-to-l from-amber-500 via-amber-400 to-yellow-400 text-slate-950 flex flex-wrap items-center justify-between gap-2 text-xs font-black">
                <span className="inline-flex items-center gap-1.5">
                  <Trophy className="w-4 h-4" />
                  <span>
                    {activeAssignment.kind === "trainer_homework"
                      ? `🎓 بطولة رسمية من المدرب: ${activeAssignment.creatorName}`
                      : `🏆 مسابقة رسمية من إدارة منصة العقل الخارق`}
                  </span>
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-950 text-amber-300 text-[11px]">
                  <Lock className="w-3 h-3" />
                  <span>إعدادات مقفلة (غير قابلة للتعديل)</span>
                </span>
              </div>

              <div className="p-6 sm:p-8 space-y-6">
                {/* Title & Description */}
                <div className="text-center space-y-2">
                  <h2 className="text-2xl sm:text-3xl font-black text-white">
                    {activeAssignment.title}
                  </h2>
                  {activeAssignment.description && (
                    <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
                      {activeAssignment.description}
                    </p>
                  )}
                </div>

                {/* Read-Only Locked Specs Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                    <div className="text-[11px] font-bold text-slate-400">عدد الأسئلة</div>
                    <div className="text-lg font-black font-mono text-amber-300 mt-0.5">
                      {totalQuestionsCount} سؤال
                    </div>
                  </div>
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                    <div className="text-[11px] font-bold text-slate-400">الوقت المحدد</div>
                    <div className="text-lg font-black text-emerald-300 mt-0.5">
                      {timeMode === "countdown" ? `${durationMinutes} دقائق` : "تايمر مفتوح"}
                    </div>
                  </div>
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                    <div className="text-[11px] font-bold text-slate-400">طريقة الإجابة</div>
                    <div className="text-sm sm:text-base font-black text-indigo-300 mt-1">
                      {answerMode === "typing" ? "✍️ كتابة الجواب" : `🔘 ${choicesCount} اختيارات`}
                    </div>
                  </div>
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                    <div className="text-[11px] font-bold text-slate-400">عدد القواعد</div>
                    <div className="text-lg font-black text-purple-300 mt-0.5">
                      {ruleGroups.length} {ruleGroups.length > 1 ? "قواعد" : "قاعدة"}
                    </div>
                  </div>
                </div>

                {/* Locked Rule Groups Breakdown (Read-Only Chips) */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                  <div className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" />
                    <span>تفاصيل القواعد المقررة في البطولة (للعرض فقط):</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {ruleGroups.map((g, i) => (
                      <span
                        key={g.id}
                        className="px-3 py-1 rounded-xl bg-slate-900/90 border border-white/10 text-slate-100 text-xs font-bold"
                      >
                        ({i + 1}) {formatGroupLabel(g)} — {g.count} سؤال
                      </span>
                    ))}
                  </div>
                </div>

                {/* Previous Attempt Notice (Retry allowed & labeled in results) */}
                {isOfficialAccount && priorAttemptCount > 0 && (
                  <div className="p-3.5 rounded-2xl bg-indigo-500/20 border border-indigo-400/40 text-indigo-100 text-xs sm:text-sm font-bold flex items-center gap-2.5">
                    <RotateCcw className="w-5 h-5 text-amber-300 shrink-0" />
                    <span>
                      لقد أكملت <strong className="text-amber-300">{formatAttemptLabelAr(priorAttemptCount)}</strong> بنجاح! يمكنك المحاولة مرة أخرى الآن وستُسجَّل نتيجتك في لوحة المدرب والإدارة بعنوان:{" "}
                      <strong className="text-emerald-300">{formatAttemptLabelAr(priorAttemptCount + 1)}</strong>.
                    </span>
                  </div>
                )}

                {/* Start Button Only (for Official Accounts) OR Official Account Gate (for Guests) */}
                {isOfficialAccount ? (
                  <div className="space-y-4 pt-1">
                    <button
                      type="button"
                      onClick={startCompetition}
                      className="w-full py-5 px-8 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-lg sm:text-xl shadow-2xl shadow-amber-500/25 flex items-center justify-center gap-3 transition-transform active:scale-95"
                    >
                      {priorAttemptCount > 0 ? (
                        <>
                          <RotateCcw className="w-6 h-6" />
                          <span>ابدأ {formatAttemptLabelAr(priorAttemptCount + 1)} الآن 🚀</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-6 h-6 fill-current" />
                          <span>ابدأ البطولة الآن 🚀</span>
                        </>
                      )}
                    </button>

                    <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300">
                      <span className="inline-flex items-center gap-1.5 font-bold text-emerald-300">
                        <ShieldCheck className="w-4 h-4 shrink-0" />
                        <span>
                          مسجل بحساب رسمي:{" "}
                          {authProfile?.name || user?.email?.split("@")[0] || "حساب رسمي"}
                          {user?.email ? ` (${user.email})` : ""}
                        </span>
                      </span>
                      <span className="text-[11px] text-slate-400">
                        تصل نتيجتك وتفاصيل إجاباتك تلقائياً إلى مدربك وإدارة المنصة 📊
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-5 rounded-2xl bg-slate-900/90 border-2 border-rose-500/60 shadow-2xl space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-400/40 text-rose-300 flex items-center justify-center shrink-0">
                        <Lock className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-sm sm:text-base font-black text-amber-300">
                          🔐 المشاركة متاحة للطلاب المسجلين بحساب رسمي فقط
                        </h3>
                        <p className="text-xs text-slate-200 leading-relaxed">
                          لا يمكن دخول المسابقة كزائر. سجّل دخولك بحسابك الرسمي أو أنشئ حساب طالب جديد في المنصة لتُحفظ نتيجتك وتظهر بالتفصيل الكامل لدى مدربك وإدارة المنصة، وسيتم إعادتك تلقائياً إلى هذه البطولة فور تسجيل الدخول.
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1">
                      <button
                        type="button"
                        onClick={() => navigateToOfficialAuth("/login")}
                        className="flex-1 px-5 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95"
                      >
                        <LogIn className="w-4 h-4" />
                        <span>تسجيل الدخول بحسابك الرسمي 🔑</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => navigateToOfficialAuth("/register")}
                        className="flex-1 px-5 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>إنشاء حساب طالب جديد ✨</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Trainer / Admin Quick Tournament Action Strip (Hidden inside a locked tournament link) */}
          {isTrainerOrAdminUser && !activeAssignment && (
            <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-l from-brand-700 via-indigo-700 to-purple-800 text-white shadow-lg border border-amber-300/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="text-sm sm:text-base font-black flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-300" />
                  <span>وضع المدرب: أنشئ بطولة خاصة لطلابك مباشرة من المحاكي!</span>
                </div>
                <p className="text-xs text-indigo-100">
                  اضبط القواعد والوقت أدناه ثم اضغط «بطولة لطلابي» لمشاركتها عبر رابط أو إرسالها لطلابك ومتابعة نتائجهم لحظياً.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 shrink-0 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setShowTrainerTournamentModal(true)}
                  className="flex-1 sm:flex-initial px-4 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-md flex items-center justify-center gap-1.5 transition-transform active:scale-95"
                >
                  <Users className="w-4 h-4" />
                  <span>بطولة لطلابي 🏆</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowTrainerResultsBoard(true)}
                  className="flex-1 sm:flex-initial px-4 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 text-white border border-white/25 font-black text-xs flex items-center justify-center gap-1.5"
                >
                  <Medal className="w-4 h-4 text-amber-300" />
                  <span>بطولاتي ونتائج الطلاب ({trainerTournamentsCount})</span>
                </button>
              </div>
            </div>
          )}

          {/* Monthly Free Trial & Subscription Status Banner */}
          {!activeAssignment && (() => {
            const extProf = getExtendedProfile(activeUserId, {
              email: user?.email || authProfile?.email,
              name: authProfile?.name,
              role: (authProfile?.role as "student" | "trainer" | "admin") || "student",
            });
            const subEval = evaluateSubscription(extProf.subscription);
            const trial = getMonthlyTrialStatus(activeUserId);

            if (
              subEval.isActive ||
              extProf.role === "trainer" ||
              extProf.role === "admin" ||
              authProfile?.role === "trainer"
            ) {
              const isTrainer = extProf.role === "trainer" || authProfile?.role === "trainer";
              return (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between gap-3 text-xs sm:text-sm">
                  <div className="font-black text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>
                      {isTrainer
                        ? "حساب مدرب معتمد 🎓 — محاكي المسابقة وجميع الميزات مفتوحة لك بلا حدود!"
                        : `اشتراكك في محاكي المسابقة فعال (${extProf.subscription.planLabel}) — متاح لك حتى 1000 سؤال بلا حدود!`}
                    </span>
                  </div>
                  {!isTrainer && subEval.daysRemaining > 0 && (
                    <span className="px-3 py-1 rounded-full bg-emerald-600 text-white font-bold text-xs">
                      متبقي {subEval.daysRemaining} يوم
                    </span>
                  )}
                </div>
              );
            }

            return (
              <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-l from-indigo-950 via-slate-900 to-brand-950 text-white border border-amber-400/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
                <div className="space-y-1">
                  <div className="text-xs sm:text-sm font-black text-amber-300">
                    {isGuest
                      ? "🎁 سجّل دخولك بحسابك الرسمي لتحصل شهرياً على تجربة مجانية (100 سؤال أو 10 دقائق)!"
                      : `🎁 حصتك التجريبية المجانية لهذا الشهر: متبقي لك (${trial.questionsRemaining} من ${MONTHLY_FREE_QUESTIONS_LIMIT} سؤال) وبحد أقصى ${MONTHLY_FREE_MINUTES_LIMIT} دقائق`}
                  </div>
                  <p className="text-xs text-slate-300">
                    لفتح محاكي المسابقة بلا حدود طوال الوقت (حتى 1000 سؤال): اشتراك شهري 25,000 د.ع | 3 أشهر 50,000 د.ع | سنوي 100,000 د.ع
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPaywallReason("");
                    setShowSubPaywallModal(true);
                  }}
                  className="px-5 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shrink-0 shadow-md"
                >
                  عرض باقات الاشتراك 👑
                </button>
              </div>
            );
          })()}

          {!activeAssignment && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
            {/* Section 1: Time Settings (تحديد الوقت: 5 إلى 30 دقيقة أو تايمر مفتوح) */}
            <div className="p-6 sm:p-8 space-y-5 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-white">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-400" />
                  <h2 className="text-lg sm:text-xl font-black">
                    1. نظام الوقت والتايمر
                  </h2>
                </div>
                <span className="text-xs px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 font-bold">
                  {timeMode === "countdown"
                    ? `وقت محدد: ${durationMinutes} دقائق`
                    : "تايمر مفتوح (حساب الزمن المستغرق)"}
                </span>
              </div>

              {/* Time Mode Toggle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTimeMode("countdown")}
                  className={`p-4 rounded-2xl border text-right transition-all flex items-start gap-3 ${
                    timeMode === "countdown"
                      ? "bg-amber-400 text-slate-950 border-amber-300 shadow-lg font-black"
                      : "bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800"
                  }`}
                >
                  <Timer className="w-6 h-6 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm sm:text-base font-black">
                      تحديد وقت محدد (5 إلى 30 دقيقة)
                    </div>
                    <div
                      className={`text-xs mt-0.5 ${
                        timeMode === "countdown"
                          ? "text-slate-800"
                          : "text-slate-400"
                      }`}
                    >
                      عد تنازلي ينتهي تلقائياً ويصحح الورقة عند انتهاء الوقت
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setTimeMode("stopwatch")}
                  className={`p-4 rounded-2xl border text-right transition-all flex items-start gap-3 ${
                    timeMode === "stopwatch"
                      ? "bg-amber-400 text-slate-950 border-amber-300 shadow-lg font-black"
                      : "bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800"
                  }`}
                >
                  <Clock className="w-6 h-6 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm sm:text-base font-black">
                      تشغيل تايمر مفتوح (ساعة إيقاف)
                    </div>
                    <div
                      className={`text-xs mt-0.5 ${
                        timeMode === "stopwatch"
                          ? "text-slate-800"
                          : "text-slate-400"
                      }`}
                    >
                      يحسب الوقت المستغرق حتى ينهي الطالب جميع الأسئلة
                    </div>
                  </div>
                </button>
              </div>

              {/* Duration Selector (5 to 30 minutes) */}
              {timeMode === "countdown" && (
                <div className="space-y-3 pt-2 animate-in fade-in">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                    <span>اختر مدة المسابقة بالدقائق (من 5 إلى 30 دقيقة):</span>
                    <span className="text-amber-400 font-mono text-sm font-black">
                      {durationMinutes} دقيقة
                    </span>
                  </div>

                  <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                    {PRESET_MINUTES.map((mins) => (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => setDurationMinutes(mins)}
                        className={`py-2.5 rounded-xl font-black text-xs sm:text-sm border transition-all ${
                          durationMinutes === mins
                            ? "bg-amber-400 text-slate-950 border-amber-300 shadow-md scale-105"
                            : "bg-slate-800/90 text-slate-300 border-slate-700 hover:border-slate-500"
                        }`}
                      >
                        {mins} د
                      </button>
                    ))}
                  </div>

                  {/* Smooth Range Slider 5..30 */}
                  <div className="pt-1 flex items-center gap-3">
                    <span className="text-xs font-mono text-slate-400">
                      5 د
                    </span>
                    <input
                      type="range"
                      min={5}
                      max={30}
                      step={1}
                      value={durationMinutes}
                      onChange={(e) =>
                        setDurationMinutes(parseInt(e.target.value, 10))
                      }
                      className="flex-1 accent-amber-400 cursor-pointer"
                    />
                    <span className="text-xs font-mono text-slate-400">
                      30 د
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Section 2: Answer Mode (طريقة الإجابة: كتابة الناتج أو اختيارات 2 / 3 / 4 / 5) */}
            <div className="p-6 sm:p-8 space-y-4 bg-amber-50/40 dark:bg-slate-800/40">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <ListChecks className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                  <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                    2. نظام وطريقة الإجابة على الأسئلة
                  </h2>
                </div>
                <span className="text-xs font-black px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                  {answerMode === "typing"
                    ? "كتابة الناتج مباشرة"
                    : `اختيارات متعددة (${choicesCount} اختيارات)`}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setAnswerMode("typing")}
                  className={`p-4 rounded-2xl border-2 text-right transition-all flex items-start gap-3 ${
                    answerMode === "typing"
                      ? "bg-brand-600 text-white border-brand-600 shadow-md"
                      : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-brand-400"
                  }`}
                >
                  <Keyboard className="w-6 h-6 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm sm:text-base font-black">
                      ✍️ كتابة الجواب (إدخال الناتج)
                    </div>
                    <div
                      className={`text-xs mt-0.5 ${
                        answerMode === "typing"
                          ? "text-brand-100"
                          : "text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      يكتب المتسابق الناتج عبر لوحة الأرقام أو الكيبورد ثم ينتقل للسؤال التالي
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setAnswerMode("choices")}
                  className={`p-4 rounded-2xl border-2 text-right transition-all flex items-start gap-3 ${
                    answerMode === "choices"
                      ? "bg-brand-600 text-white border-brand-600 shadow-md"
                      : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-brand-400"
                  }`}
                >
                  <ListChecks className="w-6 h-6 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm sm:text-base font-black">
                      🔘 اختيارات متعددة (2 أو 3 أو 4 أو 5 اختيارات)
                    </div>
                    <div
                      className={`text-xs mt-0.5 ${
                        answerMode === "choices"
                          ? "text-brand-100"
                          : "text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      يختار المتسابق الجواب الصحيح بضغطة واحدة وينتقل فوراً للسؤال التالي
                    </div>
                  </div>
                </button>
              </div>

              {/* Choices Count Picker (2, 3, 4, 5) */}
              {answerMode === "choices" && (
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-brand-200 dark:border-brand-800 space-y-2.5 animate-in fade-in">
                  <div className="text-xs font-black text-slate-700 dark:text-slate-200">
                    اختر عدد الاختيارات لكل سؤال (2 أو 3 أو 4 أو 5):
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {CHOICES_COUNT_OPTIONS.map((cnt) => (
                      <button
                        key={cnt}
                        type="button"
                        onClick={() => setChoicesCount(cnt)}
                        className={`py-2.5 px-3 rounded-xl font-black text-xs sm:text-sm border transition-all ${
                          choicesCount === cnt
                            ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                            : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-emerald-400"
                        }`}
                      >
                        {cnt} اختيارات
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Section 3: Multi-Rule & Question Groups Builder (بناء مجموعات الأسئلة والقواعد حتى 1000 سؤال) */}
            <div className="p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Layers className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                    <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                      3. تكوين الأسئلة والقواعد (حتى 1000 سؤال)
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    يمكنك تحديد قاعدة واحدة أو الضغط على زر{" "}
                    <strong>+ إضافة قاعدة أخرى</strong> لدمج عدة مستويات ومراتب في
                    نفس المسابقة مع تحديد العدد من كل نوع.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={applyMultiRuleExamplePreset}
                    className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/70 dark:hover:bg-amber-900/60 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-black transition-colors text-right"
                    title="تطبيق نموذج: آحاد 100 + عشرات بسيط 50 + مركب 5 قاعدة 4 (50)"
                  >
                    ✨ نموذج جاهز (آحاد 100 + عشرات 50 + مركب 5 ق4 50)
                  </button>

                  <span className="text-xs font-black px-3.5 py-1.5 rounded-full bg-brand-600 text-white shadow-xs whitespace-nowrap">
                    الإجمالي: {totalQuestionsCount} / 1000 سؤال
                  </span>
                </div>
              </div>

              {rawTotalQuestions > MAX_TOTAL_QUESTIONS && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs font-bold">
                  ⚠️ مجموع الأسئلة المحدد ({rawTotalQuestions}) يتجاوز الحد
                  الأقصى المسموح به في الورقة الواحدة (1000 سؤال)؛ سيتم توليد
                  أول 1000 سؤال.
                </div>
              )}

              {/* Rule Groups List */}
              <div className="space-y-4">
                {ruleGroups.map((group, idx) => (
                  <div
                    key={group.id}
                    className="rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/70 overflow-hidden transition-all hover:border-brand-300 dark:hover:border-brand-800"
                  >
                    {/* Group Card Header */}
                    <div className="px-4 py-3 bg-slate-100/90 dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-700/80 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-brand-600 text-white text-xs font-black flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="font-black text-xs sm:text-sm text-slate-900 dark:text-white">
                          المجموعة #{idx + 1}: {formatGroupLabel(group)}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-xs font-black">
                          {group.count} سؤال
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => duplicateGroup(group)}
                          className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-bold flex items-center gap-1 transition-colors"
                          title="تكرار هذه المجموعة"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>تكرار</span>
                        </button>
                        {ruleGroups.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeGroup(group.id)}
                            className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/70 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 text-xs font-bold flex items-center gap-1 transition-colors"
                            title="حذف هذه المجموعة"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>حذف</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Group Card Body */}
                    <div className="p-4 sm:p-5 space-y-5">
                      {/* Row A: Question Count for this Group (1..1000) */}
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <label className="text-xs font-black text-slate-700 dark:text-slate-200">
                            عدد الأسئلة من هذا النوع (من 1 إلى 1000):
                          </label>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() =>
                                updateGroup(group.id, {
                                  count: Math.max(1, (group.count || 10) - 10),
                                })
                              }
                              className="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-mono font-black text-xs"
                            >
                              -10
                            </button>
                            <input
                              type="number"
                              min={1}
                              max={1000}
                              dir="ltr"
                              value={group.count}
                              onChange={(e) => {
                                const val = parseInt(e.target.value, 10);
                                updateGroup(group.id, {
                                  count: isNaN(val)
                                    ? 1
                                    : Math.max(1, Math.min(1000, val)),
                                });
                              }}
                              className="w-24 py-1.5 px-2.5 rounded-xl bg-white dark:bg-slate-950 border-2 border-brand-500 text-center font-mono font-black text-sm text-brand-700 dark:text-amber-400 focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                updateGroup(group.id, {
                                  count: Math.min(
                                    1000,
                                    (group.count || 0) + 10
                                  ),
                                })
                              }
                              className="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-mono font-black text-xs"
                            >
                              +10
                            </button>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                          {QUICK_GROUP_COUNTS.map((cnt) => (
                            <button
                              key={cnt}
                              type="button"
                              onClick={() =>
                                updateGroup(group.id, { count: cnt })
                              }
                              className={`px-3 py-1.5 rounded-xl font-black text-xs border transition-all ${
                                group.count === cnt
                                  ? "bg-brand-600 text-white border-brand-600 shadow-xs"
                                  : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-brand-400"
                              }`}
                            >
                              {cnt} سؤال
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Row B: Digits & Level */}
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                        <div className="lg:col-span-4 space-y-2">
                          <label className="text-xs font-black text-slate-700 dark:text-slate-200 block">
                            المرتبة (عدد الخانات):
                          </label>
                          <div className="grid grid-cols-4 gap-1.5">
                            {[
                              { d: 1, label: "آحاد" },
                              { d: 2, label: "عشرات" },
                              { d: 3, label: "مئات" },
                              { d: 4, label: "ألوف" },
                            ].map((item) => (
                              <button
                                key={item.d}
                                type="button"
                                onClick={() =>
                                  updateGroup(group.id, {
                                    digitsCount: item.d,
                                  })
                                }
                                className={`py-2.5 rounded-xl text-xs font-black border transition-all ${
                                  group.digitsCount === item.d
                                    ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                                    : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-400"
                                }`}
                              >
                                {item.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="lg:col-span-8 space-y-2">
                          <label className="text-xs font-black text-slate-700 dark:text-slate-200 block">
                            نوع القاعدة الحسابية:
                          </label>
                          <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                            {[
                              { id: "simple" as ArithmeticLevel, title: "✅ بسيط" },
                              {
                                id: "complex_5" as ArithmeticLevel,
                                title: "5️⃣ مركب 5",
                              },
                              {
                                id: "complex_10" as ArithmeticLevel,
                                title: "🔟 مركب 10",
                              },
                              {
                                id: "mixed" as ArithmeticLevel,
                                title: "🔀 مركب 5 و10",
                              },
                              {
                                id: "general" as ArithmeticLevel,
                                title: "🎲 عام شامل",
                              },
                            ].map((item) => (
                              <button
                                key={item.id}
                                type="button"
                                onClick={() =>
                                  updateGroup(group.id, { level: item.id })
                                }
                                className={`py-2.5 px-2 rounded-xl border text-xs transition-all ${
                                  group.level === item.id
                                    ? "bg-emerald-600 text-white border-emerald-600 shadow-xs font-black"
                                    : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-400 font-bold"
                                }`}
                              >
                                {item.title}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Row C: Sub-rules selector */}
                      {(group.level === "complex_5" ||
                        group.level === "complex_10") && (
                        <div className="p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 space-y-2">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <span className="text-xs font-black text-emerald-900 dark:text-emerald-200">
                              تحديد القاعدة الفرعية في{" "}
                              {group.level === "complex_5"
                                ? "أصدقاء الـ 5"
                                : "أصدقاء الـ 10"}
                              :
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                updateGroup(group.id, { targetRules: [] })
                              }
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-black border transition-all ${
                                group.targetRules.length === 0
                                  ? "bg-emerald-600 text-white border-emerald-600"
                                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                              }`}
                            >
                              الكل (جميع القواعد)
                            </button>
                          </div>

                          <div className="flex flex-wrap gap-1.5">
                            {(group.level === "complex_5"
                              ? [1, 2, 3, 4]
                              : [1, 2, 3, 4, 5, 6, 7, 8, 9]
                            ).map((r) => {
                              const active = group.targetRules.includes(r);
                              return (
                                <button
                                  key={r}
                                  type="button"
                                  onClick={() => toggleGroupSubRule(group.id, r)}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-black border transition-all ${
                                    active
                                      ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                                      : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-400"
                                  }`}
                                >
                                  قاعدة {r} (±{r})
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Row D: Terms Count & Operations per Group */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 border-t border-slate-200/70 dark:border-slate-800">
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-black text-slate-600 dark:text-slate-400 block">
                            عدد الأرقام (الطوابق) في كل سؤال:
                          </label>
                          <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                            {[3, 4, 5, 7, 10].map((t) => (
                              <button
                                key={t}
                                type="button"
                                onClick={() =>
                                  updateGroup(group.id, { termsCount: t })
                                }
                                className={`py-1.5 rounded-lg text-xs font-black border transition-all ${
                                  group.termsCount === t
                                    ? "bg-violet-600 text-white border-violet-600"
                                    : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                                }`}
                              >
                                {t} أرقام
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[11px] font-black text-slate-600 dark:text-slate-400 block">
                            نوع العمليات:
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                updateGroup(group.id, {
                                  allowSubtraction: true,
                                })
                              }
                              className={`py-1.5 rounded-lg text-xs font-black border transition-all ${
                                group.allowSubtraction
                                  ? "bg-brand-600 text-white border-brand-600"
                                  : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                              }`}
                            >
                              ➕➖ جمع وطرح
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                updateGroup(group.id, {
                                  allowSubtraction: false,
                                })
                              }
                              className={`py-1.5 rounded-lg text-xs font-black border transition-all ${
                                !group.allowSubtraction
                                  ? "bg-brand-600 text-white border-brand-600"
                                  : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                              }`}
                            >
                              ➕ جمع فقط
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* "+" Button to Add Another Rule Group */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                <button
                  type="button"
                  onClick={addNewGroup}
                  disabled={rawTotalQuestions >= MAX_TOTAL_QUESTIONS}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl border-2 border-dashed border-brand-400 dark:border-brand-600 bg-brand-50/50 hover:bg-brand-50 dark:bg-brand-950/30 dark:hover:bg-brand-950/60 text-brand-700 dark:text-brand-300 font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-40"
                >
                  <Plus className="w-5 h-5" />
                  <span>
                    + إضافة قاعدة أخرى ضمن الأسئلة (مثلاً: عشرات بسيط، مركب 5
                    قاعدة 4...)
                  </span>
                </button>

                {ruleGroups.length > 1 && (
                  <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl self-stretch sm:self-auto justify-center">
                    <button
                      type="button"
                      onClick={() => setOrderMode("sequential")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all ${
                        orderMode === "sequential"
                          ? "bg-brand-600 text-white shadow-xs"
                          : "text-slate-600 dark:text-slate-300"
                      }`}
                    >
                      <ListOrdered className="w-3.5 h-3.5" />
                      <span>بالتتابع حسب المجموعات</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrderMode("shuffled")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all ${
                        orderMode === "shuffled"
                          ? "bg-brand-600 text-white shadow-xs"
                          : "text-slate-600 dark:text-slate-300"
                      }`}
                    >
                      <Shuffle className="w-3.5 h-3.5" />
                      <span>خلط عشوائي للكل</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Section 4: Display & Voice Settings */}
            <div className="p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-2 gap-5 bg-slate-50/60 dark:bg-slate-800/30">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-600 dark:text-slate-300 block">
                  4. طريقة عرض الأسئلة (يمكن تبديلها أثناء المسابقة):
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDisplayMode("focus")}
                    className={`py-2.5 px-3 rounded-xl text-xs font-black border flex items-center justify-center gap-1.5 transition-all ${
                      displayMode === "focus"
                        ? "bg-brand-600 text-white border-brand-600 shadow-xs"
                        : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    <Target className="w-4 h-4" />
                    <span>سؤال بسؤال + نطق</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDisplayMode("sheet")}
                    className={`py-2.5 px-3 rounded-xl text-xs font-black border flex items-center justify-center gap-1.5 transition-all ${
                      displayMode === "sheet"
                        ? "bg-brand-600 text-white border-brand-600 shadow-xs"
                        : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    <LayoutGrid className="w-4 h-4" />
                    <span>ورقة مسابقة كاملة</span>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-600 dark:text-slate-300 block">
                  5. الصوت والنطق:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setVoiceMode("arabic")}
                    className={`py-2.5 rounded-xl text-xs font-black border transition-all ${
                      voiceMode === "arabic"
                        ? "bg-amber-500 text-slate-950 border-amber-500"
                        : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    🔊 عربي
                  </button>
                  <button
                    type="button"
                    onClick={() => setVoiceMode("english")}
                    className={`py-2.5 rounded-xl text-xs font-black border transition-all ${
                      voiceMode === "english"
                        ? "bg-amber-500 text-slate-950 border-amber-500"
                        : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    🔊 English
                  </button>
                  <button
                    type="button"
                    onClick={() => setVoiceMode("off")}
                    className={`py-2.5 rounded-xl text-xs font-black border transition-all ${
                      voiceMode === "off"
                        ? "bg-amber-500 text-slate-950 border-amber-500"
                        : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    🔇 بدون صوت
                  </button>
                </div>
              </div>
            </div>

            {/* Start CTA & Blueprint Summary */}
            <div className="p-6 sm:p-8 bg-slate-50 dark:bg-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1.5 text-right w-full sm:w-auto">
                <div className="flex flex-wrap items-center gap-2 text-xs font-black text-slate-700 dark:text-slate-200">
                  <span>📋 إجمالي الأسئلة: {totalQuestionsCount} سؤال</span>
                  <span>•</span>
                  <span>
                    ⏱️{" "}
                    {timeMode === "countdown"
                      ? `${durationMinutes} دقيقة`
                      : "تايمر مفتوح"}
                  </span>
                  <span>•</span>
                  <span>
                    {answerMode === "typing"
                      ? "✍️ كتابة الجواب"
                      : `🔘 ${choicesCount} اختيارات`}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {ruleGroups.map((g, i) => (
                    <span
                      key={g.id}
                      className="text-[11px] font-bold px-2.5 py-0.5 rounded-lg bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    >
                      ({i + 1}) {formatGroupLabel(g)}: {g.count}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto shrink-0">
                {isTrainerOrAdminUser && (
                  <button
                    type="button"
                    onClick={() => setShowTrainerTournamentModal(true)}
                    className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Trophy className="w-5 h-5" />
                    <span>إطلاق كـ بطولة لطلابي 🏆</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={startCompetition}
                  className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-black text-base shadow-xl shadow-brand-500/25 transition-all hover:scale-102 active:scale-95 flex items-center justify-center gap-2.5"
                >
                  <Play className="w-5 h-5 fill-white" />
                  <span>بدء المسابقة الآن ({totalQuestionsCount} سؤال) 🏅</span>
                </button>
              </div>
            </div>
          </div>
          )}

          {/* Trainer Tournament Create Modal & Results Board */}
          <TrainerTournamentModal
            open={showTrainerTournamentModal}
            onClose={() => setShowTrainerTournamentModal(false)}
            creatorId={activeUserId === "guest-local" ? "trainer-qatada" : activeUserId}
            creatorName={authProfile?.name || "المدرب المعتمد"}
            creatorRole={
              authRole === "admin" || authProfile?.role === "admin" ? "admin" : "trainer"
            }
            ruleGroups={ruleGroups}
            totalQuestionsCount={totalQuestionsCount}
            timeMode={timeMode}
            durationMinutes={durationMinutes}
            answerMode={answerMode}
            choicesCount={choicesCount}
            orderMode={orderMode}
            displayMode={displayMode}
            voiceMode={voiceMode}
            onCreated={() => setTournamentsRefreshTick((t) => t + 1)}
          />

          <TrainerTournamentsBoard
            open={showTrainerResultsBoard}
            onClose={() => setShowTrainerResultsBoard(false)}
            creatorId={activeUserId === "guest-local" ? "trainer-qatada" : activeUserId}
            isAdmin={authRole === "admin" || authProfile?.role === "admin"}
            refreshTrigger={tournamentsRefreshTick}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. COUNTDOWN STAGE (التهيئة قبل الانطلاق)                                 */}
      {/* ========================================================================= */}
      {stage === "countdown" && (
        <div className="rounded-[2.5rem] bg-gradient-to-br from-amber-500 via-orange-500 to-rose-600 text-white p-10 sm:p-16 text-center shadow-2xl min-h-[380px] flex flex-col items-center justify-center space-y-5 animate-in zoom-in-95 duration-200">
          <div
            className="font-black leading-none drop-shadow-2xl select-none"
            style={{
              fontSize: "clamp(7rem, 28vw, 13rem)",
              fontFamily:
                "'Fredoka', 'Baloo Bhaijaan 2', 'Alexandria', sans-serif",
            }}
          >
            {countdownNum}
          </div>
          <p className="text-xl sm:text-2xl font-black text-white/95">
            استعد للانطلاق... جهّز تركيزك!
          </p>
          <div className="text-xs sm:text-sm font-bold bg-black/20 px-4 py-1.5 rounded-full">
            {totalQuestionsCount} سؤال •{" "}
            {timeMode === "countdown"
              ? `${durationMinutes} دقيقة`
              : "تايمر مفتوح"}{" "}
            •{" "}
            {answerMode === "typing"
              ? "كتابة الناتج"
              : `${choicesCount} اختيارات`}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. RUNNING COMPETITION STAGE (شاشة اللعب بدون تداخل وبدون الحاجة للتمرير)   */}
      {/* ========================================================================= */}
      {stage === "running" && (
        <div className="space-y-3 animate-in fade-in duration-200">
          {/* Compact Non-Overlapping HUD Bar */}
          <div className="bg-slate-950 text-white p-3 sm:px-5 rounded-2xl border border-slate-800 shadow-lg flex flex-wrap items-center justify-between gap-3">
            {/* Live Timer & Quick Settings Back */}
            <div className="flex items-center gap-2.5">
              <div
                className={`px-3.5 py-1.5 rounded-xl font-mono font-black text-lg sm:text-xl flex items-center gap-2 border ${
                  timeMode === "countdown" && remainingSeconds <= 60
                    ? "bg-rose-600/30 border-rose-500 text-rose-300 animate-pulse"
                    : "bg-slate-900 border-amber-400/40 text-amber-400"
                }`}
              >
                <Timer className="w-4 h-4 sm:w-5 sm:h-5" />
                <span dir="ltr">
                  {timeMode === "countdown"
                    ? formatTime(remainingSeconds)
                    : formatTime(elapsedSeconds)}
                </span>
              </div>
              <div className="text-xs text-slate-400">
                <div className="font-bold text-white">
                  {timeMode === "countdown" ? "الوقت المتبقي" : "الزمن المستغرق"}
                </div>
                <div>
                  تم حل {answeredCount} من {questions.length}
                </div>
              </div>
            </div>

            {/* Live Answer Mode Switcher (كتابة vs اختيارات 2, 3, 4, 5) */}
            <div className="flex flex-wrap items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setAnswerMode("typing")}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1 ${
                  answerMode === "typing"
                    ? "bg-brand-600 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Keyboard className="w-3.5 h-3.5" />
                <span>كتابة</span>
              </button>
              {CHOICES_COUNT_OPTIONS.map((cnt) => (
                <button
                  key={cnt}
                  type="button"
                  onClick={() => {
                    setAnswerMode("choices");
                    setChoicesCount(cnt);
                  }}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-black transition-all ${
                    answerMode === "choices" && choicesCount === cnt
                      ? "bg-emerald-600 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {cnt} اختيارات
                </button>
              ))}
            </div>

            {/* Display Mode Switcher, Settings & Submit Button */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setDisplayMode(displayMode === "sheet" ? "focus" : "sheet")
                }
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 border border-slate-700 transition-colors"
              >
                {displayMode === "sheet" ? (
                  <>
                    <Target className="w-4 h-4 text-amber-400" />
                    <span>سؤال بسؤال</span>
                  </>
                ) : (
                  <>
                    <LayoutGrid className="w-4 h-4 text-amber-400" />
                    <span>الورقة كاملة</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  clearCompetitionTimer();
                  setStage("setup");
                }}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                title="إعدادات المسابقة"
              >
                <Settings2 className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => finishAndGrade()}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-emerald-500/20 transition-all active:scale-95 flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  إنهاء وتصحيح ({answeredCount}/{questions.length})
                </span>
              </button>
            </div>
          </div>

          {/* ================================================================= */}
          {/* MODE B: FOCUS QUESTION-BY-QUESTION (وضع التركيز بجانب بعض بدون تمرير) */}
          {/* ================================================================= */}
          {displayMode === "focus" && activeQuestion && (
            <div className="max-w-4xl mx-auto">
              <div className="bg-slate-950 text-white rounded-3xl p-4 sm:p-6 border-2 border-slate-800 shadow-2xl">
                {/* Question Header Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="px-3.5 py-1 rounded-full bg-brand-600 text-white text-xs sm:text-sm font-black">
                      السؤال {activeQuestion.id} من {questions.length}
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-slate-800 text-amber-300 text-xs font-bold">
                      {activeQuestion.groupLabel}
                    </span>
                  </div>

                  {/* Quick Prev / Speak / Next in Top Header so always visible */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      disabled={activeQuestionIdx === 0}
                      onClick={() =>
                        setActiveQuestionIdx((p) => Math.max(0, p - 1))
                      }
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-35 text-xs font-bold flex items-center gap-1"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                      <span>السابق</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        speakQuestionSequence(
                          activeQuestion.numbers,
                          voiceMode === "off" ? "arabic" : voiceMode,
                          undefined,
                          { force: true }
                        )
                      }
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold flex items-center gap-1.5"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>إعادة نطق</span>
                    </button>

                    <button
                      type="button"
                      onClick={advanceFocusQuestion}
                      className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black flex items-center gap-1"
                    >
                      <span>
                        {activeQuestionIdx + 1 < questions.length
                          ? "التالي"
                          : "تصحيح"}
                      </span>
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Side-by-Side 2-Column Layout on Desktop/Tablet so NOTHING is cut off */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 items-center">
                  {/* Right Column (5 cols): Vertical Numbers */}
                  <div className="md:col-span-5 flex flex-col justify-center">
                    <div className="bg-slate-900/90 rounded-2xl p-4 sm:p-5 border border-slate-800 w-full max-w-xs mx-auto text-center divide-y divide-slate-800/80">
                      {activeQuestion.numbers.map((num, i) => (
                        <div
                          key={i}
                          dir="ltr"
                          className={`${
                            activeQuestion.numbers.length > 5
                              ? "text-2xl sm:text-3xl py-1"
                              : "text-3xl sm:text-4xl py-1.5"
                          } font-black font-mono tracking-wider ${
                            num < 0 ? "text-rose-400" : "text-emerald-400"
                          }`}
                        >
                          {num > 0 && i > 0 ? `+${num}` : num}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Left Column (7 cols): Multiple Choices OR Answer Input + Keypad */}
                  <div className="md:col-span-7 flex flex-col justify-center">
                    {answerMode === "choices" ? (
                      <div className="space-y-3.5">
                        <div className="text-xs sm:text-sm font-black text-slate-300 text-center md:text-right">
                          اختر الإجابة الصحيحة ({choicesCount} اختيارات — ينتقل
                          تلقائياً للسؤال التالي):
                        </div>

                        <div
                          className={`grid gap-3 ${
                            choicesCount === 2
                              ? "grid-cols-2"
                              : choicesCount === 3
                              ? "grid-cols-2 sm:grid-cols-3"
                              : choicesCount === 4
                              ? "grid-cols-2"
                              : "grid-cols-2 sm:grid-cols-3"
                          }`}
                        >
                          {activeQuestion.choices
                            .slice(0, choicesCount)
                            .map((choiceVal, cIdx) => {
                              const isSelected =
                                activeQuestion.userAnswer.trim() !== "" &&
                                parseInt(activeQuestion.userAnswer, 10) ===
                                  choiceVal;
                              return (
                                <button
                                  key={cIdx}
                                  type="button"
                                  dir="ltr"
                                  onClick={() =>
                                    handleSelectChoice(
                                      activeQuestionIdx,
                                      choiceVal
                                    )
                                  }
                                  className={`py-4 sm:py-5 px-4 rounded-2xl font-mono font-black text-3xl sm:text-4xl border-2 transition-all active:scale-95 flex items-center justify-center shadow-lg ${
                                    isSelected
                                      ? "bg-amber-400 text-slate-950 border-amber-300 ring-4 ring-amber-400/25"
                                      : "bg-slate-900 hover:bg-slate-800 text-white border-slate-700 hover:border-amber-400"
                                  }`}
                                >
                                  {choiceVal}
                                </button>
                              );
                            })}
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <button
                            type="button"
                            disabled={activeQuestionIdx === 0}
                            onClick={() =>
                              setActiveQuestionIdx((p) => Math.max(0, p - 1))
                            }
                            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-bold flex items-center gap-1.5"
                          >
                            <ArrowRight className="w-4 h-4" />
                            <span>السؤال السابق</span>
                          </button>

                          <button
                            type="button"
                            onClick={advanceFocusQuestion}
                            className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-md"
                          >
                            <span>
                              {activeQuestionIdx + 1 < questions.length
                                ? "السؤال التالي ⬅"
                                : "إنهاء وتصحيح ✔"}
                            </span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Typing + Compact Keypad Mode */
                      <div className="space-y-2.5">
                        {/* Input + Direct Next Button side-by-side */}
                        <div className="flex gap-2">
                          <input
                            ref={focusInputRef}
                            type="number"
                            dir="ltr"
                            placeholder="الناتج..."
                            value={activeQuestion.userAnswer}
                            onChange={(e) =>
                              updateAnswer(activeQuestionIdx, e.target.value)
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                advanceFocusQuestion();
                              }
                            }}
                            className="flex-1 py-2.5 px-4 rounded-2xl bg-slate-900 border-2 border-amber-400 text-center font-mono font-black text-2xl sm:text-3xl text-white focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={advanceFocusQuestion}
                            className="px-5 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm sm:text-base shrink-0 shadow-md transition-transform active:scale-95"
                          >
                            {activeQuestionIdx + 1 < questions.length
                              ? "التالي ⬅"
                              : "تصحيح ✔"}
                          </button>
                        </div>

                        {/* Compact 3x4 Keypad */}
                        <div className="grid grid-cols-3 gap-2">
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
                            <button
                              key={d}
                              type="button"
                              onClick={() => {
                                playSoundEffect("tick");
                                updateAnswer(
                                  activeQuestionIdx,
                                  activeQuestion.userAnswer + d
                                );
                              }}
                              className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-mono font-black text-xl sm:text-2xl border border-slate-700/80"
                            >
                              {d}
                            </button>
                          ))}
                          <button
                            type="button"
                            onClick={() =>
                              updateAnswer(
                                activeQuestionIdx,
                                activeQuestion.userAnswer.slice(0, -1)
                              )
                            }
                            className="py-2.5 rounded-xl bg-rose-500/30 hover:bg-rose-500/50 text-rose-200 font-bold text-xs sm:text-sm border border-rose-500/30"
                          >
                            مسح ⌫
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              playSoundEffect("tick");
                              updateAnswer(
                                activeQuestionIdx,
                                activeQuestion.userAnswer + "0"
                              );
                            }}
                            className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-mono font-black text-xl sm:text-2xl border border-slate-700/80"
                          >
                            0
                          </button>
                          <button
                            type="button"
                            onClick={advanceFocusQuestion}
                            className="py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm"
                          >
                            {activeQuestionIdx + 1 < questions.length
                              ? "التالي ⬅"
                              : "تصحيح ✔"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* MODE A: FULL COMPETITION SHEET (ورقة المسابقة الكاملة بالأعمدة)       */}
          {/* ================================================================= */}
          {displayMode === "sheet" && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400 px-1">
                <span>
                  {answerMode === "choices"
                    ? `💡 اختر الإجابة الصحيحة من بين (${choicesCount}) اختيارات أسفل كل عمود.`
                    : "💡 اكتب الجواب واضغط Enter للانتقال التلقائي للسؤال التالي."}
                </span>
                <span>اضغط على 🔊 لسماع أي سؤال صوتياً</span>
              </div>

              {/* Pagination Bar if > 100 questions */}
              {totalSheetPages > 1 && (
                <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <span className="text-xs font-black text-slate-700 dark:text-slate-300">
                    صفحات الورقة ({questions.length} سؤال):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {Array.from({ length: totalSheetPages }).map((_, pIdx) => {
                      const startNum = pIdx * SHEET_PAGE_SIZE + 1;
                      const endNum = Math.min(
                        questions.length,
                        (pIdx + 1) * SHEET_PAGE_SIZE
                      );
                      return (
                        <button
                          key={pIdx}
                          type="button"
                          onClick={() => setSheetPage(pIdx)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                            sheetPage === pIdx
                              ? "bg-brand-600 text-white shadow-xs"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                          }`}
                        >
                          {startNum}–{endNum}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4">
                {currentSheetQuestions.map((q) => {
                  const idx = q.id - 1;
                  const isAnswered = q.userAnswer.trim() !== "";
                  const isCurrent = idx === activeQuestionIdx;

                  return (
                    <div
                      key={q.id}
                      onClick={() => setActiveQuestionIdx(idx)}
                      className={`rounded-2xl border-2 transition-all overflow-hidden flex flex-col justify-between bg-white dark:bg-slate-900 ${
                        isCurrent
                          ? "border-brand-500 ring-4 ring-brand-500/15 shadow-lg"
                          : isAnswered
                          ? "border-emerald-500/50 dark:border-emerald-500/40 shadow-xs"
                          : "border-slate-200 dark:border-slate-800 shadow-xs"
                      }`}
                    >
                      {/* Question Header */}
                      <div
                        className={`px-3 py-2 flex items-center justify-between text-xs font-black border-b ${
                          isCurrent
                            ? "bg-brand-600 text-white border-brand-600"
                            : isAnswered
                            ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60"
                            : "bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800"
                        }`}
                      >
                        <div className="flex flex-col">
                          <span>سؤال #{q.id}</span>
                          <span
                            className={`text-[10px] font-bold ${
                              isCurrent
                                ? "text-brand-100"
                                : "text-slate-500 dark:text-slate-400"
                            }`}
                          >
                            {q.groupLabel}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            speakQuestionSequence(
                              q.numbers,
                              voiceMode === "off" ? "arabic" : voiceMode,
                              undefined,
                              { force: true }
                            );
                          }}
                          className="p-1 rounded-lg hover:bg-black/10 transition-colors"
                          title="نطق السؤال صوتياً"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Vertical Numbers Column */}
                      <div className="py-3 px-4 space-y-1 text-center font-mono">
                        {q.numbers.map((num, nIdx) => (
                          <div
                            key={nIdx}
                            dir="ltr"
                            className={`text-xl sm:text-2xl font-black tracking-wider py-0.5 border-b border-dashed border-slate-100 dark:border-slate-800/70 last:border-0 ${
                              num < 0
                                ? "text-rose-600 dark:text-rose-400"
                                : "text-slate-900 dark:text-white"
                            }`}
                          >
                            {num}
                          </div>
                        ))}
                      </div>

                      {/* Answer Area: Multiple Choice Buttons OR Typing Input */}
                      <div className="p-2.5 bg-slate-50 dark:bg-slate-950 border-t-2 border-slate-200 dark:border-slate-800">
                        {answerMode === "choices" ? (
                          <div className="grid grid-cols-2 gap-1.5">
                            {q.choices.slice(0, choicesCount).map((cVal, cIdx) => {
                              const selected =
                                q.userAnswer.trim() !== "" &&
                                parseInt(q.userAnswer, 10) === cVal;
                              return (
                                <button
                                  key={cIdx}
                                  type="button"
                                  dir="ltr"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSelectChoice(idx, cVal);
                                  }}
                                  className={`py-1.5 px-2 rounded-xl font-mono font-black text-base border transition-all ${
                                    choicesCount === 3 && cIdx === 2
                                      ? "col-span-2"
                                      : choicesCount === 5 && cIdx === 4
                                      ? "col-span-2"
                                      : ""
                                  } ${
                                    selected
                                      ? "bg-brand-600 text-white border-brand-600 shadow-xs"
                                      : "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border-slate-300 dark:border-slate-700 hover:border-brand-500"
                                  }`}
                                >
                                  {cVal}
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                          <input
                            ref={(el) => {
                              inputRefs.current[idx] = el;
                            }}
                            type="number"
                            dir="ltr"
                            placeholder="="
                            value={q.userAnswer}
                            onFocus={() => setActiveQuestionIdx(idx)}
                            onChange={(e) => updateAnswer(idx, e.target.value)}
                            onKeyDown={(e) => handleSheetKeyDown(e, idx)}
                            className="w-full py-2 px-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-center font-mono font-black text-xl text-brand-700 dark:text-amber-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Pagination Bar if > 100 questions */}
              {totalSheetPages > 1 && (
                <div className="flex flex-wrap items-center justify-between gap-2 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    disabled={sheetPage === 0}
                    onClick={() => setSheetPage((p) => Math.max(0, p - 1))}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 disabled:opacity-40 text-xs font-black flex items-center gap-1.5"
                  >
                    <ArrowRight className="w-4 h-4" />
                    <span>الصفحة السابقة</span>
                  </button>
                  <span className="text-xs font-black text-slate-600 dark:text-slate-300">
                    صفحة {sheetPage + 1} من {totalSheetPages}
                  </span>
                  <button
                    type="button"
                    disabled={sheetPage >= totalSheetPages - 1}
                    onClick={() =>
                      setSheetPage((p) => Math.min(totalSheetPages - 1, p + 1))
                    }
                    className="px-4 py-2 rounded-xl bg-brand-600 text-white disabled:opacity-40 text-xs font-black flex items-center gap-1.5"
                  >
                    <span>الصفحة التالية</span>
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. RESULTS & GRADING STAGE (التصحيح الفوري وكشف النتائج التفصيلي)           */}
      {/* ========================================================================= */}
      {stage === "results" && (
        <div className="space-y-8 animate-in zoom-in-95 duration-300">
          {/* Score Hero Banner */}
          <div className="rounded-[2.5rem] bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white p-8 sm:p-12 border-2 border-amber-400/40 shadow-2xl text-center space-y-6">
            <div className="flex flex-wrap items-center justify-center gap-2">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/20 border border-amber-400/30 text-amber-300 text-xs sm:text-sm font-black">
                <Award className="w-4 h-4" />
                <span>
                  {activeAssignment
                    ? `تقرير التصحيح الرسمي — ${activeAssignment.title}`
                    : "تقرير التصحيح الرسمي — مسابقة الحساب الذهني"}
                </span>
              </div>
              {activeAssignment && (
                <div
                  className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs sm:text-sm font-black border ${
                    completedAttemptNumber >= 2
                      ? "bg-indigo-500/30 border-indigo-400/50 text-indigo-200"
                      : "bg-emerald-500/20 border-emerald-400/40 text-emerald-300"
                  }`}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{formatAttemptLabelAr(completedAttemptNumber)}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="text-6xl sm:text-7xl font-black font-mono text-amber-400">
                {correctCount}{" "}
                <span className="text-3xl sm:text-4xl text-slate-400">
                  / {questions.length}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black">
                {accuracyPct >= 90
                  ? "🏆 أداء خارق بمستوى أبطال العالم!"
                  : accuracyPct >= 75
                  ? "⭐ مستوى ممتاز جداً! استمر نحو القمة"
                  : accuracyPct >= 50
                  ? "💪 أداء جيد! بالتدريب المستمر ستكسر الأرقام"
                  : "🌱 بداية طيبة! راجع الأخطاء بالأسفل وكرر المحاولة"}
              </h2>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 max-w-4xl mx-auto pt-2">
              <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40">
                <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-400">
                  {correctCount}
                </div>
                <div className="text-xs text-emerald-200 font-bold mt-1">
                  ✅ إجابات صحيحة
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-500/40">
                <div className="text-2xl sm:text-3xl font-black font-mono text-rose-400">
                  {wrongCount}
                </div>
                <div className="text-xs text-rose-200 font-bold mt-1">
                  ❌ إجابات خاطئة
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700">
                <div className="text-2xl sm:text-3xl font-black font-mono text-slate-300">
                  {unansweredCount}
                </div>
                <div className="text-xs text-slate-400 font-bold mt-1">
                  ⚪ غير محلولة
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-950/50 border border-amber-500/40">
                <div className="text-2xl sm:text-3xl font-black font-mono text-amber-400">
                  {accuracyPct}%
                </div>
                <div className="text-xs text-amber-200 font-bold mt-1">
                  🎯 نسبة الدقة
                </div>
              </div>

              <div className="col-span-2 sm:col-span-1 p-4 rounded-2xl bg-indigo-950/60 border border-indigo-500/40">
                <div
                  className="text-2xl sm:text-3xl font-black font-mono text-indigo-300"
                  dir="ltr"
                >
                  {formatTime(elapsedSeconds)}
                </div>
                <div className="text-xs text-indigo-200 font-bold mt-1">
                  ⏱️ الزمن ({avgSecondsPerQuestion}ث/سؤال)
                </div>
              </div>
            </div>

            {/* Per-Group Accuracy Breakdown */}
            {ruleGroups.length > 1 && (
              <div className="max-w-4xl mx-auto pt-3 text-right space-y-2.5">
                <div className="text-xs font-black text-slate-300 text-center">
                  تفصيل الدرجات حسب قواعد ومجموعات الأسئلة:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {ruleGroups.map((g, idx) => {
                    const groupQs = questions.filter((q) => q.groupId === g.id);
                    const groupCorrect = groupQs.filter(
                      (q) =>
                        q.userAnswer.trim() !== "" &&
                        parseInt(q.userAnswer.trim(), 10) === q.correctAnswer
                    ).length;
                    const groupPct =
                      groupQs.length > 0
                        ? Math.round((groupCorrect / groupQs.length) * 100)
                        : 0;
                    return (
                      <div
                        key={g.id}
                        className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-2"
                      >
                        <div className="space-y-0.5">
                          <div className="text-xs font-black text-amber-300">
                            المجموعة #{idx + 1}: {formatGroupLabel(g)}
                          </div>
                          <div className="text-[11px] text-slate-300">
                            صحيح: {groupCorrect} من {groupQs.length}
                          </div>
                        </div>
                        <span className="px-2.5 py-1 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 font-mono font-black text-sm">
                          {groupPct}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowCertificateModal(true)}
                className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm shadow-xl transition-all hover:scale-102 flex items-center gap-2"
              >
                <Award className="w-5 h-5" />
                <span>🎓 إصدار وتحميل شهادة التفوق</span>
              </button>

              <button
                type="button"
                onClick={startCompetition}
                className="px-7 py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm shadow-lg transition-all hover:scale-102 flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>
                  {activeAssignment
                    ? `المحاولة مرة أخرى (${formatAttemptLabelAr(completedAttemptNumber + 1)}) 🔄`
                    : "إعادة المسابقة بنفس الإعدادات"}
                </span>
              </button>

              {!activeAssignment && (
                <button
                  type="button"
                  onClick={() => setStage("setup")}
                  className="px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/15 transition-colors flex items-center gap-2"
                >
                  <Settings2 className="w-4 h-4" />
                  <span>تغيير الإعدادات والقواعد</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => typeof window !== "undefined" && window.print()}
                className="px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/15 transition-colors flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة الكشف</span>
              </button>
            </div>
          </div>

          {/* Detailed Correction Sheet */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                  كشف التصحيح التفصيلي للأسئلة
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  راجع كل مسألة وقارن إجابتك بالإجابة النموذجية الصحيحة:
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {ruleGroups.length > 1 && (
                  <select
                    value={reviewGroupFilter}
                    onChange={(e) => {
                      setReviewGroupFilter(e.target.value);
                      setResultsPage(0);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-black text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
                  >
                    <option value="all">كل القواعد والمجموعات</option>
                    {ruleGroups.map((g, idx) => (
                      <option key={g.id} value={g.id}>
                        المجموعة #{idx + 1}: {formatGroupLabel(g)}
                      </option>
                    ))}
                  </select>
                )}

                <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl">
                  <button
                    type="button"
                    onClick={() => {
                      setReviewFilter("all");
                      setResultsPage(0);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                      reviewFilter === "all"
                        ? "bg-brand-600 text-white shadow-xs"
                        : "text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    الكل ({questions.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setReviewFilter("wrong");
                      setResultsPage(0);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                      reviewFilter === "wrong"
                        ? "bg-rose-600 text-white shadow-xs"
                        : "text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    الأخطاء والمتروكة ({wrongCount + unansweredCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setReviewFilter("correct");
                      setResultsPage(0);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                      reviewFilter === "correct"
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    الصحيحة ({correctCount})
                  </button>
                </div>
              </div>
            </div>

            {totalResultsPages > 1 && (
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                <span className="text-xs font-black text-slate-600 dark:text-slate-300">
                  صفحات المراجعة ({filteredReviewQuestions.length} سؤال):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {Array.from({ length: totalResultsPages }).map((_, pIdx) => (
                    <button
                      key={pIdx}
                      type="button"
                      onClick={() => setResultsPage(pIdx)}
                      className={`px-3 py-1 rounded-xl text-xs font-black transition-all ${
                        resultsPage === pIdx
                          ? "bg-brand-600 text-white"
                          : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                      }`}
                    >
                      صفحة {pIdx + 1}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
              {paginatedReviewQuestions.map((q) => {
                const isEmpty = q.userAnswer.trim() === "";
                const isRight =
                  !isEmpty &&
                  parseInt(q.userAnswer.trim(), 10) === q.correctAnswer;

                return (
                  <div
                    key={q.id}
                    className={`rounded-2xl border-2 overflow-hidden flex flex-col justify-between ${
                      isRight
                        ? "border-emerald-500/60 bg-emerald-50/30 dark:bg-emerald-950/20"
                        : "border-rose-500/60 bg-rose-50/30 dark:bg-rose-950/20"
                    }`}
                  >
                    <div
                      className={`px-3 py-2 flex items-center justify-between text-xs font-black ${
                        isRight
                          ? "bg-emerald-600 text-white"
                          : "bg-rose-600 text-white"
                      }`}
                    >
                      <div className="flex flex-col">
                        <span>سؤال #{q.id}</span>
                        <span className="text-[10px] opacity-90 font-bold">
                          {q.groupLabel}
                        </span>
                      </div>
                      <span>
                        {isRight ? "صحيح ✅" : isEmpty ? "متروك ⚪" : "خطأ ❌"}
                      </span>
                    </div>

                    <div className="py-2.5 px-3 space-y-0.5 text-center font-mono text-sm">
                      {q.numbers.map((n, i) => (
                        <div
                          key={i}
                          dir="ltr"
                          className="font-bold text-slate-800 dark:text-slate-200"
                        >
                          {n > 0 && i > 0 ? `+${n}` : n}
                        </div>
                      ))}
                    </div>

                    <div className="p-2.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-xs space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">إجابتك:</span>
                        <span
                          dir="ltr"
                          className={`font-mono font-black text-sm ${
                            isRight
                              ? "text-emerald-600"
                              : "text-rose-600 line-through"
                          }`}
                        >
                          {isEmpty ? "—" : q.userAnswer}
                        </span>
                      </div>
                      {!isRight && (
                        <div className="flex justify-between items-center pt-1 border-t border-slate-100 dark:border-slate-800">
                          <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                            الصحيح:
                          </span>
                          <span
                            dir="ltr"
                            className="font-mono font-black text-base text-emerald-600 dark:text-emerald-400"
                          >
                            {q.correctAnswer}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Subscription Paywall & Monthly Trial Modal */}
      {showSubPaywallModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-4xl rounded-3xl bg-white dark:bg-slate-900 border-2 border-amber-400/70 shadow-2xl p-6 sm:p-8 my-8 space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <span className="inline-block px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 font-black text-xs">
                  محاكي المسابقة الاحترافي 🏆
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  افتح محاكي المسابقة بلا حدود (حتى 1000 سؤال)
                </h3>
                {paywallReason ? (
                  <p className="text-xs sm:text-sm font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 p-3 rounded-xl border border-rose-200 dark:border-rose-800">
                    {paywallReason}
                  </p>
                ) : (
                  <p className="text-xs sm:text-sm text-slate-500">
                    التعليم والمعداد الحر والفلاش أنزان متاحة مجاناً، ولديك 100 سؤال مجاناً كل شهر عند التسجيل بحسابك الرسمي. للوصول الكامل بلا حدود اختر باقتك:
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setShowSubPaywallModal(false)}
                className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                إغلاق ✕
              </button>
            </div>

            {isGuest && (
              <div className="p-4 rounded-2xl bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs sm:text-sm font-bold text-brand-900 dark:text-brand-200">
                  🌟 هل تريد تجربة المحاكي مجاناً (100 سؤال أو 10 دقائق كل شهر)؟ سجّل حسابك الرسمي الآن مجاناً!
                </div>
                <Link
                  href="/register"
                  className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-black text-xs shrink-0"
                >
                  تسجيل حساب رسمي مجاناً
                </Link>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {SUBSCRIPTION_PLANS.student.map((plan) => (
                <div
                  key={plan.id}
                  className={`rounded-3xl p-6 border-2 flex flex-col justify-between ${
                    plan.popular
                      ? "border-amber-500 bg-amber-50/30 dark:bg-amber-950/20 shadow-lg"
                      : "border-slate-200 dark:border-slate-800"
                  }`}
                >
                  <div className="space-y-3">
                    <span className="inline-block px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 font-black text-[11px]">
                      {plan.badge}
                    </span>
                    <h4 className="text-lg font-black text-slate-900 dark:text-white">
                      {plan.name}
                    </h4>
                    <div className="text-2xl font-black text-brand-600 dark:text-amber-400 font-mono">
                      {plan.priceFormatted}
                    </div>
                    <ul className="space-y-2 pt-2 text-xs text-slate-600 dark:text-slate-300">
                      {plan.features.map((f, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <a
                    href={getWhatsAppLink(
                      `مرحباً إدارة منصة العقل الخارق، أود الاشتراك في محاكي المسابقة وتفعيل (${plan.name} - بسعر ${plan.priceFormatted}).`
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs text-center shadow-md block"
                  >
                    اضغط للتواصل مع إدارة المنصة
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Official SUPER MIND Excellence Certificate Modal */}
      {showCertificateModal && (() => {
        const extProf = getExtendedProfile(activeUserId, {
          email: user?.email || authProfile?.email,
          name: authProfile?.name,
        });
        const studentDisplayName =
          extProf.name && extProf.name !== "بطل العقل الخارق"
            ? extProf.name
            : authProfile?.name || "بطل العقل الخارق";
        const certTitle = activeAssignment
          ? activeAssignment.title
          : `اختبار ومسابقة الحساب الذهني (${questions.length} سؤال)`;
        const dateStr = new Date().toLocaleDateString("ar-IQ", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });

        const handleDownloadCertificatePng = () => {
          const canvas = document.createElement("canvas");
          canvas.width = 1600;
          canvas.height = 1130;
          const ctx = canvas.getContext("2d");
          if (!ctx) return;

          const drawCertificate = (logoImg?: HTMLImageElement) => {
            // 1. Background
            const bgGrad = ctx.createLinearGradient(0, 0, 1600, 1130);
            bgGrad.addColorStop(0, "#090d1a");
            bgGrad.addColorStop(0.5, "#111936");
            bgGrad.addColorStop(1, "#090d1a");
            ctx.fillStyle = bgGrad;
            ctx.fillRect(0, 0, 1600, 1130);

            // 2. Double Golden Ornamental Borders
            ctx.strokeStyle = "#f59e0b";
            ctx.lineWidth = 8;
            ctx.strokeRect(40, 40, 1520, 1050);

            ctx.strokeStyle = "rgba(251, 191, 36, 0.45)";
            ctx.lineWidth = 3;
            ctx.strokeRect(60, 60, 1480, 1010);

            // 3. Top Logo if loaded
            if (logoImg) {
              ctx.save();
              ctx.beginPath();
              ctx.roundRect(720, 85, 160, 160, 28);
              ctx.fillStyle = "#ffffff";
              ctx.fill();
              ctx.lineWidth = 4;
              ctx.strokeStyle = "#f59e0b";
              ctx.stroke();
              ctx.clip();
              ctx.drawImage(logoImg, 726, 91, 148, 148);
              ctx.restore();
            }

            // 4. Headings
            ctx.textAlign = "center";
            ctx.direction = "rtl";

            ctx.fillStyle = "#fbbf24";
            ctx.font = "bold 28px 'Segoe UI', Tahoma, Arial, sans-serif";
            ctx.fillText("منصة برنامج العقل الخارق • SUPER MIND PROGRAM", 800, 295);

            ctx.fillStyle = "#ffffff";
            ctx.font = "900 58px 'Segoe UI', Tahoma, Arial, sans-serif";
            ctx.fillText("شهادة تفوق وإنجاز في الحساب الذهني", 800, 375);

            ctx.fillStyle = "#cbd5e1";
            ctx.font = "bold 30px 'Segoe UI', Tahoma, Arial, sans-serif";
            ctx.fillText("تشهد إدارة منصة برنامج العقل الخارق بأن البطل / البطلة:", 800, 455);

            // 5. Student Name Box
            ctx.fillStyle = "rgba(245, 158, 11, 0.14)";
            ctx.strokeStyle = "#fbbf24";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.roundRect(350, 485, 900, 95, 24);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = "#fde68a";
            ctx.font = "900 48px 'Segoe UI', Tahoma, Arial, sans-serif";
            ctx.fillText(studentDisplayName, 800, 550);

            // 6. Achievement Text
            ctx.fillStyle = "#e2e8f0";
            ctx.font = "bold 28px 'Segoe UI', Tahoma, Arial, sans-serif";
            ctx.fillText(`قد اجتاز بنجاح وتفوق: ${certTitle}`, 800, 640);

            // 7. Score & Accuracy Stats Boxes
            const statsText = `النتيجة: ${correctCount} من ${questions.length}   |   نسبة الدقة: ${accuracyPct}%   |   الزمن: ${formatTime(elapsedSeconds)}`;
            ctx.fillStyle = "rgba(16, 185, 129, 0.16)";
            ctx.strokeStyle = "#34d399";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.roundRect(260, 680, 1080, 80, 20);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = "#6ee7b7";
            ctx.font = "bold 32px 'Segoe UI', Tahoma, Arial, sans-serif";
            ctx.fillText(statsText, 800, 732);

            // 8. Wish / Duaa
            ctx.fillStyle = "#94a3b8";
            ctx.font = "bold 24px 'Segoe UI', Tahoma, Arial, sans-serif";
            ctx.fillText("متمنين له/لها دوام التفوق والإبداع في رحلة صناعة العقول الخارقة", 800, 825);

            // 9. Footer Signatures
            ctx.fillStyle = "#fbbf24";
            ctx.font = "bold 26px 'Segoe UI', Tahoma, Arial, sans-serif";
            ctx.fillText("إشراف وتأليف: الأستاذ قتادة كريم", 400, 940);
            ctx.fillStyle = "#cbd5e1";
            ctx.font = "22px 'Segoe UI', Tahoma, Arial, sans-serif";
            ctx.fillText("مؤلف ومؤسس برنامج العقل الخارق", 400, 980);

            ctx.fillStyle = "#fbbf24";
            ctx.font = "bold 26px 'Segoe UI', Tahoma, Arial, sans-serif";
            ctx.fillText(`تاريخ الإصدار: ${dateStr}`, 1200, 940);
            ctx.fillStyle = "#cbd5e1";
            ctx.font = "22px 'Segoe UI', Tahoma, Arial, sans-serif";
            ctx.fillText("supermindiq.com", 1200, 980);

            const dataUrl = canvas.toDataURL("image/png");
            const link = document.createElement("a");
            link.download = `شهادة_العقل_الخارق_${studentDisplayName.replace(/\s+/g, "_")}.png`;
            link.href = dataUrl;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          };

          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => drawCertificate(img);
          img.onerror = () => drawCertificate(undefined);
          img.src = "/images/logo.jpg";
        };

        return (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in overflow-y-auto">
            <div className="relative w-full max-w-3xl rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 text-white border-4 border-amber-400 shadow-2xl p-6 sm:p-10 my-8 text-center space-y-6">
              {/* Inner Golden Frame */}
              <div className="border border-amber-400/35 rounded-2xl p-5 sm:p-8 space-y-5">
                <div className="flex justify-center">
                  <div className="w-24 h-24 rounded-3xl bg-white border-2 border-amber-400 p-1 shadow-xl overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/images/logo.jpg"
                      alt="شعار برنامج العقل الخارق"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-xs sm:text-sm font-black text-amber-400 tracking-wide">
                    منصة برنامج العقل الخارق • SUPER MIND PROGRAM
                  </div>
                  <h2 className="text-2xl sm:text-4xl font-black text-white">
                    شهادة تفوق وإنجاز 🎓
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 pt-1">
                    تشهد إدارة منصة برنامج العقل الخارق بأن البطل / البطلة:
                  </p>
                </div>

                <div className="py-3 px-6 rounded-2xl bg-amber-400/15 border-2 border-amber-400/60 max-w-md mx-auto">
                  <div className="text-xl sm:text-3xl font-black text-amber-300">
                    {studentDisplayName}
                  </div>
                  {extProf.governorate && (
                    <div className="text-xs text-emerald-300 font-bold mt-1">
                      {extProf.country || "العراق"} - {extProf.governorate}
                    </div>
                  )}
                </div>

                <p className="text-xs sm:text-base font-bold text-slate-200">
                  قد أتمّ بنجاح وتفوق: <span className="text-amber-300">{certTitle}</span>
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 max-w-lg mx-auto text-xs sm:text-sm">
                  <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-400/30">
                    <div className="text-slate-300 text-[11px]">الدرجة</div>
                    <div className="font-mono font-black text-base sm:text-xl text-emerald-300">
                      {correctCount} / {questions.length}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-400/30">
                    <div className="text-slate-300 text-[11px]">نسبة الدقة</div>
                    <div className="font-mono font-black text-base sm:text-xl text-amber-300">
                      {accuracyPct}%
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-indigo-500/15 border border-indigo-400/30">
                    <div className="text-slate-300 text-[11px]">الزمن المستغرق</div>
                    <div className="font-mono font-black text-base sm:text-xl text-indigo-300" dir="ltr">
                      {formatTime(elapsedSeconds)}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-300">
                  <div>
                    <div className="font-black text-amber-300">إشراف وتأليف: الأستاذ قتادة كريم</div>
                    <div className="text-[11px] text-slate-400">مؤسس برنامج العقل الخارق</div>
                  </div>
                  <div>
                    <div className="font-bold text-white">تاريخ الإصدار: {dateStr}</div>
                    <div className="text-[11px] text-amber-400 font-mono">supermindiq.com</div>
                  </div>
                </div>
              </div>

              {/* Modal Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleDownloadCertificatePng}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs sm:text-sm shadow-xl flex items-center gap-2"
                >
                  <Award className="w-4 h-4" />
                  <span>📥 تحميل الشهادة كصورة عالية الدقة (PNG)</span>
                </button>
                <button
                  type="button"
                  onClick={() => typeof window !== "undefined" && window.print()}
                  className="px-5 py-3 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs sm:text-sm flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  <span>طباعة</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowCertificateModal(false)}
                  className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs sm:text-sm"
                >
                  إغلاق ✕
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
