import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppFloating from "@/components/ui/WhatsAppFloating";
import PWAInstallBanner from "@/components/ui/PWAInstallBanner";
import GuestProgressMigrationPrompt from "@/components/ui/GuestProgressMigrationPrompt";
import WelcomePrayerModal from "@/components/ui/WelcomePrayerModal";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.qatada98.com"),
  title: "منصة برنامج العقل الخارق | SUPER MIND — الحساب الذهني وتنمية القدرات العقلية",
  description: "المنصة الأولى المتخصصة في التدريب على العداد الصيني السوروبان، الفلاش أنزان، ومحاكي المسابقات وبنك أسئلة الذكاء — إعداد وتأليف الأستاذ قتادة كريم.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/images/logo.jpg", type: "image/jpeg" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    shortcut: "/images/logo.jpg",
    apple: "/images/logo.jpg",
  },
  openGraph: {
    title: "منصة برنامج العقل الخارق | SUPER MIND",
    description: "من الصفر إلى الاحتراف… رحلة نحو عقلٍ خارق! تدريب السوروبان، الفلاش أنزان، ومحاكي البطولات.",
    url: "https://www.qatada98.com",
    siteName: "منصة برنامج العقل الخارق | SUPER MIND",
    images: [
      {
        url: "/images/logo.jpg",
        width: 800,
        height: 800,
        alt: "شعار برنامج العقل الخارق SUPER MIND",
      },
    ],
    locale: "ar_IQ",
    type: "website",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SUPER MIND",
  },
  keywords: [
    "الحساب الذهني",
    "سوروبان",
    "فلاش أنزان",
    "العقل الخارق",
    "SUPER MIND",
    "تدريب عقلي",
    "رياضيات ذكية",
    "أسئلة الذكاء",
    "التفكير المنطقي",
  ],
  authors: [{ name: "Coach Qatadah Karim & SUPER MIND Team" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#4f46e5",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: "منصة برنامج العقل الخارق | SUPER MIND",
    alternateName: ["SUPER MIND PROGRAM", "برنامج العقل الخارق", "الأستاذ قتادة كريم"],
    url: "https://www.qatada98.com",
    logo: "https://www.qatada98.com/images/logo.jpg",
    image: "https://www.qatada98.com/images/logo.jpg",
    description:
      "المنصة العربية المتخصصة في الحساب الذهني، العداد الياباني (السوروبان)، الفلاش أنزان، ومحاكي البطولات — إعداد وتأليف الأستاذ قتادة كريم.",
  };

  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-[#090D16] dark:text-slate-100 font-arabic antialiased selection:bg-brand-500 selection:text-white transition-colors duration-200">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <AppProvider>
          <AuthProvider>
            <Navbar />
            <WelcomePrayerModal />
            <GuestProgressMigrationPrompt />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
            <WhatsAppFloating />
            <PWAInstallBanner />
          </AuthProvider>
        </AppProvider>
      </body>
    </html>
  );
}
