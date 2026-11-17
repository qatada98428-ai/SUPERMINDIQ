"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircle, MapPin } from "lucide-react";
import BrandLogo from "@/components/ui/BrandLogo";
import { PLATFORM_INFO, getWhatsAppLink } from "@/lib/constants";
import { useApp } from "@/context/AppContext";

export default function Footer() {
  const { language } = useApp();
  const pathname = usePathname();
  const isEn = language === "en";

  // Hide footer completely on full-screen interactive games
  if (pathname.startsWith("/mental-arithmetic/balloon-pop")) {
    return null;
  }

  // Minimal, distraction-free footer on training simulators & dashboards
  const isSimulatorOrPortal =
    pathname.startsWith("/mental-arithmetic/") ||
    pathname.startsWith("/intelligence/quiz") ||
    pathname.startsWith("/learn") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/trainer") ||
    pathname.startsWith("/admin");

  if (isSimulatorOrPortal) {
    return (
      <footer className="bg-slate-950 text-slate-400 border-t border-slate-800/80 py-4 mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <p>
            © {new Date().getFullYear()} منصة العقل الخارق (SUPER MIND) — إشراف{" "}
            <span className="text-amber-400 font-bold">الأستاذ قتادة كريم</span>
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-center">
            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event("supermind:open-prayer"))}
              className="text-amber-400 hover:text-amber-300 font-bold transition-colors"
            >
              🤲 دعاء المنصة
            </button>
            <Link href="/mental-arithmetic" className="hover:text-white transition-colors">
              أقسام الحساب الذهني
            </Link>
            <Link href="/" className="hover:text-white transition-colors">
              الرئيسية
            </Link>
          </div>
        </div>
      </footer>
    );
  }

  const whatsappHref = getWhatsAppLink(
    "مرحباً إدارة العقل الخارق SUPER MIND، أود الاستفسار عن تفاصيل المنصة وبرامج الحساب الذهني."
  );

  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800 pt-10 pb-8 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-slate-800/80">
          {/* Col 1: Brand & Brief */}
          <div className="space-y-3">
            <BrandLogo size="md" inverted />
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-sm">
              المنصة التعليمية المتخصصة في الحساب الذهني، العداد الياباني (السوروبان)، الفلاش أنزان، ومحاكي البطولات وتنمية القدرات العقلية.
            </p>
          </div>

          {/* Col 2: Quick Links (Clean 2-subcolumn grid) */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm">
              {isEn ? "Quick Links" : "روابط سريعة"}
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm text-slate-400">
              <Link href="/mental-arithmetic" className="hover:text-brand-400 transition-colors">
                الحساب الذهني
              </Link>
              <Link href="/mental-arithmetic/competition" className="hover:text-amber-400 transition-colors text-amber-300 font-bold">
                محاكي المسابقات 🏅
              </Link>
              <Link href="/mental-arithmetic/flash-anzan" className="hover:text-brand-400 transition-colors">
                فلاش أنزان
              </Link>
              <Link href="/mental-arithmetic/teams-battle" className="hover:text-amber-400 transition-colors">
                تحدي الفرق 🏆
              </Link>
              <Link href="/learn" className="hover:text-brand-400 transition-colors">
                شرح المراحل
              </Link>
              <Link href="/trainers" className="hover:text-brand-400 transition-colors">
                الاعتمادات والشركاء
              </Link>
            </div>
          </div>

          {/* Col 3: Direct Contact */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm">
              {isEn ? "Contact Us" : "تواصل معنا"}
            </h4>
            <div className="space-y-2 text-xs sm:text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{PLATFORM_INFO.location}</span>
              </div>
              <div className="pt-1">
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-600/30 transition-colors text-xs font-bold"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>اضغط للتواصل مع إدارة المنصة</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 text-center sm:text-right">
          <p>
            © {new Date().getFullYear()} العقل الخارق (SUPER MIND) — إشراف وتدريب{" "}
            <span className="text-amber-400 font-bold">الأستاذ قتادة كريم</span>
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5">
            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event("supermind:open-prayer"))}
              className="text-amber-400 hover:text-amber-300 font-bold transition-colors"
            >
              🤲 دعاء المنصة
            </button>
            <Link href="/privacy" className="hover:text-slate-200 transition-colors">
              {isEn ? "Privacy" : "سياسة الخصوصية"}
            </Link>
            <Link href="/terms" className="hover:text-slate-200 transition-colors">
              {isEn ? "Terms" : "شروط الاستخدام"}
            </Link>
            <Link href="/support" className="hover:text-slate-200 transition-colors">
              {isEn ? "Support" : "الدعم الفني"}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
