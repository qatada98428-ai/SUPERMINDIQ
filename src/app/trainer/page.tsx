"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Users,
  Award,
  Search,
  ShieldCheck,
  MessageCircle,
  Trophy,
  Plus,
  Trash2,
  ClipboardList,
  Sparkles,
  Zap,
  Calculator,
  BookOpen,
  Swords,
  MapPin,
  Calendar,
  Camera,
  Edit3,
  CheckCircle2,
  AlertTriangle,
  Crown,
  Share2,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getWhatsAppLink } from "@/lib/constants";
import {
  ExtendedUserProfile,
  PlatformAssignment,
  TrainerAchievement,
  getExtendedProfile,
  getAllExtendedProfiles,
  saveExtendedProfile,
  evaluateSubscription,
  getAllAssignments,
  createPlatformAssignment,
  deletePlatformAssignment,
  syncExtendedProfileFromSupabase,
  syncAllAssignmentsSubmissionsFromCloud,
  buildShareableAssignmentPath,
  SUBSCRIPTION_PLANS,
} from "@/lib/platform-store";
import ProfileEditorModal from "@/components/profile/ProfileEditorModal";

export default function TrainerDashboardPage() {
  const { user, profile: authProfile } = useAuth();
  const activeTrainerId = user?.id || "trainer-qatada";

  const [trainerProfile, setTrainerProfile] = useState<ExtendedUserProfile | null>(null);
  const [studentsList, setStudentsList] = useState<ExtendedUserProfile[]>([]);
  const [homeworks, setHomeworks] = useState<PlatformAssignment[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<
    "students" | "homeworks" | "achievements" | "packages"
  >("homeworks");

  // Modals
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showCreateHwModal, setShowCreateHwModal] = useState(false);
  const [showAddAchievementModal, setShowAddAchievementModal] = useState(false);
  const [selectedHwForGrades, setSelectedHwForGrades] = useState<PlatformAssignment | null>(null);

  // New Homework Form State
  const [hwTitle, setHwTitle] = useState("");
  const [hwDesc, setHwDesc] = useState("");
  const [hwExerciseType, setHwExerciseType] = useState<"competition" | "flash_anzan" | "abacus">(
    "competition"
  );
  const [hwRulesLevel, setHwRulesLevel] = useState<"simple" | "complex_5" | "complex_10" | "general">(
    "simple"
  );
  const hwDigitPlace: "units" | "tens" | "hundreds" = "units";
  const [hwQuestionsCount, setHwQuestionsCount] = useState(20);
  const [hwTimeMinutes, setHwTimeMinutes] = useState(5);
  const [hwAnswerMode, setHwAnswerMode] = useState<"typing" | "choices">("typing");
  const [hwChoicesCount, setHwChoicesCount] = useState<2 | 3 | 4 | 5>(4);
  const [hwTargetStudent, setHwTargetStudent] = useState<string>("all");

  // New Achievement Form State
  const [achTitle, setAchTitle] = useState("");
  const [achYear, setAchYear] = useState("2026");
  const [achCategory, setAchCategory] = useState<"trophy" | "students" | "certificate" | "medal">(
    "trophy"
  );
  const [achDesc, setAchDesc] = useState("");

  const loadTrainerData = useCallback(() => {
    const prof = getExtendedProfile(activeTrainerId, {
      email: user?.email || authProfile?.email || "qatada98@gmail.com",
      name: authProfile?.name || "الأستاذ قتادة كريم",
      role: "trainer",
      phone: authProfile?.phone,
    });
    if (prof.role === "student" && activeTrainerId !== "trainer-qatada") {
      prof.role = "trainer";
    }
    setTrainerProfile(prof);

    const allProfiles = getAllExtendedProfiles();
    const myStudents = allProfiles.filter(
      (p) =>
        p.role === "student" &&
        (!p.trainerId ||
          p.trainerId === activeTrainerId ||
          activeTrainerId === "trainer-qatada")
    );
    setStudentsList(myStudents);

    const allAssigns = getAllAssignments().filter(
      (a) =>
        a.kind === "trainer_homework" &&
        (a.creatorId === activeTrainerId || activeTrainerId === "trainer-qatada")
    );
    setHomeworks(allAssigns);
  }, [activeTrainerId, user?.email, authProfile]);

  useEffect(() => {
    loadTrainerData();
    if (activeTrainerId && !activeTrainerId.startsWith("trainer-")) {
      syncExtendedProfileFromSupabase(activeTrainerId).then((synced) => {
        if (synced) loadTrainerData();
      });
    }
    syncAllAssignmentsSubmissionsFromCloud().then(() => {
      loadTrainerData();
    });

    const handleUpdate = () => loadTrainerData();
    window.addEventListener("supermind:profile-updated", handleUpdate);
    window.addEventListener("supermind:assignments-updated", handleUpdate);
    return () => {
      window.removeEventListener("supermind:profile-updated", handleUpdate);
      window.removeEventListener("supermind:assignments-updated", handleUpdate);
    };
  }, [activeTrainerId, loadTrainerData]);

  if (!trainerProfile) return null;

  const subEval = evaluateSubscription(trainerProfile.subscription);
  const isVerified = Boolean(trainerProfile.isVerifiedTrainer || subEval.isActive);
  const displayName =
    trainerProfile.name && trainerProfile.name !== "بطل العقل الخارق"
      ? trainerProfile.name
      : "الأستاذ قتادة كريم";

  const filteredStudents = studentsList.filter(
    (st) =>
      st.name.includes(searchQuery) ||
      (st.governorate && st.governorate.includes(searchQuery)) ||
      st.currentLevel.includes(searchQuery)
  );

  const formatDateAr = (iso?: string) => {
    if (!iso) return "—";
    try {
      return new Date(iso).toLocaleDateString("ar-IQ", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return iso.slice(0, 10);
    }
  };

  const handleCreateHomework = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hwTitle.trim()) return;

    createPlatformAssignment({
      kind: "trainer_homework",
      title: hwTitle.trim(),
      description:
        hwDesc.trim() ||
        `واجب تدريبي جاهز من المدرب ${displayName} - يفتح مباشرة للحل بضغطة زر.`,
      creatorId: trainerProfile.id,
      creatorName: displayName,
      creatorRole: "trainer",
      targetType: hwTargetStudent === "all" ? "trainer_students" : "specific_student",
      targetValue: hwTargetStudent === "all" ? undefined : hwTargetStudent,
      exerciseType: hwExerciseType,
      rulesLevel: hwRulesLevel,
      allowSubtraction: true,
      digitPlace: hwDigitPlace,
      termsCount: 4,
      questionsCount: Math.max(1, Math.min(1000, hwQuestionsCount)),
      timeLimitMinutes: hwTimeMinutes,
      answerMode: hwAnswerMode,
      choicesCount: hwChoicesCount,
      isActive: true,
    });

    setHwTitle("");
    setHwDesc("");
    setShowCreateHwModal(false);
    loadTrainerData();
  };

  const handleAddAchievement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!achTitle.trim()) return;

    const newAch: TrainerAchievement = {
      id: `ach_${Date.now()}`,
      title: achTitle.trim(),
      year: achYear.trim() || "2026",
      category: achCategory,
      description: achDesc.trim(),
    };

    const updated = await saveExtendedProfile({
      ...trainerProfile,
      achievements: [newAch, ...(trainerProfile.achievements || [])],
    });
    setTrainerProfile(updated);
    setAchTitle("");
    setAchDesc("");
    setShowAddAchievementModal(false);
  };

  const handleDeleteAchievement = async (achId: string) => {
    const updated = await saveExtendedProfile({
      ...trainerProfile,
      achievements: (trainerProfile.achievements || []).filter((a) => a.id !== achId),
    });
    setTrainerProfile(updated);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7">
      {/* 1. Notification Banner for Trainer Subscription & Verification Benefits */}
      {!subEval.isActive && (
        <div className="p-5 rounded-3xl bg-gradient-to-l from-amber-500/20 via-amber-400/10 to-brand-500/10 border-2 border-amber-400/70 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow-md">
              <Crown className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                🌟 إشعار للمدرب: وثّق حسابك رسمياً وافتح كامل مميزات المنصة ودليل المدربين!
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                عند تفعيل اشتراك المدرب (شهري <span className="font-black text-amber-600 dark:text-amber-300">25,000 د.ع</span> | 3 أشهر <span className="font-black text-amber-600 dark:text-amber-300">50,000 د.ع</span> | سنوي <span className="font-black text-amber-600 dark:text-amber-300">100,000 د.ع</span>) تحصل على شارة التوثيق الرسمية، نشر صورتك وإنجازاتك في دليل المدربين المعتمدين، وإرسال الواجبات لطلابك بلا حدود.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-stretch lg:self-auto">
            <button
              type="button"
              onClick={() => setActiveTab("packages")}
              className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md"
            >
              اطلع على مميزات وباقات المدرب
            </button>
            <a
              href={getWhatsAppLink(
                `مرحباً إدارة منصة العقل الخارق، أنا المدرب (${displayName}) أرغب بتوثيق حسابي وتفعيل اشتراك المدرب المعتمد.`
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center gap-1.5 shadow-md"
            >
              <MessageCircle className="w-4 h-4" />
              <span>اضغط للتواصل مع إدارة المنصة</span>
            </a>
          </div>
        </div>
      )}

      {/* 3-Day Expiration Warning */}
      {subEval.isExpiringSoon && (
        <div className="p-4 rounded-3xl bg-rose-50 dark:bg-rose-950/50 border-2 border-rose-400 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0 animate-bounce" />
            <div className="text-xs sm:text-sm font-black text-rose-900 dark:text-rose-200">
              تنبيه: ينتهي اشتراك وتوثيق حساب المدرب الخاص بك خلال {subEval.daysRemaining} أيام ({formatDateAr(trainerProfile.subscription.endDate)}).
            </div>
          </div>
          <a
            href={getWhatsAppLink(
              `مرحباً إدارة منصة العقل الخارق، أنا المدرب (${displayName}) أرغب بتجديد اشتراك المدرب المعتمد.`
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-black text-xs shrink-0"
          >
            اضغط للتواصل مع إدارة المنصة للتجديد
          </a>
        </div>
      )}

      {/* 2. Top Trainer Welcome & Verified Digital Membership Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-6 sm:p-8 border border-slate-800 shadow-xl">
        <div className="absolute -top-10 left-10 w-80 h-80 bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Trainer Photo */}
            <div className="relative shrink-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden border-2 border-amber-400 shadow-lg bg-slate-800 flex items-center justify-center">
                {trainerProfile.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={trainerProfile.avatarUrl}
                    alt={displayName}
                    className="w-full h-full object-cover object-top"
                  />
                ) : (
                  <span className="text-4xl font-black text-amber-400">
                    {displayName.charAt(0)}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setShowProfileModal(true)}
                className="absolute -bottom-2 -right-2 px-2.5 py-1 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[10px] shadow-md flex items-center gap-1"
              >
                <Camera className="w-3 h-3" />
                <span>تعديل البروفايل</span>
              </button>
            </div>

            <div className="space-y-2.5">
              <div className="flex flex-wrap items-center gap-2">
                {isVerified ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-black border border-emerald-500/30">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>مدرب موثق ومعتمد في المنصة ✅</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
                    <span>بانتظار تفعيل وتوثيق الاشتراك</span>
                  </span>
                )}

                {trainerProfile.country && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 text-slate-200 text-xs font-bold">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    <span>
                      {trainerProfile.country}
                      {trainerProfile.governorate ? ` - ${trainerProfile.governorate}` : ""}
                    </span>
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black">
                أهلاً بالمدرب، {displayName} 🌟
              </h1>

              <div className="text-amber-400 text-sm sm:text-base font-bold flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-1.5">
                  <Award className="w-4 h-4" />
                  <span>{trainerProfile.trainerTitle || "مدرب حساب ذهني معتمد"}</span>
                </span>
                {trainerProfile.centerOrSchool && (
                  <span className="text-xs text-slate-300 bg-white/10 px-2.5 py-0.5 rounded-lg">
                    🏫 {trainerProfile.centerOrSchool}
                  </span>
                )}
              </div>

              {trainerProfile.bio && (
                <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
                  {trainerProfile.bio}
                </p>
              )}

              {/* Subscription Dates */}
              {subEval.isActive && (
                <div className="inline-flex flex-wrap items-center gap-3 px-3.5 py-1.5 rounded-xl bg-slate-800/90 border border-slate-700 text-xs text-emerald-300">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    <span>تاريخ الاشتراك: {formatDateAr(trainerProfile.subscription.startDate)}</span>
                  </span>
                  <span>|</span>
                  <span>ينتهي في: {formatDateAr(trainerProfile.subscription.endDate)}</span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-200 font-black">
                    متبقي {subEval.daysRemaining} يوم
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Digital Trainer ID & Quick Actions */}
          <div className="bg-slate-800/90 border border-amber-400/40 rounded-2xl p-4 sm:p-5 text-right min-w-[250px] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black text-amber-400 uppercase">
                بطاقة عضوية المدرب
              </span>
              <span className="font-mono text-xs bg-slate-900 px-2.5 py-0.5 rounded-lg text-emerald-400 font-bold">
                كود المدرب: {trainerProfile.trainerCode || "QK-100"}
              </span>
            </div>
            <div className="text-xs text-slate-300 space-y-1">
              <div>عدد الطلاب المرتبطين: <strong className="text-white">{studentsList.length} طالب</strong></div>
              <div>عدد الواجبات المصدرة: <strong className="text-white">{homeworks.length} واجب</strong></div>
              <div>الأوسمة والكؤوس: <strong className="text-amber-300">{(trainerProfile.achievements || []).length} إنجاز 🏆</strong></div>
            </div>
            <div className="pt-2 border-t border-slate-700 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowProfileModal(true)}
                className="flex-1 py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center justify-center gap-1"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>تعديل معلوماتي</span>
              </button>
              <Link
                href="/trainers"
                className="py-2 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black flex items-center gap-1"
              >
                <span>الدليل</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Trainer Quick Access to All Platform Tools (Same as Student + Teams Battle) */}
      <section className="space-y-3">
        <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <span>أدوات المدرب والتدريب الصفي المباشر</span>
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <Link
            href="/mental-arithmetic/learn"
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 transition-all flex items-center gap-3 shadow-sm"
          >
            <BookOpen className="w-6 h-6 text-emerald-500 shrink-0" />
            <div>
              <div className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">التعليم والقواعد</div>
              <div className="text-[10px] text-emerald-600 font-bold">شرح تفاعلي</div>
            </div>
          </Link>

          <Link
            href="/mental-arithmetic/abacus"
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-brand-500 transition-all flex items-center gap-3 shadow-sm"
          >
            <Calculator className="w-6 h-6 text-brand-600 shrink-0" />
            <div>
              <div className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">المعداد الحر</div>
              <div className="text-[10px] text-brand-600 font-bold">سوروبان تفاعلي</div>
            </div>
          </Link>

          <Link
            href="/mental-arithmetic/flash-anzan"
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500 transition-all flex items-center gap-3 shadow-sm"
          >
            <Zap className="w-6 h-6 text-amber-500 shrink-0" />
            <div>
              <div className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">فلاش أنزان</div>
              <div className="text-[10px] text-amber-600 font-bold">الوميض السريع</div>
            </div>
          </Link>

          <Link
            href="/mental-arithmetic/competition"
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-purple-500 transition-all flex items-center gap-3 shadow-sm"
          >
            <Trophy className="w-6 h-6 text-purple-600 shrink-0" />
            <div>
              <div className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">محاكي المسابقة</div>
              <div className="text-[10px] text-purple-600 font-bold">حتى 1000 سؤال</div>
            </div>
          </Link>

          <Link
            href="/mental-arithmetic/teams-battle"
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-rose-500 transition-all flex items-center gap-3 shadow-sm col-span-2 sm:col-span-1"
          >
            <Swords className="w-6 h-6 text-rose-500 shrink-0" />
            <div>
              <div className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">حلبة الفرق</div>
              <div className="text-[10px] text-rose-600 font-bold">منافسة صفية</div>
            </div>
          </Link>
        </div>
      </section>

      {/* 4. Navigation Tabs for Trainer Management */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        {[
          { id: "homeworks", label: "📝 قسم إعطاء الواجبات ودرجات الطلاب", icon: ClipboardList },
          { id: "students", label: `👥 متابعة تقدم طلابي (${studentsList.length})`, icon: Users },
          {
            id: "achievements",
            label: `🏆 كؤوس وإنجازات المدرب وطلابه (${(trainerProfile.achievements || []).length})`,
            icon: Trophy,
          },
          { id: "packages", label: "👑 مميزات وباقات توثيق المدرب", icon: Crown },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() =>
                setActiveTab(tab.id as "students" | "homeworks" | "achievements" | "packages")
              }
              className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black flex items-center gap-2 transition-all ${
                activeTab === tab.id
                  ? "bg-brand-600 text-white shadow-md shadow-brand-500/20"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: HOMEWORKS BUILDER & SUBMISSIONS */}
      {activeTab === "homeworks" && (
        <section className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                📝 إرسال واجب تدريبي جاهز لطلابك
              </h3>
              <p className="text-xs text-slate-500">
                حدد القاعدة وعدد الأسئلة والوقت، وسيظهر الواجب في واجهة كل طالب ليبدأ بحله فوراً بضغطة زر واحدة!
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowCreateHwModal(true)}
              className="px-6 py-3 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-black text-xs sm:text-sm shadow-lg shadow-brand-500/25 flex items-center gap-2 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>إعطاء واجب جديد للطلاب</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {homeworks.map((hw) => {
              const relSharePath = buildShareableAssignmentPath(hw);
              const shareUrl =
                typeof window !== "undefined"
                  ? `${window.location.origin}${relSharePath}`
                  : relSharePath;
              const whatsappShareHref = `https://wa.me/?text=${encodeURIComponent(
                `🌟 أبطال الحساب الذهني، إليكم واجب اليوم من (${displayName}):\n📌 ${hw.title}\n🔢 عدد الأسئلة: ${hw.questionsCount} سؤال | الوقت: ${hw.timeLimitMinutes} دقائق\n🚀 اضغط هنا لبدء الحل مباشرة بضغطة زر:\n${shareUrl}`
              )}`;

              return (
                <div
                  key={hw.id}
                  className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between gap-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 font-black text-xs">
                        {hw.questionsCount} سؤال • {hw.timeLimitMinutes} دقائق
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-emerald-600">
                          أنجزه: {hw.submissions?.length || 0} طالب
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            deletePlatformAssignment(hw.id);
                            loadTrainerData();
                          }}
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                          title="حذف الواجب"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                      {hw.title}
                    </h4>
                    <p className="text-xs text-slate-500">{hw.description}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedHwForGrades(hw)}
                      className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-white font-bold text-xs"
                    >
                      عرض كشف الدرجات ({hw.submissions?.length || 0})
                    </button>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (typeof navigator !== "undefined" && navigator.clipboard) {
                            navigator.clipboard.writeText(shareUrl);
                            alert("تم نسخ رابط الواجب الذكي! يمكنك لصقه في واتساب أو تيليجرام لطلابك.");
                          }
                        }}
                        className="px-3 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 font-black text-xs"
                      >
                        🔗 نسخ رابط الواجب
                      </button>
                      <a
                        href={whatsappShareHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>إرسال لكروب الواتساب</span>
                      </a>
                      <Link
                        href={relSharePath}
                        className="px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs"
                      >
                        معاينة الواجب
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* TAB 2: REAL STUDENTS TRACKING */}
      {activeTab === "students" && (
        <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                👥 قائمة طلابك وتقدمهم الفعلي
              </h3>
              <p className="text-xs text-slate-500">
                تابع دقة كل طالب وعدد التمارين المحلولة وتواصل مع ولي أمره عبر الواتساب بضغطة زر
              </p>
            </div>

            <div className="relative sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ابحث باسم الطالب أو المحافظة..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-10 pl-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {filteredStudents.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-800/40 text-center space-y-2">
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                لا يوجد طلاب مسجلون مطابقون للبحث حالياً.
              </p>
              <p className="text-xs text-slate-500">
                عندما يسجل طلابك في المنصة ويختارون اسمك كمدرب مشرف، سيظهرون هنا تلقائياً مع إحصائياتهم الحقيقية!
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-xs text-slate-400 font-bold">
                    <th className="py-3 px-4">الطالب</th>
                    <th className="py-3 px-4">الدولة والمحافظة</th>
                    <th className="py-3 px-4">المستوى الحالي</th>
                    <th className="py-3 px-4">التمارين والأسئلة</th>
                    <th className="py-3 px-4">الدقة الحقيقية</th>
                    <th className="py-3 px-4">تواصل وتقرير ولي الأمر</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                  {filteredStudents.map((st) => {
                    const parentReportLink = st.phone
                      ? getWhatsAppLink(
                          `السلام عليكم ولي أمر البطل (${st.name})، تقرير تقدم الطالب في منصة العقل الخارق مع (${displayName}):\n✅ التمارين المنجزة: ${st.totalExercises}\n🎯 إجمالي الأسئلة المحلولة: ${st.totalQuestionsSolved}\n📊 نسبة الدقة: ${st.accuracyRate}%\n🏆 نقاط التميز: ${st.points} نقطة.\nبارك الله بجهوده المستمرة!`,
                          st.phone
                        )
                      : null;

                    return (
                      <tr key={st.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl overflow-hidden bg-brand-100 dark:bg-slate-700 flex items-center justify-center font-black text-brand-700 shrink-0">
                              {st.avatarUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={st.avatarUrl} alt={st.name} className="w-full h-full object-cover" />
                              ) : (
                                st.name.charAt(0)
                              )}
                            </div>
                            <div>
                              <div className="font-black text-slate-900 dark:text-white">{st.name}</div>
                              <div className="text-[11px] text-slate-400">{st.ageOrGrade || "بطل السوروبان"}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-xs font-bold text-slate-600 dark:text-slate-300">
                          {st.country} {st.governorate ? `- ${st.governorate}` : ""}
                        </td>
                        <td className="py-3.5 px-4 text-xs font-semibold text-brand-600 dark:text-brand-400">
                          {st.currentLevel}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-xs font-bold">
                          {st.totalExercises} تمرين ({st.totalQuestionsSolved} سؤال)
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 font-black font-mono text-xs">
                            {st.accuracyRate}%
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          {parentReportLink ? (
                            <a
                              href={parentReportLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>إرسال تقرير لولي الأمر</span>
                            </a>
                          ) : (
                            <span className="text-xs text-slate-400">لم يضف رقم واتساب بعد</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* TAB 3: TRAINER ACHIEVEMENTS & TROPHIES */}
      {activeTab === "achievements" && (
        <section className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                <span>🏆 كؤوس وإنجازات المدرب وطلابه</span>
              </h3>
              <p className="text-xs text-slate-500">
                أضف إنجازاتك والبطولات التي حققتها أنت أو طلابك لتظهر بشكل كؤوس ذهبية في صفحتك وفي دليل المدربين المعتمدين!
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddAchievementModal(true)}
              className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm shadow-md flex items-center gap-2 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة كأس أو إنجاز جديد 🏆</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(trainerProfile.achievements || []).map((ach) => (
              <div
                key={ach.id}
                className="p-5 rounded-3xl bg-gradient-to-br from-amber-50/70 via-white to-amber-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-amber-950/20 border border-amber-300/70 dark:border-amber-700/50 flex items-start justify-between gap-4 shadow-sm"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-2xl shrink-0">
                    {ach.category === "trophy"
                      ? "🏆"
                      : ach.category === "students"
                      ? "🥇"
                      : ach.category === "certificate"
                      ? "📜"
                      : "🎖️"}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px]">
                        عام {ach.year}
                      </span>
                    </div>
                    <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                      {ach.title}
                    </h4>
                    {ach.description && (
                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        {ach.description}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteAchievement(ach.id)}
                  className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* TAB 4: TRAINER SUBSCRIPTION PACKAGES */}
      {activeTab === "packages" && (
        <section className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SUBSCRIPTION_PLANS.trainer.map((plan) => (
              <div
                key={plan.id}
                className={`rounded-3xl p-6 bg-white dark:bg-slate-900 border-2 flex flex-col justify-between shadow-sm ${
                  plan.popular
                    ? "border-amber-500 ring-2 ring-amber-400/20"
                    : "border-slate-200 dark:border-slate-800"
                }`}
              >
                <div className="space-y-3">
                  <span className="inline-block px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 font-black text-xs">
                    {plan.badge}
                  </span>
                  <h4 className="text-xl font-black text-slate-900 dark:text-white">
                    {plan.name}
                  </h4>
                  <div className="text-3xl font-black text-brand-600 dark:text-amber-400 font-mono">
                    {plan.priceFormatted}
                  </div>
                  <ul className="space-y-2.5 pt-3 text-xs text-slate-600 dark:text-slate-300">
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
                    `مرحباً إدارة منصة العقل الخارق، أنا المدرب (${displayName}) من (${trainerProfile.country} - ${trainerProfile.governorate}) أود الاشتراك وتوثيق حسابي ضمن (${plan.name} - بسعر ${plan.priceFormatted}).`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>اضغط للتواصل مع إدارة المنصة للتفعيل</span>
                </a>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Modal: Create Homework */}
      {showCreateHwModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 my-8 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                📝 إنشاء واجب تدريبي جاهز للطلاب
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateHwModal(false)}
                className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold"
              >
                إغلاق ✕
              </button>
            </div>

            <form onSubmit={handleCreateHomework} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  عنوان الواجب *
                </label>
                <input
                  type="text"
                  required
                  value={hwTitle}
                  onChange={(e) => setHwTitle(e.target.value)}
                  placeholder="مثال: واجب اليوم - الجمع والطرح البسيط (آحاد وعشرات)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    نوع التمرين
                  </label>
                  <select
                    value={hwExerciseType}
                    onChange={(e) =>
                      setHwExerciseType(e.target.value as "competition" | "flash_anzan" | "abacus")
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                  >
                    <option value="competition">محاكي المسابقة (ورقة أسئلة / سؤال بسؤال)</option>
                    <option value="flash_anzan">الفلاش أنزان السريع</option>
                    <option value="abacus">تمارين عداد السوروبان</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    القاعدة الحسابية
                  </label>
                  <select
                    value={hwRulesLevel}
                    onChange={(e) =>
                      setHwRulesLevel(
                        e.target.value as "simple" | "complex_5" | "complex_10" | "general"
                      )
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                  >
                    <option value="simple">الجمع والطرح البسيط</option>
                    <option value="complex_5">أصدقاء الرقم 5 (مركب 5)</option>
                    <option value="complex_10">أصدقاء الرقم 10 (مركب 10)</option>
                    <option value="general">تحدي شامل</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    عدد الأسئلة (1 إلى 1000)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={1000}
                    value={hwQuestionsCount}
                    onChange={(e) => setHwQuestionsCount(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    الوقت المحدد (بالدقائق)
                  </label>
                  <select
                    value={hwTimeMinutes}
                    onChange={(e) => setHwTimeMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                  >
                    {[5, 7, 10, 15, 20, 25, 30].map((m) => (
                      <option key={m} value={m}>
                        {m} دقائق
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    طريقة الإجابة
                  </label>
                  <select
                    value={hwAnswerMode}
                    onChange={(e) => setHwAnswerMode(e.target.value as "typing" | "choices")}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                  >
                    <option value="typing">كتابة الجواب</option>
                    <option value="choices">اختيارات متعددة</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    المستهدفون بالواجب
                  </label>
                  <select
                    value={hwTargetStudent}
                    onChange={(e) => setHwTargetStudent(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                  >
                    <option value="all">جميع طلابي</option>
                    {studentsList.map((st) => (
                      <option key={st.id} value={st.id}>
                        طالب محدد: {st.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {hwAnswerMode === "choices" && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    عدد الاختيارات لكل سؤال:
                  </label>
                  <div className="flex gap-2">
                    {([2, 3, 4, 5] as const).map((cnt) => (
                      <button
                        key={cnt}
                        type="button"
                        onClick={() => setHwChoicesCount(cnt)}
                        className={`flex-1 py-2 rounded-xl text-xs font-black border ${
                          hwChoicesCount === cnt
                            ? "bg-brand-600 text-white border-brand-600"
                            : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                        }`}
                      >
                        {cnt} اختيارات
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateHwModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-black shadow-md"
                >
                  نشر وإرسال الواجب للطلاب 🚀
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Achievement / Trophy */}
      {showAddAchievementModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              🏆 إضافة كأس أو إنجاز جديد للمدرب وطلابه
            </h3>
            <form onSubmit={handleAddAchievement} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold block mb-1">عنوان الإنجاز أو البطولة *</label>
                <input
                  type="text"
                  required
                  value={achTitle}
                  onChange={(e) => setAchTitle(e.target.value)}
                  placeholder="مثال: المركز الأول في البطولة الوطنية للحساب الذهني"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold block mb-1">نوع الوسام</label>
                  <select
                    value={achCategory}
                    onChange={(e) =>
                      setAchCategory(
                        e.target.value as "trophy" | "students" | "certificate" | "medal"
                      )
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                  >
                    <option value="trophy">🏆 كأس بطولة</option>
                    <option value="students">🥇 إنجاز طلاب</option>
                    <option value="certificate">📜 شهادة دولية</option>
                    <option value="medal">🎖️ وسام تميز</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold block mb-1">السنة</label>
                  <input
                    type="text"
                    value={achYear}
                    onChange={(e) => setAchYear(e.target.value)}
                    placeholder="2026"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold block mb-1">تفاصيل إضافية (اختياري)</label>
                <textarea
                  rows={2}
                  value={achDesc}
                  onChange={(e) => setAchDesc(e.target.value)}
                  placeholder="تفاصيل مختصرة حول الإنجاز..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddAchievementModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black"
                >
                  حفظ الإنجاز 🏆
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View Homework Grades */}
      {selectedHwForGrades && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                📊 كشف درجات الواجب: {selectedHwForGrades.title}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedHwForGrades(null)}
                className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold"
              >
                إغلاق ✕
              </button>
            </div>

            {(!selectedHwForGrades.submissions ||
              selectedHwForGrades.submissions.length === 0) ? (
              <div className="p-8 text-center text-xs text-slate-500">
                لم يقم أي طالب بإتمام هذا الواجب حتى الآن.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-80 overflow-y-auto">
                {selectedHwForGrades.submissions.map((sub, idx) => (
                  <div
                    key={sub.studentId}
                    className="py-3 flex items-center justify-between gap-4 text-xs"
                  >
                    <div className="flex items-center gap-2.5 font-bold">
                      <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-black">
                        {idx + 1}
                      </span>
                      <span>{sub.studentName}</span>
                    </div>
                    <div className="flex items-center gap-4 font-mono font-bold">
                      <span>
                        الدرجة: {sub.correctAnswers}/{sub.totalQuestions}
                      </span>
                      <span className="text-emerald-600">الدقة: {sub.accuracy}%</span>
                      <span className="text-slate-400">الزمن: {sub.durationSeconds} ث</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Trainer Profile Editor Modal */}
      <ProfileEditorModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        profile={trainerProfile}
        forceRole="trainer"
        onSaved={(updated) => setTrainerProfile(updated)}
      />
    </div>
  );
}
