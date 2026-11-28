"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Trophy,
  Users,
  Share2,
  Copy,
  Check,
  MessageCircle,
  RefreshCw,
  Trash2,
  Bell,
  X,
  Medal,
  Clock,
  Layers,
  ExternalLink,
  FileBarChart2,
} from "lucide-react";
import {
  PlatformAssignment,
  AssignmentSubmission,
  AssignmentRuleGroup,
  ExtendedUserProfile,
  createPlatformAssignmentAsync,
  deletePlatformAssignmentAsync,
  getAllAssignments,
  getAllExtendedProfiles,
  getTrainerAcceptedStudents,
  syncAllAssignmentsSubmissionsFromCloud,
  buildShareableAssignmentPath,
  formatRuleGroupShortAr,
  formatAttemptLabelAr,
} from "@/lib/platform-store";
import StudentResultDetailModal from "@/components/competition/StudentResultDetailModal";

interface TrainerTournamentModalProps {
  open: boolean;
  onClose: () => void;
  creatorId: string;
  creatorName: string;
  creatorRole: "trainer" | "admin";
  ruleGroups: AssignmentRuleGroup[];
  totalQuestionsCount: number;
  timeMode: "countdown" | "stopwatch";
  durationMinutes: number;
  answerMode: "typing" | "choices";
  choicesCount: 2 | 3 | 4 | 5;
  orderMode: "sequential" | "shuffled";
  displayMode: "sheet" | "focus";
  voiceMode: "arabic" | "english" | "off";
  onCreated?: (created: PlatformAssignment) => void;
}

export function TrainerTournamentModal({
  open,
  onClose,
  creatorId,
  creatorName,
  creatorRole,
  ruleGroups,
  totalQuestionsCount,
  timeMode,
  durationMinutes,
  answerMode,
  choicesCount,
  orderMode,
  displayMode,
  voiceMode,
  onCreated,
}: TrainerTournamentModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [audienceMode, setAudienceMode] = useState<
    "trainer_students" | "selected_students" | "all_students"
  >("trainer_students");
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [notifyStudents, setNotifyStudents] = useState(true);
  const [createdTournament, setCreatedTournament] = useState<PlatformAssignment | null>(null);
  const [copied, setCopied] = useState(false);

  // Gather trainer's linked students (accepted links + profiles linked via trainerId)
  const [myStudents, setMyStudents] = useState<Array<{ id: string; name: string; level?: string }>>([]);

  useEffect(() => {
    if (!open) return;
    const accepted = getTrainerAcceptedStudents(creatorId);
    const profiles = getAllExtendedProfiles().filter(
      (p) => p.role === "student" && (p.trainerId === creatorId || creatorRole === "admin")
    );
    const map = new Map<string, { id: string; name: string; level?: string }>();
    accepted.forEach((l) => {
      map.set(l.studentId, { id: l.studentId, name: l.studentName });
    });
    profiles.forEach((p: ExtendedUserProfile) => {
      if (!map.has(p.id)) {
        map.set(p.id, { id: p.id, name: p.name, level: p.currentLevel });
      }
    });
    setMyStudents(Array.from(map.values()));
    setCreatedTournament(null);
    setCopied(false);
  }, [open, creatorId, creatorRole]);

  if (!open) return null;

  const firstGroup = ruleGroups[0];
  const digitMap: Record<number, PlatformAssignment["digitPlace"]> = {
    1: "units",
    2: "tens",
    3: "hundreds",
    4: "thousands",
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const targetType: PlatformAssignment["targetType"] =
      audienceMode === "all_students"
        ? "all_students"
        : "trainer_students";

    const { assignment: created } = await createPlatformAssignmentAsync({
      kind: creatorRole === "admin" ? "admin_competition" : "trainer_homework",
      title: title.trim(),
      description:
        description.trim() ||
        `بطولة تدريبية مخصصة من ${creatorName} — ${totalQuestionsCount} سؤال (${ruleGroups.length} ${
          ruleGroups.length > 1 ? "قواعد متعددة" : "قاعدة"
        })`,
      creatorId,
      creatorName,
      creatorRole,
      targetType,
      targetStudentIds:
        audienceMode === "selected_students" && selectedStudentIds.length > 0
          ? selectedStudentIds
          : undefined,
      exerciseType: "competition",
      rulesLevel: firstGroup?.level || "simple",
      allowSubtraction: firstGroup?.allowSubtraction !== false,
      digitPlace: digitMap[firstGroup?.digitsCount || 1] || "units",
      termsCount: firstGroup?.termsCount || 4,
      questionsCount: totalQuestionsCount,
      timeLimitMinutes: timeMode === "countdown" ? durationMinutes : 15,
      timeMode,
      answerMode,
      choicesCount,
      displayMode,
      voiceMode,
      orderMode,
      ruleGroups: ruleGroups.map((g) => ({
        ...g,
        targetRules: [...g.targetRules],
      })),
      notifyStudents,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      isActive: true,
    });

    setCreatedTournament(created);
    onCreated?.(created);
  };

  const toggleStudent = (id: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const shareUrl = createdTournament
    ? `${typeof window !== "undefined" ? window.location.origin : "https://supermindiq.com"}${buildShareableAssignmentPath(
        createdTournament
      )}`
    : "";

  const waUrl = createdTournament
    ? `https://wa.me/?text=${encodeURIComponent(
        `🏆 بطولة حساب ذهني من ${creatorName} (منصة العقل الخارق):\n📌 ${createdTournament.title}\n📋 عدد الأسئلة: ${createdTournament.questionsCount} سؤال | ⏱ الوقت: ${
          createdTournament.timeMode === "stopwatch"
            ? "تايمر مفتوح"
            : `${createdTournament.timeLimitMinutes} دقيقة`
        }\n🎯 القواعد: ${ruleGroups.map((g) => formatRuleGroupShortAr(g)).join(" + ")}\n🚀 اضغط الرابط للانضمام والبدء فوراً:\n${shareUrl}`
      )}`
    : "";

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 border-2 border-amber-400/70 shadow-2xl p-6 sm:p-7 my-8 space-y-5 text-right">
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center shadow-md">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                🏆 إنشاء بطولة لطلابي بهذه الإعدادات
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                سيتم حفظ جميع القواعد والوقت والطريقة تلقائياً ومشاركتها مع طلابك مع لوحة نتائج فورية
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Blueprint Preview of Current Simulator Settings */}
        <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 space-y-2">
          <div className="text-xs font-black text-amber-900 dark:text-amber-300 flex flex-wrap items-center gap-2">
            <span>📋 ملخص إعدادات المحاكي المعتمدة للبطولة:</span>
            <span className="px-2 py-0.5 rounded-lg bg-amber-400/30">
              {totalQuestionsCount} سؤال
            </span>
            <span className="px-2 py-0.5 rounded-lg bg-amber-400/30">
              {timeMode === "countdown" ? `⏱ ${durationMinutes} دقيقة` : "⏱ تايمر مفتوح"}
            </span>
            <span className="px-2 py-0.5 rounded-lg bg-amber-400/30">
              {answerMode === "typing" ? "✍️ كتابة الجواب" : `🔘 ${choicesCount} اختيارات`}
            </span>
            <span className="px-2 py-0.5 rounded-lg bg-amber-400/30">
              {orderMode === "shuffled" ? "🔀 خلط عشوائي" : "📑 بالتتابع"}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {ruleGroups.map((g, i) => (
              <span
                key={g.id}
                className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-amber-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-200"
              >
                ({i + 1}) {formatRuleGroupShortAr(g)}
              </span>
            ))}
          </div>
        </div>

        {createdTournament ? (
          /* Success & Instant Share View */
          <div className="space-y-4 animate-in fade-in">
            <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-center space-y-2">
              <div className="text-3xl">🎉</div>
              <h4 className="text-base font-black text-emerald-800 dark:text-emerald-300">
                تم إطلاق البطولة بنجاح وإشعار طلابك!
              </h4>
              <p className="text-xs text-emerald-700 dark:text-emerald-200">
                شارك الرابط التالي مع طلابك، وستظهر نتائج كل طالب وترتيبه تلقائياً في تبويب «بطولاتي ونتائج الطلاب».
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-2">
              <input
                type="text"
                readOnly
                dir="ltr"
                value={shareUrl}
                className="flex-1 bg-transparent text-xs font-mono text-slate-700 dark:text-slate-200 outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(shareUrl);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2200);
                }}
                className="px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-black text-xs flex items-center gap-1.5 shrink-0"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? "تم النسخ!" : "نسخ الرابط"}</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2.5">
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center gap-2 shadow-md"
              >
                <MessageCircle className="w-4 h-4" />
                <span>مشاركة مباشرة عبر واتساب</span>
              </a>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-xs"
              >
                إغلاق والعودة للمحاكي
              </button>
            </div>
          </div>
        ) : (
          /* Creation Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700 dark:text-slate-200 block">
                عنوان البطولة *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="مثال: بطولة الجمعة للأبطال — المستوى الأول"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700 dark:text-slate-200 block">
                رسالة أو تعليمات للطلاب (اختياري)
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="مثال: ركّز جيداً، الفائزون الثلاثة الأوائل سيحصلون على شهادات تميّز!"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
              />
            </div>

            {/* Audience Selector */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700 dark:text-slate-200 block">
                لمن تُوجَّه هذه البطولة؟
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setAudienceMode("trainer_students")}
                  className={`p-3 rounded-xl border text-right text-xs font-black transition-all ${
                    audienceMode === "trainer_students"
                      ? "bg-brand-600 text-white border-brand-600 shadow-md"
                      : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
                  }`}
                >
                  <div>🎓 جميع طلابي المضافين</div>
                  <div className="text-[10px] opacity-80 mt-0.5">+ إمكانية المشاركة بالرابط</div>
                </button>
                <button
                  type="button"
                  onClick={() => setAudienceMode("selected_students")}
                  className={`p-3 rounded-xl border text-right text-xs font-black transition-all ${
                    audienceMode === "selected_students"
                      ? "bg-brand-600 text-white border-brand-600 shadow-md"
                      : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
                  }`}
                >
                  <div>✅ اختيار طلاب محددين</div>
                  <div className="text-[10px] opacity-80 mt-0.5">
                    ({myStudents.length} طالب مضاف لديك)
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setAudienceMode("all_students")}
                  className={`p-3 rounded-xl border text-right text-xs font-black transition-all ${
                    audienceMode === "all_students"
                      ? "bg-brand-600 text-white border-brand-600 shadow-md"
                      : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
                  }`}
                >
                  <div>🔗 مفتوحة عبر الرابط للجميع</div>
                  <div className="text-[10px] opacity-80 mt-0.5">أي طالب يفتح الرابط يشارك</div>
                </button>
              </div>
            </div>

            {audienceMode === "selected_students" && (
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="text-xs font-black text-slate-700 dark:text-slate-200 flex items-center justify-between">
                  <span>اختر الطلاب المشاركين:</span>
                  <span className="text-brand-600">
                    تم تحديد {selectedStudentIds.length} طالب
                  </span>
                </div>
                {myStudents.length === 0 ? (
                  <p className="text-xs text-slate-500">
                    لا يوجد طلاب مرتبطون بحسابك حالياً. يمكنك إطلاق البطولة ومشاركتها عبر الرابط المباشر أو إضافة طلابك من لوحة المدرب.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-40 overflow-y-auto">
                    {myStudents.map((st) => {
                      const checked = selectedStudentIds.includes(st.id);
                      return (
                        <label
                          key={st.id}
                          className={`flex items-center gap-2 p-2 rounded-xl border cursor-pointer text-xs font-bold ${
                            checked
                              ? "bg-brand-50 dark:bg-brand-950/50 border-brand-400 text-brand-800 dark:text-brand-200"
                              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleStudent(st.id)}
                            className="accent-brand-600 rounded"
                          />
                          <span className="truncate">{st.name}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Notification Toggle */}
            <label className="flex items-center justify-between p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 cursor-pointer">
              <div className="flex items-center gap-2 text-xs font-black text-indigo-900 dark:text-indigo-200">
                <Bell className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>إظهار إشعار فوري للطلاب المستهدفين عند فتح التطبيق</span>
              </div>
              <input
                type="checkbox"
                checked={notifyStudents}
                onChange={(e) => setNotifyStudents(e.target.checked)}
                className="w-4 h-4 accent-indigo-600 rounded"
              />
            </label>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs sm:text-sm shadow-lg flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                <span>إطلاق البطولة وإنشاء الرابط 🚀</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

interface TrainerTournamentsBoardProps {
  open: boolean;
  onClose: () => void;
  creatorId: string;
  isAdmin: boolean;
  refreshTrigger?: number;
}

export function TrainerTournamentsBoard({
  open,
  onClose,
  creatorId,
  isAdmin,
  refreshTrigger = 0,
}: TrainerTournamentsBoardProps) {
  const [tournaments, setTournaments] = useState<PlatformAssignment[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<{
    submission: AssignmentSubmission;
    title: string;
    rank: number;
  } | null>(null);

  const loadList = useCallback(async (withCloud = false) => {
    const filterMine = (all: PlatformAssignment[]) =>
      isAdmin
        ? all
        : all.filter((a) => a.creatorId === creatorId || a.creatorId === "trainer-qatada");

    setTournaments(filterMine(getAllAssignments()));
    if (withCloud) {
      setSyncing(true);
      const synced = await syncAllAssignmentsSubmissionsFromCloud({ includeInactive: true });
      setTournaments(filterMine(synced));
      setSyncing(false);
    }
  }, [creatorId, isAdmin]);

  useEffect(() => {
    if (open) {
      loadList(true);
    }
  }, [open, refreshTrigger, loadList]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-3xl bg-white dark:bg-slate-900 border-2 border-brand-400/60 shadow-2xl p-5 sm:p-7 my-8 space-y-5 max-h-[88vh] flex flex-col">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-brand-600 text-white flex items-center justify-center shadow-md">
              <Medal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                📊 بطولاتي ونتائج الطلاب المباشرة
              </h3>
              <p className="text-xs text-slate-500">
                تابع ترتيب طلابك ودقتهم وأزمنتهم في كل بطولة، وشارك الرابط في أي وقت
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => loadList(true)}
              disabled={syncing}
              className="px-3.5 py-2 rounded-xl bg-brand-50 hover:bg-brand-100 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 font-black text-xs flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
              <span>تحديث النتائج</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tournaments List */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {tournaments.length === 0 ? (
            <div className="p-10 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-center space-y-2">
              <div className="text-3xl">🏆</div>
              <p className="text-sm font-black text-slate-700 dark:text-slate-200">
                لم تقم بإنشاء أي بطولة لطلابك بعد
              </p>
              <p className="text-xs text-slate-500">
                اضبط إعدادات القواعد والوقت في محاكي المسابقة ثم اضغط زر «بطولة لطلابي 🏆».
              </p>
            </div>
          ) : (
            tournaments.map((t) => {
              const relPath = buildShareableAssignmentPath(t);
              const fullUrl =
                typeof window !== "undefined" ? `${window.location.origin}${relPath}` : relPath;
              const waHref = `https://wa.me/?text=${encodeURIComponent(
                `🏆 بطولة جديدة من ${t.creatorName}:\n📌 ${t.title}\n📋 ${t.questionsCount} سؤال • ⏱ ${t.timeLimitMinutes} دقيقة\n🚀 رابط المشاركة:\n${fullUrl}`
              )}`;

              return (
                <div
                  key={t.id}
                  className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3.5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-black">
                          {t.kind === "admin_competition"
                            ? "🏆 مسابقة رسمية"
                            : t.kind === "admin_challenge"
                            ? "⚡ تحدي"
                            : "🎓 بطولة مدرب"}
                        </span>
                        <span className="text-[11px] font-bold text-slate-500">
                          {new Date(t.createdAt).toLocaleDateString("ar-IQ")}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-black flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          <span>{t.submissions?.length || 0} مشارك</span>
                        </span>
                      </div>
                      <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                        {t.title}
                      </h4>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText(fullUrl);
                          setCopiedId(t.id);
                          setTimeout(() => setCopiedId(null), 2000);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-[11px] flex items-center gap-1"
                      >
                        {copiedId === t.id ? (
                          <Check className="w-3.5 h-3.5" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        <span>{copiedId === t.id ? "نُسخ!" : "نسخ الرابط"}</span>
                      </button>
                      <a
                        href={waHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>واتساب</span>
                      </a>
                      <Link
                        href={relPath}
                        onClick={onClose}
                        className="px-2.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-[11px] flex items-center gap-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>فتح</span>
                      </Link>
                      <button
                        type="button"
                        onClick={async () => {
                          await deletePlatformAssignmentAsync(t.id);
                          loadList(false);
                        }}
                        className="p-1.5 rounded-xl bg-rose-100 hover:bg-rose-200 dark:bg-rose-950/60 text-rose-600"
                        title="حذف البطولة"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Rule Groups Chips */}
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-bold">
                    <span className="px-2 py-0.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center gap-1">
                      <Layers className="w-3 h-3 text-brand-500" />
                      <span>{t.questionsCount} سؤال</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-500" />
                      <span>
                        {t.timeMode === "stopwatch" ? "تايمر مفتوح" : `${t.timeLimitMinutes} د`}
                      </span>
                    </span>
                    {t.ruleGroups && t.ruleGroups.length > 0 &&
                      t.ruleGroups.map((g, i) => (
                        <span
                          key={g.id || i}
                          className="px-2 py-0.5 rounded-lg bg-brand-50 dark:bg-brand-950/50 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800"
                        >
                          {formatRuleGroupShortAr(g)}
                        </span>
                      ))}
                  </div>

                  {/* Student Results Leaderboard */}
                  {t.submissions && t.submissions.length > 0 ? (
                    <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 overflow-hidden">
                      <div className="px-3.5 py-2 bg-slate-100/80 dark:bg-slate-800 text-[11px] font-black text-slate-700 dark:text-slate-200 flex items-center justify-between">
                        <span>🥇 لوحة نتائج الطلاب (الأعلى دقة والأسرع وقتاً)</span>
                        <span>{t.submissions.length} نتيجة مسجلة</span>
                      </div>
                      <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-52 overflow-y-auto">
                        {t.submissions.map((sub, idx) => {
                          const attemptNum = Math.max(
                            1,
                            sub.attemptNumber || sub.attempts?.length || 1
                          );
                          return (
                            <div
                              key={`${sub.studentId}-${idx}`}
                              className="px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs"
                            >
                              <div className="space-y-0.5">
                                <div className="flex flex-wrap items-center gap-1.5 font-bold">
                                  <span className="w-6 text-center font-black">
                                    {idx === 0
                                      ? "🥇"
                                      : idx === 1
                                      ? "🥈"
                                      : idx === 2
                                      ? "🥉"
                                      : `#${idx + 1}`}
                                  </span>
                                  <span className="text-slate-900 dark:text-white">
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
                                  <div className="pr-7 text-[10px] font-bold text-slate-500 flex flex-wrap gap-1.5">
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
                              <div className="flex items-center gap-2 font-mono text-[11px]">
                                <span className="font-black text-emerald-600 dark:text-emerald-400">
                                  {sub.correctAnswers}/{sub.totalQuestions} ({sub.accuracy}%)
                                </span>
                                <span className="text-slate-500">⏱ {sub.durationSeconds}ث</span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setSelectedDetail({
                                      submission: sub,
                                      title: t.title,
                                      rank: idx + 1,
                                    })
                                  }
                                  className="px-2.5 py-1 rounded-lg bg-brand-100 hover:bg-brand-200 dark:bg-brand-950/70 text-brand-700 dark:text-brand-300 font-sans font-black text-[11px] flex items-center gap-1"
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
                    <div className="p-3 rounded-xl bg-white/70 dark:bg-slate-900/50 border border-dashed border-slate-300 dark:border-slate-700 text-center text-xs text-slate-500">
                      بانتظار مشاركة أول طالب — انسخ الرابط وأرسله لطلابك وستظهر نتائجهم هنا مباشرة!
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      <StudentResultDetailModal
        submission={selectedDetail?.submission || null}
        assignmentTitle={selectedDetail?.title}
        rank={selectedDetail?.rank}
        onClose={() => setSelectedDetail(null)}
      />
    </div>
  );
}
