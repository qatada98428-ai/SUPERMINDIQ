"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Info, X, Play } from "lucide-react";
import { useApp } from "@/context/AppContext";
import ClayIcon, { ClayBadgeTone, ClayIconName } from "@/components/design-system/ClayIcon";
import {
  ClayActionCircle,
  ClayActionTheme,
} from "@/components/design-system/ClayMotion";

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
  const isEn = language === "en";
  const [filter, setFilter] = useState<CategoryFilter>("all");
  const [selectedModule, setSelectedModule] = useState<MentalModule | null>(null);

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
      shortTagline: "تعلّم قواعد السوروبان من الصفر خطوة بخطوة",
      enShortTagline: "Learn Soroban rules step by step from zero",
      desc: "شرح تفصيلي متدرج يبدأ من أهمية الحساب الذهني في عصر التكنولوجيا، تمثيل الأرقام على المعداد، الجمع والطرح البسيط، مكملات الخمسة والعشرة، وحتى الضرب والقسمة مع معداد حي متحرك.",
      enDesc: "Step-by-step illustrated curriculum starting from mental math basics, bead representation, simple operations, 5 & 10 complements, up to multiplication and division with a live Soroban.",
      badge: "10 مراحل شاملة 📖",
      enBadge: "10 Stages 📖",
      icon: "book",
      tone: "lavender",
      actionTheme: "purple",
      cardSurface:
        "bg-gradient-to-br from-white via-[#FAF8FF] to-[#EFEAFF] dark:from-[#1E1B3E] dark:via-[#1C1A3A] dark:to-[#2B2258] border-[#E0D6FF] dark:border-[#493D8A]/70",
      hoverRing:
        "hover:border-[#7C5CFC] hover:shadow-[0_22px_40px_-10px_rgba(124,92,252,0.28)]",
      stageBg: "from-[#F3EEFF] to-[#E4DAFF] dark:from-[#2C255A] dark:to-[#211C45]",
      modalHeaderBg: "from-[#8B6EFF] to-[#6344F5]",
      ctaBg: "bg-[#F2EEFF] hover:bg-[#E7DFFF] dark:bg-[#2B245A] dark:hover:bg-[#352C6E] text-[#5B3CE8] dark:text-[#C5B6FF]",
      iconMotion:
        "group-hover:-translate-y-1.5 group-hover:-rotate-6 group-hover:scale-110",
      bullets: [
        "شرح مبسط مدعوم بمعداد فيزيائي يوضح تمثيل كل قاعدة",
        "أمثلة تطبيقية واختبارات قياس استيعاب فورية",
        "تدرّج واضح يناسب المبتدئين وحتى المستويات المتقدمة",
      ],
      enBullets: [
        "Visual Soroban demonstrations illustrating every rule",
        "Worked examples and instant comprehension checks",
        "Smooth progression from beginner to advanced levels",
      ],
      cta: "ابدأ التعلم",
      enCta: "Start Learning",
    },
    {
      id: "abacus",
      category: "basics",
      href: "/mental-arithmetic/abacus",
      title: "المعداد الحر (السوروبان)",
      enTitle: "Interactive Soroban",
      shortTagline: "حرّك خرزات 3D باللمس وشكّل الأرقام بمتعة",
      enShortTagline: "Slide 3D beads smoothly by touch and build numbers",
      desc: "لوحة معداد ياباني ثلاثية الأبعاد مفتوحة بالكامل؛ تحريك سلس باللمس والسحب والنقر، تصفير بضغطة زر، وتدريب حر على تشكيل الأرقام وإجراء العمليات الحسابية.",
      enDesc: "Realistic 3D Japanese Soroban simulation supporting smooth touch dragging, 3 to 17 custom columns, one-tap reset, and target number challenges.",
      badge: "3 إلى 17 عموداً 🧮",
      enBadge: "3-17 Rods 🧮",
      icon: "soroban",
      tone: "peach",
      actionTheme: "orange",
      cardSurface:
        "bg-gradient-to-br from-white via-[#FFFBF5] to-[#FFF0D8] dark:from-[#1E1B3E] dark:via-[#1C1A3A] dark:to-[#352414] border-[#F9DFBA] dark:border-[#6B4720]/70",
      hoverRing:
        "hover:border-[#F59E0B] hover:shadow-[0_22px_40px_-10px_rgba(245,158,11,0.28)]",
      stageBg: "from-[#FFF6E5] to-[#FFE4BA] dark:from-[#432B14] dark:to-[#2F1D0C]",
      modalHeaderBg: "from-[#FFA94D] to-[#EA6D15]",
      ctaBg: "bg-[#FFF3DE] hover:bg-[#FFE8C2] dark:bg-[#3A2815] dark:hover:bg-[#49321A] text-[#C8640A] dark:text-[#FCD34D]",
      iconMotion:
        "group-hover:-translate-y-1.5 group-hover:rotate-6 group-hover:scale-110",
      bullets: [
        "يبدأ بالشكل الرسمي (3 أعمدة) مع إمكانية التوسيع حتى 17 عموداً",
        "تحريك سلس لخرزات 3D باللمس والسحب مع صوت نقر ناعم",
        "وضع التحدي والهدف (Target Mode) لاختبار تمثيل الأرقام",
      ],
      enBullets: [
        "Starts with 3 official columns and expands up to 17 rods",
        "Realistic 3D beads with smooth touch dragging and soft clicks",
        "Target challenge mode for interactive number practice",
      ],
      cta: "ابدأ التدريب",
      enCta: "Start Training",
    },
    {
      id: "flash-anzan",
      category: "speed",
      href: "/mental-arithmetic/flash-anzan",
      title: "فلاش أنزان السريع",
      enTitle: "Flash Anzan Trainer",
      shortTagline: "ومضات أرقام سريعة لتقوية التخيّل والبديهة",
      enShortTagline: "Rapid flashing numbers to build mental imagery",
      desc: "تمرين ومضات الأرقام المتلاحقة بسرعة قابلة للتخصيص من 0.2 ثانية إلى 3 ثوانٍ، مع دعم نطق الأرقام بالصوت العربي والإنكليزي، لتطوير التخيل الذهني والتركيز الفائق.",
      enDesc: "Flashing number trainer with customizable speeds from 0.2s to 3.0s, Arabic & English voice support, and photographic memory drills.",
      badge: "وميض سريع ⚡",
      enBadge: "Flash Speed ⚡",
      icon: "flash",
      tone: "gold",
      actionTheme: "gold",
      cardSurface:
        "bg-gradient-to-br from-white via-[#FFFCF2] to-[#FFF4CF] dark:from-[#1E1B3E] dark:via-[#1C1A3A] dark:to-[#332912] border-[#F8E29D] dark:border-[#6B541B]/70",
      hoverRing:
        "hover:border-[#EAB308] hover:shadow-[0_22px_40px_-10px_rgba(234,179,8,0.28)]",
      stageBg: "from-[#FFF9DC] to-[#FFE99C] dark:from-[#473410] dark:to-[#32240A]",
      modalHeaderBg: "from-[#FBBF24] to-[#D97706]",
      ctaBg: "bg-[#FFF6D6] hover:bg-[#FFECAD] dark:bg-[#3A2D12] dark:hover:bg-[#493918] text-[#B45309] dark:text-[#FDE047]",
      iconMotion:
        "group-hover:-translate-y-1.5 group-hover:scale-110 group-hover:rotate-3",
      bullets: [
        "تحكم مرن بالسرعة من 0.2 ثانية وحتى 3.0 ثوانٍ",
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
      title: "تحدي الفرق والبطولات",
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
      iconMotion:
        "group-hover:-translate-y-1.5 group-hover:scale-110",
      bullets: [
        "دعم المنافسة بين فريقين وحتى 5 فرق بنفس الوقت",
        "حساب نقاط مكافأة السرعة بالمللي ثانية لكل إجابة صحيحة",
        "مضمار سباق حي ومنصة تتويج احتفالية بالكؤوس",
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
      title: "محاكي المسابقة الرسمي",
      enTitle: "Competition Simulator",
      shortTagline: "اختبارات موقوتة تحاكي البطولات العالمية",
      enShortTagline: "Timed competition sheets mirroring world championships",
      desc: "محاكي أوراق المسابقات القياسية؛ اختر وقتاً محدداً (من 5 إلى 30 دقيقة) أو تايمر مفتوح، حدد عدد الأسئلة ومستوى القواعد، واحصل على تصحيح فوري وكشف تفصيلي بالنتائج.",
      enDesc: "Official tournament sheet simulator with configurable timers (5-30 min or stopwatch), multi-rule question groups, instant grading, and error review.",
      badge: "اختبار رسمي 🏅",
      enBadge: "Official 🏅",
      icon: "medal",
      tone: "indigo",
      actionTheme: "indigo",
      cardSurface:
        "bg-gradient-to-br from-white via-[#F6F8FF] to-[#E6ECFF] dark:from-[#1E1B3E] dark:via-[#1C1A3A] dark:to-[#1F2758] border-[#CBD6FF] dark:border-[#394794]/70",
      hoverRing:
        "hover:border-[#6366F1] hover:shadow-[0_22px_40px_-10px_rgba(99,102,241,0.28)]",
      stageBg: "from-[#ECF0FF] to-[#D1DCFF] dark:from-[#222B5C] dark:to-[#171E42]",
      modalHeaderBg: "from-[#818CF8] to-[#4F46E5]",
      ctaBg: "bg-[#EAEFFF] hover:bg-[#DCE4FF] dark:bg-[#232A5C] dark:hover:bg-[#2D3675] text-[#4338CA] dark:text-[#A5B4FC]",
      iconMotion:
        "group-hover:-translate-y-1.5 group-hover:scale-110 group-hover:rotate-3",
      bullets: [
        "مؤقت مرن من 5 إلى 30 دقيقة أو عداد مفتوح",
        "تصحيح آلي فوري مع كشف مراجعة الأخطاء وقابلية الطباعة",
        "مجموعات أسئلة متعددة المستويات والقواعد",
      ],
      enBullets: [
        "Flexible countdown (5-30m) or open stopwatch mode",
        "Instant automated grading with full mistake review",
        "Multi-rule question groups for championship prep",
      ],
      cta: "ابدأ التدريب",
      enCta: "Start Simulator",
    },
    {
      id: "balloon-pop",
      category: "competitions",
      href: "/mental-arithmetic/balloon-pop",
      title: "لعبة صيد البالونات",
      enTitle: "Balloon Pop Math",
      shortTagline: "احسب ذهنياً واصطد البالونة الصحيحة بسرعة!",
      enShortTagline: "Solve fast and pop the flying answer balloon!",
      desc: "تُعرض أرقام الفلاش أنزان مع نطق صوتي واضح، ثم تطير بالونات ملونة تحمل أرقاماً مختلفة — اصطد البالونة التي تحمل الإجابة الصحيحة قبل اختفائها!",
      enDesc: "Flash numbers appear with clear voice guidance, then colorful floating balloons rise — pop the matching answer balloon to score points!",
      badge: "لعبة ممتعة 🎈",
      enBadge: "Fun Game 🎈",
      icon: "game",
      tone: "pink",
      actionTheme: "rose",
      cardSurface:
        "bg-gradient-to-br from-white via-[#FFF7FA] to-[#FFE6EF] dark:from-[#1E1B3E] dark:via-[#1C1A3A] dark:to-[#3E192D] border-[#FCCADB] dark:border-[#752B4D]/70",
      hoverRing:
        "hover:border-[#F43F5E] hover:shadow-[0_22px_40px_-10px_rgba(244,63,94,0.28)]",
      stageBg: "from-[#FFF0F5] to-[#FFD4E3] dark:from-[#4A1B33] dark:to-[#331123]",
      modalHeaderBg: "from-[#FB7185] to-[#E11D48]",
      ctaBg: "bg-[#FFEAF1] hover:bg-[#FFD9E6] dark:bg-[#411B2E] dark:hover:bg-[#52223A] text-[#E11D48] dark:text-[#FDA4AF]",
      iconMotion:
        "group-hover:-translate-y-1.5 group-hover:-rotate-6 group-hover:scale-110",
      bullets: [
        "تحكم كامل بسرعة الوميض وقواعد البسيط ومركب 5 و 10",
        "تدعم اللعب الفردي أو التنافس الحماسي بين 4 فرق",
        "دمج رائع بين متعة الألعاب وتنمية سرعة الحساب",
      ],
      enBullets: [
        "Full control over speed and Soroban complement rules",
        "Supports solo play or exciting 4-team competition",
        "Combines playful arcade action with rapid mental math",
      ],
      cta: "ابدأ التدريب",
      enCta: "Play & Train",
    },
    {
      id: "multiplication",
      category: "basics",
      href: "/mental-arithmetic/multiplication",
      title: "محاكي الضرب والقسمة",
      enTitle: "Multiply & Divide",
      shortTagline: "أتقن جدول الضرب والعمليات الكبيرة حتى 5 مراتب",
      enShortTagline: "Master times tables and multi-digit Soroban ops",
      desc: "فعالية مميزة لاختبار وحفظ جدول الضرب من 1 إلى 10، متبوعة بمحاكي فيزيائي لتطبيق الضرب حتى 5 مراتب (تمثيل الأعداد يساراً وترحيل البواقي يميناً) والقسمة العكسية.",
      enDesc: "Qualification test for times tables 1-10 followed by a visual Soroban simulator for multi-digit multiplication and reverse division.",
      badge: "حتى 5 مراتب ✖️",
      enBadge: "Up to 5 Digits ✖️",
      icon: "plusMinus",
      tone: "emerald",
      actionTheme: "emerald",
      cardSurface:
        "bg-gradient-to-br from-white via-[#F5FEF9] to-[#E3FBEF] dark:from-[#1E1B3E] dark:via-[#1C1A3A] dark:to-[#133827] border-[#BFEFCE] dark:border-[#206644]/70",
      hoverRing:
        "hover:border-[#10B981] hover:shadow-[0_22px_40px_-10px_rgba(16,185,129,0.28)]",
      stageBg: "from-[#EAFCF1] to-[#BEF4D6] dark:from-[#13422B] dark:to-[#0C2D1D]",
      modalHeaderBg: "from-[#34D399] to-[#059669]",
      ctaBg: "bg-[#E6FAEF] hover:bg-[#D2F5E2] dark:bg-[#133A27] dark:hover:bg-[#1A4B33] text-[#059669] dark:text-[#6EE7B7]",
      iconMotion:
        "group-hover:-translate-y-1 group-hover:rotate-6 group-hover:scale-110",
      bullets: [
        "اختبار تأهيلي تفاعلي لحفظ جدول الضرب من 1 إلى 10",
        "محاكاة حية لترحيل البواقي وتوزيع الخانات على السوروبان",
        "تغطية كاملة لتمارين الضرب والقسمة العكسية",
      ],
      enBullets: [
        "Interactive times table qualification test (1 to 10)",
        "Visual rod-by-rod carry animation on the Soroban",
        "Full support for multi-digit multiplication & division",
      ],
      cta: "ابدأ التعلم",
      enCta: "Start Learning",
    },
    {
      id: "intelligence",
      category: "speed",
      href: "/intelligence",
      title: "أسئلة الذكاء والمنطق",
      enTitle: "IQ & Logic Puzzles",
      shortTagline: "ألغاز ومسائل أولمبياد تنمّي التفكير الإبداعي",
      enShortTagline: "Olympiad logic puzzles to spark creative thinking",
      desc: "بنك أسئلة واختبارات تفاعلية حية مقسمة حسب المراحل الدراسية لتعزيز التفكير المنطقي والهندسي وحل المعضلات الرياضية خطوة بخطوة.",
      enDesc: "Interactive question bank categorized by school grade levels to sharpen analytical, geometric, and logical problem solving.",
      badge: "تجريبي 🧠",
      enBadge: "Beta 🧠",
      icon: "brain",
      tone: "sky",
      actionTheme: "sky",
      cardSurface:
        "bg-gradient-to-br from-white via-[#F5FAFF] to-[#E5F2FF] dark:from-[#1E1B3E] dark:via-[#1C1A3A] dark:to-[#16304F] border-[#C6E1FF] dark:border-[#26548A]/70",
      hoverRing:
        "hover:border-[#3B82F6] hover:shadow-[0_22px_40px_-10px_rgba(59,130,246,0.28)]",
      stageBg: "from-[#EEF7FF] to-[#CCE5FF] dark:from-[#163458] dark:to-[#0F243F]",
      modalHeaderBg: "from-[#60A5FA] to-[#2563EB]",
      ctaBg: "bg-[#EAF4FF] hover:bg-[#D8EBFF] dark:bg-[#163050] dark:hover:bg-[#1E406A] text-[#2563EB] dark:text-[#7DD3FC]",
      iconMotion:
        "group-hover:-translate-y-1.5 group-hover:scale-110 group-hover:-rotate-3",
      bullets: [
        "أسئلة مصنفة بدقة حسب الصفوف والمراحل الدراسية",
        "تفسير واضح لخطوات الحل الذكي بعد كل سؤال",
        "تمارين أنماط وهندسة وتفكير منطقي تحفيزية",
      ],
      enBullets: [
        "Questions thoughtfully grouped by school grade level",
        "Clear step-by-step explanations after every answer",
        "Engaging pattern, geometry, and logic challenges",
      ],
      cta: "ابدأ التعلم",
      enCta: "Start Learning",
    },
  ];

  const visibleModules =
    filter === "all" ? modules : modules.filter((m) => m.category === filter);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Screen-2 Inspired Mint Hero Banner with Excited Kids, Trophy, Soroban & Chalkboard */}
      <div className="clay-banner-mint relative overflow-hidden p-6 sm:p-9">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-7 space-y-3 text-center lg:text-start">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/85 px-4 py-1 text-xs sm:text-sm font-black text-[#0F766E] shadow-sm">
              <ClayIcon name="math123" tone="none" size="xs" />
              <span>
                {isEn
                  ? "SUPER MIND Mental Arithmetic Hub"
                  : "منظومة الحساب الذهني | برنامج العقل الخارق"}
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#0F2F2E] tracking-tight leading-tight">
              {isEn
                ? "Let's Make Mental Math Fun!"
                : "أقسام الحساب الذهني والتدريب العقلي"}
            </h1>
            <p className="text-sm sm:text-base font-medium text-[#114542] leading-relaxed">
              {isEn
                ? "Pick your adventure card and start learning or training right away!"
                : "اختر مغامرتك التدريبية وابدأ التعلم والتدريب مباشرة بلمسة واحدة!"}
            </p>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-[24px] overflow-hidden shadow-clay border-2 border-white/60 aspect-video bg-[#65DDD0]">
              <Image
                src="/images/clay/math-fun-mascot.jpg"
                alt="طفل وطفلة متحمسين يحملان كأساً ومعداد سوروبان بجانب السبورة"
                width={960}
                height={540}
                priority
                className="w-full h-full object-cover"
              />
            </div>
          </div>
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
                  ? "clay-btn-purple !rounded-full"
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
            {/* Full-Card Clickable Link Overlay (Valid Semantic HTML, Card-Wide Tap Target) */}
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

            {/* Clear Visual "ابدأ التعلم / ابدأ التدريب" CTA Strip */}
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

      {/* 3D Claymorphism Section Info Modal */}
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
              transition={{ type: "spring", stiffness: 280, damping: 24 }}
              onClick={(e) => e.stopPropagation()}
              className="clay-card w-full max-w-lg overflow-hidden p-0"
            >
              {/* Colored 3D Header matched to Section Theme */}
              <div
                className={`relative bg-gradient-to-br ${selectedModule.modalHeaderBg} p-6 sm:p-7 text-white`}
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
    </div>
  );
}
