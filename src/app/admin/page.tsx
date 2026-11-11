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
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useApp } from "@/context/AppContext";
import { getSupabaseClient } from "@/lib/supabase/client";
import {
  UserProfile,
  UserProgressRecord,
  TrainerApplicationRecord,
  SchoolApplicationRecord,
  SupporterRecord,
  AdminAuditLogRecord,
} from "@/lib/supabase/types";

export default function AdminDashboardPage() {
  const { user, profile, role, isLoading: authLoading } = useAuth();
  const { language, playFx } = useApp();
  const isEn = language === "en";

  const [activeTab, setActiveTab] = useState<
    "overview" | "users" | "trainers" | "schools" | "supporters" | "audit"
  >("overview");

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

  // New Supporter Modal
  const [showAddSupporter, setShowAddSupporter] = useState(false);
  const [newSupporterName, setNewSupporterName] = useState("");
  const [newSupporterDesc, setNewSupporterDesc] = useState("");
  const [newSupporterLink, setNewSupporterLink] = useState("");

  const isAdmin = role === "admin";

  // Load real data from Supabase
  const loadAdminData = useCallback(async () => {
    const supabase = getSupabaseClient();
    if (!supabase || !isAdmin) return;

    setLoadingData(true);
    try {
      // 1. Fetch Users
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesData) setUsersList(profilesData as UserProfile[]);

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

      // 6. Fetch Audit Logs
      const { data: logs } = await supabase
        .from("admin_audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (logs) setAuditLogs(logs as AdminAuditLogRecord[]);
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
      const matchesSearch =
        (u.name || "").toLowerCase().includes(userSearch.toLowerCase()) ||
        (u.email || "").toLowerCase().includes(userSearch.toLowerCase()) ||
        (u.phone || "").includes(userSearch);
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
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white p-6 sm:p-10 border border-indigo-800/40 shadow-2xl">
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

      {/* =========================================================================
          TAB 2: USERS MANAGEMENT
         ========================================================================= */}
      {activeTab === "users" && (
        <div className="space-y-6">
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
                      return (
                        <tr key={u.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="p-4">
                            <div className="font-bold text-slate-900 dark:text-white">{u.name}</div>
                            <div className="text-[10px] text-slate-400">
                              سجل: {new Date(u.created_at).toLocaleDateString("ar-IQ")}
                            </div>
                          </td>
                          <td className="p-4 text-slate-600 dark:text-slate-300 font-mono">
                            <div>{u.email || "—"}</div>
                            <div className="text-[10px] text-slate-400">{u.phone || "بدون هاتف"}</div>
                          </td>
                          <td className="p-4">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                                u.role === "admin"
                                  ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                                  : u.role === "trainer"
                                  ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                                  : "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                              }`}
                            >
                              {u.role === "admin" ? "مدير" : u.role === "trainer" ? "مدرب" : "طالب"}
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
                          <td className="p-4 text-center">
                            <button
                              onClick={() => {
                                setSelectedUserDetail({ profile: u, progress: prog });
                                playFx("click");
                              }}
                              className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-brand-50 text-brand-600 font-bold text-xs transition-colors"
                            >
                              عرض السجل
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* User Details Modal */}
          {selectedUserDetail && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="space-y-0.5">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">
                      الملف التعليمي: {selectedUserDetail.profile.name}
                    </h3>
                    <p className="text-xs text-slate-400 font-mono">{selectedUserDetail.profile.email || "بدون بريد"}</p>
                  </div>
                  <button
                    onClick={() => setSelectedUserDetail(null)}
                    className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 block text-[10px]">المستوى الحالي:</span>
                    <strong className="text-slate-800 dark:text-slate-200">
                      {selectedUserDetail.progress?.current_level || "المستوى الأول"}
                    </strong>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 block text-[10px]">آخر تمرين:</span>
                    <strong className="text-slate-800 dark:text-slate-200">
                      {selectedUserDetail.progress?.last_exercise || "فلاش أنزان"}
                    </strong>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 block text-[10px]">إجمالي الإجابات:</span>
                    <strong className="text-slate-800 dark:text-slate-200 font-mono">
                      {selectedUserDetail.progress?.total_answers || 0}
                    </strong>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 block text-[10px]">نسبة الدقة:</span>
                    <strong className="text-emerald-600 font-mono">
                      {selectedUserDetail.progress?.accuracy_rate || 0}%
                    </strong>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">تاريخ التسجيل:</span>
                    <span className="font-mono">{new Date(selectedUserDetail.profile.created_at).toLocaleString("ar-IQ")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">آخر نشاط:</span>
                    <span className="font-mono">{new Date(selectedUserDetail.profile.last_activity).toLocaleString("ar-IQ")}</span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedUserDetail(null)}
                  className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs"
                >
                  إغلاق النافذة
                </button>
              </div>
            </div>
          )}
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
