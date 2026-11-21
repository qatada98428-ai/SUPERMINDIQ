"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Volume2,
  VolumeX,
  Play,
  Sliders,
  Zap,
  Sparkles,
  Info,
  Mic,
  Clock,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import {
  discoverRealVoices,
  FlashTimingMode,
  SpeechLanguageMode,
  SpeechPreferences,
  isCloudVoiceUri,
  CLOUD_VOICE_FEMALE_URI,
  CLOUD_VOICE_MALE_URI,
} from "@/lib/speech-engine";
import {
  getRawBrowserVoices,
  speakTestSample,
  warmupSpeechEngine,
} from "@/lib/soroban-engine";

interface VoiceSettingsPanelProps {
  prefs: SpeechPreferences;
  onChangePrefs: (next: SpeechPreferences) => void;
  clearDelayMs?: number;
  onChangeClearDelayMs?: (ms: number) => void;
  showFlashTimingModes?: boolean;
}

export default function VoiceSettingsPanel({
  prefs,
  onChangePrefs,
  clearDelayMs,
  onChangeClearDelayMs,
  showFlashTimingModes = true,
}: VoiceSettingsPanelProps) {
  const {
    language,
    soundEnabled: globalSoundEnabled,
    flashSoundEnabled,
    flashSoundVolume,
    toggleFlashSound,
    setFlashSoundVolume,
    playFx,
  } = useApp();
  const isEn = language === "en";

  const [rawVoices, setRawVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [testingNote, setTestingNote] = useState<string | null>(null);

  const refreshVoices = useCallback(() => {
    setRawVoices(getRawBrowserVoices());
  }, []);

  useEffect(() => {
    refreshVoices();
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const synth = window.speechSynthesis;
    const handler = () => refreshVoices();
    synth.addEventListener?.("voiceschanged", handler);
    const poll = setTimeout(refreshVoices, 350);
    return () => {
      clearTimeout(poll);
      synth.removeEventListener?.("voiceschanged", handler);
    };
  }, [refreshVoices]);

  const activeSpeechLang: "arabic" | "english" =
    prefs.voiceMode === "english" ? "english" : "arabic";

  const catalog = useMemo(
    () => discoverRealVoices(rawVoices, activeSpeechLang),
    [rawVoices, activeSpeechLang]
  );

  const selectedVoiceUri =
    activeSpeechLang === "arabic" ? prefs.voiceUriAr : prefs.voiceUriEn;

  const updateField = <K extends keyof SpeechPreferences>(
    key: K,
    val: SpeechPreferences[K]
  ) => {
    onChangePrefs({ ...prefs, [key]: val });
  };

  const handleTestVoice = () => {
    if (!globalSoundEnabled) {
      setTestingNote(
        isEn
          ? "Global platform sound is muted from the top bar."
          : "الصوت العام للمنصة مكتوم حاليًا من الشريط العلوي."
      );
      return;
    }
    if (prefs.voiceMode === "off") {
      setTestingNote(
        isEn
          ? "Select Arabic or English first to test voice narration."
          : "اختر العربية أو الإنجليزية أولًا لتجربة النطق الصوتي."
      );
      return;
    }

    warmupSpeechEngine();
    const ok = speakTestSample(activeSpeechLang, prefs);
    const isCloud = !catalog.hasLocalVoice || isCloudVoiceUri(selectedVoiceUri);
    setTestingNote(
      ok
        ? isEn
          ? `Playing sample (${isCloud ? "Cloud Studio Voice" : "Device Local Voice"}): "Twenty-five, Minus seven, Fourteen point five"`
          : `يتم نطق العينة عبر (${isCloud ? "النطق السحابي الذكي الفوري" : "الصوت المحلي لجهازك"}): «خمسة وعشرون، ناقص سبعة، أربعة عشر فاصلة خمسة»`
        : isEn
        ? "Speech synthesis is unavailable on this browser."
        : "محرّك النطق الصوتي غير متاح في هذا المتصفح."
    );
  };

  const beepVolPct = Math.round(flashSoundVolume * 100);

  return (
    <div className="clay-card-sm bg-[#F8F7FE] dark:bg-[#1E1B3E] border border-[#E5E2F8] dark:border-[#343063] p-4 sm:p-5 space-y-4">
      {/* Header + Test Voice Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-sm shrink-0">
            <Mic className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black text-[#1E1B3A] dark:text-white">
              {isEn ? "Voice & Flash Audio Studio" : "إعدادات النطق الصوتي وأصوات الفلاش"}
            </h3>
            <p className="text-[11px] font-semibold text-[#5E5985] dark:text-[#B8B3DC]">
              {isEn
                ? "Full-number Arabic & English narration with instant Flash cue"
                : "قراءة الأعداد كاملة بالعربية والإنجليزية مع صوت التنبيه المتزامن"}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleTestVoice}
          className="clay-btn-purple px-4 py-2 text-xs font-black flex items-center justify-center gap-1.5 shrink-0"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>{isEn ? "Test Voice" : "تجربة الصوت"}</span>
        </button>
      </div>

      {!globalSoundEnabled && (
        <div className="px-3.5 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-200 text-xs font-bold flex items-center gap-2">
          <VolumeX className="w-4 h-4 shrink-0" />
          <span>
            {isEn
              ? "Platform master audio is muted from the header bar; all speech and chimes are muted."
              : "تم تفعيل كتم الصوت العام من الشريط العلوي؛ تحترم الإعدادات هذا الكتم تلقائيًا."}
          </span>
        </div>
      )}

      {testingNote && (
        <div className="px-3.5 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 text-indigo-800 dark:text-indigo-200 text-xs font-bold flex items-center gap-2">
          <Volume2 className="w-4 h-4 shrink-0" />
          <span>{testingNote}</span>
        </div>
      )}

      {/* Language Selector (Arabic / English / Off — no digit-by-digit option) */}
      <div className="space-y-2">
        <label className="text-xs font-extrabold text-[#3F3A66] dark:text-[#DAD6F7] block">
          {isEn ? "Speech Language" : "لغة نطق الأعداد الكاملة"}
        </label>
        <div className="grid grid-cols-3 gap-2 bg-white dark:bg-[#14122B] p-1.5 rounded-2xl border border-[#E6E2FA] dark:border-[#2E2B57]">
          {(
            [
              { id: "arabic", label: "العربية (كاملة)" },
              { id: "english", label: "English (Full)" },
              { id: "off", label: isEn ? "No Speech" : "بدون نطق" },
            ] as { id: SpeechLanguageMode; label: string }[]
          ).map((item) => {
            const active = prefs.voiceMode === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  playFx("toggle");
                  setTestingNote(null);
                  updateField("voiceMode", item.id);
                }}
                className={`py-2 px-2.5 rounded-xl text-xs font-extrabold transition-all ${
                  active
                    ? "clay-btn-purple !rounded-xl"
                    : "text-[#5E5985] dark:text-[#BEB9E2] hover:bg-[#F3F1FC] dark:hover:bg-[#232046]"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Real Device Voices Selector + Speech Sliders */}
      {prefs.voiceMode !== "off" && (
        <div className="space-y-4 pt-1">
          {/* Real Supported Voices Dropdown */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <label
                htmlFor="real-voice-select"
                className="text-xs font-extrabold text-[#3F3A66] dark:text-[#DAD6F7]"
              >
                {isEn
                  ? `Supported ${activeSpeechLang === "arabic" ? "Arabic" : "English"} Voices`
                  : `الأصوات المدعومة (${activeSpeechLang === "arabic" ? "العربية" : "الإنجليزية"})`}
              </label>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white dark:bg-[#242146] border border-[#E4DFF9] dark:border-[#363268] text-brand-700 dark:text-brand-300">
                {catalog.hasLocalVoice
                  ? isEn
                    ? `${catalog.male.length + catalog.female.length + catalog.other.length} local + Cloud active`
                    : `${catalog.male.length + catalog.female.length + catalog.other.length} صوت محلي + سحابي`
                  : isEn
                  ? "Cloud Studio Active ☁️"
                  : "النطق السحابي مفعّل ☁️"}
              </span>
            </div>

            <select
              id="real-voice-select"
              value={selectedVoiceUri}
              onChange={(e) => {
                playFx("click");
                updateField(
                  activeSpeechLang === "arabic" ? "voiceUriAr" : "voiceUriEn",
                  e.target.value
                );
              }}
              className="w-full clay-input px-3.5 py-2.5 text-xs sm:text-sm font-bold text-[#1E1B3A] dark:text-white dark:bg-[#14122B]"
            >
              <option value="">
                {catalog.hasLocalVoice
                  ? isEn
                    ? "Auto (Local Device or Smart Cloud)"
                    : "التلقائي (صوت الجهاز المحلي مع البديل السحابي)"
                  : isEn
                  ? "Auto (Smart Cloud Studio Voice - Active)"
                  : "التلقائي (النطق السحابي الذكي الفوري - مفعّل)"}
              </option>

              {/* Cloud Studio Voices (Guaranteed zero-setup across all phones) */}
              <optgroup label={isEn ? "Smart Cloud Studio Voices (Universal)" : "أصوات النطق السحابي الذكي (تعمل على جميع الهواتف)"}>
                <option value={CLOUD_VOICE_FEMALE_URI}>
                  {isEn ? "Cloud Studio: Clear Female Voice ☁️" : "سحابي نقي: صوت أنثوي فائق الوضوح ☁️"}
                </option>
                <option value={CLOUD_VOICE_MALE_URI}>
                  {isEn ? "Cloud Studio: Resonant Male Voice ☁️" : "سحابي نقي: صوت ذكوري وقور ☁️"}
                </option>
              </optgroup>

              {/* Real Local Device Voices (If available) */}
              {catalog.male.length > 0 && (
                <optgroup label={isEn ? "Device Male Voices (Local)" : "أصوات ذكورية محلية على جهازك"}>
                  {catalog.male.map((v) => (
                    <option key={v.voiceURI} value={v.voiceURI}>
                      {v.name} ({v.lang})
                    </option>
                  ))}
                </optgroup>
              )}
              {catalog.female.length > 0 && (
                <optgroup label={isEn ? "Device Female Voices (Local)" : "أصوات أنثوية محلية على جهازك"}>
                  {catalog.female.map((v) => (
                    <option key={v.voiceURI} value={v.voiceURI}>
                      {v.name} ({v.lang})
                    </option>
                  ))}
                </optgroup>
              )}
              {catalog.other.length > 0 && (
                <optgroup label={isEn ? "Other System Voices" : "أصوات النظام المتاحة"}>
                  {catalog.other.map((v) => (
                    <option key={v.voiceURI} value={v.voiceURI}>
                      {v.name} ({v.lang})
                    </option>
                  ))}
                </optgroup>
              )}
            </select>

            {/* Reassuring badge when device lacks local voice pack */}
            {!catalog.hasLocalVoice ? (
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200 text-xs font-bold flex items-start gap-2.5 shadow-sm">
                <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-black">
                    {isEn ? "Smart Cloud Voice Active" : "النطق السحابي الذكي مفعّل تلقائياً"}
                  </div>
                  <div className="text-[11px] text-emerald-700 dark:text-emerald-300 mt-0.5 leading-relaxed font-medium">
                    {isEn
                      ? "Studio-quality Classical Arabic narration is running seamlessly without needing to install any phone language packs."
                      : "يتم نطق الأعداد كاملة بالعربية الفصحى بصوت نقي فائق الجودة يعمل تلقائياً دون الحاجة لتثبيت أي حزمة صوتية على هاتفك."}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 px-1 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-brand-500 shrink-0" />
                <span>
                  {isEn
                    ? "Your device has local voices. Smart Cloud fallback is ready if local voice encounters any issue."
                    : "يتوفر صوت محلي على جهازك، والنظام السحابي الاحتياطي جاهز تلقائياً عند الحاجة."}
                </span>
              </div>
            )}
          </div>

          <p className="text-[11px] font-bold text-[#5E5985] dark:text-[#B8B3DC] px-1">
            {isEn
              ? "Speech speed and clarity automatically adapt to your selected question speed."
              : "تُضبط سرعة النطق وطبقة الصوت تلقائيًا بما يتناسب مع سرعة ظهور الأرقام في التدريب."}
          </p>
        </div>
      )}

      {/* Flash Anzan Timing Modes + Custom Pause Gap */}
      {showFlashTimingModes && (
        <div className="pt-3 border-t border-[#E6E2FA] dark:border-[#2E2B57] space-y-3">
          <div className="space-y-2">
            <label className="text-xs font-extrabold text-[#3F3A66] dark:text-[#DAD6F7] flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-brand-500" />
              <span>{isEn ? "Flash Timing Mode" : "وضع توقيت العرض والنطق (Flash Anzan)"}</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {(
                [
                  {
                    id: "synced",
                    title: isEn ? "Synchronized Speech" : "النطق المتزامن",
                    desc: isEn
                      ? "Moves to the next number after full pronunciation + gap interval."
                      : "ينتقل للعدد التالي بعد اكتمال نطق العدد بالكامل والفاصل الزمني.",
                  },
                  {
                    id: "fixed",
                    title: isEn ? "Fixed Flash Speed" : "السرعة الثابتة",
                    desc: isEn
                      ? "Keeps strict display timing without waiting; prevents voice overlap."
                      : "يحافظ على توقيت العرض المحدد دون انتظار الصوت ويمنع التداخل.",
                  },
                ] as { id: FlashTimingMode; title: string; desc: string }[]
              ).map((m) => {
                const active = prefs.flashTimingMode === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      playFx("toggle");
                      updateField("flashTimingMode", m.id);
                    }}
                    className={`p-3 rounded-2xl border text-start transition-all ${
                      active
                        ? "bg-white dark:bg-[#242146] border-brand-500 ring-2 ring-brand-500/20 shadow-sm"
                        : "bg-white/60 dark:bg-[#14122B]/80 border-[#E6E2FA] dark:border-[#2E2B57] hover:border-brand-300"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-black text-[#1E1B3A] dark:text-white">
                        {m.title}
                      </span>
                      {active && <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                    </div>
                    <p className="text-[11px] text-[#5E5985] dark:text-[#B8B3DC] mt-1 leading-relaxed">
                      {m.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {typeof clearDelayMs === "number" && onChangeClearDelayMs && (
            <div className="p-3 rounded-2xl bg-white dark:bg-[#14122B] border border-[#E6E2FA] dark:border-[#2E2B57] space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-[#4E477A] dark:text-[#C5BFEA] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-brand-500" />
                  <span>{isEn ? "Pause Interval Between Numbers" : "الفاصل الزمني بين الأعداد"}</span>
                </span>
                <span className="font-mono font-black text-brand-600 dark:text-brand-300">
                  {(clearDelayMs / 1000).toFixed(2)}s
                </span>
              </div>
              <input
                type="range"
                min={100}
                max={1500}
                step={50}
                value={clearDelayMs}
                onChange={(e) => onChangeClearDelayMs(Number(e.target.value))}
                className="w-full accent-brand-600 cursor-pointer"
              />
            </div>
          )}
        </div>
      )}

      {/* Independent Synchronized Short Digital Beep Control */}
      <div className="p-3 rounded-2xl bg-white dark:bg-[#14122B] border border-[#E6E2FA] dark:border-[#2E2B57] space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-extrabold text-[#2E2759] dark:text-white">
            <Zap className="w-4 h-4 text-amber-500 shrink-0" />
            <span>
              {isEn
                ? "Short Synced Flash Cue Beep"
                : "صوت التنبيه القصير المتزامن مع كل عدد"}
            </span>
          </div>
          <button
            type="button"
            disabled={!globalSoundEnabled}
            onClick={() => {
              const next = !flashSoundEnabled;
              toggleFlashSound();
              if (next) setTimeout(() => playFx("flash_number"), 30);
            }}
            className={`px-3 py-1 rounded-xl text-[11px] font-black transition-colors disabled:opacity-45 ${
              flashSoundEnabled && globalSoundEnabled
                ? "bg-amber-400/20 text-amber-800 dark:text-amber-300 border border-amber-400/40"
                : "bg-slate-200 dark:bg-slate-800 text-slate-500 border border-slate-300 dark:border-slate-700"
            }`}
          >
            {flashSoundEnabled ? (isEn ? "On" : "مفعّل") : isEn ? "Off" : "معطّل"}
          </button>
        </div>

        <div className="flex items-center gap-2.5">
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            aria-label={isEn ? "Flash beep level" : "مستوى صوت التنبيه"}
            value={beepVolPct}
            disabled={!globalSoundEnabled || !flashSoundEnabled}
            onChange={(e) => setFlashSoundVolume(Number(e.target.value) / 100)}
            onPointerUp={() => playFx("flash_number")}
            className="flex-1 accent-amber-500 cursor-pointer disabled:opacity-40"
          />
          <span className="w-9 text-end font-mono font-bold text-[11px] text-[#5E5985] dark:text-[#C5BFEA]">
            {beepVolPct}%
          </span>
        </div>
      </div>

      {/* Neat Bilingual Note Explaining Pronunciation Rules */}
      <div className="p-3 rounded-2xl bg-emerald-50/90 dark:bg-emerald-950/35 border border-emerald-200 dark:border-emerald-800/50 text-emerald-950 dark:text-emerald-100 text-[11px] sm:text-xs flex items-start gap-2 leading-relaxed">
        <Info className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
        <p>
          {isEn ? (
            <>
              <strong>Pronunciation Rules:</strong> Whole numbers are always read in full.
              Addition reads the number directly without saying &ldquo;Plus&rdquo;, while subtraction
              and negative numbers pronounce &ldquo;Minus&rdquo; once before the number (decimals supported).
            </>
          ) : (
            <>
              <strong>قواعد النطق المعتمدة:</strong> تُنطق الأعداد كاملة بصورة صحيحة وليس رقمًا رقمًا؛
              في الجمع يُنطق العدد فقط دون كلمة «زائد»، وفي الطرح تُنطق «ناقص» مرة واحدة قبل العدد، مع دعم الأعداد السالبة والعشرية.
            </>
          )}
        </p>
      </div>
    </div>
  );
}
