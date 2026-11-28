"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  Trophy,
  Plus,
  RefreshCw,
  Search,
  Edit3,
  Trash2,
  Copy,
  Check,
  Bell,
  BellOff,
  PauseCircle,
  PlayCircle,
  MessageCircle,
  ExternalLink,
  Layers,
  Clock,
  FileBarChart2,
  Files,
  Users,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import {
  PlatformAssignment,
  AssignmentSubmission,
  getAllAssignments,
  syncAllAssignmentsSubmissionsFromCloud,
  updatePlatformAssignmentAsync,
  duplicatePlatformAssignmentAsync,
  deletePlatformAssignmentAsync,
  buildShareableAssignmentPath,
  formatRuleGroupShortAr,
  formatAttemptLabelAr,
} from "@/lib/platform-store";
import AdminCompetitionCreatorModal from "@/components/admin/AdminCompetitionCreatorModal";
import StudentResultDetailModal from "@/components/competition/StudentResultDetailModal";

interface CompetitionManagementCenterProps {
  mode: "admin" | "trainer";
  creatorId: string;
  creatorName: string;
  trainerStudents?: Array<{ id: string; name: string; governorate?: string }>;
  onAudioFx?: (fx: "click" | "fanfare") => void;
}

export default function CompetitionManagementCenter({
  mode,
  creatorId,
  creatorName,
  trainerStudents = [],
  onAudioFx,
}: CompetitionManagementCenterProps) {
  const isAdmin = mode === "admin";

  const [assignments, setAssignments] = useState<PlatformAssignment[]>([]);
  const [loadingCloud, setLoadingCloud] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "paused">("all");
  const [kindFilter, setKindFilter] = useState<
    "all" | "admin_competition" | "admin_challenge" | "trainer_homework"
  >("all");

  // Modals
  const [showEditorModal, setShowEditorModal] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<PlatformAssignment | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<{
    submission: AssignmentSubmission;
    title: string;
    rank: number;
  } | null>(null);

  // Toast feedback
  const [toast, setToast] = useState<{ ok: boolean; msg: string } | null>(null);
  const showToast = useCallback((ok: boolean, msg: string) => {
    setToast({ ok, msg });
    setTimeout(() => {
      setToast((prev) => (prev?.msg === msg ? null : prev));
    }, 3500);
  }, []);

  const scopeFilter = useCallback(
    (list: PlatformAssignment[]) => {
      if (isAdmin) return list;
      return list.filter(
        (a) =>
          a.kind === "trainer_homework" &&
          (a.creatorId === creatorId || creatorId === "trainer-qatada")
      );
    },
    [isAdmin, creatorId]
  );

  const loadLocal = useCallback(() => {
    setAssignments(scopeFilter(getAllAssignments()));
  }, [scopeFilter]);

  const refreshFromCloud = useCallback(
    async (silent = false) => {
      setLoadingCloud(true);
      try {
        const synced = await syncAllAssignmentsSubmissionsFromCloud({
          includeInactive: true,
        });
        setAssignments(scopeFilter(synced));
        if (!silent) {
          showToast(true, "✅ تم تحديث قائمة المسابقات ونتائج الطلاب من قاعدة البيانات");
        }
      } finally {
        setLoadingCloud(false);
      }
    },
    [scopeFilter, showToast]
  );

  useEffect(() => {
    loadLocal();
    refreshFromCloud(true);

    const onUpdated = () => loadLocal();
    window.addEventListener("supermind:assignments-updated", onUpdated);
    return () => window.removeEventListener("supermind:assignments-updated", onUpdated);
  }, [loadLocal, refreshFromCloud]);

  // Derived stats
  const stats = useMemo(() => {
    const activeCount = assignments.filter((a) => a.isActive !== false).length;
    const pausedCount = assignments.length - activeCount;
    const totalSubmissions = assignments.reduce(
      (sum, a) => sum + (a.submissions?.length || 0),
      0
    );
    return {
      total: assignments.length,
      activeCount,
      pausedCount,
      totalSubmissions,
    };
  }, [assignments]);

  // Filtered list
  const filteredAssignments = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return assignments.filter((item) => {
      if (statusFilter === "active" && item.isActive === false) return false;
      if (statusFilter === "paused" && item.isActive !== false) return false;
      if (isAdmin && kindFilter !== "all" && item.kind !== kindFilter) return false;
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        (item.description || "").toLowerCase().includes(q) ||
        (item.creatorName || "").toLowerCase().includes(q)
      );
    });
  }, [assignments, searchQuery, statusFilter, kindFilter, isAdmin]);

  // Actions
  const handleToggleActive = async (item: PlatformAssignment) => {
    setBusyId(item.id);
    const nextActive = item.isActive === false;
    const res = await updatePlatformAssignmentAsync(item.id, { isActive: nextActive });
    setAssignments(scopeFilter(getAllAssignments()));
    setBusyId(null);
    if (res.error) {
      showToast(false, `⚠️ تعذر تحديث الحالة سحابياً: ${res.error}`);
    } else {
      showToast(
        true,
        nextActive
          ? `🟢 تم تفعيل «${item.title}» وظهورها للطلاب`
          : `⏸️ تم إيقاف «${item.title}» مؤقتاً (مع الاحتفاظ بجميع النتائج)`
      );
    }
  };

  const handleToggleNotify = async (item: PlatformAssignment) => {
    setBusyId(item.id);
    const nextNotify = item.notifyStudents === false;
    const res = await updatePlatformAssignmentAsync(item.id, {
      notifyStudents: nextNotify,
    });
    setAssignments(scopeFilter(getAllAssignments()));
    setBusyId(null);
    if (res.error) {
      showToast(false, `⚠️ تعذر تحديث الإشعار سحابياً: ${res.error}`);
    } else {
      showToast(
        true,
        nextNotify
          ? `🔔 تم تفعيل الإشعار الفوري للطلاب لمسابقة «${item.title}»`
          : `🔕 تم إيقاف الإشعار المنبثق لمسابقة «${item.title}»`
      );
    }
  };

  const handleDuplicate = async (item: PlatformAssignment) => {
    setBusyId(item.id);
    const res = await duplicatePlatformAssignmentAsync(item.id);
    setAssignments(scopeFilter(getAllAssignments()));
    setBusyId(null);
    if (res.error) {
      showToast(false, `⚠️ تم إنشاء نسخة محلية مع تنبيه مزامنة: ${res.error}`);
    } else {
      onAudioFx?.("fanfare");
      showToast(true, `📋 تم نسخ المسابقة بنجاح كمسابقة جديدة جاهزة للتعديل والمشاركة!`);
    }
  };

  const handleConfirmDelete = async (item: PlatformAssignment) => {
    setBusyId(item.id);
    setConfirmDeleteId(null);
    const res = await deletePlatformAssignmentAsync(item.id);
    setAssignments(scopeFilter(getAllAssignments()));
    setBusyId(null);
    if (!res.ok && res.error) {
      showToast(false, `⚠️ تم حذفها محلياً، تنبيه قاعدة البيانات: ${res.error}`);
    } else {
      showToast(true, `🗑️ تم حذف «${item.title}» نهائياً ولن تظهر مجدداً بعد تحديث الصفحة`);
    }
  };

  const formatTargetBadge = (item: PlatformAssignment) => {
    if (item.targetStudentIds && item.targetStudentIds.length > 0) {
      return `🎯 طلاب محددون (${item.targetStudentIds.length})`;
    }
    switch (item.targetType) {
      case "all_students":
        return "🌍 جميع طلاب المنصة";
      case "active_subscribers":
        return "👑 المشتركون الفعّالون";
      case "by_governorate":
        return `📍 محافظة ${item.targetValue || ""}`;
      case "by_level":
        return `📚 ${item.targetValue || "مستوى محدد"}`;
      case "trainer_students":
        return "👥 جميع طلاب المدرب";
      default:
        return "🎯 فئة مخصصة";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white border border-amber-400/30 shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-[11px] font-black">
            <Sparkles className="w-3.5 h-3.5" />
            <span>
              {isAdmin
                ? "مركز التحكم الكامل بالمسابقات والبطولات — حصري للإدارة"
                : "مركز إدارة بطولات ومسابقات المدرب الخاصة"}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black">
            {isAdmin
              ? "🏆 إدارة المسابقات والتحديات الرسمية والواجبات العامة"
              : "🏆 بطولاتي ومسابقاتي الخاصة بالطلاب"}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
            {isAdmin
              ? "تحكّم كامل ومرونة عالية: أنشئ مسابقات متعددة القواعد، عدّلها، أوقفها مؤقتاً أو فعّلها، تحكّم بالإشعارات الفورية للطلاب، انسخها، احذفها نهائياً، وراجع تقارير جميع الطلاب ومحاولاتهم."
              : "أنشئ بطولاتك الخاصة بقواعد متعددة لطلابك، عدّل إعداداتها في أي وقت، أوقفها أو فعّلها، شارك روابطها عبر واتساب، وتابع نتائج طلابك بالتفصيل مع سجل جميع المحاولات."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0 w-full lg:w-auto">
          <button
            type="button"
            disabled={loadingCloud}
            onClick={() => refreshFromCloud(false)}
            className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-black text-xs flex items-center gap-1.5 transition-colors disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${loadingCloud ? "animate-spin" : ""}`} />
            <span>تحديث السحابة</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setEditingAssignment(null);
              setShowEditorModal(true);
            }}
            className="flex-1 lg:flex-initial px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 text-slate-950 font-black text-xs sm:text-sm shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>
              {isAdmin ? "إنشاء مسابقة جديدة 🏆" : "إنشاء بطولة لطلابي 🏆"}
            </span>
          </button>
        </div>
      </div>

      {/* Live Toast Notification */}
      {toast && (
        <div
          className={`p-3.5 rounded-2xl border text-xs sm:text-sm font-black flex items-center gap-2 animate-in fade-in ${
            toast.ok
              ? "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200"
              : "bg-rose-50 dark:bg-rose-950/50 border-rose-300 dark:border-rose-700 text-rose-800 dark:text-rose-200"
          }`}
        >
          {toast.ok ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 shrink-0" />
          )}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500">إجمالي المسابقات</div>
          <div className="text-2xl font-black font-mono text-slate-900 dark:text-white mt-1">
            {stats.total}
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/70">
          <div className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
            🟢 فعّالة الآن
          </div>
          <div className="text-2xl font-black font-mono text-emerald-700 dark:text-emerald-300 mt-1">
            {stats.activeCount}
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/70">
          <div className="text-[11px] font-bold text-amber-800 dark:text-amber-300">
            ⏸️ متوقفة مؤقتاً
          </div>
          <div className="text-2xl font-black font-mono text-amber-800 dark:text-amber-300 mt-1">
            {stats.pausedCount}
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/70">
          <div className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            <span>نتائج الطلاب المسجلة</span>
          </div>
          <div className="text-2xl font-black font-mono text-indigo-700 dark:text-indigo-300 mt-1">
            {stats.totalSubmissions}
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث باسم المسابقة أو الوصف أو اسم المدرب..."
            className="w-full pr-10 pl-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold outline-none focus:border-brand-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-[11px] font-black">
            {(
              [
                { id: "all", label: "الكل" },
                { id: "active", label: "فعّالة 🟢" },
                { id: "paused", label: "متوقفة ⏸️" },
              ] as const
            ).map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setStatusFilter(s.id)}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  statusFilter === s.id
                    ? "bg-brand-600 text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-300"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {isAdmin && (
            <select
              value={kindFilter}
              onChange={(e) =>
                setKindFilter(
                  e.target.value as
                    | "all"
                    | "admin_competition"
                    | "admin_challenge"
                    | "trainer_homework"
                )
              }
              className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-black"
            >
              <option value="all">جميع الأنواع</option>
              <option value="admin_competition">🏆 مسابقات الإدارة</option>
              <option value="admin_challenge">⚡ تحديات أسبوعية</option>
              <option value="trainer_homework">🎓 بطولات المدربين</option>
            </select>
          )}
        </div>
      </div>

      {/* Competitions Cards List */}
      {filteredAssignments.length === 0 ? (
        <div className="p-10 rounded-3xl bg-white dark:bg-slate-900 border-2 border-dashed border-slate-300 dark:border-slate-700 text-center space-y-3">
          <Trophy className="w-12 h-12 text-amber-400 mx-auto opacity-80" />
          <h3 className="text-base sm:text-lg font-black text-slate-800 dark:text-white">
            {assignments.length === 0
              ? "لا توجد مسابقات حالياً — ابدأ بإنشاء أول مسابقة!"
              : "لا توجد مسابقات تطابق خيارات البحث أو التصفية"}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            اضغط على زر «إنشاء مسابقة جديدة» لضبط القواعد المتعددة والوقت والفئة المستهدفة ومشاركتها فوراً مع الطلاب.
          </p>
          {assignments.length === 0 && (
            <button
              type="button"
              onClick={() => {
                setEditingAssignment(null);
                setShowEditorModal(true);
              }}
              className="px-6 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm inline-flex items-center gap-2 shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>إنشاء أول مسابقة الآن 🚀</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {filteredAssignments.map((item) => {
            const isBusy = busyId === item.id;
            const isPaused = item.isActive === false;
            const notifyOn = item.notifyStudents !== false;
            const relPath = buildShareableAssignmentPath(item);
            const fullShareUrl =
              typeof window !== "undefined"
                ? `${window.location.origin}${relPath}`
                : relPath;
            const waShareHref = `https://wa.me/?text=${encodeURIComponent(
              `🏆 ${item.kind === "trainer_homework" ? "بطولة تدريبية" : "مسابقة رسمية"} — منصة العقل الخارق (SUPER MIND):\n📌 ${item.title}\n🔢 عدد الأسئلة: ${item.questionsCount} سؤال | ⏱ الوقت: ${
                item.timeMode === "stopwatch" ? "تايمر مفتوح" : `${item.timeLimitMinutes} دقائق`
              }\n🚀 اضغط الرابط للدخول والمنافسة بحسابك الرسمي الآن:\n${fullShareUrl}`
            )}`;

            return (
              <div
                key={item.id}
                className={`rounded-3xl border-2 p-5 sm:p-6 shadow-sm flex flex-col justify-between gap-4 transition-all ${
                  isPaused
                    ? "bg-slate-50/90 dark:bg-slate-900/60 border-slate-300 dark:border-slate-700 opacity-90"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-brand-300 dark:hover:border-brand-700"
                }`}
              >
                <div className="space-y-3.5">
                  {/* Top Badges Row */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-black ${
                          isPaused
                            ? "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                            : "bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300"
                        }`}
                      >
                        {isPaused ? "⏸️ متوقفة مؤقتاً" : "🟢 فعّالة"}
                      </span>
                      <span className="px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 font-black text-[11px]">
                        {item.kind === "admin_competition"
                          ? "🏆 مسابقة إدارة"
                          : item.kind === "admin_challenge"
                          ? "⚡ تحدي أسبوعي"
                          : `🎓 بطولة المدرب (${item.creatorName})`}
                      </span>
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-black ${
                          notifyOn
                            ? "bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                        }`}
                      >
                        {notifyOn ? "🔔 إشعار مفعّل" : "🔕 بدون إشعار"}
                      </span>
                    </div>

                    <span className="text-[10px] font-bold text-slate-400">
                      {new Date(item.createdAt).toLocaleDateString("ar-IQ")}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {item.description}
                      </p>
                    )}
                  </div>

                  {/* Specs & Audience Chips */}
                  <div className="flex flex-wrap gap-1.5 text-[11px] font-bold">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-brand-500" />
                      <span>{item.questionsCount} سؤال</span>
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      <span>
                        {item.timeMode === "stopwatch"
                          ? "تايمر مفتوح"
                          : `${item.timeLimitMinutes} دقيقة`}
                      </span>
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
                      {item.answerMode === "choices"
                        ? `🔘 ${item.choicesCount} اختيارات`
                        : "✍️ كتابة الجواب"}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                      {formatTargetBadge(item)}
                    </span>
                  </div>

                  {/* Multi-Rule Groups */}
                  {item.ruleGroups && item.ruleGroups.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {item.ruleGroups.map((g, gi) => (
                        <span
                          key={g.id || gi}
                          className="px-2.5 py-1 rounded-lg bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800 text-[11px] font-bold"
                        >
                          ({gi + 1}) {formatRuleGroupShortAr(g)}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Flexible Control Action Bar */}
                  <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => {
                        setEditingAssignment(item);
                        setShowEditorModal(true);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-brand-50 dark:hover:bg-brand-950/50 border border-slate-200 dark:border-slate-700 text-brand-700 dark:text-brand-300 font-black text-[11px] flex items-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>تعديل</span>
                    </button>

                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => handleToggleActive(item)}
                      className={`px-3 py-1.5 rounded-xl border font-black text-[11px] flex items-center gap-1 ${
                        isPaused
                          ? "bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950/60 border-emerald-300 text-emerald-800 dark:text-emerald-300"
                          : "bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/60 border-amber-300 text-amber-900 dark:text-amber-300"
                      }`}
                    >
                      {isBusy ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : isPaused ? (
                        <PlayCircle className="w-3.5 h-3.5" />
                      ) : (
                        <PauseCircle className="w-3.5 h-3.5" />
                      )}
                      <span>{isPaused ? "تفعيل" : "إيقاف مؤقت"}</span>
                    </button>

                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => handleToggleNotify(item)}
                      className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-indigo-50 border border-slate-200 dark:border-slate-700 text-indigo-700 dark:text-indigo-300 font-black text-[11px] flex items-center gap-1"
                    >
                      {notifyOn ? (
                        <>
                          <BellOff className="w-3.5 h-3.5" />
                          <span>كتم الإشعار</span>
                        </>
                      ) : (
                        <>
                          <Bell className="w-3.5 h-3.5" />
                          <span>تفعيل الإشعار</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => handleDuplicate(item)}
                      className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-black text-[11px] flex items-center gap-1"
                    >
                      <Files className="w-3.5 h-3.5" />
                      <span>نسخ</span>
                    </button>

                    {confirmDeleteId === item.id ? (
                      <div className="flex items-center gap-1 mr-auto">
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => handleConfirmDelete(item)}
                          className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-[11px]"
                        >
                          تأكيد الحذف النهائي 🗑️
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-[11px]"
                        >
                          إلغاء
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => setConfirmDeleteId(item.id)}
                        className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-300 font-black text-[11px] flex items-center gap-1 mr-auto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>حذف نهائي</span>
                      </button>
                    )}
                  </div>

                  {/* Student Results Leaderboard */}
                  {item.submissions && item.submissions.length > 0 ? (
                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                      <div className="flex items-center justify-between text-xs font-black text-amber-600">
                        <span>🥇 نتائج الطلاب المشاركين ({item.submissions.length}):</span>
                      </div>
                      <div className="space-y-1.5 max-h-48 overflow-y-auto">
                        {item.submissions.map((sub, idx) => {
                          const attemptNum = Math.max(
                            1,
                            sub.attemptNumber || sub.attempts?.length || 1
                          );
                          return (
                            <div
                              key={`${sub.studentId}-${idx}`}
                              className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold bg-white dark:bg-slate-900 px-3 py-2 rounded-xl border border-slate-100 dark:border-slate-800"
                            >
                              <div className="space-y-0.5">
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <span>
                                    {idx === 0
                                      ? "🥇"
                                      : idx === 1
                                      ? "🥈"
                                      : idx === 2
                                      ? "🥉"
                                      : `#${idx + 1}`}{" "}
                                    {sub.studentName}
                                  </span>
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                                      attemptNum >= 2
                                        ? "bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-300/70 dark:border-indigo-700"
                                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                                    }`}
                                  >
                                    {attemptNum >= 2 ? "🔄 " : ""}
                                    {formatAttemptLabelAr(attemptNum)}
                                  </span>
                                  {sub.governorate && (
                                    <span className="text-[10px] text-slate-400">
                                      ({sub.governorate})
                                    </span>
                                  )}
                                </div>
                                {sub.attempts && sub.attempts.length > 1 && (
                                  <div className="text-[10px] text-slate-500 flex flex-wrap gap-1.5">
                                    {sub.attempts.map((att, aIdx) => (
                                      <span key={`${att.attemptNumber}-${aIdx}`}>
                                        {formatAttemptLabelAr(att.attemptNumber)}:{" "}
                                        <span className="font-mono">
                                          {att.correctAnswers}/{att.totalQuestions} ({att.accuracy}%)
                                        </span>
                                        {aIdx < (sub.attempts?.length || 0) - 1 ? " • " : ""}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-emerald-600 dark:text-emerald-400">
                                  {sub.correctAnswers}/{sub.totalQuestions} ({sub.accuracy}%) •{" "}
                                  {sub.durationSeconds}ث
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setSelectedDetail({
                                      submission: sub,
                                      title: item.title,
                                      rank: idx + 1,
                                    })
                                  }
                                  className="px-2.5 py-1 rounded-lg bg-brand-100 hover:bg-brand-200 dark:bg-brand-950/70 text-brand-700 dark:text-brand-300 font-black text-[11px] flex items-center gap-1"
                                >
                                  <FileBarChart2 className="w-3.5 h-3.5" />
                                  <span>التفاصيل</span>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700 text-center text-[11px] font-bold text-slate-500">
                      لا توجد نتائج مسجلة بعد — شارك رابط المسابقة مع الطلاب وستظهر نتائجهم ومحاولاتهم هنا تلقائياً
                    </div>
                  )}
                </div>

                {/* Bottom Share & Preview Row */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (typeof navigator !== "undefined" && navigator.clipboard) {
                        navigator.clipboard.writeText(fullShareUrl);
                        setCopiedId(item.id);
                        setTimeout(() => setCopiedId(null), 2000);
                        showToast(true, "🔗 تم نسخ رابط المسابقة المباشر!");
                      }
                    }}
                    className="px-3.5 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 font-black text-xs flex items-center gap-1.5"
                  >
                    {copiedId === item.id ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{copiedId === item.id ? "تم النسخ!" : "نسخ الرابط"}</span>
                  </button>
                  <a
                    href={waShareHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>مشاركة واتساب</span>
                  </a>
                  <Link
                    href={relPath}
                    className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>معاينة البطولة</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Full Multi-Rule Competition Modal */}
      <AdminCompetitionCreatorModal
        open={showEditorModal}
        onClose={() => {
          setShowEditorModal(false);
          setEditingAssignment(null);
        }}
        mode={mode}
        creatorId={creatorId}
        creatorName={creatorName}
        trainerStudents={trainerStudents}
        editingAssignment={editingAssignment}
        onCreated={(saved, isEdit) => {
          setAssignments(scopeFilter(getAllAssignments()));
          onAudioFx?.("fanfare");
          showToast(
            true,
            isEdit
              ? `✅ تم حفظ تعديلات «${saved.title}» ومزامنتها بنجاح!`
              : `🎉 تم إنشاء ونشر «${saved.title}» بنجاح!`
          );
        }}
      />

      {/* Detailed Student Result Report Modal */}
      <StudentResultDetailModal
        submission={selectedDetail?.submission || null}
        assignmentTitle={selectedDetail?.title}
        rank={selectedDetail?.rank}
        onClose={() => setSelectedDetail(null)}
      />
    </div>
  );
}
