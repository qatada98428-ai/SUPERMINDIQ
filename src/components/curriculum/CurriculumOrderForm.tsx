"use client";

import React, { useState } from "react";
import { MessageCircle } from "lucide-react";
import { PLATFORM_INFO } from "@/lib/constants";

export default function CurriculumOrderForm() {
  const [studentName, setStudentName] = useState("");
  const [age, setAge] = useState("");
  const [grade, setGrade] = useState("");
  const [city, setCity] = useState("");
  const [trainedBefore, setTrainedBefore] = useState<"no" | "yes">("no");
  const [levelsDone, setLevelsDone] = useState("");

  const handleSendWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();

    const trainedText =
      trainedBefore === "yes"
        ? `نعم (المستويات المنجزة: ${levelsDone.trim() || "غير محدد"})`
        : "لا (مبتدئ جديد)";

    const msg = `مرحباً أستاذ قتادة كريم، أود طلب منهج وحقيبة برنامج العقل الخارق (SUPER MIND) لطفلي.

📋 بيانات الطلب:
• اسم الطالب: ${studentName.trim() || "لم يُحدد"}
• العمر: ${age.trim() || "لم يُحدد"}
• الصف الدراسي: ${grade.trim() || "لم يُحدد"}
• العنوان / المحافظة: ${city.trim() || "لم يُحدد"}
• هل تدرب سابقاً على الحساب الذهني؟: ${trainedText}

أرجو تزويدي بتفاصيل المستوى المناسب وطريقة التوصيل. شكراً جزيلاً!`;

    const url = `https://wa.me/${PLATFORM_INFO.whatsappRaw}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xl space-y-6 text-right">
      <div className="space-y-2 border-b border-slate-100 pb-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
          <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
          <span>طلب مباشر عبر واتساب (+9647806086016)</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-black text-slate-900">
          نموذج طلب المنهج والحقيبة التدريبية
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
          املأ بيانات طفلك أدناه وسيتم تحويلك مباشرة إلى محادثة واتساب مع الأستاذ قتادة كريم لتحديد المستوى الأنسب وتجهيز الحقيبة.
        </p>
      </div>

      <form onSubmit={handleSendWhatsApp} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Student Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              اسم الطالب / الطالبة <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="مثال: أحمد علي"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          {/* Age */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              العمر (بالسنوات) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min="4"
              max="18"
              required
              placeholder="مثال: 8 سنوات"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          {/* School Grade */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              الصف الدراسي <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="مثال: الثالث الابتدائي"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          {/* Address / City */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              العنوان / المحافظة والمدينة <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="مثال: الأنبار - الرمادي / أو محافظتك"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>
        </div>

        {/* Previous Training Radio */}
        <div className="space-y-2 pt-2">
          <label className="text-xs font-bold text-slate-700 block">
            هل تدرب الطالب سابقاً على الحساب الذهني أو العداد؟ <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setTrainedBefore("no")}
              className={`p-3 rounded-xl border text-xs font-bold transition-all text-center ${
                trainedBefore === "no"
                  ? "border-brand-600 bg-brand-50 text-brand-700 shadow-xs"
                  : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              لم يتدرب سابقاً (مبتدئ جديد)
            </button>
            <button
              type="button"
              onClick={() => setTrainedBefore("yes")}
              className={`p-3 rounded-xl border text-xs font-bold transition-all text-center ${
                trainedBefore === "yes"
                  ? "border-brand-600 bg-brand-50 text-brand-700 shadow-xs"
                  : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              نعم، تدرب سابقاً
            </button>
          </div>
        </div>

        {/* If Trained Before, what levels */}
        {trainedBefore === "yes" && (
          <div className="space-y-1.5 animate-in fade-in duration-200">
            <label className="text-xs font-bold text-slate-700 block">
              ما هي المستويات التي أنجزها وما هو البرنامج السابق؟
            </label>
            <input
              type="text"
              placeholder="مثال: أصدقاء 5 وأصدقاء 10 / المستوى الثاني"
              value={levelsDone}
              onChange={(e) => setLevelsDone(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-3 flex flex-col sm:flex-row items-center gap-3">
          <button
            type="submit"
            className="w-full sm:flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm sm:text-base shadow-lg shadow-emerald-500/25 transition-all hover:scale-102 active:scale-98 flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-5 h-5 text-amber-300" />
            <span>إرسال طلب المنهج عبر واتساب 📲</span>
          </button>

          <a
            href={`https://wa.me/${PLATFORM_INFO.whatsappRaw}?text=${encodeURIComponent(
              "مرحباً أستاذ قتادة كريم، أود طلب منهج وحقيبة برنامج العقل الخارق (SUPER MIND) والاستفسار عن تفاصيل التوصيل."
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto py-3.5 px-5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <span>طلب سريع مباشر</span>
          </a>
        </div>

        <p className="text-[11px] text-slate-400 text-center pt-1">
          🔒 يتم التواصل المباشر مع الأستاذ قتادة كريم لمتابعة الطلب والشحن لجميع المحافظات.
        </p>
      </form>
    </div>
  );
}
