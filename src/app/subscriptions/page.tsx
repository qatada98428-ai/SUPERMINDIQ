import React from "react";
import {
  CheckCircle2,
  Sparkles,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";
import { PLATFORM_INFO, getWhatsAppLink } from "@/lib/constants";

export default function SubscriptionsPage() {
  const plans = [
    {
      id: "student",
      name: "باقة البطل (طالب فردي)",
      badge: "الأكثر شيوعاً للأهالي",
      popular: false,
      description: "اشتراك فردي للطفل أو الطالب للتدريب في المنزل وتطوير مهارات الحساب الذهني.",
      features: [
        "وصول غير محدود لعداد السوروبان التفاعلي",
        "تمارين الفلاش أنزان مع تحكم كامل بالسرعة",
        "بنك تحديات الذكاء وأسئلة الأولمبياد",
        "لوحة متابعة لقياس الدقة والسرعة اليومية",
        "تقارير تقدم شهرية وإنجازات تحفيزية",
        "دعم فني عبر واتساب",
      ],
      whatsappMsg: "مرحباً إدارة العقل الخارق، أود الاستفسار والاشتراك في (باقة البطل - طالب فردي).",
      cta: "طلب اشتراك الطالب عبر واتساب",
    },
    {
      id: "trainer",
      name: "باقة المدرب المعتمد",
      badge: "الخيار الاحترافي",
      popular: true,
      description: "للمدربين المستقلين والمعلمين لتنظيم وتدريب حتى 50 طالباً بمجموعات ذكية.",
      features: [
        "كل ميزات باقة الطالب كاملة",
        "إدارة حتى 50 طالباً موزعون على مجموعات",
        "لوحة تحكم المدرب مع إحصائيات كل طالب",
        "إمكانية إرسال الواجبات والتحديات الموجهة",
        "تقارير أداء جاهزة للطباعة والمشاركة مع أولياء الأمور",
        "شهادة رخصة مدرب معتمد (SUPER MIND Gold)",
        "أولوية في الدعم الفني والاستشارات التعليمية",
      ],
      whatsappMsg: "مرحباً إدارة العقل الخارق، أود الاستفسار والاشتراك في (باقة المدرب المعتمد - حتى 50 طالباً).",
      cta: "طلب باقة المدرب عبر واتساب",
    },
    {
      id: "academy",
      name: "باقة المراكز والأكاديميات",
      badge: "للمؤسسات والمدارس",
      popular: false,
      description: "ترخيص كامل للمدارس، المراكز التعليمية، والأكاديميات المتخصصة مع حسابات متعددة.",
      features: [
        "سعة طلاب مرنة (100 إلى 500+ طالب)",
        "حسابات متعددة للمدربين والإداريين",
        "نظام الشاشات الكبيرة والعروض التقديمية في القاعات",
        "تخصيص مستويات التدريب والبطولات الداخلية",
        "جلسات تدريبية وإعداد كوادر المركز التدريبي",
        "اتفاقية ترخيص رسمية معتمدة",
      ],
      whatsappMsg: "مرحباً إدارة العقل الخارق، نود الاستفسار عن ترخيص (باقة المراكز والأكاديميات) والخصومات الجماعية.",
      cta: "طلب ترخيص الأكاديميات عبر واتساب",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-bold">
          <Sparkles className="w-4 h-4 text-brand-600" />
          <span>خطط ورخص الاشتراك الرسمية</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900">
          اختر الباقة المناسبة لطموحك التدريبي
        </h1>
        <p className="text-slate-600 text-base leading-relaxed">
          سواء كنت ولي أمر يبحث عن تفوق طفله، مدرباً طموحاً يقود فصولاً دراسية، أو أكاديمية تسعى لاعتماد المنصة في مناهجها.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
        {plans.map((plan) => {
          const directLink = getWhatsAppLink(plan.whatsappMsg);
          return (
            <div
              key={plan.id}
              className={`relative bg-white rounded-3xl p-8 border flex flex-col justify-between transition-all duration-300 hover:shadow-xl ${
                plan.popular
                  ? "border-2 border-brand-600 shadow-card lg:-translate-y-2"
                  : "border-slate-200 shadow-sm"
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3.5 right-8 px-4 py-1 rounded-full bg-brand-600 text-white text-xs font-bold shadow-md">
                  {plan.badge}
                </span>
              )}

              <div className="space-y-6">
                <div>
                  {!plan.popular && (
                    <span className="text-xs font-bold text-slate-500 block mb-1">
                      {plan.badge}
                    </span>
                  )}
                  <h3 className="text-2xl font-black text-slate-900">{plan.name}</h3>
                  <p className="text-slate-600 text-xs sm:text-sm mt-2 leading-relaxed">
                    {plan.description}
                  </p>
                </div>

                <div className="py-4 border-y border-slate-100 space-y-1">
                  <div className="text-xs text-slate-500 font-medium">طريقة الاشتراك:</div>
                  <div className="text-emerald-700 font-bold text-sm flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>تفعيل مباشر ومتابعة عبر واتساب الإدارة</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <span className="text-xs font-bold text-slate-900 block">
                    المزايا والخصائص المتضمنة:
                  </span>
                  <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600">
                    {plan.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-8 mt-8 border-t border-slate-100">
                <a
                  href={directLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full py-3.5 px-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-md ${
                    plan.popular
                      ? "bg-brand-600 hover:bg-brand-700 text-white shadow-brand-500/25"
                      : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20"
                  }`}
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{plan.cta}</span>
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* WhatsApp Help Banner */}
      <div className="bg-slate-900 text-white p-8 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-right">
          <h3 className="text-xl font-bold">هل تحتاج إلى استشارة لتحديد الباقة الأنسب؟</h3>
          <p className="text-slate-400 text-xs sm:text-sm">
            فريق الدعم الفني والأكاديمي جاهز للإجابة على جميع الاستفسارات عبر رقم الإدارة الرسمي:{" "}
            <span dir="ltr" className="font-mono text-emerald-400 font-bold">
              {PLATFORM_INFO.whatsappNumber}
            </span>
          </p>
        </div>
        <a
          href={getWhatsAppLink("مرحباً إدارة العقل الخارق، أرغب في استشارة حول الباقة الأنسب لطلابي.")}
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shrink-0 flex items-center gap-2"
        >
          <MessageCircle className="w-5 h-5" />
          <span>تحدث معنا عبر واتساب</span>
        </a>
      </div>
    </div>
  );
}
