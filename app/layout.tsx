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
};

import { LanguageProvider } from "@/lib/LanguageContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
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
