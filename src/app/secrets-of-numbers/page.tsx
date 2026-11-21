"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Zap,
  Brain,
  ArrowRight,
  ChevronLeft,
  Lightbulb,
  GraduationCap,
} from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function SecretsOfNumbersPage() {
  const { playFx } = useApp();

  // Interactive Trick 1: Multiply by 11
  const [numFor11, setNumFor11] = useState<number>(34);
  const calc11 = numFor11 * 11;
  const digits11 = String(numFor11).split("").map(Number);
  const midDigit = digits11.length === 2 ? digits11[0] + digits11[1] : 0;

  // Interactive Trick 2: Square numbers ending in 5
  const [baseFor5, setBaseFor5] = useState<number>(35);
  const tensPart = Math.floor(baseFor5 / 10);
  const square5 = baseFor5 * baseFor5;

  return (
    <div className="min-h-screen bg-[#F3F2FC] dark:bg-[#100F24] pb-20 pt-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2">
          <Link
            href="/"
            onClick={() => playFx("pop")}
            className="clay-pill px-3 py-1.5 text-xs font-bold text-brand-700 dark:text-brand-300 flex items-center gap-1"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>الرئيسية</span>
          </Link>
          <span className="text-slate-400">/</span>
          <span className="text-xs font-black text-slate-700 dark:text-slate-300">
            أسرار الأرقام ورياضيات الفيدا
          </span>
        </div>

        {/* Hero Header */}
        <div className="clay-card !p-6 sm:!p-10 bg-gradient-to-r from-white via-[#F8F5FF] to-[#EFF6FF] dark:from-[#1D1A3E] dark:via-[#191637] dark:to-[#172554] border-2 border-brand-500/30 rounded-3xl shadow-xl text-center sm:text-start relative overflow-hidden">
          <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-brand-500/10 blur-3xl pointer-events-none" />
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-900 dark:text-amber-200 text-xs font-black">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>خاص لطلاب المرحلة المتوسطة والإعدادية والثانوية 🚀</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-[#261E58] dark:text-white leading-tight">
                أسرار الأرقام • رياضيات الفيدا (Vedic Math)
              </h1>
              <p className="text-xs sm:text-base text-[#565082] dark:text-[#C7C2E8] leading-relaxed">
                اكتشف القواعد الذهنية الخارقة لحل العمليات الرياضية المعقدة بلمح البصر وبدون آلة حاسبة! مهارات متقدمة ترفع ثقتك وسرعتك في الامتحانات المدرسية والوزارية.
              </p>
            </div>

            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-br from-brand-600 via-indigo-600 to-amber-500 text-white flex items-center justify-center shadow-2xl shrink-0 border-4 border-white/50">
              <Brain className="w-12 h-12 sm:w-16 sm:h-16 text-amber-300 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Interactive Vedic Math Secrets Showcases */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Secret 1: Multiply by 11 */}
          <div className="clay-card !p-5 sm:!p-6 bg-white dark:bg-[#1E1B3E] border border-brand-200 dark:border-brand-800 rounded-3xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-300 flex items-center justify-center font-black">
                  1
                </div>
                <div>
                  <h3 className="text-base font-black text-[#261E58] dark:text-white">
                    سر الضرب في 11 بثانية واحدة!
                  </h3>
                  <span className="text-xs text-slate-500 dark:text-slate-400">قاعدة جمع الطرفين ووضع الناتج بالوسط</span>
                </div>
              </div>
              <Zap className="w-5 h-5 text-amber-500" />
            </div>

            <div className="p-4 rounded-2xl bg-[#F8F6FE] dark:bg-[#25214D] border border-brand-100 dark:border-brand-900/40 text-center space-y-3">
              <div className="flex items-center justify-center gap-3 text-xl sm:text-2xl font-black font-mono text-brand-700 dark:text-brand-300">
                <span>{numFor11}</span>
                <span>×</span>
                <span>11</span>
                <span>=</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-extrabold text-2xl sm:text-3xl">
                  {calc11}
                </span>
              </div>

              <div className="text-xs text-[#5E5789] dark:text-[#C5BFEE] leading-relaxed">
                💡 <strong>القاعدة:</strong> نباعد بين الرقمين ({digits11[0]} و {digits11[1]}) ونضع حاصل جمعهما بينهما:{" "}
                <span className="font-bold text-amber-600 dark:text-amber-300 font-mono">
                  {digits11[0]} + {digits11[1]} = {midDigit}
                </span>
              </div>

              {/* Slider / Controls */}
              <div className="pt-2 flex items-center justify-center gap-2">
                {[23, 34, 45, 52, 63].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => {
                      playFx("pop");
                      setNumFor11(val);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                      numFor11 === val
                        ? "clay-btn-purple text-white"
                        : "clay-pill text-slate-700 dark:text-slate-200"
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Secret 2: Square numbers ending in 5 */}
          <div className="clay-card !p-5 sm:!p-6 bg-white dark:bg-[#1E1B3E] border border-brand-200 dark:border-brand-800 rounded-3xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300 flex items-center justify-center font-black">
                  2
                </div>
                <div>
                  <h3 className="text-base font-black text-[#261E58] dark:text-white">
                    تربيع أي عدد ينتهي بـ 5 فورياً!
                  </h3>
                  <span className="text-xs text-slate-500 dark:text-slate-400">مثال: 25²، 35²، 65²، 85²...</span>
                </div>
              </div>
              <Lightbulb className="w-5 h-5 text-emerald-500" />
            </div>

            <div className="p-4 rounded-2xl bg-[#F8F6FE] dark:bg-[#25214D] border border-brand-100 dark:border-brand-900/40 text-center space-y-3">
              <div className="flex items-center justify-center gap-3 text-xl sm:text-2xl font-black font-mono text-brand-700 dark:text-brand-300">
                <span>{baseFor5}²</span>
                <span>=</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-extrabold text-2xl sm:text-3xl">
                  {square5}
                </span>
              </div>

              <div className="text-xs text-[#5E5789] dark:text-[#C5BFEE] leading-relaxed">
                💡 <strong>القاعدة:</strong> نضرب رقم العشرات ({tensPart}) في الرقم الذي يليه ({tensPart + 1}) ={" "}
                <span className="font-bold text-amber-600 dark:text-amber-300 font-mono">
                  {tensPart * (tensPart + 1)}
                </span>
                ، ثم نلصق 25 في النهاية!
              </div>

              {/* Quick Select Buttons */}
              <div className="pt-2 flex items-center justify-center gap-2">
                {[15, 25, 35, 65, 85].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => {
                      playFx("pop");
                      setBaseFor5(val);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                      baseFor5 === val
                        ? "clay-btn-purple text-white"
                        : "clay-pill text-slate-700 dark:text-slate-200"
                    }`}
                  >
                    {val}²
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Curriculum Pillars for Intermediate and Secondary */}
        <div className="clay-card !p-6 sm:!p-8 bg-white dark:bg-[#1E1B3E] border border-brand-200 dark:border-brand-800 rounded-3xl space-y-5">
          <div className="flex items-center gap-3">
            <GraduationCap className="w-7 h-7 text-brand-600 dark:text-brand-400" />
            <div>
              <h2 className="text-lg sm:text-xl font-black text-[#261E58] dark:text-white">
                خريطة مهارات الرياضيات المتقدمة
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                مناهج وتمارين قادمة تدعم الطلاب في المراحل الدراسية والامتحانات
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="clay-card-sm p-4 bg-[#F8F6FE] dark:bg-[#25214D] rounded-2xl space-y-2">
              <span className="text-2xl">⚡</span>
              <h4 className="text-sm font-black text-[#261E58] dark:text-white">ضرب الأعداد الكبيرة</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                طريقة التباديل الرأسية والمتقاطعة (Urdhva Tiryagbhyam) لضرب أي رقمين أو ثلاثة في سطر واحد.
              </p>
            </div>

            <div className="clay-card-sm p-4 bg-[#F8F6FE] dark:bg-[#25214D] rounded-2xl space-y-2">
              <span className="text-2xl">🎯</span>
              <h4 className="text-sm font-black text-[#261E58] dark:text-white">الجذور التربيعية والتكعيبية</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                استخراج الجذور بمجرد النظر إلى الرقم الأخير وقيمة الآلاف في أقل من ثانيتين.
              </p>
            </div>

            <div className="clay-card-sm p-4 bg-[#F8F6FE] dark:bg-[#25214D] rounded-2xl space-y-2">
              <span className="text-2xl">📐</span>
              <h4 className="text-sm font-black text-[#261E58] dark:text-white">سرعة الجبر والنسبة المئوية</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                حساب النسب المئوية، حل المعادلات السريعة، وتطبيقات الهندسة الذهنية للاختبارات.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              جميع التمارين يتم إعدادها بإشراف مباشر من <strong>الأستاذ قتادة كريم</strong> وخبراء الرياضيات الذهنية.
            </p>
            <Link
              href="/mental-arithmetic"
              onClick={() => playFx("pop")}
              className="clay-btn-purple px-6 py-2.5 rounded-xl font-black text-xs flex items-center gap-1.5"
            >
              <span>استكشف برامج الحساب الذهني</span>
              <ChevronLeft className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
