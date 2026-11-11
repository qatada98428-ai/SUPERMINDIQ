/**
 * SUPER MIND — Comprehensive Bilingual Translation Dictionary (AR / EN)
 * Preserves brand identities, mathematical definitions, and technical integrity.
 */

export type Language = "ar" | "en";

export interface TranslationDictionary {
  [key: string]: {
    ar: string;
    en: string;
  };
}

export const TRANSLATIONS: TranslationDictionary = {
  // Brand & Slogans
  platformName: {
    ar: "برنامج العقل الخارق",
    en: "SUPER MIND Program",
  },
  platformTitle: {
    ar: "منصة برنامج العقل الخارق",
    en: "SUPER MIND Platform",
  },
  tagline: {
    ar: "من الصفر إلى الاحتراف… رحلة نحو عقلٍ خارق!",
    en: "From Scratch to Mastery… A Journey Towards a Super Mind!",
  },
  heroBadge: {
    ar: "منصة عربية متكاملة لتعليم الحساب الذهني من الصفر إلى الاحتراف.",
    en: "Integrated Arabic platform for teaching mental arithmetic from scratch to mastery.",
  },
  heroDesc: {
    ar: "اكتشف تجربة تعليمية تفاعلية تجمع بين الحساب الذهني وتنمية القدرات العقلية، من خلال مستويات متدرجة، وأدوات تدريبية متطورة، وتمارين ممتعة وتحديات تحفّز الإبداع والإنجاز.",
    en: "Discover an interactive educational experience combining mental math and cognitive development through progressive levels, advanced training tools, fun exercises, and inspiring challenges.",
  },
  heroMotto: {
    ar: "تعلّم بذكاء • تدرّب بثقة • تحدَّ قدراتك • اصنع إنجازك",
    en: "Learn Smart • Train Confidently • Challenge Yourself • Create Your Achievement",
  },
  freePlatformBanner: {
    ar: "التعلّم والتدريب مجاناً للجميع",
    en: "Learning & Training is Free for Everyone",
  },
  startFreeTraining: {
    ar: "ابدأ التدريب مجاناً 🚀",
    en: "Start Training Free 🚀",
  },
  exploreMentalMath: {
    ar: "استعراض أقسام الحساب الذهني",
    en: "Explore Mental Math Sections",
  },
  contactWhatsApp: {
    ar: "تواصل عبر واتساب",
    en: "Contact via WhatsApp",
  },

  // Navbar Links
  navHome: {
    ar: "الرئيسية",
    en: "Home",
  },
  navLearn: {
    ar: "قسم التعلم",
    en: "Learn Portal",
  },
  navMentalMath: {
    ar: "الحساب الذهني",
    en: "Mental Math",
  },
  navAbacus: {
    ar: "العداد التفاعلي (السوروبان)",
    en: "Interactive Abacus (Soroban)",
  },
  navFlashAnzan: {
    ar: "مدرب الفلاش أنزان",
    en: "Flash Anzan Trainer",
  },
  navTeamsBattle: {
    ar: "تحدي الفرق والبطولات",
    en: "Teams Battle Arena",
  },
  navMultDiv: {
    ar: "الضرب والقسمة على السوروبان",
    en: "Multiplication & Division",
  },
  navIntelligence: {
    ar: "أسئلة الذكاء",
    en: "IQ & Math Quizzes",
  },
  navCurriculum: {
    ar: "المناهج",
    en: "Curriculum Books",
  },
  navAbout: {
    ar: "من نحن",
    en: "About Us",
  },
  navTrainers: {
    ar: "دليل المدربين",
    en: "Trainers Directory",
  },
  navSchools: {
    ar: "دليل المدارس",
    en: "Schools Directory",
  },
  navSupporters: {
    ar: "شركاء العقول",
    en: "Platform Supporters",
  },
  navSupport: {
    ar: "الدعم الفني",
    en: "Technical Support",
  },
  navContact: {
    ar: "تواصل معنا",
    en: "Contact Us",
  },
  navStudentDashboard: {
    ar: "لوحة الطالب",
    en: "Student Portal",
  },
  navTrainerDashboard: {
    ar: "لوحة المدرب",
    en: "Trainer Portal",
  },
  navLogin: {
    ar: "دخول الحساب",
    en: "Login",
  },
  navRegister: {
    ar: "حساب جديد",
    en: "Sign Up",
  },
  navPrivacy: {
    ar: "سياسة الخصوصية",
    en: "Privacy Policy",
  },
  navTerms: {
    ar: "شروط الاستخدام",
    en: "Terms of Service",
  },

  // Controls & Badges
  lightMode: {
    ar: "الوضع النهاري",
    en: "Light Mode",
  },
  darkMode: {
    ar: "الوضع الليلي",
    en: "Dark Mode",
  },
  soundOn: {
    ar: "المؤثرات الصوتية مفعلة",
    en: "Sound FX Enabled",
  },
  soundOff: {
    ar: "صامت (بدون صوت)",
    en: "Sound Muted",
  },
  languageToggle: {
    ar: "English",
    en: "العربية",
  },
  directoryDropdown: {
    ar: "الأدلة والشركاء",
    en: "Directories & Partners",
  },
  trainerDirectoryFeeNotice: {
    ar: "الاشتراك السنوي للإدراج في الدليل التعريفي: 25,000 دينار عراقي",
    en: "Annual listing fee for directory profile: 25,000 IQD",
  },
  schoolDirectoryFeeNotice: {
    ar: "الاشتراك السنوي لإدراج المؤسسة في الدليل: 75,000 دينار عراقي",
    en: "Annual institution listing fee: 75,000 IQD",
  },

  // Common UI words
  searchPlaceholder: {
    ar: "بحث بالاسم أو المحافظة...",
    en: "Search by name or governorate...",
  },
  filterAll: {
    ar: "الكل",
    en: "All",
  },
  governorate: {
    ar: "المحافظة / الدولة",
    en: "Governorate / Country",
  },
  verifiedListing: {
    ar: "مدرج ومعتمد في الدليل",
    en: "Verified Directory Listing",
  },
  applyForListing: {
    ar: "أدرج اسمك في دليل المدربين",
    en: "List Your Profile in Directory",
  },
  applyForSchoolListing: {
    ar: "أدرج مدرستك في المنصة",
    en: "List Your School on Platform",
  },
  becomeSupporter: {
    ar: "كن داعماً للمنصة",
    en: "Become a Platform Supporter",
  },
  submitSupportReport: {
    ar: "إرسال بلاغ الدعم الفني",
    en: "Send Support Report",
  },
  backToHome: {
    ar: "العودة للرئيسية",
    en: "Back to Home",
  },
  nextStep: {
    ar: "الخطوة التالية",
    en: "Next Step",
  },
  prevStep: {
    ar: "الخطوة السابقة",
    en: "Previous Step",
  },
  reset: {
    ar: "إعادة ضبط",
    en: "Reset",
  },
  correctAnswer: {
    ar: "إجابة صحيحة! أحسنت 🌟",
    en: "Correct Answer! Well done 🌟",
  },
  wrongAnswer: {
    ar: "حاول مرة أخرى بثقة 💪",
    en: "Try again with confidence 💪",
  },
};

export function getTranslation(key: string, lang: Language): string {
  if (TRANSLATIONS[key] && TRANSLATIONS[key][lang]) {
    return TRANSLATIONS[key][lang];
  }
  return key;
}
