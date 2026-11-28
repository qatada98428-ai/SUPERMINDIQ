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
  memberCode?: string; // Unique short membership ID e.g. SM-48A2
  email: string;
  name: string;
  role: "student" | "trainer" | "admin";
  requestedAccountMode?: "free_student" | "pro_student" | "trainer" | "school";
  requestedPlanId?: SubscriptionPlanId;
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

export interface SubmissionRuleBreakdown {
  groupLabel: string;
  total: number;
  correct: number;
  wrong: number;
  unanswered: number;
  accuracy: number;
}

export interface SubmissionQuestionDetail {
  id: number;
  groupLabel: string;
  numbers: number[];
  correctAnswer: number;
  userAnswer: string;
  isCorrect: boolean;
}

export interface AssignmentAttemptRecord {
  attemptNumber: number;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers?: number;
  unansweredCount?: number;
  accuracy: number;
  durationSeconds: number;
  avgSecondsPerQuestion?: number;
  ruleBreakdown?: SubmissionRuleBreakdown[];
  questionDetails?: SubmissionQuestionDetail[];
  completedAt: string;
}

export interface AssignmentSubmission {
  studentId: string;
  studentName: string;
  studentEmail?: string;
  studentPhone?: string;
  studentAvatar?: string;
  governorate?: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers?: number;
  unansweredCount?: number;
  accuracy: number;
  durationSeconds: number;
  avgSecondsPerQuestion?: number;
  assignmentCreatorId?: string;
  assignmentTitle?: string;
  attemptNumber?: number;
  totalAttempts?: number;
  attempts?: AssignmentAttemptRecord[];
  ruleBreakdown?: SubmissionRuleBreakdown[];
  questionDetails?: SubmissionQuestionDetail[];
  completedAt: string;
}

export function formatAttemptLabelAr(attemptNumber?: number): string {
  const n = Math.max(1, Math.floor(attemptNumber || 1));
  if (n === 1) return "المحاولة الأولى";
  if (n === 2) return "المحاولة الثانية";
  if (n === 3) return "المحاولة الثالثة";
  if (n === 4) return "المحاولة الرابعة";
  if (n === 5) return "المحاولة الخامسة";
  return `المحاولة رقم ${n}`;
}

export interface AssignmentRuleGroup {
  id: string;
  count: number;
  digitsCount: number; // 1: آحاد, 2: عشرات, 3: مئات, 4: ألوف
  level: "simple" | "complex_5" | "complex_10" | "mixed" | "general";
  targetRules: number[];
  termsCount: number;
  allowSubtraction: boolean;
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
  targetStudentIds?: string[]; // Optional list of selected student IDs for trainer tournaments
  // Exercise configuration
  exerciseType: "competition" | "flash_anzan" | "abacus";
  rulesLevel: "simple" | "complex_5" | "complex_10" | "mixed" | "general";
  allowSubtraction: boolean;
  digitPlace: "units" | "tens" | "hundreds" | "thousands";
  termsCount: number;
  questionsCount: number;
  timeLimitMinutes: number;
  timeMode?: "countdown" | "stopwatch";
  answerMode: "typing" | "choices";
  choicesCount: 2 | 3 | 4 | 5;
  displayMode?: "sheet" | "focus";
  voiceMode?: "arabic" | "english" | "off";
  orderMode?: "sequential" | "shuffled";
  ruleGroups?: AssignmentRuleGroup[];
  notifyStudents?: boolean;
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
  TRAINER_LINKS: "supermind_trainer_student_links_v1",
  DISMISSED_COMP_NOTIFS: "supermind_dismissed_comp_notifs_v1",
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

export function getUserMembershipCode(userId?: string): string {
  if (!userId || userId === "guest-local") return "SM-GUEST";
  if (userId === "trainer-qatada") return "SM-QAT1";
  const cleaned = userId.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  if (cleaned.length >= 4) {
    // Take first 2 and last 2 characters for uniqueness
    return `SM-${cleaned.slice(0, 2)}${cleaned.slice(-2)}`;
  }
  return `SM-${cleaned.padEnd(4, "0")}`;
}

export interface PackedPhoneMetadata {
  memberCode?: string;
  role?: "student" | "trainer" | "admin";
  requestedAccountMode?: "free_student" | "pro_student" | "trainer" | "school";
  requestedPlanId?: SubscriptionPlanId;
  sub?: SubscriptionInfo;
  isVerifiedTrainer?: boolean;
  showInDirectory?: boolean;
  trainerId?: string;
  trainerName?: string;
}

export function unpackProfilePhoneColumn(rawPhoneField?: string | null): {
  cleanPhone: string;
  country: string;
  governorate: string;
  meta: PackedPhoneMetadata | null;
} {
  if (!rawPhoneField) {
    return { cleanPhone: "", country: "العراق", governorate: "", meta: null };
  }
  const [beforeMeta, metaJson] = rawPhoneField.split("||");
  let meta: PackedPhoneMetadata | null = null;
  if (metaJson && metaJson.trim()) {
    try {
      meta = JSON.parse(metaJson.trim()) as PackedPhoneMetadata;
    } catch {
      meta = null;
    }
  }

  const parts = (beforeMeta || "").split("|");
  const cleanPhone = (parts[0] || "").trim();
  const locStr = (parts[1] || "").trim();
  const country = locStr.includes("-")
    ? locStr.split("-")[0]?.trim() || "العراق"
    : "العراق";
  const governorate = locStr.includes("-")
    ? locStr.split("-").slice(1).join("-").trim()
    : locStr;

  return { cleanPhone, country, governorate, meta };
}

export function packProfilePhoneColumn(profile: ExtendedUserProfile): string | null {
  const cleanPhone = unpackProfilePhoneColumn(profile.phone).cleanPhone;
  const locationSuffix =
    profile.country || profile.governorate
      ? ` | ${profile.country || "العراق"}${profile.governorate ? ` - ${profile.governorate}` : ""}`
      : "";
  const metaObj: PackedPhoneMetadata = {
    memberCode: profile.memberCode || getUserMembershipCode(profile.id),
    role: profile.role,
    requestedAccountMode: profile.requestedAccountMode,
    requestedPlanId: profile.requestedPlanId,
    sub: profile.subscription,
    isVerifiedTrainer: profile.isVerifiedTrainer,
    showInDirectory: profile.showInDirectory,
    trainerId: profile.trainerId,
    trainerName: profile.trainerName,
  };
  const base = `${cleanPhone}${locationSuffix}`.trim();
  return `${base} || ${JSON.stringify(metaObj)}`;
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
  const unpacked = unpackProfilePhoneColumn(fallback?.phone);
  const parsedPhone = unpacked.cleanPhone;
  const parsedCountry = unpacked.country;
  const parsedGov = unpacked.governorate;
  const cloudMeta = unpacked.meta;

  const map = getInitialProfiles();
  if (map[userId]) {
    const existing = map[userId];
    existing.memberCode = existing.memberCode || getUserMembershipCode(userId);
    // Always keep existing.phone clean without | or ||
    existing.phone = unpackProfilePhoneColumn(existing.phone).cleanPhone || parsedPhone;
    if (parsedGov && !existing.governorate) {
      existing.country = parsedCountry || existing.country;
      existing.governorate = parsedGov;
    }
    if (fallback?.avatarUrl && !existing.avatarUrl) existing.avatarUrl = fallback.avatarUrl;
    if (fallback?.name && existing.name === "بطل العقل الخارق") existing.name = fallback.name;
    if (cloudMeta?.role && existing.role !== "admin") {
      existing.role = cloudMeta.role;
    }
    if (cloudMeta?.requestedAccountMode) {
      existing.requestedAccountMode = cloudMeta.requestedAccountMode;
    }
    if (cloudMeta?.requestedPlanId) {
      existing.requestedPlanId = cloudMeta.requestedPlanId;
    }
    if (cloudMeta?.trainerId) {
      existing.trainerId = cloudMeta.trainerId;
    }
    if (cloudMeta?.trainerName) {
      existing.trainerName = cloudMeta.trainerName;
    }
    if (cloudMeta?.sub && cloudMeta.sub.status === "active") {
      existing.subscription = cloudMeta.sub;
    }
    if (cloudMeta?.isVerifiedTrainer !== undefined) {
      existing.isVerifiedTrainer = cloudMeta.isVerifiedTrainer;
    }
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
    memberCode: getUserMembershipCode(userId),
    email: fallback?.email || "",
    name: fallback?.name || "بطل العقل الخارق",
    role: isAdminEmail ? "admin" : cloudMeta?.role || fallback?.role || "student",
    requestedAccountMode: cloudMeta?.requestedAccountMode || "free_student",
    requestedPlanId: cloudMeta?.requestedPlanId,
    phone: parsedPhone,
    country: parsedCountry || "العراق",
    governorate: parsedGov || "",
    avatarUrl: fallback?.avatarUrl || undefined,
    trainerId: cloudMeta?.trainerId || "trainer-qatada",
    trainerName: cloudMeta?.trainerName || "الأستاذ قتادة كريم",
    isVerifiedTrainer: cloudMeta?.isVerifiedTrainer,
    showInDirectory: cloudMeta?.showInDirectory,
    trainerCode:
      isAdminEmail || cloudMeta?.role === "trainer" || fallback?.role === "trainer"
        ? `TR-${userId.slice(0, 4).toUpperCase()}`
        : undefined,
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
      : cloudMeta?.sub
      ? cloudMeta.sub
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

export async function syncExtendedProfileFromSupabase(
  userId: string
): Promise<ExtendedUserProfile | null> {
  if (!userId || userId === "guest-local" || userId.startsWith("trainer-")) return null;
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const [{ data: profRow }, { data: progRow }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase.from("user_progress").select("*").eq("user_id", userId).maybeSingle(),
    ]);

    if (!profRow) return null;
    const unpacked = unpackProfilePhoneColumn(profRow.phone);
    const localProf = getExtendedProfile(userId, {
      email: profRow.email,
      name: profRow.name,
      role: profRow.role,
      phone: profRow.phone,
      avatarUrl: profRow.avatar_url,
    });

    const synced: ExtendedUserProfile = {
      ...localProf,
      memberCode: unpacked.meta?.memberCode || localProf.memberCode || getUserMembershipCode(userId),
      name: profRow.name || localProf.name,
      email: profRow.email || localProf.email,
      phone: unpacked.cleanPhone || localProf.phone,
      country: unpacked.country || localProf.country || "العراق",
      governorate: unpacked.governorate || localProf.governorate,
      avatarUrl: profRow.avatar_url || localProf.avatarUrl,
      role:
        profRow.role === "admin"
          ? "admin"
          : unpacked.meta?.role || profRow.role || localProf.role,
      requestedAccountMode:
        unpacked.meta?.requestedAccountMode || localProf.requestedAccountMode,
      requestedPlanId: unpacked.meta?.requestedPlanId || localProf.requestedPlanId,
      trainerId: unpacked.meta?.trainerId || localProf.trainerId,
      trainerName: unpacked.meta?.trainerName || localProf.trainerName,
      subscription: unpacked.meta?.sub || localProf.subscription,
      isVerifiedTrainer:
        unpacked.meta?.isVerifiedTrainer ?? localProf.isVerifiedTrainer,
      showInDirectory:
        unpacked.meta?.showInDirectory ?? localProf.showInDirectory,
      totalExercises: Math.max(
        localProf.totalExercises,
        progRow?.completed_exercises || 0
      ),
      totalQuestionsSolved: Math.max(
        localProf.totalQuestionsSolved,
        progRow?.total_answers || 0
      ),
      correctAnswers: Math.max(
        localProf.correctAnswers,
        progRow?.correct_answers || 0
      ),
      wrongAnswers: Math.max(
        localProf.wrongAnswers,
        progRow?.wrong_answers || 0
      ),
      accuracyRate: progRow?.accuracy_rate
        ? Math.round(Number(progRow.accuracy_rate))
        : localProf.accuracyRate,
    };

    const map = getInitialProfiles();
    map[userId] = synced;
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(map));
        window.dispatchEvent(new CustomEvent("supermind:profile-updated", { detail: synced }));
      } catch {}
    }
    return synced;
  } catch (err) {
    console.warn("Cloud profile sync warning:", err);
    return null;
  }
}

export async function saveExtendedProfile(profile: ExtendedUserProfile): Promise<ExtendedUserProfile> {
  const map = getInitialProfiles();
  const cleanPhoneOnly = unpackProfilePhoneColumn(profile.phone).cleanPhone;
  const updated: ExtendedUserProfile = {
    ...profile,
    phone: cleanPhoneOnly,
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

  // Also sync allowed fields (name, phone with packed metadata, avatar_url) to Supabase profiles
  const supabase = getSupabaseClient();
  if (supabase && profile.id && !profile.id.startsWith("trainer-")) {
    try {
      const packedPhone = packProfilePhoneColumn(updated);
      await supabase
        .from("profiles")
        .update({
          name: updated.name,
          phone: packedPhone,
          avatar_url: updated.avatarUrl || null,
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
  wrongAnswers?: number;
  unansweredCount?: number;
  durationSeconds: number;
  assignmentId?: string;
  assignmentCreatorId?: string;
  assignmentTitle?: string;
  studentEmail?: string;
  studentPhone?: string;
  attemptNumber?: number;
  ruleBreakdown?: SubmissionRuleBreakdown[];
  questionDetails?: SubmissionQuestionDetail[];
}): Promise<RealTrainingSession> {
  const accuracy =
    params.totalQuestions > 0
      ? Math.round((params.correctAnswers / params.totalQuestions) * 100)
      : 0;
  const earnedPoints = params.correctAnswers * 10 + (accuracy >= 90 ? 25 : 5);
  const wrongCnt =
    params.wrongAnswers ?? Math.max(0, params.totalQuestions - params.correctAnswers);
  const avgSecPerQ =
    params.totalQuestions > 0
      ? Number((params.durationSeconds / params.totalQuestions).toFixed(1))
      : 0;
  // Cap serialized question details safely to keep cloud JSONB fast
  const compactDetails = params.questionDetails ? params.questionDetails.slice(0, 200) : undefined;
  const resolvedAttemptNumber = params.assignmentId
    ? Math.max(
        1,
        params.attemptNumber ??
          getStudentAssignmentAttemptCount(params.assignmentId, params.userId) + 1
      )
    : undefined;

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

  // If linked to an assignment or competition, record full detailed submission automatically!
  if (params.assignmentId) {
    submitAssignmentResult(params.assignmentId, {
      studentId: params.userId,
      studentName: prof.name,
      studentEmail: params.studentEmail || prof.email,
      studentPhone: params.studentPhone || prof.phone,
      studentAvatar: prof.avatarUrl,
      governorate: prof.governorate,
      score: earnedPoints,
      totalQuestions: params.totalQuestions,
      correctAnswers: params.correctAnswers,
      wrongAnswers: wrongCnt,
      unansweredCount: params.unansweredCount ?? 0,
      accuracy,
      durationSeconds: params.durationSeconds,
      avgSecondsPerQuestion: avgSecPerQ,
      assignmentCreatorId: params.assignmentCreatorId,
      assignmentTitle: params.assignmentTitle || params.title,
      attemptNumber: resolvedAttemptNumber,
      ruleBreakdown: params.ruleBreakdown,
      questionDetails: compactDetails,
      completedAt: new Date().toISOString(),
    });
  }

  // Also persist training session & detailed assignment submission in Supabase training_sessions
  const supabase = getSupabaseClient();
  if (supabase && params.userId && params.userId !== "guest-local" && !params.userId.startsWith("trainer-")) {
    try {
      const dbSessionType =
        params.type === "flash-anzan"
          ? "flash_anzan"
          : params.type === "abacus" ||
            params.type === "multiplication" ||
            params.type === "quiz"
          ? params.type
          : "quiz";

      await supabase.from("training_sessions").insert([
        {
          user_id: params.userId,
          session_type: dbSessionType,
          level: params.level || "المستوى الأول",
          total_questions: params.totalQuestions,
          correct_answers: params.correctAnswers,
          wrong_answers: wrongCnt,
          accuracy_rate: accuracy,
          duration_seconds: params.durationSeconds,
          score: earnedPoints,
          metadata: {
            kind: params.type,
            title: params.title,
            assignmentId: params.assignmentId || null,
            assignmentCreatorId: params.assignmentCreatorId || null,
            assignmentTitle: params.assignmentTitle || params.title,
            attemptNumber: resolvedAttemptNumber || 1,
            studentName: prof.name,
            studentEmail: params.studentEmail || prof.email || "",
            governorate: prof.governorate || "",
            unansweredCount: params.unansweredCount ?? 0,
            avgSecondsPerQuestion: avgSecPerQ,
            ruleBreakdown: params.ruleBreakdown || null,
            questionDetails: compactDetails || null,
          },
        },
      ]);
    } catch (err) {
      console.warn("Supabase training session sync warning:", err);
    }
  }

  return session;
}

export function encodeRuleGroupsParam(groups: AssignmentRuleGroup[]): string {
  return groups
    .map(
      (g) =>
        `${Math.max(1, Math.min(1000, Math.floor(g.count || 1)))}.${g.digitsCount}.${g.level}.${(
          g.targetRules || []
        ).join(",")}.${g.termsCount}.${g.allowSubtraction ? 1 : 0}`
    )
    .join(";");
}

export function decodeRuleGroupsParam(raw: string | null): AssignmentRuleGroup[] | undefined {
  if (!raw || !raw.trim()) return undefined;
  const parts = raw
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);
  const validLevels = new Set(["simple", "complex_5", "complex_10", "mixed", "general"]);
  const groups: AssignmentRuleGroup[] = [];

  parts.forEach((p, idx) => {
    const seg = p.split(".");
    if (seg.length < 6) return;
    const count = Math.max(1, Math.min(1000, parseInt(seg[0], 10) || 20));
    const digitsCount = Math.max(1, Math.min(4, parseInt(seg[1], 10) || 1));
    const level = (
      validLevels.has(seg[2]) ? seg[2] : "simple"
    ) as AssignmentRuleGroup["level"];
    const targetRules = seg[3]
      ? seg[3]
          .split(",")
          .map((n) => parseInt(n, 10))
          .filter((n) => !Number.isNaN(n) && n >= 1 && n <= 9)
      : [];
    const termsCount = Math.max(2, Math.min(15, parseInt(seg[4], 10) || 4));
    const allowSubtraction = seg[5] !== "0";
    groups.push({
      id: `shared-g-${idx + 1}`,
      count,
      digitsCount,
      level,
      targetRules,
      termsCount,
      allowSubtraction,
    });
  });

  return groups.length > 0 ? groups : undefined;
}

export function formatRuleGroupShortAr(g: AssignmentRuleGroup): string {
  const digLabels: Record<number, string> = { 1: "آحاد", 2: "عشرات", 3: "مئات", 4: "ألوف" };
  const lvlLabels: Record<string, string> = {
    simple: "بسيط",
    complex_5: "مركب 5",
    complex_10: "مركب 10",
    mixed: "مركب 5 و 10",
    general: "عام شامل",
  };
  const subRules =
    (g.level === "complex_5" || g.level === "complex_10") && g.targetRules.length > 0
      ? ` (قاعدة ${g.targetRules.join("، ")})`
      : "";
  return `${digLabels[g.digitsCount] || `${g.digitsCount} خانات`} • ${lvlLabels[g.level] || g.level}${subRules} (${g.count} س / ${g.termsCount} صفوف)`;
}

export function buildShareableAssignmentPath(assignment: PlatformAssignment): string {
  const basePath =
    assignment.exerciseType === "flash_anzan"
      ? "/mental-arithmetic/flash-anzan"
      : assignment.exerciseType === "abacus"
      ? "/mental-arithmetic/abacus"
      : "/mental-arithmetic/competition";

  const sp = new URLSearchParams();
  sp.set("assignmentId", assignment.id);
  sp.set("title", assignment.title);
  sp.set("kind", assignment.kind);
  sp.set("q", String(assignment.questionsCount));
  sp.set("t", String(assignment.timeLimitMinutes));
  sp.set("lvl", assignment.rulesLevel);
  sp.set("dig", assignment.digitPlace);
  sp.set("terms", String(assignment.termsCount));
  sp.set("sub", assignment.allowSubtraction ? "1" : "0");
  sp.set("mode", assignment.answerMode);
  sp.set("ch", String(assignment.choicesCount));
  sp.set("by", assignment.creatorName);
  if (assignment.creatorId) {
    sp.set("cid", assignment.creatorId);
  }
  if (assignment.timeMode) {
    sp.set("tm", assignment.timeMode);
  }
  if (assignment.orderMode) {
    sp.set("ord", assignment.orderMode);
  }
  if (assignment.displayMode) {
    sp.set("disp", assignment.displayMode);
  }
  if (assignment.voiceMode) {
    sp.set("vc", assignment.voiceMode);
  }
  if (assignment.ruleGroups && assignment.ruleGroups.length > 0) {
    sp.set("rg", encodeRuleGroupsParam(assignment.ruleGroups));
  }
  if (assignment.description) {
    sp.set("desc", assignment.description);
  }
  return `${basePath}?${sp.toString()}`;
}

export function parseAssignmentFromSearchParams(
  params: URLSearchParams
): PlatformAssignment | null {
  const assignId = params.get("assignmentId");
  if (!assignId) return null;

  const existing = getAssignmentById(assignId);
  const parsedGroups = decodeRuleGroupsParam(params.get("rg"));
  if (existing) {
    // If URL carries richer rule groups not yet on existing, merge them cleanly
    if (parsedGroups && (!existing.ruleGroups || existing.ruleGroups.length === 0)) {
      return { ...existing, ruleGroups: parsedGroups };
    }
    return existing;
  }

  const title = params.get("title");
  if (!title) return null;

  const kind = (params.get("kind") as PlatformAssignment["kind"]) || "trainer_homework";
  const questionsCount = Math.max(1, Math.min(1000, parseInt(params.get("q") || "20", 10) || 20));
  const timeLimitMinutes = Math.max(1, Math.min(60, parseInt(params.get("t") || "5", 10) || 5));
  const rulesLevel =
    (params.get("lvl") as PlatformAssignment["rulesLevel"]) || "simple";
  const digitPlace =
    (params.get("dig") as PlatformAssignment["digitPlace"]) || "units";
  const termsCount = Math.max(2, Math.min(15, parseInt(params.get("terms") || "4", 10) || 4));
  const allowSubtraction = params.get("sub") !== "0";
  const answerMode =
    (params.get("mode") as PlatformAssignment["answerMode"]) || "typing";
  const rawChoices = parseInt(params.get("ch") || "4", 10);
  const choicesCount: 2 | 3 | 4 | 5 =
    rawChoices === 2 || rawChoices === 3 || rawChoices === 4 || rawChoices === 5
      ? rawChoices
      : 4;
  const timeMode = (params.get("tm") as PlatformAssignment["timeMode"]) || "countdown";
  const orderMode = (params.get("ord") as PlatformAssignment["orderMode"]) || "sequential";
  const displayMode = (params.get("disp") as PlatformAssignment["displayMode"]) || "focus";
  const voiceMode = (params.get("vc") as PlatformAssignment["voiceMode"]) || "arabic";
  const creatorName = params.get("by") || "الأستاذ قتادة كريم";
  const creatorId = params.get("cid") || "shared-link";
  const description = params.get("desc") || "تمت مشاركة هذه البطولة عبر الرابط المباشر.";

  const reconstructed: PlatformAssignment = {
    id: assignId,
    kind,
    title,
    description,
    creatorId,
    creatorName,
    creatorRole: kind === "trainer_homework" ? "trainer" : "admin",
    targetType: "all_students",
    exerciseType: "competition",
    rulesLevel,
    allowSubtraction,
    digitPlace,
    termsCount,
    questionsCount: parsedGroups
      ? Math.min(1000, parsedGroups.reduce((s, g) => s + g.count, 0))
      : questionsCount,
    timeLimitMinutes,
    timeMode,
    answerMode,
    choicesCount,
    displayMode,
    voiceMode,
    orderMode,
    ruleGroups: parsedGroups,
    notifyStudents: false,
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true,
    createdAt: new Date().toISOString(),
    submissions: [],
  };

  // Save reconstructed assignment locally so it also appears on the student's dashboard!
  if (typeof window !== "undefined") {
    try {
      const list = getInitialAssignments();
      if (!list.some((a) => a.id === reconstructed.id)) {
        list.unshift(reconstructed);
        localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(list));
      }
    } catch {}
  }

  return reconstructed;
}

export async function publishAssignmentToCloud(assignment: PlatformAssignment): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  try {
    await supabase.from("platform_assignments").upsert([
      {
        id: assignment.id,
        kind: assignment.kind,
        title: assignment.title,
        description: assignment.description || null,
        creator_id: assignment.creatorId,
        creator_name: assignment.creatorName,
        creator_role: assignment.creatorRole,
        target_type: assignment.targetType,
        target_value: assignment.targetValue || null,
        target_student_ids: assignment.targetStudentIds || [],
        config: {
          exerciseType: assignment.exerciseType,
          rulesLevel: assignment.rulesLevel,
          allowSubtraction: assignment.allowSubtraction,
          digitPlace: assignment.digitPlace,
          termsCount: assignment.termsCount,
          questionsCount: assignment.questionsCount,
          timeLimitMinutes: assignment.timeLimitMinutes,
          timeMode: assignment.timeMode || "countdown",
          answerMode: assignment.answerMode,
          choicesCount: assignment.choicesCount,
          displayMode: assignment.displayMode || "focus",
          voiceMode: assignment.voiceMode || "arabic",
          orderMode: assignment.orderMode || "sequential",
          ruleGroups: assignment.ruleGroups || [],
        },
        is_active: assignment.isActive,
        notify_students: assignment.notifyStudents !== false,
        due_date: assignment.dueDate || null,
        created_at: assignment.createdAt,
      },
    ]);
  } catch {
    // Graceful fallback if table hasn't been created in cloud yet
  }
}

export async function syncAllAssignmentsSubmissionsFromCloud(): Promise<PlatformAssignment[]> {
  const list = getInitialAssignments();
  const supabase = getSupabaseClient();
  if (!supabase) return list;

  let updatedAny = false;

  // 1. Fetch published cloud assignments from platform_assignments (if available)
  try {
    const { data: cloudAssigns, error: assignErr } = await supabase
      .from("platform_assignments")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(100);

    if (!assignErr && cloudAssigns && cloudAssigns.length > 0) {
      for (const row of cloudAssigns) {
        const cfg = (row.config || {}) as Record<string, unknown>;
        const mapped: PlatformAssignment = {
          id: String(row.id),
          kind: (row.kind as PlatformAssignment["kind"]) || "admin_competition",
          title: String(row.title || ""),
          description: row.description ? String(row.description) : undefined,
          creatorId: String(row.creator_id || ""),
          creatorName: String(row.creator_name || "إدارة المنصة"),
          creatorRole: (row.creator_role as "trainer" | "admin") || "admin",
          targetType: (row.target_type as PlatformAssignment["targetType"]) || "all_students",
          targetValue: row.target_value ? String(row.target_value) : undefined,
          targetStudentIds: Array.isArray(row.target_student_ids)
            ? (row.target_student_ids as string[])
            : undefined,
          exerciseType: (cfg.exerciseType as PlatformAssignment["exerciseType"]) || "competition",
          rulesLevel: (cfg.rulesLevel as PlatformAssignment["rulesLevel"]) || "simple",
          allowSubtraction: cfg.allowSubtraction !== false,
          digitPlace: (cfg.digitPlace as PlatformAssignment["digitPlace"]) || "units",
          termsCount: Number(cfg.termsCount || 4),
          questionsCount: Number(cfg.questionsCount || 20),
          timeLimitMinutes: Number(cfg.timeLimitMinutes || 10),
          timeMode: (cfg.timeMode as PlatformAssignment["timeMode"]) || "countdown",
          answerMode: (cfg.answerMode as PlatformAssignment["answerMode"]) || "typing",
          choicesCount: (Number(cfg.choicesCount || 4) as 2 | 3 | 4 | 5),
          displayMode: (cfg.displayMode as PlatformAssignment["displayMode"]) || "focus",
          voiceMode: (cfg.voiceMode as PlatformAssignment["voiceMode"]) || "arabic",
          orderMode: (cfg.orderMode as PlatformAssignment["orderMode"]) || "sequential",
          ruleGroups: Array.isArray(cfg.ruleGroups)
            ? (cfg.ruleGroups as AssignmentRuleGroup[])
            : undefined,
          notifyStudents: row.notify_students !== false,
          dueDate: row.due_date ? String(row.due_date) : undefined,
          isActive: row.is_active !== false,
          createdAt: String(row.created_at || new Date().toISOString()),
          submissions: [],
        };

        const existingIdx = list.findIndex((a) => a.id === mapped.id);
        if (existingIdx === -1) {
          list.unshift(mapped);
          updatedAny = true;
        } else {
          list[existingIdx] = {
            ...mapped,
            submissions: list[existingIdx].submissions || [],
          };
        }
      }
    }

    // 2. Fetch cloud submissions from assignment_submissions (if available)
    const { data: cloudSubs, error: subsErr } = await supabase
      .from("assignment_submissions")
      .select("*")
      .order("completed_at", { ascending: false })
      .limit(500);

    if (!subsErr && cloudSubs && cloudSubs.length > 0) {
      for (const row of cloudSubs) {
        const assignId = String(row.assignment_id || "");
        const idx = list.findIndex((a) => a.id === assignId);
        if (idx === -1) continue;
        const sub: AssignmentSubmission = {
          studentId: String(row.student_id || ""),
          studentName: String(row.student_name || "بطل العقل الخارق"),
          governorate: row.governorate ? String(row.governorate) : "",
          score: Number(row.score || 0),
          totalQuestions: Number(row.total_questions || 0),
          correctAnswers: Number(row.correct_answers || 0),
          accuracy: Math.round(Number(row.accuracy || 0)),
          durationSeconds: Number(row.duration_seconds || 0),
          completedAt: String(row.completed_at || new Date().toISOString()),
        };
        const existingSubs = list[idx].submissions || [];
        const subIdx = existingSubs.findIndex((s) => s.studentId === sub.studentId);
        if (subIdx >= 0) {
          const prev = existingSubs[subIdx];
          if (
            sub.accuracy > prev.accuracy ||
            (sub.accuracy === prev.accuracy && sub.durationSeconds < prev.durationSeconds)
          ) {
            existingSubs[subIdx] = sub;
            updatedAny = true;
          }
        } else {
          existingSubs.push(sub);
          updatedAny = true;
        }
        existingSubs.sort((a, b) => {
          if (b.correctAnswers !== a.correctAnswers) return b.correctAnswers - a.correctAnswers;
          return a.durationSeconds - b.durationSeconds;
        });
        list[idx].submissions = existingSubs;
      }
    }
  } catch {
    // Graceful fallback
  }

  // 3. Fetch detailed submissions via secure server API (works for BOTH Trainers & Admins cross-device!)
  if (typeof window !== "undefined") {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;
      if (accessToken) {
        const idsQuery = list.map((a) => a.id).join(",");
        const resp = await fetch(
          `/api/competitions/results?assignmentIds=${encodeURIComponent(idsQuery)}`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        if (resp.ok) {
          const payload = (await resp.json()) as {
            results?: Array<AssignmentSubmission & { assignmentId: string }>;
          };
          for (const item of payload.results || []) {
            let idx = list.findIndex((a) => a.id === item.assignmentId);
            if (idx === -1) {
              // Auto-reconstruct the competition entry cross-device so trainer/admin never misses a result
              list.unshift({
                id: item.assignmentId,
                kind: "trainer_homework",
                title: item.assignmentTitle || "🏆 مسابقة / بطولة مرسلة عبر الرابط",
                description: "تم استرجاع هذه المسابقة ونتائج طلابها تلقائياً من السحابة.",
                creatorId: item.assignmentCreatorId || "trainer-qatada",
                creatorName: "المدرب / إدارة المنصة",
                creatorRole: "trainer",
                targetType: "all_students",
                exerciseType: "competition",
                rulesLevel: "general",
                allowSubtraction: true,
                digitPlace: "units",
                termsCount: 4,
                questionsCount: item.totalQuestions || 20,
                timeLimitMinutes: 10,
                answerMode: "typing",
                choicesCount: 4,
                isActive: true,
                createdAt: item.completedAt || new Date().toISOString(),
                submissions: [],
              });
              idx = 0;
              updatedAny = true;
            }
            const existingSubs = list[idx].submissions || [];
            const subIdx = existingSubs.findIndex((s) => s.studentId === item.studentId);
            if (subIdx >= 0) {
              const prev = existingSubs[subIdx];
              const prevAttempts = prev.attempts || [];
              const incomingAttempts = item.attempts || [];
              const mergedAttemptsMap = new Map<number, AssignmentAttemptRecord>();
              prevAttempts.forEach((a) => mergedAttemptsMap.set(a.attemptNumber, a));
              incomingAttempts.forEach((a) => mergedAttemptsMap.set(a.attemptNumber, a));
              const mergedAttempts = Array.from(mergedAttemptsMap.values()).sort(
                (a, b) => a.attemptNumber - b.attemptNumber
              );
              const incomingAttemptNum = Math.max(
                item.attemptNumber || 1,
                mergedAttempts.length
              );
              const prevAttemptNum = Math.max(prev.attemptNumber || 1, prevAttempts.length);
              const shouldUpdate =
                incomingAttemptNum > prevAttemptNum ||
                mergedAttempts.length > prevAttempts.length ||
                item.completedAt > prev.completedAt ||
                (!prev.questionDetails && Boolean(item.questionDetails));
              if (shouldUpdate) {
                existingSubs[subIdx] = {
                  ...prev,
                  ...item,
                  attemptNumber: Math.max(incomingAttemptNum, prevAttemptNum),
                  totalAttempts: Math.max(mergedAttempts.length, incomingAttemptNum, prevAttemptNum),
                  attempts: mergedAttempts.length > 0 ? mergedAttempts : prev.attempts,
                };
                updatedAny = true;
              }
            } else {
              existingSubs.push(item);
              updatedAny = true;
            }
            existingSubs.sort((a, b) => {
              if (b.correctAnswers !== a.correctAnswers) return b.correctAnswers - a.correctAnswers;
              return a.durationSeconds - b.durationSeconds;
            });
            list[idx].submissions = existingSubs;
          }
        }
      }
    } catch {
      // Fallback gracefully to direct query below
    }
  }

  // 4. Also merge submissions recorded inside training_sessions.metadata.assignmentId (Admin/self direct read)
  try {
    const { data: sessions } = await supabase
      .from("training_sessions")
      .select("*")
      .order("created_at", { ascending: true })
      .limit(300);

    if (sessions && sessions.length > 0) {
      const attemptCounters = new Map<string, number>();
      for (const row of sessions) {
        const meta = (row.metadata || {}) as Record<string, unknown>;
        const assignId = meta.assignmentId as string | undefined;
        if (!assignId) continue;

        let idx = list.findIndex((a) => a.id === assignId);
        if (idx === -1) {
          list.unshift({
            id: assignId,
            kind: "trainer_homework",
            title: String(meta.assignmentTitle || meta.title || "🏆 مسابقة / بطولة مرسلة عبر الرابط"),
            description: "تم استرجاع هذه المسابقة ونتائج طلابها تلقائياً من السحابة.",
            creatorId: String(meta.assignmentCreatorId || "trainer-qatada"),
            creatorName: "المدرب / إدارة المنصة",
            creatorRole: "trainer",
            targetType: "all_students",
            exerciseType: "competition",
            rulesLevel: "general",
            allowSubtraction: true,
            digitPlace: "units",
            termsCount: 4,
            questionsCount: Number(row.total_questions || 20),
            timeLimitMinutes: 10,
            answerMode: "typing",
            choicesCount: 4,
            isActive: true,
            createdAt: String(row.created_at || new Date().toISOString()),
            submissions: [],
          });
          idx = 0;
          updatedAny = true;
        }

        const studentId = String(row.user_id || "");
        const countKey = `${assignId}::${studentId}`;
        const seqNum = (attemptCounters.get(countKey) || 0) + 1;
        attemptCounters.set(countKey, seqNum);
        const attemptNum = Math.max(seqNum, Number(meta.attemptNumber || 0));

        const studentName = String(meta.studentName || "بطل العقل الخارق");
        const studentEmail = String(meta.studentEmail || "");
        const governorate = String(meta.governorate || "");
        const totalQ = Number(row.total_questions || 0);
        const correct = Number(row.correct_answers || 0);
        const wrong = Number(row.wrong_answers || Math.max(0, totalQ - correct));
        const duration = Number(row.duration_seconds || 0);
        const avgSec =
          typeof meta.avgSecondsPerQuestion === "number"
            ? meta.avgSecondsPerQuestion
            : totalQ > 0
            ? Number((duration / totalQ).toFixed(1))
            : 0;
        const completedAt = String(row.created_at || new Date().toISOString());
        const attemptRec: AssignmentAttemptRecord = {
          attemptNumber: attemptNum,
          score: Number(row.score || 0),
          totalQuestions: totalQ,
          correctAnswers: correct,
          wrongAnswers: wrong,
          unansweredCount: Number(meta.unansweredCount || 0),
          accuracy: Math.round(Number(row.accuracy_rate || 0)),
          durationSeconds: duration,
          avgSecondsPerQuestion: avgSec,
          ruleBreakdown: Array.isArray(meta.ruleBreakdown)
            ? (meta.ruleBreakdown as SubmissionRuleBreakdown[])
            : undefined,
          questionDetails: Array.isArray(meta.questionDetails)
            ? (meta.questionDetails as SubmissionQuestionDetail[])
            : undefined,
          completedAt,
        };
        const submission: AssignmentSubmission = {
          studentId,
          studentName,
          studentEmail,
          governorate,
          ...attemptRec,
          totalAttempts: attemptNum,
          attempts: [attemptRec],
        };

        const existingSubs = list[idx].submissions || [];
        const subIdx = existingSubs.findIndex((s) => s.studentId === studentId);
        if (subIdx >= 0) {
          const prev = existingSubs[subIdx];
          const prevAttempts = prev.attempts || [];
          const hasAttempt = prevAttempts.some(
            (a) => a.attemptNumber === attemptNum || a.completedAt === completedAt
          );
          if (!hasAttempt) {
            const nextAttempts = [...prevAttempts, attemptRec].sort(
              (a, b) => a.attemptNumber - b.attemptNumber
            );
            const latest = nextAttempts[nextAttempts.length - 1];
            existingSubs[subIdx] = {
              ...prev,
              ...latest,
              studentName: studentName || prev.studentName,
              studentEmail: studentEmail || prev.studentEmail,
              governorate: governorate || prev.governorate,
              attemptNumber: latest.attemptNumber,
              totalAttempts: nextAttempts.length,
              attempts: nextAttempts,
            };
            updatedAny = true;
          }
        } else {
          existingSubs.push(submission);
          updatedAny = true;
        }

        existingSubs.sort((a, b) => {
          if (b.correctAnswers !== a.correctAnswers) return b.correctAnswers - a.correctAnswers;
          return a.durationSeconds - b.durationSeconds;
        });
        list[idx].submissions = existingSubs;
      }
    }
  } catch (err) {
    console.warn("Cloud submissions sync warning:", err);
  }

  if (updatedAny && typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(list));
    } catch {}
  }

  return list;
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
    notifyStudents: assignment.notifyStudents !== false,
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
  // Fire-and-forget cloud publish
  publishAssignmentToCloud(created).catch(() => {});
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
  const supabase = getSupabaseClient();
  if (supabase) {
    supabase
      .from("platform_assignments")
      .delete()
      .eq("id", id)
      .then(() => {}, () => {});
  }
}

export function getStudentAssignmentAttemptCount(
  assignmentId: string,
  studentId: string
): number {
  if (!assignmentId || !studentId) return 0;
  let count = 0;

  const existing = getAssignmentById(assignmentId);
  const sub = existing?.submissions?.find((s) => s.studentId === studentId);
  if (sub) {
    count = Math.max(
      count,
      sub.totalAttempts || 0,
      sub.attemptNumber || 0,
      sub.attempts?.length || 0,
      1
    );
  }

  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SESSIONS);
      if (raw) {
        const sessions: RealTrainingSession[] = JSON.parse(raw);
        const sessionCount = sessions.filter(
          (s) => s.assignmentId === assignmentId && s.userId === studentId
        ).length;
        count = Math.max(count, sessionCount);
      }
    } catch {}
  }

  return count;
}

export function submitAssignmentResult(assignmentId: string, submission: AssignmentSubmission): void {
  const list = getInitialAssignments();
  const idx = list.findIndex((a) => a.id === assignmentId);
  if (idx !== -1) {
    const existingSubs = list[idx].submissions || [];
    const subIdx = existingSubs.findIndex((s) => s.studentId === submission.studentId);

    const makeSnapshot = (
      s: AssignmentSubmission,
      attemptNumber: number
    ): AssignmentAttemptRecord => ({
      attemptNumber,
      score: s.score,
      totalQuestions: s.totalQuestions,
      correctAnswers: s.correctAnswers,
      wrongAnswers: s.wrongAnswers,
      unansweredCount: s.unansweredCount,
      accuracy: s.accuracy,
      durationSeconds: s.durationSeconds,
      avgSecondsPerQuestion: s.avgSecondsPerQuestion,
      ruleBreakdown: s.ruleBreakdown,
      questionDetails: s.questionDetails,
      completedAt: s.completedAt,
    });

    if (subIdx >= 0) {
      // Preserve full attempt history & always record Attempt 2, Attempt 3, ... prominently
      const prev = existingSubs[subIdx];
      const prevAttempts: AssignmentAttemptRecord[] =
        prev.attempts && prev.attempts.length > 0
          ? [...prev.attempts]
          : [makeSnapshot(prev, Math.max(1, prev.attemptNumber || 1))];

      const nextAttemptNumber = Math.max(
        submission.attemptNumber || 0,
        prevAttempts.length + 1
      );
      const nextAttempts = [...prevAttempts, makeSnapshot(submission, nextAttemptNumber)];

      existingSubs[subIdx] = {
        ...prev,
        ...submission,
        attemptNumber: nextAttemptNumber,
        totalAttempts: nextAttempts.length,
        attempts: nextAttempts,
      };
    } else {
      const attemptNum = Math.max(1, submission.attemptNumber || 1);
      const attempts =
        submission.attempts && submission.attempts.length > 0
          ? submission.attempts
          : [makeSnapshot(submission, attemptNum)];
      existingSubs.push({
        ...submission,
        attemptNumber: attemptNum,
        totalAttempts: attempts.length,
        attempts,
      });
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

  // Also sync submission to cloud assignment_submissions table if available
  const supabase = getSupabaseClient();
  if (supabase) {
    supabase
      .from("assignment_submissions")
      .upsert(
        [
          {
            assignment_id: assignmentId,
            student_id: submission.studentId,
            student_name: submission.studentName,
            governorate: submission.governorate || null,
            score: submission.score,
            total_questions: submission.totalQuestions,
            correct_answers: submission.correctAnswers,
            accuracy: submission.accuracy,
            duration_seconds: submission.durationSeconds,
            completed_at: submission.completedAt,
          },
        ],
        { onConflict: "assignment_id,student_id" }
      )
      .then(() => {}, () => {});
  }
}

export function matchesAssignmentTarget(
  a: PlatformAssignment,
  profile: ExtendedUserProfile
): boolean {
  const evalSub = evaluateSubscription(profile.subscription);
  if (a.targetStudentIds && a.targetStudentIds.length > 0) {
    return a.targetStudentIds.includes(profile.id);
  }
  if (a.targetType === "all_students") return true;
  if (a.targetType === "active_subscribers") return evalSub.isActive;
  if (a.targetType === "specific_student") return a.targetValue === profile.id;
  if (a.targetType === "trainer_students") {
    return (
      !profile.trainerId ||
      profile.trainerId === a.creatorId ||
      a.creatorId === "trainer-qatada"
    );
  }
  if (a.targetType === "by_governorate") {
    return Boolean(profile.governorate && a.targetValue === profile.governorate);
  }
  if (a.targetType === "by_level") {
    return Boolean(
      a.targetValue &&
        (profile.currentLevel.includes(a.targetValue) ||
          a.targetValue.includes(profile.currentLevel))
    );
  }
  return true;
}

export function getStudentAssignments(profile: ExtendedUserProfile): {
  adminCompetitions: PlatformAssignment[];
  trainerHomeworks: PlatformAssignment[];
} {
  const all = getInitialAssignments().filter((a) => a.isActive);
  const filtered = all.filter((a) => matchesAssignmentTarget(a, profile));
  return {
    adminCompetitions: filtered.filter(
      (a) => a.kind === "admin_competition" || a.kind === "admin_challenge"
    ),
    trainerHomeworks: filtered.filter((a) => a.kind === "trainer_homework"),
  };
}

export function getDismissedCompetitionNotificationIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DISMISSED_COMP_NOTIFS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function dismissCompetitionNotification(assignmentId: string): void {
  if (typeof window === "undefined") return;
  try {
    const existing = getDismissedCompetitionNotificationIds();
    if (!existing.includes(assignmentId)) {
      localStorage.setItem(
        STORAGE_KEYS.DISMISSED_COMP_NOTIFS,
        JSON.stringify([...existing, assignmentId].slice(-100))
      );
    }
  } catch {}
}

export function getPendingCompetitionNotifications(
  profile: ExtendedUserProfile
): PlatformAssignment[] {
  const dismissed = new Set(getDismissedCompetitionNotificationIds());
  const all = getInitialAssignments().filter(
    (a) => a.isActive && a.notifyStudents !== false && !dismissed.has(a.id)
  );
  return all.filter((a) => {
    // Don't notify creator about their own competition
    if (a.creatorId === profile.id) return false;
    // Skip if student already submitted a result for this competition
    if ((a.submissions || []).some((s) => s.studentId === profile.id)) return false;
    return matchesAssignmentTarget(a, profile);
  });
}

export function getVerifiedTrainersForDirectory(): ExtendedUserProfile[] {
  const all = getAllExtendedProfiles();
  return all.filter((p) => {
    if (p.role !== "trainer" && p.id !== "trainer-qatada") return false;
    const evalSub = evaluateSubscription(p.subscription);
    return (p.isVerifiedTrainer || evalSub.isActive) && p.showInDirectory !== false;
  });
}

export interface ApprovedSchoolDirectoryEntry {
  id: string;
  name: string;
  phone: string;
  country: string;
  governorate: string;
  address: string;
  curriculumStage: string;
  bio: string;
  logoUrl?: string | null;
}

export async function fetchApprovedDirectoryFromCloud(): Promise<{
  trainers: ExtendedUserProfile[];
  schools: ApprovedSchoolDirectoryEntry[];
}> {
  const localTrainers = getVerifiedTrainersForDirectory();
  const schools: ApprovedSchoolDirectoryEntry[] = [];
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { trainers: localTrainers, schools };
  }

  try {
    const [{ data: tApps }, { data: sApps }] = await Promise.all([
      supabase
        .from("trainer_applications")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false }),
      supabase
        .from("school_applications")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false }),
    ]);

    const mergedTrainers = [...localTrainers];
    if (tApps && tApps.length > 0) {
      for (const app of tApps) {
        const cleanPh = unpackProfilePhoneColumn(app.phone).cleanPhone;
        const alreadyIn = mergedTrainers.some(
          (t) =>
            t.id === app.id ||
            (cleanPh && t.phone === cleanPh) ||
            t.name.trim() === String(app.name || "").trim()
        );
        if (!alreadyIn) {
          const item: ExtendedUserProfile = {
            id: `cloud_tr_${app.id}`,
            memberCode: getUserMembershipCode(String(app.id)),
            email: app.email || "",
            name: app.name,
            role: "trainer",
            phone: cleanPh,
            country: app.country || "العراق",
            governorate: app.governorate || "العراق",
            avatarUrl: app.photo_url || undefined,
            trainerTitle: "مدرب حساب ذهني وسوروبان معتمد",
            bio: app.bio || "",
            isVerifiedTrainer: true,
            showInDirectory: true,
            subscription: {
              plan: "yearly_100k",
              planLabel: "مدرب معتمد في الدليل",
              priceIqd: app.annual_fee_iqd || 100000,
              status: "active",
            },
            totalExercises: 0,
            totalQuestionsSolved: 0,
            correctAnswers: 0,
            wrongAnswers: 0,
            accuracyRate: 100,
            points: 0,
            streakDays: 1,
            currentLevel: "مدرب معتمد",
            lastActivity: app.updated_at || app.created_at,
            createdAt: app.created_at,
          };
          mergedTrainers.push(item);
        }
      }
    }

    if (sApps && sApps.length > 0) {
      for (const s of sApps) {
        schools.push({
          id: String(s.id),
          name: String(s.name || ""),
          phone: unpackProfilePhoneColumn(s.phone).cleanPhone || String(s.phone || ""),
          country: String(s.country || "العراق"),
          governorate: String(s.governorate || ""),
          address: String(s.address || `${s.country || "العراق"} — ${s.governorate || ""}`),
          curriculumStage: String(s.curriculum_stage || "المستوى التمهيدي والمستوى الأول"),
          bio: String(s.bio || ""),
          logoUrl: s.logo_url || null,
        });
      }
    }

    return { trainers: mergedTrainers, schools };
  } catch (err) {
    console.warn("Failed fetching cloud directory:", err);
    return { trainers: localTrainers, schools };
  }
}

export async function submitTrainerDirectoryCardToCloud(params: {
  name: string;
  phone: string;
  email?: string;
  country: string;
  governorate: string;
  trainerTitle?: string;
  centerOrSchool?: string;
  bio: string;
  photoUrl?: string;
  annualFeeIqd?: number;
}): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: false, error: "الاتصال بقاعدة البيانات غير متاح حالياً." };
  }

  try {
    const richBio = [
      params.trainerTitle ? `اللقب التدريبي: ${params.trainerTitle}` : "",
      params.centerOrSchool ? `المركز / المدرسة: ${params.centerOrSchool}` : "",
      params.bio,
    ]
      .filter(Boolean)
      .join(" — ");

    const { error } = await supabase.from("trainer_applications").insert([
      {
        name: params.name.trim(),
        phone: params.phone.trim(),
        email: params.email?.trim() || null,
        country: params.country || "العراق",
        governorate: params.governorate || "بغداد",
        bio: richBio || "مدرب حساب ذهني وسوروبان",
        photo_url: params.photoUrl || null,
        annual_fee_iqd: params.annualFeeIqd || 25000,
        status: "pending",
      },
    ]);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (e: unknown) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "تعذر إرسال طلب الإدراج.",
    };
  }
}

export async function submitSchoolDirectoryCardToCloud(params: {
  name: string;
  phone: string;
  email?: string;
  country: string;
  governorate: string;
  address: string;
  curriculumStage: string;
  bio: string;
  logoUrl?: string;
}): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: false, error: "الاتصال بقاعدة البيانات غير متاح حالياً." };
  }

  try {
    const { error } = await supabase.from("school_applications").insert([
      {
        name: params.name.trim(),
        phone: params.phone.trim(),
        email: params.email?.trim() || null,
        country: params.country || "العراق",
        governorate: params.governorate || "بغداد",
        address: params.address.trim() || `${params.country} — ${params.governorate}`,
        curriculum_stage: params.curriculumStage.trim() || "جميع المراحل الدراسية",
        bio: params.bio.trim() || "مؤسسة تعليمية معتمدة لبرنامج العقل الخارق.",
        logo_url: params.logoUrl || null,
        annual_fee_iqd: 150000,
        status: "pending",
      },
    ]);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (e: unknown) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "تعذر إرسال طلب المدرسة.",
    };
  }
}

export async function linkStudentToTrainerByCodeOrPhone(
  trainerId: string,
  trainerName: string,
  query: string
): Promise<{ success: boolean; studentName?: string; message: string }> {
  const q = query.trim();
  if (!q) {
    return { success: false, message: "يرجى إدخال معرّف الطالب (مثل SM-XXXX) أو اسمه أو رقم هاتفه." };
  }

  const map = getInitialProfiles();
  const normalizedQ = q.toUpperCase();

  let matched: ExtendedUserProfile | undefined = Object.values(map).find((p) => {
    const code = (p.memberCode || getUserMembershipCode(p.id)).toUpperCase();
    return (
      code === normalizedQ ||
      code.replace("SM-", "") === normalizedQ ||
      (p.phone && p.phone.includes(q)) ||
      p.name.trim().toLowerCase() === q.toLowerCase()
    );
  });

  if (!matched) {
    // If student is on another device and trainer enters their name/code, create a linked student entry for tracking!
    const syntheticId = `student_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const isCode = normalizedQ.startsWith("SM-");
    const isPhone = /^[0-9+]+$/.test(q);
    matched = {
      id: syntheticId,
      memberCode: isCode ? normalizedQ : getUserMembershipCode(syntheticId),
      email: "",
      name: isCode ? `طالب (${normalizedQ})` : isPhone ? `طالب (${q})` : q,
      role: "student",
      phone: isPhone ? q : "",
      country: "العراق",
      governorate: "",
      trainerId,
      trainerName,
      subscription: {
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
      currentLevel: "المستوى الأول",
      lastActivity: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
  } else {
    matched.trainerId = trainerId;
    matched.trainerName = trainerName;
  }

  await saveExtendedProfile(matched);
  return {
    success: true,
    studentName: matched.name,
    message: `✅ تم إرسال طلب الربط مع الطالب (${matched.name} - المعرّف: ${matched.memberCode || getUserMembershipCode(matched.id)}) بنجاح! بانتظار موافقة الطالب.`,
  };
}

// =========================================================================
// TRAINER-STUDENT MUTUAL TWO-WAY APPROVAL SYSTEM & PERMISSIONS
// =========================================================================

export interface TrainerStudentLink {
  id: string;
  trainerId: string;
  trainerName: string;
  trainerCode?: string;
  trainerAvatar?: string;
  trainerPhone?: string;
  studentId: string;
  studentName: string;
  studentCode?: string;
  studentEmail?: string;
  studentAvatar?: string;
  status: "pending_student_approval" | "pending_trainer_approval" | "accepted" | "rejected";
  requestedBy: "trainer" | "student";
  createdAt: string;
  updatedAt: string;
}

export interface FeatureAccessDecision {
  allowed: boolean;
  reason?:
    | "trainer_unlimited"
    | "admin_unlimited"
    | "pro_student_unlimited"
    | "free_trial_available"
    | "free_trial_exhausted"
    | "locked_feature";
  message?: string;
  isLocked?: boolean;
}

/**
 * فحص صلاحيات الأقسام والفعاليات داخل المنصة بدقة:
 * - المدرب والمدير: كل شيء متاح 100% بدون أي قيد أو طلب اشتراك.
 * - الطالب المشترك: كل شيء متاح 100%.
 * - الحساب المجاني / الزائر:
 *     - محاكي المسابقة: متاح مرة واحدة كل شهر لمدة 10 دقائق أو 100 سؤال.
 *     - تحدي البالونات: مقفل تماماً ومخصص للمشتركين والمدربين فقط.
 */
export function checkFeatureAccess(params: {
  role?: string;
  subscriptionStatus?: SubscriptionStatus;
  feature: "competition" | "balloon" | "teams_battle" | "flash_anzan" | "abacus" | "homework";
  userId?: string;
}): FeatureAccessDecision {
  const { role, subscriptionStatus, feature, userId } = params;

  // 1. المدرب والمدير: وصول كامل بلا حدود ولا يطلب منه أي اشتراك آخر
  if (role === "trainer" || role === "admin") {
    return {
      allowed: true,
      reason: role === "trainer" ? "trainer_unlimited" : "admin_unlimited",
    };
  }

  // 2. الطالب المشترك الفعّال: متاح له كل شيء
  if (subscriptionStatus === "active") {
    return { allowed: true, reason: "pro_student_unlimited" };
  }

  // 3. الحساب المجاني / الزائر
  if (feature === "balloon") {
    return {
      allowed: false,
      isLocked: true,
      reason: "locked_feature",
      message: "تحدي البالونات الذكية مخصص حصرياً للطلاب المشتركين والمدربين المعتمدين 🎈",
    };
  }

  if (feature === "competition") {
    if (!userId) {
      return {
        allowed: true,
        reason: "free_trial_available",
        message: "تجربة شهرية مجانية (10 دقائق أو 100 سؤال كحد أقصى).",
      };
    }
    const trial = getMonthlyTrialStatus(userId);
    if (!trial.hasTrialRemaining) {
      return {
        allowed: false,
        isLocked: true,
        reason: "free_trial_exhausted",
        message:
          "لقد استنفدت جلستك التجريبية المجانية لهذا الشهر (100 سؤال أو 10 دقائق). اشترك الآن لتكرار المسابقة والمنافسة بلا حدود!",
      };
    }
    return {
      allowed: true,
      reason: "free_trial_available",
      message: `متبقي من جلستك المجانية لهذا الشهر: ${trial.questionsRemaining} سؤالاً (حد أقصى ${trial.maxMinutesAllowed} دقائق).`,
    };
  }

  return { allowed: true };
}

export function getStoredTrainerStudentLinks(): TrainerStudentLink[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TRAINER_LINKS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveStoredTrainerStudentLinks(links: TrainerStudentLink[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.TRAINER_LINKS, JSON.stringify(links));
  } catch (e) {
    console.error("Failed saving trainer student links:", e);
  }
}

/**
 * إرسال طلب ربط جديد بين المدرب والطالب:
 * - إذا أرسل المدرب الطلب: تصبح الحالة "pending_student_approval" (بانتظار موافقة الطالب).
 * - إذا أرسل الطالب الطلب: تصبح الحالة "pending_trainer_approval" (بانتظار موافقة المدرب).
 */
export async function sendTrainerStudentLinkRequest(params: {
  trainerId: string;
  trainerName: string;
  trainerCode?: string;
  trainerPhone?: string;
  studentId: string;
  studentName: string;
  studentCode?: string;
  studentEmail?: string;
  requestedBy: "trainer" | "student";
}): Promise<{ success: boolean; message: string; link?: TrainerStudentLink }> {
  const links = getStoredTrainerStudentLinks();

  // Check if link already exists between them
  const existing = links.find(
    (l) => l.trainerId === params.trainerId && l.studentId === params.studentId
  );

  if (existing) {
    if (existing.status === "accepted") {
      return {
        success: false,
        message: `الارتباط بين المدرب (${params.trainerName}) والطالب (${params.studentName}) معتمد بالفعل!`,
      };
    }
    if (existing.status === "pending_student_approval" || existing.status === "pending_trainer_approval") {
      return {
        success: false,
        message: "هناك طلب ارتباط معلق بالفعل بينكما بانتظار الموافقة الرسمية.",
      };
    }
  }

  const initialStatus =
    params.requestedBy === "trainer"
      ? "pending_student_approval"
      : "pending_trainer_approval";

  const newLink: TrainerStudentLink = {
    id: `link_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    trainerId: params.trainerId,
    trainerName: params.trainerName,
    trainerCode: params.trainerCode,
    trainerPhone: params.trainerPhone,
    studentId: params.studentId,
    studentName: params.studentName,
    studentCode: params.studentCode,
    studentEmail: params.studentEmail,
    status: initialStatus,
    requestedBy: params.requestedBy,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const updated = [newLink, ...links.filter((l) => !(l.trainerId === params.trainerId && l.studentId === params.studentId))];
  saveStoredTrainerStudentLinks(updated);

  const targetName = params.requestedBy === "trainer" ? params.studentName : params.trainerName;
  return {
    success: true,
    message: `✅ تم إرسال طلب الارتباط إلى (${targetName}) بنجاح! سيكون الارتباط رسمياً فور الموافقة.`,
    link: newLink,
  };
}

/**
 * الرد على طلب الارتباط (قبول أو رفض من الطالب أو المدرب)
 */
export async function respondToTrainerStudentLink(params: {
  linkId: string;
  accept: boolean;
  responderRole: "student" | "trainer";
}): Promise<{ success: boolean; message: string }> {
  const links = getStoredTrainerStudentLinks();
  const index = links.findIndex((l) => l.id === params.linkId);

  if (index === -1) {
    return { success: false, message: "طلب الارتباط غير موجود." };
  }

  const link = links[index];
  const newStatus = params.accept ? "accepted" : "rejected";

  link.status = newStatus;
  link.updatedAt = new Date().toISOString();
  links[index] = link;
  saveStoredTrainerStudentLinks(links);

  if (params.accept) {
    // Update student's active trainer in their profile
    const studentProf = await getExtendedProfile(link.studentId);
    if (studentProf) {
      studentProf.trainerId = link.trainerId;
      studentProf.trainerName = link.trainerName;
      studentProf.trainerCode = link.trainerCode;
      await saveExtendedProfile(studentProf);
    }

    return {
      success: true,
      message: `🎉 تم قبول طلب الارتباط بنجاح! تم اعتماد المدرب (${link.trainerName}) مع الطالب (${link.studentName}).`,
    };
  } else {
    return {
      success: true,
      message: `تم رفض طلب الارتباط.`,
    };
  }
}

/**
 * الحصول على قائمة الطلبات المعلقة للطالب
 */
export function getPendingLinksForStudent(studentId: string): TrainerStudentLink[] {
  const links = getStoredTrainerStudentLinks();
  return links.filter(
    (l) => l.studentId === studentId && l.status === "pending_student_approval"
  );
}

/**
 * الحصول على قائمة الطلبات المعلقة للمدرب
 */
export function getPendingLinksForTrainer(trainerId: string): TrainerStudentLink[] {
  const links = getStoredTrainerStudentLinks();
  return links.filter(
    (l) => l.trainerId === trainerId && l.status === "pending_trainer_approval"
  );
}

/**
 * الحصول على المدرب المعتمد حالياً للطالب
 */
export function getStudentAcceptedTrainer(studentId: string): TrainerStudentLink | null {
  const links = getStoredTrainerStudentLinks();
  return links.find((l) => l.studentId === studentId && l.status === "accepted") || null;
}

/**
 * الحصول على قائمة الطلاب المعتمدين للمدرب
 */
export function getTrainerAcceptedStudents(trainerId: string): TrainerStudentLink[] {
  const links = getStoredTrainerStudentLinks();
  return links.filter((l) => l.trainerId === trainerId && l.status === "accepted");
}

