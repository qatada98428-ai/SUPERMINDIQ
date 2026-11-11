"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  HelpCircle,
  MessageCircle,
  Mail,
  Phone,
  ShieldAlert,
  Camera,
  Laptop,
  RefreshCw,
  Volume2,
  Wifi,
  Send,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import {
  TECHNICAL_SUPPORT_CONTENT,
  getTechnicalSupportLink,
  PLATFORM_INFO,
} from "@/lib/constants";
import { useApp } from "@/context/AppContext";

export default function TechnicalSupportPage() {
  const { language, dir, playFx } = useApp();
  const isEn = language === "en";
  const ArrowIcon = dir === "rtl" ? ArrowLeft : ArrowRight;

  const [formPage, setFormPage] = useState("الصفحة الرئيسية أو التمارين");
  const [formDevice, setFormDevice] = useState("كمبيوتر / حاسوب مكتبي");
  const [formDescription, setFormDescription] = useState("");

  const directWhatsAppLink = getTechnicalSupportLink();

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    playFx("click");
    const customMessage = `مرحباً فريق الدعم الفني لمنصة العقل الخارق (SUPER MIND)،
أود الإبلاغ عن مشكلة فنية:
• الصفحة: ${formPage}
• نوع الجهاز المتصفح: ${formDevice}
• وصف المشكلة بالتفصيل: ${formDescription || "يرجى الاطلاع"}`;

    const url = `https://wa.me/${PLATFORM_INFO.whatsappRaw}?text=${encodeURIComponent(customMessage)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12">
      {/* Header Banner */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white p-8 sm:p-12 lg:p-14 border border-indigo-800/40 shadow-2xl">
        <div className="absolute -top-16 -right-16 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/20 border border-brand-400/30 text-brand-300 text-xs sm:text-sm font-bold">
            <HelpCircle className="w-4 h-4 text-brand-400" />
            <span>{isEn ? TECHNICAL_SUPPORT_CONTENT.enTitle : TECHNICAL_SUPPORT_CONTENT.title}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
            {isEn ? TECHNICAL_SUPPORT_CONTENT.enHeadline : TECHNICAL_SUPPORT_CONTENT.headline}
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            {isEn ? TECHNICAL_SUPPORT_CONTENT.enDescription : TECHNICAL_SUPPORT_CONTENT.description}
          </p>

          {/* Quick Action Contacts */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <a
              href={directWhatsAppLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => playFx("click")}
              className="px-6 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <MessageCircle className="w-5 h-5" />
              <span>{isEn ? "WhatsApp Support (+9647806086016)" : "الدعم المباشر عبر واتساب"}</span>
            </a>

            <a
              href={`mailto:${TECHNICAL_SUPPORT_CONTENT.email}?subject=${encodeURIComponent("طلب دعم فني - منصة العقل الخارق")}`}
              className="px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 transition-colors flex items-center gap-2 font-mono"
            >
              <Mail className="w-4 h-4 text-brand-400" />
              <span>{TECHNICAL_SUPPORT_CONTENT.email}</span>
            </a>
          </div>
        </div>
      </section>

      {/* Critical Privacy / Security Warning */}
      <section className="bg-amber-50 dark:bg-amber-950/40 rounded-3xl p-6 sm:p-7 border-2 border-amber-400/60 flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base sm:text-lg font-black text-amber-950 dark:text-amber-200">
            {isEn ? "Important Security & Privacy Notice" : "تنبيه أمني وخصوصية هام جداً"}
          </h3>
          <p className="text-xs sm:text-sm text-amber-900 dark:text-amber-300 leading-relaxed font-medium">
            {isEn ? TECHNICAL_SUPPORT_CONTENT.enPrivacyWarning : TECHNICAL_SUPPORT_CONTENT.privacyWarning}
          </p>
        </div>
      </section>

      {/* Two Column Layout: Support Form & Quick Diagnostic Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Support Ticket / WhatsApp Builder (7 Cols) */}
        <section className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-card space-y-6">
          <div className="space-y-1">
            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              {isEn ? "Submit a Technical Issue Report" : "تجهيز تقرير البلاغ الفني"}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {isEn
                ? "Fill in these details to generate a formatted WhatsApp message to our tech support team."
                : "املأ البيانات أدناه لإرسال رسالة مفصلة مباشرة لفريق الدعم الفني عبر واتساب."}
            </p>
          </div>

          <form onSubmit={handleCustomSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {isEn ? "Page or Exercise Where Issue Occurred:" : "الصفحة أو التمرين الذي حدثت فيه المشكلة:"}
              </label>
              <select
                value={formPage}
                onChange={(e) => setFormPage(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="العداد التفاعلي (السوروبان)">العداد التفاعلي (السوروبان)</option>
                <option value="مدرب الفلاش أنزان (Flash Anzan)">مدرب الفلاش أنزان (Flash Anzan)</option>
                <option value="حلبة تحدي الفرق (Teams Battle)">حلبة تحدي الفرق (Teams Battle)</option>
                <option value="الضرب والقسمة على السوروبان">الضرب والقسمة على السوروبان</option>
                <option value="قسم أسئلة الذكاء والتفكير المنطقي">قسم أسئلة الذكاء والتفكير المنطقي</option>
                <option value="لوحة تحكم الطالب أو حفظ التقدم">لوحة تحكم الطالب أو حفظ التقدم</option>
                <option value="لوحة تحكم المدرب والمجموعات">لوحة تحكم المدرب والمجموعات</option>
                <option value="أخرى / مشكلة في العرض والتصميم">أخرى / مشكلة في العرض والتصميم</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {isEn ? "Device & Browser Type:" : "نوع الجهاز والمتصفح المستخدم:"}
              </label>
              <select
                value={formDevice}
                onChange={(e) => setFormDevice(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="جهاز كمبيوتر / حاسوب مكتبي (Chrome / Edge / Firefox)">جهاز كمبيوتر / حاسوب مكتبي (Chrome / Edge / Firefox)</option>
                <option value="جهاز آيباد أو تابلت (iPad / Android Tablet)">جهاز آيباد أو تابلت (iPad / Android Tablet)</option>
                <option value="هاتف آيفون (Safari / Chrome)">هاتف آيفون (Safari / Chrome)</option>
                <option value="هاتف أندرويد (Samsung / Xiaomi / Huawei)">هاتف أندرويد (Samsung / Xiaomi / Huawei)</option>
                <option value="شاشة عرض ذكية في صف مدرسي">شاشة عرض ذكية في صف مدرسي</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {isEn ? "Describe the issue clearly:" : "اشرح المشكلة وما حدث بالتفصيل:"}
              </label>
              <textarea
                rows={4}
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder={
                  isEn
                    ? "e.g., Bead was not moving, flash voice didn't play, score was not counted..."
                    : "مثال: الصوت لم يشتغل في الفلاش أنزان، خرزة الآحاد علقت، المسألة لم تحسب نتيجتها..."
                }
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300">
              <Camera className="w-4 h-4 text-brand-600 shrink-0" />
              <span>
                {isEn
                  ? "Tip: Sending a screenshot or short video after opening WhatsApp helps solve bugs within minutes!"
                  : "نصيحة: إرفاق صورة للشاشة أو تسجيل فيديو قصير بعد فتح المحادثة يساعدنا على حل المشكلة فوراً!"}
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>{isEn ? "Send Report via WhatsApp" : "إرسال البلاغ الفني عبر واتساب"}</span>
            </button>
          </form>
        </section>

        {/* Quick Diagnostic Troubleshooting (5 Cols) */}
        <section className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-card space-y-4">
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-brand-600" />
              <span>{isEn ? "Quick Troubleshooting Checklist" : "خطوات حل سريعة قبل الإبلاغ"}</span>
            </h3>

            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                  <RefreshCw className="w-3.5 h-3.5 text-brand-600" />
                  <span>1. تحديث الصفحة (Refresh / Ctrl+F5)</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  كثير من مشاكل المتصفح تُحل مباشرة بإعادة تحميل الصفحة لتفريغ الذاكرة المؤقتة.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                  <Volume2 className="w-3.5 h-3.5 text-amber-500" />
                  <span>2. تفعيل الصوت وأذونات المتصفح</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  المتصفحات الحديثة تشترط نقرة واحدة على الشاشة قبل السماح بتشغيل نطق الأرقام والمؤثرات.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                  <Wifi className="w-3.5 h-3.5 text-emerald-500" />
                  <span>3. فحص اتصال الإنترنت</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  تأكد من استقرار شبكة الواي فاي أو بيانات الهاتف لضمان حفظ نتائج التمارين في لوحتك.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                  <Laptop className="w-3.5 h-3.5 text-indigo-500" />
                  <span>4. التوافق مع شاشات اللمس</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  المنصة تدعم اللمس المتعدد على الآيباد والهواتف والماوس على الحواسيب بسلاسة كاملة.
                </p>
              </div>
            </div>
          </div>

          {/* Direct Support Card */}
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-6 rounded-3xl border border-indigo-800/40 space-y-4">
            <h4 className="font-bold text-sm text-amber-300">
              {isEn ? "Need direct assistance?" : "هل تحتاج مساعدة عاجلة؟"}
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              فريق الدعم متاح يومياً لمساعدة المدربين، المدارس، وأولياء الأمور في تشغيل التمارين وقاعات الفلاش.
            </p>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex items-center gap-2 text-emerald-400">
                <Phone className="w-4 h-4" />
                <span>{PLATFORM_INFO.whatsappNumber}</span>
              </div>
              <div className="flex items-center gap-2 text-brand-300">
                <Mail className="w-4 h-4" />
                <span>{PLATFORM_INFO.supportEmail}</span>
              </div>
            </div>
            <div className="pt-2">
              <Link
                href="/dashboard"
                className="text-xs text-amber-300 hover:underline inline-flex items-center gap-1 font-bold"
              >
                <span>العودة للوحة التدريب</span>
                <ArrowIcon className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
