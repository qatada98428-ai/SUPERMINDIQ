import React from "react";
import Image from "next/image";
import CurriculumOrderForm from "@/components/curriculum/CurriculumOrderForm";
import {
  BookOpen,
  MessageCircle,
  CheckCircle2,
  Sparkles,
  Calculator,
  PackageCheck,
  Building2,
} from "lucide-react";
import { getCurriculumOrderLink, getWhatsAppLink } from "@/lib/constants";

export const metadata = {
  title: "المناهج والحقائب التدريبية | برنامج العقل الخارق — تأليف أ. قتادة كريم",
  description:
    "تعرف على سلسلة كتب ومناهج برنامج العقل الخارق لإعداد وتأليف الأستاذ قتادة كريم، معتمد لدى المدارس والمؤسسات، واطلب حقيبة طفلك عبر واتساب.",
};

export default function CurriculumPage() {
  const levels = [
    {
      number: "0",
      title: "المستوى التمهيدي (Level 0)",
      badge: "تأسيس الصغار",
      badgeColor: "bg-purple-100 text-purple-800 border-purple-200",
      description:
        "مخصص للمبتدئين والأعمار المبكرة، يركز على بناء العلاقة الحسية مع خرزات العداد، تكوين الأعداد، والجمع والطرح البسيط والمباشر بدون أصدقاء.",
      topics: [
        "التعرف على أجزاء السوروبان ومحور الحساب",
        "حركة الخرزات السفلية والخرزة الخماسية",
        "الجمع والطرح البسيط (Direct Moves)",
        "بدء تنمية التركيز والذاكرة البصرية",
      ],
    },
    {
      number: "1",
      title: "المستوى الأول (Level 1)",
      badge: "المساعد الصغير",
      badgeColor: "bg-blue-100 text-blue-800 border-blue-200",
      description:
        "مرحلة الانطلاق في خوارزميات الحساب الذهني الاحترافي، تركز على إتقان قواعد أصدقاء الـ 5 جمعاً وطرحاً مع بدء التخيل بدون عداد مادي.",
      topics: [
        "إتقان قواعد أصدقاء الـ 5 الموجبة (+1، +2، +3، +4)",
        "إتقان قواعد أصدقاء الـ 5 السالبة (-1، -2، -3، -4)",
        "الانتقال من حركة الأصابع إلى العداد التخيلي",
        "تدريبات الفلاش أنزان الصوتية والوميضية",
      ],
    },
    {
      number: "2",
      title: "المستوى الثاني (Level 2)",
      badge: "المساعد الكبير",
      badgeColor: "bg-rose-100 text-rose-800 border-rose-200",
      description:
        "المستوى المتقدم للأبطال، يتناول قواعد أصدقاء الـ 10 وترحيل العشرات مع دمج العائلات، ومضاعفة سرعة الاستجابة الذهنية.",
      topics: [
        "إتقان قواعد أصدقاء الـ 10 (±1 إلى ±9)",
        "الترحيل والاستلاف بين خانات الآحاد والعشرات",
        "القواعد المشتركة والمركبة (أصدقاء 5 و 10 معاً)",
        "الاستعداد للبطولات والمسابقات السريعة",
      ],
    },
    {
      number: "★",
      title: "النسخ المخصصة للمدارس والمراكز",
      badge: "اعتماد رسمي",
      badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
      description:
        "نسخ مطبوعة مخصصة للمدارس الأهلية والمراكز التدريبية المتعاقدة بشعار وهوية المدرسة (مثل نسخ مدارس هبة الرحمن ومدارس النهضة الأهلية).",
      topics: [
        "طباعة شعار وهوية المدرسة على أغلفة المناهج",
        "خطة تدريب وتوزيع دروس معتمدة فصلياً وسنوياً",
        "تأهيل وتدريب الكادر التعليمي في المدرسة",
        "متابعة واختبارات دورية وشهادات للطلبة",
      ],
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white p-8 sm:p-14 border border-indigo-800/40 shadow-2xl">
        <div className="absolute -top-16 -right-16 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-5 text-right">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/20 border border-amber-400/30 text-amber-300 text-xs sm:text-sm font-bold">
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span>سلسلة المناهج الرسمية المعتمدة</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-tight">
            مناهج وحقائب <span className="text-gradient">برنامج العقل الخارق</span>
          </h1>

          <p className="text-lg sm:text-xl font-bold text-amber-300 leading-relaxed">
            إعداد وتأليف الأستاذ قتادة كريم — ماجستير رياضيات ومدرب دولي معتمد
          </p>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            منهاج تدريبي منظم ومتدرج المستويات يناسب مختلف الأعمار، يحظى باعتماد العديد من المدارس والمؤسسات التعليمية والمدربين، ومصمم لنقل الطفل من الصفر إلى مستوى البطولات العالمية.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-3">
            <a
              href={getCurriculumOrderLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm sm:text-base shadow-xl shadow-emerald-500/25 transition-all hover:scale-105 active:scale-95 flex items-center gap-2.5"
            >
              <MessageCircle className="w-5 h-5 text-amber-300" />
              <span>طلب المنهج التدريبي لطفلك عبر واتساب</span>
            </a>

            <a
              href={getWhatsAppLink("مرحباً أستاذ قتادة، أود الاستفسار عن اعتماد وتوريد مناهج العقل الخارق لمدرستنا / مركزنا التعليمي.")}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm sm:text-base border border-white/20 transition-colors flex items-center gap-2"
            >
              <Building2 className="w-4 h-4 text-amber-400" />
              <span>اعتماد المنهج للمدارس والمراكز</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Image Showcase: Physical Curriculum Books */}
      <section className="bg-white rounded-[2.5rem] p-6 sm:p-12 border border-slate-200/90 shadow-xl space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-bold">
            <Sparkles className="w-4 h-4 text-brand-600" />
            <span>معرض المناهج المطبوعة الرسمية</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900">
            سلسلة حقائب وكتب برنامج العقل الخارق
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            كتب ملونة ذات جودة طباعة عالية، تحوي تمارين تطبيقية متدرجة، رسومات توضيحية محفزة للأطفال، وبطاقات متابعة يومية.
          </p>
        </div>

        {/* 3D Showcase Framed Image */}
        <div className="relative group max-w-5xl mx-auto">
          <div className="absolute -inset-2 bg-gradient-to-r from-amber-400 via-brand-500 to-indigo-600 rounded-[2.5rem] blur-xl opacity-50 group-hover:opacity-75 transition duration-500" />
          <div className="relative rounded-[2rem] overflow-hidden bg-slate-950 border-4 border-amber-400/90 shadow-2xl">
            <Image
              src="/images/curriculum-books.jpg"
              alt="سلسلة كتب وحقائب برنامج العقل الخارق — إعداد وتأليف الأستاذ قتادة كريم"
              width={1200}
              height={800}
              priority
              className="w-full h-auto object-cover transform group-hover:scale-101 transition duration-500"
            />
            <div className="p-4 sm:p-6 bg-slate-950/95 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-right">
              <div>
                <span className="text-amber-400 font-extrabold text-sm sm:text-base block">
                  برنامج العقل الخارق — إعداد وتأليف الأستاذ قتادة كريم
                </span>
                <span className="text-slate-400 text-xs sm:text-sm">
                  رحلة مميزة لتنمية الذكاء والتركيز وسرعة الحساب لجميع الفئات العمرية
                </span>
              </div>
              <a
                href={getCurriculumOrderLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm shadow-md transition-transform hover:scale-105 shrink-0"
              >
                طلب نسختك الآن 📚
              </a>
            </div>
          </div>
        </div>

        {/* Interactive Order Form */}
        <div className="max-w-4xl mx-auto pt-4">
          <CurriculumOrderForm />
        </div>
      </section>

      {/* Levels Breakdown Grid */}
      <section className="space-y-8">
        <div className="text-right space-y-2">
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
            مستويات ومحاور المنهج التدريبي
          </h3>
          <p className="text-slate-600 text-sm">
            تم تصميم كل مستوى ليتوافق مع مرحلة نمو تفكير الطفل ويكسبه مهارات جديدة بتسلسل علمي دقيق.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {levels.map((lvl, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between space-y-6 text-right"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold border ${lvl.badgeColor}`}
                  >
                    {lvl.badge}
                  </span>
                  <span className="w-10 h-10 rounded-2xl bg-slate-900 text-amber-400 font-mono font-black text-lg flex items-center justify-center shadow-sm">
                    {lvl.number}
                  </span>
                </div>

                <h4 className="text-xl sm:text-2xl font-bold text-slate-900">
                  {lvl.title}
                </h4>

                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                  {lvl.description}
                </p>

                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <span className="text-[11px] font-bold text-slate-500 block">
                    أبرز المهارات المكتسبة في هذا المستوى:
                  </span>
                  <div className="space-y-1.5">
                    {lvl.topics.map((t, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 text-xs text-slate-700 font-medium"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>{t}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <a
                  href={getCurriculumOrderLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 rounded-xl bg-slate-100 hover:bg-brand-50 text-slate-800 hover:text-brand-700 font-bold text-xs transition-colors flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>طلب هذا المستوى لطفلك</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bag Contents Details */}
      <section className="bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 text-white rounded-[2.5rem] p-8 sm:p-14 border border-indigo-800/40 space-y-8">
        <div className="text-right max-w-2xl space-y-2">
          <span className="px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold border border-amber-400/30 inline-block">
            الحقيبة المتكاملة
          </span>
          <h3 className="text-2xl sm:text-4xl font-black text-white">
            ماذا تشمل حقيبة برنامج العقل الخارق؟
          </h3>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            يحصل الطالب عند طلب المنهج على أدوات تعليمية متكاملة تضمن استمرار التدريب والتحفيز في المنزل والمدرسة.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 space-y-3 text-right">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
              <BookOpen className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-white">كتاب المنهج التدريبي</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              كتاب تدريبي ملون يحتوي على مئات المسائل المتدرجة، الألعاب الذهنية، وشرح القواعد بأسلوب مبسط وشيق.
            </p>
          </div>

          <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 space-y-3 text-right">
            <div className="w-12 h-12 rounded-xl bg-brand-500/20 flex items-center justify-center text-brand-400">
              <Calculator className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-white">عداد السوروبان الاحترافي</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              عداد سوروبان ياباني مصمم خصيصاً لأصابع الأطفال بأزرار تصفير سريعة وجودة عالية تعيش طويلاً.
            </p>
          </div>

          <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 space-y-3 text-right">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <PackageCheck className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-white">بطاقات وسجل المتابعة</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              بطاقات وميض فلاش وجدول متابعة أسبوعي يمكن أولياء الأمور والمدربين من رصد تطور سرعة الحساب بدقة.
            </p>
          </div>
        </div>

        {/* Big WhatsApp CTA */}
        <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 text-right">
          <div className="space-y-1">
            <h4 className="text-xl sm:text-2xl font-black text-white">
              جاهز لطلب المنهج التدريبي لطفلك؟
            </h4>
            <p className="text-xs sm:text-sm text-slate-400">
              تواصل مباشرة مع الأستاذ قتادة كريم لتحديد المستوى المناسب لعمر طفلك وسرعة شحن الحقيبة.
            </p>
          </div>

          <a
            href={getCurriculumOrderLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-base shadow-xl shadow-emerald-500/30 transition-all hover:scale-105 active:scale-95 flex items-center gap-2.5 shrink-0"
          >
            <MessageCircle className="w-5 h-5 text-amber-300" />
            <span>طلب المنهج عبر واتساب 📚</span>
          </a>
        </div>
      </section>
    </div>
  );
}
