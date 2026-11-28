"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  ShieldCheck,
  Users,
  Award,
  Building2,
  Heart,
  BarChart3,
  Search,
  XCircle,
  Clock,
  ExternalLink,
  Activity,
  FileSpreadsheet,
  Plus,
  Trash2,
  MessageCircle,
  RefreshCw,
  Loader2,
  Trophy,
  Crown,
  Calendar,
  MapPin,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useApp } from "@/context/AppContext";
import { getSupabaseClient } from "@/lib/supabase/client";
import { getWhatsAppLink } from "@/lib/constants";
import {
  ExtendedUserProfile,
  PlatformAssignment,
  AssignmentSubmission,
  SubscriptionPlanId,
  getAllExtendedProfiles,
  getExtendedProfile,
  saveExtendedProfile,
  evaluateSubscription,
  createSubscriptionForPlan,
  getAllAssignments,
  deletePlatformAssignment,
  syncAllAssignmentsSubmissionsFromCloud,
  buildShareableAssignmentPath,
  formatRuleGroupShortAr,
  getUserMembershipCode,
  unpackProfilePhoneColumn,
} from "@/lib/platform-store";
import AdminCompetitionCreatorModal from "@/components/admin/AdminCompetitionCreatorModal";
import StudentResultDetailModal from "@/components/competition/StudentResultDetailModal";
import {
  UserProfile,
  UserProgressRecord,
  TrainerApplicationRecord,
  SchoolApplicationRecord,
  SupporterRecord,
  AdminAuditLogRecord,
} from "@/lib/supabase/types";
import AdminTrafficSection from "@/components/admin/AdminTrafficSection";

export default function AdminDashboardPage() {
  const { user, profile, role, isLoading: authLoading } = useAuth();
  const { language, playFx } = useApp();
  const isEn = language === "en";

  const [activeTab, setActiveTab] = useState<
    | "overview"
    | "traffic"
    | "subscriptions"
    | "competitions"
    | "users"
    | "trainers"
    | "schools"
    | "supporters"
    | "audit"
  >("overview");

  // Extended Platform Profiles & Admin Competitions State
  const [extProfiles, setExtProfiles] = useState<ExtendedUserProfile[]>([]);
  const [subFilter, setSubFilter] = useState<
    "all" | "active" | "expiring_soon" | "expired" | "pending_trainers"
  >("all");
  const [subSearch, setSubSearch] = useState("");
  const [platformAssignments, setPlatformAssignments] = useState<PlatformAssignment[]>([]);
  const [showCreateCompModal, setShowCreateCompModal] = useState(false);
  const [selectedCompSubmission, setSelectedCompSubmission] = useState<{
    submission: AssignmentSubmission;
    title: string;
    rank: number;
  } | null>(null);

  // Data states from Supabase
  const [loadingData, setLoadingData] = useState(false);
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [progressList, setProgressList] = useState<UserProgressRecord[]>([]);
  const [trainerApps, setTrainerApps] = useState<TrainerApplicationRecord[]>([]);
  const [schoolApps, setSchoolApps] = useState<SchoolApplicationRecord[]>([]);
  const [supportersList, setSupportersList] = useState<SupporterRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLogRecord[]>([]);

  // Users Tab Filters
  const [userSearch, setUserSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [selectedUserDetail, setSelectedUserDetail] = useState<{
    profile: UserProfile;
    progress?: UserProgressRecord;
  } | null>(null);
  const [editUserPhone, setEditUserPhone] = useState("");
  const [userActionNotice, setUserActionNotice] = useState<string>("");

  // New Supporter Modal
  const [showAddSupporter, setShowAddSupporter] = useState(false);
  const [newSupporterName, setNewSupporterName] = useState("");
  const [newSupporterDesc, setNewSupporterDesc] = useState("");
  const [newSupporterLink, setNewSupporterLink] = useState("");

  const isAdmin = role === "admin";

  // Load real data from Supabase + Extended Platform Store
  const loadAdminData = useCallback(async () => {
    setPlatformAssignments(getAllAssignments());
    syncAllAssignmentsSubmissionsFromCloud().then((syncedAssigns) => {
      setPlatformAssignments(syncedAssigns);
    });
    const localExt = getAllExtendedProfiles();
    setExtProfiles(localExt);

    const supabase = getSupabaseClient();
    if (!supabase || !isAdmin) return;

    setLoadingData(true);
    try {
      // 1. Fetch Users & Audit Logs
      const [{ data: profilesData }, { data: logs }] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("admin_audit_logs").select("*").order("created_at", { ascending: false }).limit(200),
      ]);

      const fetchedLogs = (logs || []) as AdminAuditLogRecord[];
      setAuditLogs(fetchedLogs);

      if (profilesData) {
        const mergedUsers = (profilesData as UserProfile[]).map((u) => {
          const latestRoleLog = fetchedLogs.find(
            (l) => l.target_type === "user" && l.target_id === u.id && l.action === "update_user_role"
          );
          const logRole = (latestRoleLog?.details as Record<string, unknown> | undefined)?.new_role as
            | "student"
            | "trainer"
            | undefined;

          const ext = getExtendedProfile(u.id, {
            email: u.email,
            name: u.name,
            role: logRole || u.role,
            phone: u.phone,
            avatarUrl: u.avatar_url,
          });

          const effectiveRole: UserProfile["role"] =
            u.role === "admin"
              ? "admin"
              : logRole || (ext.role === "trainer" ? "trainer" : u.role);
          const effectivePhone = u.phone || ext.phone || null;

          if (ext.role !== effectiveRole || (effectivePhone && !ext.phone)) {
            saveExtendedProfile({
              ...ext,
              role: effectiveRole,
              phone: (effectivePhone || "").split("|")[0].trim() || ext.phone,
            });
          }

          return {
            ...u,
            role: effectiveRole,
            phone: effectivePhone,
            avatar_url: u.avatar_url || ext.avatarUrl || null,
          };
        });

        setUsersList(mergedUsers);
        setExtProfiles(getAllExtendedProfiles());
      }

      // 2. Fetch Progress
      const { data: progData } = await supabase.from("user_progress").select("*");
      if (progData) setProgressList(progData as UserProgressRecord[]);

      // 3. Fetch Trainer Apps
      const { data: tApps } = await supabase
        .from("trainer_applications")
        .select("*")
        .order("created_at", { ascending: false });
      if (tApps) setTrainerApps(tApps as TrainerApplicationRecord[]);

      // 4. Fetch School Apps
      const { data: sApps } = await supabase
        .from("school_applications")
        .select("*")
        .order("created_at", { ascending: false });
      if (sApps) setSchoolApps(sApps as SchoolApplicationRecord[]);

      // 5. Fetch Supporters
      const { data: supps } = await supabase
        .from("supporters")
        .select("*")
        .order("sort_order", { ascending: true });
      if (supps) setSupportersList(supps as SupporterRecord[]);
    } catch (err) {
      console.error("Admin data load error:", err);
    } finally {
      setLoadingData(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin) {
      loadAdminData();
    }
  }, [isAdmin, loadAdminData]);

  // Overall Computed Stats
  const stats = useMemo(() => {
    const totalUsers = usersList.length;
    const studentsCount = usersList.filter((u) => u.role === "student").length;
    const trainersCount = usersList.filter((u) => u.role === "trainer").length;
    const activeUsersCount = usersList.filter((u) => u.status === "active").length;

    const totalAnswers = progressList.reduce((acc, p) => acc + (p.total_answers || 0), 0);
    const correctAnswers = progressList.reduce((acc, p) => acc + (p.correct_answers || 0), 0);
    const wrongAnswers = progressList.reduce((acc, p) => acc + (p.wrong_answers || 0), 0);
    const completedExercises = progressList.reduce((acc, p) => acc + (p.completed_exercises || 0), 0);
    const avgAccuracy = totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0;

    const pendingTrainerApps = trainerApps.filter((a) => a.status === "pending").length;
    const pendingSchoolApps = schoolApps.filter((a) => a.status === "pending").length;

    return {
      totalUsers,
      studentsCount,
      trainersCount,
      activeUsersCount,
      totalAnswers,
      correctAnswers,
      wrongAnswers,
      completedExercises,
      avgAccuracy,
      pendingTrainerApps,
      pendingSchoolApps,
    };
  }, [usersList, progressList, trainerApps, schoolApps]);

  // Filtered Users List
  const filteredUsers = useMemo(() => {
    return usersList.filter((u) => {
      const code = getUserMembershipCode(u.id).toLowerCase();
      const q = userSearch.toLowerCase();
      const matchesSearch =
        (u.name || "").toLowerCase().includes(q) ||
        (u.email || "").toLowerCase().includes(q) ||
        (u.phone || "").includes(userSearch) ||
        code.includes(q);
      const matchesRole = roleFilter === "all" || u.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [usersList, userSearch, roleFilter]);

  // Export users to CSV
  const handleExportCSV = () => {
    playFx("click");
    const headers = [
      "User ID",
      "Full Name",
      "Email",
      "Phone",
      "Role",
      "Status",
      "Registered At",
      "Last Active",
      "Total Answers",
      "Accuracy Rate",
      "Completed Exercises",
    ];

    const rows = filteredUsers.map((u) => {
      const prog = progressList.find((p) => p.user_id === u.id);
      return [
        `"${u.id}"`,
        `"${u.name || ""}"`,
        `"${u.email || ""}"`,
        `"${u.phone || ""}"`,
        `"${u.role}"`,
        `"${u.status}"`,
        `"${new Date(u.created_at).toLocaleDateString("en-GB")}"`,
        `"${new Date(u.last_activity).toLocaleDateString("en-GB")}"`,
        prog?.total_answers || 0,
        `${prog?.accuracy_rate || 0}%`,
        prog?.completed_exercises || 0,
      ].join(",");
    });

    const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `supermind_users_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Update User Role (Student <-> Trainer)
  const handleUpdateUserRole = async (
    targetUser: UserProfile,
    newRole: "student" | "trainer"
  ) => {
    playFx("fanfare");

    setUsersList((prev) =>
      prev.map((u) => (u.id === targetUser.id ? { ...u, role: newRole } : u))
    );
    setSelectedUserDetail((prev) =>
      prev && prev.profile.id === targetUser.id
        ? { ...prev, profile: { ...prev.profile, role: newRole } }
        : prev
    );

    const ext = getExtendedProfile(targetUser.id, {
      email: targetUser.email,
      name: targetUser.name,
      role: newRole,
      phone: targetUser.phone,
      avatarUrl: targetUser.avatar_url,
    });
    await saveExtendedProfile({
      ...ext,
      role: newRole,
      isVerifiedTrainer: newRole === "trainer" ? true : ext.isVerifiedTrainer,
      showInDirectory: newRole === "trainer" ? true : ext.showInDirectory,
    });
    setExtProfiles(getAllExtendedProfiles());

    const supabase = getSupabaseClient();
    if (supabase && isAdmin) {
      try {
        await supabase
          .from("profiles")
          .update({ role: newRole })
          .eq("id", targetUser.id);
      } catch {
        // Ignore if column-level grant restricts direct role column update
      }

      if (user?.id) {
        try {
          await supabase.from("admin_audit_logs").insert([
            {
              admin_id: user.id,
              admin_email: user.email || profile?.email || "",
              action: "update_user_role",
              target_type: "user",
              target_id: targetUser.id,
              details: {
                new_role: newRole,
                previous_role: targetUser.role,
                user_name: targetUser.name,
                user_email: targetUser.email,
              },
            },
          ]);
        } catch {
          // Ignore audit log error
        }
      }
    }

    setUserActionNotice(
      newRole === "trainer"
        ? `✅ تم تحديث وضع (${targetUser.name}) إلى مدرب بنجاح!`
        : `✅ تم إعادة وضع (${targetUser.name}) إلى طالب بنجاح!`
    );
    setTimeout(() => setUserActionNotice(""), 4000);
  };

  // Save or Update User WhatsApp Phone Number
  const handleSaveUserPhone = async (targetUser: UserProfile, rawPhone: string) => {
    const cleanPhone = rawPhone.trim();
    playFx("click");

    setUsersList((prev) =>
      prev.map((u) => (u.id === targetUser.id ? { ...u, phone: cleanPhone || null } : u))
    );
    setSelectedUserDetail((prev) =>
      prev && prev.profile.id === targetUser.id
        ? { ...prev, profile: { ...prev.profile, phone: cleanPhone || null } }
        : prev
    );

    const ext = getExtendedProfile(targetUser.id, {
      email: targetUser.email,
      name: targetUser.name,
      role: targetUser.role,
      phone: cleanPhone,
      avatarUrl: targetUser.avatar_url,
    });
    await saveExtendedProfile({
      ...ext,
      phone: cleanPhone,
    });
    setExtProfiles(getAllExtendedProfiles());

    const supabase = getSupabaseClient();
    if (supabase && isAdmin) {
      try {
        await supabase
          .from("profiles")
          .update({ phone: cleanPhone || null })
          .eq("id", targetUser.id);
      } catch (err) {
        console.error("Phone update error:", err);
      }
    }

    setUserActionNotice(`✅ تم حفظ رقم الواتساب للمستخدم (${targetUser.name}) بنجاح!`);
    setTimeout(() => setUserActionNotice(""), 4000);
  };

  // Update Application Status
  const handleUpdateAppStatus = async (
    type: "trainer" | "school",
    id: string,
    newStatus: "active" | "pending" | "expired" | "rejected"
  ) => {
    const supabase = getSupabaseClient();
    if (!supabase || !isAdmin) return;

    playFx("click");
    const table = type === "trainer" ? "trainer_applications" : "school_applications";

    try {
      await supabase.from(table).update({ status: newStatus, updated_at: new Date().toISOString() }).eq("id", id);
      await loadAdminData();
    } catch (err) {
      console.error("Status update error:", err);
    }
  };

  // Add Supporter
  const handleAddSupporterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = getSupabaseClient();
    if (!supabase || !isAdmin || !newSupporterName.trim()) return;

    try {
      await supabase.from("supporters").insert([
        {
          name: newSupporterName.trim(),
          description: newSupporterDesc.trim(),
          link: newSupporterLink.trim() || null,
          is_active: true,
          sort_order: supportersList.length + 1,
        },
      ]);
      setNewSupporterName("");
      setNewSupporterDesc("");
      setNewSupporterLink("");
      setShowAddSupporter(false);
      playFx("fanfare");
      await loadAdminData();
    } catch (err) {
      console.error("Add supporter error:", err);
    }
  };

  // Delete Supporter
  const handleDeleteSupporter = async (id: string) => {
    const supabase = getSupabaseClient();
    if (!supabase || !isAdmin) return;
    if (!confirm(isEn ? "Are you sure you want to delete this supporter?" : "هل أنت متأكد من حذف هذا الداعم؟")) return;

    try {
      await supabase.from("supporters").delete().eq("id", id);
      playFx("click");
      await loadAdminData();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  // Security Check Screen: If auth is loading
  if (authLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
        <p className="text-sm font-bold text-slate-500">
          {isEn ? "Verifying administrative permissions..." : "جاري التحقق من صلاحيات الإدارة العليا..."}
        </p>
      </div>
    );
  }

  // Security Check Screen: Access Denied if NOT admin
  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center shadow-lg border border-rose-200 dark:border-rose-800">
          <ShieldAlert className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {isEn ? "Access Restricted to Owner & Admins Only" : "منطقة إدارية محمية | Access Denied"}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed max-w-lg mx-auto">
            {isEn
              ? "This dashboard is exclusively accessible to the certified platform owner and verified administrators. Privilege checks are strictly enforced on server and database levels."
              : "لوحة التحكم هذه مخصصة فقط لمالك المنصة والمديرين المصرح لهم رسمياً. يتم التحقق من الصلاحيات الصارمة على مستوى الخادم وقاعدة البيانات."}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto space-y-1">
          <div>
            الحساب الحالي: <strong className="text-slate-800 dark:text-slate-200">{user?.email || "زائر / غير مسجل"}</strong>
          </div>
          <div>
            الرتبة الممنوحة: <span className="font-mono text-rose-600 font-bold">{role}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/login"
            className="px-6 py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs sm:text-sm shadow-md transition-transform active:scale-95"
          >
            {isEn ? "Sign In as Admin" : "تسجيل الدخول كمدير"}
          </Link>
          <Link
            href="/dashboard"
            className="px-6 py-3 rounded-2xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-800 dark:text-slate-200 font-bold text-xs sm:text-sm transition-colors"
          >
            {isEn ? "Back to Dashboard" : "العودة للوحة التدريب"}
          </Link>
        </div>
      </div>
    );
  }

  // =========================================================================
  // MAIN ADMIN DASHBOARD (AUTHORIZED OWNER / ADMIN)
  // =========================================================================
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Admin Header */}
      <div className="clay-banner-lavender relative overflow-hidden text-white p-6 sm:p-10">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold border border-amber-400/30">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>لوحة الإدارة العليا والتحكم الشامل | Super Mind Administration</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white">
              مرحباً بك، {profile?.name || "مدير المنصة"}
            </h1>

            <p className="text-slate-300 text-xs sm:text-sm max-w-xl">
              إدارة المستخدمين، متابعة الإنجاز الحقيقي، تدقيق طلبات اعتماد المدربين والمدارس، وإدارة الداعمين.
            </p>
          </div>

          <div className="flex items-center gap-2 self-stretch md:self-auto justify-end">
            <button
              onClick={loadAdminData}
              disabled={loadingData}
              className="p-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white text-xs font-bold transition-all flex items-center gap-2"
              title="تحديث البيانات"
            >
              <RefreshCw className={`w-4 h-4 ${loadingData ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">تحديث البيانات</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mt-8 pt-4 border-t border-slate-800 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {[
            { id: "overview", label: "نظرة عامة وإحصائيات", icon: BarChart3 },
            { id: "traffic", label: "إحصاءات الزيارات", icon: Activity },
            { id: "subscriptions", label: `👑 الاشتراكات والمدربون (${extProfiles.length})`, icon: Crown },
            { id: "competitions", label: `🏆 المسابقات والواجبات العامة (${platformAssignments.length})`, icon: Trophy },
            { id: "users", label: `المستخدمون (${stats.totalUsers})`, icon: Users },
            { id: "trainers", label: `طلبات المدربين (${stats.pendingTrainerApps})`, icon: Award },
            { id: "schools", label: `طلبات المدارس (${stats.pendingSchoolApps})`, icon: Building2 },
            { id: "supporters", label: `الداعمون (${supportersList.length})`, icon: Heart },
            { id: "audit", label: "سجل العمليات", icon: Clock },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as typeof activeTab);
                  playFx("click");
                }}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all flex items-center gap-2 shrink-0 ${
                  active
                    ? "bg-amber-400 text-slate-950 shadow-md font-black"
                    : "bg-white/5 hover:bg-white/10 text-slate-300"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          TAB 1: OVERVIEW & REAL STATISTICS
         ========================================================================= */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          {/* Main Stat Cards Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-xs text-slate-500 font-semibold">إجمالي المستخدمين</span>
              <div className="text-3xl font-black font-mono text-slate-900 dark:text-white">{stats.totalUsers}</div>
              <div className="text-[11px] text-emerald-600 font-bold">{stats.studentsCount} طلاب • {stats.trainersCount} مدربين</div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-xs text-slate-500 font-semibold">إجمالي الإجابات</span>
              <div className="text-3xl font-black font-mono text-brand-600">{stats.totalAnswers}</div>
              <div className="text-[11px] text-slate-500 font-medium">{stats.correctAnswers} صحيحة • {stats.wrongAnswers} خاطئة</div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-xs text-slate-500 font-semibold">متوسط الدقة التراكمي</span>
              <div className="text-3xl font-black font-mono text-emerald-600">{stats.avgAccuracy}%</div>
              <div className="text-[11px] text-emerald-600 font-bold">معدل دقة عالي</div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-xs text-slate-500 font-semibold">جلسات التدريب المكتملة</span>
              <div className="text-3xl font-black font-mono text-amber-500">{stats.completedExercises}</div>
              <div className="text-[11px] text-amber-600 font-bold">تمارين منجزة</div>
            </div>
          </div>

          {/* Listing Applications Alert Banner */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-6 rounded-3xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-xs font-bold text-amber-700 dark:text-amber-400">طلبات إدراج المدربين (25,000 د.ع)</div>
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  {stats.pendingTrainerApps} طلبات بانتظار التدقيق
                </div>
              </div>
              <button
                onClick={() => setActiveTab("trainers")}
                className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-colors"
              >
                مراجعة الطلبات
              </button>
            </div>

            <div className="p-6 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400">طلبات اعتماد المدارس (75,000 د.ع)</div>
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  {stats.pendingSchoolApps} طلبات بانتظار التدقيق
                </div>
              </div>
              <button
                onClick={() => setActiveTab("schools")}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 transition-colors"
              >
                مراجعة الطلبات
              </button>
            </div>
          </div>

          {/* Quick Notice */}
          <div className="p-5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 leading-relaxed flex items-start gap-3">
            <Activity className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
            <p>
              يتم تحديث هذه الأرقام مباشرة من قاعدة بيانات Supabase المشفرة عبر صلاحيات Row Level Security. يُمنع منعاً باتاً كشف أي كلمات مرور أو مفاتيح سرية، وتخضع جميع عمليات التعديل والاعتماد لسجل التدقيق الإداري.
            </p>
          </div>
        </div>
      )}

      {activeTab === "traffic" && <AdminTrafficSection />}

      {/* =========================================================================
          TAB 2: USERS MANAGEMENT
         ========================================================================= */}
      {activeTab === "users" && (
        <div className="space-y-6">
          {userActionNotice && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 font-black text-xs sm:text-sm flex items-center justify-between animate-in fade-in">
              <span>{userActionNotice}</span>
              <button
                type="button"
                onClick={() => setUserActionNotice("")}
                className="text-xs text-emerald-700 dark:text-emerald-300 underline"
              >
                إغلاق
              </button>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="flex flex-1 items-center gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="ابحث بالاسم، البريد، أو الهاتف..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pr-10 pl-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs sm:text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                <option value="all">كافة الرتب</option>
                <option value="student">طلاب</option>
                <option value="trainer">مدربون</option>
                <option value="admin">مديرون</option>
              </select>
            </div>

            <button
              onClick={handleExportCSV}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-xs"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>تصدير البيانات (CSV)</span>
            </button>
          </div>

          {/* Users Table */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-4">المستخدم</th>
                    <th className="p-4">البريد والهاتف</th>
                    <th className="p-4">الرتبة</th>
                    <th className="p-4">المستوى</th>
                    <th className="p-4">الإجابات</th>
                    <th className="p-4">الدقة</th>
                    <th className="p-4">الحالة</th>
                    <th className="p-4 text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400">
                        لم يتم العثور على أي مستخدمين يطابقون معايير البحث.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      const prog = progressList.find((p) => p.user_id === u.id);
                      const extProf = extProfiles.find((ep) => ep.id === u.id);
                      const rawPhoneField = u.phone || extProf?.phone || "";
                      const unpacked = unpackProfilePhoneColumn(rawPhoneField);
                      const cleanPhone = unpacked.cleanPhone || extProf?.phone || "";
                      const memberCode =
                        unpacked.meta?.memberCode ||
                        extProf?.memberCode ||
                        getUserMembershipCode(u.id);
                      const requestedMode =
                        unpacked.meta?.requestedAccountMode || extProf?.requestedAccountMode;
                      const displayLocation =
                        unpacked.governorate
                          ? `${unpacked.country || "العراق"} - ${unpacked.governorate}`
                          : extProf?.governorate
                          ? `${extProf.country || "العراق"} - ${extProf.governorate}`
                          : "";
                      const avatarSrc = u.avatar_url || extProf?.avatarUrl || "";

                      return (
                        <tr key={u.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden flex items-center justify-center shrink-0 font-black text-brand-600">
                                {avatarSrc ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={avatarSrc}
                                    alt={u.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <span>{(u.name || "م").charAt(0)}</span>
                                )}
                              </div>
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-bold text-slate-900 dark:text-white">{u.name}</span>
                                  <span
                                    dir="ltr"
                                    className="px-1.5 py-0.5 rounded bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 font-mono text-[10px] font-black border border-brand-200/70 dark:border-brand-800/60"
                                  >
                                    {memberCode}
                                  </span>
                                </div>
                                {requestedMode && requestedMode !== "free_student" && (
                                  <div className="text-[10px] font-black text-amber-600 dark:text-amber-400 mt-0.5">
                                    {requestedMode === "pro_student"
                                      ? "🌟 طلب ترقية: طالب احترافي"
                                      : requestedMode === "trainer"
                                      ? "👨‍🏫 طلب ترقية: مدرب معتمد"
                                      : "🏫 طلب ترقية: مدرسة معتمدة"}
                                  </div>
                                )}
                                {displayLocation && (
                                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    <span>{displayLocation}</span>
                                  </div>
                                )}
                                <div className="text-[10px] text-slate-400">
                                  سجل: {new Date(u.created_at).toLocaleDateString("ar-IQ")}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-slate-600 dark:text-slate-300 font-mono">
                            <div>{u.email || "—"}</div>
                            {cleanPhone ? (
                              <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                                📱 {cleanPhone}
                              </div>
                            ) : (
                              <div className="text-[10px] text-slate-400">بدون هاتف</div>
                            )}
                          </td>
                          <td className="p-4">
                            <span
                              className={`px-2.5 py-1 rounded-md text-[10px] font-black ${
                                u.role === "admin"
                                  ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                                  : u.role === "trainer"
                                  ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                                  : "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                              }`}
                            >
                              {u.role === "admin" ? "مدير" : u.role === "trainer" ? "مدرب 👨‍🏫" : "طالب"}
                            </span>
                          </td>
                          <td className="p-4 text-slate-600 dark:text-slate-300 font-medium">
                            {prog?.current_level || "المستوى الأول"}
                          </td>
                          <td className="p-4 font-mono font-bold text-slate-900 dark:text-white">
                            {prog?.total_answers || 0}
                          </td>
                          <td className="p-4 font-mono font-bold text-emerald-600">
                            {prog?.accuracy_rate || 0}%
                          </td>
                          <td className="p-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                u.status === "active"
                                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                  : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                              }`}
                            >
                              {u.status === "active" ? "نشط" : "موقوف"}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex flex-wrap items-center justify-center gap-1.5">
                              {/* 1. View Full User Info Button */}
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedUserDetail({ profile: u, progress: prog });
                                  setEditUserPhone(cleanPhone);
                                  playFx("click");
                                }}
                                className="px-3 py-1.5 rounded-xl bg-brand-50 dark:bg-slate-800 hover:bg-brand-600 hover:text-white text-brand-700 dark:text-brand-300 font-black text-[11px] transition-colors border border-brand-200 dark:border-slate-700"
                              >
                                📋 عرض المعلومات
                              </button>

                              {/* 2. Update Role to Trainer / Student Button */}
                              {u.role !== "admin" && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleUpdateUserRole(
                                      u,
                                      u.role === "trainer" ? "student" : "trainer"
                                    )
                                  }
                                  className={`px-3 py-1.5 rounded-xl font-black text-[11px] transition-colors border ${
                                    u.role === "trainer"
                                      ? "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700"
                                      : "bg-amber-100 hover:bg-amber-500 hover:text-slate-950 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-800"
                                  }`}
                                >
                                  {u.role === "trainer" ? "🎓 إعادة لطالب" : "👨‍🏫 تحويل لمدرب"}
                                </button>
                              )}

                              {/* 3. Direct WhatsApp Contact Button if Phone Exists */}
                              {cleanPhone ? (
                                <a
                                  href={getWhatsAppLink(
                                    `مرحباً (${u.name})، معك إدارة منصة العقل الخارق (SUPER MIND) بخصوص حسابك في المنصة.`,
                                    cleanPhone
                                  )}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[11px] flex items-center gap-1 shadow-xs transition-colors"
                                >
                                  <MessageCircle className="w-3.5 h-3.5" />
                                  <span>واتساب</span>
                                </a>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedUserDetail({ profile: u, progress: prog });
                                    setEditUserPhone("");
                                    playFx("click");
                                  }}
                                  className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-bold text-[10px]"
                                  title="إضافة رقم واتساب للمستخدم"
                                >
                                  + إضافة هاتف
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Comprehensive User Information & Role/WhatsApp Modal */}
          {selectedUserDetail && (() => {
            const u = selectedUserDetail.profile;
            const prog = selectedUserDetail.progress;
            const extProf = extProfiles.find((ep) => ep.id === u.id);
            const rawPhoneField = u.phone || extProf?.phone || "";
            const unpacked = unpackProfilePhoneColumn(rawPhoneField);
            const cleanPhone = unpacked.cleanPhone || extProf?.phone || "";
            const memberCode =
              unpacked.meta?.memberCode ||
              extProf?.memberCode ||
              getUserMembershipCode(u.id);
            const displayLocation = unpacked.governorate
              ? `${unpacked.country || "العراق"} - ${unpacked.governorate}`
              : extProf?.governorate
              ? `${extProf.country || "العراق"} - ${extProf.governorate}`
              : "غير محدد بعد";
            const avatarSrc = u.avatar_url || extProf?.avatarUrl || "";
            const subEval = extProf ? evaluateSubscription(extProf.subscription) : null;

            return (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-4 overflow-y-auto">
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 my-8">
                  {/* Modal Header with Avatar & Role */}
                  <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4 gap-3">
                    <div className="flex items-center gap-3.5">
                      <div className="w-16 h-16 rounded-2xl bg-brand-50 dark:bg-slate-800 border-2 border-amber-400 overflow-hidden flex items-center justify-center shrink-0 font-black text-2xl text-brand-600 shadow-md">
                        {avatarSrc ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={avatarSrc}
                            alt={u.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span>{(u.name || "م").charAt(0)}</span>
                        )}
                      </div>
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                            {u.name}
                          </h3>
                          <span
                            dir="ltr"
                            className="px-2 py-0.5 rounded-md bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 font-mono text-[11px] font-black border border-brand-200 dark:border-brand-800"
                          >
                            {memberCode}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-black ${
                              u.role === "admin"
                                ? "bg-rose-100 text-rose-800"
                                : u.role === "trainer"
                                ? "bg-amber-400 text-slate-950"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {u.role === "admin" ? "مدير المنصة" : u.role === "trainer" ? "مدرب 👨‍🏫" : "طالب 🎓"}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-mono">{u.email || "بدون بريد إلكتروني"}</p>
                        <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>الدولة والمحافظة: {displayLocation}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedUserDetail(null)}
                      className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Role Update & WhatsApp Quick Actions Bar */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-black text-slate-700 dark:text-slate-200">
                        ⚡ تحديث وضع المستخدم والتواصل المباشر:
                      </span>
                      <div className="flex flex-wrap items-center gap-2">
                        {u.role !== "admin" && (
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateUserRole(
                                u,
                                u.role === "trainer" ? "student" : "trainer"
                              )
                            }
                            className={`px-4 py-2 rounded-xl font-black text-xs shadow-xs transition-all ${
                              u.role === "trainer"
                                ? "bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 text-slate-800 dark:text-white"
                                : "bg-amber-400 hover:bg-amber-300 text-slate-950"
                            }`}
                          >
                            {u.role === "trainer"
                              ? "🎓 إعادة وضعه إلى طالب"
                              : "👨‍🏫 تحديث وضعه إلى مدرب"}
                          </button>
                        )}

                        {cleanPhone && (
                          <a
                            href={getWhatsAppLink(
                              `مرحباً (${u.name})، معك إدارة منصة العقل الخارق (SUPER MIND) بخصوص حسابك في المنصة.`,
                              cleanPhone
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center gap-1.5 shadow-sm"
                          >
                            <MessageCircle className="w-4 h-4" />
                            <span>التواصل عبر الواتساب ({cleanPhone})</span>
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Phone Number Input / Editor */}
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-200/70 dark:border-slate-700">
                      <input
                        type="tel"
                        dir="ltr"
                        placeholder="رقم هاتف واتساب (مثال: 07801234567)"
                        value={editUserPhone}
                        onChange={(e) => setEditUserPhone(e.target.value)}
                        className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveUserPhone(u, editUserPhone)}
                        className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-black text-xs shrink-0"
                      >
                        حفظ رقم الواتساب
                      </button>
                    </div>
                  </div>

                  {/* Personal & Academic Information Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                      <span className="text-slate-400 block text-[10px]">المستوى الحالي:</span>
                      <strong className="text-slate-800 dark:text-slate-200">
                        {prog?.current_level || extProf?.currentLevel || "المستوى الأول"}
                      </strong>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                      <span className="text-slate-400 block text-[10px]">آخر تمرين:</span>
                      <strong className="text-slate-800 dark:text-slate-200">
                        {prog?.last_exercise || "فلاش أنزان"}
                      </strong>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                      <span className="text-slate-400 block text-[10px]">حالة الاشتراك:</span>
                      <strong className={subEval?.isActive ? "text-emerald-600" : "text-amber-600"}>
                        {subEval?.isActive
                          ? `${extProf?.subscription.planLabel} (${subEval.daysRemaining} يوم)`
                          : "الباقة المجانية"}
                      </strong>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                      <span className="text-slate-400 block text-[10px]">إجمالي الإجابات:</span>
                      <strong className="text-slate-800 dark:text-slate-200 font-mono text-sm">
                        {prog?.total_answers ?? extProf?.totalQuestionsSolved ?? 0}
                      </strong>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                      <span className="text-slate-400 block text-[10px]">الإجابات الصحيحة / الخاطئة:</span>
                      <strong className="text-emerald-600 font-mono">
                        {prog?.correct_answers ?? extProf?.correctAnswers ?? 0} صح
                      </strong>{" "}
                      /{" "}
                      <span className="text-rose-500 font-mono">
                        {prog?.wrong_answers ?? extProf?.wrongAnswers ?? 0} خطأ
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                      <span className="text-slate-400 block text-[10px]">نسبة الدقة:</span>
                      <strong className="text-emerald-600 font-mono text-sm">
                        {prog?.accuracy_rate ?? extProf?.accuracyRate ?? 0}%
                      </strong>
                    </div>
                  </div>

                  {/* Timestamps & Metadata */}
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs space-y-1.5 border border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between">
                      <span className="text-slate-400">معرّف المستخدم (ID):</span>
                      <span className="font-mono text-[11px] text-slate-600 dark:text-slate-300">{u.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">تاريخ التسجيل:</span>
                      <span className="font-mono">{new Date(u.created_at).toLocaleString("ar-IQ")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">آخر نشاط:</span>
                      <span className="font-mono">{new Date(u.last_activity).toLocaleString("ar-IQ")}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedUserDetail(null)}
                    className="w-full py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-xs"
                  >
                    إغلاق نافذة المعلومات
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* =========================================================================
          TAB 3: TRAINERS APPLICATIONS (25,000 IQD)
         ========================================================================= */}
      {activeTab === "trainers" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900 dark:text-white">
              طلبات إدراج المدربين المعتمدين (الاشتراك السنوي: 25,000 دينار عراقي)
            </h2>
            <span className="text-xs text-amber-600 font-bold">
              تواصل الدفع والاعتماد عبر واتساب الإدارة: 07806086016
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {trainerApps.length === 0 ? (
              <div className="col-span-2 p-10 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-center text-slate-400 text-xs">
                لا توجد طلبات إدراج مدربين جديدة حالياً.
              </div>
            ) : (
              trainerApps.map((app) => (
                <div
                  key={app.id}
                  className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-black text-slate-900 dark:text-white text-base">{app.name}</h3>
                      <div className="text-xs text-slate-500">{app.governorate} • {app.country}</div>
                      <div className="text-xs font-mono text-emerald-600 font-bold mt-0.5">{app.phone}</div>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                        app.status === "active"
                          ? "bg-emerald-100 text-emerald-800"
                          : app.status === "pending"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      {app.status === "active" ? "معتمد ونشط" : app.status === "pending" ? "بانتظار الموافقة" : "مرفوض"}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
                    {app.bio}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <a
                      href={`https://wa.me/${app.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                        `مرحباً كابتن ${app.name}، بخصوص طلبك للإدراج في دليل مدربي منصة العقل الخارق (25,000 د.ع)...`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold flex items-center gap-1.5 text-[11px]"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>واتساب المدرب</span>
                    </a>

                    <div className="flex items-center gap-1.5">
                      {app.status !== "active" && (
                        <button
                          onClick={() => handleUpdateAppStatus("trainer", app.id, "active")}
                          className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-[11px] hover:bg-emerald-200"
                        >
                          اعتماد وتفعيل
                        </button>
                      )}
                      {app.status !== "rejected" && (
                        <button
                          onClick={() => handleUpdateAppStatus("trainer", app.id, "rejected")}
                          className="px-3 py-1.5 rounded-xl bg-rose-100 text-rose-800 font-bold text-[11px] hover:bg-rose-200"
                        >
                          رفض
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: SCHOOLS APPLICATIONS (75,000 IQD)
         ========================================================================= */}
      {activeTab === "schools" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900 dark:text-white">
              طلبات المؤسسات والمدارس الأهلية (الاشتراك السنوي: 75,000 دينار عراقي)
            </h2>
            <span className="text-xs text-emerald-600 font-bold">
              تواصل الاعتماد عبر واتساب الإدارة: 07806086016
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {schoolApps.length === 0 ? (
              <div className="col-span-2 p-10 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-center text-slate-400 text-xs">
                لا توجد طلبات إدراج مدارس جديدة حالياً.
              </div>
            ) : (
              schoolApps.map((app) => (
                <div
                  key={app.id}
                  className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-black text-slate-900 dark:text-white text-base">{app.name}</h3>
                      <div className="text-xs text-slate-500">{app.address}</div>
                      <div className="text-xs font-mono text-emerald-600 font-bold mt-0.5">{app.phone}</div>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                        app.status === "active"
                          ? "bg-emerald-100 text-emerald-800"
                          : app.status === "pending"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      {app.status === "active" ? "معتمدة ونشطة" : app.status === "pending" ? "بانتظار الموافقة" : "مرفوضة"}
                    </span>
                  </div>

                  <div className="text-xs font-bold text-brand-600 dark:text-brand-400">
                    {app.curriculum_stage}
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
                    {app.bio}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <a
                      href={`https://wa.me/${app.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                        `مرحباً إدارة ${app.name}، بخصوص طلبكم لإدراج المدرسة في منصة العقل الخارق (75,000 د.ع)...`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold flex items-center gap-1.5 text-[11px]"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>واتساب المدرسة</span>
                    </a>

                    <div className="flex items-center gap-1.5">
                      {app.status !== "active" && (
                        <button
                          onClick={() => handleUpdateAppStatus("school", app.id, "active")}
                          className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-[11px] hover:bg-emerald-200"
                        >
                          اعتماد وتفعيل
                        </button>
                      )}
                      {app.status !== "rejected" && (
                        <button
                          onClick={() => handleUpdateAppStatus("school", app.id, "rejected")}
                          className="px-3 py-1.5 rounded-xl bg-rose-100 text-rose-800 font-bold text-[11px] hover:bg-rose-200"
                        >
                          رفض
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 5: SUPPORTERS MANAGEMENT
         ========================================================================= */}
      {activeTab === "supporters" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900 dark:text-white">
              إدارة داعمي المنصة (شركاء في صناعة العقول)
            </h2>
            <button
              onClick={() => setShowAddSupporter(true)}
              className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة داعم جديد</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {supportersList.length === 0 ? (
              <div className="col-span-3 p-10 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-center text-slate-400 text-xs">
                لا يوجد داعمون مسجلون في قاعدة البيانات حالياً.
              </div>
            ) : (
              supportersList.map((sup) => (
                <div
                  key={sup.id}
                  className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-slate-900 dark:text-white text-sm">{sup.name}</h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {sup.is_active ? "ظاهر في الموقع" : "مخفي"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">{sup.description}</p>
                    {sup.link && (
                      <a
                        href={sup.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-brand-600 hover:underline flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>رابط المؤسسة</span>
                      </a>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleDeleteSupporter(sup.id)}
                      className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs transition-colors"
                      title="حذف الداعم"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Add Supporter Modal */}
          {showAddSupporter && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
                <h3 className="text-base font-black text-slate-900 dark:text-white">إضافة داعم أو راعٍ جديد</h3>
                <form onSubmit={handleAddSupporterSubmit} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">اسم الداعم / المؤسسة</label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: مؤسسة الأمل الخيرية"
                      value={newSupporterName}
                      onChange={(e) => setNewSupporterName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">وصف الدعم والمساهمة</label>
                    <textarea
                      required
                      rows={3}
                      placeholder="شريك في توفير حقائب تدريبية لطلاب المدارس..."
                      value={newSupporterDesc}
                      onChange={(e) => setNewSupporterDesc(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">رابط الموقع (اختياري)</label>
                    <input
                      type="url"
                      placeholder="https://example.com"
                      value={newSupporterLink}
                      onChange={(e) => setNewSupporterLink(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button type="submit" className="flex-1 py-2.5 rounded-xl bg-brand-600 text-white font-bold text-xs">
                      حفظ ونشر
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddSupporter(false)}
                      className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
                    >
                      إلغاء
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB: SUBSCRIPTIONS, SMART FILTERS & TRAINER VERIFICATION
         ========================================================================= */}
      {activeTab === "subscriptions" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-5 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Crown className="w-6 h-6 text-amber-500" />
                  <span>إدارة اشتراكات الطلاب والمدربين وتواريخ الصلاحية</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  فعّل اشتراك أي طالب أو مدرب بضغطة زر (شهري 25 ألف | 3 أشهر 50 ألف | سنوي 100 ألف د.ع)، وسيتم تثبيت تاريخ البدء والانتهاء والإلغاء التلقائي بعد انتهاء المدة!
                </p>
              </div>

              <div className="relative sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="ابحث بالاسم أو الهاتف أو المحافظة..."
                  value={subSearch}
                  onChange={(e) => setSubSearch(e.target.value)}
                  className="w-full pr-10 pl-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
                />
              </div>
            </div>

            {/* Smart Subscription Filters */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              {[
                { id: "all", label: "الكل" },
                { id: "active", label: "المشتركون الفعالون ✅" },
                { id: "expiring_soon", label: "تنتهي قريباً (خلال 3 أيام) ⚠️" },
                { id: "expired", label: "اشتراكات منتهية ❌" },
                { id: "pending_trainers", label: "مدربون بانتظار التوثيق ⏳" },
              ].map((flt) => (
                <button
                  key={flt.id}
                  type="button"
                  onClick={() =>
                    setSubFilter(
                      flt.id as
                        | "all"
                        | "active"
                        | "expiring_soon"
                        | "expired"
                        | "pending_trainers"
                    )
                  }
                  className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all ${
                    subFilter === flt.id
                      ? "bg-brand-600 text-white shadow-sm"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  {flt.label}
                </button>
              ))}
            </div>

            {/* Profiles List */}
            <div className="space-y-4">
              {extProfiles
                .filter((p) => {
                  const evalSub = evaluateSubscription(p.subscription);
                  if (subFilter === "active" && !evalSub.isActive) return false;
                  if (subFilter === "expiring_soon" && !evalSub.isExpiringSoon) return false;
                  if (subFilter === "expired" && evalSub.effectiveStatus !== "expired") return false;
                  if (
                    subFilter === "pending_trainers" &&
                    !(p.role === "trainer" && !evalSub.isActive)
                  )
                    return false;
                  if (subSearch.trim()) {
                    const q = subSearch.toLowerCase();
                    const code = (p.memberCode || getUserMembershipCode(p.id)).toLowerCase();
                    return (
                      p.name.toLowerCase().includes(q) ||
                      (p.phone || "").includes(q) ||
                      (p.governorate || "").toLowerCase().includes(q) ||
                      (p.email || "").toLowerCase().includes(q) ||
                      code.includes(q)
                    );
                  }
                  return true;
                })
                .map((p) => {
                  const evalSub = evaluateSubscription(p.subscription);
                  const pCode = p.memberCode || getUserMembershipCode(p.id);
                  const activatePlan = async (planId: SubscriptionPlanId) => {
                    const newSub = createSubscriptionForPlan(planId);
                    await saveExtendedProfile({
                      ...p,
                      subscription: newSub,
                      isVerifiedTrainer:
                        p.role === "trainer" ? planId !== "free" : p.isVerifiedTrainer,
                      showInDirectory:
                        p.role === "trainer" ? planId !== "free" : p.showInDirectory,
                    });
                    setExtProfiles(getAllExtendedProfiles());
                    playFx("fanfare");
                  };

                  return (
                    <div
                      key={p.id}
                      className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-3.5">
                        <div className="w-12 h-12 rounded-2xl overflow-hidden bg-brand-100 dark:bg-slate-700 flex items-center justify-center font-black text-brand-700 shrink-0">
                          {p.avatarUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={p.avatarUrl} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            p.name.charAt(0)
                          )}
                        </div>

                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                              {p.name}
                            </span>
                            <span
                              dir="ltr"
                              className="px-2 py-0.5 rounded-md bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 font-mono text-[10px] font-black border border-brand-200/70 dark:border-brand-800/60"
                            >
                              {pCode}
                            </span>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                                p.role === "trainer"
                                  ? "bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300"
                                  : "bg-brand-100 text-brand-800 dark:bg-brand-950/70 dark:text-brand-300"
                              }`}
                            >
                              {p.role === "trainer" ? "مدرب" : p.role === "admin" ? "مشرف عام" : "طالب"}
                            </span>
                            {p.requestedAccountMode && p.requestedAccountMode !== "free_student" && (
                              <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/70 text-indigo-800 dark:text-indigo-300 text-[10px] font-black">
                                {p.requestedAccountMode === "pro_student"
                                  ? "طلب: طالب احترافي"
                                  : p.requestedAccountMode === "trainer"
                                  ? "طلب: مدرب"
                                  : "طلب: مدرسة"}
                              </span>
                            )}
                            {evalSub.isActive ? (
                              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 text-[10px] font-black">
                                فعال ({p.subscription.planLabel}) • متبقي {evalSub.daysRemaining} يوم
                              </span>
                            ) : evalSub.effectiveStatus === "expired" ? (
                              <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-black">
                                منتهي الصلاحية ❌
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-bold">
                                باقة مجانية
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-rose-500" />
                              <span>
                                {p.country || "العراق"} - {p.governorate || "غير محدد"}
                              </span>
                            </span>
                            {p.phone && (
                              <span className="font-mono font-bold text-emerald-600">
                                واتساب: {p.phone}
                              </span>
                            )}
                            {p.subscription.startDate && (
                              <span className="flex items-center gap-1 text-[11px] text-slate-400">
                                <Calendar className="w-3 h-3" />
                                <span>
                                  من {new Date(p.subscription.startDate).toLocaleDateString("ar-IQ")} إلى{" "}
                                  {p.subscription.endDate
                                    ? new Date(p.subscription.endDate).toLocaleDateString("ar-IQ")
                                    : "—"}
                                </span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Admin Quick Subscription & Role Action Buttons */}
                      <div className="flex flex-wrap items-center gap-2">
                        {p.role !== "admin" && (
                          <button
                            type="button"
                            onClick={async () => {
                              const nextRole = p.role === "trainer" ? "student" : "trainer";
                              const matchedUser = usersList.find((u) => u.id === p.id);
                              if (matchedUser) {
                                await handleUpdateUserRole(matchedUser, nextRole);
                              } else {
                                await saveExtendedProfile({
                                  ...p,
                                  role: nextRole,
                                  isVerifiedTrainer: nextRole === "trainer" ? true : p.isVerifiedTrainer,
                                  showInDirectory: nextRole === "trainer" ? true : p.showInDirectory,
                                });
                                setExtProfiles(getAllExtendedProfiles());
                                playFx("fanfare");
                              }
                            }}
                            className={`px-3 py-1.5 rounded-xl font-black text-[11px] border ${
                              p.role === "trainer"
                                ? "bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white border-slate-300 dark:border-slate-600"
                                : "bg-amber-100 hover:bg-amber-400 text-amber-900 hover:text-slate-950 border-amber-300"
                            }`}
                          >
                            {p.role === "trainer" ? "🎓 إعادة لطالب" : "👨‍🏫 تحويل لمدرب"}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => activatePlan("monthly_25k")}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[11px] shadow-sm"
                        >
                          تفعيل شهر (25 ألف)
                        </button>
                        <button
                          type="button"
                          onClick={() => activatePlan("quarterly_50k")}
                          className="px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-black text-[11px] shadow-sm"
                        >
                          تفعيل 3 أشهر (50 ألف)
                        </button>
                        <button
                          type="button"
                          onClick={() => activatePlan("yearly_100k")}
                          className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[11px] shadow-sm"
                        >
                          تفعيل سنة (100 ألف)
                        </button>
                        {evalSub.isActive && (
                          <button
                            type="button"
                            onClick={() => activatePlan("free")}
                            className="px-3 py-1.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold text-[11px]"
                          >
                            إلغاء الاشتراك
                          </button>
                        )}
                        {p.phone && (
                          <a
                            href={getWhatsAppLink(
                              `مرحباً (${p.name})، معك إدارة منصة العقل الخارق بخصوص حسابك واشتراكك في المنصة.`,
                              p.phone
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-xl bg-slate-900 text-white font-bold text-[11px] flex items-center gap-1"
                          >
                            <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                            <span>مراسلة واتساب</span>
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB: ADMIN OFFICIAL COMPETITIONS, CHALLENGES & HOMEWORKS
         ========================================================================= */}
      {activeTab === "competitions" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
            <div className="space-y-1">
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Trophy className="w-6 h-6 text-amber-500" />
                <span>🏆 إدارة المسابقات والتحديات والواجبات العامة للمنصة</span>
              </h2>
              <p className="text-xs text-slate-500">
                أطلق مسابقة رسمية أو تحدياً عاماً لجميع المشتركين أو لفئة محددة (حسب المحافظة أو المستوى)، وتابع ترتيب الفائزين تلقائياً!
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={async () => {
                  const synced = await syncAllAssignmentsSubmissionsFromCloud();
                  setPlatformAssignments(synced);
                  playFx("click");
                }}
                className="px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-black text-xs flex items-center gap-1.5"
              >
                <RefreshCw className="w-4 h-4" />
                <span>تحديث النتائج</span>
              </button>
              <button
                type="button"
                onClick={() => setShowCreateCompModal(true)}
                className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm shadow-lg flex items-center gap-2 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>إنشاء مسابقة / واجب (قواعد متعددة) 🏆</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {platformAssignments.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between gap-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 font-black text-xs">
                      {item.kind === "admin_competition"
                        ? "🏆 مسابقة رسمية من الإدارة"
                        : item.kind === "admin_challenge"
                        ? "⚡ تحدي أسبوعي"
                        : `📝 واجب مدرب (${item.creatorName})`}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        deletePlatformAssignment(item.id);
                        setPlatformAssignments(getAllAssignments());
                      }}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500">{item.description}</p>

                  <div className="flex flex-wrap gap-1.5 text-[11px] font-bold text-slate-600 dark:text-slate-300">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800">
                      الأسئلة: {item.questionsCount} سؤال
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800">
                      الوقت: {item.timeMode === "stopwatch" ? "تايمر مفتوح" : `${item.timeLimitMinutes} دقائق`}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                      الفئة:{" "}
                      {item.targetType === "all_students"
                        ? "جميع الطلاب"
                        : item.targetType === "active_subscribers"
                        ? "المشتركون الفعالون"
                        : item.targetType === "by_governorate"
                        ? `محافظة ${item.targetValue || ""}`
                        : item.targetType === "by_level"
                        ? item.targetValue || "مستوى محدد"
                        : "طلاب المدرب"}
                    </span>
                    {item.notifyStudents !== false && (
                      <span className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                        🔔 إشعار تلقائي مفعّل
                      </span>
                    )}
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                      المشاركون: {item.submissions?.length || 0} طالب
                    </span>
                  </div>

                  {/* Multi-Rule Groups Details */}
                  {item.ruleGroups && item.ruleGroups.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {item.ruleGroups.map((g, gi) => (
                        <span
                          key={g.id || gi}
                          className="px-2.5 py-1 rounded-lg bg-brand-50 dark:bg-brand-950/50 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800 text-[11px] font-bold"
                        >
                          ({gi + 1}) {formatRuleGroupShortAr(g)}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Leaderboard Preview */}
                  {item.submissions && item.submissions.length > 0 && (
                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                      <div className="text-xs font-black text-amber-600">
                        🥇 ترتيب الأبطال الفائزين (حسب الأعلى دقة والأسرع وقتاً):
                      </div>
                      <div className="space-y-1.5 max-h-40 overflow-y-auto">
                        {item.submissions.slice(0, 10).map((sub, idx) => (
                          <div
                            key={sub.studentId}
                            className="flex items-center justify-between text-xs font-bold bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl"
                          >
                            <span>
                              {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${idx + 1}`}{" "}
                              {sub.studentName} {sub.governorate ? `(${sub.governorate})` : ""}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-emerald-600">
                                {sub.correctAnswers}/{sub.totalQuestions} ({sub.accuracy}%) • {sub.durationSeconds}ث
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  setSelectedCompSubmission({
                                    submission: sub,
                                    title: item.title,
                                    rank: idx + 1,
                                  })
                                }
                                className="px-2.5 py-1 rounded-lg bg-brand-100 hover:bg-brand-200 dark:bg-brand-950/70 text-brand-700 dark:text-brand-300 font-black text-[11px]"
                              >
                                التفاصيل 📊
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-end gap-2">
                  {(() => {
                    const relPath = buildShareableAssignmentPath(item);
                    const fullShareUrl =
                      typeof window !== "undefined"
                        ? `${window.location.origin}${relPath}`
                        : relPath;
                    const waShareHref = `https://wa.me/?text=${encodeURIComponent(
                      `🏆 مسابقة وتحدي رسمي من منصة العقل الخارق (SUPER MIND):\n📌 ${item.title}\n🔢 عدد الأسئلة: ${item.questionsCount} سؤال | الوقت: ${item.timeLimitMinutes} دقائق\n🚀 اضغط هنا لبدء المسابقة فوراً بضغطة زر:\n${fullShareUrl}`
                    )}`;

                    return (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            if (typeof navigator !== "undefined" && navigator.clipboard) {
                              navigator.clipboard.writeText(fullShareUrl);
                              alert("تم نسخ رابط المسابقة الذكي! يمكنك إرساله لجميع المشتركين عبر واتساب أو تيليجرام.");
                            }
                          }}
                          className="px-3.5 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 font-black text-xs"
                        >
                          🔗 نسخ رابط المسابقة
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
                          className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs"
                        >
                          معاينة وتجربة المسابقة 🚀
                        </Link>
                      </>
                    );
                  })()}
                </div>
              </div>
            ))}
          </div>

          {/* Full Multi-Rule Competition Simulator Modal for Admin */}
          <AdminCompetitionCreatorModal
            open={showCreateCompModal}
            onClose={() => setShowCreateCompModal(false)}
            onCreated={() => {
              setPlatformAssignments(getAllAssignments());
              playFx("fanfare");
            }}
          />

          <StudentResultDetailModal
            submission={selectedCompSubmission?.submission || null}
            assignmentTitle={selectedCompSubmission?.title}
            rank={selectedCompSubmission?.rank}
            onClose={() => setSelectedCompSubmission(null)}
          />
        </div>
      )}

      {/* =========================================================================
          TAB 6: AUDIT LOGS
         ========================================================================= */}
      {activeTab === "audit" && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-brand-600" />
            <span>سجل العمليات الإدارية والرقابة (Audit Trail)</span>
          </h2>

          <div className="space-y-2 text-xs">
            {auditLogs.length === 0 ? (
              <p className="text-slate-400 p-4 text-center">لا توجد عمليات إدارية مسجلة بعد في سجل الرقابة.</p>
            ) : (
              auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4 font-mono"
                >
                  <div>
                    <strong className="text-slate-800 dark:text-slate-200">{log.action}</strong>
                    <span className="text-slate-400 mx-2">•</span>
                    <span className="text-slate-500">{log.target_type} ({log.target_id})</span>
                  </div>
                  <div className="text-slate-400 text-[10px]">
                    {new Date(log.created_at).toLocaleString("ar-IQ")}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
