"use client";

import React, { useState } from "react";
import {
  MessageCircle,
  Phone,
  Send,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  UserCheck,
  Award,
} from "lucide-react";
import { PLATFORM_INFO, getWhatsAppLink } from "@/lib/constants";

// Custom SVG Icons for Social Platforms
function InstagramIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

function TikTokIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.47 6.27 6.27 0 0 0 1.87-4.47V8.78a8.28 8.28 0 0 0 4.9 1.57v-3.66a4.86 4.86 0 0 1-1-.0z" />
    </svg>
  );
}

function FacebookIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function YouTubeIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    subject: "استفسار عن الاشتراكات وتدريب الطلاب",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    const msg = `مرحباً أستاذ قتادة كريم، أنا ${form.name.trim() || "مستخدم جديد"}.
• رقم الهاتف: ${form.phone.trim() || "لم يُحدد"}
• الموضوع: ${form.subject}
• الرسالة: ${form.message.trim() || "أود الاستفسار عن برامج العقل الخارق"}`;

    const url = `https://wa.me/${PLATFORM_INFO.whatsappRaw}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
  };

  const directWhatsApp = getWhatsAppLink(
    "مرحباً أستاذ قتادة كريم، يسعدني التواصل معك بشأن برنامج العقل الخارق SUPER MIND والاستفسار عن تفاصيل التدريب والمناهج."
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16">
      {/* Top Banner Header */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white p-8 sm:p-14 border border-indigo-800/40 shadow-2xl text-right">
        <div className="absolute -top-16 -right-16 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-400/20 border border-emerald-400/30 text-emerald-300 text-xs sm:text-sm font-bold">
            <MessageCircle className="w-4 h-4 text-emerald-400" />
            <span>قنوات التواصل الرسمية والمباشرة</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-tight">
            تواصل معنا | <span className="text-gradient">برنامج العقل الخارق SUPER MIND</span>
          </h1>

          <p className="text-lg sm:text-xl font-bold text-amber-300">
            إعداد وتأليف الأستاذ قتادة كريم — ماجستير رياضيات ومدرب حساب ذهني دولي معتمد
          </p>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            نحو جيل متميز في الحساب الذهني، وسرعة البديهة، وتنمية القدرات العقلية. يسعدنا استقبال استفسارات أولياء الأمور، المدربين، والمدارس والمراكز التعليمية.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4">
            <a
              href="https://wa.me/9647806086016"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-sm sm:text-base shadow-xl shadow-emerald-500/25 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <MessageCircle className="w-5 h-5 text-amber-300" />
              <span>مراسلة واتساب المباشرة: 07806086016</span>
            </a>
          </div>
        </div>
      </div>

      {/* Grid of Channels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Right 7 Cols: Official & Personal Social Accounts */}
        <div className="lg:col-span-7 space-y-8">
          {/* Section 1: الحسابات الرسمية لبرنامج العقل الخارق */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-md space-y-5 text-right">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-brand-600 bg-brand-50 px-3 py-1 rounded-full">
                المنصة الرسمية
              </span>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
                <span>الحسابات الرسمية لبرنامج العقل الخارق</span>
                <Sparkles className="w-5 h-5 text-amber-500" />
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Official Instagram */}
              <a
                href="https://www.instagram.com/4.math/"
                target="_blank"
                rel="noopener noreferrer"
                className="group p-4 rounded-2xl border border-slate-200 hover:border-pink-300 bg-gradient-to-br from-pink-50/50 via-white to-purple-50/50 hover:shadow-lg transition-all duration-300 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                    <InstagramIcon className="w-6 h-6" />
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-500 font-semibold block">إنستغرام البرنامج</span>
                    <span dir="ltr" className="font-black text-slate-900 text-sm group-hover:text-pink-600 transition-colors">
                      @4.math
                    </span>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-pink-600 group-hover:translate-x-0.5 transition-all" />
              </a>

              {/* Official TikTok */}
              <a
                href="https://www.tiktok.com/@4.math"
                target="_blank"
                rel="noopener noreferrer"
                className="group p-4 rounded-2xl border border-slate-200 hover:border-slate-400 bg-gradient-to-br from-slate-50 via-white to-slate-100 hover:shadow-lg transition-all duration-300 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-950 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                    <TikTokIcon className="w-6 h-6" />
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-500 font-semibold block">تيك توك البرنامج</span>
                    <span dir="ltr" className="font-black text-slate-900 text-sm group-hover:text-brand-600 transition-colors">
                      @4.math
                    </span>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all" />
              </a>
            </div>
          </div>

          {/* Section 2: الحسابات الشخصية للمؤلف (الأستاذ قتادة كريم) */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-md space-y-5 text-right">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full">
                المؤلف والمؤسس
              </span>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
                <span>الحسابات الشخصية للمؤلف (الأستاذ قتادة كريم)</span>
                <UserCheck className="w-5 h-5 text-emerald-600" />
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Author Instagram */}
              <a
                href="https://www.instagram.com/4doot/"
                target="_blank"
                rel="noopener noreferrer"
                className="group p-4 rounded-2xl border border-slate-200 hover:border-pink-300 bg-gradient-to-br from-pink-50/40 via-white to-purple-50/40 hover:shadow-lg transition-all duration-300 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                    <InstagramIcon className="w-6 h-6" />
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-500 font-semibold block">إنستغرام الشخصي</span>
                    <span dir="ltr" className="font-black text-slate-900 text-sm group-hover:text-pink-600 transition-colors">
                      @4doot
                    </span>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-pink-600 transition-all" />
              </a>

              {/* Author Facebook */}
              <a
                href="https://www.facebook.com/qatada98"
                target="_blank"
                rel="noopener noreferrer"
                className="group p-4 rounded-2xl border border-slate-200 hover:border-blue-300 bg-gradient-to-br from-blue-50/40 via-white to-indigo-50/40 hover:shadow-lg transition-all duration-300 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#1877F2] text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                    <FacebookIcon className="w-6 h-6" />
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-500 font-semibold block">فيسبوك</span>
                    <span dir="ltr" className="font-black text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
                      qatada98
                    </span>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-all" />
              </a>

              {/* Author YouTube */}
              <a
                href="https://www.youtube.com/@4doot"
                target="_blank"
                rel="noopener noreferrer"
                className="group p-4 rounded-2xl border border-slate-200 hover:border-red-300 bg-gradient-to-br from-red-50/40 via-white to-rose-50/40 hover:shadow-lg transition-all duration-300 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#FF0000] text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                    <YouTubeIcon className="w-6 h-6" />
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-500 font-semibold block">يوتيوب</span>
                    <span dir="ltr" className="font-black text-slate-900 text-sm group-hover:text-red-600 transition-colors">
                      @4doot
                    </span>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-red-600 transition-all" />
              </a>

              {/* Author TikTok */}
              <a
                href="https://www.tiktok.com/@4doot"
                target="_blank"
                rel="noopener noreferrer"
                className="group p-4 rounded-2xl border border-slate-200 hover:border-slate-400 bg-gradient-to-br from-slate-50 via-white to-slate-100 hover:shadow-lg transition-all duration-300 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-950 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                    <TikTokIcon className="w-6 h-6" />
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-500 font-semibold block">تيك توك الشخصي</span>
                    <span dir="ltr" className="font-black text-slate-900 text-sm group-hover:text-brand-600 transition-colors">
                      @4doot
                    </span>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-slate-900 transition-all" />
              </a>
            </div>
          </div>

          {/* Section 3: التواصل والاستفسارات والاشتراكات */}
          <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 text-white p-6 sm:p-8 rounded-3xl shadow-xl space-y-5 text-right">
            <div className="flex items-center justify-between border-b border-white/20 pb-3">
              <span className="text-xs font-bold text-amber-300 bg-white/10 px-3 py-1 rounded-full">
                اتصال وواتساب
              </span>
              <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                <span>التواصل والاستفسارات والاشتراكات</span>
                <MessageCircle className="w-5 h-5 text-amber-300" />
              </h3>
            </div>

            <div className="space-y-2">
              <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed">
                لطلب المناهج، تسجيل الطلاب، برامج تدريب المدربين، أو اعتماد المدارس والمراكز الأهلية:
              </p>
              <div className="p-4 rounded-2xl bg-white/10 border border-white/20 text-center">
                <span className="text-xs text-emerald-200 block mb-1">رقم واتساب المعتمد:</span>
                <span dir="ltr" className="text-2xl sm:text-3xl font-black font-mono tracking-wider block text-white">
                  +964 780 608 6016
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <a
                href="https://wa.me/9647806086016"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:flex-1 py-3.5 px-6 rounded-2xl bg-white hover:bg-emerald-50 text-emerald-800 font-black text-sm sm:text-base shadow-lg transition-transform hover:scale-102 active:scale-98 flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5 text-emerald-600" />
                <span>رابط واتساب المباشر (اضغط للمحادثة)</span>
              </a>

              <a
                href="tel:+9647806086016"
                className="w-full sm:w-auto py-3.5 px-6 rounded-2xl bg-emerald-800/60 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm border border-white/20 transition-colors flex items-center justify-center gap-2"
              >
                <Phone className="w-4 h-4 text-amber-300" />
                <span>اتصال هاتفي</span>
              </a>
            </div>
          </div>
        </div>

        {/* Left 5 Cols: Fast Message Form */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 text-right">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold mb-2">
              <Send className="w-3.5 h-3.5 text-brand-600" />
              <span>مراسلة سريعة عبر واتساب</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900">
              أرسل استفسارك مباشرة
            </h3>
            <p className="text-slate-500 text-xs sm:text-sm mt-1 leading-relaxed">
              املأ الحقول التالية وسيتم تجهيز الرسالة وفتح محادثة واتساب مع الأستاذ قتادة كريم فوراً:
            </p>
          </div>

          {submitted ? (
            <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h4 className="font-bold text-base text-emerald-900">تم تحويل الرسالة إلى واتساب</h4>
              <p className="text-xs text-emerald-700">
                شكراً لتواصلك مع برنامج العقل الخارق SUPER MIND.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="text-xs font-bold text-brand-600 hover:underline pt-2 block mx-auto"
              >
                إرسال استفسار جديد
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  الاسم الكامل <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: د. محمد علي"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  رقم الهاتف أو واتساب
                </label>
                <input
                  type="tel"
                  placeholder="0780xxxxxxx"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  نوع الاستفسار <span className="text-rose-500">*</span>
                </label>
                <select
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none bg-white text-slate-700"
                >
                  <option value="استفسار عن الاشتراكات وتدريب الطلاب">اشتراكات الطلاب والتدريب</option>
                  <option value="طلب المناهج والحقائب التدريبية الورقية">طلب المناهج والحقائب التدريبية</option>
                  <option value="برنامج تدريب واعتماد المدربين">برنامج تدريب واعتماد المدربين</option>
                  <option value="ترخيص واعتماد مركز أو مدرسة">اعتماد مركز تعليمي أو مدرسة</option>
                  <option value="استفسار عام">استفسار عام أو دعم فني</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  نص الاستفسار <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="اكتب تفاصيل استفسارك هنا..."
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm shadow-lg shadow-emerald-500/25 transition-all hover:scale-102 active:scale-98 flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5 text-amber-300" />
                <span>إرسال المحادثة إلى واتساب مباشرة 📲</span>
              </button>

              <a
                href={directWhatsApp}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <span>محادثة فورية بدون ملء النموذج</span>
              </a>
            </form>
          )}

          <div className="pt-4 border-t border-slate-100 space-y-2">
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <Award className="w-4 h-4 text-amber-500 shrink-0" />
              <span>برنامج العقل الخارق — إعداد وتأليف أ. قتادة كريم</span>
            </div>
            <p className="text-[11px] text-slate-400">
              نحو جيل متميز في الحساب الذهني، وسرعة البديهة، وتنمية القدرات العقلية.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
