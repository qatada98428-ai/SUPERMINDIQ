"use client";

import React, { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { getWhatsAppLink, PLATFORM_INFO } from "@/lib/constants";

export default function WhatsAppFloating() {
  const [isOpen, setIsOpen] = useState(false);

  const directLink = getWhatsAppLink(
    "مرحباً إدارة العقل الخارق SUPER MIND، أود الاستفسار عن تفاصيل الاشتراكات والبرامج التدريبية المتاحة."
  );

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col items-start gap-3">
      {isOpen && (
        <div className="w-80 p-4 bg-white rounded-2xl shadow-2xl border border-slate-200 text-slate-800 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold shadow-sm">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">إدارة العقل الخارق</h4>
                <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  متصل الآن عبر واتساب
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="إغلاق نافذة المحادثة"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-600 my-3 leading-relaxed">
            أهلاً بك! يمكنك التواصل المباشر مع إدارة المنصة للاستفسار عن اشتراكات الطلاب، تدريب المدربين، أو اعتماد المراكز:
          </p>

          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 mb-3 text-xs text-slate-700">
            <span className="font-semibold text-brand-700 block mb-1">الرقم المعتمد:</span>
            <span dir="ltr" className="font-mono text-slate-900 font-bold block text-sm">
              {PLATFORM_INFO.whatsappNumber}
            </span>
          </div>

          <a
            href={directLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-4 rounded-xl text-sm transition-all shadow-md hover:shadow-emerald-200 active:scale-95"
          >
            <MessageCircle className="w-4 h-4" />
            <span>محادثة مباشرة الآن</span>
          </a>
        </div>
      )}

      {/* Trigger floating button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center gap-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 focus:outline-none focus:ring-4 focus:ring-emerald-200"
        aria-label="تواصل مع الإدارة عبر واتساب"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-200 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
        </span>
        <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
        <span className="text-sm font-medium hidden sm:inline">تواصل عبر واتساب</span>
      </button>
    </div>
  );
}
