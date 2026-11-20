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
import { ClayMotionProvider, ClayPageTransition } from "@/components/design-system/ClayMotion";
import { Analytics } from "@vercel/analytics/next";
import TrafficTracker from "@/components/analytics/TrafficTracker";

export const metadata: Metadata = {
  metadataBase: new URL("https://supermindiq.com"),
  title: "منصة برنامج العقل الخارق | SUPER MIND — الحساب الذهني وتنمية القدرات العقلية",
  description: "المنصة الأولى المتخصصة في التدريب على المعداد الياباني (السوروبان)، الفلاش أنزان، ومحاكي المسابقات وبنك أسئلة الذكاء — إعداد وتأليف الأستاذ قتادة كريم.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    title: "منصة برنامج العقل الخارق | SUPER MIND",
    description: "من الصفر إلى الاحتراف… رحلة نحو عقلٍ خارق! تدريب السوروبان، الفلاش أنزان، ومحاكي البطولات.",
    url: "https://supermindiq.com",
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
  themeColor: "#6344F5",
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
    url: "https://supermindiq.com",
    logo: "https://supermindiq.com/images/logo.jpg",
    image: "https://supermindiq.com/images/logo.jpg",
    description:
      "المنصة العربية المتخصصة في الحساب الذهني، العداد الياباني (السوروبان)، الفلاش أنزان، ومحاكي البطولات — إعداد وتأليف الأستاذ قتادة كريم.",
  };

  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col bg-[#F3F2FC] text-[#1E1B3A] dark:bg-[#100F24] dark:text-[#F5F4FD] font-arabic antialiased selection:bg-brand-500 selection:text-white transition-colors duration-200">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <AppProvider>
          <AuthProvider>
            <ClayMotionProvider>
              <Navbar />
              <WelcomePrayerModal />
              <GuestProgressMigrationPrompt />
              <main className="flex-1 flex flex-col">
                <ClayPageTransition>{children}</ClayPageTransition>
              </main>
              <Footer />
              <WhatsAppFloating />
              <PWAInstallBanner />
            </ClayMotionProvider>
          </AuthProvider>
        </AppProvider>
        <Analytics />
        <TrafficTracker />
      </body>
    </html>
  );
}
