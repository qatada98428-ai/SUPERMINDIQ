import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppFloating from "@/components/ui/WhatsAppFloating";
import PWAInstallBanner from "@/components/ui/PWAInstallBanner";
import GuestProgressMigrationPrompt from "@/components/ui/GuestProgressMigrationPrompt";

export const metadata: Metadata = {
  title: "منصة برنامج العقل الخارق | SUPER MIND — الحساب الذهني وتنمية القدرات العقلية",
  description: "المنصة الأولى المتخصصة في التدريب على العداد الصيني السوروبان، الفلاش أنزان، وبنك أسئلة الذكاء والتفكير المنطقي — إعداد وتأليف الأستاذ قتادة كريم.",
  manifest: "/manifest.json",
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
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-[#090D16] dark:text-slate-100 font-arabic antialiased selection:bg-brand-500 selection:text-white transition-colors duration-200">
        <AppProvider>
          <AuthProvider>
            <Navbar />
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
