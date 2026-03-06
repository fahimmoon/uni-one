"use client";

import { useStudentStore } from "@/lib/store";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Book, Plus, Search, Trash2, Library, GraduationCap, Clock } from "lucide-react";
import { Course } from "@/lib/types";
import { useLanguage } from "@/lib/LanguageContext";

export default function CoursesPage() {
    const [mounted, setMounted] = useState(false);
    const { courses, deleteCourse, addCourse } = useStudentStore();
    const [searchQuery, setSearchQuery] = useState("");
    const { t } = useLanguage();

    useEffect(() => {
        useStudentStore.persist.rehydrate();
        const timer = setTimeout(() => setMounted(true), 0);
        return () => clearTimeout(timer);
    }, []);

    if (!mounted) return null;

    const filteredCourses = courses.filter(course =>
        course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.code.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleAddSample = () => {
        const newCourse: Course = {
            id: Math.random().toString(36).substr(2, 9),
            name: "Cloud Computing Architectures",
            code: "CS-402",
            credits: 3,
            semester: 1,
            color: "#6366f1",
            schedule: [
                { day: 'Tuesday', startTime: '09:00', endTime: '10:30', room: 'Hall B' },
                { day: 'Thursday', startTime: '09:00', endTime: '10:30', room: 'Hall B' }
            ],
            attendance: [],
            notes: []
        };
        addCourse(newCourse);
    };

    return (
        <div className="bg-[#FBFCFE] min-h-screen pb-40 font-sans px-6 pt-10 no-scrollbar">

            {/* HEADER */}
            <div className="flex items-center justify-between mb-8 max-w-[1400px] mx-auto group">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-600 rounded-[14px] flex items-center justify-center text-white shadow-xl shadow-indigo-600/30 group-hover:scale-105 transition-transform">
                        <Library size={22} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-none">{t("Academic Library", "علمی لائبریری")}</h1>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1.5">{t("Your Curated Course Catalog", "آپ کی منتخب کورس کیٹلاگ")}</p>
                    </div>
                </div>
                <button
                    onClick={handleAddSample}
                    title="Add Course"
                    className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-xl shadow-slate-200/50 hover:scale-105 active:scale-95 transition-transform border border-slate-50"
                >
                    <Plus size={24} strokeWidth={2.5} />
                </button>
            </div>

            <div className="max-w-[1400px] mx-auto">
                {/* SEARCH BAR */}
                <div className="relative mb-6">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} strokeWidth={2.5} />
                    <input
                        type="text"
                        placeholder={t("Search by course name or code...", "کورس کا نام یا کوڈ تلاش کریں...")}
                        className="w-full bg-white border border-slate-50 rounded-[32px] py-4 pl-14 pr-6 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold text-slate-700 shadow-xl shadow-slate-200/30"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* STATS SUMMARY */}
                <div className="flex gap-4 mb-8 overflow-x-auto no-scrollbar pb-2">
                    <div className="bg-white px-6 py-4 rounded-[32px] border border-slate-50 shadow-xl shadow-slate-200/30 flex items-center gap-4 shrink-0">
                        <div className="w-10 h-10 rounded-[14px] bg-blue-50 text-blue-500 flex items-center justify-center">
                            <Book size={18} strokeWidth={2.5} />
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.15em]">{t("Active", "فعال")}</span>
                            <span className="text-sm font-black text-slate-900 leading-none">{courses.length}</span>
                        </div>
                    </div>
                    <div className="bg-white px-6 py-4 rounded-[32px] border border-slate-50 shadow-xl shadow-slate-200/30 flex items-center gap-4 shrink-0">
                        <div className="w-10 h-10 rounded-[14px] bg-purple-50 text-purple-500 flex items-center justify-center">
                            <GraduationCap size={18} strokeWidth={2.5} />
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.15em]">{t("Credits", "کریڈٹس")}</span>
                            <span className="text-sm font-black text-slate-900 leading-none">{courses.reduce((acc, c) => acc + (c.credits || 0), 0)}</span>
                        </div>
                    </div>
                    <div className="bg-white px-6 py-4 rounded-[32px] border border-slate-50 shadow-xl shadow-slate-200/30 flex items-center gap-4 shrink-0">
                        <div className="w-10 h-10 rounded-[14px] bg-amber-50 text-amber-500 flex items-center justify-center">
                            <Clock size={18} strokeWidth={2.5} />
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.15em]">{t("Semester", "سمسٹر")}</span>
                            <span className="text-sm font-black text-slate-900 leading-none">1st</span>
                        </div>
                    </div>
                </div>

                {/* COURSE GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredCourses.length > 0 ? (
                        filteredCourses.map((course) => (
                            <div key={course.id} className="bg-white rounded-[40px] p-2 border border-slate-50 shadow-xl shadow-slate-200/20 hover:shadow-2xl hover:shadow-indigo-600/10 transition-all group relative animate-in">
                                <Link href={`/courses/${course.id}`} className="flex items-center gap-5 p-4">
                                    <div
                                        className="w-[72px] h-[72px] rounded-full flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-600/20 relative overflow-hidden group-hover:scale-105 transition-transform"
                                        style={{ backgroundColor: course.color || '#6366f1' }}
                                    >
                                        <Book size={28} strokeWidth={2.5} />
                                    </div>
                                    <div className="flex-1 min-w-0 pr-6">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-[9px] font-black px-3 py-1 bg-slate-50 text-slate-400 rounded-full uppercase tracking-widest">{course.code}</span>
                                            {course.credits && (
                                                <span className="text-[9px] font-black px-3 py-1 bg-indigo-50 text-indigo-500 rounded-full uppercase tracking-widest">{course.credits} Cr</span>
                                            )}
                                        </div>
                                        <h3 className="text-[16px] xl:text-[18px] font-black text-slate-800 truncate leading-tight group-hover:text-indigo-600 transition-colors">{course.name}</h3>
                                        <div className="flex items-center gap-2.5 mt-3">
                                            <div className="flex -space-x-2">
                                                {[1, 2].map(i => <div key={i} className="w-5 h-5 rounded-full border-2 border-white bg-slate-100"></div>)}
                                            </div>
                                            <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.15em]">12 {t("enrolled students", "طلباء رجسٹرڈ")}</span>
                                        </div>
                                    </div>
                                </Link>

                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if (confirm(t('Are you sure you want to delete this course?', 'کیا آپ واقعی اس کورس کو حذف کرنا چاہتے ہیں؟'))) deleteCourse(course.id);
                                    }}
                                    className="absolute top-6 right-6 p-2 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-xl opacity-0 group-hover:opacity-100 transition-all active:scale-90"
                                >
                                    <Trash2 size={18} strokeWidth={2.5} />
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-24 bg-white/50 rounded-[48px] border-4 border-dashed border-slate-100">
                            <div className="w-20 h-20 bg-white rounded-[24px] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-slate-200/50">
                                <Book className="text-slate-300" size={32} strokeWidth={2.5} />
                            </div>
                            <h3 className="text-lg font-black text-slate-400 uppercase tracking-widest mb-2">{t("No courses found", "کوئی کورس نہیں ملا")}</h3>
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest max-w-sm mx-auto">{t("Try adjusting your search or add a new course to your catalog.", "اپنی تلاش کو درست کریں یا اپنے کیٹلاگ میں نیا کورس شامل کریں۔")}</p>
                            <button
                                onClick={handleAddSample}
                                className="mt-8 px-8 py-4 bg-indigo-600 text-white rounded-[24px] font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-indigo-600/30 active:scale-95 transition-all"
                            >
                                {t("Add Example Course", "مثالی کورس شامل کریں")}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
