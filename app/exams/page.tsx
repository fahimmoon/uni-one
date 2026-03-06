"use client";

import { useStudentStore } from "@/lib/store";
import { useEffect, useState, useMemo } from "react";
import {
    Plus, Trash2, Calendar, Clock, MapPin,
    ChevronRight, Bomb, CheckCircle2, Filter,
    AlarmClock, AlertCircle, Bookmark, Star, X
} from "lucide-react";
import { Exam } from "@/lib/types";

import PageHeader from "@/components/ui/PageHeader";
import { useLanguage } from "@/lib/LanguageContext";

export default function ExamCountdownPage() {
    const [mounted, setMounted] = useState(false);
    const [filter, setFilter] = useState<'upcoming' | 'all' | 'completed'>('upcoming');
    const [showAddModal, setShowAddModal] = useState(false);
    const [now, setNow] = useState(new Date());

    const { t } = useLanguage();
    const { exams, courses, addExam, deleteExam, toggleExamCompletion, updateExam } = useStudentStore();

    useEffect(() => {
        useStudentStore.persist.rehydrate();
        setMounted(true);
        const timer = setInterval(() => setNow(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const filteredExams = useMemo(() => {
        let list = [...exams];
        if (filter === 'upcoming') list = list.filter(e => !e.isCompleted);
        if (filter === 'completed') list = list.filter(e => e.isCompleted);

        return list.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [exams, filter]);

    const nextExam = useMemo(() => {
        const upcoming = exams.filter(e => !e.isCompleted && new Date(e.date) >= new Date());
        return upcoming.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
    }, [exams]);

    const getCountdown = (dateStr: string, timeStr?: string) => {
        const examDate = new Date(`${dateStr} ${timeStr || '23:59'}`);
        const diff = examDate.getTime() - now.getTime();

        if (diff <= 0) return "Past";

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(hours / 24);

        if (hours <= 24) return `${hours}h`;
        return `${days}d`;
    };

    if (!mounted) return null;

    return (
        <div className="bg-slate-50 min-h-screen pb-40 font-sans px-6 pt-8 no-scrollbar overflow-x-hidden">
            <PageHeader
                title="Exam Central"
                subtitle="High-Intensity Battle Log"
                icon={Bomb}
                accentColor="bg-red-600"
                actions={
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-white text-red-600 p-3 rounded-2xl shadow-sm border border-slate-100 active:scale-95 transition-all"
                        title="Add Exam"
                    >
                        <Plus size={20} />
                    </button>
                }
            />

            {/* NEXT UP HIGHLIGHT */}
            {nextExam && (
                <section className="mb-8">
                    <div className="bg-slate-900 p-8 rounded-[48px] shadow-2xl shadow-slate-900/40 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="bg-red-600 text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest animate-pulse">Next Up</span>
                                <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{nextExam.type}</span>
                            </div>
                            <h2 className="text-2xl font-black text-white mb-2 leading-tight">{nextExam.name}</h2>
                            <p className="text-slate-400 text-xs font-bold mb-6 uppercase tracking-widest">{nextExam.courseName}</p>

                            <div className="flex items-center justify-between">
                                <div className="flex gap-8">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Time Left</p>
                                        <p className="text-3xl font-black text-red-500 tracking-tighter">{getCountdown(nextExam.date, nextExam.time)}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Location</p>
                                        <p className="text-lg font-black text-white tracking-tight">{nextExam.location || 'TBA'}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Date</p>
                                    <p className="text-lg font-black text-white">{new Date(nextExam.date).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* FILTERS */}
            <div className="flex bg-white p-1 rounded-[22px] shadow-sm border border-slate-100 mb-6 max-w-sm">
                {(['upcoming', 'all', 'completed'] as const).map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`flex-1 py-3 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-red-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* EXAM LIST */}
            <div className="space-y-3">
                {filteredExams.map(exam => (
                    <div
                        key={exam.id}
                        className={`bg-white p-5 rounded-[34px] border border-slate-100 shadow-sm flex items-center gap-6 relative group transition-all ${exam.isCompleted ? 'opacity-60' : ''}`}
                    >
                        <div className="w-16 h-16 rounded-2xl bg-slate-50 flex flex-col items-center justify-center shrink-0 border border-slate-100">
                            <p className="text-[10px] font-black text-red-600 uppercase mb-0.5">{getCountdown(exam.date, exam.time)}</p>
                            <div className="w-6 h-px bg-slate-200"></div>
                            <p className="text-[8px] font-black text-slate-400 uppercase mt-0.5">Left</p>
                        </div>

                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className={`font-black text-slate-800 text-lg tracking-tight ${exam.isCompleted ? 'line-through' : ''}`}>{exam.name}</h3>
                                {exam.isCompleted && <CheckCircle2 size={16} className="text-green-500" />}
                            </div>
                            <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                <span>{exam.courseName}</span>
                                <span>•</span>
                                <span className="flex items-center gap-1.5"><Calendar size={12} /> {new Date(exam.date).toLocaleDateString()}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => toggleExamCompletion(exam.id)}
                                className={`p-3 rounded-2xl transition-all ${exam.isCompleted ? 'bg-green-100 text-green-600' : 'bg-slate-50 text-slate-400 hover:bg-green-50 hover:text-green-600'}`}
                                title="Toggle Completion"
                            >
                                <CheckCircle2 size={20} />
                            </button>
                            <button
                                onClick={() => deleteExam(exam.id)}
                                className="p-3 bg-red-50 text-red-100 group-hover:text-red-500 rounded-2xl transition-colors"
                                title="Delete Exam"
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>
                    </div>
                ))}

                {filteredExams.length === 0 && (
                    <div className="py-20 text-center bg-white rounded-[40px] border-2 border-dashed border-slate-200">
                        <Star className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">No exams found</p>
                    </div>
                )}
            </div>

            {/* ADD EXAM MODAL */}
            {showAddModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-sm rounded-[48px] p-8 relative shadow-2xl border border-slate-100/50">
                        <button
                            onClick={() => setShowAddModal(false)}
                            title="Close"
                            className="absolute top-8 right-8 w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all"
                        >
                            <X size={20} />
                        </button>

                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-red-600 rounded-[22px] flex items-center justify-center text-white shadow-xl shadow-red-100">
                                <Plus size={24} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none uppercase">{t("Exams", "امتحانات")}</h1>
                                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1.5">{t("Add Critical Event", "اہم پروگرام شامل کریں")}</p>
                            </div>
                        </div>

                        <form className="space-y-4" onSubmit={(e) => {
                            e.preventDefault();
                            const fd = new FormData(e.currentTarget);
                            const courseId = fd.get('courseId') as string;
                            const courseName = courses.find(c => c.id === courseId)?.name || 'General';
                            addExam({
                                courseId,
                                courseName,
                                name: fd.get('name') as string,
                                type: fd.get('type') as any,
                                date: fd.get('date') as string,
                                time: fd.get('time') as string,
                                location: fd.get('loc') as string,
                                notes: fd.get('notes') as string,
                                isCompleted: false
                            });
                            setShowAddModal(false);
                        }}>
                            <div className="space-y-4">
                                <input name="name" required title="Exam Name" placeholder="Exam Name (e.g. Finals)" className="w-full bg-slate-50 rounded-2xl py-4 px-6 text-sm font-bold text-slate-700 outline-none border border-transparent focus:border-red-100" />
                                <select name="courseId" required title="Select Course" className="w-full bg-slate-50 rounded-2xl py-4 px-6 text-sm font-bold text-slate-700 outline-none border border-transparent focus:border-red-100">
                                    <option value="">Select Course</option>
                                    {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                                <div className="grid grid-cols-2 gap-4">
                                    <select name="type" title="Exam Type" className="w-full bg-slate-50 rounded-2xl py-4 px-6 text-sm font-bold text-slate-700 outline-none">
                                        <option value="midterm">Midterm</option>
                                        <option value="final">Final</option>
                                        <option value="quiz">Quiz</option>
                                        <option value="lab">Lab</option>
                                    </select>
                                    <input name="loc" title="Location" placeholder="Location" className="w-full bg-slate-50 rounded-2xl py-4 px-6 text-sm font-bold text-slate-700 outline-none" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <input name="date" type="date" required title="Date" className="w-full bg-slate-50 rounded-2xl py-4 px-6 text-sm font-bold text-slate-700 outline-none" />
                                    <input name="time" type="time" title="Time" className="w-full bg-slate-50 rounded-2xl py-4 px-6 text-sm font-bold text-slate-700 outline-none" />
                                </div>
                                <textarea name="notes" placeholder="Notes..." title="Notes" rows={3} className="w-full bg-slate-50 rounded-2xl py-4 px-6 text-sm font-bold text-slate-700 outline-none resize-none" />
                            </div>
                            <button className="w-full bg-red-600 text-white py-5 rounded-[22px] font-black text-[10px] uppercase tracking-[0.3em] mt-6 shadow-xl shadow-red-100 active:scale-95 transition-all">Add to Schedule</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
