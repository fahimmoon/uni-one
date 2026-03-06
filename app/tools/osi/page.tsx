"use client";

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import Link from 'next/link';
import { ArrowLeft, Layers, Globe, Network, Shield, Cpu, ChevronRight, CheckCircle, Smartphone, Zap, Sparkles, Binary, MoveRight } from 'lucide-react';

export default function OSIModelPage() {
    const { t } = useLanguage();
    const [mounted, setMounted] = useState(false);
    const [activeLayer, setActiveLayer] = useState(7);

    const layers = [
        { id: 7, name: t("Application", "ایپلی کیشن"), icon: Globe, pdu: "Data", description: t("Network processes to applications. Protocols like HTTP, DNS, and FTP operate here.", "ایپلی کیشنز کے لیے نیٹ ورک کے عمل۔ ایچ ٹی ٹی پی، ڈی این ایس، اور ایف ٹی پی جیسے پروٹوکول یہاں کام کرتے ہیں۔"), protocols: ["HTTP", "DNS", "FTP", "SMTP", "SSH"] },
        { id: 6, name: t("Presentation", "پریذنٹیشن"), icon: Smartphone, pdu: "Data", description: t("Data representation, encryption, and compression.", "ڈیٹا کی نمائندگی، انکرپشن، اور کمپریشن۔"), protocols: ["JPEG", "MPEG", "GIF", "ASCII", "SSL/TLS"] },
        { id: 5, name: t("Session", "سیشن"), icon: Cpu, pdu: "Data", description: t("Interhost communication, managing sessions between applications.", "انٹر ہوسٹ کمیونیکیشن، ایپلی کیشنز کے درمیان سیشنز کا انتظام۔"), protocols: ["NetBIOS", "RPC", "SQL", "NFS"] },
        { id: 4, name: t("Transport", "ٹرانسپورٹ"), icon: Network, pdu: "Segments", description: t("End-to-end connections, reliability, and flow control.", "اینڈ ٹو اینڈ کنکشن، وشوسنییتا، اور بہاؤ کنٹرول۔"), protocols: ["TCP", "UDP", "SCTP"] },
        { id: 3, name: t("Network", "نیٹ ورک"), icon: Shield, pdu: "Packets", description: t("Path determination and logical addressing (IP).", "راستہ کا تعین اور منطقی ایڈریسنگ (آئی پی)۔"), protocols: ["IPv4", "IPv6", "ICMP", "IPsec", "IGMP"] },
        { id: 2, name: t("Data Link", "ڈیٹا لنک"), icon: Binary, pdu: "Frames", description: t("Physical addressing (MAC) and error switching.", "فزیکل ایڈریسنگ (ایم اے سی) اور ایرر سوئچنگ۔"), protocols: ["Ethernet", "PPP", "Switch", "Bridge"] },
        { id: 1, name: t("Physical", "فزیکل"), icon: Layers, pdu: "Bits", description: t("Binary transmission, cables, and hardware specifications.", "بائنری ٹرانسمیشن، کیبلز، اور ہارڈویئر کی خصوصیات۔"), protocols: ["RS-232", "10Base-T", "RJ-45", "Hub", "Repeater"] },
    ];

    useEffect(() => {
        const timer = setTimeout(() => setMounted(true), 0);
        return () => clearTimeout(timer);
    }, []);

    if (!mounted) return null;

    const currentLayer = layers.find(l => l.id === activeLayer) || layers[0];

    return (
        <div className="bg-[#FBFCFE] min-h-screen pb-40 font-sans selection:bg-orange-100 selection:text-orange-900 overflow-x-hidden">
            {/* PREMIUM HEADER */}
            <div className="bg-orange-600 pt-12 pb-32 px-8 rounded-b-[64px] relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-[100px] -mr-20 -mt-20 animate-float"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-400/20 rounded-full blur-[80px] -ml-20 -mb-20"></div>

                <Link href="/" className="relative z-10 inline-flex items-center gap-3 bg-white/10 backdrop-blur-xl px-5 py-2.5 rounded-2xl text-white text-[10px] font-black uppercase tracking-widest border border-white/20 mb-10 hover:bg-white/20 active:scale-95 transition-all">
                    <ArrowLeft size={16} strokeWidth={3} /> {t("Back to Hub", "واپس ہب پر")}
                </Link>

                <div className="relative z-10 flex items-center gap-6">
                    <div className="w-20 h-20 bg-white/20 backdrop-blur-xl rounded-[32px] flex items-center justify-center text-white border border-white/30 shadow-2xl group">
                        <Layers size={36} strokeWidth={2.5} className="group-hover:rotate-12 transition-transform" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-white leading-tight tracking-tight">{t("Interactive OSI Lab", "انٹرایکٹو او ایس آئی لیب")}</h1>
                        <div className="flex items-center gap-2 mt-2">
                            <Sparkles size={14} className="text-orange-200" />
                            <p className="text-orange-100/70 text-[10px] font-black uppercase tracking-[0.3em]">{t("Architectural Knowledge Stack", "آرکیٹیکچرل نالج اسٹیک")}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-8 -mt-16 relative z-20 grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* 3D STACK VISUALIZER */}
                <div className="space-y-6">
                    <div className="flex justify-between items-end mb-4 px-2">
                        <h3 className="text-[12px] font-black text-slate-900 uppercase tracking-[0.2em]">{t("Protocol Stack", "پروٹوکول اسٹیک")}</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t("Active: L", "فعال: ایل")}{activeLayer}</p>
                    </div>
                    <div className="space-y-3 perspective-[1000px]">
                        {layers.map((layer) => (
                            <button
                                title={t("Select Layer", "پرت منتخب کریں")}
                                key={layer.id}
                                onClick={() => setActiveLayer(layer.id)}
                                className={`w-full p-6 rounded-[32px] border-2 transition-all duration-500 flex items-center justify-between group active:scale-[0.98] relative overflow-hidden ${activeLayer === layer.id ? 'bg-slate-900 border-slate-900 text-white shadow-[0_20px_40px_-12px_rgba(15,23,42,0.3)] translate-x-4 scale-105 z-10' : 'bg-white border-slate-50 text-slate-400 hover:border-orange-500 hover:bg-orange-50/50'}`}
                            >
                                <div className="flex items-center gap-5 relative z-10">
                                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-[11px] font-black transition-all ${activeLayer === layer.id ? 'bg-orange-500 text-white shadow-xl shadow-orange-500/20 rotate-12' : 'bg-slate-50 text-slate-400 group-hover:bg-orange-100 group-hover:text-orange-600'}`}>
                                        L{layer.id}
                                    </div>
                                    <span className={`text-sm font-black uppercase tracking-widest ${activeLayer === layer.id ? 'text-white' : 'text-slate-800 group-hover:text-orange-600'}`}>
                                        {layer.name}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 relative z-10">
                                    <span className={`text-[8px] font-black uppercase tracking-tighter px-2 py-1 rounded-lg ${activeLayer === layer.id ? 'bg-white/10 text-orange-300' : 'bg-slate-50 text-slate-400'}`}>
                                        {layer.pdu}
                                    </span>
                                    {activeLayer === layer.id ? <CheckCircle size={20} className="text-orange-500" strokeWidth={3} /> : <ChevronRight size={18} className="text-slate-200 group-hover:text-orange-300 transition-colors" />}
                                </div>
                                {activeLayer === layer.id && (
                                    <div className="absolute right-0 top-0 h-full w-48 bg-linear-to-l from-orange-500/10 to-transparent"></div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* LAYER INTEL INSIGHTS */}
                <div className="space-y-8">
                    <div className="bg-white p-10 rounded-[56px] border border-slate-50 shadow-2xl shadow-slate-900/5 relative overflow-hidden h-fit">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/5 rounded-full blur-3xl animate-pulse"></div>

                        <div className="relative z-10">
                            <div className="w-24 h-24 bg-orange-50 rounded-[36px] flex items-center justify-center text-orange-600 mb-10 border border-orange-100 shadow-sm relative group overflow-hidden">
                                <div className="absolute inset-0 bg-orange-600/10 scale-0 group-hover:scale-100 transition-transform duration-500 rounded-full"></div>
                                <currentLayer.icon size={44} strokeWidth={2.5} className="relative z-10" />
                            </div>

                            <div className="space-y-4 mb-10">
                                <p className="text-[11px] font-black text-orange-500 uppercase tracking-[0.4em]">{t("Intelligence Briefing", "انٹیلی جنس بریفنگ")}</p>
                                <h2 className="text-4xl font-black text-slate-900 tracking-tighter leading-none">{currentLayer.name}</h2>
                                <div className="flex items-center gap-2 py-1.5 px-3 bg-slate-900 text-white rounded-xl w-fit">
                                    <p className="text-[10px] font-black uppercase tracking-widest">{t("Encapsulation", "انکاپسولیشن")}:</p>
                                    <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest">{currentLayer.pdu}</p>
                                </div>
                            </div>

                            <div className="p-8 bg-slate-50/50 rounded-[32px] border border-slate-100 mb-10">
                                <p className="text-slate-600 text-[15px] font-semibold leading-relaxed">
                                    {currentLayer.description}
                                </p>
                            </div>

                            <div className="space-y-6">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t("Standard Protocol Vectors", "معیاری پروٹوکول ویکٹر")}</p>
                                <div className="flex flex-wrap gap-3">
                                    {currentLayer.protocols.map(p => (
                                        <div key={p} className="bg-white px-5 py-3 rounded-2xl text-[11px] font-black text-slate-700 uppercase tracking-widest border border-slate-100 shadow-sm hover:border-orange-500 hover:text-orange-600 transition-all cursor-default">
                                            {p}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button
                                title={t("Simulate Flow", "نقالی شروع کریں")}
                                className="w-full mt-12 bg-slate-900 text-white py-6 rounded-[32px] font-black text-[12px] uppercase tracking-[0.4em] shadow-2xl shadow-slate-900/20 active:scale-95 transition-all flex items-center justify-center gap-4 group">
                                {t("Simulate Data Stream", "ڈیٹا اسٹریم کی نقل کریں")}
                                <MoveRight size={20} className="group-hover:translate-x-2 transition-transform" />
                            </button>
                        </div>
                    </div>

                    {/* PRO TIP CARD */}
                    <div className="bg-linear-to-tr from-orange-600 to-amber-500 p-8 rounded-[48px] text-white shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
                        <div className="flex gap-6 items-start relative z-10">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20">
                                <Zap size={24} fill="white" strokeWidth={0} />
                            </div>
                            <div>
                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] mb-2">{t("Pro Tip", "پرو ٹپ")}</h4>
                                <p className="text-sm font-bold leading-relaxed opacity-90">
                                    {t("Remember the mnemonic: 'All People Seem To Need Data Processing' or 'Please Do Not Throw Sausage Pizza Away'.", "یاد رکھیں: 'All People Seem To Need Data Processing'")}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
