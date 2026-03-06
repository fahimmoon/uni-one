import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google"; // Using more premium fonts
import "./globals.css";
import BottomNav from "@/components/layout/BottomNav";
import OnboardingModal from "@/components/modals/OnboardingModal";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Uni One | Your Academic Universe",
  description: "The all-in-one student management platform for timetables, courses, and grades.",
  manifest: "/uni-one/manifest.json",
  icons: [
    { rel: "icon", url: "/uni-one/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    { rel: "icon", url: "/uni-one/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    { rel: "apple-touch-icon", url: "/uni-one/apple-touch-icon.png", sizes: "180x180" },
  ],
  themeColor: "#1e3a5f",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Uni One",
  },
};

import { LanguageProvider } from "@/lib/LanguageContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body
        className={`${inter.variable} ${outfit.variable} antialiased bg-slate-50 text-slate-900 selection:bg-blue-100 selection:text-blue-900`}
      >
        <LanguageProvider>
          <OnboardingModal />
          <main className="max-w-md mx-auto min-h-screen bg-white shadow-2xl shadow-slate-200 relative overflow-x-hidden">
            {children}
            <BottomNav />
          </main>
        </LanguageProvider>
      </body>
    </html>
  );
}
