"use client";

import React from "react";
import Link from "next/link";
import { MessageCircle, Phone, Mail, MapPin, ShieldCheck, HeartHandshake } from "lucide-react";
import BrandLogo from "@/components/ui/BrandLogo";
import { PLATFORM_INFO, getWhatsAppLink } from "@/lib/constants";
import { useApp } from "@/context/AppContext";

export default function Footer() {
  const { language } = useApp();
  const isEn = language === "en";

  const whatsappHref = getWhatsAppLink(
    "مرحباً إدارة العقل الخارق SUPER MIND، أود الاستفسار عن تفاصيل المنصة وبرامج الحساب الذهني."
  );

  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800 pt-16 pb-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          {/* Brand & Mission (2 Cols) */}
          <div className="lg:col-span-2 space-y-4">
            <BrandLogo size="lg" inverted />
            <p className="text-slate-400 text-sm leading-relaxed mt-4">
              المنصة التعليمية المتطورة المتخصصة في الحساب الذهني، وتدريب العداد الياباني السوروبان،
              الفلاش أنزان، وتحديات أولمبياد الرياضيات والذكاء. صُممت بأحدث المعايير العلمية لتمكين الطلاب
              والمدربين والمراكز التعليمية في كافة أنحاء الوطن العربي.
            </p>

            {/* Free Education Commitment Box */}
            <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2.5">
              <HeartHandshake className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>
                <strong>التزام دائم:</strong> أدوات التدريب والتمارين ومحاكيات السوروبان مجانية بالكامل لجميع الطلاب والمتعلمين.
              </span>
            </div>

            <div className="pt-2">
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-600/30 transition-colors text-sm font-semibold"
              >
                <MessageCircle className="w-5 h-5" />
                <span dir="ltr">WhatsApp: {PLATFORM_INFO.whatsappNumber}</span>
              </a>
            </div>
          </div>

          {/* Educational Modules */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-base">
              {isEn ? "Learning & Training" : "الأقسام التعليمية"}
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link href="/learn" className="hover:text-brand-400 transition-colors flex items-center gap-1.5 text-amber-300 font-semibold">
                  <span>قسم التعلم (دليل المراحل)</span>
                </Link>
              </li>
              <li>
                <Link href="/mental-arithmetic" className="hover:text-brand-400 transition-colors">
                  نظام الحساب الذهني
                </Link>
              </li>
              <li>
                <Link href="/mental-arithmetic/abacus" className="hover:text-brand-400 transition-colors">
                  العداد التفاعلي (السوروبان)
                </Link>
              </li>
              <li>
                <Link href="/mental-arithmetic/flash-anzan" className="hover:text-brand-400 transition-colors">
                  مدرب الفلاش أنزان التفاعلي
                </Link>
              </li>
              <li>
                <Link href="/mental-arithmetic/multiplication" className="hover:text-amber-400 transition-colors">
                  الضرب والقسمة على السوروبان
                </Link>
              </li>
              <li>
                <Link href="/mental-arithmetic/teams-battle" className="hover:text-amber-400 transition-colors font-bold text-amber-300">
                  حلبة تحدي الفرق 🏆
                </Link>
              </li>
              <li>
                <Link href="/intelligence" className="hover:text-brand-400 transition-colors">
                  {isEn ? "IQ & Logic Challenges (Beta)" : "أسئلة الذكاء والتفكير المنطقي (تجريبي)"}
                </Link>
              </li>
              <li>
                <Link href="/curriculum" className="hover:text-brand-400 transition-colors">
                  سلسلة المناهج والحقائب 📚
                </Link>
              </li>
            </ul>
          </div>

          {/* Directories & Partners */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-base">
              {isEn ? "Accreditations & Partners" : "الاعتمادات والشركاء"}
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link href="/trainers" className="hover:text-brand-400 transition-colors">
                  {isEn ? "Accreditations (Trainers Directory)" : "الاعتمادات (دليل المدربين)"}
                </Link>
              </li>
              <li>
                <Link href="/schools" className="hover:text-brand-400 transition-colors">
                  {isEn ? "Partners (Schools Directory)" : "الشركاء (دليل المدارس والمؤسسات)"}
                </Link>
              </li>
              <li>
                <Link href="/supporters" className="hover:text-rose-400 transition-colors">
                  {isEn ? "Partners in Mind Building" : "شركاء في صناعة العقول"}
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-brand-400 transition-colors">
                  {isEn ? "About Us | Coach Qatadah" : "من نحن | الأستاذ قتادة كريم"}
                </Link>
              </li>
              <li>
                <Link href="/support" className="hover:text-emerald-400 transition-colors">
                  {isEn ? "Technical Support" : "الدعم الفني والإبلاغ"}
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-brand-400 transition-colors">
                  {isEn ? "Sign In" : "تسجيل الدخول للمنصة"}
                </Link>
              </li>
            </ul>
          </div>

          {/* Official Contact Info */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-base">
              {isEn ? "Contact & Details" : "بيانات التواصل المعتمدة"}
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span dir="ltr" className="font-mono">{PLATFORM_INFO.whatsappNumber}</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-brand-400 shrink-0" />
                <span className="font-mono">{PLATFORM_INFO.email}</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{PLATFORM_INFO.location}</span>
              </li>
              <li className="flex items-center gap-2 pt-2 text-xs text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>منصة معتمدة ومجهزة للأجهزة الذكية والشاشات</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>
            © {new Date().getFullYear()} العقل الخارق (SUPER MIND) — إشراف وتدريب{" "}
            <span className="text-amber-400 font-bold">الأستاذ قتادة كريم</span> (ماجستير رياضيات ومدرب دولي معتمد).
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-slate-200 transition-colors">
              {isEn ? "Privacy Policy" : "سياسة الخصوصية"}
            </Link>
            <Link href="/terms" className="hover:text-slate-200 transition-colors">
              {isEn ? "Terms of Use" : "شروط الاستخدام"}
            </Link>
            <Link href="/support" className="hover:text-slate-200 transition-colors">
              {isEn ? "Help & Support" : "الدعم الفني والشكاوى"}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
