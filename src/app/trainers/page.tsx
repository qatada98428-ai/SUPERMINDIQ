"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  School,
  Award,
  MessageCircle,
  ShieldCheck,
  ArrowLeft,
  ArrowRight,
  UserPlus,
  BookOpen,
  MapPin,
  Building2,
  Phone,
} from "lucide-react";
import {
  TRAINERS_DIRECTORY,
  SCHOOLS_DIRECTORY,
  getTrainerApplicationLink,
  getSchoolApplicationLink,
  TrainerProfile,
  SchoolProfile,
} from "@/lib/constants";
import { useApp } from "@/context/AppContext";

export default function AccreditationsAndPartnersPage() {
  const { language, dir, playFx } = useApp();
  const isEn = language === "en";
  const ArrowIcon = dir === "rtl" ? ArrowLeft : ArrowRight;

  const [activeTab, setActiveTab] = useState<"all" | "trainers" | "schools">("all");

  const trainerApplicationLink = getTrainerApplicationLink();
  const schoolApplicationLink = getSchoolApplicationLink();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12">
      {/* Header Banner */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white p-8 sm:p-12 lg:p-14 border border-indigo-800/40 shadow-2xl">
        <div className="absolute -top-16 -right-16 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/20 border border-amber-400/30 text-amber-300 text-xs sm:text-sm font-bold">
            <Award className="w-4 h-4 text-amber-400" />
            <span>
              {isEn ? "Accreditations & Partnerships" : "الاعتمادات الرسمية والشركاء المعتمدون"}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
            {isEn ? "Accreditations & Partner Institutions" : "الاعتمادات والمؤسسات التي تعتمد برنامجنا"}
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            {isEn
              ? "The verified directory of SUPER MIND master coaches and partner schools adopting official customized mental arithmetic curriculum editions across Iraq and the Arab region."
              : "الدليل المعتمد لمنصة وبرنامج العقل الخارق؛ يجمع المدربين المعتمدين والمؤسسات والمدارس الأهلية الرائدة التي تعتمد رسمياً نسخ المناهج والحقائب التعليمية بإشراف وإعداد الأستاذ قتادة كريم."}
          </p>

          {/* Quick Dual Action Box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {/* Trainer listing action */}
            <a
              href={trainerApplicationLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => playFx("click")}
              className="p-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-amber-400/40 transition-all flex items-center justify-between gap-3 group"
            >
              <div className="space-y-0.5 text-right">
                <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <UserPlus className="w-4 h-4 text-amber-400" />
                  <span>دليل المدربين (25 ألف د.ع/سنة)</span>
                </div>
                <div className="text-[11px] text-slate-300">أدرج اسمك وبياناتك المهنية في الدليل</div>
              </div>
              <ArrowIcon className="w-4 h-4 text-amber-400 transition-transform group-hover:scale-110" />
            </a>

            {/* School listing action */}
            <a
              href={schoolApplicationLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => playFx("click")}
              className="p-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-emerald-400/40 transition-all flex items-center justify-between gap-3 group"
            >
              <div className="space-y-0.5 text-right">
                <div className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-emerald-400" />
                  <span>دليل المدارس (75 ألف د.ع/سنة)</span>
                </div>
                <div className="text-[11px] text-slate-300">أدرج مدرستك مع نسخة كتاب المنهاج</div>
              </div>
              <ArrowIcon className="w-4 h-4 text-emerald-400 transition-transform group-hover:scale-110" />
            </a>
          </div>
        </div>
      </section>

      {/* Section Tabs Switcher */}
      <div className="flex items-center justify-center gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-w-lg mx-auto">
        <button
          onClick={() => {
            setActiveTab("all");
            playFx("click");
          }}
          className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all ${
            activeTab === "all"
              ? "bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-300 shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
          }`}
        >
          {isEn ? "All" : "الكل (المدربون والمدارس)"}
        </button>

        <button
          onClick={() => {
            setActiveTab("trainers");
            playFx("click");
          }}
          className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "trainers"
              ? "bg-brand-600 text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>{isEn ? "Coaches" : "المدربون المعتمدون"}</span>
        </button>

        <button
          onClick={() => {
            setActiveTab("schools");
            playFx("click");
          }}
          className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "schools"
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
          }`}
        >
          <School className="w-3.5 h-3.5" />
          <span>{isEn ? "Schools" : "المؤسسات التي تعتمد برنامجنا"}</span>
        </button>
      </div>

      {/* SECTION 1: TRAINERS DIRECTORY */}
      {(activeTab === "all" || activeTab === "trainers") && (
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400">
                  <Award className="w-5 h-5" />
                </span>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                  {isEn ? "Accredited Coaches Directory" : "قسم المدربين المعتمدين"}
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isEn
                  ? "Certified trainers with supervisor profile and open reservation slots for verified instructors."
                  : "ملف المشرف العام للأستاذ قتادة كريم ومساحات الحجز المخصصة للمدربين المعتمدين."}
              </p>
            </div>

            <a
              href={trainerApplicationLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => playFx("click")}
              className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-transform active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
              <span>أدرج اسمك في دليل المدربين (25,000 د.ع)</span>
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TRAINERS_DIRECTORY.map((trainer: TrainerProfile) => {
              const isReservedSlot = !trainer.avatar;

              if (isReservedSlot) {
                return (
                  <div
                    key={trainer.id}
                    className="bg-slate-50/70 dark:bg-slate-900/60 rounded-3xl p-6 border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col justify-between space-y-5 hover:border-brand-500 transition-colors"
                  >
                    <div className="space-y-4">
                      {/* Placeholder Avatar */}
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl border-2 border-dashed border-slate-400 dark:border-slate-600 bg-white dark:bg-slate-800 flex flex-col items-center justify-center text-slate-400 shrink-0">
                          <UserPlus className="w-6 h-6 text-brand-500" />
                          <span className="text-[9px] font-bold mt-0.5">صورتك هنا</span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] font-black px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300">
                            مساحة شاغرة للإدراج
                          </span>
                          <h3 className="text-base font-black text-slate-800 dark:text-slate-200">
                            مكان مخصص لبياناتك
                          </h3>
                          <div className="text-xs text-slate-500">العراق / الوطن العربي</div>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        {trainer.bio}
                      </p>

                      <div className="p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 space-y-1">
                        <div className="font-bold text-brand-600">الاشتراك السنوي: 25,000 د.ع</div>
                        <div className="text-[11px] text-slate-400">يخضع لتدقيق الإدارة واعتماد رخصة التدريب</div>
                      </div>
                    </div>

                    <a
                      href={trainerApplicationLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => playFx("click")}
                      className="w-full py-2.5 rounded-xl bg-white dark:bg-slate-800 border-2 border-brand-500 text-brand-600 dark:text-brand-300 hover:bg-brand-50 dark:hover:bg-brand-950 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>أدرج اسمك الآن عبر واتساب</span>
                    </a>
                  </div>
                );
              }

              // Real Master Coach Profile (الأستاذ قتادة كريم)
              return (
                <div
                  key={trainer.id}
                  className="bg-white dark:bg-slate-900 rounded-3xl p-6 border-2 border-amber-400 shadow-xl flex flex-col justify-between space-y-5 md:col-span-1 ring-4 ring-amber-400/10"
                >
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="relative w-16 h-16 rounded-2xl overflow-hidden shrink-0 border-2 border-amber-400 shadow-md">
                        <Image
                          src={trainer.avatar}
                          alt={trainer.name}
                          fill
                          className="object-cover object-top"
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                            {trainer.name}
                          </h3>
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-400 text-slate-950">
                            المشرف العام
                          </span>
                        </div>
                        <p className="text-xs text-brand-600 dark:text-brand-400 font-bold">
                          {trainer.title}
                        </p>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-400 font-semibold">
                          <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          <span>العراق — الأنبار — الرمادي</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-amber-600 dark:text-amber-400 font-mono font-bold">
                          <Phone className="w-3.5 h-3.5 shrink-0" />
                          <span>هاتف التواصل: 07806086016</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {trainer.bio}
                    </p>

                    <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-[11px] font-bold text-slate-400 block">المستويات والبرامج:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {trainer.levelsTaught.map((lvl, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800"
                          >
                            {lvl}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <a
                      href={`https://wa.me/${trainer.whatsapp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent("مرحباً أستاذ قتادة كريم، أود الاستفسار عن برامج الحساب الذهني.")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => playFx("click")}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs transition-all flex items-center justify-center gap-2 shadow-sm"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>تواصل مع الأستاذ قتادة كريم</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* SECTION 2: PARTNER SCHOOLS & INSTITUTIONS */}
      {(activeTab === "all" || activeTab === "schools") && (
        <section className="space-y-6 pt-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                  <School className="w-5 h-5" />
                </span>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                  {isEn ? "Partner Schools & Educational Institutions" : "المدارس والمؤسسات التي تعتمد برنامج العقل الخارق"}
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isEn
                  ? "Real accredited partner schools with their custom printed textbook editions shown proudly."
                  : "المدارس والمؤسسات الأهلية المعتمدة مع صور أغلفة كتب المناهج الخاصة بكل منها بإعداد وتأليف الأستاذ قتادة كريم."}
              </p>
            </div>

            <a
              href={schoolApplicationLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => playFx("click")}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-transform active:scale-95"
            >
              <School className="w-4 h-4" />
              <span>أدرج مدرستك في المنصة (75,000 د.ع)</span>
            </a>
          </div>

          {/* Partner Schools Grid with Big Official Book Photos in Front of Each Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {SCHOOLS_DIRECTORY.map((school: SchoolProfile) => {
              if (school.isPlaceholder) {
                return (
                  <div
                    key={school.id}
                    className="bg-slate-50/70 dark:bg-slate-900/60 rounded-3xl p-6 border-2 border-dashed border-emerald-300 dark:border-emerald-800 flex flex-col justify-between space-y-6"
                  >
                    <div className="space-y-4">
                      {/* Book Cover Placeholder */}
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
      )}

      {/* Policy Guarantee Banner */}
      <section className="bg-gradient-to-r from-amber-50 via-indigo-50 to-emerald-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-6 sm:p-8 rounded-3xl border border-amber-200/80 dark:border-slate-800 flex items-start gap-4">
        <ShieldCheck className="w-6 h-6 text-amber-600 shrink-0 mt-1" />
        <div className="space-y-1 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          <div className="font-bold text-slate-900 dark:text-white">
            ميثاق الاعتماد والشراكة الرسمية:
          </div>
          <p>
            تخضع جميع طلبات الإدراج في دليل المدربين ودليل المدارس للمراجعة والتدقيق الإداري من قبل إدارة برنامج العقل الخارق، وتلتزم المنصة بدعم المؤسسات الشريكة بحقائب المناهج التدريبية ورخص التشغيل الصفية.
          </p>
        </div>
      </section>
    </div>
  );
}
