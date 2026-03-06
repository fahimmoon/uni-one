"use client";

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { useStudentStore } from '@/lib/store';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Clock, Award, ChevronRight, PlayCircle } from 'lucide-react';
import CNDCContent from '@/components/courses/CNDCContent';

export default function CNDCLearningPage() {
    const { t } = useLanguage();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className="bg-[#FBFCFE] min-h-screen pb-32 font-sans">
            {/* HEADER */}
            <div className="bg-blue-600 pt-12 pb-24 px-6 rounded-b-[48px] relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-2xl -ml-10 -mb-10"></div>

                <Link href="/" className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl text-white text-[10px] font-black uppercase tracking-widest border border-white/10 mb-8 active:scale-95 transition-transform">
                    <ArrowLeft size={16} /> {t("Back to Hub", "واپس ہب پر")}
                </Link>

                <div className="relative z-10 text-white">
                    <span className="bg-white/20 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-white/10">Networking</span>
                    <h1 className="text-3xl font-black mt-3 leading-tight tracking-tight">Computer Networks & Data Communications</h1>
                    <div className="flex items-center gap-4 mt-4">
                        <div className="flex items-center gap-1.5 text-blue-100/80 text-[10px] font-black uppercase tracking-widest">
                            <Clock size={14} /> 15 {t("Weeks", "ہفتے")}
                        </div>
                        <div className="flex items-center gap-1.5 text-blue-100/80 text-[10px] font-black uppercase tracking-widest">
                            <Award size={14} /> {t("Certificate", "سند")}
                        </div>
                    </div>
                </div>
            </div>

            {/* PROGRESS CARD */}
            <div className="px-6 -mt-12 relative z-20">
                <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-xl shadow-slate-900/5">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest">{t("Course Progress", "کورس کی ترقی")}</h3>
                        <span className="text-blue-600 font-black text-xs">33%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden mb-6">
                        <div className="h-full bg-blue-600 w-1/3 rounded-full shadow-[0_0_10px_#2563eb]"></div>
                    </div>
                    <button className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 active:scale-[0.98] transition-all">
                        <PlayCircle size={18} /> {t("Resume Week 5", "ہفتہ 5 جاری رکھیں")}
                    </button>
                </div>
            </div>

            {/* CONTENT */}
            <div className="px-6 mt-10">
                <div className="flex justify-between items-end mb-6">
                    <h2 className="font-black text-slate-900 text-xl tracking-tight">{t("Curriculum", "نصاب")}</h2>
                    <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">15 {t("Modules", "ماڈیولز")}</span>
                </div>

                <CNDCContent />
            </div>
        </div>
    );
}
