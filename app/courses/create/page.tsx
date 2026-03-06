"use client";

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { useStudentStore } from '@/lib/store';
import Link from 'next/link';
import { ArrowLeft, Plus, Book, Clock, Award, Trash2, FileText, CheckCircle, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CreateCoursePage() {
    const { t } = useLanguage();
    const [mounted, setMounted] = useState(false);
    const { addCourse } = useStudentStore();
    const router = useRouter();

    const [courseData, setCourseData] = useState({
        name: "",
        code: "",
        credits: 3,
        color: "#3b82f6",
        modules: [{ title: "", content: "", type: "reading" }]
    });

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleAddModule = () => {
        setCourseData({
            ...courseData,
            modules: [...courseData.modules, { title: "", content: "", type: "reading" }]
        });
    };

    const updateModule = (index: number, field: string, value: string) => {
        const nextModules = [...courseData.modules];
        nextModules[index] = { ...nextModules[index], [field]: value };
        setCourseData({ ...courseData, modules: nextModules });
    };

    const removeModule = (index: number) => {
        const nextModules = courseData.modules.filter((_, i) => i !== index);
        setCourseData({ ...courseData, modules: nextModules });
    };

    const handleSave = () => {
        if (!courseData.name || !courseData.code) return;

        // Simulate adding to store (needs update in Course type to support modules)
        addCourse({
            id: Math.random().toString(36).substr(2, 9),
            name: courseData.name,
            code: courseData.code,
            credits: courseData.credits,
            semester: 1, // Default
            color: courseData.color,
            schedule: [],
            attendance: [],
            notes: []
        });

        router.push('/courses');
    };

    if (!mounted) return null;

    return (
        <div className="bg-[#FBFCFE] min-h-screen pb-32 font-sans">
            {/* HEADER */}
            <div className="bg-slate-900 pt-12 pb-24 px-6 rounded-b-[48px] relative overflow-hidden shadow-2xl">
                <Link href="/" className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl text-white text-[10px] font-black uppercase tracking-widest border border-white/10 mb-8 active:scale-95 transition-transform">
                    <ArrowLeft size={16} /> {t("Cancel", "منسوخ کریں")}
                </Link>
                <div className="relative z-10 text-white">
                    <h1 className="text-3xl font-black leading-tight tracking-tight">{t("Create New Course", "نیا کورس بنائیں")}</h1>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-2">{t("Unleash your expertise", "اپنی مہارت کو اجاگر کریں")}</p>
                </div>
            </div>

            {/* BASIC INFO */}
            <div className="px-6 -mt-12 relative z-20 space-y-6">
                <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl shadow-slate-900/5 space-y-6">
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <input
                                type="text"
                                name="courseName"
                                placeholder={t("Course Name", "کورس کا نام")}
                                className="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                                value={courseData.name}
                                onChange={(e) => setCourseData({ ...courseData, name: e.target.value })}
                            />
                            <input
                                type="text"
                                name="courseCode"
                                placeholder={t("Course Code", "کورس کوڈ")}
                                className="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                                value={courseData.code}
                                onChange={(e) => setCourseData({ ...courseData, code: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <select
                                name="courseCredits"
                                aria-label={t("Course Credits", "کورس کریڈٹس")}
                                className="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-100 transition-all outline-none appearance-none"
                                value={courseData.credits}
                                onChange={(e) => setCourseData({ ...courseData, credits: parseInt(e.target.value) })}
                            >
                                {[1, 2, 3, 4, 5].map(v => <option key={v} value={v}>{v} {t("Credits", "کریڈٹس")}</option>)}
                            </select>
                            <input
                                type="color"
                                name="courseColor"
                                aria-label={t("Course Accent Color", "کورس کا رنگ")}
                                className="w-full h-14 bg-slate-50 border-none rounded-2xl p-1 cursor-pointer focus:ring-2 focus:ring-blue-100 transition-all"
                                value={courseData.color}
                                onChange={(e) => setCourseData({ ...courseData, color: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                {/* MODULES EDITOR */}
                <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl shadow-slate-900/5 space-y-8">
                    <div className="flex justify-between items-center">
                        <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest">{t("Course Modules", "کورس ماڈیولز")}</h3>
                        <button
                            onClick={handleAddModule}
                            className="p-3 bg-blue-50 text-blue-600 rounded-2xl active:scale-90 transition-transform"
                            aria-label={t("Add Module", "ماڈیول شامل کریں")}
                        >
                            <Plus size={20} />
                        </button>
                    </div>

                    <div className="space-y-6">
                        {courseData.modules.map((module, idx) => (
                            <div key={idx} className="p-6 bg-slate-50 rounded-[32px] border border-slate-100 space-y-4 relative group">
                                <button
                                    onClick={() => removeModule(idx)}
                                    className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors"
                                    aria-label={t("Remove Module", "ماڈیول ختم کریں")}
                                >
                                    <Trash2 size={16} />
                                </button>
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black">{idx + 1}</span>
                                    <input
                                        type="text"
                                        name="moduleTitle"
                                        placeholder={t("Module Title", "ماڈیول کا عنوان")}
                                        className="flex-1 bg-transparent border-none text-sm font-black text-slate-800 focus:ring-0 outline-none p-0"
                                        value={module.title}
                                        onChange={(e) => updateModule(idx, 'title', e.target.value)}
                                    />
                                </div>
                                <textarea
                                    name="moduleContent"
                                    placeholder={t("Module Content...", "ماڈیول کا مواد...")}
                                    className="w-full bg-white border-none rounded-2xl py-4 px-5 text-xs font-medium text-slate-600 focus:ring-2 focus:ring-blue-100 transition-all min-h-[120px]"
                                    value={module.content}
                                    onChange={(e) => updateModule(idx, 'content', e.target.value)}
                                ></textarea>
                                <div className="flex gap-4">
                                    <button
                                        aria-label={t("Toggle Reading Type", "مطالعہ کی قسم تبدیل کریں")}
                                        className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${module.type === 'reading' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-white text-slate-400 border border-slate-100'}`}
                                    >
                                        <FileText size={14} /> {t("Reading", "مطالعہ")}
                                    </button>
                                    <button
                                        aria-label={t("Toggle Quiz Type", "کوئز کی قسم تبدیل کریں")}
                                        className="flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest bg-white text-slate-400 border border-slate-100 flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle size={14} /> {t("Quiz", "کوئز")}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={handleSave}
                        className="w-full bg-slate-900 text-white py-5 rounded-[24px] font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 active:scale-[0.98] transition-all shadow-xl shadow-slate-200"
                    >
                        <Save size={20} /> {t("Publish Course", "کورس شائع کریں")}
                    </button>
                </div>
            </div>
        </div>
    );
}
