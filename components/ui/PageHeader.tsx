"use client";

import { LucideIcon } from "lucide-react";
import React from "react";

interface PageHeaderProps {
    title: string;
    subtitle: string;
    icon?: LucideIcon;
    actions?: React.ReactNode;
    accentColor?: string;
}

export default function PageHeader({
    title,
    subtitle,
    icon: Icon,
    actions,
    accentColor = "bg-blue-600"
}: PageHeaderProps) {
    return (
        <header className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex justify-between items-start">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1.5">
                        {Icon && (
                            <div className={`p-2 ${accentColor} text-white rounded-xl shadow-lg shadow-blue-200 transition-transform hover:rotate-12`}>
                                <Icon size={16} strokeWidth={2.5} />
                            </div>
                        )}
                        <h1 className="text-2xl font-black text-slate-800 tracking-tighter leading-none">{title}</h1>
                    </div>
                    <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.2em] ml-0.5">{subtitle}</p>
                </div>
                {actions && (
                    <div className="flex items-center gap-2">
                        {actions}
                    </div>
                )}
            </div>
            <div className="h-px bg-slate-100 w-full mt-6 rounded-full opacity-50"></div>
        </header>
    );
}
