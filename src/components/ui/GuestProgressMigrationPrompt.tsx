"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useApp } from "@/context/AppContext";
import { Sparkles, ArrowRight, ArrowLeft, CheckCircle2, X, Loader2 } from "lucide-react";

export default function GuestProgressMigrationPrompt() {
  const { isGuest, hasUnmigratedGuestData, guestProgress, migrateGuestDataNow } = useAuth();
  const { language, dir, playFx } = useApp();
  const isEn = language === "en";
  const ArrowIcon = dir === "rtl" ? ArrowLeft : ArrowRight;

  const [isMigrating, setIsMigrating] = useState(false);
  const [migratedCount, setMigratedCount] = useState<number | null>(null);
  const [dismissed, setDismissed] = useState(false);

  if (isGuest || !hasUnmigratedGuestData || dismissed) {
    return null;
  }

  const handleMigrate = async () => {
    setIsMigrating(true);
    playFx("click");
    const res = await migrateGuestDataNow();
    setIsMigrating(false);

    if (res.success) {
      setMigratedCount(res.migratedAnswers);
      playFx("fanfare");
      setTimeout(() => {
        setDismissed(true);
      }, 3500);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 text-white p-4 sm:p-5 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-emerald-400/40 animate-fade-in">
        <div className="flex items-start sm:items-center gap-3">
          <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-md text-amber-300 shrink-0">
            <Sparkles className="w-5 h-5 fill-amber-300" />
          </div>
          <div>
            <div className="text-xs sm:text-sm font-black text-white">
              {isEn ? "Sync Local Guest Progress to Your Account" : "نقل إنجازاتك التجريبية المحفوظة إلى حسابك!"}
            </div>
            <p className="text-[11px] sm:text-xs text-emerald-100 mt-0.5">
              {isEn
                ? `You have ${guestProgress.totalAnswers} exercises solved on this device. Would you like to merge them with your cloud account?`
                : `لديك ${guestProgress.totalAnswers} تمرين وإجابة منجزة على هذا الجهاز أثناء التدريب المجاني. هل ترغب بدمجها رسمياً مع حسابك السحابي؟`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          {migratedCount !== null ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-emerald-800 font-bold text-xs shadow-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{isEn ? "Merged Successfully!" : "تم الدمج بنجاح!"}</span>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={handleMigrate}
                disabled={isMigrating}
                className="px-4 py-2 rounded-xl bg-white hover:bg-emerald-50 text-emerald-950 font-black text-xs shadow-sm transition-transform active:scale-95 flex items-center gap-1.5 disabled:opacity-70"
              >
                {isMigrating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{isEn ? "Merging..." : "جاري الدمج..."}</span>
                  </>
                ) : (
                  <>
                    <span>{isEn ? "Merge Progress Now" : "دمج الإنجازات الآن"}</span>
                    <ArrowIcon className="w-3.5 h-3.5 text-emerald-700" />
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setDismissed(true)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs transition-colors"
                title={isEn ? "Dismiss" : "تجاهل"}
              >
                <X className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
