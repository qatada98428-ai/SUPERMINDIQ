"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle, X } from "lucide-react";
import { getWhatsAppLink, PLATFORM_INFO } from "@/lib/constants";

export default function WhatsAppFloating() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Hide floating button on training simulators, games, and dashboards to prevent bottom clutter
  const hiddenPrefixes = [
    "/mental-arithmetic/",
    "/intelligence/quiz",
    "/learn",
    "/dashboard",
    "/trainer",
    "/admin",
    "/login",
    "/register",
  ];
  if (hiddenPrefixes.some((prefix) => pathname.startsWith(prefix))) {
    return null;
  }

  const directLink = getWhatsAppLink(
    "مرحباً إدارة العقل الخارق SUPER MIND، أود الاستفسار عن تفاصيل الاشتراكات والبرامج التدريبية المتاحة."
  );

  return (
    <div className="fixed bottom-5 left-5 z-40 flex flex-col items-start gap-2.5">
      {isOpen && (
        <div className="clay-card w-[calc(100vw-2.5rem)] max-w-72 p-4 text-[#1E1B3A] dark:text-[#F5F4FD] animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold shadow-xs">
                <MessageCircle className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-white">إدارة العقل الخارق</h4>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                  متصل عبر واتساب
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="إغلاق نافذة المحادثة"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 my-2.5 leading-relaxed">
            للاستفسار عن اشتراكات الطلاب، تدريب المدربين، أو اعتماد المراكز:
          </p>

          <a
            href={directLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all shadow-sm active:scale-95"
          >
            <MessageCircle className="w-4 h-4" />
            <span dir="ltr">{PLATFORM_INFO.whatsappNumber}</span>
          </a>
        </div>
      )}

      {/* Compact clean trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-3.5 rounded-full shadow-md hover:shadow-lg transition-all duration-200 active:scale-95"
        aria-label="تواصل مع الإدارة عبر واتساب"
      >
        <MessageCircle className="w-5 h-5" />
        <span className="text-xs hidden sm:inline">واتساب الإدارة</span>
      </button>
    </div>
  );
}
