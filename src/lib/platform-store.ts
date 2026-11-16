import { getSupabaseClient } from "@/lib/supabase/client";

export type SubscriptionPlanId =
  | "free"
  | "monthly_25k"
  | "quarterly_50k"
  | "yearly_100k"
  | "school_yearly_150k";

export type SubscriptionStatus = "free" | "pending" | "active" | "expired" | "cancelled";

export interface SubscriptionInfo {
  plan: SubscriptionPlanId;
  planLabel: string;
  priceIqd: number;
  status: SubscriptionStatus;
  startDate?: string; // ISO string
  endDate?: string;   // ISO string
  approvedBy?: string;
  updatedAt?: string;
}

export interface TrainerAchievement {
  id: string;
  title: string;
  year: string;
  category: "trophy" | "students" | "certificate" | "medal";
  description?: string;
}

export interface ExtendedUserProfile {
  id: string;
  email: string;
  name: string;
  role: "student" | "trainer" | "admin";
  avatarUrl?: string;
  phone?: string; // WhatsApp phone
  country: string;
  governorate: string;
  ageOrGrade?: string;
  // Student specific
  trainerId?: string;
  trainerName?: string;
  trainerCode?: string;
  // Trainer specific
  trainerTitle?: string;
  experienceYears?: number;
  centerOrSchool?: string;
  bio?: string;
  isVerifiedTrainer?: boolean;
  showInDirectory?: boolean;
  achievements?: TrainerAchievement[];
  // Subscription
  subscription: SubscriptionInfo;
  // Real stats
  totalExercises: number;
  totalQuestionsSolved: number;
  correctAnswers: number;
  wrongAnswers: number;
  accuracyRate: number;
  points: number;
  streakDays: number;
  currentLevel: string;
  lastActivity: string;
  createdAt: string;
}

export interface RealTrainingSession {
  id: string;
  userId: string;
  userName?: string;
  type: "abacus" | "flash-anzan" | "competition" | "quiz" | "balloon" | "multiplication";
  title: string;
  level: string;
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
  durationSeconds: number;
  score: number;
  assignmentId?: string;
  createdAt: string;
}

export interface AssignmentSubmission {
  studentId: string;
  studentName: string;
  studentAvatar?: string;
  governorate?: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
  durationSeconds: number;
  completedAt: string;
}

export interface PlatformAssignment {
  id: string;
  kind: "trainer_homework" | "admin_competition" | "admin_challenge";
  title: string;
  description?: string;
  creatorId: string;
  creatorName: string;
  creatorRole: "trainer" | "admin";
  // Target audience
  targetType:
    | "all_students"
    | "active_subscribers"
    | "trainer_students"
    | "specific_student"
    | "by_level"
    | "by_governorate";
  targetValue?: string; // studentId, level name, or governorate name
  // Exercise configuration
  exerciseType: "competition" | "flash_anzan" | "abacus";
  rulesLevel: "simple" | "complex_5" | "complex_10" | "general";
  allowSubtraction: boolean;
  digitPlace: "units" | "tens" | "hundreds" | "thousands";
  termsCount: number;
  questionsCount: number;
  timeLimitMinutes: number;
  answerMode: "typing" | "choices";
  choicesCount: 2 | 3 | 4 | 5;
  flashSpeedSeconds?: number;
  dueDate?: string;
  isActive: boolean;
  createdAt: string;
  submissions: AssignmentSubmission[];
}

export interface MonthlyTrialRecord {
  userId: string;
  monthKey: string; // e.g. "2026-11"
  questionsUsed: number;
  sessionsCount: number;
  lastUsedAt: string;
}

export const SUBSCRIPTION_PLANS = {
  student: [
    {
      id: "monthly_25k" as SubscriptionPlanId,
      name: "اشتراك شهري (شهر واحد)",
      durationDays: 30,
      priceIqd: 25000,
      priceFormatted: "25,000 د.ع",
      badge: "مرن للتجربة",
      features: [
        "فتح محاكي المسابقة الاحترافي بلا حدود (حتى 1000 سؤال)",
        "تعدد القواعد في نفس المسابقة + التصحيح الفوري",
        "المشاركة في المسابقات والتحديات الرسمية للمنصة",
        "حفظ التقدم الحقيقي والربط مع المدرب واستلام الواجبات",
      ],
    },
    {
      id: "quarterly_50k" as SubscriptionPlanId,
      name: "اشتراك 3 أشهر (باقة التميز)",
      durationDays: 90,
      priceIqd: 50000,
      priceFormatted: "50,000 د.ع",
      badge: "الأكثر طلباً - وفر 25,000 د.ع",
      popular: true,
      features: [
        "جميع مميزات الباقة الشهرية لمدة 90 يوماً كاملة",
        "فتح محاكي المسابقة الاحترافي بلا حدود",
        "توفير شهر كامل مجاناً مقارنة بالاشتراك الشهري",
        "أولوية المشاركة في بطولات العقل الخارق الفصلية",
      ],
    },
    {
      id: "yearly_100k" as SubscriptionPlanId,
      name: "اشتراك سنوي (باقة الأبطال)",
      durationDays: 365,
      priceIqd: 100000,
      priceFormatted: "100,000 د.ع",
      badge: "أفضل قيمة - وفر 200,000 د.ع",
      features: [
        "وصول كامل وغير محدود لجميع أدوات ومحاكي المسابقات لمدة سنة كاملة",
        "توثيق حساب البطل في لوحة الشرف والمنافسات الكبرى",
        "متابعة مستمرة وتقارير أداء شاملة طوال العام",
        "دعم فني مباشر عبر واتساب",
      ],
    },
  ],
  trainer: [
    {
      id: "monthly_25k" as SubscriptionPlanId,
      name: "اشتراك مدرب شهري",
      durationDays: 30,
      priceIqd: 25000,
      priceFormatted: "25,000 د.ع",
      badge: "بداية سريعة",
      features: [
        "توثيق حساب المدرب بالشارة الرسمية في المنصة",
        "نشر بطاقة المدرب وصورته وإنجازاته في دليل المدربين المعتمدين",
        "لوحة متابعة الطلاب وإرسال الواجبات الجاهزة بضغطة زر",
        "فتح محاكي المسابقة وحلبة المنافسة بين الفرق بلا حدود",
      ],
    },
    {
      id: "quarterly_50k" as SubscriptionPlanId,
      name: "اشتراك مدرب 3 أشهر",
      durationDays: 90,
      priceIqd: 50000,
      priceFormatted: "50,000 د.ع",
      badge: "الأكثر اختياراً للمدربين",
      popular: true,
      features: [
        "توثيق الحساب والظهور في دليل المدربين لمدة 90 يوماً",
        "إدارة الطلاب وإصدار الواجبات والتقارير لأولياء الأمور",
        "إضافة كؤوس وإنجازات المدرب وطلابه في ملفه الرسمي",
        "توفير 25,000 د.ع مقارنة بالاشتراك الشهري",
      ],
    },
    {
      id: "yearly_100k" as SubscriptionPlanId,
      name: "اشتراك مدرب سنوي",
      durationDays: 365,
      priceIqd: 100000,
      priceFormatted: "100,000 د.ع",
      badge: "اعتماد سنوي كامل",
      features: [
        "اعتماد وتوثيق رسمي لمدة سنة كاملة (365 يوماً)",
        "ظهور مميز في دليل المدربين المعتمدين مع كؤوس الإنجازات",
        "صلاحيات كاملة لإدارة الفصول والواجبات وحلبة المنافسة",
        "بطاقة عضوية رقمية كمدرب معتمد في منصة العقل الخارق",
      ],
    },
  ],
  school: {
    id: "school_yearly_150k" as SubscriptionPlanId,
    name: "اعتماد المدارس والمراكز (سنوي)",
    durationDays: 365,
    priceIqd: 150000,
    priceFormatted: "150,000 د.ع / سنوياً",
    badge: "الباقة المؤسسية الشاملة",
    features: [
      "اعتماد رسمي للمدرسة أو الروضة لمدة سنة كاملة",
      "إتاحة كافة مميزات المنصة ومحاكي المسابقات وحلبة الفرق للشاشات الذكية",
      "نشر بطاقة المدرسة ومعلوماتها في دليل المدارس المعتمدة مع زر تواصل مباشر",
      "دعم فني وتدريبي مباشر لكادر المدرسة",
    ],
  },
};

export const COUNTRIES_WITH_GOVERNORATES: Record<string, string[]> = {
  "العراق": [
    "كربلاء المقدسة",
    "بغداد",
    "النجف الأشرف",
    "البصرة",
    "بابل",
    "نينوى (الموصل)",
    "أربيل",
    "السليمانية",
    "دهوك",
    "ذي قار (الناصرية)",
    "القادسية (الديوانية)",
    "المثنى (السماوة)",
    "واسط (الكوت)",
    "ميسان (العمارة)",
    "ديالى",
    "الأنبار",
    "صلاح الدين",
    "كركوك",
  ],
  "السعودية": ["الرياض", "جدة", "مكة المكرمة", "المدينة المنورة", "الدمام", "الخبر", "أبها", "تبوك", "أخرى"],
  "الإمارات": ["دبي", "أبوظبي", "الشارقة", "عجمان", "رأس الخيمة", "الفجيرة", "أم القيوين"],
  "الكويت": ["العاصمة", "حولي", "الفروانية", "الأحمدي", "الجهراء", "مبارك الكبير"],
  "قطر": ["الدوحة", "الريان", "الوكرة", "الخور", "أم صلال"],
  "البحرين": ["المنامة", "المحرق", "الرفاع", "مدينة حمد", "مدينة عيسى"],
  "سلطنة عُمان": ["مسقط", "صلالة", "صحار", "نزوى", "صور", "البريمي"],
  "الأردن": ["عمّان", "إربد", "الزرقاء", "العقبة", "السلط", "المفرق"],
  "مصر": ["القاهرة", "الجيزة", "الإسكندرية", "المنصورة", "طنطا", "أسيوط", "أخرى"],
  "سوريا": ["دمشق", "حلب", "حمص", "اللاذقية", "حماة", "طرطوس"],
  "لبنان": ["بيروت", "طرابلس", "صيدا", "صور", "جبل لبنان", "البقاع"],
  "فلسطين": ["القدس", "غزة", "رام الله", "الخليل", "نابلس", "جنين"],
  "المغرب": ["الرباط", "الدار البيضاء", "مراكش", "فاس", "طنجة", "أكادير"],
  "الجزائر": ["الجزائر العاصمة", "وهران", "قسنطينة", "عنابة", "البليدة"],
  "تونس": ["تونس العاصمة", "صفاقس", "سوسة", "القيروان", "بنزرت"],
  "تركيا": ["إسطنبول", "أنقرة", "إزمير", "بورصة", "أنطاليا", "غازي عنتاب"],
  "أخرى": ["مدينة أخرى"],
};

const STORAGE_KEYS = {
  PROFILES: "supermind_extended_profiles_v1",
  SESSIONS: "supermind_real_sessions_v1",
  ASSIGNMENTS: "supermind_assignments_v1",
  MONTHLY_TRIALS: "supermind_monthly_trials_v1",
};

// Evaluate effective subscription status and remaining days automatically
export function evaluateSubscription(sub?: SubscriptionInfo): {
  effectiveStatus: SubscriptionStatus;
  daysRemaining: number;
  isExpiringSoon: boolean; // <= 3 days
  isActive: boolean;
} {
  if (!sub || sub.status === "free") {
    return { effectiveStatus: "free", daysRemaining: 0, isExpiringSoon: false, isActive: false };
  }
  if (sub.status === "pending" || sub.status === "cancelled") {
    return { effectiveStatus: sub.status, daysRemaining: 0, isExpiringSoon: false, isActive: false };
  }
  if (sub.endDate) {
    const now = new Date().getTime();
    const end = new Date(sub.endDate).getTime();
    const diffMs = end - now;
    const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    if (diffMs <= 0) {
      return { effectiveStatus: "expired", daysRemaining: 0, isExpiringSoon: false, isActive: false };
    }
    return {
      effectiveStatus: "active",
      daysRemaining,
      isExpiringSoon: daysRemaining <= 3,
      isActive: true,
    };
  }
  return {
    effectiveStatus: sub.status,
    daysRemaining: 30,
    isExpiringSoon: false,
    isActive: sub.status === "active",
  };
}

export function createSubscriptionForPlan(planId: SubscriptionPlanId): SubscriptionInfo {
  const now = new Date();
  let days = 30;
  let price = 25000;
  let label = "اشتراك شهري (25,000 د.ع)";

  if (planId === "quarterly_50k") {
    days = 90;
    price = 50000;
    label = "اشتراك 3 أشهر (50,000 د.ع)";
  } else if (planId === "yearly_100k") {
    days = 365;
    price = 100000;
    label = "اشتراك سنوي (100,000 د.ع)";
  } else if (planId === "school_yearly_150k") {
    days = 365;
    price = 150000;
    label = "اعتماد مدرسة سنوي (150,000 د.ع)";
  } else if (planId === "free") {
    return {
      plan: "free",
      planLabel: "الباقة المجانية",
      priceIqd: 0,
      status: "free",
      updatedAt: now.toISOString(),
    };
  }

  const end = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  return {
    plan: planId,
    planLabel: label,
    priceIqd: price,
    status: "active",
    startDate: now.toISOString(),
    endDate: end.toISOString(),
    updatedAt: now.toISOString(),
  };
}

// Client-side image compressor (resizes to max 260x260 JPEG ~30-45KB for fast saving)
export async function compressAvatarImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxDim = 260;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.78);
        resolve(compressedDataUrl);
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Default Seed Data so Trainer Qatada & Initial Platform State are always rich
function getInitialProfiles(): Record<string, ExtendedUserProfile> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILES);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error("Failed reading profiles:", e);
  }

  const seedTrainer: ExtendedUserProfile = {
    id: "trainer-qatada",
    email: "qatada98@gmail.com",
    name: "الأستاذ قتادة كريم",
    role: "trainer",
    avatarUrl: "/trainers/qatada-kareem.jpg",
    phone: "07806086016",
    country: "العراق",
    governorate: "كربلاء المقدسة",
    trainerCode: "QK-100",
    trainerTitle: "مؤسس منصة العقل الخارق ومدرب الحساب الذهني المعتمد",
    experienceYears: 8,
    centerOrSchool: "مؤسسة العقل الخارق - كربلاء المقدسة",
    bio: "مدرب معتمد في برامج الحساب الذهني التخيلي (السوروبان والفلاش أنزان) وتنمية الذكاء والتركيز للأطفال واليافعين.",
    isVerifiedTrainer: true,
    showInDirectory: true,
    achievements: [
      {
        id: "ach-1",
        title: "تأسيس منصة العقل الخارق التعليمية (SUPER MIND)",
        year: "2026",
        category: "trophy",
        description: "المنصة التفاعلية الأولى لتدريب الحساب الذهني والفلاش أنزان ومحاكي المسابقات.",
      },
      {
        id: "ach-2",
        title: "تدريب وتأهيل المئات من أبطال السوروبان في المدارس الأهلية",
        year: "2025",
        category: "students",
        description: "إشراف كامل على مناهج الحساب الذهني في نخبة من رياض ومدارس كربلاء المقدسة.",
      },
    ],
    subscription: {
      plan: "yearly_100k",
      planLabel: "اعتماد رسمي دائم",
      priceIqd: 100000,
      status: "active",
      startDate: "2026-01-01T00:00:00.000Z",
      endDate: "2028-01-01T00:00:00.000Z",
    },
    totalExercises: 120,
    totalQuestionsSolved: 2400,
    correctAnswers: 2380,
    wrongAnswers: 20,
    accuracyRate: 99,
    points: 4800,
    streakDays: 30,
    currentLevel: "المستوى المتقدم - الفلاش أنزان",
    lastActivity: new Date().toISOString(),
    createdAt: "2026-01-01T00:00:00.000Z",
  };

  const initial: Record<string, ExtendedUserProfile> = {
    "trainer-qatada": seedTrainer,
  };
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(initial));
  } catch {}
  return initial;
}

export function getAllExtendedProfiles(): ExtendedUserProfile[] {
  const map = getInitialProfiles();
  return Object.values(map).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getExtendedProfile(
  userId: string,
  fallback?: {
    email?: string | null;
    name?: string;
    role?: "student" | "trainer" | "admin";
    phone?: string | null;
    avatarUrl?: string | null;
  }
): ExtendedUserProfile {
  const rawPhoneStr = fallback?.phone || "";
  const parsedPhone = rawPhoneStr.split("|")[0]?.trim() || "";
  const parsedLoc = rawPhoneStr.includes("|") ? rawPhoneStr.split("|")[1]?.trim() || "" : "";
  const parsedCountry = parsedLoc.includes("-") ? parsedLoc.split("-")[0]?.trim() || "العراق" : "العراق";
  const parsedGov = parsedLoc.includes("-") ? parsedLoc.split("-").slice(1).join("-").trim() : parsedLoc;

  const map = getInitialProfiles();
  if (map[userId]) {
    const existing = map[userId];
    if (parsedPhone && !existing.phone) existing.phone = parsedPhone;
    if (parsedGov && !existing.governorate) {
      existing.country = parsedCountry || existing.country;
      existing.governorate = parsedGov;
    }
    if (fallback?.avatarUrl && !existing.avatarUrl) existing.avatarUrl = fallback.avatarUrl;
    if (fallback?.name && existing.name === "بطل العقل الخارق") existing.name = fallback.name;
    // Auto-update effective subscription status if expired
    const evalSub = evaluateSubscription(existing.subscription);
    if (evalSub.effectiveStatus !== existing.subscription.status) {
      existing.subscription.status = evalSub.effectiveStatus;
    }
    return existing;
  }

  const now = new Date().toISOString();
  const isAdminEmail =
    fallback?.email?.toLowerCase() === "qatada98@gmail.com" || fallback?.role === "admin";

  const created: ExtendedUserProfile = {
    id: userId,
    email: fallback?.email || "",
    name: fallback?.name || "بطل العقل الخارق",
    role: isAdminEmail ? "admin" : fallback?.role || "student",
    phone: parsedPhone,
    country: parsedCountry || "العراق",
    governorate: parsedGov || "",
    avatarUrl: fallback?.avatarUrl || undefined,
    trainerId: "trainer-qatada",
    trainerName: "الأستاذ قتادة كريم",
    trainerCode: isAdminEmail || fallback?.role === "trainer" ? `TR-${userId.slice(0, 4).toUpperCase()}` : undefined,
    achievements: [],
    subscription: isAdminEmail
      ? {
          plan: "yearly_100k",
          planLabel: "حساب المدير المشرف العام",
          priceIqd: 0,
          status: "active",
          startDate: now,
          endDate: "2030-01-01T00:00:00.000Z",
        }
      : {
          plan: "free",
          planLabel: "الباقة المجانية",
          priceIqd: 0,
          status: "free",
        },
    totalExercises: 0,
    totalQuestionsSolved: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
    accuracyRate: 0,
    points: 0,
    streakDays: 1,
    currentLevel: "المستوى الأول - الجمع والطرح البسيط",
    lastActivity: now,
    createdAt: now,
  };

  map[userId] = created;
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(map));
  } catch {}
  return created;
}

export async function saveExtendedProfile(profile: ExtendedUserProfile): Promise<ExtendedUserProfile> {
  const map = getInitialProfiles();
  const updated: ExtendedUserProfile = {
    ...profile,
    lastActivity: new Date().toISOString(),
  };
  map[profile.id] = updated;

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(map));
      window.dispatchEvent(new CustomEvent("supermind:profile-updated", { detail: updated }));
    } catch (e) {
      console.error("Error saving profile to localStorage:", e);
    }
  }

  // Also sync basic allowed fields (name, phone, avatar_url) to Supabase profiles
  const supabase = getSupabaseClient();
  if (supabase && profile.id && !profile.id.startsWith("trainer-")) {
    try {
      const cleanPhoneOnly = (profile.phone || "").split("|")[0].trim();
      const locationSuffix =
        profile.country || profile.governorate
          ? ` | ${profile.country || "العراق"}${profile.governorate ? ` - ${profile.governorate}` : ""}`
          : "";
      const packedPhone = cleanPhoneOnly ? `${cleanPhoneOnly}${locationSuffix}` : null;

      await supabase
        .from("profiles")
        .update({
          name: profile.name,
          phone: packedPhone,
          avatar_url: profile.avatarUrl || null,
        })
        .eq("id", profile.id);
    } catch (err) {
      console.warn("Supabase profile sync warning:", err);
    }
  }

  return updated;
}

export function isProfileComplete(profile: ExtendedUserProfile): boolean {
  return Boolean(
    profile.name &&
      profile.name.trim().length >= 3 &&
      profile.name !== "بطل العقل الخارق" &&
      profile.phone &&
      profile.phone.trim().length >= 8 &&
      profile.country &&
      profile.governorate
  );
}

// Monthly Trial (100 questions or 10 minutes per month for registered official students)
export const MONTHLY_FREE_QUESTIONS_LIMIT = 100;
export const MONTHLY_FREE_MINUTES_LIMIT = 10;

export function getCurrentMonthKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function getMonthlyTrialStatus(userId: string): {
  monthKey: string;
  questionsUsed: number;
  questionsRemaining: number;
  maxMinutesAllowed: number;
  hasTrialRemaining: boolean;
} {
  const monthKey = getCurrentMonthKey();
  if (typeof window === "undefined" || !userId) {
    return {
      monthKey,
      questionsUsed: 0,
      questionsRemaining: MONTHLY_FREE_QUESTIONS_LIMIT,
      maxMinutesAllowed: MONTHLY_FREE_MINUTES_LIMIT,
      hasTrialRemaining: true,
    };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MONTHLY_TRIALS);
    const map: Record<string, MonthlyTrialRecord> = raw ? JSON.parse(raw) : {};
    const key = `${userId}_${monthKey}`;
    const record = map[key];
    const used = record ? record.questionsUsed : 0;
    const remaining = Math.max(0, MONTHLY_FREE_QUESTIONS_LIMIT - used);
    return {
      monthKey,
      questionsUsed: used,
      questionsRemaining: remaining,
      maxMinutesAllowed: MONTHLY_FREE_MINUTES_LIMIT,
      hasTrialRemaining: remaining > 0,
    };
  } catch {
    return {
      monthKey,
      questionsUsed: 0,
      questionsRemaining: MONTHLY_FREE_QUESTIONS_LIMIT,
      maxMinutesAllowed: MONTHLY_FREE_MINUTES_LIMIT,
      hasTrialRemaining: true,
    };
  }
}

export function consumeMonthlyTrialQuestions(userId: string, questionsCount: number): void {
  if (typeof window === "undefined" || !userId) return;
  try {
    const monthKey = getCurrentMonthKey();
    const raw = localStorage.getItem(STORAGE_KEYS.MONTHLY_TRIALS);
    const map: Record<string, MonthlyTrialRecord> = raw ? JSON.parse(raw) : {};
    const key = `${userId}_${monthKey}`;
    const prev = map[key] || {
      userId,
      monthKey,
      questionsUsed: 0,
      sessionsCount: 0,
      lastUsedAt: new Date().toISOString(),
    };
    map[key] = {
      ...prev,
      questionsUsed: prev.questionsUsed + questionsCount,
      sessionsCount: prev.sessionsCount + 1,
      lastUsedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEYS.MONTHLY_TRIALS, JSON.stringify(map));
  } catch (e) {
    console.error("Failed updating monthly trial:", e);
  }
}

// Real Training Sessions & Progress Recording
export function getUserRealSessions(userId: string): RealTrainingSession[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    const list: RealTrainingSession[] = raw ? JSON.parse(raw) : [];
    return list
      .filter((s) => s.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch {
    return [];
  }
}

export async function recordRealTrainingSession(params: {
  userId: string;
  userName?: string;
  type: RealTrainingSession["type"];
  title: string;
  level: string;
  totalQuestions: number;
  correctAnswers: number;
  durationSeconds: number;
  assignmentId?: string;
}): Promise<RealTrainingSession> {
  const accuracy =
    params.totalQuestions > 0
      ? Math.round((params.correctAnswers / params.totalQuestions) * 100)
      : 0;
  const earnedPoints = params.correctAnswers * 10 + (accuracy >= 90 ? 25 : 5);

  const session: RealTrainingSession = {
    id: `sess_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    userId: params.userId,
    userName: params.userName,
    type: params.type,
    title: params.title,
    level: params.level,
    totalQuestions: params.totalQuestions,
    correctAnswers: params.correctAnswers,
    accuracy,
    durationSeconds: params.durationSeconds,
    score: earnedPoints,
    assignmentId: params.assignmentId,
    createdAt: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SESSIONS);
      const list: RealTrainingSession[] = raw ? JSON.parse(raw) : [];
      list.unshift(session);
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(list.slice(0, 500)));
    } catch (e) {
      console.error("Failed saving training session:", e);
    }
  }

  // Update ExtendedProfile stats
  const prof = getExtendedProfile(params.userId, { name: params.userName });
  const newTotalQuestions = prof.totalQuestionsSolved + params.totalQuestions;
  const newCorrect = prof.correctAnswers + params.correctAnswers;
  const newWrong = prof.wrongAnswers + Math.max(0, params.totalQuestions - params.correctAnswers);
  const newAccuracy =
    newTotalQuestions > 0 ? Math.round((newCorrect / newTotalQuestions) * 100) : accuracy;

  await saveExtendedProfile({
    ...prof,
    totalExercises: prof.totalExercises + 1,
    totalQuestionsSolved: newTotalQuestions,
    correctAnswers: newCorrect,
    wrongAnswers: newWrong,
    accuracyRate: newAccuracy,
    points: prof.points + earnedPoints,
    currentLevel: params.level || prof.currentLevel,
    lastActivity: new Date().toISOString(),
  });

  // If linked to an assignment or competition, record submission automatically!
  if (params.assignmentId) {
    submitAssignmentResult(params.assignmentId, {
      studentId: params.userId,
      studentName: prof.name,
      studentAvatar: prof.avatarUrl,
      governorate: prof.governorate,
      score: earnedPoints,
      totalQuestions: params.totalQuestions,
      correctAnswers: params.correctAnswers,
      accuracy,
      durationSeconds: params.durationSeconds,
      completedAt: new Date().toISOString(),
    });
  }

  return session;
}

// Assignments & Admin Competitions Store
function getInitialAssignments(): PlatformAssignment[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ASSIGNMENTS);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error("Error reading assignments:", e);
  }

  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const defaults: PlatformAssignment[] = [
    {
      id: "comp-official-1",
      kind: "admin_competition",
      title: "🏆 بطولة العقل الخارق الشهرية الكبرى - الجمع والطرح البسيط",
      description: "مسابقة رسمية من إدارة المنصة لجميع الأبطال! حل 20 سؤالاً بأعلى دقة وأسرع وقت لتصدر لوحة الشرف.",
      creatorId: "trainer-qatada",
      creatorName: "إدارة منصة العقل الخارق (الأستاذ قتادة كريم)",
      creatorRole: "admin",
      targetType: "all_students",
      exerciseType: "competition",
      rulesLevel: "simple",
      allowSubtraction: true,
      digitPlace: "units",
      termsCount: 5,
      questionsCount: 20,
      timeLimitMinutes: 5,
      answerMode: "typing",
      choicesCount: 4,
      dueDate: nextWeek,
      isActive: true,
      createdAt: now.toISOString(),
      submissions: [],
    },
    {
      id: "hw-qatada-1",
      kind: "trainer_homework",
      title: "📝 واجب اليوم: تنشيط الآحاد والعشرات (الجمع البسيط)",
      description: "واجب تدريبي جاهز من الأستاذ قتادة كريم - اضغط زر البدء وسيتم ضبط الإعدادات تلقائياً.",
      creatorId: "trainer-qatada",
      creatorName: "الأستاذ قتادة كريم",
      creatorRole: "trainer",
      targetType: "all_students",
      exerciseType: "competition",
      rulesLevel: "simple",
      allowSubtraction: true,
      digitPlace: "units",
      termsCount: 4,
      questionsCount: 15,
      timeLimitMinutes: 5,
      answerMode: "choices",
      choicesCount: 4,
      dueDate: nextWeek,
      isActive: true,
      createdAt: now.toISOString(),
      submissions: [],
    },
  ];

  try {
    localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(defaults));
  } catch {}
  return defaults;
}

export function getAllAssignments(): PlatformAssignment[] {
  return getInitialAssignments();
}

export function getAssignmentById(id: string): PlatformAssignment | undefined {
  return getInitialAssignments().find((a) => a.id === id);
}

export function createPlatformAssignment(
  assignment: Omit<PlatformAssignment, "id" | "createdAt" | "submissions">
): PlatformAssignment {
  const list = getInitialAssignments();
  const created: PlatformAssignment = {
    ...assignment,
    id: `assign_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    createdAt: new Date().toISOString(),
    submissions: [],
  };
  list.unshift(created);
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(list));
      window.dispatchEvent(new CustomEvent("supermind:assignments-updated"));
    } catch {}
  }
  return created;
}

export function deletePlatformAssignment(id: string): void {
  const list = getInitialAssignments().filter((a) => a.id !== id);
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(list));
      window.dispatchEvent(new CustomEvent("supermind:assignments-updated"));
    } catch {}
  }
}

export function submitAssignmentResult(assignmentId: string, submission: AssignmentSubmission): void {
  const list = getInitialAssignments();
  const idx = list.findIndex((a) => a.id === assignmentId);
  if (idx === -1) return;

  const existingSubs = list[idx].submissions || [];
  const subIdx = existingSubs.findIndex((s) => s.studentId === submission.studentId);

  if (subIdx >= 0) {
    // Keep the better score or faster time
    const prev = existingSubs[subIdx];
    if (
      submission.accuracy > prev.accuracy ||
      (submission.accuracy === prev.accuracy && submission.durationSeconds <= prev.durationSeconds)
    ) {
      existingSubs[subIdx] = submission;
    }
  } else {
    existingSubs.push(submission);
  }

  // Sort leaderboard by highest correctAnswers/accuracy then fastest durationSeconds
  existingSubs.sort((a, b) => {
    if (b.correctAnswers !== a.correctAnswers) return b.correctAnswers - a.correctAnswers;
    return a.durationSeconds - b.durationSeconds;
  });

  list[idx].submissions = existingSubs;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(list));
      window.dispatchEvent(new CustomEvent("supermind:assignments-updated"));
    } catch {}
  }
}

export function getStudentAssignments(profile: ExtendedUserProfile): {
  adminCompetitions: PlatformAssignment[];
  trainerHomeworks: PlatformAssignment[];
} {
  const all = getInitialAssignments().filter((a) => a.isActive);
  const evalSub = evaluateSubscription(profile.subscription);

  const matchesTarget = (a: PlatformAssignment): boolean => {
    if (a.targetType === "all_students") return true;
    if (a.targetType === "active_subscribers") return evalSub.isActive;
    if (a.targetType === "specific_student") return a.targetValue === profile.id;
    if (a.targetType === "trainer_students") {
      return !profile.trainerId || profile.trainerId === a.creatorId || a.creatorId === "trainer-qatada";
    }
    if (a.targetType === "by_governorate") {
      return Boolean(profile.governorate && a.targetValue === profile.governorate);
    }
    if (a.targetType === "by_level") {
      return Boolean(a.targetValue && profile.currentLevel.includes(a.targetValue));
    }
    return true;
  };

  const filtered = all.filter(matchesTarget);
  return {
    adminCompetitions: filtered.filter(
      (a) => a.kind === "admin_competition" || a.kind === "admin_challenge"
    ),
    trainerHomeworks: filtered.filter((a) => a.kind === "trainer_homework"),
  };
}

export function getVerifiedTrainersForDirectory(): ExtendedUserProfile[] {
  const all = getAllExtendedProfiles();
  return all.filter((p) => {
    if (p.role !== "trainer" && p.id !== "trainer-qatada") return false;
    const evalSub = evaluateSubscription(p.subscription);
    return (p.isVerifiedTrainer || evalSub.isActive) && p.showInDirectory !== false;
  });
}
