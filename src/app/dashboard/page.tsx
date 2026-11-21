"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Sparkles,
  Zap,
  Calculator,
  Brain,
  Trophy,
  Flame,
  Clock,
  Target,
  ArrowLeft,
  Play,
  Award,
  AlertTriangle,
  CheckCircle2,
  Camera,
  MapPin,
  Phone,
  Calendar,
  BookOpen,
  ClipboardList,
  Crown,
  MessageCircle,
  Edit3,
  UserCheck,
  UserPlus,
  Send,
  Shield,
  X as CloseIcon,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useApp } from "@/context/AppContext";
import { getWhatsAppLink } from "@/lib/constants";
import ClayIcon from "@/components/design-system/ClayIcon";
import { ClayProgressBar } from "@/components/design-system/ClayMotion";
import { triggerClayCelebration } from "@/lib/celebrations";
import {
  ExtendedUserProfile,
  RealTrainingSession,
  PlatformAssignment,
  TrainerStudentLink,
  getExtendedProfile,
  isProfileComplete,
  evaluateSubscription,
  getMonthlyTrialStatus,
  getUserRealSessions,
  getStudentAssignments,
  syncExtendedProfileFromSupabase,
  syncAllAssignmentsSubmissionsFromCloud,
  buildShareableAssignmentPath,
  SUBSCRIPTION_PLANS,
  getPendingLinksForStudent,
  getStudentAcceptedTrainer,
  respondToTrainerStudentLink,
  sendTrainerStudentLinkRequest,
  getVerifiedTrainersForDirectory,
  getUserMembershipCode,
} from "@/lib/platform-store";
import ProfileEditorModal from "@/components/profile/ProfileEditorModal";

export default function StudentDashboardPage() {
  const { user, profile: authProfile, isGuest, guestProgress } = useAuth();
  const { playFx } = useApp();

  const activeUserId = user?.id || "guest-local";
  const [extProfile, setExtProfile] = useState<ExtendedUserProfile | null>(null);
  const [sessions, setSessions] = useState<RealTrainingSession[]>([]);
  const [adminCompetitions, setAdminCompetitions] = useState<PlatformAssignment[]>([]);
  const [trainerHomeworks, setTrainerHomeworks] = useState<PlatformAssignment[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<
    "all" | "competition" | "flash-anzan" | "abacus" | "quiz"
  >("all");
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  // Trainer Link & Tabs State
  const [dashboardTab, setDashboardTab] = useState<"homework" | "trainer" | "stats">("homework");
  const [pendingTrainerRequests, setPendingTrainerRequests] = useState<TrainerStudentLink[]>([]);
  const [acceptedTrainer, setAcceptedTrainer] = useState<TrainerStudentLink | null>(null);
  const [availableTrainers, setAvailableTrainers] = useState<ExtendedUserProfile[]>([]);
  const [trainerSearchQuery, setTrainerSearchQuery] = useState("");
  const [linkFeedback, setLinkFeedback] = useState<{ ok: boolean; msg: string } | null>(null);

  const loadStudentDashboard = useCallback(() => {
    const prof = getExtendedProfile(activeUserId, {
      email: user?.email || authProfile?.email,
      name: authProfile?.name || user?.email?.split("@")[0] || "بطل العقل الخارق",
      role: (authProfile?.role as "student" | "trainer" | "admin") || "student",
      phone: authProfile?.phone,
    });
    setExtProfile(prof);
    setSessions(getUserRealSessions(activeUserId));
    const assigns = getStudentAssignments(prof);
    setAdminCompetitions(assigns.adminCompetitions);
    setTrainerHomeworks(assigns.trainerHomeworks);

    const pending = getPendingLinksForStudent(activeUserId);
    setPendingTrainerRequests(pending);
    const accepted = getStudentAcceptedTrainer(activeUserId);
    setAcceptedTrainer(accepted);
    const trainers = getVerifiedTrainersForDirectory();
    setAvailableTrainers(trainers);
  }, [activeUserId, user?.email, authProfile]);

  useEffect(() => {
    loadStudentDashboard();
    if (activeUserId && activeUserId !== "guest-local") {
      syncExtendedProfileFromSupabase(activeUserId).then((synced) => {
        if (synced) loadStudentDashboard();
      });
    }
    syncAllAssignmentsSubmissionsFromCloud().then(() => {
      loadStudentDashboard();
    });

    const handleUpdate = () => loadStudentDashboard();
    window.addEventListener("supermind:profile-updated", handleUpdate);
    window.addEventListener("supermind:assignments-updated", handleUpdate);
    return () => {
      window.removeEventListener("supermind:profile-updated", handleUpdate);
      window.removeEventListener("supermind:assignments-updated", handleUpdate);
    };
  }, [activeUserId, loadStudentDashboard]);

  const handleRespondLink = async (linkId: string, accept: boolean) => {
    playFx("pop");
    const res = await respondToTrainerStudentLink({
      linkId,
      accept,
      responderRole: "student",
    });
    setLinkFeedback({ ok: res.success, msg: res.message });
    loadStudentDashboard();
    if (accept) {
      triggerClayCelebration("milestone");
    }
  };

  const handleSendLinkRequest = async (trainer: ExtendedUserProfile) => {
    if (!extProfile) return;
    playFx("pop");
    const res = await sendTrainerStudentLinkRequest({
      trainerId: trainer.id,
      trainerName: trainer.name,
      trainerCode: trainer.trainerCode,
      trainerPhone: trainer.phone,
      studentId: extProfile.id,
      studentName: extProfile.name,
      studentCode: extProfile.memberCode || getUserMembershipCode(extProfile.id),
      studentEmail: extProfile.email,
      requestedBy: "student",
    });
    setLinkFeedback({ ok: res.success, msg: res.message });
    loadStudentDashboard();
  };

  // Prompt logged-in user once per session if profile is incomplete
  useEffect(() => {
    if (!isGuest && extProfile && !isProfileComplete(extProfile)) {
      const promptedKey = `supermind_prompted_profile_${extProfile.id}`;
      if (!sessionStorage.getItem(promptedKey)) {
        sessionStorage.setItem(promptedKey, "1");
        setShowProfileModal(true);
      }
    }
  }, [isGuest, extProfile]);

  if (!extProfile) return null;

  const profileCompleted = isProfileComplete(extProfile);
  const subEval = evaluateSubscription(extProfile.subscription);
  const monthlyTrial = getMonthlyTrialStatus(activeUserId);

  const displayName =
    extProfile.name && extProfile.name !== "بطل العقل الخارق"
      ? extProfile.name
      : isGuest
      ? "بطل العقل الخارق (زائر)"
      : user?.email?.split("@")[0] || "بطل العقل الخارق";

  const totalExercises =
    extProfile.totalExercises > 0
      ? extProfile.totalExercises
      : isGuest
      ? guestProgress.completedExercises
      : 0;
  const totalQuestions =
    extProfile.totalQuestionsSolved > 0
      ? extProfile.totalQuestionsSolved
      : isGuest
      ? guestProgress.totalAnswers
      : 0;
  const accuracyRate =
    extProfile.totalQuestionsSolved > 0
      ? extProfile.accuracyRate
      : isGuest && guestProgress.totalAnswers > 0
      ? guestProgress.accuracyRate
      : 0;
  const points = extProfile.points || totalQuestions * 10;

  const filteredSessions = sessions.filter((s) => {
    if (selectedFilter === "all") return true;
    return s.type === selectedFilter;
  });

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7">
      {/* 1. Encouraging Notification Banner if Profile is Incomplete */}
      {!profileCompleted && (
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-l from-amber-500/15 via-amber-400/10 to-brand-500/10 border-2 border-amber-400/60 dark:border-amber-500/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow-md">
              <Camera className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>🌟 يا بطل! أكمل معلوماتك الشخصية وصورتك الآن</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                أضف صورتك الشخصية، اسمك الثلاثي، الدولة والمحافظة، ورقم هاتف يحتوي على واتساب ليتم{" "}
                <span className="font-black text-brand-700 dark:text-amber-300">
                  حفظ تقدمك ونقاطك بشكل حقيقي ودائم
                </span>{" "}
                واستلام الواجبات من مدربك والحصول على تجربة محاكي المسابقة المجانية شهرياً (100 سؤال)!
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowProfileModal(true)}
            className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm shadow-md transition-all shrink-0 flex items-center gap-2 self-stretch sm:self-auto justify-center"
          >
            <Edit3 className="w-4 h-4" />
            <span>إكمال معلوماتي وصورتي الآن</span>
          </button>
        </div>
      )}

      {/* 2. 3-Day Subscription Expiration Alert Banner */}
      {subEval.isExpiringSoon && (
        <div className="p-4 sm:p-5 rounded-3xl bg-rose-50 dark:bg-rose-950/50 border-2 border-rose-400 dark:border-rose-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-7 h-7 text-rose-600 dark:text-rose-400 shrink-0 animate-bounce" />
            <div>
              <h4 className="text-sm sm:text-base font-black text-rose-900 dark:text-rose-200">
                تنبيه مهم: ينتهي اشتراكك خلال {subEval.daysRemaining} أيام فقط!
              </h4>
              <p className="text-xs text-rose-700 dark:text-rose-300">
                تاريخ انتهاء اشتراكك الحالي هو {formatDateAr(extProfile.subscription.endDate)}. جدد اشتراكك الآن لضمان استمرار وصولك غير المحدود لمحاكي المسابقة والبطولات.
              </p>
            </div>
          </div>
          <a
            href={getWhatsAppLink(
              `مرحباً إدارة منصة العقل الخارق، أنا الطالب (${displayName}) أرغب بتجديد اشتراكي قبل انتهائه.`
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center gap-2 shrink-0"
          >
            <MessageCircle className="w-4 h-4" />
            <span>اضغط للتواصل مع إدارة المنصة للتجديد</span>
          </a>
        </div>
      )}

      {/* Expired Subscription Notice */}
      {subEval.effectiveStatus === "expired" && (
        <div className="p-4 sm:p-5 rounded-3xl bg-slate-100 dark:bg-slate-800/90 border border-rose-300 dark:border-rose-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-rose-500 shrink-0" />
            <div>
              <h4 className="text-sm font-black text-slate-900 dark:text-white">
                انتهت مدة اشتراكك السابق بتاريخ {formatDateAr(extProfile.subscription.endDate)}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                التعليم والمعداد الحر والفلاش أنزان متاحة لك مجاناً، ويمكنك تجديد اشتراكك في أي وقت لفتح محاكي المسابقة بلا حدود.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowSubscriptionModal(true)}
            className="px-5 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-black text-xs shrink-0"
          >
            تجديد الاشتراك الآن
          </button>
        </div>
      )}

      {/* 3. Screen-3 Inspired Rewards & Student Profile Clay Banner */}
      <div className="clay-banner-lavender relative overflow-hidden text-white p-6 sm:p-8">
        <div className="absolute top-0 left-0 w-80 h-80 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Student Avatar */}
            <div className="relative group shrink-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-[26px] overflow-hidden bg-white/20 border-2 border-amber-300 shadow-clay flex items-center justify-center">
                {extProfile.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={extProfile.avatarUrl}
                    alt={displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-4xl font-black text-amber-300">
                    {displayName.charAt(0)}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  playFx("pop");
                  setShowProfileModal(true);
                }}
                className="clay-btn-amber absolute -bottom-2 -right-2 px-3 py-1 font-black text-[10px] flex items-center gap-1"
              >
                <Camera className="w-3 h-3" />
                <span>تعديل البروفايل</span>
              </button>
            </div>

            <div className="space-y-2.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-amber-200 text-xs font-extrabold border border-white/25">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{extProfile.currentLevel}</span>
                </span>

                {extProfile.country && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-bold">
                    <MapPin className="w-3.5 h-3.5 text-emerald-300" />
                    <span>
                      {extProfile.country}
                      {extProfile.governorate ? ` - ${extProfile.governorate}` : ""}
                    </span>
                  </span>
                )}

                {subEval.isActive ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-400/25 border border-emerald-300/40 text-emerald-100 text-xs font-black">
                    <Crown className="w-3.5 h-3.5 text-amber-300" />
                    <span>مشترك فعال ({extProfile.subscription.planLabel})</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/15 text-white/90 text-xs font-bold">
                    <span>الباقة المجانية (متاح التعليم والمعداد والفلاش أنزان)</span>
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-4xl font-black">
                أحسنت يا بطل، {displayName} ⭐
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-white/90">
                <div>
                  المدرب المشرف:{" "}
                  <span className="font-black text-amber-300">
                    {extProfile.trainerName || "الأستاذ قتادة كريم"}
                  </span>
                </div>
                {extProfile.phone && (
                  <div className="flex items-center gap-1 font-mono bg-white/15 px-2.5 py-0.5 rounded-xl">
                    <Phone className="w-3.5 h-3.5 text-emerald-300" />
                    <span>واتساب موثق: {extProfile.phone}</span>
                  </div>
                )}
              </div>

              {subEval.isActive && extProfile.subscription.startDate && (
                <div className="inline-flex flex-wrap items-center gap-3 px-3.5 py-1.5 rounded-xl bg-slate-950/30 border border-white/15 text-xs text-emerald-200">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-amber-300" />
                    <span>تاريخ الاشتراك: {formatDateAr(extProfile.subscription.startDate)}</span>
                  </span>
                  <span>|</span>
                  <span>ينتهي في: {formatDateAr(extProfile.subscription.endDate)}</span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/30 text-white font-black">
                    متبقي {subEval.daysRemaining} يوم
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* 3D Coin & Champion Character Card */}
          <div className="flex items-center gap-3 self-stretch lg:self-auto justify-between sm:justify-end">
            <div className="hidden sm:block w-36 rounded-[20px] overflow-hidden border-2 border-white/40 shadow-clay bg-[#C9B9FF] shrink-0">
              <Image
                src="/images/clay/champion-reward-kid.jpg"
                alt="أنت نجم يا بطل"
                width={320}
                height={180}
                className="w-full h-24 object-cover"
              />
            </div>

            <div className="flex items-center gap-2.5">
              <div className="rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 px-4 py-3 text-center min-w-[92px]">
                <div className="flex items-center justify-center gap-1 text-amber-300 mb-0.5">
                  <Flame className="w-5 h-5 fill-amber-300" />
                  <span className="font-black font-mono text-xl">{extProfile.streakDays || 1}</span>
                </div>
                <div className="text-[11px] text-white/90 font-bold">أيام الحماس</div>
              </div>

              <button
                type="button"
                onClick={() => {
                  playFx("levelup");
                  triggerClayCelebration("small");
                }}
                className="rounded-2xl bg-white text-[#1E1B3A] shadow-clay px-4 py-3 text-center min-w-[100px] hover:scale-105 active:scale-95 transition-transform"
                title="اضغط للاحتفال بنقاطك!"
              >
                <div className="flex items-center justify-center gap-1 text-amber-500 mb-0.5">
                  <ClayIcon name="star" tone="none" size="xs" />
                  <span className="font-black font-mono text-xl text-[#1E1B3A]">{points}</span>
                </div>
                <div className="text-[11px] text-brand-700 font-extrabold">نقاط التميز</div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3B. Screen-3 Inspired "Your Progress + Badges + Weekly Challenge" Trio */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Progress 3-Column Card */}
        <div className="lg:col-span-5 clay-card p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-black text-[#1E1B3A] dark:text-white">
              تقدمك اليومي
            </h2>
            <Link
              href="/progress"
              className="text-xs font-extrabold text-brand-600 dark:text-brand-300 hover:underline"
            >
              التقرير المفصل
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-2.5 pt-1">
            <div className="rounded-2xl bg-[#F7F6FE] dark:bg-[#242146] p-3 text-center space-y-1.5 border border-[#ECE8FA] dark:border-[#363268]">
              <ClayIcon name="book" tone="lavender" size="sm" className="mx-auto" />
              <div className="text-xl font-black font-mono text-[#1E1B3A] dark:text-white">
                {totalExercises}
              </div>
              <div className="text-[11px] font-bold text-[#6E6A94] dark:text-[#B3AED6]">
                تمارين منجزة
              </div>
            </div>

            <div className="rounded-2xl bg-[#F7F6FE] dark:bg-[#242146] p-3 text-center space-y-1.5 border border-[#ECE8FA] dark:border-[#363268]">
              <ClayIcon name="flame" tone="peach" size="sm" className="mx-auto" />
              <div className="text-xl font-black font-mono text-[#1E1B3A] dark:text-white">
                {extProfile.streakDays || 1}
              </div>
              <div className="text-[11px] font-bold text-[#6E6A94] dark:text-[#B3AED6]">
                سلسلة الأيام
              </div>
            </div>

            <div className="rounded-2xl bg-[#F7F6FE] dark:bg-[#242146] p-3 text-center space-y-1.5 border border-[#ECE8FA] dark:border-[#363268]">
              <ClayIcon name="medal" tone="gold" size="sm" className="mx-auto" />
              <div className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                {accuracyRate}%
              </div>
              <div className="text-[11px] font-bold text-[#6E6A94] dark:text-[#B3AED6]">
                معدل الدقة
              </div>
            </div>
          </div>
        </div>

        {/* 3D Badges Shelf */}
        <div className="lg:col-span-4 clay-card p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-black text-[#1E1B3A] dark:text-white">
              أوسمة البطل
            </h2>
            <span className="text-xs font-extrabold text-brand-600 dark:text-brand-300">
              اضغط للاحتفال 🎉
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center">
            {[
              {
                name: "الخطوة الأولى",
                icon: "footprint" as const,
                tone: "lavender" as const,
                unlocked: totalExercises >= 1,
              },
              {
                name: "عبقري الحساب",
                icon: "math123" as const,
                tone: "gold" as const,
                unlocked: totalQuestions >= 10,
              },
              {
                name: "نجم السرعة",
                icon: "flash" as const,
                tone: "mint" as const,
                unlocked: accuracyRate >= 80,
              },
              {
                name: "محب التعلّم",
                icon: "book" as const,
                tone: "pink" as const,
                unlocked: true,
              },
            ].map((badge) => (
              <button
                key={badge.name}
                type="button"
                onClick={() => {
                  if (badge.unlocked) {
                    playFx("levelup");
                    triggerClayCelebration("small");
                  } else {
                    playFx("pop");
                  }
                }}
                className={`group flex flex-col items-center gap-1.5 p-1.5 rounded-2xl transition-transform hover:-translate-y-1 ${
                  badge.unlocked ? "opacity-100" : "opacity-45 grayscale"
                }`}
              >
                <ClayIcon name={badge.icon} tone={badge.tone} size="md" />
                <span className="text-[10px] font-extrabold text-[#4F4A75] dark:text-[#D5D0F2] leading-tight">
                  {badge.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Weekly Challenge Mascot Card */}
        <div className="lg:col-span-3 clay-card p-5 flex items-center justify-between gap-3">
          <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 border border-[#ECE8FA] bg-white">
            <Image
              src="/images/clay/challenge-mascot.jpg"
              alt="تحدي الأسبوع"
              width={160}
              height={160}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            <div className="text-xs font-black text-[#1E1B3A] dark:text-white">
              التحدي الأسبوعي 🎁
            </div>
            <p className="text-[11px] font-semibold text-[#6E6A94] dark:text-[#B3AED6]">
              أكمل {Math.min(10, totalExercises)} / 10 تمارين
            </p>
            <ClayProgressBar value={Math.min(10, totalExercises)} max={10} />
          </div>
          <ClayIcon name="gift" tone="pink" size="sm" />
        </div>
      </section>

      {/* Feedback Banner for Trainer Link Requests */}
      {linkFeedback && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between gap-3 text-xs sm:text-sm font-bold ${
            linkFeedback.ok
              ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300"
              : "bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-300"
          }`}
        >
          <span>{linkFeedback.msg}</span>
          <button
            type="button"
            onClick={() => setLinkFeedback(null)}
            className="p-1 rounded-lg hover:bg-black/10"
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navigation Tabs for Student Sections */}
      <div className="flex flex-wrap items-center gap-2.5 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          type="button"
          onClick={() => {
            playFx("pop");
            setDashboardTab("homework");
          }}
          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black flex items-center gap-2 transition-all ${
            dashboardTab === "homework"
              ? "bg-brand-600 text-white shadow-md shadow-brand-500/20"
              : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50"
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          <span>📝 خانة الواجبات والتحديات ({trainerHomeworks.length + adminCompetitions.length})</span>
        </button>

        <button
          type="button"
          onClick={() => {
            playFx("pop");
            setDashboardTab("trainer");
          }}
          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black flex items-center gap-2 transition-all ${
            dashboardTab === "trainer"
              ? "bg-brand-600 text-white shadow-md shadow-brand-500/20"
              : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50"
          }`}
        >
          <UserPlus className="w-4 h-4" />
          <span>
            🎓 خانة إضافة مدربي والمعتمد
            {pendingTrainerRequests.length > 0
              ? ` (🔔 ${pendingTrainerRequests.length} طلب جديد)`
              : acceptedTrainer
              ? " (✅ معتمد)"
              : ""}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            playFx("pop");
            setDashboardTab("stats");
          }}
          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black flex items-center gap-2 transition-all ${
            dashboardTab === "stats"
              ? "bg-brand-600 text-white shadow-md shadow-brand-500/20"
              : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50"
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>📊 الإحصائيات الحقيقية وسجل الجلسات</span>
        </button>
      </div>

      {/* TAB 1: HOMEWORK & CHALLENGES */}
      {dashboardTab === "homework" && (
        <div className="space-y-7 animate-in fade-in duration-200">
          {/* 4. Official Admin Competitions & Challenges Section */}
          {adminCompetitions.length > 0 && (
            <section className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-amber-500" />
                  <span>🏆 المسابقات والتحديات الرسمية من إدارة المنصة</span>
                </h2>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                  متاحة للحل بضغطة زر
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {adminCompetitions.map((comp) => {
                  const mySub = comp.submissions?.find((s) => s.studentId === activeUserId);
                  const topThree = (comp.submissions || []).slice(0, 3);
                  return (
                    <div
                      key={comp.id}
                      className="p-5 rounded-3xl bg-gradient-to-br from-amber-50 via-white to-amber-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-amber-950/20 border-2 border-amber-300/80 dark:border-amber-700/60 shadow-md flex flex-col justify-between gap-4"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="px-3 py-1 rounded-full bg-amber-500 text-slate-950 font-black text-[11px]">
                            مسابقة رسمية من الإدارة
                          </span>
                          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                            {comp.questionsCount} سؤال • {comp.timeLimitMinutes} دقائق
                          </span>
                        </div>

                        <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                          {comp.title}
                        </h3>
                        {comp.description && (
                          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                            {comp.description}
                          </p>
                        )}

                        {/* Mini Leaderboard */}
                        {topThree.length > 0 && (
                          <div className="p-3 rounded-2xl bg-white/80 dark:bg-slate-800/70 border border-amber-200/60 dark:border-slate-700 space-y-1.5">
                            <div className="text-[11px] font-black text-amber-700 dark:text-amber-300">
                              🥇 أوائل الأبطال في هذه المسابقة:
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {topThree.map((st, idx) => (
                                <span
                                  key={st.studentId}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-100/70 dark:bg-slate-700 text-xs font-bold text-slate-800 dark:text-white"
                                >
                                  <span>{idx === 0 ? "🥇" : idx === 1 ? "🥈" : "🥉"}</span>
                                  <span>{st.studentName}</span>
                                  <span className="font-mono text-emerald-600 dark:text-emerald-400">
                                    ({st.accuracy}%)
                                  </span>
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between gap-3 pt-2 border-t border-amber-200/60 dark:border-slate-800">
                        {mySub ? (
                          <div className="text-xs font-black text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>
                              أنجزت التحدي! درجتك: {mySub.correctAnswers}/{mySub.totalQuestions} ({mySub.accuracy}%)
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs font-bold text-slate-500">
                            الإعدادات جاهزة تلقائياً
                          </span>
                        )}

                        <Link
                          href={buildShareableAssignmentPath(comp)}
                          className="px-5 py-2.5 rounded-2xl bg-gradient-to-l from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-md flex items-center gap-1.5 transition-transform active:scale-95"
                        >
                          <Play className="w-4 h-4 fill-current" />
                          <span>{mySub ? "تحسين نتيجتي 🚀" : "ابدأ التحدي بضغطة زر 🚀"}</span>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* 5. Student Homework Section from Trainer (`قسم الواجبات`) */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <ClipboardList className="w-6 h-6 text-brand-600" />
                <span>📝 قسم الواجبات التدريبية من مدربك</span>
              </h2>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                اضغط على الزر ليبدأ الحل مباشرة بإعدادات المدرب
              </span>
            </div>

            {trainerHomeworks.length === 0 ? (
              <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 flex items-center justify-center mx-auto">
                  <ClipboardList className="w-7 h-7" />
                </div>
                <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">
                  لا توجد واجبات جديدة مطلوبة حالياً
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  عندما يرسل مدربك واجباً جديداً سيظهر هنا مباشرة وتستطيع حله بضغطة زر واحدة وحفظ درجاتك في كشف المدرب!
                </p>
                {!acceptedTrainer && (
                  <button
                    type="button"
                    onClick={() => setDashboardTab("trainer")}
                    className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs"
                  >
                    ربط أو اختيار مدربك الآن ⬅
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {trainerHomeworks.map((hw) => {
                  const mySub = hw.submissions?.find((s) => s.studentId === activeUserId);
                  const targetHref = buildShareableAssignmentPath(hw);

                  return (
                    <div
                      key={hw.id}
                      className="p-5 rounded-3xl bg-white dark:bg-slate-900 border-2 border-brand-200 dark:border-slate-800 hover:border-brand-500 transition-all shadow-sm flex flex-col justify-between gap-4"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 font-black text-[11px]">
                            المدرب: {hw.creatorName}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-black ${
                              mySub
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                                : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                            }`}
                          >
                            {mySub ? "تم الحل ✅" : "واجب جديد مطلوب ⏳"}
                          </span>
                        </div>

                        <h3 className="text-base font-black text-slate-900 dark:text-white">
                          {hw.title}
                        </h3>
                        {hw.description && (
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {hw.description}
                          </p>
                        )}

                        <div className="flex flex-wrap gap-2 pt-1 text-[11px] font-bold text-slate-600 dark:text-slate-300">
                          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800">
                            عدد الأسئلة: {hw.questionsCount}
                          </span>
                          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800">
                            الوقت: {hw.timeLimitMinutes} دقائق
                          </span>
                          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800">
                            طريقة الجواب: {hw.answerMode === "choices" ? `اختيارات (${hw.choicesCount})` : "كتابة الناتج"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                        {mySub ? (
                          <div className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                            النتيجة المسجلة: {mySub.correctAnswers}/{mySub.totalQuestions} ({mySub.accuracy}%)
                          </div>
                        ) : (
                          <div className="text-xs text-slate-500 font-semibold">
                            يفتح جاهزاً للحل فوراً
                          </div>
                        )}

                        <Link
                          href={targetHref}
                          className="px-5 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-black text-xs shadow-md shadow-brand-500/20 flex items-center gap-1.5 transition-transform active:scale-95"
                        >
                          <Play className="w-4 h-4 fill-current" />
                          <span>{mySub ? "إعادة حل الواجب" : "ابدأ الحل بضغطة زر 🚀"}</span>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      )}

      {/* TAB 2: MY TRAINER & MUTUAL LINK SYSTEM */}
      {dashboardTab === "trainer" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* 1. Accepted Trainer Banner */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-brand-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-emerald-600" />
              <span>مدربك المعتمد حالياً:</span>
            </h3>

            {acceptedTrainer ? (
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50/50 to-white dark:from-emerald-950/30 dark:via-slate-800 dark:to-slate-900 border border-emerald-300 dark:border-emerald-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white font-black text-xl flex items-center justify-center shadow-md">
                    <span>🎓</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-black text-slate-900 dark:text-white">
                        {acceptedTrainer.trainerName}
                      </h4>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 dark:bg-emerald-900/60 dark:text-emerald-200">
                        معتمد رسمياً ✅
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 font-mono">
                      معرّف المدرب: {acceptedTrainer.trainerCode || "—"}
                    </div>
                    <p className="text-xs text-emerald-700 dark:text-emerald-300">
                      تصلك واجبات وتحديات هذا المدرب مباشرة إلى حسابك!
                    </p>
                  </div>
                </div>

                {acceptedTrainer.trainerPhone && (
                  <a
                    href={getWhatsAppLink(
                      `مرحباً أستاذ (${acceptedTrainer.trainerName})، أنا الطالب (${displayName}) من منصة العقل الخارق.`
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center gap-1.5 shadow-sm shrink-0"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>تواصل مع مدربك عبر واتساب</span>
                  </a>
                )}
              </div>
            ) : (
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center space-y-2">
                <p className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">
                  لم يتم ربط مدرب معتمد بعد.
                </p>
                <p className="text-xs text-slate-500">
                  يمكنك قبول طلب الربط من مدربك بالأسفل، أو البحث عن مدربك المعتمد وإرسال طلب ارتباط له ليوافق عليه!
                </p>
              </div>
            )}
          </div>

          {/* 2. Pending Trainer Link Requests (Mutual Two-Way Approval) */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-amber-500" />
                <span>طلبات الارتباط الواردة من المدربين (بانتظار موافقتك الرسمية):</span>
              </h3>
              <span className="text-xs font-bold text-slate-400">
                الموافقة الثنائية مطلوبة
              </span>
            </div>

            {pendingTrainerRequests.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-center text-xs text-slate-500">
                لا توجد طلبات واردة معلقة حالياً.
              </div>
            ) : (
              <div className="space-y-3">
                {pendingTrainerRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border-2 border-amber-300 dark:border-amber-700/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-slate-900 dark:text-white">
                          طلب إضافة من المدرب: {req.trainerName}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-950">
                          بانتظار موافقتك ⏳
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 font-mono">
                        معرّف المدرب: {req.trainerCode || "—"}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleRespondLink(req.id, true)}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md transition-all flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>قبول واعتماد المدرب</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRespondLink(req.id, false)}
                        className="px-3 py-2 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 font-bold text-xs"
                      >
                        رفض
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 3. Search & Link to Verified Trainer */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-brand-600" />
                  <span>دليل المدربين المعتمدين وإرسال طلب ارتباط:</span>
                </h3>
                <p className="text-xs text-slate-500">
                  اختر مدربك المعتمد أو ابحث عنه بالاسم أو المعرّف (TR-XXXX) وأرسل له طلب الارتباط:
                </p>
              </div>

              <input
                type="text"
                placeholder="ابحث عن مدرب بالاسم أو المعرّف..."
                value={trainerSearchQuery}
                onChange={(e) => setTrainerSearchQuery(e.target.value)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white sm:w-64 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableTrainers
                .filter((tr) => {
                  if (!trainerSearchQuery.trim()) return true;
                  const q = trainerSearchQuery.toLowerCase();
                  return (
                    tr.name.toLowerCase().includes(q) ||
                    (tr.trainerCode && tr.trainerCode.toLowerCase().includes(q)) ||
                    (tr.governorate && tr.governorate.toLowerCase().includes(q))
                  );
                })
                .slice(0, 6)
                .map((tr) => {
                  const isCurrent = acceptedTrainer?.trainerId === tr.id;
                  return (
                    <div
                      key={tr.id}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col justify-between gap-3"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-black text-slate-900 dark:text-white">
                            {tr.name}
                          </h4>
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-brand-100 text-brand-800 dark:bg-brand-900/60 dark:text-brand-300">
                            مدرب معتمد
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 font-mono">
                          المعرّف: {tr.trainerCode || getUserMembershipCode(tr.id)}
                        </div>
                        {tr.governorate && (
                          <div className="text-xs text-slate-400">
                            📍 {tr.governorate}
                          </div>
                        )}
                      </div>

                      <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700">
                        {isCurrent ? (
                          <div className="text-xs font-black text-emerald-600 flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>مدربك المعتمد حالياً</span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSendLinkRequest(tr)}
                            className="w-full py-2 px-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-black text-xs shadow-sm flex items-center justify-center gap-1.5 transition-all"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>إرسال طلب ربط للمدرب</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: STATS & PROGRESS */}
      {dashboardTab === "stats" && (
        <div className="space-y-7 animate-in fade-in duration-200">
          {/* 6. Free Tools vs Competition Simulator Subscription Status */}
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            <span>أقسام التدريب والتعليم (المتاح مجاناً ومحاكي المسابقة)</span>
          </h2>
          {!subEval.isActive && (
            <button
              type="button"
              onClick={() => setShowSubscriptionModal(true)}
              className="text-xs font-black text-brand-600 dark:text-amber-400 hover:underline flex items-center gap-1"
            >
              <Crown className="w-4 h-4" />
              <span>عرض باقات اشتراك محاكي المسابقة (25 / 50 / 100 ألف)</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* 1. Interactive Learning (FREE) */}
          <Link
            href="/mental-arithmetic/learn"
            className="group p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500 transition-all shadow-sm hover:shadow-xl flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <BookOpen className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-black text-[11px]">
                  مجاني 100%
                </span>
              </div>
              <h3 className="text-base font-black text-slate-900 dark:text-white mb-1">
                التعليم وشرح القواعد
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                تعلم تمثيل الأرقام، الجمع والطرح البسيط، وأصدقاء الرقم 5 و 10 خطوة بخطوة.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-emerald-600">
              <span>ادخل للتعليم المجاني</span>
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* 2. Free Abacus (FREE) */}
          <Link
            href="/mental-arithmetic/abacus"
            className="group p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-brand-500 transition-all shadow-sm hover:shadow-xl flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Calculator className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-black text-[11px]">
                  مجاني 100%
                </span>
              </div>
              <h3 className="text-base font-black text-slate-900 dark:text-white mb-1">
                المعداد الحر (السوروبان)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                تدريب مفتوح على عداد السوروبان الياباني التفاعلي مع نطق صوتي وتمارين فورية.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-brand-600">
              <span>افتح المعداد الحر</span>
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* 3. Flash Anzan (FREE) */}
          <Link
            href="/mental-arithmetic/flash-anzan"
            className="group p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-amber-500 transition-all shadow-sm hover:shadow-xl flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Zap className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-black text-[11px]">
                  مجاني 100%
                </span>
              </div>
              <h3 className="text-base font-black text-slate-900 dark:text-white mb-1">
                فلاش أنزان السريع
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                تحدي الوميض الذهني التخيلي بسرعات متدرجة مع نطق صوتي واضح للأرقام.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-amber-600">
              <span>ابدأ الفلاش أنزان</span>
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* 4. Competition Simulator (Paid Subscription + 100 Q / 10 Min Monthly Trial for Registered Students) */}
          <div className="group p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white border-2 border-amber-400/60 shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-400/20 text-amber-300 flex items-center justify-center">
                  <Trophy className="w-6 h-6" />
                </div>
                {subEval.isActive ? (
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500 text-slate-950 font-black text-[10px]">
                    اشتراكك فعال ✅
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full bg-amber-400 text-slate-950 font-black text-[10px]">
                    تجربة شهرية + باقات
                  </span>
                )}
              </div>
              <h3 className="text-base font-black text-white mb-1">
                محاكي مسابقة الحساب الذهني
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                محاكي البطولات حتى 1000 سؤال وتعدد القواعد والتصحيح الفوري.
              </p>

              {!subEval.isActive && (
                <div className="p-2.5 rounded-xl bg-white/10 border border-white/15 text-[11px] text-amber-200 space-y-1">
                  <div className="font-black">
                    🎁 حصتك المجانية هذا الشهر: متبقي {monthlyTrial.questionsRemaining} من 100 سؤال (أو 10 دقائق)
                  </div>
                  <div className="text-[10px] text-slate-300">
                    للوصول غير المحدود: 25 ألف شهري | 50 ألف (3 أشهر) | 100 ألف سنوي
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between gap-2">
              <Link
                href="/mental-arithmetic/competition"
                className="flex-1 py-2 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs text-center transition-colors"
              >
                {subEval.isActive ? "ادخل للمحاكي الكامل" : "دخول المحاكي / التجربة"}
              </Link>
              {!subEval.isActive && (
                <button
                  type="button"
                  onClick={() => setShowSubscriptionModal(true)}
                  className="py-2 px-3 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs"
                >
                  الباقات
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 7. Real Statistics Cards */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400">إجمالي التمارين المنجزة</span>
            <Target className="w-4 h-4 text-brand-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">
            {totalExercises}
          </div>
          <div className="text-xs text-emerald-600 font-semibold mt-1">
            مسجل فعلياً في حسابك
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400">معدل الدقة الحقيقي</span>
            <Award className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 font-mono">
            {accuracyRate}%
          </div>
          <div className="text-xs text-slate-500 mt-1">
            إجابات صحيحة: {extProfile.correctAnswers} من {totalQuestions}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400">إجمالي الأسئلة المحلولة</span>
            <Brain className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">
            {totalQuestions}
          </div>
          <div className="text-xs text-purple-600 font-semibold mt-1">
            تقدم فعلي غير وهمي
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400">نقاط البطل التراكمية</span>
            <Trophy className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-500 font-mono">
            {points}
          </div>
          <div className="text-xs text-slate-500 mt-1">تزداد مع كل تمرين وواجب</div>
        </div>
      </section>

      {/* 8. Real Training Sessions History */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-brand-600" />
              <span>سجل جلساتك وتقدمك الحقيقي</span>
            </h2>
            <p className="text-xs text-slate-500">
              تُحفظ هنا كل جلسة تدريبية أو مسابقة أو واجب تقوم بحله فعلياً
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl self-start">
            {[
              { id: "all", label: "الكل" },
              { id: "competition", label: "المسابقات والواجبات" },
              { id: "flash-anzan", label: "فلاش أنزان" },
              { id: "abacus", label: "السوروبان" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() =>
                  setSelectedFilter(
                    tab.id as "all" | "competition" | "flash-anzan" | "abacus" | "quiz"
                  )
                }
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  selectedFilter === tab.id
                    ? "bg-white dark:bg-slate-900 text-brand-600 shadow-sm"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {filteredSessions.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-center space-y-3">
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
              لم تقم بحل جلسات تدريبية مسجلة بعد في هذا القسم.
            </p>
            <p className="text-xs text-slate-500">
              ابدأ الآن بحل تمرين في المعداد الحر أو الفلاش أنزان أو واجباتك ليظهر تقدمك الحقيقي هنا فوراً!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredSessions.slice(0, 15).map((session) => (
              <div
                key={session.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-brand-50 dark:bg-slate-800 text-brand-600">
                    {session.type === "flash-anzan" ? (
                      <Zap className="w-5 h-5 text-amber-500" />
                    ) : session.type === "competition" ? (
                      <Trophy className="w-5 h-5 text-amber-500" />
                    ) : (
                      <Calculator className="w-5 h-5 text-brand-600" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {session.title}
                    </h4>
                    <div className="text-xs text-slate-400">
                      {session.level} • {formatDateAr(session.createdAt)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6 self-end sm:self-center">
                  <div className="text-center">
                    <div className="text-xs text-slate-400">النتيجة</div>
                    <div className="text-sm font-black font-mono text-slate-800 dark:text-slate-200">
                      {session.correctAnswers}/{session.totalQuestions}
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-xs text-slate-400">الدقة</div>
                    <div className="text-sm font-black font-mono text-emerald-600">
                      {session.accuracy}%
                    </div>
                  </div>

                  <div className="px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-bold text-xs font-mono">
                    +{session.score} نقطة
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
      </div>
      )}

      {/* Profile Editor Modal */}
      <ProfileEditorModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        profile={extProfile}
        onSaved={(updated) => setExtProfile(updated)}
      />

      {/* Student Subscription Packages Modal */}
      {showSubscriptionModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-4xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 my-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  باقات اشتراك الطالب في محاكي المسابقة الاحترافي 🏆
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  التعليم والمعداد الحر والفلاش أنزان متاحة مجاناً دائماً، ولديك كل شهر 100 سؤال (أو 10 دقائق) تجربة مجانية في المحاكي. للاشتراك المفتوح اختر باقتك:
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowSubscriptionModal(false)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold"
              >
                إغلاق ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {SUBSCRIPTION_PLANS.student.map((plan) => (
                <div
                  key={plan.id}
                  className={`rounded-3xl p-6 border-2 flex flex-col justify-between ${
                    plan.popular
                      ? "border-brand-600 bg-brand-50/30 dark:bg-brand-950/20 shadow-lg"
                      : "border-slate-200 dark:border-slate-800"
                  }`}
                >
                  <div className="space-y-3">
                    <span className="inline-block px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 font-black text-[11px]">
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
                      `مرحباً إدارة منصة العقل الخارق، أنا الطالب (${displayName}) من (${extProfile.country} - ${extProfile.governorate}) أود الاشتراك وتفعيل (${plan.name} - بسعر ${plan.priceFormatted}).`
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>اضغط للتواصل مع إدارة المنصة</span>
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
