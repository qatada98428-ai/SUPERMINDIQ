"use client";

import React, { useState, useEffect } from "react";
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
  Trophy,
} from "lucide-react";
import {
  TRAINERS_DIRECTORY,
  SCHOOLS_DIRECTORY,
  TrainerProfile,
  SchoolProfile,
} from "@/lib/constants";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import {
  ExtendedUserProfile,
  ApprovedSchoolDirectoryEntry,
  getVerifiedTrainersForDirectory,
  fetchApprovedDirectoryFromCloud,
} from "@/lib/platform-store";
import DirectoryApplicationModal from "@/components/directory/DirectoryApplicationModal";

export default function AccreditationsAndPartnersPage() {
  const { language, dir, playFx } = useApp();
  const { user, profile } = useAuth();
  const isEn = language === "en";
  const ArrowIcon = dir === "rtl" ? ArrowLeft : ArrowRight;

  const [activeTab, setActiveTab] = useState<"all" | "trainers" | "schools">("all");
  const [dynamicTrainers, setDynamicTrainers] = useState<ExtendedUserProfile[]>([]);
  const [cloudSchools, setCloudSchools] = useState<ApprovedSchoolDirectoryEntry[]>([]);
  const [dirModalOpen, setDirModalOpen] = useState(false);
  const [dirModalType, setDirModalType] = useState<"trainer" | "school">("trainer");

  useEffect(() => {
    setDynamicTrainers(getVerifiedTrainersForDirectory());
    fetchApprovedDirectoryFromCloud().then(({ trainers, schools }) => {
      if (trainers) setDynamicTrainers(trainers);
      if (schools) setCloudSchools(schools);
    });
  }, []);

  const openApplyModal = (type: "trainer" | "school") => {
    playFx("click");
    setDirModalType(type);
    setDirModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12">
      {/* Header Banner */}
      <section className="clay-banner-lavender relative overflow-hidden text-white p-7 sm:p-11 lg:p-14">
        <div className="absolute -top-20 -right-16 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-16 w-80 h-80 bg-amber-300/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl space-y-5">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-white text-xs sm:text-sm font-bold shadow-sm">
            <Award className="w-4 h-4 text-amber-300 shrink-0" />
            <span>
              {isEn ? "Accreditations & Partnerships" : "الاعتمادات الرسمية والشركاء المعتمدون"}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-[2.65rem] font-black text-white leading-[1.28] tracking-tight max-w-3xl">
            {isEn ? (
              <>
                Accreditations &amp;{" "}
                <span className="text-amber-200">Partner Institutions</span>
              </>
            ) : (
              <>
                <span className="text-amber-200">الاعتمادات</span> والمؤسسات التي تعتمد برنامجنا
              </>
            )}
          </h1>

          <p className="text-indigo-50/90 text-sm sm:text-base leading-7 max-w-2xl">
            {isEn
              ? "The verified directory of SUPER MIND master coaches and partner schools adopting official customized mental arithmetic curriculum editions across Iraq and the Arab region."
              : "الدليل المعتمد لمنصة وبرنامج العقل الخارق؛ يجمع المدربين المعتمدين والمؤسسات والمدارس الأهلية الرائدة التي تعتمد رسمياً نسخ المناهج والحقائب التعليمية بإشراف وإعداد الأستاذ قتادة كريم."}
          </p>

          {/* Quick Dual Action Box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
            {/* Trainer listing action */}
            <button
              type="button"
              onClick={() => openApplyModal("trainer")}
              className={`p-4 sm:p-5 rounded-2xl bg-[#1C1245]/45 hover:bg-[#1C1245]/65 backdrop-blur-md border border-white/25 hover:border-amber-300/60 shadow-lg transition-all hover:-translate-y-0.5 flex items-center justify-between gap-3 group ${
                isEn ? "text-left" : "text-right"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-300/35 text-amber-200 flex items-center justify-center shrink-0 mt-0.5">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="text-xs sm:text-sm font-black text-white group-hover:text-amber-200 transition-colors">
                    {isEn
                      ? "List Yourself as a Certified Trainer"
                      : "أضف بياناتك كمدرب معتمد في الدليل مباشرة"}
                  </div>
                  <div className="text-[11px] sm:text-xs text-indigo-100/85 leading-relaxed">
                    {isEn
                      ? "Submit your profile card for review and instant directory publishing"
                      : "املأ بطاقتك ليتم اعتمادها ونشرها فور موافقة الإدارة"}
                  </div>
                </div>
              </div>
              <ArrowIcon className="w-4 h-4 text-amber-200 shrink-0 transition-transform group-hover:scale-110" />
            </button>

            {/* School listing action */}
            <button
              type="button"
              onClick={() => openApplyModal("school")}
              className={`p-4 sm:p-5 rounded-2xl bg-[#1C1245]/45 hover:bg-[#1C1245]/65 backdrop-blur-md border border-white/25 hover:border-emerald-300/60 shadow-lg transition-all hover:-translate-y-0.5 flex items-center justify-between gap-3 group ${
                isEn ? "text-left" : "text-right"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-400/20 border border-emerald-300/35 text-emerald-200 flex items-center justify-center shrink-0 mt-0.5">
                  <Building2 className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="text-xs sm:text-sm font-black text-white group-hover:text-emerald-200 transition-colors">
                    {isEn
                      ? "Add Your School or Center (Accredited)"
                      : "أضف مدرستك أو مركزك في الدليل (اعتماد رسمي)"}
                  </div>
                  <div className="text-[11px] sm:text-xs text-indigo-100/85 leading-relaxed">
                    {isEn
                      ? "Submit school details and cover photo for accreditation review"
                      : "أدرج بيانات مدرستك وصورتها وتنشر بعد المراجعة"}
                  </div>
                </div>
              </div>
              <ArrowIcon className="w-4 h-4 text-emerald-200 shrink-0 transition-transform group-hover:scale-110" />
            </button>
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
                  : "ملف المشرف العام للأستاذ قتادة كريم والمدربون المعتمدون والمساحات المفتوحة للإدراج."}
              </p>
            </div>

            <button
              type="button"
              onClick={() => openApplyModal("trainer")}
              className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-transform active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
              <span>أدرج بطاقتك كمدرب معتمد في الدليل</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {dynamicTrainers
              .filter((dt) => dt.id !== "trainer-qatada")
              .map((dt) => (
                <div
                  key={dt.id}
                  className="bg-white dark:bg-slate-900 rounded-3xl p-6 border-2 border-emerald-500/70 shadow-xl flex flex-col justify-between space-y-5"
                >
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 border-2 border-emerald-400 bg-slate-800 flex items-center justify-center text-white font-black text-xl">
                        {dt.avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={dt.avatarUrl}
                            alt={dt.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          dt.name.charAt(0)
                        )}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                            {dt.name}
                          </h3>
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950">
                            مدرب موثق ✅
                          </span>
                        </div>
                        <p className="text-xs text-brand-600 dark:text-brand-400 font-bold">
                          {dt.trainerTitle || "مدرب حساب ذهني معتمد"}
                        </p>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-400 font-semibold">
                          <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          <span>
                            {dt.country} — {dt.governorate}
                          </span>
                        </div>
                      </div>
                    </div>

                    {dt.bio && (
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                        {dt.bio}
                      </p>
                    )}

                    {dt.achievements && dt.achievements.length > 0 && (
                      <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                          <Trophy className="w-3.5 h-3.5" />
                          <span>إنجازات وكؤوس المدرب وطلابه:</span>
                        </span>
                        <div className="space-y-1">
                          {dt.achievements.slice(0, 3).map((ach) => (
                            <div
                              key={ach.id}
                              className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-200 border border-amber-200/70 dark:border-amber-800/60"
                            >
                              🏆 {ach.title} ({ach.year})
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {dt.phone && (
                    <div className="pt-2">
                      <a
                        href={`https://wa.me/${dt.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                          `مرحباً ${dt.name}، أود الاستفسار عن دورات الحساب الذهني.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition-all flex items-center justify-center gap-2 shadow-sm"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>اضغط للتواصل مع {dt.name}</span>
                      </a>
                    </div>
                  )}
                </div>
              ))}
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
                        <div className="font-bold text-brand-600">
                          الباقات: شهري 25,000 | 3 أشهر 50,000 | سنوي 100,000 د.ع
                        </div>
                        <div className="text-[11px] text-slate-400">شامل توثيق الحساب ولوحة الطلاب والواجبات</div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => openApplyModal("trainer")}
                      className="w-full py-2.5 rounded-xl bg-white dark:bg-slate-800 border-2 border-brand-500 text-brand-600 dark:text-brand-300 hover:bg-brand-50 dark:hover:bg-brand-950 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>أضف معلوماتك للدليل مباشرة</span>
                    </button>
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
                      <span>اضغط للتواصل مع {trainer.name}</span>
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

            <button
              type="button"
              onClick={() => openApplyModal("school")}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-transform active:scale-95"
            >
              <School className="w-4 h-4" />
              <span>أدرج مدرستك في الدليل للمراجعة الإدارية</span>
            </button>
          </div>

          {/* Partner Schools Grid with Big Official Book Photos in Front of Each Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cloudSchools.map((cs) => {
              const csWhatsapp = cs.phone
                ? `https://wa.me/${cs.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                    `مرحباً إدارة ${cs.name}، أود الاستفسار عن منهاج العقل الخارق المعتمد لديكم.`
                  )}`
                : null;
              return (
                <div
                  key={cs.id}
                  className="bg-white dark:bg-slate-900 rounded-3xl p-6 border-2 border-emerald-500/70 shadow-xl flex flex-col justify-between space-y-5"
                >
                  <div className="space-y-4">
                    <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border-2 border-emerald-400/70 flex items-center justify-center">
                      {cs.logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={cs.logoUrl}
                          alt={cs.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Building2 className="w-14 h-14 text-emerald-500" />
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950">
                        مدرسة / مركز معتمد ✅
                      </span>
                      <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-snug">
                        {cs.name}
                      </h3>
                      <div className="text-xs font-bold text-brand-600 dark:text-brand-400">
                        {cs.curriculumStage}
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-400 font-semibold">
                        <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span>{cs.address}</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
                        {cs.bio}
                      </p>
                    </div>
                  </div>
                  {csWhatsapp && (
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                      <a
                        href={csWhatsapp}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>اضغط للتواصل مع {cs.name}</span>
                      </a>
                    </div>
                  )}
                </div>
              );
            })}

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

                    <button
                      type="button"
                      onClick={() => openApplyModal("school")}
                      className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm"
                    >
                      <School className="w-4 h-4" />
                      <span>أضف بيانات مدرستك للدليل مباشرة</span>
                    </button>
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
                    {/* The Official Book Cover Photo / School Emblem Proudly Displayed in Front of School */}
                    <div
                      className={`relative w-full aspect-[3/4] rounded-2xl overflow-hidden ${
                        school.id === "sch-irtiqaa" ? "bg-white" : "bg-slate-950"
                      } border-2 border-amber-400/80 shadow-md group`}
                    >
                      <Image
                        src={school.bookCoverImage}
                        alt={`شعار ومنهاج ${school.name}`}
                        fill
                        className={`${
                          school.id === "sch-irtiqaa"
                            ? "object-contain p-4"
                            : "object-cover object-top"
                        } transform transition-transform duration-500 group-hover:scale-103`}
                      />
                      <div className="absolute top-3 right-3 bg-slate-950/85 backdrop-blur-sm px-2.5 py-1 rounded-full text-[10px] font-black text-amber-300 border border-amber-400/50 flex items-center gap-1 shadow-md">
                        <BookOpen className="w-3 h-3 text-amber-400" />
                        <span>{school.id === "sch-irtiqaa" ? "شعار ومؤسسة معتمدة" : "كتاب المنهاج المعتمد"}</span>
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
                      <span>اضغط للتواصل مع {school.name}</span>
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

      <DirectoryApplicationModal
        isOpen={dirModalOpen}
        onClose={() => setDirModalOpen(false)}
        defaultType={dirModalType}
        defaultName={profile?.name || ""}
        defaultEmail={user?.email || profile?.email || ""}
        defaultPhone={profile?.phone || ""}
      />
    </div>
  );
}
