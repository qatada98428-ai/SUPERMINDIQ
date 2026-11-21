"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  MessageCircle,
  PlayCircle,
  ChevronLeft,
  Sparkles,
  User,
  ShieldCheck,
  X,
  ExternalLink,
} from "lucide-react";
import HeroIllustration from "@/components/home/HeroIllustration";
import ClayIcon, { ClayBadgeTone, ClayIconName } from "@/components/design-system/ClayIcon";
import {
  ClayActionCircle,
  ClayActionTheme,
  ClayProgressBar,
} from "@/components/design-system/ClayMotion";
import { getWhatsAppLink } from "@/lib/constants";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import {
  getExtendedProfile,
  ExtendedUserProfile,
  getStudentAcceptedTrainer,
  getTrainerAcceptedStudents,
  getUserMembershipCode,
} from "@/lib/platform-store";

interface SectionItem {
  href: string;
  title: string;
  subtitle: string;
  icon: ClayIconName;
  tone: ClayBadgeTone;
  actionTheme: ClayActionTheme;
  cardSurface: string;
  hoverRing: string;
  auraBg: string;
  ctaText: string;
  iconMotion: string;
  badge?: string;
}

export default function HomePage() {
  const { language, playFx } = useApp();
  const { user } = useAuth();
  const isEn = language === "en";

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [userProfile, setUserProfile] = useState<ExtendedUserProfile | null>(null);

  useEffect(() => {
    if (user?.id) {
      const prof = getExtendedProfile(user.id);
      setUserProfile(prof);
    } else {
      setUserProfile(null);
    }
  }, [user?.id]);

  const platformSections: SectionItem[] = [
    {
      href: "/mental-arithmetic",
      title: isEn ? "Mental Arithmetic" : "الحساب الذهني",
      subtitle: isEn
        ? "Flash Anzan, lessons & games"
        : "الدروس، الفلاش أنزان والألعاب",
      icon: "math123",
      tone: "peach",
      actionTheme: "orange",
      cardSurface:
        "bg-gradient-to-br from-white via-white to-[#FFF4E3] dark:from-[#1D1B3A] dark:via-[#1C1A3A] dark:to-[#332216] border-[#F7DFC0]/80 dark:border-[#5C3D24]/60",
      hoverRing:
        "hover:border-[#F59E0B]/70 hover:shadow-[0_20px_36px_-10px_rgba(245,158,11,0.28)] focus-visible:ring-[#F59E0B]/30",
      auraBg: "bg-amber-400/20",
      ctaText: "text-[#D97706] dark:text-[#FBBF24]",
      iconMotion:
        "group-hover:-translate-y-1.5 group-hover:rotate-6 group-hover:scale-110 group-focus-visible:-translate-y-1 group-focus-visible:scale-110 group-active:scale-95",
      badge: isEn ? "Core" : "أساسي",
    },
    {
      href: "/intelligence",
      title: isEn ? "Intelligence Quizzes" : "أسئلة الذكاء",
      subtitle: isEn
        ? "Logic puzzles & olympiads"
        : "ألغاز واختبارات التفكير المنطقي",
      icon: "brain",
      tone: "lavender",
      actionTheme: "violet",
      cardSurface:
        "bg-gradient-to-br from-white via-white to-[#F2EBFF] dark:from-[#1D1B3A] dark:via-[#1C1A3A] dark:to-[#2C1E4D] border-[#E1D4FF]/85 dark:border-[#4B3582]/60",
      hoverRing:
        "hover:border-[#8B5CF6]/70 hover:shadow-[0_20px_36px_-10px_rgba(139,92,246,0.28)] focus-visible:ring-[#8B5CF6]/30",
      auraBg: "bg-violet-400/20",
      ctaText: "text-[#7C3AED] dark:text-[#C4B5FD]",
      iconMotion:
        "group-hover:scale-110 group-hover:-rotate-6 group-focus-visible:scale-110 group-active:scale-95",
    },
    {
      href: "/trainers",
      title: isEn ? "Directory & Partners" : "الدليل والاعتمادات",
      subtitle: isEn
        ? "Certified coaches & schools"
        : "المدربون والمدارس المعتمدة",
      icon: "trophy",
      tone: "gold",
      actionTheme: "gold",
      cardSurface:
        "bg-gradient-to-br from-white via-white to-[#FFF8DF] dark:from-[#1D1B3A] dark:via-[#1C1A3A] dark:to-[#332912] border-[#F6E3A6]/85 dark:border-[#634E18]/60",
      hoverRing:
        "hover:border-[#EAB308]/75 hover:shadow-[0_20px_36px_-10px_rgba(234,179,8,0.28)] focus-visible:ring-[#EAB308]/30",
      auraBg: "bg-yellow-400/20",
      ctaText: "text-[#B45309] dark:text-[#FCD34D]",
      iconMotion:
        "group-hover:-translate-y-1.5 group-hover:scale-110 group-focus-visible:-translate-y-1 group-active:scale-95",
    },
    {
      href: "/curriculum",
      title: isEn ? "Books & Curriculum" : "المناهج والكتب",
      subtitle: isEn ? "Official Soroban editions" : "المناهج والحقائب التعليمية",
      icon: "book",
      tone: "emerald",
      actionTheme: "emerald",
      cardSurface:
        "bg-gradient-to-br from-white via-white to-[#E9FCF1] dark:from-[#1D1B3A] dark:via-[#1C1A3A] dark:to-[#123324] border-[#C5F2D9]/85 dark:border-[#20593D]/60",
      hoverRing:
        "hover:border-[#10B981]/70 hover:shadow-[0_20px_36px_-10px_rgba(16,185,129,0.26)] focus-visible:ring-[#10B981]/30",
      auraBg: "bg-emerald-400/20",
      ctaText: "text-[#059669] dark:text-[#6EE7B7]",
      iconMotion:
        "group-hover:-translate-y-1 group-hover:-rotate-6 group-hover:scale-105 group-focus-visible:scale-105 group-active:scale-95",
    },
    {
      href: "/dashboard",
      title: isEn ? "Student Portal" : "بوابة الطالب",
      subtitle: isEn
        ? "Progress, stars & homework"
        : "تقدمك، واجباتك، ونقاطك",
      icon: "graduation",
      tone: "sky",
      actionTheme: "sky",
      cardSurface:
        "bg-gradient-to-br from-white via-white to-[#EAF5FF] dark:from-[#1D1B3A] dark:via-[#1C1A3A] dark:to-[#152D4A] border-[#C9E3FF]/85 dark:border-[#254E7D]/60",
      hoverRing:
        "hover:border-[#3B82F6]/70 hover:shadow-[0_20px_36px_-10px_rgba(59,130,246,0.26)] focus-visible:ring-[#3B82F6]/30",
      auraBg: "bg-sky-400/20",
      ctaText: "text-[#2563EB] dark:text-[#7DD3FC]",
      iconMotion:
        "group-hover:-translate-y-1.5 group-hover:rotate-3 group-hover:scale-110 group-focus-visible:-translate-y-1 group-active:scale-95",
    },
    {
      href: "/trainer",
      title: isEn ? "Trainer Dashboard" : "لوحة المدرب",
      subtitle: isEn
        ? "Manage students & homework"
        : "متابعة الطلاب وإرسال الواجبات",
      icon: "users",
      tone: "indigo",
      actionTheme: "indigo",
      cardSurface:
        "bg-gradient-to-br from-white via-white to-[#EDF0FF] dark:from-[#1D1B3A] dark:via-[#1C1A3A] dark:to-[#1E2554] border-[#D0D9FF]/85 dark:border-[#354087]/60",
      hoverRing:
        "hover:border-[#6366F1]/75 hover:shadow-[0_20px_36px_-10px_rgba(99,102,241,0.28)] focus-visible:ring-[#6366F1]/30",
      auraBg: "bg-indigo-400/20",
      ctaText: "text-[#4F46E5] dark:text-[#A5B4FC]",
      iconMotion:
        "group-hover:-translate-y-1 group-hover:scale-110 group-focus-visible:scale-110 group-active:scale-95",
    },
    {
      href: "/subscriptions",
      title: isEn ? "Subscriptions & Plans" : "الاشتراكات والباقات",
      subtitle: isEn
        ? "Student, trainer & school plans"
        : "باقات التفعيل والاعتماد الرسمي",
      icon: "crown",
      tone: "gold",
      actionTheme: "orange",
      cardSurface:
        "bg-gradient-to-br from-white via-white to-[#FFF4E0] dark:from-[#1D1B3A] dark:via-[#1C1A3A] dark:to-[#362412] border-[#F8DBA4]/85 dark:border-[#69481A]/60",
      hoverRing:
        "hover:border-[#F59E0B]/75 hover:shadow-[0_20px_36px_-10px_rgba(245,158,11,0.28)] focus-visible:ring-[#F59E0B]/30",
      auraBg: "bg-amber-400/20",
      ctaText: "text-[#D97706] dark:text-[#FCD34D]",
      iconMotion:
        "group-hover:-translate-y-1.5 group-hover:rotate-6 group-hover:scale-110 group-focus-visible:rotate-6 group-active:scale-95",
    },
    {
      href: "/supporters",
      title: isEn ? "Supporters" : "الداعمون",
      subtitle: isEn ? "Partners in mind building" : "شركاء صناعة العقول",
      icon: "heart",
      tone: "pink",
      actionTheme: "rose",
      cardSurface:
        "bg-gradient-to-br from-white via-white to-[#FFF0F5] dark:from-[#1D1B3A] dark:via-[#1C1A3A] dark:to-[#3D182A] border-[#FCCAD9]/85 dark:border-[#702849]/60",
      hoverRing:
        "hover:border-[#F43F5E]/70 hover:shadow-[0_20px_36px_-10px_rgba(244,63,94,0.26)] focus-visible:ring-[#F43F5E]/30",
      auraBg: "bg-rose-400/20",
      ctaText: "text-[#E11D48] dark:text-[#FDA4AF]",
      iconMotion:
        "group-hover:scale-110 group-hover:-translate-y-1 group-focus-visible:scale-110 group-active:scale-95",
    },
    {
      href: "/about",
      title: isEn ? "About Us" : "من نحن",
      subtitle: isEn ? "About platform & founder" : "التعريف بالمنصة والمؤسس",
      icon: "shield",
      tone: "teal",
      actionTheme: "teal",
      cardSurface:
        "bg-gradient-to-br from-white via-white to-[#EAF9FC] dark:from-[#1D1B3A] dark:via-[#1C1A3A] dark:to-[#12323B] border-[#BFEBF4]/85 dark:border-[#1E5663]/60",
      hoverRing:
        "hover:border-[#06B6D4]/70 hover:shadow-[0_20px_36px_-10px_rgba(6,182,212,0.26)] focus-visible:ring-[#06B6D4]/30",
      auraBg: "bg-cyan-400/20",
      ctaText: "text-[#0891B2] dark:text-[#67E8F9]",
      iconMotion:
        "group-hover:-translate-y-1 group-hover:scale-105 group-focus-visible:scale-105 group-active:scale-95",
    },
    {
      href: "/contact",
      title: isEn ? "Contact" : "التواصل",
      subtitle: isEn
        ? "Social links & direct inquiry"
        : "روابط التواصل والاستفسار المباشر",
      icon: "chat",
      tone: "mint",
      actionTheme: "mint",
      cardSurface:
        "bg-gradient-to-br from-white via-white to-[#E6FBF7] dark:from-[#1D1B3A] dark:via-[#1C1A3A] dark:to-[#123632] border-[#BDEEE5]/85 dark:border-[#215C55]/60",
      hoverRing:
        "hover:border-[#2CB5A3]/75 hover:shadow-[0_20px_36px_-10px_rgba(44,181,163,0.28)] focus-visible:ring-[#2CB5A3]/30",
      auraBg: "bg-teal-400/20",
      ctaText: "text-[#0D9488] dark:text-[#5EEAD4]",
      iconMotion:
        "group-hover:-translate-y-1 group-hover:-rotate-6 group-hover:scale-110 group-focus-visible:-rotate-6 group-active:scale-95",
    },
  ];

  const pillars: {
    href: string;
    title: string;
    description: string;
    cta: string;
    icon: ClayIconName;
    tone: ClayBadgeTone;
    progress: number;
    badge?: string;
  }[] = [
    {
      href: "/mental-arithmetic/abacus",
      title: isEn ? "Japanese Soroban" : "العداد الياباني (السوروبان)",
      description: isEn
        ? "Smooth touch-draggable interactive Soroban beads with multi-digit calculations and instant step-by-step guidance."
        : "عداد تفاعلي سلس يدعم اللمس والتحريك المباشر للخرزات مع تمارين متدرجة لتنمية التركيز والتصور المكاني.",
      cta: isEn ? "Open Interactive Soroban" : "دخول العداد التفاعلي",
      icon: "soroban",
      tone: "lavender",
      progress: 85,
    },
    {
      href: "/mental-arithmetic/flash-anzan",
      title: isEn ? "Flash Anzan" : "فلاش أنزان (Flash Anzan)",
      description: isEn
        ? "High-speed visual number flashing from 2.0s down to 0.3s to train mental visualization and rapid calculation."
        : "تدريب التخيّل البصري السريع للأرقام بسرعات متدرجة من ثانيتين حتى 0.3 ثانية لتقوية الذاكرة والسرعة الذهنية.",
      cta: isEn ? "Start Flash Training" : "بدء تمارين الفلاش",
      icon: "flash",
      tone: "peach",
      progress: 75,
    },
    {
      href: "/intelligence",
      title: isEn ? "IQ & Math Challenges" : "تحديات الذكاء والرياضيات",
      badge: isEn ? "Olympiad" : "أولمبياد",
      description: isEn
        ? "Pattern recognition, logic puzzles, and mental agility tests designed to sharpen analytical and creative thinking."
        : "اختبارات تفكير منطقي وألغاز ذكاء ومسابقات رياضية محفّزة ترفع مهارات التحليل والاستنتاج لدى الطالب.",
      cta: isEn ? "Explore Challenges" : "خوض التحديات",
      icon: "shapes",
      tone: "sky",
      progress: 65,
    },
    {
      href: "/trainer",
      title: isEn ? "Trainer & Student Portals" : "لوحات المدربين والطلاب",
      description: isEn
        ? "Follow student accuracy, speed streaks, assigned homework, and certified training groups from a single dashboard."
        : "متابعة شاملة لمستوى الطلاب، نسب الدقة، إرسال الواجبات، وإدارة المجموعات التدريبية من لوحة واحدة.",
      cta: isEn ? "Open Trainer Portal" : "استعراض لوحة المدرب",
      icon: "trophy",
      tone: "mint",
      progress: 90,
    },
  ];

  const methodologyStages = [
    {
      step: "01",
      icon: "footprint" as ClayIconName,
      tone: "lavender" as ClayBadgeTone,
      title: isEn ? "Sensory Foundation" : "التأسيس الحسي",
      desc: isEn
        ? "Recognizing bead values and mastering physical touch movement on the Soroban."
        : "التعرّف على خرزات المعداد الياباني (السوروبان) وتحريكها بلمس الشاشة لفهم القيم المكانية بدقة.",
    },
    {
      step: "02",
      icon: "plusMinus" as ClayIconName,
      tone: "mint" as ClayBadgeTone,
      title: isEn ? "Complements & Rules" : "القواعد والمكملات",
      desc: isEn
        ? "Mastering Small Friends (5), Big Friends (10), and family rules step by step."
        : "إتقان أصدقاء الخمسة وأصدقاء العشرة والجمع والطرح المركّب بأسلوب تدريجي واضح ومبسّط.",
    },
    {
      step: "03",
      icon: "flash" as ClayIconName,
      tone: "peach" as ClayBadgeTone,
      title: isEn ? "Flash Visualization" : "التخيّل البصري",
      desc: isEn
        ? "Projecting the Soroban mentally through guided Flash Anzan drills at rising speeds."
        : "نقل صورة المعداد إلى الذاكرة البصرية عبر تمارين الفلاش أنزان المتسارعة تدريجياً.",
    },
    {
      step: "04",
      icon: "rocket" as ClayIconName,
      tone: "pink" as ClayBadgeTone,
      title: isEn ? "Championship Speed" : "سرعة الخارقين",
      desc: isEn
        ? "Sustained high-speed mental calculation, multi-digit fluency, and competition readiness."
        : "الوصول إلى سرعة الإنجاز العالية، الدقة الفائقة، والجاهزية التامة للبطولات والتحديات.",
    },
  ];

  const faqs = [
    {
      num: "01",
      question: isEn
        ? "Does the student need prior knowledge of the Japanese Soroban?"
        : "هل يحتاج الطالب لمعرفة سابقة بالمعداد الياباني (السوروبان)؟",
      answer: isEn
        ? "No, the platform starts from scratch step by step; learning bead values, basic operations, and number complements."
        : "كلا، تبدأ المنصة مع الطالب من الصفر خطوة بخطوة؛ عبر التعرف على الخرزات، وقيمتها، وقواعد الجمع والطرح البسيطة والمركبة ومكملات الأرقام.",
    },
    {
      num: "02",
      question: isEn
        ? "What is the difference between Interactive Soroban and Flash Anzan?"
        : "ما الفرق بين تمارين العداد التفاعلي والفلاش أنزان؟",
      answer: isEn
        ? "The Interactive Soroban lets students drag and move beads by touch to build tactile concepts, while Flash Anzan flashes numbers at controlled speeds to train mental visualization."
        : "العداد التفاعلي يُمكّن الطالب من تحريك الخرزات بلمس الشاشة لترسيخ المفاهيم المادية، بينما الفلاش أنزان يعرض أرقاماً تومض بسرعة محددة لتدريب الطالب على التخيل الذهني.",
    },
    {
      num: "03",
      question: isEn
        ? "How can a trainer create a student group and track their results?"
        : "كيف يمكن للمدرب إنشاء مجموعة لطلابه ومتابعة نتائجهم؟",
      answer: isEn
        ? "The platform provides a dedicated Trainer Dashboard to browse student rosters, monitor accuracy and speed rates, and send instructions and homework directly."
        : "توفر المنصة لوحة تحكم مخصصة للمدرب تمكنه من استعراض قائمة طلابه، مراقبة نسب الدقة وسرعة الإنجاز، وإرسال التوجيهات والواجبات مباشرة.",
    },
    {
      num: "04",
      question: isEn
        ? "Does the platform work on tablets and smartphones?"
        : "هل تعمل المنصة على الأجهزة اللوحية والهواتف الذكية؟",
      answer: isEn
        ? "Yes, the platform is fully responsive and supports touch interaction on iPads, tablets, smartphones, desktops, and smart classroom screens."
        : "نعم، المنصة مبنية بتصميم متجاوب بالكامل وتدعم اللمس المتعدد على الآيباد، التابلت، والهواتف الذكية، والحواسيب وشاشات القاعات الذكية.",
    },
  ];

  return (
    <div className="min-h-screen overflow-x-clip bg-[#F3F2FC] dark:bg-[#100F24] pb-24 sm:pb-20">
      {/* 1. SOFT 3D ADVENTURE HERO SECTION */}
      <section className="relative overflow-hidden pt-6 pb-12 sm:pt-10 sm:pb-16 lg:py-16">
        {/* Soft ambient pastel blobs */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -right-24 h-80 w-80 rounded-full bg-[#8E72FF]/15 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-[#A78BFA]/15 blur-3xl"
        />

        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          {/* إشعار التسجيل بداخل الصفحة الرئيسية (يختفي فور تسجيل الطالب) */}
          {!user && (
            <motion.aside
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              aria-label="إشعار تسجيل الحساب"
              className="mb-8 p-4 sm:p-5 rounded-3xl clay-card bg-gradient-to-r from-white via-[#F8F5FF] to-[#FFF9EE] dark:from-[#1E1B3E] dark:via-[#191637] dark:to-[#2B2117] border-2 border-brand-500/30 dark:border-brand-500/40 shadow-xl"
            >
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3.5 text-center sm:text-start">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md">
                    <Sparkles className="w-6 h-6 text-amber-300 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      <h3 className="text-base sm:text-lg font-black text-[#261E58] dark:text-[#F3F0FD]">
                        {isEn ? "Join the Super Mind Community 🌟" : "انضم إلى عائلة العقل الخارق وسجّل حسابك الآن 🌟"}
                      </h3>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-800 dark:text-amber-200">
                        {isEn ? "Free Account" : "حساب مجاني"}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-[#5D5589] dark:text-[#C5BFEE] mt-0.5 leading-relaxed">
                      {isEn
                        ? "Register to track your mental math scores, earn stars, and compete in official championships."
                        : "سجّل حسابك لحفظ إنجازاتك في الحساب الذهني، وجمع النجوم، والمنافسة في البطولات والمسابقات الرسمية."}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0">
                  <Link
                    href="/login"
                    onClick={() => playFx("pop")}
                    className="clay-btn-purple flex-1 sm:flex-initial px-5 py-2.5 !rounded-2xl text-xs sm:text-sm font-black text-center shadow-lg hover:scale-105 active:scale-95 transition-all"
                  >
                    {isEn ? "Sign In / Register Now 🚀" : "تسجيل الدخول / إنشاء حساب 🚀"}
                  </Link>
                </div>
              </div>
            </motion.aside>
          )}

          {/* زر وشريط البروفايل للطالب أو المدرب المسجل مع الإحصائيات الحقيقية */}
          {user && userProfile && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="mb-8 p-4 sm:p-5 rounded-3xl clay-card bg-gradient-to-r from-white via-[#F5F2FF] to-[#F1F9FE] dark:from-[#1E1B3E] dark:via-[#191637] dark:to-[#172439] border-2 border-brand-500/35 dark:border-brand-500/40 shadow-xl"
            >
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3.5 text-center sm:text-start w-full sm:w-auto">
                  <div className="relative shrink-0">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gradient-to-br from-brand-600 to-indigo-600 border-2 border-amber-400 text-white flex items-center justify-center font-black text-lg shadow-md">
                      {userProfile.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={userProfile.avatarUrl}
                          alt={userProfile.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span>{userProfile.name?.slice(0, 2) || "🧠"}</span>
                      )}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
                      <Sparkles className="w-3 h-3 text-white" />
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                      <h3 className="text-base sm:text-lg font-black text-[#261E58] dark:text-[#F3F0FD] truncate">
                        مرحباً بك، {userProfile.name || "بطل العقل الخارق"} 👋
                      </h3>
                      <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-brand-100 text-brand-800 dark:bg-brand-900/60 dark:text-brand-300">
                        {userProfile.role === "trainer"
                          ? "مدرب معتمد 🎓"
                          : userProfile.role === "admin"
                          ? "إدارة المنصة 🛡️"
                          : "طالب معتمد 🌟"}
                      </span>
                    </div>

                    <div className="flex items-center justify-center sm:justify-start gap-4 mt-1 text-xs text-[#5D5589] dark:text-[#C5BFEE]">
                      <span className="font-mono font-bold">
                        المعرّف: {userProfile.memberCode || getUserMembershipCode(user.id)}
                      </span>
                      {userProfile.role === "student" ? (
                        <span>
                          الدقة: <strong className="text-emerald-600 font-mono">{userProfile.accuracyRate || 0}%</strong> • الأسئلة: <strong className="text-brand-600 font-mono">{userProfile.totalQuestionsSolved || 0}</strong>
                        </span>
                      ) : (
                        <span>
                          الطلاب: <strong className="text-brand-600 font-mono">{getTrainerAcceptedStudents(user.id).length}</strong> طالب معتمد
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      playFx("pop");
                      setShowProfileModal(true);
                    }}
                    className="clay-btn-purple flex-1 sm:flex-initial px-4 py-2.5 !rounded-2xl text-xs font-black shadow-md hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                  >
                    <User className="w-4 h-4" />
                    <span>ملفي وإحصائياتي الحقيقية</span>
                  </button>

                  <Link
                    href={userProfile.role === "trainer" ? "/trainer" : "/dashboard"}
                    onClick={() => playFx("pop")}
                    className="clay-btn-amber flex-1 sm:flex-initial px-4 py-2.5 !rounded-2xl text-xs font-black shadow-md hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>لوحة التحكم</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </motion.div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            {/* Hero Left/Start Content */}
            <div className="lg:col-span-7 text-center lg:text-start">
              {/* Friendly Greeting & Mission Pills */}
              <div className="flex flex-col items-center lg:items-start gap-2.5 mb-5">
                <div className="clay-pill inline-flex items-center gap-2 px-4 py-1.5 text-xs sm:text-sm font-bold text-brand-700 dark:text-brand-200">
                  <span>👋</span>
                  <span>
                    {isEn
                      ? "Hi, Champ! Integrated Arabic Mental Math Platform"
                      : "مرحباً يا بطل! منصة عربية متكاملة لتعليم الحساب الذهني من الصفر إلى الاحتراف."}
                  </span>
                </div>

                <div className="clay-pill inline-flex items-center gap-2 px-4 py-1 text-xs sm:text-sm font-extrabold text-emerald-700 dark:text-emerald-300 bg-[#E6FBF7] dark:bg-[#153B38]">
                  <span>💚</span>
                  <span>
                    {isEn
                      ? "Learning & training free for everyone"
                      : "التعلّم والتدريب مجاناً للجميع"}
                  </span>
                  <span aria-hidden="true">⭐</span>
                </div>
              </div>

              {/* Hero Title */}
              <h1 className="text-3xl sm:text-5xl lg:text-[3.35rem] font-black tracking-tight text-[#1E1B3A] dark:text-white leading-[1.18] mb-3">
                {isEn ? (
                  <>
                    <span className="text-gradient">SUPER MIND</span> Program
                    Platform
                  </>
                ) : (
                  <>
                    منصة برنامج{" "}
                    <span className="text-gradient">العقل الخارق</span>
                  </>
                )}
              </h1>

              {/* Brand Stamp & Tagline */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-4">
                <span className="clay-pill px-4 py-1 text-xs sm:text-sm font-black tracking-[0.18em] text-brand-600 dark:text-brand-300">
                  SUPER MIND
                </span>
                <p className="text-base sm:text-xl font-extrabold text-gradient-amber">
                  {isEn
                    ? "From Zero to Mastery... A Journey Toward a Super Mind!"
                    : "من الصفر إلى الاحتراف... رحلة نحو عقلٍ خارق!"}
                </p>
              </div>

              <p className="text-sm sm:text-base lg:text-lg text-[#56517A] dark:text-[#C7C2E8] leading-relaxed max-w-2xl mx-auto lg:mx-0 mb-6">
                {isEn
                  ? "Discover an interactive 3D educational adventure combining mental arithmetic and cognitive development through structured levels, tactile Soroban tools, and fun challenges."
                  : "اكتشف تجربة تعليمية تفاعلية تجمع بين الحساب الذهني وتنمية القدرات العقلية، من خلال مستويات متدرجة، وأدوات تدريبية متطورة، وتمارين ممتعة وتحديات تحفّز الإبداع والإنجاز."}
              </p>

              {/* Soft Lavender Daily Adventure Card (Inspired directly by Screen 1 "Daily Goal") */}
              <div className="clay-banner-lavender p-5 sm:p-6 text-white mb-6 max-w-2xl mx-auto lg:mx-0">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4 text-start w-full sm:w-auto">
                    <ClayIcon name="star" tone="none" size="xl" />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-white/85">
                        {isEn
                          ? "Daily Adventure • Learn Smart • Train Confidently"
                          : "الهدف اليومي • تعلّم بذكاء • تدرّب بثقة"}
                      </div>
                      <h2 className="text-base sm:text-lg font-black text-white mt-0.5">
                        {isEn
                          ? "Ready to sharpen your brain today?"
                          : "جاهز لتنشيط عقلك الخارق اليوم؟"}
                      </h2>
                      <div className="mt-2.5 flex items-center gap-3">
                        <div className="h-2.5 flex-1 rounded-full bg-white/25 overflow-hidden">
                          <div className="h-full w-3/4 rounded-full bg-gradient-to-l from-amber-300 to-amber-400" />
                        </div>
                        <span className="text-xs font-extrabold text-amber-200 whitespace-nowrap">
                          {isEn ? "Free Access" : "تعلّم مجاني 100%"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Primary Clay CTA Buttons */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-5 pt-4 border-t border-white/20">
                  <Link
                    href="/mental-arithmetic"
                    onClick={() => playFx("pop")}
                    className="clay-btn-amber flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 font-black text-sm sm:text-base"
                  >
                    <PlayCircle className="w-5 h-5 shrink-0" />
                    <span>
                      {isEn ? "Start Mental Training" : "ابدأ التدريب الذهني"}
                    </span>
                  </Link>

                  <Link
                    href="/mental-arithmetic/abacus"
                    onClick={() => playFx("pop")}
                    className="clay-btn-secondary flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 font-extrabold text-sm sm:text-base"
                  >
                    <ClayIcon name="soroban" tone="none" size="xs" />
                    <span>
                      {isEn ? "Interactive Soroban" : "المعداد التفاعلي"}
                    </span>
                  </Link>
                </div>
              </div>

              {/* 3 Sculpted Trust Indicators */}
              <div className="grid grid-cols-3 gap-2.5 sm:gap-4 max-w-xl mx-auto lg:mx-0">
                <div className="clay-card-sm px-3 py-3 sm:px-4 sm:py-3.5 text-center lg:text-start">
                  <div className="flex items-center justify-center lg:justify-start gap-2 mb-1">
                    <ClayIcon name="math123" tone="peach" size="xs" />
                    <span
                      dir="ltr"
                      className="text-sm sm:text-xl font-black text-[#1E1B3A] dark:text-white tabular-nums"
                    >
                      10,000+
                    </span>
                  </div>
                  <div className="text-[11px] sm:text-xs font-semibold text-[#6E6A94] dark:text-[#B3AED6]">
                    {isEn ? "Interactive drills" : "تمرين ومسألة تفاعلية"}
                  </div>
                </div>

                <div className="clay-card-sm px-3 py-3 sm:px-4 sm:py-3.5 text-center lg:text-start">
                  <div className="flex items-center justify-center lg:justify-start gap-2 mb-1">
                    <ClayIcon name="flash" tone="mint" size="xs" />
                    <span
                      dir="ltr"
                      className="text-sm sm:text-xl font-black text-[#109D8A] dark:text-[#5EEAD4] tabular-nums"
                    >
                      0.3s-2s
                    </span>
                  </div>
                  <div className="text-[11px] sm:text-xs font-semibold text-[#6E6A94] dark:text-[#B3AED6]">
                    {isEn ? "Custom speeds" : "سرعات فلاش مخصصة"}
                  </div>
                </div>

                <div className="clay-card-sm px-3 py-3 sm:px-4 sm:py-3.5 text-center lg:text-start">
                  <div className="flex items-center justify-center lg:justify-start gap-2 mb-1">
                    <ClayIcon name="shield" tone="lavender" size="xs" />
                    <span
                      dir="ltr"
                      className="text-sm sm:text-xl font-black text-brand-600 dark:text-brand-300 tabular-nums"
                    >
                      100%
                    </span>
                  </div>
                  <div className="text-[11px] sm:text-xs font-semibold text-[#6E6A94] dark:text-[#B3AED6]">
                    {isEn ? "Safe environment" : "بيئة عربية آمنة"}
                  </div>
                </div>
              </div>
            </div>

            {/* Hero 3D Clay Character */}
            <div className="lg:col-span-5 flex justify-center">
              <HeroIllustration />
            </div>
          </div>
        </div>
      </section>

      {/* 2. APP SECTIONS GRID (EXACT 10 SECTIONS WITH 3D CLAY ICONS & CIRCULAR ACTION BUTTONS) */}
      <section className="py-10 sm:py-14">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center mb-8 sm:mb-10">
            <div className="clay-pill inline-flex items-center gap-2 px-4 py-1.5 text-xs sm:text-sm font-extrabold text-brand-700 dark:text-brand-300 mb-3">
              <ClayIcon name="sparkles" tone="none" size="xs" />
              <span>{isEn ? "Quick App Access" : "الوصول السريع"}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-[#1E1B3A] dark:text-white tracking-tight">
              {isEn ? "Platform Sections" : "أقسام المنصة"}
            </h2>
            <p className="text-sm sm:text-base text-[#5E5985] dark:text-[#BEB9E2] mt-2 max-w-xl">
              {isEn
                ? "Direct access to every section of SUPER MIND with one tap."
                : "انتقل مباشرة إلى أي قسم في منصة العقل الخارق بلمسة واحدة."}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-5">
            {platformSections.map((item, idx) => (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.25, delay: Math.min(idx * 0.03, 0.25) }}
              >
                <Link
                  href={item.href}
                  onClick={() => playFx("pop")}
                  className={`group relative overflow-hidden rounded-[28px] border h-full flex flex-col justify-between p-4 sm:p-5 shadow-[0_14px_30px_-10px_rgba(68,52,138,0.12),inset_0_3px_5px_rgba(255,255,255,0.95)] dark:shadow-[0_14px_30px_-10px_rgba(4,3,15,0.6),inset_0_2px_4px_rgba(167,153,255,0.1)] transition-all duration-300 ease-out hover:-translate-y-1.5 focus-visible:-translate-y-1.5 focus-visible:outline-none focus-visible:ring-4 active:translate-y-0 active:scale-[0.97] ${item.cardSurface} ${item.hoverRing}`}
                >
                  {/* Soft colored ambient corner glow on hover / focus */}
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none absolute -top-10 -left-10 w-28 h-28 rounded-full blur-2xl opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-300 ${item.auraBg}`}
                  />

                  <div className="relative z-10">
                    <div className="flex items-start justify-between gap-2 mb-3.5">
                      <ClayIcon
                        name={item.icon}
                        tone={item.tone}
                        size="md"
                        className={item.iconMotion}
                      />
                      {item.badge && (
                        <span className="clay-pill px-2.5 py-0.5 text-[10px] font-black text-[#D97706] dark:text-[#FBBF24] bg-[#FFF4E0] dark:bg-[#3A2814]">
                          {item.badge}
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm sm:text-base font-black text-[#1E1B3A] dark:text-white leading-snug mb-1">
                      {item.title}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-[#6E6A94] dark:text-[#B3AED6] leading-relaxed">
                      {item.subtitle}
                    </p>
                  </div>

                  <div className="relative z-10 mt-4 pt-3 border-t border-slate-200/60 dark:border-white/10 flex items-center justify-between">
                    <span className={`text-[11px] sm:text-xs font-extrabold ${item.ctaText}`}>
                      {isEn ? "Open" : "دخول"}
                    </span>
                    <ClayActionCircle variant="arrow" size="sm" theme={item.actionTheme} />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. CORE PILLARS + MINT MATH FUN BANNER (MATCHING SCREEN 2) */}
      <section className="py-10 sm:py-16">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Royal Lavender 3D Banner */}
          <div className="clay-banner-lavender relative overflow-hidden p-6 sm:p-9 lg:p-10 text-white rounded-[2.5rem] shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-7 text-center lg:text-start">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/20 border border-white/30 px-4 py-1 text-xs sm:text-sm font-black text-amber-300 mb-3 shadow-sm">
                  <ClayIcon name="trophy" tone="none" size="xs" />
                  <span>
                    {isEn
                      ? "Pillars of Mental Excellence"
                      : "ركائز التفوق الذهني في المنصة"}
                  </span>
                </div>
                <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight mb-3">
                  {isEn
                    ? "Let's Make Mental Math Fun & Unforgettable!"
                    : "لنجعل الحساب الذهني رحلةً ممتعة ومُلهمة!"}
                </h2>
                <p className="text-sm sm:text-base font-medium text-white/90 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                  {isEn
                    ? "Complete tools crafted with mental arithmetic experts to stimulate both brain hemispheres simultaneously."
                    : "أدوات متكاملة لبناء عبقرية الحساب وسرعة البديهة، صُممت بالتعاون مع خبراء الحساب الذهني لتطوير شقي الدماغ بالتزامن."}
                </p>
              </div>

              <div className="lg:col-span-5">
                <div className="rounded-[24px] overflow-hidden shadow-clay border-2 border-white/40 aspect-video bg-[#5438E8]/40">
                  <Image
                    src="/images/clay/math-fun-mascot.jpg"
                    alt="طفل وطفلة متحمسين يحملان كأساً ومعداد سوروبان بجانب السبورة"
                    width={960}
                    height={540}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 4 Pillar Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {pillars.map((pillar) => (
              <Link
                key={pillar.href}
                href={pillar.href}
                onClick={() => playFx("pop")}
                className="clay-card group flex flex-col justify-between p-6 hover:-translate-y-1 active:scale-[0.98]"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <ClayIcon
                      name={pillar.icon}
                      tone={pillar.tone}
                      size="lg"
                      className="group-hover:scale-110 transition-transform"
                    />
                    {pillar.badge && (
                      <span className="clay-pill px-3 py-1 text-xs font-extrabold text-brand-700 dark:text-brand-300 bg-[#F2EEFF] dark:bg-[#2C2658]">
                        {pillar.badge}
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-black text-[#1E1B3A] dark:text-white mb-2 leading-snug">
                    {pillar.title}
                  </h3>
                  <p className="text-sm text-[#5E5985] dark:text-[#BEB9E2] leading-relaxed mb-4">
                    {pillar.description}
                  </p>
                </div>

                <div className="space-y-3 pt-3 border-t border-[#EEEBFA] dark:border-[#2E2B57]">
                  <ClayProgressBar value={pillar.progress} />
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-extrabold text-brand-600 dark:text-brand-300">
                      {pillar.cta}
                    </span>
                    <ClayActionCircle variant="play" size="sm" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Competition & Teams Battle Highlight Card */}
          <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#231C52] via-[#1B1642] to-[#130F33] border border-[#3C3578] p-6 sm:p-9 text-white shadow-2xl">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-20 -left-20 w-72 h-72 rounded-full bg-amber-400/15 blur-3xl"
            />
            <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="flex items-start gap-4 max-w-2xl">
                <ClayIcon
                  name="trophy"
                  tone="gold"
                  size="xl"
                  className="hidden sm:inline-flex"
                />
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-amber-400/20 border border-amber-300/35 px-3.5 py-1 text-xs font-extrabold text-amber-300 mb-3">
                    <span>🏆</span>
                    <span>
                      {isEn
                        ? "Live Competitions & Team Battles"
                        : "المسابقات الحماسية وتحدي الفرق"}
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black mb-2">
                    {isEn
                      ? "Challenge Friends or Compete in Classroom Speed Battles"
                      : "نافس زملاءك أو اشترك في تحديات السرعة الجماعية داخل القاعات"}
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {isEn
                      ? "Solo speed competitions and interactive head-to-head team battles designed for academies, classrooms, and family challenges."
                      : "بيئة تنافسية حماسية تشمل وضع المنافسة الفردية وتحدي الفرق المباشر لرفع الحماس وروح التحدي بين الطلاب."}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto shrink-0">
                <Link
                  href="/mental-arithmetic/competition"
                  onClick={() => playFx("pop")}
                  className="clay-btn-amber inline-flex items-center justify-center gap-2 font-black px-6 py-3.5 text-sm"
                >
                  <span>⚡</span>
                  <span>
                    {isEn ? "Speed Competition" : "مسابقة السرعة"}
                  </span>
                </Link>
                <Link
                  href="/mental-arithmetic/teams-battle"
                  onClick={() => playFx("pop")}
                  className="clay-btn-purple inline-flex items-center justify-center gap-2 font-bold px-6 py-3.5 text-sm"
                >
                  <span>🤝</span>
                  <span>{isEn ? "Teams Battle" : "تحدي الفرق"}</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SCIENTIFIC METHODOLOGY SECTION */}
      <section className="py-10 sm:py-14">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-[34px] bg-gradient-to-b from-[#1E184A] via-[#19143D] to-[#120E2E] text-white p-6 sm:p-10 lg:p-12 border border-[#383173] shadow-2xl overflow-hidden relative">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-10 right-0 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-10 left-0 w-80 h-80 bg-brand-500/20 rounded-full blur-3xl"
            />

            <div className="relative z-10 text-center max-w-3xl mx-auto mb-9 sm:mb-12">
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-400/15 border border-amber-300/30 px-4 py-1 text-xs sm:text-sm font-extrabold text-amber-300 mb-3">
                <span>🧠</span>
                <span>
                  {isEn
                    ? "SUPER MIND Scientific Methodology"
                    : "منهجية العقل الخارق العلمية"}
                </span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black leading-tight mb-3">
                {isEn
                  ? "How Does a Student Transform from Regular Math to Super Speed?"
                  : "كيف يتحول الطالب من الحساب العادي إلى سرعة الخارقين؟"}
              </h2>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                {isEn
                  ? "A structured training sequence taking the brain from tactile processing to abstract spatial visualization."
                  : "تسلسل تدريبي مدروس ينقل العقل من المعالجة الحسية إلى التخيل الفضائي المجرد."}
              </p>
            </div>

            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {methodologyStages.map((stage, idx) => (
                <div
                  key={stage.step}
                  className="group rounded-[26px] bg-white/[0.06] hover:bg-white/[0.1] border border-white/15 hover:border-amber-300/50 p-6 transition-all duration-200 shadow-lg"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <ClayIcon name={stage.icon} tone={stage.tone} size="sm" />
                      <span className="rounded-full bg-amber-400/20 border border-amber-300/30 px-2.5 py-0.5 text-xs font-black text-amber-300 font-mono">
                        {stage.step}
                      </span>
                    </div>
                    {idx < methodologyStages.length - 1 && (
                      <ChevronLeft
                        aria-hidden="true"
                        className="hidden lg:block w-4 h-4 text-slate-400 ltr:rotate-180"
                      />
                    )}
                  </div>
                  <h3 className="text-base sm:text-lg font-extrabold text-white mb-2">
                    {stage.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {stage.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5. WHO BENEFITS + ACHIEVEMENTS HERO BANNER (MATCHING SCREEN 3) */}
      <section className="py-10 sm:py-16">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
          {/* Reward / Celebration 3D Banner featuring champion-reward-kid.jpg */}
          <div className="clay-banner-lavender relative overflow-hidden p-6 sm:p-9 lg:p-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-7 text-center lg:text-start text-white">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/20 border border-white/30 px-4 py-1 text-xs sm:text-sm font-extrabold mb-3">
                  <span>🌟</span>
                  <span>
                    {isEn
                      ? "Built for Every Mind Champion"
                      : "مصممة لكل بطل ومبدع"}
                  </span>
                </div>
                <h2 className="text-2xl sm:text-4xl font-black mb-3">
                  {isEn
                    ? "Who Benefits from SUPER MIND?"
                    : "من يستفيد من المنصة؟"}
                </h2>
                <p className="text-sm sm:text-base text-white/90 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                  {isEn
                    ? "A joyful 3D learning world built for young learners, certified trainers, schools, and specialized academies."
                    : "بيئة مرنة تلبي طموحات البراعم الصغار واحتياجات المدربين والمدارس والمراكز التخصصية، مع تتبع فوري للأوسمة والنجوم."}
                </p>
              </div>

              <div className="lg:col-span-5">
                <div className="rounded-[24px] overflow-hidden shadow-clay border-2 border-white/50 aspect-video bg-[#C8BAFF]">
                  <Image
                    src="/images/clay/champion-reward-kid.jpg"
                    alt="بطل العقل الخارق يحمل الكأس الذهبي مع النجوم المبتسمة"
                    width={960}
                    height={540}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
            {/* Kids & Students */}
            <div className="clay-card p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <ClayIcon name="graduation" tone="sky" size="lg" className="mb-5" />
                <h3 className="text-xl font-black text-[#1E1B3A] dark:text-white mb-4">
                  {isEn ? "For Kids & Students" : "للأطفال والطلاب"}
                </h3>
                <ul className="space-y-3.5 text-sm text-[#4F4A75] dark:text-[#D5D0F2]">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>
                      {isEn
                        ? "Engaging drills that feel like interactive games"
                        : "تمارين ترفيهية تشبه الألعاب التفاعلية"}
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>
                      {isEn
                        ? "Daily streak, stars, and achievement badges"
                        : "متابعة الإنجاز اليومي والنجوم والأوسمة"}
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>
                      {isEn
                        ? "Overcoming math anxiety and boosting memory"
                        : "التخلص من رهبة الرياضيات وصعوبة الحفظ"}
                    </span>
                  </li>
                </ul>
              </div>

              <div className="mt-7 pt-5 border-t border-[#EEEBFA] dark:border-[#2E2B57]">
                <Link
                  href="/dashboard"
                  onClick={() => playFx("pop")}
                  className="clay-btn-secondary w-full inline-flex items-center justify-center font-extrabold px-4 py-3 text-sm"
                >
                  {isEn ? "Open Student Portal" : "دخول بوابة الطالب"}
                </Link>
              </div>
            </div>

            {/* Trainers & Teachers (Highlighted Center Clay Card) */}
            <div className="clay-card relative ring-2 ring-brand-500 p-6 sm:p-8 flex flex-col justify-between shadow-glow">
              <div className="absolute -top-3.5 start-6 clay-btn-purple px-4 py-1 text-[11px] font-black">
                {isEn ? "Recommended for Coaches" : "الأكثر طلباً للمدربين"}
              </div>

              <div>
                <ClayIcon name="trophy" tone="gold" size="lg" className="mb-5" />
                <h3 className="text-xl font-black text-[#1E1B3A] dark:text-white mb-4">
                  {isEn ? "For Trainers & Teachers" : "للمدربين والأساتذة"}
                </h3>
                <ul className="space-y-3.5 text-sm text-[#4F4A75] dark:text-[#D5D0F2]">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>
                      {isEn
                        ? "Manage student rosters and groups in one place"
                        : "إدارة قوائم الطلاب والمجموعات في مكان واحد"}
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>
                      {isEn
                        ? "Listing in the Official Trainers Directory (25k IQD)"
                        : "إدراج الاسم في دليل المدربين (25 ألف د.ع)"}
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>
                      {isEn
                        ? "Official certificates and printable student reports"
                        : "رخص اعتماد وتقارير أداء دورية تطبع للطلاب"}
                    </span>
                  </li>
                </ul>
              </div>

              <div className="mt-7 pt-5 border-t border-[#EEEBFA] dark:border-[#2E2B57] space-y-2.5">
                <Link
                  href="/trainers"
                  onClick={() => playFx("pop")}
                  className="clay-btn-purple w-full inline-flex items-center justify-center font-black px-4 py-3 text-sm"
                >
                  {isEn ? "Browse Trainers Directory" : "استعراض دليل المدربين"}
                </Link>
                <Link
                  href="/trainer"
                  onClick={() => playFx("pop")}
                  className="clay-btn-secondary w-full inline-flex items-center justify-center font-bold px-4 py-2.5 text-sm"
                >
                  {isEn ? "Trainer Control Panel" : "لوحة تحكم المدرب"}
                </Link>
              </div>
            </div>

            {/* Centers & Schools */}
            <div className="clay-card p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <ClayIcon name="school" tone="peach" size="lg" className="mb-5" />
                <h3 className="text-xl font-black text-[#1E1B3A] dark:text-white mb-4">
                  {isEn ? "For Centers & Schools" : "للمراكز والمدارس"}
                </h3>
                <ul className="space-y-3.5 text-sm text-[#4F4A75] dark:text-[#D5D0F2]">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>
                      {isEn
                        ? "SUPER MIND curriculum series & Soroban kits"
                        : "سلسلة مناهج العقل الخارق وحقائب السوروبان"}
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>
                      {isEn
                        ? "Smart board display support for classrooms"
                        : "عرض تفاعلي متكامل لشاشات القاعات الدراسية"}
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>
                      {isEn
                        ? "Institutional accreditation & partnership plans"
                        : "اعتماد رسمي وباقات خاصة للمدارس والمراكز"}
                    </span>
                  </li>
                </ul>
              </div>

              <div className="mt-7 pt-5 border-t border-[#EEEBFA] dark:border-[#2E2B57]">
                <Link
                  href="/subscriptions"
                  onClick={() => playFx("pop")}
                  className="clay-btn-amber w-full inline-flex items-center justify-center font-black px-4 py-3 text-sm"
                >
                  {isEn ? "Subscriptions & Accreditation" : "الاشتراكات والاعتماد"}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. OFFICIAL WHATSAPP CONTACT CALLOUT */}
      <section className="py-8 sm:py-10">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="clay-banner-lavender p-6 sm:p-9 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 text-white rounded-[2rem] shadow-xl">
            <div className="flex items-start gap-4 max-w-xl">
              <ClayIcon
                name="chat"
                tone="none"
                size="xl"
                className="hidden sm:inline-flex drop-shadow-md text-amber-300"
              />
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-white/20 border border-white/30 px-3.5 py-1 text-xs font-extrabold text-amber-300 mb-3">
                  <MessageCircle className="w-4 h-4" />
                  <span>
                    {isEn ? "Direct Official Support" : "التواصل الرسمي المباشر"}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white mb-2 leading-snug">
                  {isEn
                    ? "Need Accreditation, Curriculum Orders, or School Activation?"
                    : "هل ترغب بطلب المناهج، الاعتماد الرسمي، أو تفعيل باقات المراكز؟"}
                </h3>
                <p className="text-sm font-medium text-white/90 leading-relaxed">
                  {isEn
                    ? "Contact SUPER MIND administration directly via WhatsApp or visit our contact page for official channels."
                    : "تواصل مباشرة مع إدارة برنامج العقل الخارق عبر الواتساب الرسمي أو استعرض جميع قنوات التواصل."}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto shrink-0">
              <a
                href={getWhatsAppLink(
                  isEn
                    ? "Hello SUPER MIND administration, I would like to inquire about the platform."
                    : "السلام عليكم إدارة منصة العقل الخارق، أود الاستفسار عن المنصة والاعتماد."
                )}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => playFx("pop")}
                className="clay-btn-secondary inline-flex items-center justify-center gap-2 font-black px-6 py-3.5 text-sm text-[#0F766E]"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{isEn ? "WhatsApp Admin" : "واتساب الإدارة"}</span>
              </a>
              <Link
                href="/contact"
                onClick={() => playFx("pop")}
                className="clay-btn-purple inline-flex items-center justify-center gap-2 font-bold px-6 py-3.5 text-sm"
              >
                <span>{isEn ? "Contact Page" : "صفحة التواصل"}</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FAQ SECTION */}
      <section className="py-10 sm:py-14">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-9 sm:mb-11">
            <div className="clay-pill inline-flex items-center gap-2 px-4 py-1.5 text-xs sm:text-sm font-extrabold text-brand-700 dark:text-brand-300 mb-3">
              <ClayIcon name="compass" tone="none" size="xs" />
              <span>{isEn ? "FAQ" : "الأسئلة الشائعة"}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-[#1E1B3A] dark:text-white">
              {isEn
                ? "Everything You Want to Know About SUPER MIND"
                : "كل ما تود معرفته عن منصة العقل الخارق"}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {faqs.map((faq) => (
              <div
                key={faq.num}
                className="clay-card p-5 sm:p-6 hover:-translate-y-0.5"
              >
                <div className="flex items-start gap-3.5">
                  <span className="shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-2xl bg-gradient-to-b from-[#8B6EFF] to-[#6344F5] text-white text-xs font-black font-mono shadow-clay-purple mt-0.5">
                    {faq.num}
                  </span>
                  <div>
                    <h3 className="text-base sm:text-lg font-extrabold text-[#1E1B3A] dark:text-white mb-2 leading-snug">
                      {faq.question}
                    </h3>
                    <p className="text-sm text-[#5E5985] dark:text-[#BEB9E2] leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* مودال استعراض البروفايل والمعلومات والإحصائيات الحقيقية */}
      {showProfileModal && userProfile && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setShowProfileModal(false)}
        >
          <div
            className="w-full max-w-lg clay-card p-6 bg-white dark:bg-[#1E1B3E] rounded-[2.5rem] border-2 border-brand-500/40 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gradient-to-br from-brand-600 to-indigo-600 border-2 border-amber-400 text-white flex items-center justify-center font-black text-xl shadow-md shrink-0">
                  {userProfile.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={userProfile.avatarUrl}
                      alt={userProfile.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{userProfile.name?.slice(0, 2) || "🧠"}</span>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">
                      {userProfile.name || "بطل العقل الخارق"}
                    </h3>
                    <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-brand-100 text-brand-800 dark:bg-brand-900/60 dark:text-brand-300">
                      {userProfile.role === "trainer"
                        ? "مدرب معتمد 🎓"
                        : userProfile.role === "admin"
                        ? "إدارة المنصة 🛡️"
                        : "طالب معتمد 🌟"}
                    </span>
                  </div>
                  <div className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 mt-0.5">
                    المعرّف الرسمي: {userProfile.memberCode || getUserMembershipCode(user?.id)}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowProfileModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Real Stats Grid */}
            <div className="space-y-2">
              <div className="text-xs font-black text-slate-700 dark:text-slate-300">
                📊 الإحصائيات الحقيقية المسجلة في حسابك:
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-2xl bg-brand-50/70 dark:bg-brand-950/40 border border-brand-200/60 dark:border-brand-800/40 text-center">
                  <div className="text-xl font-black font-mono text-brand-700 dark:text-brand-300">
                    {userProfile.totalQuestionsSolved || 0}
                  </div>
                  <div className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                    إجمالي الأسئلة المحلولة
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40 text-center">
                  <div className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                    {userProfile.accuracyRate || 0}%
                  </div>
                  <div className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                    معدل الدقة الحقيقي
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/40 text-center">
                  <div className="text-xl font-black font-mono text-amber-600 dark:text-amber-400">
                    {userProfile.totalExercises || 0}
                  </div>
                  <div className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                    التمارين المنجزة
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200/60 dark:border-purple-800/40 text-center">
                  <div className="text-xl font-black font-mono text-purple-600 dark:text-purple-400">
                    {userProfile.points || (userProfile.totalQuestionsSolved || 0) * 10}
                  </div>
                  <div className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                    النقاط والنجوم
                  </div>
                </div>
              </div>
            </div>

            {/* Role Specific Section */}
            {userProfile.role === "student" ? (
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-1.5">
                <div className="text-xs font-black text-slate-800 dark:text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-brand-600" />
                  <span>المدرب المشرف:</span>
                </div>
                {user?.id && getStudentAcceptedTrainer(user.id) ? (
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    ✅ مدربك المعتمد: <strong>{getStudentAcceptedTrainer(user.id)?.trainerName}</strong> (المعرّف: {getStudentAcceptedTrainer(user.id)?.trainerCode || "—"})
                  </p>
                ) : (
                  <p className="text-xs text-slate-500">
                    لم تقم بربط مدرب معتمد بعد. يمكنك اختيار وإضافة مدربك من داخل بوابة الطالب.
                  </p>
                )}
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-1.5">
                <div className="text-xs font-black text-slate-800 dark:text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-500" />
                  <span>إحصائيات التدريب:</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  👥 عدد الطلاب المعتمدين في قائمتك: <strong>{user?.id ? getTrainerAcceptedStudents(user.id).length : 0}</strong> طالب.
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="pt-2 flex items-center gap-3">
              <Link
                href={userProfile.role === "trainer" ? "/trainer" : "/dashboard"}
                onClick={() => {
                  playFx("pop");
                  setShowProfileModal(false);
                }}
                className="clay-btn-purple flex-1 py-3 font-black text-xs sm:text-sm text-center flex items-center justify-center gap-2"
              >
                <span>{userProfile.role === "trainer" ? "فتح لوحة تحكم المدرب الكاملة" : "فتح بوابة الطالب (الواجبات والتقدم)"}</span>
                <ExternalLink className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
