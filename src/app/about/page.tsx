import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Trophy,
  Medal,
  Award,
  Sparkles,
  GraduationCap,
  Brain,
  BookOpen,
  MessageCircle,
  ArrowLeft,
  Star,
  MapPin,
  Rocket,
  CheckCircle2,
} from "lucide-react";
import { COACH_INFO, getWhatsAppLink } from "@/lib/constants";
import { FounderSocialRow } from "@/components/ui/SocialIcons";

export const metadata = {
  title: "من نحن | برنامج العقل الخارق — إشراف أ. قتادة كريم",
  description:
    "تعرف على برنامج العقل الخارق ومؤسسه الأستاذ قتادة كريم، مدرس رياضيات وطالب ماجستير في التحليل العددي، مدرب دولي معتمد في الحساب الذهني ومؤسس منصة SUPER MIND.",
};

const ACHIEVEMENT_SECTIONS = [
  {
    title: "المؤهلات الأكاديمية",
    icon: GraduationCap,
    iconBg: "bg-brand-500/20 text-brand-300 border-brand-400/30",
    cardBorder: "border-brand-400/25 hover:border-brand-400/55",
    bulletColor: "text-brand-300",
    items: [
      "طالب ماجستير في الرياضيات – تخصص التحليل العددي، جامعة سهند للتكنولوجيا – إيران.",
      "بكالوريوس رياضيات – جامعة الأنبار.",
    ],
  },
  {
    title: "التدريب والاعتماد الدولي",
    icon: Medal,
    iconBg: "bg-emerald-500/20 text-emerald-300 border-emerald-400/30",
    cardBorder: "border-emerald-400/25 hover:border-emerald-400/55",
    bulletColor: "text-emerald-400",
    items: [
      "مدرب معتمد من الاتحاد الدولي للسوروبان والرياضيات الذهنية.",
      "حاصل على تدريب المدربين (TOT) في إسطنبول – تركيا.",
      "الإشراف على إعداد وتأهيل مدربين في الحساب الذهني ومهارات الذكاء.",
    ],
  },
  {
    title: "البطولات والتكريمات",
    icon: Trophy,
    iconBg: "bg-amber-500/20 text-amber-300 border-amber-400/30",
    cardBorder: "border-amber-400/25 hover:border-amber-400/55",
    bulletColor: "text-amber-400",
    items: [
      "تمثيل محافظة الأنبار في عدد من البطولات المحلية والدولية، أبرزها البطولة العالمية للحساب الذهني التي نظمتها منظمة واماس في بغداد عام 2025 بالتعاون مع مركز الرغد، إضافة إلى مسابقات النجف والموصل.",
      "تدريب فرق طلابية حققت ألقاب «بطل الأبطال» و«البطل» ومراكز متقدمة في بطولات محلية ودولية، من أبرزها لقب «بطل الأبطال» في بطولة بغداد العالمية للحساب الذهني عام 2025.",
      "الحصول على درع التميز والإبداع في مجال الحساب الذهني من مديرية تربية الأنبار.",
      "الحصول على درع المبدع الأنباري في مجال صناعة المحتوى التعليمي والحساب الذهني من رئيس مجلس محافظة الأنبار.",
    ],
  },
  {
    title: "تأسيس البرامج والمحتوى التعليمي",
    icon: Rocket,
    iconBg: "bg-purple-500/20 text-purple-300 border-purple-400/30",
    cardBorder: "border-purple-400/25 hover:border-purple-400/55",
    bulletColor: "text-purple-300",
    items: [
      "تأسيس برنامج العقل الخارق وتأليف منهجه التعليمي المكوّن من خمسة مستويات، والمعتمد لدى عدد من المدارس والمدربين.",
      "تأسيس منصة SUPER MIND لتوفير التدريب المجاني والتفاعلي في الحساب الذهني والذكاء.",
      "تنظيم وإدارة مسابقات تعليمية، والمساهمة في تنظيم مسابقة كانجارو الرياضيات العالمية لأول مرة في محافظة الأنبار.",
    ],
  },
];

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-14">
      {/* Top Banner Header */}
      <div className="clay-banner-lavender relative overflow-hidden text-white p-7 sm:p-11 lg:p-14">
        <div className="absolute -top-20 -right-16 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-16 w-80 h-80 bg-amber-300/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl space-y-5 text-right">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-white text-xs sm:text-sm font-bold shadow-sm">
            <Trophy className="w-4 h-4 text-amber-300 shrink-0" />
            <span>برنامج العقل الخارق | SUPER MIND</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-[2.75rem] font-black text-white leading-[1.28] tracking-tight">
            من نحن{" "}
            <span className="text-white/50 font-light mx-1">|</span>{" "}
            <span className="bg-gradient-to-l from-amber-200 via-yellow-100 to-amber-300 bg-clip-text text-transparent">
              برنامج العقل الخارق
            </span>
          </h1>

          <p className="text-base sm:text-xl font-bold text-indigo-50 leading-relaxed max-w-3xl">
            بإشراف{" "}
            <span className="text-amber-200 font-black">الأستاذ قتادة كريم</span>
            {" "}— مدرس رياضيات ومدرب دولي معتمد في الحساب الذهني ومؤسس برنامج العقل الخارق
          </p>

          <p className="text-indigo-100/90 text-sm sm:text-base leading-7 max-w-2xl">
            رحلة ريادية متكاملة لبناء جيل من الأبطال المبدعين، تجمع بين علم الرياضيات الأكاديمي، خوارزميات المعداد الياباني (السوروبان)، والتدريب الوميضي فلاش أنزان لتنمية أقصى طاقات الدماغ.
          </p>

          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            {[
              "تدريب أكثر من 1,000 طالب وطالبة",
              "منهج متكامل من 5 مستويات",
              "تمثيل دولي وحصد ألقاب «بطل الأبطال»",
            ].map((pill) => (
              <span
                key={pill}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#1E1448]/45 border border-white/20 text-indigo-50 text-xs font-bold backdrop-blur-sm"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span>{pill}</span>
              </span>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3.5 pt-2">
            <a
              href={getWhatsAppLink("مرحباً أستاذ قتادة كريم، يسعدني التواصل معك للتعرف أكثر على برنامج العقل الخارق.")}
              target="_blank"
              rel="noopener noreferrer"
              className="clay-btn-amber px-6 sm:px-7 py-3.5 font-black text-sm sm:text-base flex items-center gap-2"
            >
              <MessageCircle className="w-5 h-5" />
              <span>تواصل مع الأستاذ قتادة كريم</span>
            </a>

            <Link
              href="/curriculum"
              className="px-6 py-3.5 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-bold text-sm sm:text-base border border-white/25 backdrop-blur-md transition-colors flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4 text-amber-200" />
              <span>استعراض المناهج والحقائب التدريبية</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Profile: الأستاذ قتادة كريم */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#171338] via-[#1B1642] to-[#120E2C] text-white border border-amber-500/30 shadow-2xl p-6 sm:p-10 lg:p-14 space-y-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Photo Column (Top Badge Removed cleanly per request, frame & design preserved) */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="relative group w-full max-w-md">
              <div className="absolute -inset-1.5 bg-gradient-to-r from-amber-400 via-amber-200 to-yellow-500 rounded-3xl blur-md opacity-70 group-hover:opacity-100 transition duration-500" />
              <div className="relative rounded-3xl overflow-hidden bg-slate-950 border-2 border-amber-400/90 shadow-2xl">
                <Image
                  src={COACH_INFO.avatar}
                  alt="الصورة الرسمية للأستاذ قتادة كريم — مدرس رياضيات ومدرب دولي معتمد في الحساب الذهني"
                  width={600}
                  height={800}
                  priority
                  className="w-full h-auto object-cover object-top transform group-hover:scale-102 transition duration-500"
                />
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950 via-slate-950/85 to-transparent p-4 sm:p-5 text-right">
                  <div className="text-amber-400 font-extrabold text-xs sm:text-sm flex items-center gap-1.5 mb-1">
                    <Star className="w-4 h-4 fill-amber-400" />
                    <span>المؤسس والمشرف العام</span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed font-medium">
                    الأستاذ قتادة كريم — مدرس رياضيات ومدرب دولي معتمد في الحساب الذهني
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
              <span className="px-3 py-1 rounded-full bg-white/10 border border-white/15 text-slate-200 text-xs font-semibold flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                <span>العراق — الأنبار</span>
              </span>
              <span className="px-3 py-1 rounded-full bg-white/10 border border-white/15 text-slate-200 text-xs font-semibold flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
                <span>طالب ماجستير – التحليل العددي</span>
              </span>
              <span className="px-3 py-1 rounded-full bg-white/10 border border-white/15 text-slate-200 text-xs font-semibold flex items-center gap-1.5">
                <Medal className="w-3.5 h-3.5 text-yellow-400" />
                <span>مدرب دولي معتمد</span>
              </span>
            </div>

            {/* Founder Social Media Accounts (حسابات المؤسس في قسم «من نحن») */}
            <div className="mt-6 w-full max-w-md pt-5 border-t border-white/10 space-y-2.5 text-center">
              <span className="text-xs font-bold text-amber-300 block">
                حسابات التواصل للأستاذ قتادة كريم:
              </span>
              <FounderSocialRow />
            </div>
          </div>

          {/* Bio Column */}
          <div className="lg:col-span-7 space-y-6 text-right">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/15 border border-amber-400/40 text-amber-300 text-xs sm:text-sm font-bold">
              <Award className="w-4 h-4 text-amber-400" />
              <span>السيرة المهنية والإنجازات</span>
            </div>

            <div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
                الأستاذ{" "}
                <span className="bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-500 bg-clip-text text-transparent">
                  قتادة كريم
                </span>
              </h2>
              <p className="text-sm sm:text-lg font-bold text-amber-300 mt-2.5 leading-relaxed">
                مدرس رياضيات | مدرب دولي معتمد في الحساب الذهني | مؤسس برنامج العقل الخارق
              </p>
            </div>

            {/* النبذة المهنية */}
            <div className="rounded-3xl bg-white/[0.05] border border-white/10 p-5 sm:p-6 space-y-4">
              <h3 className="text-base sm:text-lg font-black text-amber-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span>النبذة المهنية</span>
              </h3>
              <div className="space-y-3.5 text-slate-200 text-sm sm:text-base leading-relaxed font-normal">
                <p>
                  مدرس رياضيات وطالب ماجستير في التحليل العددي، ومدرب معتمد في الحساب الذهني والسوروبان، متخصص في تنمية القدرات العقلية وتعزيز مهارات التفكير والتركيز لدى الأطفال.
                </p>
                <p>
                  يمتلك خبرة في تدريب أكثر من <strong className="text-amber-300">1,000 طالب وطالبة</strong>، وإعداد المدربين، وتأليف المناهج التعليمية، وتنظيم المسابقات والبطولات المحلية والدولية.
                </p>
                <p>
                  مؤسس <strong className="text-white">برنامج العقل الخارق</strong> ومؤلف منهجه التعليمي المكوّن من خمسة مستويات، ومؤسس منصة <strong className="text-amber-300">SUPER MIND</strong> الرقمية للتدريب والتعلم التفاعلي.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* أبرز المؤهلات والإنجازات — Balanced 2x2 Cards Grid */}
        <div className="pt-8 border-t border-white/10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
              <Trophy className="w-6 h-6 text-amber-400" />
              <span>أبرز المؤهلات والإنجازات</span>
            </h3>
            <span className="text-xs font-bold text-slate-400">
              مسيرة أكاديمية وتدريبية معتمدة محلياً ودولياً
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {ACHIEVEMENT_SECTIONS.map((sec) => {
              const Icon = sec.icon;
              return (
                <div
                  key={sec.title}
                  className={`rounded-3xl bg-white/[0.05] hover:bg-white/[0.08] border p-5 sm:p-6 space-y-4 transition-all duration-200 ${sec.cardBorder}`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0 ${sec.iconBg}`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <h4 className="text-base sm:text-lg font-black text-white">
                      {sec.title}
                    </h4>
                  </div>

                  <ul className="space-y-2.5 text-xs sm:text-sm text-slate-200 leading-relaxed">
                    {sec.items.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <CheckCircle2
                          className={`w-4 h-4 shrink-0 mt-1 ${sec.bulletColor}`}
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Champions Showcase: الأستاذ قتادة مع طلابه الأبطال */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-[#171338] via-[#1F184D] to-[#141033] text-white p-6 sm:p-10 border border-amber-500/30 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-5 flex justify-center">
            <div className="relative rounded-2xl overflow-hidden border-2 border-amber-400/80 shadow-2xl max-w-xs">
              <Image
                src="/images/coach-with-champions.jpg"
                alt="الأستاذ قتادة كريم مع أبطال العقل الخارق والكؤوس الذهبية"
                width={500}
                height={600}
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
          <div className="md:col-span-7 space-y-4 text-right">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold border border-amber-400/30">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>صناعة الأبطال والتتويج المستمر</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white">
              أبطال برنامج العقل الخارق في منصات التتويج
            </h3>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              الأستاذ قتادة كريم وسط طلابه المتوجين بالمراكز الأولى وكؤوس البطولة في مسابقات الحساب الذهني والسوروبان، تجسيداً حياً لثمار التدريب الاحترافي والشغف بصناعة قادة المستقبل.
            </p>
          </div>
        </div>
      </section>

      {/* Program Details: عن برنامج العقل الخارق */}
      <section className="clay-card p-8 sm:p-14 space-y-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-6 text-right">
            <div className="clay-pill inline-flex items-center gap-2 px-4 py-1.5 text-brand-700 dark:text-brand-200 text-xs sm:text-sm font-bold">
              <Brain className="w-4 h-4 text-brand-600" />
              <span>عن برنامج العقل الخارق | SUPER MIND</span>
            </div>

            <h3 className="text-2xl sm:text-4xl font-black text-[#1E1B3A] dark:text-white leading-tight">
              برنامج تعليمي متكامل ومتدرج المستويات
            </h3>

            <div className="space-y-4 text-[#554E82] dark:text-[#CEC9EC] text-sm sm:text-base leading-relaxed">
              <p>
                <strong className="text-[#1E1B3A] dark:text-white font-bold">العقل الخارق</strong> برنامج تعليمي متكامل ومتدرج المستويات، يهدف إلى تطوير مهارات الحساب الذهني وتنمية الذكاء والتركيز والذاكرة وسرعة الاستجابة، من خلال أساليب تدريبية حديثة تجمع بين التعلم والمتعة والتحدي.
              </p>
              <p>
                يتميز البرنامج بمنهج تدريبي منظم يناسب مختلف المستويات، ويعتمد على التدرج في اكتساب المهارات، مع تمارين تفاعلية وتقييمات تساعد على متابعة تطور المتعلم.
              </p>
              <div className="clay-card-sm p-5 bg-[#FFF8E6] dark:bg-[#332612] border border-amber-200 dark:border-amber-700/60 text-amber-950 dark:text-amber-200 font-bold text-sm leading-relaxed flex items-start gap-3">
                <Award className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <p>
                  <strong>يحظى منهج العقل الخارق باعتماد عدد من المدارس والمؤسسات التعليمية والمدربين</strong>، ويُستخدم في تدريب الطلبة وتنمية قدراتهم الحسابية والعقلية.
                </p>
              </div>
              <p>
                ونسعى من خلال تطبيق <strong className="text-brand-700 dark:text-brand-300 font-black">SUPER MIND</strong> إلى نقل تجربة التعلم إلى بيئة رقمية تفاعلية، تتيح للطلبة التدريب المستمر، وقياس مستوى تقدمهم، وتطوير مهاراتهم بطريقة ممتعة ومحفزة.
              </p>
            </div>

            {/* Vision Banner */}
            <div className="clay-banner-lavender p-6 text-white flex items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs text-amber-200 font-bold block">رسالتنا وهدفنا الأساسي:</span>
                <h4 className="text-2xl sm:text-3xl font-black text-white">
                  رؤيتنا: عقول اليوم… قادة الغد.
                </h4>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center shrink-0">
                <Sparkles className="w-8 h-8 text-amber-300" />
              </div>
            </div>
          </div>

          {/* Curriculum Showcase Image */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="relative group w-full">
              <div className="absolute -inset-2 bg-gradient-to-r from-amber-400 via-brand-500 to-indigo-600 rounded-[2.5rem] blur-lg opacity-40 group-hover:opacity-75 transition duration-500" />
              <div className="relative rounded-[2rem] overflow-hidden bg-slate-900 border-4 border-amber-400/80 shadow-2xl">
                <Image
                  src="/images/curriculum-books.jpg"
                  alt="سلسلة كتب ومناهج برنامج العقل الخارق — إعداد وتأليف الأستاذ قتادة كريم"
                  width={900}
                  height={600}
                  priority
                  className="w-full h-auto object-cover transform group-hover:scale-102 transition duration-500"
                />
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent p-4 text-center">
                  <span className="text-amber-300 font-black text-xs sm:text-sm block">
                    سلسلة حقائب ومناهج العقل الخارق
                  </span>
                  <span className="text-slate-300 text-xs font-medium">
                    منهج تعليمي متدرج المكوّن من خمسة مستويات
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 w-full">
              <Link
                href="/curriculum"
                className="clay-btn-purple w-full py-3.5 font-extrabold text-sm flex items-center justify-center gap-2"
              >
                <BookOpen className="w-4 h-4 text-amber-300" />
                <span>استعراض وتفاصيل طلب المناهج</span>
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
