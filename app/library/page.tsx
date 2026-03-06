"use client";

import PageHeader from "@/components/ui/PageHeader";
import { Library, Search, BookOpen, Download, LayoutGrid, Sparkles } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";

export default function LibraryPage() {
    const { t } = useLanguage();

    return (
        <div className="bg-[#FBFCFE] min-h-screen pb-40 font-sans px-8 pt-6 no-scrollbar overflow-x-hidden">
            <PageHeader
                title={t("Global Library", "عالمی لائبریری")}
                subtitle={t("Infinite Core: Knowledge Buffer", "لامتناہی علم کا مرکز")}
                icon={Library}
                accentColor="bg-violet-600"
            />

            <div className="mt-6 flex gap-3">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-hover:text-violet-500 transition-colors" size={16} />
                    <input
                        name="librarySearch"
                        title={t("Search Books", "کتابیں تلاش کریں")}
                        className="w-full bg-white border border-slate-100 rounded-[24px] py-4 pl-12 pr-6 text-sm font-semibold outline-none focus:border-violet-500/20 shadow-xl shadow-slate-900/5 transition-all placeholder:text-slate-300"
                        placeholder={t("Scan 10k+ Resources...", "وسائل تلاش کریں...")}
                    />
                </div>
                <button
                    title={t("Filter", "فلٹر")}
                    className="w-14 h-14 bg-white border border-slate-100 rounded-[24px] flex items-center justify-center text-slate-400 shadow-xl shadow-slate-900/5 active:scale-90 transition-all">
                    <LayoutGrid size={20} />
                </button>
            </div>

            <div className="bg-slate-900 mt-8 rounded-[56px] p-10 text-white relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-80 h-80 bg-violet-600/20 rounded-full blur-[100px] -mr-32 -mt-32 animate-float"></div>

                <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-white/10 backdrop-blur-xl rounded-[28px] flex items-center justify-center mb-6 border border-white/10">
                        <Sparkles size={32} className="text-violet-400 animate-pulse" />
                    </div>
                    <h3 className="text-xl font-black mb-3 tracking-tight uppercase leading-none">{t("Archive Syncing", "آرکائیو کی مطابقت پذیری")}</h3>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] leading-relaxed max-w-xs mb-8">
                        {t("Accessing world-class knowledge nodes. Current status: Offline Buffer.", "عالمی تعلیمی وسائل تک رسائی فی الحال آف لائن بفر کی حالت میں ہے۔")}
                    </p>

                    <div className="grid grid-cols-2 gap-4 w-full">
                        {[
                            { icon: BookOpen, label: "e-Books" },
                            { icon: Download, label: "Papers" }
                        ].map((item, i) => (
                            <div key={i} className="p-5 bg-white/5 rounded-[28px] border border-white/5 flex flex-col items-center group cursor-not-allowed">
                                <item.icon className="text-slate-600 mb-2 group-hover:text-violet-400 transition-colors" size={20} />
                                <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">{item.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
