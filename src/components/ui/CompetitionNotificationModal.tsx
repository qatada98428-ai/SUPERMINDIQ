"use client";

import React, { useState, useEffect, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Trophy,
  X,
  Play,
  Share2,
  Check,
  MessageCircle,
  Bell,
  Clock,
  Layers,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  PlatformAssignment,
  getExtendedProfile,
  getPendingCompetitionNotifications,
  dismissCompetitionNotification,
  syncAllAssignmentsSubmissionsFromCloud,
  buildShareableAssignmentPath,
  formatRuleGroupShortAr,
} from "@/lib/platform-store";

const PRAYER_SESSION_KEY = "supermind_welcome_prayer_seen_v1";

export default function CompetitionNotificationModal() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile: authProfile, role } = useAuth();

  const [notifications, setNotifications] = useState<PlatformAssignment[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  // Don't interrupt active competition, admin, or auth screens
  const isSuppressedRoute =
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/mental-arithmetic/competition") ||
    pathname?.startsWith("/login") ||
    pathname?.startsWith("/register");

  const evaluateNotifications = useCallback(async () => {
    if (typeof window === "undefined" || isSuppressedRoute) return;

    // Wait for WelcomePrayerModal if it's still showing on first session visit
    const prayerSeen = sessionStorage.getItem(PRAYER_SESSION_KEY) === "1";
    if (!prayerSeen) return;

    await syncAllAssignmentsSubmissionsFromCloud();

    const uid = user?.id || "guest-local";
    const extProfile = getExtendedProfile(uid, {
      email: user?.email || authProfile?.email || undefined,
      name: authProfile?.name || "طالب العقل الخارق",
      role: (role === "admin" || role === "trainer" ? role : "student") as
        | "student"
        | "trainer"
        | "admin",
    });

    const pending = getPendingCompetitionNotifications(extProfile);
    if (pending.length > 0) {
      setNotifications(pending);
      setActiveIdx(0);
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [isSuppressedRoute, user?.id, user?.email, authProfile?.email, authProfile?.name, role]);

  useEffect(() => {
    if (isSuppressedRoute) {
      setVisible(false);
      return;
    }

    const timer = setTimeout(() => {
      evaluateNotifications();
    }, 650);

    const onPrayerClosed = () => {
      setTimeout(() => evaluateNotifications(), 350);
    };
    const onAssignmentsUpdated = () => {
      evaluateNotifications();
    };

    window.addEventListener("supermind:prayer-closed", onPrayerClosed);
    window.addEventListener("supermind:assignments-updated", onAssignmentsUpdated);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("supermind:prayer-closed", onPrayerClosed);
      window.removeEventListener("supermind:assignments-updated", onAssignmentsUpdated);
    };
  }, [evaluateNotifications, isSuppressedRoute]);

  if (!visible || notifications.length === 0 || isSuppressedRoute) return null;

  const current = notifications[Math.min(activeIdx, notifications.length - 1)];
  if (!current) return null;

  const relPath = buildShareableAssignmentPath(current);
  const fullShareUrl =
    typeof window !== "undefined" ? `${window.location.origin}${relPath}` : relPath;
  const waShareUrl = `https://wa.me/?text=${encodeURIComponent(
    `🏆 مسابقة جديدة في منصة العقل الخارق (SUPER MIND):\n📌 ${current.title}\n📋 ${current.questionsCount} سؤال • ⏱ ${
      current.timeMode === "stopwatch" ? "تايمر مفتوح" : `${current.timeLimitMinutes} دقيقة`
    }\n🚀 شارك معي الآن عبر الرابط:\n${fullShareUrl}`
  )}`;

  const handleDismissCurrent = () => {
    dismissCompetitionNotification(current.id);
    const remaining = notifications.filter((n) => n.id !== current.id);
    if (remaining.length === 0) {
      setVisible(false);
      setNotifications([]);
    } else {
      setNotifications(remaining);
      setActiveIdx((prev) => Math.min(prev, remaining.length - 1));
    }
  };

  const handleStartNow = () => {
    dismissCompetitionNotification(current.id);
    setVisible(false);
    router.push(relPath);
  };

  const targetBadgeText =
    current.targetType === "all_students"
      ? "جميع أبطال المنصة"
      : current.targetType === "active_subscribers"
      ? "المشتركون الفعّالون"
      : current.targetType === "by_governorate"
      ? `محافظة ${current.targetValue || ""}`
      : current.targetType === "by_level"
      ? current.targetValue || "مستوى محدد"
      : `طلاب ${current.creatorName}`;

  return (
    <div
      className="fixed inset-0 z-[95] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-lg rounded-[2rem] bg-gradient-to-b from-[#1A1338] via-[#15102E] to-[#0E0A21] text-white border-2 border-amber-400/70 shadow-[0_25px_70px_-15px_rgba(245,158,11,0.35)] overflow-hidden p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-200">
        {/* Glow Orbs */}
        <div className="pointer-events-none absolute -top-20 -right-16 w-52 h-52 bg-amber-400/20 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-16 w-52 h-52 bg-brand-500/20 rounded-full blur-3xl" />

        {/* Top Bar */}
        <div className="relative flex items-center justify-between gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/50 text-amber-300 text-xs font-black">
            <Bell className="w-3.5 h-3.5 animate-bounce" />
            <span>
              {current.kind === "trainer_homework"
                ? "🎓 إشعار بطولة جديدة من مدربك!"
                : "🏆 إشعار مسابقة رسمية جديدة لك!"}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {notifications.length > 1 && (
              <div className="flex items-center gap-1 bg-white/10 rounded-full px-2 py-0.5 text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() =>
                    setActiveIdx((i) => (i - 1 + notifications.length) % notifications.length)
                  }
                  className="p-0.5 hover:text-amber-300"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <span>
                  {activeIdx + 1} / {notifications.length}
                </span>
                <button
                  type="button"
                  onClick={() => setActiveIdx((i) => (i + 1) % notifications.length)}
                  className="p-0.5 hover:text-amber-300"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            <button
              type="button"
              onClick={handleDismissCurrent}
              aria-label="إغلاق"
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Title & Creator */}
        <div className="relative space-y-2 text-right">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 flex items-center justify-center shadow-lg shrink-0">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white leading-snug">
                {current.title}
              </h3>
              <p className="text-xs text-amber-200/90 font-bold">
                بإشراف: {current.creatorName} • الفئة: {targetBadgeText}
              </p>
            </div>
          </div>

          {current.description && (
            <p className="text-xs text-slate-300 leading-relaxed bg-white/5 p-3 rounded-2xl border border-white/10">
              {current.description}
            </p>
          )}
        </div>

        {/* Quick Specs & Multi-Rule Badges */}
        <div className="relative space-y-2">
          <div className="grid grid-cols-2 gap-2 text-xs font-black">
            <div className="p-2.5 rounded-xl bg-white/10 border border-white/10 flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              <span>{current.questionsCount} سؤال</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white/10 border border-white/10 flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>
                {current.timeMode === "stopwatch"
                  ? "تايمر مفتوح"
                  : `الوقت: ${current.timeLimitMinutes} دقائق`}
              </span>
            </div>
          </div>

          {current.ruleGroups && current.ruleGroups.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {current.ruleGroups.map((g, idx) => (
                <span
                  key={g.id || idx}
                  className="px-2.5 py-1 rounded-lg bg-amber-400/15 border border-amber-400/30 text-amber-200 text-[11px] font-bold"
                >
                  ({idx + 1}) {formatRuleGroupShortAr(g)}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* CTA & Share Buttons */}
        <div className="relative space-y-2.5 pt-1">
          <button
            type="button"
            onClick={handleStartNow}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 text-slate-950 font-black text-sm shadow-xl flex items-center justify-center gap-2 transition-transform active:scale-95"
          >
            <Play className="w-5 h-5 fill-slate-950" />
            <span>ابدأ المسابقة الآن وتصدّر لوحة الشرف 🚀</span>
          </button>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => {
                navigator.clipboard?.writeText(fullShareUrl);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="py-2.5 px-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-bold text-amber-200 flex items-center justify-center gap-1"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? "تم النسخ!" : "نسخ الرابط"}</span>
            </button>

            <a
              href={waShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-2 rounded-xl bg-emerald-600/90 hover:bg-emerald-500 text-xs font-bold text-white flex items-center justify-center gap-1"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>واتساب</span>
            </a>

            <button
              type="button"
              onClick={handleDismissCurrent}
              className="py-2.5 px-2 rounded-xl bg-white/5 hover:bg-white/15 text-xs font-bold text-slate-300"
            >
              لاحقاً
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
