"use client";

import PageHeader from "@/components/ui/PageHeader";
import { Users, Sparkles, MessageSquare, Heart, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";

export default function CommunityPage() {
    const { t } = useLanguage();

    return (
        <div className="bg-[#FBFCFE] min-h-screen pb-40 font-sans px-8 pt-6 no-scrollbar overflow-x-hidden">
            <PageHeader
                title={t("Academic Club", "اکیڈمک کلب")}
                subtitle={t("The Nexus of Scholars", "اسکالرز کا مرکز")}
                icon={Users}
                accentColor="bg-pink-600"
            />

            <div className="bg-white p-8 rounded-[56px] border border-slate-50 shadow-2xl shadow-slate-900/5 flex flex-col items-center text-center mt-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/5 rounded-full blur-[80px] -mr-24 -mt-24"></div>
                <div className="w-20 h-20 bg-pink-50 text-pink-500 rounded-[28px] flex items-center justify-center mb-6 shadow-xl shadow-pink-100 relative z-10">
                    <Sparkles size={40} strokeWidth={2.5} className="animate-pulse" />
                </div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-none mb-3 relative z-10 uppercase">{t("Pulse Protocol: WIP", "نبض پروٹوکول: جاری ہے")}</h2>
                <p className="text-slate-400 text-[11px] font-bold max-w-xs mb-10 relative z-10 leading-relaxed uppercase tracking-wider">
                    {t("Architecting a decentralized social network for elite academic collaboration and note extraction.", "اشرافیہ کے تعلیمی تعاون اور نوٹ نکالنے کے لیے ایک غیر مرکزی سوشل نیٹ ورک کی تعمیر۔")}
                </p>

                <div className="grid grid-cols-2 gap-4 w-full relative z-10">
                    {[
                        { icon: MessageSquare, label: "Discussions", ur: "گفتگو" },
                        { icon: Heart, label: "Mentorship", ur: "رہنمائی" },
                        { icon: Users, label: "Collab", ur: "تعاون" },
                        { icon: ShieldCheck, label: "Auth", ur: "تصدیق" }
                    ].map((item, i) => (
                        <div key={i} className="p-5 bg-slate-50 rounded-[24px] border border-slate-100 flex flex-col items-center group hover:bg-white hover:shadow-xl transition-all duration-300">
                            <item.icon className="text-slate-300 mb-2 group-hover:text-pink-500 transition-colors" size={20} />
                            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400">{t(item.label, item.ur)}</span>
                        </div>
                    ))}
                </div>

                <div className="mt-10 flex items-center gap-3 py-3 px-5 bg-slate-900 text-white rounded-full shadow-2xl relative z-10">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                    <span className="text-[9px] font-black uppercase tracking-[0.4em]">{t("Encryption Active", "انکرپشن فعال")}</span>
                </div>
            </div>
        </div>
    );
}
