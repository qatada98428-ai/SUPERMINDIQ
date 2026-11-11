"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  School,
  Building2,
  BookOpen,
  MessageCircle,
  ShieldCheck,
  MapPin,
  Award,
  Phone,
} from "lucide-react";
import {
  SCHOOLS_DIRECTORY,
  getSchoolApplicationLink,
  SchoolProfile,
} from "@/lib/constants";
import { useApp } from "@/context/AppContext";

export default function SchoolsDirectoryPage() {
  const { playFx } = useApp();

  const schoolApplicationLink = getSchoolApplicationLink();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12">
      {/* Header Banner */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-900 text-white p-8 sm:p-12 lg:p-14 border border-emerald-800/40 shadow-2xl">
        <div className="absolute -top-16 -right-16 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-400/20 border border-emerald-400/30 text-emerald-300 text-xs sm:text-sm font-bold">
            <School className="w-4 h-4 text-emerald-400" />
            <span>المؤسسات والمدارس التي تعتمد برنامج العقل الخارق رسمياً</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
            المدارس والمؤسسات التي تعتمد برنامج العقل الخارق
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            المدارس الأهلية المعتمدة التي تعتمد وتتبنى رسمياً مناهج وحقائب برنامج العقل الخارق وتدريس السوروبان والفلاش أنزان بإشراف وتأليف الأستاذ قتادة كريم.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <a
              href={schoolApplicationLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => playFx("click")}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4 text-slate-950" />
              <span>أدرج مدرستك في المنصة (الاشتراك السنوي: 75,000 د.ع)</span>
            </a>

            <Link
              href="/trainers"
              className="px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/20 transition-colors flex items-center gap-2"
            >
              <Award className="w-4 h-4 text-amber-400" />
              <span>قسم الاعتمادات والمدربين</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 3 Real Partner Schools Grid with Front Book Photo */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            المؤسسات المعتمدة ونسخ المناهج الرسمية
          </h2>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
            ● شركاء منهج معتمدون
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {SCHOOLS_DIRECTORY.map((school: SchoolProfile) => {
            if (school.isPlaceholder) {
              return (
                <div
                  key={school.id}
                  className="bg-slate-50/70 dark:bg-slate-900/60 rounded-3xl p-6 border-2 border-dashed border-emerald-300 dark:border-emerald-800 flex flex-col justify-between space-y-6"
                >
                  <div className="space-y-4">
                    <div className="w-full aspect-[3/4] rounded-2xl border-2 border-dashed border-emerald-400/60 bg-white dark:bg-slate-800 flex flex-col items-center justify-center p-6 text-center text-slate-400 space-y-2">
                      <Building2 className="w-10 h-10 text-emerald-500" />
                      <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                        مساحة مخصصة لكتاب وشعار مدرستكم
                      </span>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        يتم وضع صورة غلاف المنهاج المخصص لمدرستكم واسمها وشعارها هنا.
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-black px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300">
                        متاح للشراكة والاعتماد
                      </span>
                      <h3 className="text-base font-black text-slate-800 dark:text-slate-200">
                        {school.name}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        {school.bio}
                      </p>
                    </div>
                  </div>

                  <a
                    href={schoolApplicationLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => playFx("click")}
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>قدّم طلب إدراج مدرستك عبر واتساب</span>
                  </a>
                </div>
              );
            }

            const directWhatsapp = `https://wa.me/${school.whatsapp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
              `مرحباً إدارة ${school.name}، أود الاستفسار عن منهاج العقل الخارق المعتمد لديكم.`
            )}`;

            return (
              <div
                key={school.id}
                className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between space-y-5"
              >
                <div className="space-y-4">
                  {/* The Official Book Cover Photo Proudly Displayed in Front of School */}
                  <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden bg-slate-950 border-2 border-amber-400/80 shadow-md group">
                    <Image
                      src={school.bookCoverImage}
                      alt={`غلاف منهج العقل الخارق لـ ${school.name}`}
                      fill
                      className="object-cover object-top transform transition-transform duration-500 group-hover:scale-103"
                    />
                    <div className="absolute top-3 right-3 bg-slate-950/85 backdrop-blur-sm px-2.5 py-1 rounded-full text-[10px] font-black text-amber-300 border border-amber-400/50 flex items-center gap-1 shadow-md">
                      <BookOpen className="w-3 h-3 text-amber-400" />
                      <span>كتاب المنهاج المعتمد</span>
                    </div>
                  </div>

                  {/* School Info */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300">
                        {school.status}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-snug">
                      {school.name}
                    </h3>

                    <div className="text-xs font-bold text-brand-600 dark:text-brand-400">
                      {school.curriculumStage}
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-400 font-semibold">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span>{school.address}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                      <Phone className="w-3.5 h-3.5 shrink-0" />
                      <span>هاتف المدرسة: {school.whatsapp.replace("+964", "0")}</span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
                      {school.bio}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <a
                    href={directWhatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => playFx("click")}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>تواصل مع المدرسة عبر واتساب ({school.whatsapp.replace("+964", "0")})</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Policy Guarantee Banner */}
      <section className="bg-gradient-to-r from-emerald-50 via-teal-50 to-amber-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-6 sm:p-8 rounded-3xl border border-emerald-200/80 dark:border-slate-800 flex items-start gap-4">
        <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0 mt-1" />
        <div className="space-y-1 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          <div className="font-bold text-slate-900 dark:text-white">
            شراكة تعليمية رسمية ومناهج معتمدة:
          </div>
          <p>
            تلتزم منصة العقل الخارق بتزويد المدارس الشريكة بكافة مستلزمات التدريب الصفي، وتدريب الأساتذة، ومتابعة المسابقات المدرسية لضمان تفوق الطلاب في الرياضيات الذهنية.
          </p>
        </div>
      </section>
    </div>
  );
}
