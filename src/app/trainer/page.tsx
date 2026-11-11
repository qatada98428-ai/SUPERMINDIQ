"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Users,
  Award,
  Search,
  UserPlus,
  Layers,
  TrendingUp,
  ShieldCheck,
  MessageCircle,
  ChevronLeft,
} from "lucide-react";
import { MOCK_TRAINER, getWhatsAppLink } from "@/lib/constants";

export default function TrainerDashboardPage() {
  const trainer = MOCK_TRAINER;
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroupFilter, setSelectedGroupFilter] = useState("all");

  const filteredStudents = trainer.students.filter((st) => {
    const matchesSearch =
      st.name.includes(searchQuery) || st.level.includes(searchQuery);
    const matchesGroup =
      selectedGroupFilter === "all" || st.group === selectedGroupFilter;
    return matchesSearch && matchesGroup;
  });

  const whatsappDirectGroup = getWhatsAppLink(
    "مرحباً أبطال مجموعة الحساب الذهني، إليكم رابط التدريب اليومي على منصة العقل الخارق SUPER MIND."
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Trainer Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-6 sm:p-10 border border-slate-800 shadow-xl">
        <div className="absolute -top-10 left-10 w-80 h-80 bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="relative shrink-0">
              <Image
                src={trainer.avatar}
                alt={trainer.name}
                width={112}
                height={112}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover object-top border-2 border-amber-400/80 shadow-lg shadow-amber-500/20"
              />
              <span className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 font-black text-[10px] tracking-wide uppercase shadow-sm">
                Champion
              </span>
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{trainer.licenseStatus}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black">
                {trainer.name}
              </h1>

              <div className="text-amber-400 text-sm sm:text-base font-bold flex items-center gap-2">
                <Award className="w-4 h-4" />
                <span>{trainer.role}</span>
              </div>

              <p className="text-slate-300 text-xs sm:text-sm max-w-xl">
                إدارة الفصول التدريبية، متابعة سرعة ودقة الطلاب في السوروبان والفلاش أنزان، وإصدار التكليفات اليومية وصناعة أبطال المستقبل.
              </p>
            </div>
          </div>

          {/* Seat Capacity Card */}
          <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 sm:p-5 text-right min-w-[240px]">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span>المقاعد المستخدمة بالرخصة</span>
              <span className="font-mono text-emerald-400 font-bold">
                {trainer.seats.used} / {trainer.seats.total}
              </span>
            </div>
            <div className="h-2.5 w-full bg-slate-700 rounded-full overflow-hidden mb-3">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                style={{
                  width: `${(trainer.seats.used / trainer.seats.total) * 100}%`,
                }}
              />
            </div>
            <Link
              href="/subscriptions"
              className="text-xs text-brand-400 hover:text-brand-300 font-bold flex items-center justify-end gap-1"
            >
              <span>ترقية أو إضافة مقاعد جديدة</span>
              <ChevronLeft className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>إجمالي الطلاب النشطين</span>
            <Users className="w-4 h-4 text-brand-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
            {trainer.stats.totalStudents}
          </div>
          <div className="text-xs text-emerald-600 font-medium">موزعون على 4 مجموعات</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>المجموعات التدريبية</span>
            <Layers className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
            {trainer.stats.activeGroups}
          </div>
          <div className="text-xs text-slate-500 font-medium">مستويات من 1 إلى 4</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>متوسط دقة الفصول</span>
            <Award className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 font-mono">
            {trainer.stats.avgClassAccuracy}%
          </div>
          <div className="text-xs text-slate-500 font-medium">معدل مرتفع جداً</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>التمارين المنجزة أسبوعياً</span>
            <TrendingUp className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
            +{trainer.stats.weeklySolvedExercises}
          </div>
          <div className="text-xs text-slate-500 font-medium">تمارين حلها طلابك هذا الأسبوع</div>
        </div>
      </div>

      {/* Active Groups Overview Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-slate-900">المجموعات التدريبية النشطة</h2>
          <span className="text-xs text-slate-500">4 مجموعات قيد التدريب الفعلي</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {trainer.groups.map((group) => (
            <div
              key={group.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-brand-300 transition-all space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
                  {group.studentsCount} طلاب
                </span>
                <span className="text-xs text-emerald-600 font-bold font-mono">
                  {group.avgAccuracy}% دقة
                </span>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-sm">{group.name}</h3>
                <p className="text-xs text-brand-600 font-medium mt-0.5">{group.level}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>آخر نشاط: {group.lastActive}</span>
                <a
                  href={whatsappDirectGroup}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1"
                  title="مراسلة عبر واتساب"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>تواصل</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Students Management Table & Controls */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-6 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">قائمة الطلاب والمتابعة الدورية</h3>
            <p className="text-xs text-slate-500">عرض مستويات الطلاب، الدقة، وتاريخ آخر نشاط</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative min-w-[200px] flex-1 sm:flex-initial">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="بحث باسم الطالب..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-9 pl-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            {/* Group Filter */}
            <select
              value={selectedGroupFilter}
              onChange={(e) => setSelectedGroupFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none bg-white text-slate-700"
            >
              <option value="all">كل المجموعات</option>
              {trainer.groups.map((g) => (
                <option key={g.id} value={g.name}>
                  {g.name}
                </option>
              ))}
            </select>

            {/* Add Student Action */}
            <a
              href="https://wa.me/9647806086016?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%20%D8%A5%D8%AF%D8%A7%D8%B1%D8%A9%20%D8%A7%D9%84%D8%B9%D9%82%D9%84%20%D8%A7%D9%84%D8%AE%D8%A7%D8%B1%D9%82%D8%8C%20%D8%A3%D8%B1%D8%BA%D8%A8%20%D8%A8%D8%A5%D8%B6%D8%A7%D9%81%D8%A9%20%D9%85%D9%82%D8%A7%D8%B9%D8%AF%20%D8%B7%D9%84%D8%A7%D8%A8%20%D8%AC%D8%AF%D8%AF%20%D9%84%D8%AD%D8%B3%D8%A7%D8%A8%D9%8A%20%D8%A7%D9%84%D8%AA%D8%AF%D8%B1%D9%8A%D8%A8%D9%8A."
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-colors shadow-xs"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>إضافة طالب جديد</span>
            </a>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs font-bold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-6">اسم الطالب</th>
                <th className="py-3.5 px-6">المجموعة التدريبية</th>
                <th className="py-3.5 px-6">المستوى الحالي</th>
                <th className="py-3.5 px-6">الجلسات المنجزة</th>
                <th className="py-3.5 px-6">نسبة الدقة</th>
                <th className="py-3.5 px-6">آخر جلسة</th>
                <th className="py-3.5 px-6">الحالة</th>
                <th className="py-3.5 px-6 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((st) => (
                <tr key={st.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-6 font-bold text-slate-900">
                    {st.name}
                  </td>
                  <td className="py-4 px-6 text-slate-600 text-xs">
                    {st.group}
                  </td>
                  <td className="py-4 px-6 text-brand-700 font-semibold text-xs">
                    {st.level}
                  </td>
                  <td className="py-4 px-6 font-mono text-slate-700 text-xs">
                    {st.totalSessions} جلسة
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={`font-mono font-bold text-xs ${
                        st.accuracy >= 95
                          ? "text-emerald-600"
                          : st.accuracy >= 90
                          ? "text-brand-600"
                          : "text-amber-600"
                      }`}
                    >
                      {st.accuracy}%
                    </span>
                  </td>
                  <td className="py-4 px-6 text-slate-500 text-xs">
                    {st.lastSession}
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${
                        st.status.includes("مميز")
                          ? "bg-emerald-100 text-emerald-800"
                          : st.status.includes("يحتاج")
                          ? "bg-amber-100 text-amber-800"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {st.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <Link
                      href={`/dashboard`}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-brand-50 text-brand-700 text-xs font-bold transition-colors inline-block"
                    >
                      تقرير الطالب
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Demo Notice footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>البيانات المعروضة حالياً هي بيانات نموذجية (Mock Data) للاستعراض والتصميم في المرحلة الأولى.</span>
          </div>
          <Link
            href="/subscriptions"
            className="text-brand-600 hover:text-brand-700 font-bold"
          >
            استعراض باقات المدربين والمراكز
          </Link>
        </div>
      </div>
    </div>
  );
}
