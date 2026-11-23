"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Info,
  X,
  Play,
  ArrowRight,
  ArrowLeft,
  GraduationCap,
  Clock,
  ChevronLeft,
  Shield,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { checkModuleAccess, isLocalDevMode } from "@/lib/module-access";
import ClayIcon, { ClayBadgeTone, ClayIconName } from "@/components/design-system/ClayIcon";
import {
  ClayActionCircle,
  ClayActionTheme,
} from "@/components/design-system/ClayMotion";
import { INTELLIGENCE_BRANCHES } from "@/lib/kangaroo-data";
import { VEDIC_LEVELS, VedicLesson } from "@/lib/vedic-math-data";
import VedicLessonModal from "@/components/vedic/VedicLessonModal";

type MainProgramSection = "hub" | "mental-math" | "intelligence" | "vedic";
type CategoryFilter = "all" | "basics" | "speed" | "competitions";

interface MentalModule {
  id: string;
  category: CategoryFilter;
  href: string;
  title: string;
  enTitle: string;
  shortTagline: string;
  enShortTagline: string;
  desc: string;
  enDesc: string;
  badge: string;
  enBadge: string;
  icon: ClayIconName;
  tone: ClayBadgeTone;
  actionTheme: ClayActionTheme;
  cardSurface: string;
  hoverRing: string;
  stageBg: string;
  modalHeaderBg: string;
  ctaBg: string;
  iconMotion: string;
  bullets: string[];
  enBullets: string[];
  cta: string;
  enCta: string;
}

export default function MentalArithmeticPage() {
  const { language, playFx } = useApp();
  const { role, user } = useAuth();
  const isEn = language === "en";

  const [activeProgram, setActiveProgram] = useState<MainProgramSection>("hub");
  const [hubCategory, setHubCategory] = useState<"all" | "math" | "strategy" | "tech">("all");
  const [filter, setFilter] = useState<CategoryFilter>("all");
  const [selectedModule, setSelectedModule] = useState<MentalModule | null>(null);
  const [activeVedicLesson, setActiveVedicLesson] = useState<VedicLesson | null>(null);
  const [devAdminOverride, setDevAdminOverride] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setDevAdminOverride(window.localStorage.getItem("supermind_dev_admin_override") === "true");
    }
  }, []);

  const toggleDevAdmin = () => {
    if (typeof window === "undefined") return;
    const nextVal = !devAdminOverride;
    if (nextVal) {
      window.localStorage.setItem("supermind_dev_admin_override", "true");
    } else {
      window.localStorage.removeItem("supermind_dev_admin_override");
    }
    setDevAdminOverride(nextVal);
    window.location.reload();
  };

  const effectiveRole = devAdminOverride ? "admin" : role;

  // Module access evaluations
  const secAccess = checkModuleAccess("secrets-of-numbers", effectiveRole, user?.email);
  const sudokuAccess = checkModuleAccess("sudoku", effectiveRole, user?.email);
  const intelAccess = checkModuleAccess("intelligence", effectiveRole, user?.email);
  const chessAccess = checkModuleAccess("chess", effectiveRole, user?.email);
  const rubiksAccess = checkModuleAccess("rubiks-cube", effectiveRole, user?.email);
  const brainAccess = checkModuleAccess("brain-games", effectiveRole, user?.email);
  const memAccess = checkModuleAccess("memory-focus", effectiveRole, user?.email);
  const codingAccess = checkModuleAccess("kids-coding", effectiveRole, user?.email);

  // Synchronize section from URL parameter if provided (e.g. from navbar or direct links)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const sec = params.get("section");
      if (sec === "mental-math" || sec === "intelligence" || sec === "vedic") {
        setActiveProgram(sec);
      }
    }
  }, []);

  const closeModal = useCallback(() => {
    playFx("modal_close");
    setSelectedModule(null);
  }, [playFx]);

  // Close modal with Escape key
  useEffect(() => {
    if (!selectedModule) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeModal();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedModule, closeModal]);

  const tabs: { id: CategoryFilter; label: string; enLabel: string }[] = [
    { id: "all", label: "الكل", enLabel: "All" },
    { id: "basics", label: "الأساسيات والمعداد", enLabel: "Basics & Soroban" },
    { id: "speed", label: "السرعة والفلاش", enLabel: "Speed & Flash" },
    { id: "competitions", label: "الألعاب والبطولات", enLabel: "Games & Arenas" },
  ];

  const modules: MentalModule[] = [
    {
      id: "learn",
      category: "basics",
      href: "/learn",
      title: "قسم التعليم والمراحل",
      enTitle: "Learning Stages",
      shortTagline: "منهج السوروبان والجمع والطرح التأسيسي",
      enShortTagline: "Foundational Soroban & step-by-step arithmetic",
      desc: "مسار تعليمي تفاعلي متكامل للأطفال والمبتدئين يبدأ من التعرف على المعداد والخرزات، وصولاً إلى أصدقاء الخمسة والعشرة والعمليات المزدوجة.",
      enDesc: "Comprehensive interactive learning path starting with Soroban beads up to Small & Big Friends complements and compound rules.",
      badge: "منهج تفاعلي 🎓",
      enBadge: "Interactive Course 🎓",
      icon: "graduation",
      tone: "indigo",
      actionTheme: "purple",
      cardSurface:
        "bg-gradient-to-br from-white via-[#FAF8FF] to-[#EDE7FF] dark:from-[#1E1B3E] dark:via-[#1C1A3A] dark:to-[#221B48] border-[#E1D8FA] dark:border-[#382E6E]/70",
      hoverRing:
        "hover:border-[#6344F5] hover:shadow-[0_22px_40px_-10px_rgba(99,68,245,0.25)]",
      stageBg: "from-[#F1EDFF] to-[#DED4FF] dark:from-[#251E52] dark:to-[#1C1642]",
      modalHeaderBg: "from-[#8B6EFF] to-[#6344F5]",
      ctaBg: "bg-[#EFEAFF] hover:bg-[#E3DCFF] dark:bg-[#251E52] dark:hover:bg-[#2E2566] text-brand-700 dark:text-brand-300",
      iconMotion: "group-hover:-translate-y-1.5 group-hover:scale-110",
      bullets: [
        "دروس تفاعلية لتمثيل الأرقام على السوروبان وقراءة الخرزات",
        "تمارين موجهة لأصدقاء الخمسة (+1, +2, +3, +4)",
        "تمارين متقدمة لأصدقاء العشرة والعمليات المركبة",
      ],
      enBullets: [
        "Interactive bead representation and Soroban reading lessons",
        "Guided exercises for Small Friends (+1, +2, +3, +4)",
        "Advanced Big Friends practice and compound rules",
      ],
      cta: "ابدأ التعلم",
      enCta: "Start Learning",
    },
    {
      id: "abacus",
      category: "basics",
      href: "/mental-arithmetic/abacus",
      title: "العداد (السوروبان)",
      enTitle: "Virtual Soroban Abacus",
      shortTagline: "عداد ياباني ثلاثي الأبعاد مع أصوات الخرزات",
      enShortTagline: "3D virtual Soroban with physical bead sound effects",
      desc: "معداد ياباني افتراضي متكامل يحاكي المعداد الحقيقي بدقة فيزيائية وصوت حركة خرزات حقيقي، مخصص لتطوير التخيل البصري والحساب اليدوي السريع.",
      enDesc: "Full-fidelity interactive Japanese abacus with physical bead click audio, designed to sharpen mental visualization and tactile finger arithmetic.",
      badge: "محاكي واقعي 🧮",
      enBadge: "Realistic Simulator 🧮",
      icon: "soroban",
      tone: "lavender",
      actionTheme: "purple",
      cardSurface:
        "bg-gradient-to-br from-white via-[#FAF8FF] to-[#EDE7FF] dark:from-[#1E1B3E] dark:via-[#1C1A3A] dark:to-[#221B48] border-[#E1D8FA] dark:border-[#382E6E]/70",
      hoverRing:
        "hover:border-[#6344F5] hover:shadow-[0_22px_40px_-10px_rgba(99,68,245,0.25)]",
      stageBg: "from-[#F1EDFF] to-[#DED4FF] dark:from-[#251E52] dark:to-[#1C1642]",
      modalHeaderBg: "from-[#8B6EFF] to-[#6344F5]",
      ctaBg: "bg-[#EFEAFF] hover:bg-[#E3DCFF] dark:bg-[#251E52] dark:hover:bg-[#2E2566] text-brand-700 dark:text-brand-300",
      iconMotion: "group-hover:-translate-y-1.5 group-hover:scale-110",
      bullets: [
        "محاكاة واقعية لحركة الخرزات الخماسية والأحادية مع الصوت",
        "زر تصفير سريع (Zeroing) لمطابقة مسابقات الحساب الحقيقية",
        "قراءة رقمية فورية مع توضيح القيمة المكانية لكل عمود",
      ],
      enBullets: [
        "Realistic upper (5s) and lower (1s) bead motion with sound",
        "Quick reset / zeroing bar matching real tournament Sorobans",
        "Instant digital readout with place value column breakdown",
      ],
      cta: "ابدأ التدريب",
      enCta: "Start Practice",
    },
    {
      id: "flash-anzan",
      category: "speed",
      href: "/mental-arithmetic/flash-anzan",
      title: "فلاش أنزان (الأرقام الوامضة)",
      enTitle: "Flash Anzan",
      shortTagline: "تدريب الوميض السريع وتنمية التخيل الذهني",
      enShortTagline: "High-speed mental flashing numbers training",
      desc: "الأداة الأولى في العالم العربي للتدريب على سرعة وميض الأرقام (فلاش أنزان) مع تحكم دقيق بالسرعة (من 0.2 ثانية إلى 3 ثوانٍ) ونطق صوتي واضح وتوليد أرقام ذكي.",
      enDesc: "Premier Flash Anzan speed builder featuring precision speeds (0.2s - 3.0s), natural voice dictation, and smart arithmetic generation.",
      badge: "سرعة خارقة ⚡",
      enBadge: "Super Speed ⚡",
      icon: "flash",
      tone: "gold",
      actionTheme: "gold",
      cardSurface:
        "bg-gradient-to-br from-white via-[#FFFDF5] to-[#FEF3C7] dark:from-[#1E1B3E] dark:via-[#1F1C36] dark:to-[#382D13] border-[#FDE68A] dark:border-[#594411]/70",
      hoverRing:
        "hover:border-[#F59E0B] hover:shadow-[0_22px_40px_-10px_rgba(245,158,11,0.28)]",
      stageBg: "from-[#FEF9C3] to-[#FDE047] dark:from-[#3D300F] dark:to-[#2B2107]",
      modalHeaderBg: "from-[#FBBF24] to-[#D97706]",
      ctaBg: "bg-[#FEF3C7] hover:bg-[#FDE68A] dark:bg-[#34270C] dark:hover:bg-[#453412] text-[#B45309] dark:text-[#FCD34D]",
      iconMotion: "group-hover:-translate-y-1.5 group-hover:scale-110",
      bullets: [
        "تحكم دقيق بسرعة الوميض من 0.2 ثانية وحتى 3 ثوانٍ لكل رقم",
        "دعم النطق الصوتي للأرقام باللغتين العربية والإنجليزية",
        "إعدادات مخصصة للآحاد والعشرات والمئات وقواعد السوروبان",
      ],
      enBullets: [
        "Precision speeds ranging from 0.2s up to 3.0s per flash",
        "Bilingual Arabic & English voice pronunciation",
        "Custom place values and Soroban complement rule filters",
      ],
      cta: "ابدأ التدريب",
      enCta: "Start Training",
    },
    {
      id: "teams-battle",
      category: "competitions",
      href: "/mental-arithmetic/teams-battle",
      title: "حلبة تحدي الفرق والبطولات",
      enTitle: "Teams Battle Arena",
      shortTagline: "تنافس جماعي حي بين الفرق ومنصة تتويج",
      enShortTagline: "Live multi-team racing arena and 3D podium",
      desc: "حلبة تنافسية جماعية للصفوف والمدارس بين الفرق (من فريقين إلى 5 فرق: A, B, C, D, E) مع قياس سرعة الإجابة بالمللي ثانية ومضمار سباق وتتويج بطل الأبطال.",
      enDesc: "Live classroom & school battle arena supporting 2 to 5 teams (A-E) with millisecond speed bonuses, animated race tracks, and victory podium.",
      badge: "منصة التتويج 🥇",
      enBadge: "Live Podium 🥇",
      icon: "podium",
      tone: "mint",
      actionTheme: "mint",
      cardSurface:
        "bg-gradient-to-br from-white via-[#F5FEFC] to-[#DCFAF4] dark:from-[#1E1B3E] dark:via-[#1C1A3A] dark:to-[#133633] border-[#BBEFE5] dark:border-[#22615A]/70",
      hoverRing:
        "hover:border-[#2CB5A3] hover:shadow-[0_22px_40px_-10px_rgba(44,181,163,0.28)]",
      stageBg: "from-[#E6FBF7] to-[#BEF0E7] dark:from-[#16413E] dark:to-[#0F2E2B]",
      modalHeaderBg: "from-[#4EE1CC] to-[#1FA896]",
      ctaBg: "bg-[#E2FAF5] hover:bg-[#CCF5EC] dark:bg-[#143A36] dark:hover:bg-[#1B4A45] text-[#0D9488] dark:text-[#5EEAD4]",
      iconMotion: "group-hover:-translate-y-1.5 group-hover:scale-110",
      bullets: [
        "دعم المنافسة بين فريقين وحتى 5 فرق بنفس الوقت",
        "حساب نقاط مكافأة السرعة بالمللي ثانية لكل إجابة صحيحة",
        "مضمار سباق حي ومنصة تتويج احتفالية بالكؤوس والميداليات",
      ],
      enBullets: [
        "Compete with 2 up to 5 teams simultaneously",
        "Speed bonus points calculated to the millisecond",
        "Live animated race track and celebration podium",
      ],
      cta: "ابدأ التدريب",
      enCta: "Enter Arena",
    },
    {
      id: "competition",
      category: "competitions",
      href: "/mental-arithmetic/competition",
      title: "محاكي المسابقات الرسمية",
      enTitle: "Competition Simulator",
      shortTagline: "محاكاة واقعية لاختبارات البطولات الدولية",
      enShortTagline: "Realistic international championship simulator",
      desc: "نظام محاكاة دقيق ومطابق لبطولات الحساب الذهني الرسمية (100 سؤال، توقيت تنازلي 10 دقائق، وحساب تلقائي لعلامة الطالب مع تقرير نقاط القوة والضعف).",
      enDesc: "Official tournament simulator (100 questions, 10-minute countdown, instant score grading, and comprehensive performance diagnostics).",
      badge: "محاكي رسمي 🏆",
      enBadge: "Official Exam 🏆",
      icon: "trophy",
      tone: "gold",
      actionTheme: "gold",
      cardSurface:
        "bg-gradient-to-br from-white via-[#FFFDF5] to-[#FEF3C7] dark:from-[#1E1B3E] dark:via-[#1F1C36] dark:to-[#382D13] border-[#FDE68A] dark:border-[#594411]/70",
      hoverRing:
        "hover:border-[#F59E0B] hover:shadow-[0_22px_40px_-10px_rgba(245,158,11,0.28)]",
      stageBg: "from-[#FEF9C3] to-[#FDE047] dark:from-[#3D300F] dark:to-[#2B2107]",
      modalHeaderBg: "from-[#FBBF24] to-[#D97706]",
      ctaBg: "bg-[#FEF3C7] hover:bg-[#FDE68A] dark:bg-[#34270C] dark:hover:bg-[#453412] text-[#B45309] dark:text-[#FCD34D]",
      iconMotion: "group-hover:-translate-y-1.5 group-hover:scale-110",
      bullets: [
        "محاكاة واقعية لورقة الاختبار والعد التنازلي التنافسي",
        "أقسام متدرجة: آحاد بسيطة، أصدقاء 5، أصدقاء 10، وعشرات",
        "تحليل فوري لدقة وسرعة الإجابة مع شهادة إنجاز",
      ],
      enBullets: [
        "Realistic exam sheet layout with competitive countdown timer",
        "Tiered sections: simple units, friends of 5, 10, and tens",
        "Instant accuracy & speed analytics with achievement award",
      ],
      cta: "ابدأ التدريب",
      enCta: "Start Exam",
    },
    {
      id: "balloon-pop",
      category: "competitions",
      href: "/mental-arithmetic/balloon-pop",
      title: "تحدي تفجير البالونات",
      enTitle: "Balloon Pop Arena",
      shortTagline: "لعبة حماسية ثلاثية الأبعاد لسرعة البديهة",
      enShortTagline: "3D gamified reflex and mental arithmetic challenge",
      desc: "لعبة حماسية سريعة يتمرن فيها الطالب على حل العمليات الذهنية السريعة واختيار البالون الذي يحمل الناتج الصحيح قبل صعوده، مع مؤثرات صوتية وبصرية رائعة.",
      enDesc: "Exciting 3D reflex game where learners solve operations and pop the balloon carrying the correct result before it floats away.",
      badge: "لعبة حماسية 🎈",
      enBadge: "Active Game 🎈",
      icon: "game",
      tone: "pink",
      actionTheme: "rose",
      cardSurface:
        "bg-gradient-to-br from-white via-[#FFF5F8] to-[#FFE4EC] dark:from-[#1E1B3E] dark:via-[#1F172E] dark:to-[#381427] border-[#FECDD9] dark:border-[#591B3A]/70",
      hoverRing:
        "hover:border-[#E11D48] hover:shadow-[0_22px_40px_-10px_rgba(225,29,72,0.28)]",
      stageBg: "from-[#FFE4EC] to-[#FDA4AF] dark:from-[#3D1426] dark:to-[#2B0E1B]",
      modalHeaderBg: "from-[#FB7185] to-[#E11D48]",
      ctaBg: "bg-[#FFE4EC] hover:bg-[#FECDD9] dark:bg-[#341121] dark:hover:bg-[#45162B] text-[#BE123C] dark:text-[#FDA4AF]",
      iconMotion: "group-hover:-translate-y-1.5 group-hover:scale-110",
      bullets: [
        "أجواء لعب محفزة مع أصوات فرقعة بالونات حقيقية",
        "مستويات صعوبة متعددة مناسبة لجميع الأعمار",
        "تحدي ضد الزمن لتعزيز سرعة الاستجابة والتركيز",
      ],
      enBullets: [
        "Rewarding gameplay with satisfying balloon pop sound effects",
        "Multiple difficulty levels suitable for all age groups",
        "Time-attack mode that boosts reflexes and laser focus",
      ],
      cta: "ابدأ التدريب",
      enCta: "Play Now",
    },
    {
      id: "multiplication-division",
      category: "speed",
      href: "/mental-arithmetic/multiplication-division",
      title: "الضرب والقسمة السريعة",
      enTitle: "Speed Multiplication & Division",
      shortTagline: "قواعد السوروبان للضرب والقسمة الذهنية",
      enShortTagline: "Soroban multiplication & division speed rules",
      desc: "تمارين مخصصة لإتقان الضرب والقسمة على المعداد السوروبان وذهنياً، تبدأ من جداول الضرب الأساسية وصولاً إلى ضرب وقسمة أعداد من خانتين وثلاث خانات.",
      enDesc: "Dedicated speed trainer for Soroban and mental multiplication & division, scaling from times tables to multi-digit operations.",
      badge: "مهارات متقدمة ✖️➗",
      enBadge: "Advanced Skills ✖️➗",
      icon: "math123",
      tone: "lavender",
      actionTheme: "purple",
      cardSurface:
        "bg-gradient-to-br from-white via-[#FAF8FF] to-[#EDE7FF] dark:from-[#1E1B3E] dark:via-[#1C1A3A] dark:to-[#221B48] border-[#E1D8FA] dark:border-[#382E6E]/70",
      hoverRing:
        "hover:border-[#6344F5] hover:shadow-[0_22px_40px_-10px_rgba(99,68,245,0.25)]",
      stageBg: "from-[#F1EDFF] to-[#DED4FF] dark:from-[#251E52] dark:to-[#1C1642]",
      modalHeaderBg: "from-[#8B6EFF] to-[#6344F5]",
      ctaBg: "bg-[#EFEAFF] hover:bg-[#E3DCFF] dark:bg-[#251E52] dark:hover:bg-[#2E2566] text-brand-700 dark:text-brand-300",
      iconMotion: "group-hover:-translate-y-1.5 group-hover:scale-110",
      bullets: [
        "طريقة السوروبان لتحديد الخانات الناتجة وحفظ الوسيط",
        "توليد ذكي لمسائل الضرب من 1×1 وحتى 3×2 خانات",
        "قسمة مباشرة مع إظهار خطوات الباقي خطوة بخطوة",
      ],
      enBullets: [
        "Soroban rod-positioning and intermediate place holder method",
        "Smart problem generator from 1x1 up to 3x2 digits",
        "Step-by-step long division breakdown with remainder analysis",
      ],
      cta: "ابدأ التدريب",
      enCta: "Start Practice",
    },
  ];

  const visibleModules =
    filter === "all" ? modules : modules.filter((m) => m.category === filter);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8" dir="rtl">
      {/* شريط كبسولة برامج العقل الخارق المتجاوب كلياً مع كل أحجام الشاشات */}
      <div className="clay-banner-lavender relative overflow-hidden px-4 sm:px-6 py-4 rounded-2xl sm:rounded-3xl shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-3 text-white transition-all">
        <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center shrink-0 shadow-sm text-xl sm:text-2xl">
            🧠
          </div>
          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-base sm:text-xl md:text-2xl font-black text-white leading-tight">
                {isEn ? "Super Mind Programs" : "برامج العقل الخارق"}
              </h1>
              <span className="text-[10px] sm:text-xs font-black px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 shrink-0 shadow-sm whitespace-nowrap">
                {isEn ? "9 Academies 🚀" : "9 أكاديميات متكاملة 🚀"}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-white/95 font-medium leading-relaxed">
              {isEn
                ? "Select a program capsule to enter its dedicated arena"
                : "اختر كبسولة البرنامج للدخول المباشر إلى تفاصيله وتحدياته التفاعلية"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0 self-end md:self-auto">
          {isLocalDevMode() && (
            <button
              type="button"
              onClick={toggleDevAdmin}
              className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-md ${
                devAdminOverride || role === "admin"
                  ? "bg-amber-400 text-slate-950 hover:bg-amber-300"
                  : "bg-white/20 text-white hover:bg-white/30 border border-white/30"
              }`}
              title="التبديل بين وضع الأدمن ووضع الطالب أثناء التطوير المحلي"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>
                {devAdminOverride || role === "admin"
                  ? "وضع الأدمن نشط (متاح كل شيء) 🛠️"
                  : "وضع الطالب (الأقسام مقفولة) 🔒"}
              </span>
            </button>
          )}

          {activeProgram !== "hub" && (
            <button
              type="button"
              onClick={() => {
                playFx("pop");
                setActiveProgram("hub");
              }}
              className="clay-pill px-3 sm:px-4 py-1.5 text-xs font-black text-slate-900 bg-white hover:bg-amber-100 flex items-center gap-1.5 shrink-0 shadow-md transition-all active:scale-95"
            >
              <ArrowRight className="w-3.5 h-3.5 text-brand-600" />
              <span>{isEn ? "All Capsules" : "الكبسولات الرئيسية"}</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* الواجهة الرئيسية للكبسولات الثلاث (تظهر الكبسولات فقط دون تفاصيل أسفلها)   */}
      {/* ========================================================================= */}
      {activeProgram === "hub" && (
        <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
          {/* العرض السينمائي الشامل لأبطال العقل الخارق والمعداد الياباني 1:4 */}
          <div className="relative rounded-3xl sm:rounded-[2.5rem] overflow-hidden shadow-2xl border-2 border-white/60 dark:border-brand-500/30 bg-gradient-to-br from-[#1E1838] via-[#2A1D54] to-[#16122E] group">
            <div className="relative w-full aspect-[16/9] max-h-[480px] overflow-hidden">
              <Image
                src="/images/clay/math-fun-mascot.jpg"
                alt="أبطال العقل الخارق ومعداد السوروبان الياباني 1:4"
                width={1376}
                height={768}
                priority
                className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700 ease-out"
              />
            </div>
          </div>

          {/* تبويبات الفئات الثلاث الكبرى لتصفح البرامج */}
          <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 rounded-2xl bg-slate-100/90 dark:bg-slate-900/70 border border-brand-200/50 dark:border-brand-900/40 max-w-2xl mx-auto shadow-sm">
            {[
              { id: "all", label: "الكل (9 برامج عبقرية 🚀)" },
              { id: "math", label: "🧮 الحساب والرياضيات" },
              { id: "strategy", label: "♟️ الذكاء والاستراتيجية" },
              { id: "tech", label: "💻 القدرات والتكنولوجيا" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  playFx("click");
                  setHubCategory(tab.id as "all" | "math" | "strategy" | "tech");
                }}
                className={`py-2 px-3.5 rounded-xl text-xs sm:text-sm font-black transition-all ${
                  hubCategory === tab.id
                    ? "bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 text-white shadow-md scale-102"
                    : "text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* الكبسولات التسع الكبرى التفاعلية */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 pt-1">
            {/* 1. قسم الحساب الذهني */}
            {(hubCategory === "all" || hubCategory === "math") && (
              <div className="clay-card !p-5 sm:!p-6 bg-gradient-to-br from-white via-indigo-50/50 to-brand-50/70 dark:from-[#1E1B3E] dark:via-[#25204C] dark:to-[#191537] border-2 border-brand-500/40 dark:border-brand-500/50 rounded-[2.2rem] shadow-xl flex flex-col justify-between space-y-4 hover:scale-[1.02] transition-all group">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center text-3xl shadow-lg border border-white/40 group-hover:scale-110 transition-transform">
                      🧮
                    </span>
                    <span className="text-xs font-black px-3 py-1 rounded-full bg-brand-100 dark:bg-brand-900/70 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                      6 أقسام تدريبية 🌟
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg sm:text-xl font-black text-[#261E58] dark:text-white leading-snug">
                      الحساب الذهني (السوروبان)
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed mt-1.5">
                      المنظومة الاحترافية للسوروبان الياباني، فلاش أنزان السريع، محاكي المسابقات، حلبة سباق الفرق، وتفجير البالونات.
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-white/70 dark:bg-black/20 border border-brand-200/60 dark:border-brand-900/50 space-y-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                    <div className="flex items-center gap-2">
                      <span className="text-amber-500">✔</span>
                      <span>العداد السوروبان 1:4 وفلاش أنزان</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-amber-500">✔</span>
                      <span>محاكي المسابقات الدولية وسباقات الفرق</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-amber-500">✔</span>
                      <span>ألعاب البالونات وخوارزميات الضرب والقسمة</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    playFx("pop");
                    setActiveProgram("mental-math");
                  }}
                  className="clay-btn-purple w-full py-3.5 px-4 font-black text-sm flex items-center justify-center gap-2 shadow-lg !rounded-2xl group-hover:shadow-brand-500/30"
                >
                  <span>دخول قسم الحساب الذهني</span>
                  <span className="text-base">⬅️</span>
                </button>
              </div>
            )}

            {/* 2. الذاكرة والتركيز الفائق (مفتوح ومتاح مجاناً للجميع) */}
            {(hubCategory === "all" || hubCategory === "tech" || hubCategory === "strategy") && (
              <div className="clay-card !p-5 sm:!p-6 bg-gradient-to-br from-white via-purple-50/50 to-indigo-50/70 dark:from-[#1E1B3E] dark:via-[#261D46] dark:to-[#1B1432] border-2 border-purple-500/40 dark:border-purple-500/50 rounded-[2.2rem] shadow-xl flex flex-col justify-between space-y-4 hover:scale-[1.02] transition-all group">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 via-indigo-600 to-violet-700 text-white flex items-center justify-center text-3xl shadow-lg border border-white/40 group-hover:scale-110 transition-transform">
                      🎯
                    </span>
                    <span className="text-xs font-black px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                      {memAccess.badgeAr}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg sm:text-xl font-black text-[#261E58] dark:text-white leading-snug">
                      الذاكرة والتركيز الفائق
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed mt-1.5">
                      تدريبات علمية لتنمية الذاكرة البصرية المكانية والسمعية، اختبار الشمبانزي للتسلسل اللحظي، واختبار ستروب وسرعة الاستجابة.
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-white/70 dark:bg-black/20 border border-purple-200/60 dark:border-purple-900/50 space-y-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                    <div className="flex items-center gap-2">
                      <span className="text-amber-500">✔</span>
                      <span>الذاكرة المكانية واختبار الشمبانزي للتسلسل</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-amber-500">✔</span>
                      <span>الذاكرة السمعية وصدى الأرقام بالصوت الحي</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-amber-500">✔</span>
                      <span>مخطط رادار القدرات المعرفية وسرعة الرد بالمللي ثانية</span>
                    </div>
                  </div>
                </div>

                <Link
                  href="/memory-focus"
                  onClick={() => playFx("pop")}
                  className="clay-btn-purple w-full py-3.5 px-4 font-black text-sm flex items-center justify-center gap-2 shadow-lg !rounded-2xl group-hover:shadow-purple-500/30"
                >
                  <span>دخول الذاكرة والتركيز الفائق</span>
                  <span className="text-base">⬅️</span>
                </Link>
              </div>
            )}

            {/* 3. أكاديمية السودوكو الذكية (مفتوحة ومتاحة للتدريب) */}
            {(hubCategory === "all" || hubCategory === "math" || hubCategory === "strategy") && (
              <div className="clay-card !p-5 sm:!p-6 bg-gradient-to-br from-white via-teal-50/50 to-emerald-50/70 dark:from-[#1E1B3E] dark:via-[#1B2937] dark:to-[#14232C] border-2 border-emerald-500/40 dark:border-emerald-500/50 rounded-[2.2rem] shadow-xl flex flex-col justify-between space-y-4 hover:scale-[1.02] transition-all group">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 via-emerald-600 to-green-600 text-white flex items-center justify-center text-3xl shadow-lg border border-white/40 group-hover:scale-110 transition-transform">
                      🔢
                    </span>
                    <span className="text-xs font-black px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                      {sudokuAccess.badgeAr}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg sm:text-xl font-black text-[#261E58] dark:text-white leading-snug">
                      أكاديمية السودوكو الذكية
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed mt-1.5">
                      برنامج تعليمي متكامل لتعليم السودوكو من الصفر إلى الاحتراف مع مولد ألغاز عشوائي، نمط X القطري، ومساعد ذكي يوضح قواعد الاستنتاج.
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-white/70 dark:bg-black/20 border border-emerald-200/60 dark:border-emerald-900/50 space-y-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                    <div className="flex items-center gap-2">
                      <span className="text-amber-500">✔</span>
                      <span>توليد ديناميكي لشبكات 4×4 و 6×6 و 9×9 عشوائية</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-amber-500">✔</span>
                      <span>نمط سودوكو إكس (X) القطري والطباعة لـ PDF</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-amber-500">✔</span>
                      <span>مساعد ذكي يفسر خطوات الحل بالمنطق</span>
                    </div>
                  </div>
                </div>

                <Link
                  href="/sudoku"
                  onClick={() => playFx("pop")}
                  className="clay-btn-purple !from-teal-600 !to-emerald-700 w-full py-3.5 px-4 font-black text-sm flex items-center justify-center gap-2 shadow-lg !rounded-2xl group-hover:shadow-emerald-500/30"
                >
                  <span>دخول أكاديمية السودوكو</span>
                  <span className="text-base">⬅️</span>
                </Link>
              </div>
            )}

            {/* 4. أسرار الرياضيات */}
            {(hubCategory === "all" || hubCategory === "math") && (
              <div className="clay-card !p-5 sm:!p-6 bg-gradient-to-br from-white via-amber-50/50 to-yellow-50/70 dark:from-[#1E1B3E] dark:via-[#2E243F] dark:to-[#1B142D] border-2 border-amber-400/50 dark:border-amber-600/50 rounded-[2.2rem] shadow-xl flex flex-col justify-between space-y-4 hover:scale-[1.02] transition-all group">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 text-slate-950 flex items-center justify-center text-3xl shadow-lg border border-white/60 group-hover:scale-110 transition-transform">
                      ✨
                    </span>
                    <span className="text-xs font-black px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/70 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-700">
                      {secAccess.badgeAr}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg sm:text-xl font-black text-[#261E58] dark:text-white leading-snug">
                      أسرار الرياضيات (الفيدا)
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed mt-1.5">
                      حيل واختصارات الحساب الذهني الخارق للمتوسطة والإعدادية: الضرب المتقاطع، التربيع، الجذور، والكسور السريعة.
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-white/70 dark:bg-black/20 border border-amber-200/60 dark:border-amber-900/50 space-y-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                    <div className="flex items-center gap-2">
                      <span className="text-amber-500">✔</span>
                      <span>المستوى 1 و 2: أساسيات ومهارات الضرب الفوري</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-amber-500">✔</span>
                      <span>المستوى 3: التربيع والجذور التكعيبية والتربيعية</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-amber-500">✔</span>
                      <span>المستوى 4: الكسور والنسب المئوية ذهنياً</span>
                    </div>
                  </div>
                </div>

                {secAccess.isAccessible ? (
                  <Link
                    href="/secrets-of-numbers"
                    onClick={() => playFx("pop")}
                    className="clay-btn-amber w-full py-3.5 px-4 font-black text-sm flex items-center justify-center gap-2 shadow-lg !rounded-2xl group-hover:shadow-amber-500/30 text-slate-950"
                  >
                    <span>دخول أسرار الرياضيات</span>
                    <span className="text-base">⬅️</span>
                  </Link>
                ) : (
                  <Link
                    href="/secrets-of-numbers"
                    onClick={() => playFx("pop")}
                    className="clay-pill bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 w-full py-3.5 px-4 font-black text-sm flex items-center justify-center gap-2 shadow-sm !rounded-2xl"
                  >
                    <span>متاح للمدربين فقط — جاري التطوير 🔒</span>
                  </Link>
                )}
              </div>
            )}

            {/* 4. أسئلة وتحديات الذكاء */}
            {(hubCategory === "all" || hubCategory === "strategy") && (
              <div className="clay-card !p-5 sm:!p-6 bg-gradient-to-br from-white via-violet-50/50 to-purple-50/70 dark:from-[#1E1B3E] dark:via-[#291F4D] dark:to-[#1A1438] border-2 border-violet-500/40 dark:border-violet-500/50 rounded-[2.2rem] shadow-xl flex flex-col justify-between space-y-4 hover:scale-[1.02] transition-all group">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 text-white flex items-center justify-center text-3xl shadow-lg border border-white/40 group-hover:scale-110 transition-transform">
                      🧩
                    </span>
                    <span className="text-xs font-black px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/70 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-700">
                      {intelAccess.badgeAr}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg sm:text-xl font-black text-[#261E58] dark:text-white leading-snug">
                      أسئلة وتحديات الذكاء
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed mt-1.5">
                      تمارين واختبارات حية لتنمية مهارات التفكير المنطقي، حل المشكلات المعقدة، والبديهة الرياضية وأولمبياد كانغورو.
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-white/70 dark:bg-black/20 border border-violet-200/60 dark:border-violet-900/50 space-y-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                    <div className="flex items-center gap-2">
                      <span className="text-amber-500">✔</span>
                      <span>بنك أسئلة متدرج ومقسم حسب الصفوف</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-amber-500">✔</span>
                      <span>خطوات الحل والتحليل المنطقي فورياً</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-amber-500">✔</span>
                      <span>اختبارات الكانغورو والمسابقات التجريبية</span>
                    </div>
                  </div>
                </div>

                {intelAccess.isAccessible ? (
                  <Link
                    href="/intelligence"
                    onClick={() => playFx("pop")}
                    className="clay-btn-purple !from-violet-600 !to-purple-700 w-full py-3.5 px-4 font-black text-sm flex items-center justify-center gap-2 shadow-lg !rounded-2xl group-hover:shadow-violet-500/30"
                  >
                    <span>دخول تحديات الذكاء</span>
                    <span className="text-base">⬅️</span>
                  </Link>
                ) : (
                  <Link
                    href="/intelligence"
                    onClick={() => playFx("pop")}
                    className="clay-pill bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 w-full py-3.5 px-4 font-black text-sm flex items-center justify-center gap-2 shadow-sm !rounded-2xl"
                  >
                    <span>متاح للمدربين فقط — جاري التطوير 🔒</span>
                  </Link>
                )}
              </div>
            )}

            {/* 5. أكاديمية الشطرنج */}
            {(hubCategory === "all" || hubCategory === "strategy") && (
              <div className="clay-card !p-5 sm:!p-6 bg-gradient-to-br from-white via-slate-50/50 to-indigo-50/70 dark:from-[#1E1B3E] dark:via-[#1F1E38] dark:to-[#17152B] border-2 border-indigo-500/40 dark:border-indigo-500/50 rounded-[2.2rem] shadow-xl flex flex-col justify-between space-y-4 hover:scale-[1.02] transition-all group">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-700 via-indigo-900 to-slate-900 text-white flex items-center justify-center text-3xl shadow-lg border border-white/40 group-hover:scale-110 transition-transform">
                      ♟️
                    </span>
                    <span className="text-xs font-black px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
                      {chessAccess.badgeAr}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg sm:text-xl font-black text-[#261E58] dark:text-white leading-snug">
                      أكاديمية الشطرنج التفاعلية
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed mt-1.5">
                      تعليم الشطرنج تدريجياً مع رقعة كلايمورفيزم ثلاثية الأبعاد، اللعب ضد محرك الذكاء الاصطناعي، وألغاز التكتيك وكش مات.
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-white/70 dark:bg-black/20 border border-indigo-200/60 dark:border-indigo-900/50 space-y-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                    <div className="flex items-center gap-2">
                      <span className="text-amber-500">✔</span>
                      <span>لعب تفاعلي ضد الذكاء الاصطناعي (3 صعوبات)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-amber-500">✔</span>
                      <span>منهج تكتيكي متدرج من حركات القطع للدفاع</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-amber-500">✔</span>
                      <span>بنك ألغاز وتكتيكات كش مات الموجهة</span>
                    </div>
                  </div>
                </div>

                {chessAccess.isAccessible ? (
                  <Link
                    href="/chess"
                    onClick={() => playFx("pop")}
                    className="clay-btn-purple !from-indigo-600 !to-indigo-800 w-full py-3.5 px-4 font-black text-sm flex items-center justify-center gap-2 shadow-lg !rounded-2xl group-hover:shadow-indigo-500/30"
                  >
                    <span>دخول أكاديمية الشطرنج (وضع الأدمن)</span>
                    <span className="text-base">⬅️</span>
                  </Link>
                ) : (
                  <Link
                    href="/chess"
                    onClick={() => playFx("pop")}
                    className="clay-pill bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 w-full py-3.5 px-4 font-black text-sm flex items-center justify-center gap-2 shadow-sm !rounded-2xl"
                  >
                    <span>قريباً في التحديث القادم ⏳</span>
                  </Link>
                )}
              </div>
            )}

            {/* 6. مكعب روبيك */}
            {(hubCategory === "all" || hubCategory === "strategy") && (
              <div className="clay-card !p-5 sm:!p-6 bg-gradient-to-br from-white via-cyan-50/50 to-blue-50/70 dark:from-[#1E1B3E] dark:via-[#19243E] dark:to-[#131B30] border-2 border-blue-500/40 dark:border-blue-500/50 rounded-[2.2rem] shadow-xl flex flex-col justify-between space-y-4 hover:scale-[1.02] transition-all group">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-600 text-white flex items-center justify-center text-3xl shadow-lg border border-white/40 group-hover:scale-110 transition-transform">
                      🧊
                    </span>
                    <span className="text-xs font-black px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
                      {rubiksAccess.badgeAr}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg sm:text-xl font-black text-[#261E58] dark:text-white leading-snug">
                      مكعب روبيك العالمي
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed mt-1.5">
                      برنامج تعليمي متكامل يشمل دورة LBL لحل الطبقات السبع، مكتبة خوارزميات CFOP، ومؤقت WCA لبطولات السرعة.
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-white/70 dark:bg-black/20 border border-blue-200/60 dark:border-blue-900/50 space-y-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                    <div className="flex items-center gap-2">
                      <span className="text-amber-500">✔</span>
                      <span>مكعب 3D تفاعلي يدعم الدوران الحر باللمس</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-amber-500">✔</span>
                      <span>أكاديمية المراحل السبع بالرسوم المتحركة</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-amber-500">✔</span>
                      <span>مؤقت WCA مع فحص 15 ثانية واحتساب Ao5</span>
                    </div>
                  </div>
                </div>

                {rubiksAccess.isAccessible ? (
                  <Link
                    href="/rubiks-cube"
                    onClick={() => playFx("pop")}
                    className="clay-btn-purple !from-blue-600 !to-indigo-700 w-full py-3.5 px-4 font-black text-sm flex items-center justify-center gap-2 shadow-lg !rounded-2xl group-hover:shadow-blue-500/30"
                  >
                    <span>دخول مكعب روبيك (وضع الأدمن)</span>
                    <span className="text-base">⬅️</span>
                  </Link>
                ) : (
                  <Link
                    href="/rubiks-cube"
                    onClick={() => playFx("pop")}
                    className="clay-pill bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 w-full py-3.5 px-4 font-black text-sm flex items-center justify-center gap-2 shadow-sm !rounded-2xl"
                  >
                    <span>قريباً في التحديث القادم ⏳</span>
                  </Link>
                )}
              </div>
            )}

            {/* 7. ألعاب العقل والمنطق */}
            {(hubCategory === "all" || hubCategory === "tech") && (
              <div className="clay-card !p-5 sm:!p-6 bg-gradient-to-br from-white via-rose-50/50 to-pink-50/70 dark:from-[#1E1B3E] dark:via-[#2E1D33] dark:to-[#1F1325] border-2 border-rose-500/40 dark:border-rose-500/50 rounded-[2.2rem] shadow-xl flex flex-col justify-between space-y-4 hover:scale-[1.02] transition-all group">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 via-pink-600 to-purple-600 text-white flex items-center justify-center text-3xl shadow-lg border border-white/40 group-hover:scale-110 transition-transform">
                      🧠
                    </span>
                    <span className="text-xs font-black px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
                      {brainAccess.badgeAr}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg sm:text-xl font-black text-[#261E58] dark:text-white leading-snug">
                      ألعاب العقل والمنطق
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed mt-1.5">
                      مجموعة ألعاب وألغاز منطقية ورياضية وبصرية لتنمية مهارات التفكير والاستنتاج وحل المشكلات بمستويات متدرجة.
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-white/70 dark:bg-black/20 border border-rose-200/60 dark:border-rose-900/50 space-y-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                    <div className="flex items-center gap-2">
                      <span className="text-amber-500">✔</span>
                      <span>أبراج هانوي مع احتساب الحد الأدنى للحركات</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-amber-500">✔</span>
                      <span>مصفوفات رافن المتدرجة للأنماط الهندسية</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-amber-500">✔</span>
                      <span>ميزان المنطق والكتل والاستنتاج الاستنباطي</span>
                    </div>
                  </div>
                </div>

                {brainAccess.isAccessible ? (
                  <Link
                    href="/brain-games"
                    onClick={() => playFx("pop")}
                    className="clay-btn-purple !from-rose-600 !to-pink-700 w-full py-3.5 px-4 font-black text-sm flex items-center justify-center gap-2 shadow-lg !rounded-2xl group-hover:shadow-rose-500/30"
                  >
                    <span>دخول ألعاب العقل (وضع الأدمن)</span>
                    <span className="text-base">⬅️</span>
                  </Link>
                ) : (
                  <Link
                    href="/brain-games"
                    onClick={() => playFx("pop")}
                    className="clay-pill bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 w-full py-3.5 px-4 font-black text-sm flex items-center justify-center gap-2 shadow-sm !rounded-2xl"
                  >
                    <span>قريباً في التحديث القادم ⏳</span>
                  </Link>
                )}
              </div>
            )}

            {/* 9. البرمجة والذكاء الاصطناعي */}
            {(hubCategory === "all" || hubCategory === "tech") && (
              <div className="clay-card !p-5 sm:!p-6 bg-gradient-to-br from-white via-fuchsia-50/50 to-purple-50/70 dark:from-[#1E1B3E] dark:via-[#2B1B3C] dark:to-[#1E132D] border-2 border-fuchsia-500/40 dark:border-fuchsia-500/50 rounded-[2.2rem] shadow-xl flex flex-col justify-between space-y-4 hover:scale-[1.02] transition-all group">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="w-14 h-14 rounded-2xl bg-gradient-to-br from-fuchsia-600 via-purple-600 to-indigo-700 text-white flex items-center justify-center text-3xl shadow-lg border border-white/40 group-hover:scale-110 transition-transform">
                      💻
                    </span>
                    <span className="text-xs font-black px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
                      {codingAccess.badgeAr}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg sm:text-xl font-black text-[#261E58] dark:text-white leading-snug">
                      البرمجة والذكاء الاصطناعي
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed mt-1.5">
                      برنامج تعليمي للأطفال يبدأ بالتفكير الخوارزمي وبرمجة الروبوت، ويتدرج إلى تدريب نماذج الذكاء الاصطناعي وهندسة الأوامر.
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-white/70 dark:bg-black/20 border border-fuchsia-200/60 dark:border-fuchsia-900/50 space-y-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                    <div className="flex items-center gap-2">
                      <span className="text-amber-500">✔</span>
                      <span>متاهة الروبوت مع كتل الأوامر والتكرار</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-amber-500">✔</span>
                      <span>مختبر تدريب نماذج الآلة (Classifier Lab)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-amber-500">✔</span>
                      <span>مختبر هندسة الأوامر الذكية (Prompt Lab)</span>
                    </div>
                  </div>
                </div>

                {codingAccess.isAccessible ? (
                  <Link
                    href="/kids-coding"
                    onClick={() => playFx("pop")}
                    className="clay-btn-purple !from-fuchsia-600 !to-purple-700 w-full py-3.5 px-4 font-black text-sm flex items-center justify-center gap-2 shadow-lg !rounded-2xl group-hover:shadow-fuchsia-500/30"
                  >
                    <span>دخول البرمجة والذكاء الاصطناعي (وضع الأدمن)</span>
                    <span className="text-base">⬅️</span>
                  </Link>
                ) : (
                  <Link
                    href="/kids-coding"
                    onClick={() => playFx("pop")}
                    className="clay-pill bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 w-full py-3.5 px-4 font-black text-sm flex items-center justify-center gap-2 shadow-sm !rounded-2xl"
                  >
                    <span>قريباً في التحديث القادم ⏳</span>
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. VIEW FOR: أولاً: قسم الحساب الذهني                                      */}
      {/* ========================================================================= */}
      {activeProgram === "mental-math" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* شريط ملاحة علوي سريع لأقسام الحساب الذهني */}
          <div className="clay-card !p-3 sm:!p-4 bg-white/95 dark:bg-[#1E1B3E]/95 border-2 border-brand-500/25 dark:border-brand-500/35 rounded-2xl sm:rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  playFx("pop");
                  setActiveProgram("hub");
                }}
                className="clay-pill px-3.5 py-2 text-xs font-black text-brand-700 dark:text-brand-300 flex items-center gap-1.5 hover:scale-105 active:scale-95 transition-all shadow-sm"
              >
                <ArrowRight className="w-4 h-4 text-brand-600" />
                <span>العودة لكبسولات البرامج 🚀</span>
              </button>
              <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />
              <div className="flex items-center gap-2">
                <span className="text-xl">🧮</span>
                <span className="text-xs sm:text-sm font-black text-[#261E58] dark:text-white">
                  أقسام الحساب الذهني والسوروبان (6 أقسام)
                </span>
              </div>
            </div>

            {/* مفاتيح التبديل السريعة العلوية */}
            <div className="flex items-center gap-1.5 bg-[#F6F4FE] dark:bg-[#14122B] p-1 rounded-2xl border border-[#E6E2FA] dark:border-[#2E2B57] self-start md:self-auto">
              <button
                type="button"
                onClick={() => setActiveProgram("mental-math")}
                className="px-3 py-1.5 rounded-xl text-xs font-black clay-btn-purple !rounded-xl"
              >
                🧮 الحساب الذهني
              </button>
              <Link
                href="/intelligence"
                onClick={() => playFx("pop")}
                className="px-3 py-1.5 rounded-xl text-xs font-extrabold text-[#5E5985] dark:text-[#BEB9E2] hover:bg-white dark:hover:bg-[#232046] transition-all"
              >
                🧩 أسئلة الذكاء
              </Link>
              <Link
                href="/secrets-of-numbers"
                onClick={() => playFx("pop")}
                className="px-3 py-1.5 rounded-xl text-xs font-extrabold text-[#5E5985] dark:text-[#BEB9E2] hover:bg-white dark:hover:bg-[#232046] transition-all"
              >
                ✨ أسرار الرياضيات
              </Link>
            </div>
          </div>
          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
            {tabs.map((tab) => {
              const active = filter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setFilter(tab.id);
                    playFx("toggle");
                  }}
                  className={`px-5 py-2.5 text-xs sm:text-sm font-black transition-all active:scale-95 ${
                    active
                      ? "clay-btn-purple !rounded-full shadow-md"
                      : "clay-pill text-[#4C4578] dark:text-[#D9D5F5] hover:text-brand-600"
                  }`}
                >
                  {isEn ? tab.enLabel : tab.label}
                </button>
              );
            })}
          </div>

          {/* Clean Illustrated Soft 3D Adventure Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {visibleModules.map((mod, idx) => (
              <motion.div
                key={mod.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28, delay: Math.min(idx * 0.04, 0.28) }}
                className={`group relative overflow-hidden rounded-[30px] border p-5 sm:p-6 flex flex-col justify-between text-center shadow-[0_14px_30px_-10px_rgba(68,52,138,0.12),inset_0_3px_5px_rgba(255,255,255,0.95)] dark:shadow-[0_14px_30px_-10px_rgba(4,3,15,0.6),inset_0_2px_4px_rgba(167,153,255,0.1)] transition-all duration-300 ease-out hover:-translate-y-1.5 active:scale-[0.98] ${mod.cardSurface} ${mod.hoverRing}`}
              >
                {/* Full-Card Clickable Link Overlay */}
                <Link
                  href={mod.href}
                  onClick={() => playFx("pop")}
                  aria-label={`${isEn ? mod.enTitle : mod.title} - ${isEn ? mod.enCta : mod.cta}`}
                  className="absolute inset-0 z-10 rounded-[30px] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/40"
                />

                {/* Top Subtle Badge */}
                <div className="relative flex justify-center mb-3 pointer-events-none">
                  <span className="clay-pill px-3 py-1 text-[11px] font-black text-[#3F3A66] dark:text-[#E5E2FA]">
                    {isEn ? mod.enBadge : mod.badge}
                  </span>
                </div>

                {/* Big Illustrated 3D Icon Stage + Compact "معلومات القسم" (i) Button */}
                <div className="flex flex-col items-center gap-3 my-2">
                  <div
                    className={`pointer-events-none w-24 h-24 rounded-[28px] bg-gradient-to-br ${mod.stageBg} flex items-center justify-center shadow-[inset_0_2px_6px_rgba(255,255,255,0.85),0_10px_20px_-8px_rgba(48,35,118,0.16)] dark:shadow-[inset_0_2px_6px_rgba(255,255,255,0.08),0_10px_20px_-8px_rgba(0,0,0,0.45)] transition-transform duration-300 group-hover:scale-105`}
                  >
                    <ClayIcon
                      name={mod.icon}
                      tone={mod.tone}
                      size="xl"
                      className={mod.iconMotion}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      playFx("modal_open");
                      setSelectedModule(mod);
                    }}
                    aria-label={
                      isEn
                        ? `Section info: ${mod.enTitle}`
                        : `معلومات القسم: ${mod.title}`
                    }
                    className="relative z-20 clay-pill inline-flex items-center gap-1.5 px-3.5 py-1.5 text-[11px] font-extrabold text-[#4E477A] dark:text-[#DAD6F7] hover:text-brand-600 dark:hover:text-white hover:scale-105 active:scale-95 transition-all"
                  >
                    <Info className="w-3.5 h-3.5 text-brand-500 dark:text-brand-300" />
                    <span>{isEn ? "Section Info" : "معلومات القسم"}</span>
                  </button>
                </div>

                {/* Crisp Title & Single-Line Motivating Description */}
                <div className="pointer-events-none space-y-1.5 mt-3 mb-5">
                  <h2 className="text-lg sm:text-xl font-black text-[#1E1B3A] dark:text-white leading-snug">
                    {isEn ? mod.enTitle : mod.title}
                  </h2>
                  <p className="text-xs font-semibold text-[#5E5985] dark:text-[#BEB9E2] line-clamp-1">
                    {isEn ? mod.enShortTagline : mod.shortTagline}
                  </p>
                </div>

                {/* Clear Visual CTA Strip */}
                <div
                  className={`pointer-events-none w-full flex items-center justify-between px-4 py-2.5 rounded-2xl transition-all shadow-xs font-black text-xs sm:text-sm ${mod.ctaBg}`}
                >
                  <span>{isEn ? mod.enCta : mod.cta}</span>
                  <ClayActionCircle
                    variant="play"
                    size="sm"
                    theme={mod.actionTheme}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. VIEW FOR: ثانياً: قسم أسئلة وتحديات الذكاء                             */}
      {/* ========================================================================= */}
      {activeProgram === "intelligence" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* شريط ملاحة علوي سريع لقسم الذكاء */}
          <div className="clay-card !p-3 sm:!p-4 bg-white/95 dark:bg-[#1E1B3E]/95 border-2 border-violet-500/25 dark:border-violet-500/35 rounded-2xl sm:rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  playFx("pop");
                  setActiveProgram("hub");
                }}
                className="clay-pill px-3.5 py-2 text-xs font-black text-brand-700 dark:text-brand-300 flex items-center gap-1.5 hover:scale-105 active:scale-95 transition-all shadow-sm"
              >
                <ArrowRight className="w-4 h-4 text-brand-600" />
                <span>العودة لكبسولات البرامج 🚀</span>
              </button>
              <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />
              <div className="flex items-center gap-2">
                <span className="text-xl">🧩</span>
                <span className="text-xs sm:text-sm font-black text-[#261E58] dark:text-white">
                  أسئلة وتحديات الذكاء والأولمبياد
                </span>
              </div>
            </div>

            {/* مفاتيح التبديل السريعة العلوية */}
            <div className="flex items-center gap-1.5 bg-[#F6F4FE] dark:bg-[#14122B] p-1 rounded-2xl border border-[#E6E2FA] dark:border-[#2E2B57] self-start md:self-auto">
              <button
                type="button"
                onClick={() => setActiveProgram("mental-math")}
                className="px-3 py-1.5 rounded-xl text-xs font-extrabold text-[#5E5985] dark:text-[#BEB9E2] hover:bg-white dark:hover:bg-[#232046] transition-all"
              >
                🧮 الحساب الذهني
              </button>
              <button
                type="button"
                onClick={() => setActiveProgram("intelligence")}
                className="px-3 py-1.5 rounded-xl text-xs font-black clay-btn-purple !rounded-xl"
              >
                🧩 أسئلة الذكاء
              </button>
              <button
                type="button"
                onClick={() => setActiveProgram("vedic")}
                className="px-3 py-1.5 rounded-xl text-xs font-extrabold text-[#5E5985] dark:text-[#BEB9E2] hover:bg-white dark:hover:bg-[#232046] transition-all"
              >
                ✨ أسرار الرياضيات
              </button>
            </div>
          </div>
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-violet-50 via-purple-50 to-indigo-50 dark:from-violet-950/40 dark:via-purple-950/40 dark:to-indigo-950/40 border border-violet-200 dark:border-violet-800 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
            <div className="space-y-2 text-center md:text-start">
              <span className="text-xs font-black px-3 py-1 rounded-full bg-violet-600 text-white">
                أولمبياد كانغارو والتفكير المنطقي 🧩
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-[#261E58] dark:text-white">
                بنك أسئلة الذكاء لجميع الصفوف المدرسية
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-xl">
                مسائل تفكير ذكية مختارة بعناية لقياس الاستنتاج المنطقي، الأنماط الهندسية، والبديهة الرياضية مع شرح فوري لخطوات الحل.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link
                href="/intelligence/quiz"
                onClick={() => playFx("pop")}
                className="clay-btn-purple px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2 shadow-lg"
              >
                <span>بدء تدريب الذكاء الشامل</span>
                <Play className="w-4 h-4 fill-current" />
              </Link>
              <Link
                href="/intelligence"
                onClick={() => playFx("pop")}
                className="clay-pill px-5 py-3 text-xs font-bold"
              >
                <span>استعراض الفروع والصفوف</span>
              </Link>
            </div>
          </div>

          {/* Grade Level Branches Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {INTELLIGENCE_BRANCHES.map((branch) => (
              <div
                key={branch.id}
                className="clay-card !p-6 bg-white dark:bg-[#1E1B3E] border border-violet-200/80 dark:border-violet-800/60 rounded-3xl flex flex-col justify-between space-y-4 shadow-sm"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="clay-pill px-3 py-1 text-xs font-black text-brand-700 dark:text-brand-300 flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4" />
                      <span>{branch.gradesText}</span>
                    </span>
                    <span className="text-xs text-slate-500 font-bold flex items-center gap-1 font-mono">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      <span>{branch.durationMinutes} دقيقة</span>
                    </span>
                  </div>

                  <h4 className="text-lg font-black text-slate-900 dark:text-white">
                    {branch.title}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {branch.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {branch.sampleTopics.map((topic, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        <span>{topic}</span>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                  <Link
                    href={`/intelligence/quiz?level=${branch.gradeCode}`}
                    onClick={() => playFx("pop")}
                    className="clay-btn-purple w-full py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-2"
                  >
                    <span>ابدأ اختبار {branch.gradesText}</span>
                    <ArrowLeft className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. VIEW FOR: ثالثاً: قسم أسرار الرياضيات                                  */}
      {/* ========================================================================= */}
      {activeProgram === "vedic" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* شريط ملاحة علوي سريع لقسم أسرار الرياضيات */}
          <div className="clay-card !p-3 sm:!p-4 bg-white/95 dark:bg-[#1E1B3E]/95 border-2 border-amber-400/30 dark:border-amber-600/30 rounded-2xl sm:rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  playFx("pop");
                  setActiveProgram("hub");
                }}
                className="clay-pill px-3.5 py-2 text-xs font-black text-brand-700 dark:text-brand-300 flex items-center gap-1.5 hover:scale-105 active:scale-95 transition-all shadow-sm"
              >
                <ArrowRight className="w-4 h-4 text-brand-600" />
                <span>العودة لكبسولات البرامج 🚀</span>
              </button>
              <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />
              <div className="flex items-center gap-2">
                <span className="text-xl">✨</span>
                <span className="text-xs sm:text-sm font-black text-[#261E58] dark:text-white">
                  أسرار الرياضيات ورياضيات الفيدا (4 مستويات)
                </span>
              </div>
            </div>

            {/* مفاتيح التبديل السريعة العلوية */}
            <div className="flex items-center gap-1.5 bg-[#F6F4FE] dark:bg-[#14122B] p-1 rounded-2xl border border-[#E6E2FA] dark:border-[#2E2B57] self-start md:self-auto">
              <button
                type="button"
                onClick={() => setActiveProgram("mental-math")}
                className="px-3 py-1.5 rounded-xl text-xs font-extrabold text-[#5E5985] dark:text-[#BEB9E2] hover:bg-white dark:hover:bg-[#232046] transition-all"
              >
                🧮 الحساب الذهني
              </button>
              <button
                type="button"
                onClick={() => setActiveProgram("intelligence")}
                className="px-3 py-1.5 rounded-xl text-xs font-extrabold text-[#5E5985] dark:text-[#BEB9E2] hover:bg-white dark:hover:bg-[#232046] transition-all"
              >
                🧩 أسئلة الذكاء
              </button>
              <button
                type="button"
                onClick={() => setActiveProgram("vedic")}
                className="px-3 py-1.5 rounded-xl text-xs font-black clay-btn-amber !rounded-xl text-slate-950"
              >
                ✨ أسرار الرياضيات
              </button>
            </div>
          </div>
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-950/40 dark:via-orange-950/40 dark:to-yellow-950/40 border border-amber-300 dark:border-amber-700/60 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
            <div className="space-y-2 text-center md:text-start">
              <span className="text-xs font-black px-3 py-1 rounded-full bg-amber-500 text-slate-950">
                منهج الفيدا والحساب الذهني السريع (4 مستويات) ✨
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-amber-950 dark:text-amber-100">
                أكاديمية أسرار الأرقام والرياضيات
              </h3>
              <p className="text-xs sm:text-sm text-amber-900/80 dark:text-amber-300 max-w-xl">
                20 قاعدة تعليمية وتطبيقية مؤكدة رياضياً لحل أصعب العمليات في ثوانٍ معدودة. اختر أي درس لفتحه وتجربته واختبار سرعتك فيه!
              </p>
            </div>

            <Link
              href="/secrets-of-numbers"
              onClick={() => playFx("pop")}
              className="clay-btn-amber px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2 shadow-lg shrink-0"
            >
              <span>فتح الأكاديمية بالكامل (20 درساً) 🚀</span>
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>

          {/* 4 Levels Preview Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {VEDIC_LEVELS.map((level) => (
              <div
                key={level.id}
                className="clay-card !p-6 bg-white dark:bg-[#1E1B3E] border border-amber-200 dark:border-amber-800 rounded-3xl flex flex-col justify-between space-y-4 shadow-sm"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 font-black text-sm flex items-center justify-center shadow-sm">
                      {level.id}
                    </span>
                    <span className="text-xs text-slate-500 font-bold">
                      {level.lessons.length} دروس معتمدة
                    </span>
                  </div>

                  <h4 className="text-lg font-black text-slate-900 dark:text-white">
                    {level.titleAr}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {level.taglineAr}
                  </p>

                  <div className="space-y-1.5 pt-1">
                    {level.lessons.slice(0, 3).map((lesson) => (
                      <button
                        key={lesson.id}
                        type="button"
                        onClick={() => {
                          playFx("modal_open");
                          setActiveVedicLesson(lesson);
                        }}
                        className="w-full text-right p-2.5 rounded-xl bg-[#F8F6FE] dark:bg-[#25214D] hover:bg-brand-50 text-xs font-black text-slate-800 dark:text-slate-200 flex items-center justify-between transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          <span>{lesson.icon}</span>
                          <span>{lesson.titleAr}</span>
                        </span>
                        <span className="text-[10px] text-brand-600 dark:text-brand-300 font-bold">
                          فتح الدرس ⬅
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                  <Link
                    href={`/secrets-of-numbers`}
                    onClick={() => playFx("pop")}
                    className="clay-pill w-full py-2.5 text-xs font-black flex items-center justify-center gap-2 text-amber-900 dark:text-amber-200"
                  >
                    <span>استعراض جميع دروس المستوى {level.id}</span>
                    <ChevronLeft className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3D Claymorphism Section Info Modal for Mental Modules */}
      <AnimatePresence>
        {selectedModule && (
          <motion.div
            key="module-info-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeModal}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#120F29]/65 backdrop-blur-sm p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="module-modal-title"
          >
            <motion.div
              key={selectedModule.id}
              initial={{ opacity: 0, scale: 0.92, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 12 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              className="clay-card relative w-full max-w-xl max-h-[90vh] overflow-y-auto !p-0 border-2 border-white/80 dark:border-[#382E6E] shadow-2xl bg-white dark:bg-[#1C183D] rounded-[32px]"
            >
              {/* Modal Colored Header */}
              <div
                className={`p-6 sm:p-7 bg-gradient-to-r ${selectedModule.modalHeaderBg} text-white rounded-t-[30px] relative`}
              >
                <button
                  type="button"
                  onClick={closeModal}
                  aria-label={isEn ? "Close" : "إغلاق"}
                  className="absolute top-4 end-4 w-9 h-9 rounded-full bg-white/25 hover:bg-white/35 border border-white/30 flex items-center justify-center text-white transition-transform hover:scale-105 active:scale-95"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-4 pe-8">
                  <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md border border-white/35 flex items-center justify-center shrink-0 shadow-md">
                    <ClayIcon
                      name={selectedModule.icon}
                      tone={selectedModule.tone}
                      size="lg"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="inline-block px-3 py-0.5 rounded-full bg-white/25 text-[11px] font-black">
                      {isEn ? selectedModule.enBadge : selectedModule.badge}
                    </span>
                    <h3
                      id="module-modal-title"
                      className="text-xl sm:text-2xl font-black leading-tight"
                    >
                      {isEn ? selectedModule.enTitle : selectedModule.title}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Modal Body: Full Description + Educational Features */}
              <div className="p-6 sm:p-7 space-y-5 text-start">
                <p className="text-sm text-[#433E68] dark:text-[#DAD6F7] leading-relaxed font-medium">
                  {isEn ? selectedModule.enDesc : selectedModule.desc}
                </p>

                <div className="space-y-2.5">
                  <div className="text-xs font-black text-brand-600 dark:text-brand-300">
                    {isEn ? "Key Learning Benefits:" : "أبرز المميزات التعليمية:"}
                  </div>
                  <ul className="space-y-2">
                    {(isEn
                      ? selectedModule.enBullets
                      : selectedModule.bullets
                    ).map((bullet, i) => (
                      <li
                        key={i}
                        className="clay-card-sm bg-[#F8F7FE] dark:bg-[#242146] px-3.5 py-2.5 flex items-start gap-2.5 text-xs sm:text-sm font-semibold text-[#2E2759] dark:text-[#F5F4FD]"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Modal Action Footer */}
                <div className="pt-2 flex items-center gap-3">
                  <Link
                    href={selectedModule.href}
                    onClick={() => {
                      playFx("pop");
                      setSelectedModule(null);
                    }}
                    className="clay-btn-purple flex-1 py-3.5 px-5 font-black text-sm flex items-center justify-center gap-2"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>
                      {isEn ? selectedModule.enCta : selectedModule.cta}
                    </span>
                  </Link>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="clay-btn-secondary px-5 py-3.5 font-extrabold text-sm"
                  >
                    {isEn ? "Close" : "إغلاق"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Vedic Lesson Modal Viewer */}
      {activeVedicLesson && (
        <VedicLessonModal
          lesson={activeVedicLesson}
          onClose={() => setActiveVedicLesson(null)}
        />
      )}
    </div>
  );
}
