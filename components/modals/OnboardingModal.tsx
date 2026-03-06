"use client";

import { useState, useEffect } from "react";
import { useStudentStore } from "@/lib/store";
import { useLanguage } from "@/lib/LanguageContext";
import { Sparkles, GraduationCap, ArrowRight, User } from "lucide-react";

export default function OnboardingModal() {
    const [mounted, setMounted] = useState(false);
    const [nameInput, setNameInput] = useState("");
    const { hasOnboarded, setStudentDetails, setOnboarded } = useStudentStore();
    const { t } = useLanguage();

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted || hasOnboarded) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (nameInput.trim().length < 2) return;

        setStudentDetails({ name: nameInput.trim() });
        setOnboarded(true);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-2xl animate-in fade-in duration-700">
            <div className="bg-white w-full max-w-md rounded-[56px] p-10 shadow-[0_50px_100px_-20px_rgba(15,23,42,0.3)] relative overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-1000 delay-300 fill-mode-both">
                {/* Background Accents */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-[80px] -mr-20 -mt-20"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-600/5 rounded-full blur-[60px] -ml-10 -mb-10"></div>

                <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="w-24 h-24 bg-slate-900 rounded-[40px] flex items-center justify-center mb-8 shadow-2xl shadow-slate-900/20 rotate-3 hover:rotate-0 transition-transform duration-500">
                        <GraduationCap size={48} className="text-blue-400 animate-pulse" />
                    </div>

                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter leading-tight mb-3">
                        {t("Welcome to Uni-One", "یونی ون میں خوش آمدید")}
                    </h2>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-10 px-4 leading-relaxed">
                        {t("Your Academic Journey Begins Here. What should we call you?", "آپ کا تعلیمی سفر یہاں سے شروع ہوتا ہے۔ ہم آپ کو کس نام سے پکاریں؟")}
                    </p>

                    <form onSubmit={handleSubmit} className="w-full space-y-6">
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-6 flex items-center text-slate-300 group-focus-within:text-blue-500 transition-colors">
                                <User size={20} />
                            </div>
                            <input
                                type="text"
                                required
                                autoFocus
                                placeholder={t("Enter your name...", "اپنا نام درج کریں...")}
                                value={nameInput}
                                onChange={(e) => setNameInput(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-100 rounded-[32px] py-6 pl-16 pr-8 text-base font-black text-slate-900 outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600/20 transition-all placeholder:text-slate-300"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={nameInput.trim().length < 2}
                            className="w-full bg-slate-900 text-white rounded-[32px] py-6 font-black text-sm uppercase tracking-[0.3em] flex items-center justify-center gap-3 shadow-2xl shadow-slate-900/20 hover:bg-slate-800 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none transition-all"
                        >
                            {t("Initialize Protocol", "پروٹوکول شروع کریں")}
                            <ArrowRight size={18} strokeWidth={3} className="text-blue-400" />
                        </button>
                    </form>

                    <div className="mt-8 flex items-center gap-2">
                        <Sparkles size={14} className="text-amber-400" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            {t("Powered by Platinum Engine", "پلاٹینم انجن کے ذریعے تیار کردہ")}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
