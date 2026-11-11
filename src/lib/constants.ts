export const PLATFORM_INFO = {
  name: "برنامج العقل الخارق",
  platformTitle: "منصة برنامج العقل الخارق",
  enName: "SUPER MIND",
  tagline: "من الصفر إلى الاحتراف… رحلة نحو عقلٍ خارق!",
  motto: "تعلّم بذكاء • تدرّب بثقة • تحدَّ قدراتك • اصنع إنجازك",
  freeEducationBadge: "التعلّم والتدريب مجاناً للجميع",
  whatsappNumber: "+9647806086016",
  whatsappRaw: "9647806086016",
  email: "supermindiq@gmail.com",
  supportEmail: "supermindiq@gmail.com",
  location: "العراق - الأنبار - الرمادي / متاح لجميع المحافظات والدول العربية",
};

// Official accounts for SUPER MIND program
export const OFFICIAL_SOCIAL_LINKS = [
  { platform: "Instagram", label: "إنستغرام العقل الخارق", href: "https://www.instagram.com/4.math/", handle: "@4.math", color: "from-pink-500 via-rose-500 to-purple-600" },
  { platform: "TikTok", label: "تيك توك العقل الخارق", href: "https://www.tiktok.com/@4.math", handle: "@4.math", color: "from-slate-900 to-slate-800" },
];

// Personal accounts for Author Coach Qatadah Karim
export const AUTHOR_SOCIAL_LINKS = [
  { platform: "Instagram", label: "إنستغرام الأستاذ قتادة", href: "https://www.instagram.com/4doot/", handle: "@4doot", color: "from-pink-500 via-purple-500 to-indigo-600" },
  { platform: "Facebook", label: "فيسبوك الأستاذ قتادة", href: "https://www.facebook.com/qatada98", handle: "qatada98", color: "from-blue-600 to-blue-800" },
  { platform: "YouTube", label: "يوتيوب الأستاذ قتادة", href: "https://www.youtube.com/@4doot", handle: "@4doot", color: "from-red-600 to-rose-700" },
  { platform: "TikTok", label: "تيك توك الأستاذ قتادة", href: "https://www.tiktok.com/@4doot", handle: "@4doot", color: "from-slate-900 to-slate-800" },
];

// Trainer / Coach Qatadah Karim Profile
export const COACH_INFO = {
  name: "الأستاذ قتادة كريم",
  title: "مدرب حساب ذهني معتمد وأستاذ رياضيات",
  subtitle: "مؤسس ومشرف عام منصة العقل الخارق (SUPER MIND)",
  avatar: "/images/coach-official.jpg",
  championsAvatar: "/images/coach-with-champions.jpg",
  experience: "+10 سنوات خبرة في تدريس الرياضيات وبناء أبطال الحساب الذهني",
  bio: "مدرب حساب ذهني دولي معتمد وأستاذ رياضيات خبير في تنمية المهارات الإدراكية والتفكير السريع لدى الأطفال والناشئة. حقق طلابه العديد من الجوائز والكؤوس الذهبية في بطولات الحساب الذهني والسوروبان والفلاش أنزان.",
  specialties: [
    "تدريب خوارزميات العداد الياباني (السوروبان) من الصفر إلى الاحتراف",
    "تطوير تقنيات الفلاش أنزان (Flash Anzan) بسرعة استجابة فائقة",
    "ربط الحساب الذهني بالتفوق الدراسي الأكاديمي في مادة الرياضيات",
    "إعداد وتأهيل الطلاب للمسابقات الوطنية والدولية وأولمبياد الذكاء",
  ],
  stats: [
    { label: "بطولات وكؤوس ذهبية", value: "+35 بطولة", highlight: "ذهبية" },
    { label: "طالب وبطل تم تدريبهم", value: "+1,200", highlight: "بطل" },
    { label: "معدل سرعة استجابة فلاش", value: "0.3s", highlight: "ثانية" },
    { label: "نسبة رضا وتفوق الطلاب", value: "99.2%", highlight: "ممتاز" },
  ],
};

// Direct WhatsApp helper
export function getWhatsAppLink(customMessage?: string): string {
  const phone = PLATFORM_INFO.whatsappRaw;
  const defaultMsg = "مرحباً إدارة العقل الخارق (SUPER MIND)، أود الاستفسار عن برامج الحساب الذهني وتفاصيل الاشتراكات.";
  const text = encodeURIComponent(customMessage || defaultMsg);
  return `https://wa.me/${phone}?text=${text}`;
}

// Trainer Directory Application WhatsApp Link (Fee: 25,000 IQD/year)
export function getTrainerApplicationLink(): string {
  const phone = PLATFORM_INFO.whatsappRaw;
  const msg = "مرحباً، أرغب بالتقديم لإدراج معلوماتي في دليل مدربي منصة العقل الخارق، والاشتراك السنوي البالغ 25,000 دينار عراقي. أرجو تزويدي بالتفاصيل والخطوات المطلوبة.";
  return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
}

// School Directory Application WhatsApp Link (Fee: 75,000 IQD/year)
export function getSchoolApplicationLink(): string {
  const phone = PLATFORM_INFO.whatsappRaw;
  const msg = "مرحباً، نرغب بإدراج مدرستنا أو مؤسستنا التعليمية ضمن دليل المؤسسات التي تستخدم منصة العقل الخارق، والاشتراك السنوي البالغ 75,000 دينار عراقي. نرجو تزويدنا بالتفاصيل.";
  return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
}

// Platform Supporter Application WhatsApp Link
export function getSupporterApplicationLink(): string {
  const phone = PLATFORM_INFO.whatsappRaw;
  const msg = "مرحباً، أرغب بالانضمام كشريك وداعم لمنصة العقل الخارق (SUPER MIND) للمساهمة في استمرار مجانية التعليم ونشر المعرفة. أرجو تزويدي بتفاصيل الدعم.";
  return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
}

// Technical Support WhatsApp Link
export function getTechnicalSupportLink(pageName?: string): string {
  const phone = PLATFORM_INFO.whatsappRaw;
  const msg = `مرحباً فريق الدعم الفني لمنصة العقل الخارق (SUPER MIND)،
أود الإبلاغ عن مشكلة فنية واجهتني:
• الصفحة: ${pageName || "المنصة"}
• وصف المشكلة: 
• نوع الجهاز المتصفح: `;
  return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
}

export function getCurriculumOrderLink(): string {
  const phone = PLATFORM_INFO.whatsappRaw;
  const msg =
`مرحباً أستاذ قتادة كريم، أود طلب منهج برنامج العقل الخارق (SUPER MIND).

بيانات الطالب لطلب المنهج المناسب:
• الاسم: 
• العمر: 
• الصف الدراسي: 
• العنوان / المدينة: 
• هل تدرب سابقاً على الحساب الذهني؟ (نعم / لا): 
• في حال تدرب سابقاً، ما هي المستويات التي أنجزها؟: `;
  return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
}

export const NAV_LINKS = [
  { href: "/", label: "الرئيسية", enLabel: "Home" },
  { href: "/mental-arithmetic", label: "الحساب الذهني", enLabel: "Mental Math" },
  { href: "/trainers", label: "الاعتمادات والشركاء", enLabel: "Accreditations & Partners" },
  { href: "/supporters", label: "الداعمون", enLabel: "Supporters", isSpecial: true },
  { href: "/about", label: "من نحن", enLabel: "About Us" },
  { href: "/support", label: "الدعم الفني", enLabel: "Support" },
];

export const MOCK_STUDENT = {
  id: "std-001",
  name: "علي حيدر",
  avatar: "/avatars/student-1.png",
  level: "المستوى الثالث: السوروبان المتقدم",
  levelNumber: 3,
  trainerName: "أ. قتادة كريم",
  groupName: "أبطال السوروبان - المجموعة أ",
  streakDays: 14,
  points: 3420,
  dailyGoal: { current: 18, target: 20 },
  stats: {
    totalExercises: 685,
    accuracyRate: 95.2,
    avgSpeedSeconds: 0.85,
    abacusSessions: 142,
    flashAnzanSessions: 260,
    intelligenceChallenges: 83,
  },
  recentSessions: [
    {
      id: "s-1",
      type: "flash-anzan",
      title: "فلاش أنزان - خانتين (6 أرقام)",
      time: "منذ 25 دقيقة",
      score: "9/10",
      accuracy: 90,
      duration: "0.7s لكل رقم",
      status: "success",
    },
    {
      id: "s-2",
      type: "abacus",
      title: "تدريب العداد - أصدقاء العشرة والجمع المركب",
      time: "منذ ساعتين",
      score: "15/15",
      accuracy: 100,
      duration: "4 دقائق",
      status: "success",
    },
    {
      id: "s-3",
      type: "quiz",
      title: "تحدي الأنماط الرياضية والمنطق",
      time: "أمس",
      score: "8/10",
      accuracy: 80,
      duration: "6 دقائق",
      status: "warning",
    },
    {
      id: "s-4",
      type: "flash-anzan",
      title: "فلاش أنزان - 3 خانات (تدريب السرعة)",
      time: "قبل يومين",
      score: "10/10",
      accuracy: 100,
      duration: "1.0s لكل رقم",
      status: "success",
    },
  ],
  weeklyProgress: [
    { day: "السبت", count: 25, accuracy: 92 },
    { day: "الأحد", count: 32, accuracy: 96 },
    { day: "الإثنين", count: 28, accuracy: 94 },
    { day: "الثلاثاء", count: 40, accuracy: 98 },
    { day: "الأربعاء", count: 22, accuracy: 90 },
    { day: "الخميس", count: 35, accuracy: 95 },
    { day: "الجمعة", count: 18, accuracy: 93 },
  ],
};

export const MOCK_TRAINER = {
  id: "trn-101",
  name: "الأستاذ قتادة كريم",
  role: "مدرب حساب ذهني معتمد وأستاذ رياضيات",
  avatar: "/images/coach-qatadah.jpg",
  licenseStatus: "رخصة اعتماد دولية ذهبية (SUPER MIND Master)",
  seats: { used: 48, total: 50 },
  stats: {
    totalStudents: 48,
    activeGroups: 4,
    avgClassAccuracy: 91.8,
    weeklySolvedExercises: 4120,
  },
  groups: [
    {
      id: "grp-1",
      name: "أبطال السوروبان - المجموعة أ",
      studentsCount: 14,
      level: "المستوى 3 (متقدم)",
      avgAccuracy: 94.5,
      lastActive: "اليوم",
    },
    {
      id: "grp-2",
      name: "فرسان الفلاش أنزان والسرعة",
      studentsCount: 12,
      level: "المستوى 4 (سرعة فائقة)",
      avgAccuracy: 93.1,
      lastActive: "اليوم",
    },
    {
      id: "grp-3",
      name: "المبتدئون الواعدون - المجموعة ب",
      studentsCount: 11,
      level: "المستوى 1 (أساسيات العداد)",
      avgAccuracy: 88.6,
      lastActive: "أمس",
    },
    {
      id: "grp-4",
      name: "فريق الإعداد لبطولات الأولمبياد والذكاء",
      studentsCount: 11,
      level: "تحديات أولمبياد الرياضيات",
      avgAccuracy: 91.0,
      lastActive: "منذ يومين",
    },
  ],
  students: [
    {
      id: "std-001",
      name: "علي حيدر",
      group: "أبطال السوروبان - المجموعة أ",
      level: "المستوى 3",
      totalSessions: 685,
      accuracy: 95.2,
      lastSession: "اليوم 10:30 ص",
      status: "نشط",
    },
    {
      id: "std-002",
      name: "مريم أحمد كاظم",
      group: "فرسان الفلاش أنزان والسرعة",
      level: "المستوى 4",
      totalSessions: 810,
      accuracy: 97.4,
      lastSession: "اليوم 11:15 ص",
      status: "نشط ومميز",
    },
    {
      id: "std-003",
      name: "زينب مصطفى",
      group: "أبطال السوروبان - المجموعة أ",
      level: "المستوى 3",
      totalSessions: 520,
      accuracy: 91.0,
      lastSession: "أمس",
      status: "نشط",
    },
    {
      id: "std-004",
      name: "عمر فاروق",
      group: "المبتدئون الواعدون - المجموعة ب",
      level: "المستوى 1",
      totalSessions: 180,
      accuracy: 86.5,
      lastSession: "أمس",
      status: "يحتاج متابعة",
    },
    {
      id: "std-005",
      name: "حسين علي البصري",
      group: "فريق الإعداد لبطولات الأولمبياد والذكاء",
      level: "تحديات أولمبياد",
      totalSessions: 490,
      accuracy: 93.8,
      lastSession: "اليوم 09:00 ص",
      status: "نشط ومميز",
    },
  ],
};

// =========================================================================
// TRAINERS DIRECTORY (دليل مدربي العقل الخارق | SUPER MIND Trainers)
// Annual listing fee: 25,000 IQD (25,000 دينار عراقي)
// =========================================================================
export interface TrainerProfile {
  id: string;
  name: string;
  enName: string;
  title: string;
  enTitle: string;
  avatar: string;
  country: string;
  governorate: string;
  bio: string;
  enBio: string;
  levelsTaught: string[];
  whatsapp: string;
  isSupervisor?: boolean;
  status: "مدرج ومعتمد" | "مدرج في الدليل" | "Verified Directory";
}

export const TRAINERS_DIRECTORY: TrainerProfile[] = [
  {
    id: "trn-001",
    name: "الأستاذ قتادة كريم",
    enName: "Coach Qatadah Karim",
    title: "مؤسس ومشرف عام المنصة ومدرب دولي معتمد",
    enTitle: "Founder, Head Supervisor & International Certified Coach",
    avatar: "/images/coach-official.jpg",
    country: "العراق",
    governorate: "الأنبار - الرمادي",
    bio: "ماجستير رياضيات، مدرب حساب ذهني دولي معتمد، ومؤلف سلاسل ومناهج برنامج العقل الخارق. الفائز بلقب بطل الأبطال في بطولة الحساب الذهني الدولية 2024. المقر: العراق — الأنبار — الرمادي.",
    enBio: "Master's degree in Mathematics, international certified mental math coach, and author of the SUPER MIND curriculum. Winner of Champion of Champions 2024. Location: Iraq — Anbar — Ramadi.",
    levelsTaught: ["المستوى التمهيدي", "المستوى الأول", "المستوى الثاني", "المستوى المتقدم", "إعداد البطولات الدولية"],
    whatsapp: "+9647806086016",
    isSupervisor: true,
    status: "مدرج ومعتمد",
  },
  {
    id: "trn-slot-1",
    name: "مكان مخصص للمدرب (أدرج اسمك)",
    enName: "Reserved Slot for Certified Coach",
    title: "مساحة مخصصة لبياناتك المهنية وتخصصك",
    enTitle: "Space reserved for your professional profile",
    avatar: "",
    country: "العراق / الوطن العربي",
    governorate: "الأنبار / كافة المحافظات",
    bio: "مساحة مخصصة لعرض السيرة الذاتية، التخصص، سنوات الخبرة، وأرقام التواصل الرسمية بعد مراجعة الإدارة واعتماد الإدراج السنوي.",
    enBio: "Reserved spot to showcase your bio, specialties, and official contact details upon approval.",
    levelsTaught: ["المستوى التمهيدي", "المستوى الأول", "السوروبان والفلاش أنزان"],
    whatsapp: "+9647806086016",
    status: "Verified Directory",
  },
  {
    id: "trn-slot-2",
    name: "مكان مخصص للمدرب (أدرج اسمك)",
    enName: "Reserved Slot for Certified Coach",
    title: "مساحة مخصصة لبياناتك المهنية وتخصصك",
    enTitle: "Space reserved for your professional profile",
    avatar: "",
    country: "العراق / الوطن العربي",
    governorate: "الأنبار / كافة المحافظات",
    bio: "أدرج اسمك هنا لتصل إلى آلاف أولياء الأمور والطلاب الباحثين عن مدربين معتمدين في مدينتك باشتراك سنوي 25,000 د.ع.",
    enBio: "List your profile here to connect with parents and students in your city for 25,000 IQD/year.",
    levelsTaught: ["المستوى الثاني", "الضرب والقسمة", "تحديات الفرق"],
    whatsapp: "+9647806086016",
    status: "Verified Directory",
  },
];

// =========================================================================
// SCHOOLS & INSTITUTIONS DIRECTORY (دليل المؤسسات التي تعتمد برنامج العقل الخارق)
// Only real authorized schools in Anbar with custom printed book covers
// =========================================================================
export interface SchoolProfile {
  id: string;
  name: string;
  enName: string;
  bookCoverImage: string;
  country: string;
  governorate: string;
  address: string;
  bio: string;
  enBio: string;
  partnershipType: string;
  curriculumStage: string;
  whatsapp: string;
  status: "مؤسسة تعتمد برنامجنا رسمياً" | "مدرجة في الدليل";
  isPlaceholder?: boolean;
}

export const SCHOOLS_DIRECTORY: SchoolProfile[] = [
  {
    id: "sch-hiba-alrahman",
    name: "مدارس هبة الرحمن وزدني علماً الأهلية النموذجية",
    enName: "Hiba Al-Rahman & Zidni Ilman Private Model Schools",
    bookCoverImage: "/images/school-hiba-alrahman.jpg",
    country: "العراق",
    governorate: "الأنبار - الرمادي",
    address: "العراق — الأنبار — الرمادي",
    bio: "صرح تعليمي رائد في محافظة الأنبار (الرمادي) يعتمد رسمياً منهاج برنامج العقل الخارق (المستوى التمهيدي والمستوى الأول) ضمن خطته التعليمية برؤية «عقل سريع • مستقبل مشرق» وإعداد وتأليف الأستاذ قتادة كريم الكبيسي.",
    enBio: "Leading private model school in Anbar (Ramadi) officially adopting SUPER MIND Foundation & Level 1 curricula under the supervision of Coach Qatadah Karim.",
    partnershipType: "تعتمد المستوى التمهيدي والأول من المنهج",
    curriculumStage: "تعتمد المستوى التمهيدي والمستوى الأول من المنهج",
    whatsapp: "+9647806086016",
    status: "مؤسسة تعتمد برنامجنا رسمياً",
  },
  {
    id: "sch-galenus",
    name: "مدرسة جالينوس الابتدائية الأهلية المختلطة",
    enName: "Galenus Mixed Private Primary School",
    bookCoverImage: "/images/school-galenus.jpg",
    country: "العراق",
    governorate: "الأنبار - الرمادي",
    address: "العراق — الأنبار — الرمادي",
    bio: "مؤسسة تعليمية نموذجية في محافظة الأنبار (الرمادي) تطبق وتعتمد رسمياً منهج برنامج العقل الخارق (المستوى التمهيدي والمستوى الأول) لترسيخ شعار «نفكر • نحسب • نبدع» بإشراف وإعداد وتأليف الأستاذ قتادة كريم عيادة الكبيسي.",
    enBio: "Exemplary educational institution in Anbar (Ramadi) officially implementing SUPER MIND Foundation & Level 1 curricula.",
    partnershipType: "تعتمد المستوى التمهيدي والأول من المنهج",
    curriculumStage: "تعتمد المستوى التمهيدي والمستوى الأول من المنهج",
    whatsapp: "+9647838755177",
    status: "مؤسسة تعتمد برنامجنا رسمياً",
  },
  {
    id: "sch-alnahda",
    name: "مدارس النهضة الحديثة الأهلية",
    enName: "Al-Nahda Modern Private Schools",
    bookCoverImage: "/images/school-alnahda.jpg",
    country: "العراق",
    governorate: "الأنبار - الرمادي",
    address: "العراق — الأنبار — الرمادي",
    bio: "صرح تعليمي في محافظة الأنبار (الرمادي) يعتمد رسمياً النسخة المخصصة من منهاج العقل الخارق (المستوى التمهيدي) لتدريب تلامذتها على أسس العداد الياباني وتنمية الذكاء الإبداعي بإشراف وإعداد وتأليف الأستاذ قتادة كريم الكبيسي.",
    enBio: "Modern private schools in Anbar (Ramadi) adopting a specialized customized edition of the Foundation Level curriculum.",
    partnershipType: "تعتمد المستوى التمهيدي من المنهج",
    curriculumStage: "تعتمد المستوى التمهيدي من المنهج (نسخة مخصصة لمدارس النهضة)",
    whatsapp: "+9647809335551",
    status: "مؤسسة تعتمد برنامجنا رسمياً",
  },
  {
    id: "sch-slot-1",
    name: "مكان مخصص لمدرستك أو مؤسستك (أدرج مدرستك)",
    enName: "Reserved Slot for Partner School",
    bookCoverImage: "",
    country: "العراق / الوطن العربي",
    governorate: "الأنبار / كافة المحافظات",
    address: "العنوان الرسمي للمؤسسة",
    bio: "مساحة مخصصة لإدراج مدرستكم أو أكاديميتكم التعليمية مع صورة كتاب المنهاج المخصص أو شعار المدرسة باشتراك سنوي 75,000 د.ع بعد تدقيق الإدارة.",
    enBio: "Space reserved to display your school, official curriculum edition, and contact link for 75,000 IQD/year.",
    partnershipType: "متاح للانضمام والاعتماد",
    curriculumStage: "طلب حقيبة ومنهاج مدرسي معتمد",
    whatsapp: "+9647806086016",
    status: "مدرجة في الدليل",
    isPlaceholder: true,
  },
];

// =========================================================================
// PLATFORM SUPPORTERS (شركاء في صناعة العقول)
// =========================================================================
export const SUPPORTERS_CONTENT = {
  title: "شركاء في صناعة العقول",
  enTitle: "Partners in Mind Building",
  quote: "نؤمن بأن التعليم حق للجميع، وأن بناء العقول هو أعظم استثمار في المستقبل.",
  enQuote: "We believe education is a right for all, and building minds is the greatest investment in the future.",
  body: "منصة العقل الخارق تقدم أدواتها التعليمية والتدريبية مجاناً، وبدعمكم نستطيع الاستمرار في تطويرها وإتاحتها لأكبر عدد ممكن من الطلاب والمتعلمين.",
  enBody: "SUPER MIND platform provides all its educational and training tools for free. With your support, we can continue developing and providing them to the widest community of students.",
  callToAction: "كن شريكاً في نشر المعرفة وصناعة جيل أكثر ذكاءً وإبداعاً.",
  enCallToAction: "Become a partner in spreading knowledge and nurturing a smarter, more creative generation.",
  freeEducationGuarantee: "تلتزم المنصة بالمحافظة التامة على مجانية أدوات التدريب والتمارين للطلاب والمتعلمين، ولا يؤثر الدعم الاختياري على استقلالية المحتوى أو مجانيته.",
  enFreeEducationGuarantee: "The platform guarantees that all learning tools and exercises remain 100% free for students.",
};

// =========================================================================
// TECHNICAL SUPPORT CONTENT (الدعم الفني والإبلاغ عن المشاكل)
// =========================================================================
export const TECHNICAL_SUPPORT_CONTENT = {
  title: "الدعم الفني | Technical Support",
  enTitle: "Technical Support & Help Center",
  headline: "واجهت مشكلة أثناء استخدام المنصة؟",
  enHeadline: "Encountered an issue while using the platform?",
  description:
    "نحن هنا لمساعدتك. إذا واجهت خطأ تقنياً أو مشكلة في التمارين أو عرض النتائج، يرجى التقاط صورة للشاشة أو تسجيل فيديو قصير يوضح المشكلة، وإرساله إلينا عبر واتساب أو البريد الإلكتروني.",
  enDescription:
    "We are here to help. If you encountered a technical glitch, calculation issue, or result display bug, please take a screenshot or short screen recording and send it via WhatsApp or email.",
  whatsappNumber: "+9647806086016",
  email: "supermindiq@gmail.com",
  privacyWarning:
    "تنبيه أمني هام: للحفاظ على خصوصيتك، يرجى عدم إرسال كلمات المرور أو أرقام الحسابات البنكية أو البيانات الشخصية الحساسة أو صور الأطفال الخاصة دون موافقة مسبقة.",
  enPrivacyWarning:
    "Security Notice: Please never send passwords, banking details, or sensitive private child photos without consent.",
};
