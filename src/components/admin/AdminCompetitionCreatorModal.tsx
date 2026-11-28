"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Copy,
  Layers,
  Clock,
  Timer,
  Shuffle,
  ListOrdered,
  Bell,
  X,
  Trophy,
  Sparkles,
  Check,
  MessageCircle,
  Loader2,
  Users,
} from "lucide-react";
import {
  AssignmentRuleGroup,
  PlatformAssignment,
  COUNTRIES_WITH_GOVERNORATES,
  createPlatformAssignmentAsync,
  updatePlatformAssignmentAsync,
  buildShareableAssignmentPath,
  formatRuleGroupShortAr,
} from "@/lib/platform-store";

interface AdminCompetitionCreatorModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (saved: PlatformAssignment, isEdit?: boolean) => void;
  mode?: "admin" | "trainer";
  creatorId?: string;
  creatorName?: string;
  trainerStudents?: Array<{ id: string; name: string; governorate?: string }>;
  editingAssignment?: PlatformAssignment | null;
}

const LEVELS_OPTIONS = [
  "المستوى التمهيدي",
  "المستوى الأول",
  "المستوى الثاني",
  "المستوى الثالث",
  "المستوى الرابع",
  "المستوى الخامس",
  "المستوى المتقدم",
];

const PRESET_MINUTES = [3, 5, 7, 10, 15, 20, 25, 30];

const DEFAULT_RULE_GROUP: AssignmentRuleGroup = {
  id: "admin-g-1",
  count: 20,
  digitsCount: 1,
  level: "simple",
  targetRules: [],
  termsCount: 4,
  allowSubtraction: true,
};

export default function AdminCompetitionCreatorModal({
  open,
  onClose,
  onCreated,
  mode = "admin",
  creatorId,
  creatorName,
  trainerStudents = [],
  editingAssignment = null,
}: AdminCompetitionCreatorModalProps) {
  const isTrainerMode = mode === "trainer";
  const isEditing = Boolean(editingAssignment);

  const [compKind, setCompKind] = useState<
    "admin_competition" | "admin_challenge" | "trainer_homework"
  >(isTrainerMode ? "trainer_homework" : "admin_competition");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetType, setTargetType] = useState<
    "all_students" | "active_subscribers" | "trainer_students" | "by_level" | "by_governorate"
  >(isTrainerMode ? "trainer_students" : "all_students");
  const [targetValue, setTargetValue] = useState("كربلاء المقدسة");
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [trainerAudienceMode, setTrainerAudienceMode] = useState<"all_my_students" | "selected_students">("all_my_students");
  const [notifyStudents, setNotifyStudents] = useState(true);
  const [isActive, setIsActive] = useState(true);

  // Full Competition Simulator Settings
  const [timeMode, setTimeMode] = useState<"countdown" | "stopwatch">("countdown");
  const [timeMinutes, setTimeMinutes] = useState(10);
  const [answerMode, setAnswerMode] = useState<"typing" | "choices">("typing");
  const [choicesCount, setChoicesCount] = useState<2 | 3 | 4 | 5>(4);
  const [orderMode, setOrderMode] = useState<"sequential" | "shuffled">("sequential");
  const [displayMode, setDisplayMode] = useState<"focus" | "sheet">("focus");
  const [voiceMode, setVoiceMode] = useState<"arabic" | "english" | "off">("arabic");

  // Multi-Rule Groups Builder (1 to N rules, up to 1000 total questions)
  const [ruleGroups, setRuleGroups] = useState<AssignmentRuleGroup[]>([DEFAULT_RULE_GROUP]);

  const [createdResult, setCreatedResult] = useState<PlatformAssignment | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setCreatedResult(null);
    setCopiedLink(false);
    setSaveError(null);
    setSaving(false);

    if (editingAssignment) {
      setCompKind(isTrainerMode ? "trainer_homework" : editingAssignment.kind);
      setTitle(editingAssignment.title || "");
      setDescription(editingAssignment.description || "");
      setTargetType(
        editingAssignment.targetType === "specific_student"
          ? "trainer_students"
          : editingAssignment.targetType || (isTrainerMode ? "trainer_students" : "all_students")
      );
      setTargetValue(editingAssignment.targetValue || "كربلاء المقدسة");
      if (editingAssignment.targetStudentIds && editingAssignment.targetStudentIds.length > 0) {
        setTrainerAudienceMode("selected_students");
        setSelectedStudentIds([...editingAssignment.targetStudentIds]);
      } else {
        setTrainerAudienceMode("all_my_students");
        setSelectedStudentIds([]);
      }
      setNotifyStudents(editingAssignment.notifyStudents !== false);
      setIsActive(editingAssignment.isActive !== false);
      setTimeMode(editingAssignment.timeMode || "countdown");
      setTimeMinutes(editingAssignment.timeLimitMinutes || 10);
      setAnswerMode(editingAssignment.answerMode || "typing");
      setChoicesCount(editingAssignment.choicesCount || 4);
      setOrderMode(editingAssignment.orderMode || "sequential");
      setDisplayMode(editingAssignment.displayMode || "focus");
      setVoiceMode(editingAssignment.voiceMode || "arabic");
      if (editingAssignment.ruleGroups && editingAssignment.ruleGroups.length > 0) {
        setRuleGroups(
          editingAssignment.ruleGroups.map((g, i) => ({
            ...g,
            id: g.id || `edit-g-${i + 1}`,
            targetRules: Array.isArray(g.targetRules) ? [...g.targetRules] : [],
          }))
        );
      } else {
        const digMap: Record<string, number> = { units: 1, tens: 2, hundreds: 3, thousands: 4 };
        setRuleGroups([
          {
            id: "edit-g-1",
            count: editingAssignment.questionsCount || 20,
            digitsCount: digMap[editingAssignment.digitPlace] || 1,
            level: editingAssignment.rulesLevel || "simple",
            targetRules: [],
            termsCount: editingAssignment.termsCount || 4,
            allowSubtraction: editingAssignment.allowSubtraction !== false,
          },
        ]);
      }
    } else {
      setCompKind(isTrainerMode ? "trainer_homework" : "admin_competition");
      setTitle("");
      setDescription("");
      setTargetType(isTrainerMode ? "trainer_students" : "all_students");
      setTargetValue("كربلاء المقدسة");
      setTrainerAudienceMode("all_my_students");
      setSelectedStudentIds([]);
      setNotifyStudents(true);
      setIsActive(true);
      setTimeMode("countdown");
      setTimeMinutes(10);
      setAnswerMode("typing");
      setChoicesCount(4);
      setOrderMode("sequential");
      setDisplayMode("focus");
      setVoiceMode("arabic");
      setRuleGroups([{ ...DEFAULT_RULE_GROUP, id: `g-${Date.now()}` }]);
    }
  }, [open, editingAssignment, isTrainerMode]);

  if (!open) return null;

  const rawTotal = ruleGroups.reduce(
    (s, g) => s + Math.max(1, Math.floor(g.count || 1)),
    0
  );
  const totalQuestions = Math.min(1000, rawTotal);

  const updateGroup = (id: string, patch: Partial<AssignmentRuleGroup>) => {
    setRuleGroups((prev) =>
      prev.map((g) => {
        if (g.id !== id) return g;
        const next = { ...g, ...patch };
        if (patch.level && patch.level !== "complex_5" && patch.level !== "complex_10") {
          next.targetRules = [];
        } else if (patch.level === "complex_5") {
          next.targetRules = next.targetRules.filter((r) => r >= 1 && r <= 4);
        }
        return next;
      })
    );
  };

  const toggleSubRule = (id: string, num: number) => {
    setRuleGroups((prev) =>
      prev.map((g) => {
        if (g.id !== id) return g;
        const has = g.targetRules.includes(num);
        return {
          ...g,
          targetRules: has
            ? g.targetRules.filter((n) => n !== num)
            : [...g.targetRules, num].sort((a, b) => a - b),
        };
      })
    );
  };

  const addGroup = () => {
    const last = ruleGroups[ruleGroups.length - 1];
    setRuleGroups((prev) => [
      ...prev,
      {
        id: `admin-g-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        count: 20,
        digitsCount: last?.digitsCount || 1,
        level: "complex_5",
        targetRules: [],
        termsCount: last?.termsCount || 4,
        allowSubtraction: last?.allowSubtraction ?? true,
      },
    ]);
  };

  const duplicateGroup = (g: AssignmentRuleGroup) => {
    setRuleGroups((prev) => [
      ...prev,
      {
        ...g,
        id: `admin-g-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        targetRules: [...g.targetRules],
      },
    ]);
  };

  const removeGroup = (id: string) => {
    if (ruleGroups.length <= 1) return;
    setRuleGroups((prev) => prev.filter((g) => g.id !== id));
  };

  const applyPresetMultiRules = () => {
    setRuleGroups([
      {
        id: "preset-a1",
        count: 20,
        digitsCount: 1,
        level: "simple",
        targetRules: [],
        termsCount: 4,
        allowSubtraction: true,
      },
      {
        id: "preset-a2",
        count: 20,
        digitsCount: 1,
        level: "complex_5",
        targetRules: [1, 2, 3, 4],
        termsCount: 5,
        allowSubtraction: true,
      },
      {
        id: "preset-a3",
        count: 10,
        digitsCount: 2,
        level: "complex_10",
        targetRules: [],
        termsCount: 5,
        allowSubtraction: true,
      },
    ]);
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setCreatedResult(null);
    setCopiedLink(false);
    setSaveError(null);
  };

  const toggleStudentSelection = (sid: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(sid) ? prev.filter((id) => id !== sid) : [...prev, sid]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || saving) return;

    setSaving(true);
    setSaveError(null);

    const first = ruleGroups[0];
    const digitMap: Record<number, PlatformAssignment["digitPlace"]> = {
      1: "units",
      2: "tens",
      3: "hundreds",
      4: "thousands",
    };

    const payload: Omit<PlatformAssignment, "id" | "createdAt" | "submissions"> = {
      kind: isTrainerMode ? "trainer_homework" : compKind,
      title: title.trim(),
      description:
        description.trim() ||
        (isTrainerMode
          ? `بطولة تدريبية من المدرب ${creatorName || "المدرب المعتمد"} (${totalQuestions} سؤال • ${ruleGroups.length} ${ruleGroups.length > 1 ? "قواعد متعددة" : "قاعدة"})`
          : `مسابقة وتحدي رسمي من إدارة منصة العقل الخارق (${totalQuestions} سؤال • ${ruleGroups.length} ${ruleGroups.length > 1 ? "قواعد متعددة" : "قاعدة"})`),
      creatorId:
        editingAssignment?.creatorId ||
        creatorId ||
        "trainer-qatada",
      creatorName:
        editingAssignment?.creatorName ||
        creatorName ||
        (isTrainerMode ? "المدرب المعتمد" : "إدارة منصة العقل الخارق (الأستاذ قتادة كريم)"),
      creatorRole: editingAssignment?.creatorRole || (isTrainerMode ? "trainer" : "admin"),
      targetType: isTrainerMode ? "trainer_students" : targetType,
      targetValue:
        !isTrainerMode && (targetType === "by_governorate" || targetType === "by_level")
          ? targetValue
          : undefined,
      targetStudentIds:
        isTrainerMode && trainerAudienceMode === "selected_students" && selectedStudentIds.length > 0
          ? selectedStudentIds
          : undefined,
      exerciseType: "competition",
      rulesLevel: first?.level || "simple",
      allowSubtraction: first?.allowSubtraction !== false,
      digitPlace: digitMap[first?.digitsCount || 1] || "units",
      termsCount: first?.termsCount || 4,
      questionsCount: totalQuestions,
      timeLimitMinutes: timeMode === "countdown" ? timeMinutes : 15,
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
      dueDate:
        editingAssignment?.dueDate ||
        new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      isActive,
    };

    try {
      if (editingAssignment) {
        const res = await updatePlatformAssignmentAsync(editingAssignment.id, payload);
        if (res.error) {
          setSaveError(res.error);
        }
        if (res.assignment) {
          onCreated(res.assignment, true);
          onClose();
        }
      } else {
        const res = await createPlatformAssignmentAsync(payload);
        if (res.error) {
          setSaveError(res.error);
        }
        setCreatedResult(res.assignment);
        onCreated(res.assignment, false);
      }
    } finally {
      setSaving(false);
    }
  };

  const shareUrl = createdResult
    ? `${typeof window !== "undefined" ? window.location.origin : "https://supermindiq.com"}${buildShareableAssignmentPath(
        createdResult
      )}`
    : "";

  const waShareUrl = createdResult
    ? `https://wa.me/?text=${encodeURIComponent(
        `🏆 مسابقة وتحدي رسمي من منصة العقل الخارق (SUPER MIND):\n📌 ${createdResult.title}\n📋 عدد الأسئلة: ${createdResult.questionsCount} سؤال | ⏱ الوقت: ${
          createdResult.timeMode === "stopwatch"
            ? "تايمر مفتوح"
            : `${createdResult.timeLimitMinutes} دقيقة`
        }\n🎯 القواعد: ${ruleGroups.map((g) => formatRuleGroupShortAr(g)).join(" + ")}\n🚀 اضغط الرابط للدخول والمنافسة الآن:\n${shareUrl}`
      )}`
    : "";

  return (
    <div className="fixed inset-0 z-[125] flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-3xl bg-white dark:bg-slate-900 border-2 border-amber-400/60 shadow-2xl p-5 sm:p-7 my-6 space-y-5 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md py-2 -mt-2 z-10 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center shadow-md">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                {isEditing
                  ? "✏️ تعديل إعدادات المسابقة / البطولة بالكامل"
                  : isTrainerMode
                  ? "🏆 إنشاء بطولة خاصة لطلابك بكامل إمكانيات محاكي المسابقة"
                  : "🏆 إنشاء مسابقة أو واجب عام بكامل إمكانيات محاكي المسابقة"}
              </h3>
              <p className="text-[11px] text-slate-500">
                دعم تعدد القواعد، المنازل، عدد الصفوف، طريقة الإجابة، التايمر، الإشعار التلقائي للطلاب، والرابط المباشر
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {createdResult ? (
          <div className="space-y-4 py-3 animate-in fade-in">
            <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-center space-y-2">
              <div className="text-4xl">🎉</div>
              <h4 className="text-lg font-black text-emerald-800 dark:text-emerald-300">
                تم نشر المسابقة بنجاح وإرسال إشعارها للفئة المستهدفة!
              </h4>
              <p className="text-xs text-emerald-700 dark:text-emerald-200">
                سيظهر إشعار المسابقة تلقائياً للطلاب المحددين عند فتح التطبيق، ويمكنك أيضاً مشاركتها فوراً بالرابط أدناه.
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
                  setCopiedLink(true);
                  setTimeout(() => setCopiedLink(false), 2000);
                }}
                className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-black text-xs flex items-center gap-1.5 shrink-0"
              >
                {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? "تم النسخ!" : "نسخ الرابط"}</span>
              </button>
            </div>

            <div className="flex flex-wrap justify-end gap-2">
              <a
                href={waShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center gap-1.5 shadow-md"
              >
                <MessageCircle className="w-4 h-4" />
                <span>مشاركة عبر واتساب</span>
              </a>
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  onClose();
                }}
                className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-xs"
              >
                إغلاق
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 1. Basic Info & Audience */}
            {saveError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-xs font-bold text-rose-700 dark:text-rose-300">
                ⚠️ تنبيه مزامنة: {saveError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {!isTrainerMode ? (
                <>
                  <div>
                    <label className="text-xs font-black block mb-1">نوع الفعالية</label>
                    <select
                      value={compKind}
                      onChange={(e) =>
                        setCompKind(
                          e.target.value as
                            | "admin_competition"
                            | "admin_challenge"
                            | "trainer_homework"
                        )
                      }
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                    >
                      <option value="admin_competition">🏆 مسابقة رسمية كبرى للمنصة</option>
                      <option value="admin_challenge">⚡ تحدي أسبوعي سريع</option>
                      <option value="trainer_homework">📝 واجب تدريبي عام</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-black block mb-1">الفئة المستهدفة للإشعار والمشاركة</label>
                    <select
                      value={targetType}
                      onChange={(e) => {
                        const v = e.target.value as
                          | "all_students"
                          | "active_subscribers"
                          | "by_level"
                          | "by_governorate";
                        setTargetType(v);
                        if (v === "by_level") setTargetValue(LEVELS_OPTIONS[1]);
                        if (v === "by_governorate") setTargetValue("كربلاء المقدسة");
                      }}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                    >
                      <option value="all_students">جميع الطلاب والمشتركين في المنصة</option>
                      <option value="active_subscribers">المشتركون الفعّالون فقط (الباقات المدفوعة)</option>
                      <option value="by_level">تحديد مستوى دراسي معين</option>
                      <option value="by_governorate">تحديد محافظة معينة</option>
                    </select>
                  </div>
                </>
              ) : (
                <div className="sm:col-span-2 p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 space-y-2.5">
                  <div className="text-xs font-black text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    <span>تحديد الطلاب المستهدفين بالبطولة والإشعار:</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setTrainerAudienceMode("all_my_students")}
                      className={`px-3 py-2.5 rounded-xl text-xs font-black border text-right ${
                        trainerAudienceMode === "all_my_students"
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
                      }`}
                    >
                      👥 جميع طلابي المرتبطين + أي طالب عبر الرابط
                    </button>
                    <button
                      type="button"
                      onClick={() => setTrainerAudienceMode("selected_students")}
                      className={`px-3 py-2.5 rounded-xl text-xs font-black border text-right ${
                        trainerAudienceMode === "selected_students"
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
                      }`}
                    >
                      🎯 اختيار طلاب محددين من قائمتي ({selectedStudentIds.length})
                    </button>
                  </div>
                  {trainerAudienceMode === "selected_students" && (
                    <div className="max-h-36 overflow-y-auto p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {trainerStudents.length === 0 ? (
                        <div className="col-span-2 text-center text-xs text-slate-500 py-2">
                          لا يوجد طلاب مضافون حالياً — يمكنك مشاركة رابط البطولة مباشرة مع طلابك.
                        </div>
                      ) : (
                        trainerStudents.map((st) => (
                          <label
                            key={st.id}
                            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer text-xs font-bold"
                          >
                            <input
                              type="checkbox"
                              checked={selectedStudentIds.includes(st.id)}
                              onChange={() => toggleStudentSelection(st.id)}
                              className="w-4 h-4 accent-indigo-600 rounded"
                            />
                            <span>{st.name}</span>
                            {st.governorate && (
                              <span className="text-[10px] text-slate-400">({st.governorate})</span>
                            )}
                          </label>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}

              {targetType === "by_governorate" && (
                <div>
                  <label className="text-xs font-black block mb-1">اختر المحافظة المستهدفة</label>
                  <select
                    value={targetValue}
                    onChange={(e) => setTargetValue(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                  >
                    {COUNTRIES_WITH_GOVERNORATES["العراق"].map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {targetType === "by_level" && (
                <div>
                  <label className="text-xs font-black block mb-1">اختر المستوى المستهدف</label>
                  <select
                    value={targetValue}
                    onChange={(e) => setTargetValue(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                  >
                    {LEVELS_OPTIONS.map((lvl) => (
                      <option key={lvl} value={lvl}>
                        {lvl}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="sm:col-span-2">
                <label className="text-xs font-black block mb-1">عنوان المسابقة أو الواجب *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: بطولة أبطال العقل الخارق الكبرى — القواعد المختلطة"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-black block mb-1">وصف وتعليمات المسابقة (اختياري)</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="مثال: حل جميع الأسئلة بأعلى دقة وأسرع وقت لتصدر لوحة الشرف الرسمية!"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                />
              </div>
            </div>

            {/* 2. Multi-Rule Groups Builder (إضافة أكثر من قاعدة في نفس المسابقة) */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                  <h4 className="text-sm font-black text-slate-900 dark:text-white">
                    مجموعات القواعد والأسئلة (إجمالي: {totalQuestions} سؤال • {ruleGroups.length} {ruleGroups.length > 1 ? "قواعد" : "قاعدة"})
                  </h4>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={applyPresetMultiRules}
                    className="px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 text-[11px] font-black flex items-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>توزيع 3 قواعد جاهز</span>
                  </button>
                  <button
                    type="button"
                    onClick={addGroup}
                    className="px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-[11px] font-black flex items-center gap-1 shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>إضافة قاعدة جديدة</span>
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {ruleGroups.map((g, idx) => (
                  <div
                    key={g.id}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-3 shadow-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-black text-brand-700 dark:text-brand-300">
                        المجموعة #{idx + 1}: {formatRuleGroupShortAr(g)}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => duplicateGroup(g)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                          title="نسخ المجموعة"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        {ruleGroups.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeGroup(g.id)}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600"
                            title="حذف المجموعة"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs">
                      <div>
                        <label className="text-[11px] font-bold text-slate-500 block mb-1">
                          عدد الأسئلة
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={1000}
                          value={g.count}
                          onChange={(e) =>
                            updateGroup(g.id, {
                              count: Math.max(1, Math.min(1000, Number(e.target.value) || 1)),
                            })
                          }
                          className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono font-black"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-500 block mb-1">
                          المنزلة / الخانات
                        </label>
                        <select
                          value={g.digitsCount}
                          onChange={(e) =>
                            updateGroup(g.id, { digitsCount: Number(e.target.value) })
                          }
                          className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                        >
                          <option value={1}>آحاد (1 خانة)</option>
                          <option value={2}>عشرات (2 خانة)</option>
                          <option value={3}>مئات (3 خانات)</option>
                          <option value={4}>ألوف (4 خانات)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-500 block mb-1">
                          القاعدة الحسابية
                        </label>
                        <select
                          value={g.level}
                          onChange={(e) =>
                            updateGroup(g.id, {
                              level: e.target.value as AssignmentRuleGroup["level"],
                            })
                          }
                          className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                        >
                          <option value="simple">بسيط (مباشر)</option>
                          <option value="complex_5">مركب 5 (أصدقاء 5)</option>
                          <option value="complex_10">مركب 10 (أصدقاء 10)</option>
                          <option value="mixed">مركب 5 و 10 معاً</option>
                          <option value="general">عام شامل</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-500 block mb-1">
                          عدد الصفوف (الأرقام)
                        </label>
                        <select
                          value={g.termsCount}
                          onChange={(e) =>
                            updateGroup(g.id, { termsCount: Number(e.target.value) })
                          }
                          className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                        >
                          {[3, 4, 5, 6, 7, 8, 10].map((t) => (
                            <option key={t} value={t}>
                              {t} صفوف
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-500 block mb-1">
                          العمليات
                        </label>
                        <select
                          value={g.allowSubtraction ? "both" : "add"}
                          onChange={(e) =>
                            updateGroup(g.id, { allowSubtraction: e.target.value === "both" })
                          }
                          className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                        >
                          <option value="both">جمع وطرح (±)</option>
                          <option value="add">جمع فقط (+)</option>
                        </select>
                      </div>
                    </div>

                    {/* Specific Sub-Rules Picker for complex_5 / complex_10 */}
                    {(g.level === "complex_5" || g.level === "complex_10") && (
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-1.5">
                        <span className="text-[11px] font-black text-slate-500 ml-1">
                          تخصيص قواعد محددة (اختياري — اتركه فارغاً للكل):
                        </span>
                        {(g.level === "complex_5"
                          ? [1, 2, 3, 4]
                          : [1, 2, 3, 4, 5, 6, 7, 8, 9]
                        ).map((num) => {
                          const active = g.targetRules.includes(num);
                          return (
                            <button
                              key={num}
                              type="button"
                              onClick={() => toggleSubRule(g.id, num)}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-black transition-all ${
                                active
                                  ? "bg-brand-600 text-white shadow-xs"
                                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                              }`}
                            >
                              قاعدة {num}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {ruleGroups.length > 1 && (
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <span className="text-xs font-black text-slate-600 dark:text-slate-300">
                    ترتيب الأسئلة بين المجموعات:
                  </span>
                  <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                    <button
                      type="button"
                      onClick={() => setOrderMode("sequential")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1 ${
                        orderMode === "sequential"
                          ? "bg-brand-600 text-white"
                          : "text-slate-600 dark:text-slate-300"
                      }`}
                    >
                      <ListOrdered className="w-3.5 h-3.5" />
                      <span>بالتتابع</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrderMode("shuffled")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1 ${
                        orderMode === "shuffled"
                          ? "bg-brand-600 text-white"
                          : "text-slate-600 dark:text-slate-300"
                      }`}
                    >
                      <Shuffle className="w-3.5 h-3.5" />
                      <span>خلط عشوائي للكل</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Timer, Answer Mode, Display & Voice Settings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="font-black text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                  <Timer className="w-4 h-4 text-amber-500" />
                  <span>نظام الوقت</span>
                </div>
                <select
                  value={timeMode}
                  onChange={(e) =>
                    setTimeMode(e.target.value as "countdown" | "stopwatch")
                  }
                  className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                >
                  <option value="countdown">وقت محدد (عد تنازلي)</option>
                  <option value="stopwatch">تايمر مفتوح</option>
                </select>
                {timeMode === "countdown" && (
                  <select
                    value={timeMinutes}
                    onChange={(e) => setTimeMinutes(Number(e.target.value))}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                  >
                    {PRESET_MINUTES.map((m) => (
                      <option key={m} value={m}>
                        {m} دقائق
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="font-black text-slate-700 dark:text-slate-200">
                  طريقة الإجابة
                </div>
                <select
                  value={answerMode}
                  onChange={(e) =>
                    setAnswerMode(e.target.value as "typing" | "choices")
                  }
                  className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                >
                  <option value="typing">✍️ كتابة الناتج</option>
                  <option value="choices">🔘 اختيارات متعددة</option>
                </select>
                {answerMode === "choices" && (
                  <select
                    value={choicesCount}
                    onChange={(e) =>
                      setChoicesCount(Number(e.target.value) as 2 | 3 | 4 | 5)
                    }
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                  >
                    {[2, 3, 4, 5].map((c) => (
                      <option key={c} value={c}>
                        {c} اختيارات
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="font-black text-slate-700 dark:text-slate-200">
                  طريقة عرض الأسئلة
                </div>
                <select
                  value={displayMode}
                  onChange={(e) =>
                    setDisplayMode(e.target.value as "focus" | "sheet")
                  }
                  className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                >
                  <option value="focus">🎯 سؤال بسؤال + نطق</option>
                  <option value="sheet">📄 ورقة مسابقة كاملة</option>
                </select>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="font-black text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-brand-500" />
                  <span>الصوت والنطق</span>
                </div>
                <select
                  value={voiceMode}
                  onChange={(e) =>
                    setVoiceMode(e.target.value as "arabic" | "english" | "off")
                  }
                  className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                >
                  <option value="arabic">🔊 عربي</option>
                  <option value="english">🔊 English</option>
                  <option value="off">🔇 بدون صوت</option>
                </select>
              </div>
            </div>

            {/* 4. Auto Notification Toggle */}
            <label className="flex items-center justify-between p-4 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/35 border border-indigo-200 dark:border-indigo-800 cursor-pointer">
              <div className="flex items-center gap-2.5">
                <Bell className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <div>
                  <div className="text-xs sm:text-sm font-black text-indigo-950 dark:text-indigo-200">
                    إشعار تلقائي فوري للطلاب المستهدفين عند فتح التطبيق 🔔
                  </div>
                  <div className="text-[11px] text-indigo-700 dark:text-indigo-300">
                    يظهر لكل طالب ضمن الفئة المحددة إشعار منبثق بالمسابقة مع زر البدء المباشر ومشاركة الرابط
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={notifyStudents}
                onChange={(e) => setNotifyStudents(e.target.checked)}
                className="w-5 h-5 accent-indigo-600 rounded shrink-0"
              />
            </label>

            {/* Footer Actions */}
            <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-7 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-60 text-slate-950 font-black text-xs sm:text-sm shadow-lg flex items-center gap-2"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>
                  {saving
                    ? "جاري الحفظ والمزامنة..."
                    : isEditing
                    ? `حفظ التعديلات الآن ✅ (${totalQuestions} سؤال)`
                    : isTrainerMode
                    ? `إطلاق البطولة وإشعار طلابي 🚀 (${totalQuestions} سؤال)`
                    : `نشر المسابقة وإرسال الإشعار للمستهدفين 🚀 (${totalQuestions} سؤال)`}
                </span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
