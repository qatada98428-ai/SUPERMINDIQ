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
} from "lucide-react";
import { COACH_INFO, getWhatsAppLink } from "@/lib/constants";

export const metadata = {
  title: "من نحن | برنامج العقل الخارق — إشراف أ. قتادة كريم",
  description:
    "تعرف على برنامج العقل الخارق ومؤسسه الأستاذ قتادة كريم، ماجستير رياضيات ومدرب حساب ذهني دولي معتمد وبطل الأبطال في المسابقة العالمية 2024.",
};

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16">
      {/* Top Banner Header */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white p-8 sm:p-14 border border-indigo-800/40 shadow-2xl">
        <div className="absolute -top-16 -right-16 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-5 text-right">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/20 border border-amber-400/30 text-amber-300 text-xs sm:text-sm font-bold">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>برنامج العقل الخارق | SUPER MIND</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-tight">
            من نحن | <span className="text-gradient">برنامج العقل الخارق</span>
          </h1>

          <p className="text-lg sm:text-2xl font-bold text-amber-300 leading-relaxed">
            برنامج العقل الخارق بإشراف الأستاذ قتادة كريم وهو ماجستير رياضيات ومدرب حساب ذهني دولي معتمد
          </p>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            رحلة ريادية متكاملة لبناء جيل من الأبطال المبدعين، تجمع بين علم الرياضيات الأكاديمي، خوارزميات العداد الصيني والياباني (السوروبان)، والتدريب الوميضي فلاش أنزان لتنمية أقصى طاقات الدماغ.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-3">
            <a
              href={getWhatsAppLink("مرحباً أستاذ قتادة كريم، يسعدني التواصل معك للتعرف أكثر على برنامج العقل الخارق.")}
              target="_blank"
              rel="noopener noreferrer"
              className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-sm sm:text-base shadow-lg shadow-amber-500/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <MessageCircle className="w-5 h-5 text-slate-950" />
              <span>تواصل مع الأستاذ قتادة كريم</span>
            </a>

            <Link
              href="/curriculum"
              className="px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm sm:text-base border border-white/20 transition-colors flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>استعراض المناهج والحقائب التدريبية</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Profile: الأستاذ قتادة كريم */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white border border-amber-500/30 shadow-2xl p-8 sm:p-12 lg:p-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Photo Column */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="relative group w-full max-w-md">
              <div className="absolute -inset-1.5 bg-gradient-to-r from-amber-400 via-amber-200 to-yellow-500 rounded-3xl blur-md opacity-70 group-hover:opacity-100 transition duration-500" />
              <div className="relative rounded-3xl overflow-hidden bg-slate-950 border-2 border-amber-400/90 shadow-2xl">
                <Image
                  src={COACH_INFO.avatar}
                  alt="الصورة الرسمية للأستاذ قتادة كريم — ماجستير رياضيات ومدرب دولي معتمد"
                  width={600}
                  height={800}
                  priority
                  className="w-full h-auto object-cover object-top transform group-hover:scale-102 transition duration-500"
                />
                <div className="absolute top-4 right-4 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 px-3.5 py-1.5 rounded-full font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-lg">
                  <Trophy className="w-4 h-4 fill-slate-950" />
                  <span>بطل الأبطال 2024</span>
                </div>
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950 via-slate-950/85 to-transparent p-4 sm:p-5 text-right">
                  <div className="text-amber-400 font-extrabold text-xs sm:text-sm flex items-center gap-1.5 mb-1">
                    <Star className="w-4 h-4 fill-amber-400" />
                    <span>المؤسس والمشرف العام</span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed font-medium">
                    الأستاذ قتادة كريم — ماجستير في الرياضيات ومدرب حساب ذهني دولي معتمد
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
              <span className="px-3 py-1 rounded-full bg-slate-800/90 border border-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                <span>العراق — الأنبار — الرمادي</span>
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-800/90 border border-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
                <span>ماجستير في الرياضيات</span>
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-800/90 border border-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5">
                <Medal className="w-3.5 h-3.5 text-yellow-400" />
                <span>مدرب دولي معتمد</span>
              </span>
            </div>
          </div>

          {/* Bio & Achievements Column */}
          <div className="lg:col-span-7 space-y-6 text-right">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/15 border border-amber-400/40 text-amber-300 text-xs sm:text-sm font-bold">
              <Award className="w-4 h-4 text-amber-400" />
              <span>السيرة المهنية والإنجازات</span>
            </div>

            <div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
                الأستاذ <span className="bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-500 bg-clip-text text-transparent">قتادة كريم</span>
              </h2>
              <p className="text-base sm:text-lg font-bold text-amber-400 mt-2">
                مدرس رياضيات، ومدرب دولي معتمد في الحساب الذهني، وصانع محتوى تعليمي
              </p>
            </div>

            {/* Exact Official Bio */}
            <div className="space-y-4 text-slate-300 text-sm sm:text-base leading-relaxed font-normal">
              <p>
                <strong className="text-white">الأستاذ قتادة كريم</strong>، مدرس رياضيات حاصل على درجة <strong>الماجستير في الرياضيات</strong>، ومدرب دولي معتمد في الحساب الذهني، وصانع محتوى تعليمي، متخصص في تنمية القدرات العقلية وتعزيز مهارات التركيز وسرعة البديهة لدى الأطفال.
              </p>
              <p>
                شارك في العديد من المسابقات المحلية والوطنية والدولية في الحساب الذهني ومكعب الروبيك، وحقق مراكز متقدمة، من أبرزها لقب <strong className="text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/30">مركز بطل الأبطال في المسابقة العالمية للحساب الذهني لعام 2024</strong>.
              </p>
            </div>

            {/* Key Achievements Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">بطل الأبطال 2024</h4>
                  <p className="text-xs text-slate-400 mt-0.5">في المسابقة العالمية للحساب الذهني والسرعة الفائقة.</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-brand-500/20 text-brand-400 shrink-0">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">ماجستير رياضيات</h4>
                  <p className="text-xs text-slate-400 mt-0.5">تأسيس منهجي أكاديمي رصين ومخرجات تعليمية متقدمة.</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
                  <Medal className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">مدرب دولي معتمد</h4>
                  <p className="text-xs text-slate-400 mt-0.5">إعداد وتأهيل مدربي ومحترفي السوروبان والمراكز التعليمية.</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400 shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">صانع محتوى تعليمي</h4>
                  <p className="text-xs text-slate-400 mt-0.5">نشر ثقافة الرياضيات الذكية وتبسيط المفاهيم لملايين الطلاب.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Champions Showcase: الأستاذ قتادة مع طلابه الأبطال */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-10 border border-amber-500/30 shadow-xl">
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
      <section className="bg-white rounded-3xl p-8 sm:p-14 border border-slate-200 shadow-sm space-y-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-6 text-right">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs sm:text-sm font-bold">
              <Brain className="w-4 h-4 text-brand-600" />
              <span>عن برنامج العقل الخارق | SUPER MIND</span>
            </div>

            <h3 className="text-2xl sm:text-4xl font-black text-slate-900 leading-tight">
              برنامج تعليمي متكامل ومتدرج المستويات
            </h3>

            <div className="space-y-4 text-slate-600 text-sm sm:text-base leading-relaxed">
              <p>
                <strong className="text-slate-900 font-bold">العقل الخارق</strong> برنامج تعليمي متكامل ومتدرج المستويات، يهدف إلى تطوير مهارات الحساب الذهني وتنمية الذكاء والتركيز والذاكرة وسرعة الاستجابة، من خلال أساليب تدريبية حديثة تجمع بين التعلم والمتعة والتحدي.
              </p>
              <p>
                يتميز البرنامج بمنهج تدريبي منظم يناسب مختلف المستويات، ويعتمد على التدرج في اكتساب المهارات، مع تمارين تفاعلية وتقييمات تساعد على متابعة تطور المتعلم.
              </p>
              <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 font-bold text-sm leading-relaxed flex items-start gap-3">
                <Award className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                <p>
                  <strong>يحظى منهج العقل الخارق باعتماد عدد من المدارس والمؤسسات التعليمية والمدربين</strong>، ويُستخدم في تدريب الطلبة وتنمية قدراتهم الحسابية والعقلية.
                </p>
              </div>
              <p>
                ونسعى من خلال تطبيق <strong className="text-brand-700 font-black">SUPER MIND</strong> إلى نقل تجربة التعلم إلى بيئة رقمية تفاعلية، تتيح للطلبة التدريب المستمر، وقياس مستوى تقدمهم، وتطوير مهاراتهم بطريقة ممتعة ومحفزة.
              </p>
            </div>

            {/* Vision Banner */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-brand-600 via-indigo-600 to-brand-700 text-white shadow-xl flex items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs text-amber-300 font-bold block">رسالتنا وهدفنا الأساسي:</span>
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
                    المستوى التمهيدي (0) • المستوى الأول (1) • المستوى الثاني (2)
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 w-full">
              <Link
                href="/curriculum"
                className="w-full py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
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
