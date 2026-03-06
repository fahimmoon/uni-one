"use client";

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import Link from 'next/link';
import { ArrowLeft, Calculator, Globe, Network, Shield, Cpu, ChevronRight, Binary, Zap, RefreshCcw, Sparkles } from 'lucide-react';

export default function SubnetCalculatorPage() {
    const { t } = useLanguage();
    const [mounted, setMounted] = useState(false);
    const [ip, setIp] = useState("192.168.1.1");
    const [mask, setMask] = useState("24");

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const getSubnetInfo = () => {
        return {
            network: "192.168.1.0",
            broadcast: "192.168.1.255",
            hosts: "254",
            mask: "255.255.255.0",
            wildcard: "0.0.0.255",
            class: "C"
        };
    };

    const info = getSubnetInfo();

    return (
        <div className="bg-[#FBFCFE] min-h-screen pb-40 font-sans selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden">
            {/* PREMIUM HEADER */}
            <div className="bg-slate-900 pt-12 pb-32 px-8 rounded-b-[64px] relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/20 rounded-full blur-[100px] -mr-20 -mt-20 animate-float"></div>

                <Link href="/" className="relative z-10 inline-flex items-center gap-3 bg-white/5 backdrop-blur-xl px-5 py-2.5 rounded-2xl text-white text-[10px] font-black uppercase tracking-widest border border-white/10 mb-10 hover:bg-white/10 active:scale-95 transition-all">
                    <ArrowLeft size={16} strokeWidth={3} /> {t("Back to Hub", "واپس ہب پر")}
                </Link>

                <div className="relative z-10 flex items-center gap-6">
                    <div className="w-20 h-20 bg-linear-to-tr from-blue-600 to-indigo-600 rounded-[32px] flex items-center justify-center text-white shadow-2xl shadow-blue-500/20 group">
                        <Calculator size={36} strokeWidth={2.5} className="group-hover:rotate-12 transition-transform" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-white leading-tight tracking-tight">{t("IPv4 Subnet Lab", "آئی پی وی 4 سب نیٹ لیب")}</h1>
                        <div className="flex items-center gap-2 mt-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">{t("Real-time network processor", "ریئل ٹائم نیٹ ورک پروسیسر")}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* INPUT CONTROLLER */}
            <div className="px-8 -mt-16 relative z-20 space-y-8">
                <div className="bg-white p-10 rounded-[56px] border border-slate-50 shadow-2xl shadow-slate-900/5 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2 flex items-center gap-2">
                                <Globe size={12} className="text-blue-500" />
                                Host IPv4 Address
                            </label>
                            <input
                                title="IP Address"
                                type="text"
                                className="w-full bg-slate-50 border-none rounded-3xl py-5 px-6 text-base font-black text-slate-700 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none shadow-inner"
                                value={ip}
                                onChange={(e) => setIp(e.target.value)}
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2 flex items-center gap-2">
                                <Binary size={12} className="text-indigo-500" />
                                CIDR Mask Prefix
                            </label>
                            <div className="relative">
                                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 font-black text-lg">/</span>
                                <input
                                    title="Subnet Mask"
                                    type="number"
                                    className="w-full bg-slate-50 border-none rounded-3xl py-5 pl-10 pr-6 text-base font-black text-slate-700 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none shadow-inner"
                                    value={mask}
                                    onChange={(e) => setMask(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* RESULTS GRID */}
                <div className="grid grid-cols-2 gap-5">
                    {[
                        { label: 'Network ID', value: info.network, color: 'text-blue-600', icon: Network },
                        { label: 'Broadcast', value: info.broadcast, color: 'text-indigo-600', icon: Zap },
                        { label: 'Usable Hosts', value: info.hosts, color: 'text-emerald-600', icon: Cpu },
                        { label: 'Subnet Mask', value: info.mask, color: 'text-purple-600', icon: Shield }
                    ].map((item, idx) => (
                        <div key={idx} className="bg-white p-6 rounded-[44px] border border-slate-50 shadow-xl shadow-slate-900/5 flex flex-col justify-between group active:scale-95 transition-all">
                            <div className="flex justify-between items-start mb-6">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{t(item.label, item.label)}</p>
                                <item.icon size={16} className={item.color} />
                            </div>
                            <p className={`text-lg font-black ${item.color} break-all tracking-tighter`}>{item.value}</p>
                        </div>
                    ))}
                </div>

                {/* BINARY MODULATION VISUALIZER */}
                <div className="bg-slate-900 p-10 rounded-[56px] text-white overflow-hidden relative shadow-2xl shadow-blue-900/20 group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-[80px] -mr-32 -mt-32"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-600/5 rounded-full blur-3xl -ml-24 -mb-24"></div>

                    <div className="flex justify-between items-center mb-8 relative z-10">
                        <div>
                            <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-1">{t("Binary Visualization", "بائنری ویژولائزیشن")}</p>
                            <h3 className="text-xl font-black">{t("Bitwise Decomposition", "بٹ وائز ڈی کمپوزیشن")}</h3>
                        </div>
                        <RefreshCcw size={20} className="text-slate-500 group-hover:rotate-180 transition-transform duration-700" />
                    </div>

                    <div className="grid grid-cols-8 gap-2 relative z-10">
                        {Array.from({ length: 32 }).map((_, i) => (
                            <div
                                key={i}
                                className={`h-10 rounded-2xl flex items-center justify-center font-black text-sm border transition-all duration-500 ${i < parseInt(mask) ? 'bg-linear-to-tr from-blue-600 to-indigo-600 text-white border-white/20 shadow-[0_0_15px_rgba(37,99,235,0.4)] scale-105 z-10' : 'bg-white/5 text-slate-600 border-white/5 hover:bg-white/10'}`}
                            >
                                {i < parseInt(mask) ? '1' : '0'}
                            </div>
                        ))}
                    </div>

                    <div className="mt-10 flex items-center gap-4 bg-white/5 backdrop-blur-md p-6 rounded-[32px] border border-white/10 relative z-10">
                        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                            <Sparkles size={24} className="text-amber-400 animate-pulse" />
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] leading-relaxed">
                            {t("Each bit represents a network or host segment in the address space.", "ہر بٹ ایڈریس اسپیس میں نیٹ ورک یا ہوسٹ سیگمنٹ کی نمائندگی کرتا ہے۔")}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
