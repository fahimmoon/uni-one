"use client";

import React from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { CheckCircle, Globe, Shield, Cloud, Wifi, ArrowRight, PlayCircle } from 'lucide-react';

export default function CNDCContent() {
    const { t } = useLanguage();

    const weeks = [
        {
            title: t("Introduction to Data Communications", "ڈیٹا کمیونیکیشن کا تعارف"),
            description: t("Basics of how data moves from one point to another.", "ڈیٹا ایک جگہ سے دوسری جگہ کیسے منتقل ہوتا ہے اس کی بنیادی باتیں"),
            topics: ["OSI Model", "TCP/IP Suite", "Data Flow"],
            icon: Globe,
            color: "bg-blue-600",
            lightColor: "bg-blue-50",
            textColor: "text-blue-600"
        },
        {
            title: t("Physical Layer & Media", "فزیکل لیئر اور میڈیا"),
            description: t("Cables, wireless, and physical signals.", "کیبلز، وائرلیس اور جسمانی سگنلز"),
            topics: ["Copper", "Fiber Optics", "Wireless Propagation"],
            icon: Wifi,
            color: "bg-indigo-600",
            lightColor: "bg-indigo-50",
            textColor: "text-indigo-600"
        },
        {
            title: t("Network Security", "نیٹ ورک سیکیورٹی"),
            description: t("Protecting your data from threats.", "اپنے ڈیٹا کو خطرات سے بچانا"),
            topics: ["Encryption", "Firewalls", "VPNs"],
            icon: Shield,
            color: "bg-emerald-600",
            lightColor: "bg-emerald-50",
            textColor: "text-emerald-600"
        },
        {
            title: t("Cloud Networking", "کلاؤڈ نیٹ ورکنگ"),
            description: t("Models and deployment of cloud services.", "کلاؤڈ سروسز کے ماڈلز اور تعیناتی"),
            topics: ["SaaS", "PaaS", "IaaS", "Cloud Security"],
            icon: Cloud,
            color: "bg-purple-600",
            lightColor: "bg-purple-50",
            textColor: "text-purple-600"
        }
    ];

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom duration-1000 pb-20 px-1">
            {weeks.map((week, index) => (
                <div key={index} className="bg-white rounded-[48px] p-8 border border-slate-50 shadow-xl shadow-slate-900/5 hover:shadow-2xl hover:shadow-indigo-900/10 transition-all group relative overflow-hidden active:scale-[0.99]">
                    <div className={`absolute top-0 right-0 w-32 h-32 ${week.lightColor} rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700`}></div>

                    <div className="flex items-start justify-between mb-8 relative z-10">
                        <div className="flex items-center gap-5">
                            <div className={`w-16 h-16 ${week.color} rounded-[24px] flex items-center justify-center text-white shadow-xl shadow-${week.color.split('-')[1]}-500/20 group-hover:-translate-y-1 transition-transform duration-500`}>
                                <week.icon size={32} strokeWidth={2.5} />
                            </div>
                            <div>
                                <p className={`text-[10px] font-black ${week.textColor} uppercase tracking-[0.3em] mb-1.5`}>{t(`WEEK ${index + 1}`, `ہفتہ ${index + 1}`)}</p>
                                <h3 className="text-xl font-black text-slate-900 leading-tight tracking-tight">{week.title}</h3>
                            </div>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-slate-900 group-hover:text-white transition-all">
                            <ArrowRight size={18} />
                        </div>
                    </div>

                    <p className="text-slate-500 text-sm mb-8 leading-relaxed font-medium">{week.description}</p>

                    <div className="grid grid-cols-2 gap-4 relative z-10">
                        {week.topics.map((topic, i) => (
                            <div key={i} className="flex items-center gap-3 bg-slate-50/50 backdrop-blur-sm p-4 rounded-2xl border border-slate-100 shadow-sm group-hover:bg-white transition-colors">
                                <div className={`w-5 h-5 rounded-full ${week.lightColor} ${week.textColor} flex items-center justify-center`}>
                                    <CheckCircle size={12} strokeWidth={3} />
                                </div>
                                <span className="text-[11px] font-black text-slate-700 uppercase tracking-tighter">{topic}</span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-10 flex gap-4">
                        <button className="flex-1 bg-slate-900 text-white py-5 rounded-[24px] font-black text-[11px] uppercase tracking-[0.3em] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3">
                            <PlayCircle size={18} />
                            {t("Resume Learning", "سیکھنا جاری رکھیں")}
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
