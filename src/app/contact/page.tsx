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
import { FacebookIcon, InstagramIcon, YouTubeIcon } from "@/components/ui/SocialIcons";

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
      <div className="clay-banner-lavender relative overflow-hidden text-white p-8 sm:p-14 text-right">
        <div className="absolute -top-16 -right-16 w-96 h-96 bg-white/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-96 h-96 bg-emerald-300/20 rounded-full blur-3xl pointer-events-none" />

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
              <span>اضغط للتواصل مع الأستاذ قتادة كريم</span>
            </a>
          </div>
        </div>
      </div>

      {/* Grid of Channels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Right 7 Cols: Official & Personal Social Accounts */}
        <div className="lg:col-span-7 space-y-8">
          {/* Section 1: الحسابات الرسمية لبرنامج العقل الخارق */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-md space-y-5 text-right">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <span className="text-xs font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/60 px-3 py-1 rounded-full border border-brand-200 dark:border-brand-800">
                المنصة الرسمية
              </span>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>الحسابات الرسمية لبرنامج العقل الخارق</span>
                <Sparkles className="w-5 h-5 text-amber-500" />
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Official Facebook */}
              <a
                href="https://www.facebook.com/qatada98"
                target="_blank"
                rel="noopener noreferrer"
                className="group p-4 rounded-2xl border border-slate-200 dark:border-slate-700/70 hover:border-blue-400 dark:hover:border-blue-500 bg-gradient-to-br from-blue-50/40 via-white to-indigo-50/30 dark:from-slate-800/60 dark:via-slate-800/40 dark:to-slate-800/60 hover:shadow-lg transition-all duration-300 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-[#1877F2] text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform shrink-0">
                    <FacebookIcon className="w-5 h-5" />
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold block">فيسبوك المنصة</span>
                    <span dir="ltr" className="font-black text-slate-900 dark:text-slate-100 text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      qatada98
                    </span>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-all shrink-0" />
              </a>

              {/* Official Instagram */}
              <a
                href="https://www.instagram.com/supermindiq/"
                target="_blank"
                rel="noopener noreferrer"
                className="group p-4 rounded-2xl border border-slate-200 dark:border-slate-700/70 hover:border-pink-400 dark:hover:border-pink-500 bg-gradient-to-br from-pink-50/40 via-white to-purple-50/30 dark:from-slate-800/60 dark:via-slate-800/40 dark:to-slate-800/60 hover:shadow-lg transition-all duration-300 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform shrink-0">
                    <InstagramIcon className="w-5 h-5" />
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold block">إنستغرام المنصة</span>
                    <span dir="ltr" className="font-black text-slate-900 dark:text-slate-100 text-sm group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                      @supermindiq
                    </span>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-all shrink-0" />
              </a>

              {/* Official YouTube */}
              <a
                href="https://www.youtube.com/@4doot"
                target="_blank"
                rel="noopener noreferrer"
                className="group p-4 rounded-2xl border border-slate-200 dark:border-slate-700/70 hover:border-red-400 dark:hover:border-red-500 bg-gradient-to-br from-red-50/40 via-white to-rose-50/30 dark:from-slate-800/60 dark:via-slate-800/40 dark:to-slate-800/60 hover:shadow-lg transition-all duration-300 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-[#FF0000] text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform shrink-0">
                    <YouTubeIcon className="w-5 h-5" />
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold block">يوتيوب المنصة</span>
                    <span dir="ltr" className="font-black text-slate-900 dark:text-slate-100 text-sm group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                      @4doot
                    </span>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-red-600 dark:group-hover:text-red-400 transition-all shrink-0" />
              </a>
            </div>
          </div>

          {/* Section 2: الحسابات الشخصية للمؤلف (الأستاذ قتادة كريم) */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-md space-y-5 text-right">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <span className="text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-800">
                المؤلف والمؤسس
              </span>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>الحسابات الشخصية للمؤلف (الأستاذ قتادة كريم)</span>
                <UserCheck className="w-5 h-5 text-emerald-600" />
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Author Facebook */}
              <a
                href="https://www.facebook.com/qatada98"
                target="_blank"
                rel="noopener noreferrer"
                className="group p-4 rounded-2xl border border-slate-200 dark:border-slate-700/70 hover:border-blue-400 dark:hover:border-blue-500 bg-gradient-to-br from-blue-50/40 via-white to-indigo-50/30 dark:from-slate-800/60 dark:via-slate-800/40 dark:to-slate-800/60 hover:shadow-lg transition-all duration-300 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-[#1877F2] text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform shrink-0">
                    <FacebookIcon className="w-5 h-5" />
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold block">فيسبوك</span>
                    <span dir="ltr" className="font-black text-slate-900 dark:text-slate-100 text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      qatada98
                    </span>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-all shrink-0" />
              </a>

              {/* Author Instagram */}
              <a
                href="https://www.instagram.com/4doot/"
                target="_blank"
                rel="noopener noreferrer"
                className="group p-4 rounded-2xl border border-slate-200 dark:border-slate-700/70 hover:border-pink-400 dark:hover:border-pink-500 bg-gradient-to-br from-pink-50/40 via-white to-purple-50/30 dark:from-slate-800/60 dark:via-slate-800/40 dark:to-slate-800/60 hover:shadow-lg transition-all duration-300 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform shrink-0">
                    <InstagramIcon className="w-5 h-5" />
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold block">إنستغرام</span>
                    <span dir="ltr" className="font-black text-slate-900 dark:text-slate-100 text-sm group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                      @4doot
                    </span>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-all shrink-0" />
              </a>

              {/* Author YouTube */}
              <a
                href="https://www.youtube.com/@4doot"
                target="_blank"
                rel="noopener noreferrer"
                className="group p-4 rounded-2xl border border-slate-200 dark:border-slate-700/70 hover:border-red-400 dark:hover:border-red-500 bg-gradient-to-br from-red-50/40 via-white to-rose-50/30 dark:from-slate-800/60 dark:via-slate-800/40 dark:to-slate-800/60 hover:shadow-lg transition-all duration-300 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-[#FF0000] text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform shrink-0">
                    <YouTubeIcon className="w-5 h-5" />
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold block">يوتيوب</span>
                    <span dir="ltr" className="font-black text-slate-900 dark:text-slate-100 text-sm group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                      @4doot
                    </span>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-red-600 dark:group-hover:text-red-400 transition-all shrink-0" />
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
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <a
                href="https://wa.me/9647806086016"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:flex-1 py-3.5 px-6 rounded-2xl bg-white hover:bg-emerald-50 text-emerald-800 font-black text-sm sm:text-base shadow-lg transition-transform hover:scale-102 active:scale-98 flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5 text-emerald-600" />
                <span>اضغط للتواصل مع إدارة المنصة</span>
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
