"use client";

import { useStudentStore } from "@/lib/store";
import { useEffect, useState, useRef, useCallback } from "react";
import { Timer, Play, Pause, RotateCcw, Award, TrendingUp, BookOpen, Clock, Zap, Target, Star, MoreHorizontal, Trophy, ListChecks, ArrowUpRight, Settings } from "lucide-react";

import PageHeader from "@/components/ui/PageHeader";
import { useLanguage } from "@/lib/LanguageContext";

export default function StudyPage() {
    const [mounted, setMounted] = useState(false);
    const { studySessions, addStudySession, courses } = useStudentStore();
    const { t } = useLanguage();

    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);
    const [mode, setMode] = useState<'study' | 'break'>('study');
    const [selectedCourseId, setSelectedCourseId] = useState<string>("");

    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        useStudentStore.persist.rehydrate();
        const timer = setTimeout(() => setMounted(true), 0);
        return () => clearTimeout(timer);
    }, []);

    const handleComplete = useCallback(() => {
        setIsActive(false);
        if (mode === 'study') {
            addStudySession({
                courseId: selectedCourseId || undefined,
                duration: 25,
                date: new Date().toISOString(),
                focusScore: Math.floor(Math.random() * 3) + 8 // 8 to 10 score
            });
            alert(t("Focus session complete! Take a break.", "تربیتی سیشن مکمل ہوا! ایک وقفہ لیں۔"));
            setMode('break');
            setTimeLeft(5 * 60);
        } else {
            alert(t("Break complete! Ready to focus?", "وقفہ مکمل ہوا! کیا آپ تربیت کے لئے تیار ہیں؟"));
            setMode('study');
            setTimeLeft(25 * 60);
        }
    }, [addStudySession, mode, selectedCourseId, t]);

    useEffect(() => {
        if (isActive && timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            // Use a small timeout or microtask to avoid sync setState in effect if triggered during render
            const timer = setTimeout(() => handleComplete(), 0);
            return () => clearTimeout(timer);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isActive, timeLeft, handleComplete]);

    const toggleTimer = () => setIsActive(!isActive);
    const resetTimer = () => {
        setIsActive(false);
        setTimeLeft(mode === 'study' ? 25 * 60 : 5 * 60);
    };

    if (!mounted) return null;

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    const totalStudyMinutes = studySessions.reduce((sum, s) => sum + s.duration, 0);
    const sessionsToday = studySessions.filter(s => new Date(s.date).toDateString() === new Date().toDateString()).length;

    // Sort sessions logically
    const recentSessions = [...studySessions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

    // Leaderboard Mock
    const leaderboard = [
        { name: "Ali R.", time: "18h 45m", score: "9.8" },
        { name: "Zara K.", time: "16h 20m", score: "9.5" },
        { name: "Omer F.", time: "14h 10m", score: "9.0" },
    ];

    return (
        <div className="bg-[#FBFCFE] min-h-screen pb-32 font-sans px-4 md:px-8 pt-8 no-scrollbar overflow-x-hidden selection:bg-indigo-100 selection:text-indigo-900">
            <PageHeader
                title={t("Neural Link", "نیورل لنک")}
                subtitle={t("Deep Work & Mastery Lab", "گہرا کام اور مہارٹی تجربہ گاہ")}
                icon={Zap}
                accentColor="bg-slate-900"
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 max-w-[1400px] mx-auto">
                <div className="lg:col-span-8 flex flex-col gap-6 md:gap-8">

                    {/* TIMER CARD */}
                    <div className="bg-slate-900 p-8 md:p-14 rounded-[40px] md:rounded-[64px] shadow-2xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
                        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-500/20 rounded-full blur-[100px] -mr-40 -mt-40 group-hover:bg-indigo-500/30 transition-colors pointer-events-none"></div>

                        <div className="flex bg-white/5 p-1 rounded-[24px] mb-10 md:mb-16 relative z-10 w-fit mx-auto border border-white/10 backdrop-blur-md">
                            {(['study', 'break'] as const).map(m => (
                                <button
                                    key={m}
                                    onClick={() => {
                                        setMode(m);
                                        setTimeLeft(m === 'study' ? 25 * 60 : 5 * 60);
                                        setIsActive(false);
                                    }}
                                    className={`px-8 md:px-12 py-3 rounded-[20px] text-[10px] md:text-[11px] font-black uppercase tracking-[0.3em] transition-all ${mode === m ? 'bg-white text-slate-900 shadow-xl' : 'text-white/60 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    {t(m, m)}
                                </button>
                            ))}
                        </div>

                        <div className="relative z-10 flex flex-col items-center">
                            <h2 className="text-[100px] md:text-[160px] font-black text-white tabular-nums tracking-tighter leading-none mb-4 drop-shadow-2xl">
                                {minutes.toString().padStart(2, '0')}<span className="text-white/20">:</span>{seconds.toString().padStart(2, '0')}
                            </h2>
                            <p className="text-[10px] md:text-xs font-black text-indigo-400 uppercase tracking-[0.5em] mb-12 md:mb-16 flex items-center gap-3">
                                <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-400 animate-pulse' : 'bg-indigo-400'}`}></span>
                                {isActive ? t("Neural Sync Active", "نیورل ہم آہنگی فعال ہے") : t("Standby Mode", "اسٹینڈ بائی موڈ")}
                            </p>

                            <div className="flex items-center gap-4 md:gap-8 bg-white/5 p-2 rounded-[32px] border border-white/10 backdrop-blur-md">
                                <button
                                    onClick={resetTimer}
                                    className="w-16 h-16 md:w-20 md:h-20 bg-transparent text-white/50 rounded-full hover:bg-white/10 hover:text-white active:scale-90 transition-all flex items-center justify-center"
                                    title="Reset Protocol"
                                >
                                    <RotateCcw size={24} />
                                </button>
                                <button
                                    onClick={toggleTimer}
                                    className={`w-20 h-20 md:w-24 md:h-24 rounded-[28px] md:rounded-[32px] flex items-center justify-center shadow-2xl active:scale-90 transition-all ${isActive ? 'bg-white text-slate-900 shadow-white/20' : 'bg-indigo-500 text-white shadow-indigo-500/40'
                                        }`}
                                    title={isActive ? "Suspend" : "Initiate"}
                                >
                                    {isActive ? <Pause size={36} strokeWidth={2.5} /> : <Play size={36} strokeWidth={2.5} fill="currentColor" />}
                                </button>
                                <button
                                    className="w-16 h-16 md:w-20 md:h-20 bg-transparent text-white/50 rounded-full hover:bg-white/10 hover:text-white active:scale-90 transition-all flex items-center justify-center"
                                    title="Configure Protocol"
                                >
                                    <Settings size={24} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* COURSE FOCUS & STATS */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-white p-5 rounded-[28px] border border-slate-100 shadow-sm flex flex-col justify-center gap-3 group">
                            <div className="w-10 h-10 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                <BookOpen size={18} />
                            </div>
                            <div>
                                <select
                                    name="studyCourse"
                                    className="w-full bg-transparent border-none text-sm font-black text-slate-800 outline-none appearance-none cursor-pointer"
                                    value={selectedCourseId}
                                    onChange={(e) => setSelectedCourseId(e.target.value)}
                                    title="Select Target"
                                >
                                    <option value="">{t("General Frequency", "عمومی تعدد")}</option>
                                    {courses.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">{t("Target Subject", "ہدف کا مضمون")}</p>
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-[28px] border border-slate-100 shadow-sm flex flex-col justify-center gap-3">
                            <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center">
                                <Clock size={18} />
                            </div>
                            <div>
                                <p className="text-xl font-black text-slate-900 tracking-tighter leading-none">{totalStudyMinutes}<span className="text-xs text-slate-400 ml-1">min</span></p>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">{t("Deep Work Total", "کل گہرا کام")}</p>
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-[28px] border border-slate-100 shadow-sm flex flex-col justify-center gap-3">
                            <div className="w-10 h-10 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center">
                                <Target size={18} />
                            </div>
                            <div>
                                <p className="text-xl font-black text-slate-900 tracking-tighter leading-none">{sessionsToday}</p>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">{t("Sessions Today", "آج کے سیشنز")}</p>
                            </div>
                        </div>
                    </div>

                </div>

                <div className="lg:col-span-4 space-y-6 md:space-y-8">

                    {/* LEADERBOARD WIDGET */}
                    <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.4em]">{t("Global Rank", "عالمی درجہ")}</h3>
                            <Trophy size={14} className="text-amber-500" />
                        </div>
                        <div className="space-y-4">
                            {leaderboard.map((user, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black text-white ${idx === 0 ? 'bg-amber-500 shadow-lg shadow-amber-500/30' : idx === 1 ? 'bg-slate-400' : 'bg-red-400'}`}>
                                            #{idx + 1}
                                        </div>
                                        <p className="text-xs font-black text-slate-800 uppercase tracking-widest">{user.name}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{user.time}</p>
                                        <div className="flex items-center gap-1 justify-end text-amber-500 mt-0.5">
                                            <Star size={8} fill="currentColor" />
                                            <span className="text-[8px] font-black">{user.score}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* RECENT SESSIONS */}
                    <div className="bg-slate-900 p-6 rounded-[32px] text-white">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-[10px] font-black text-white/50 uppercase tracking-[0.4em]">{t("Session History", "سیشن کی تاریخ")}</h3>
                        </div>
                        <div className="space-y-3">
                            {recentSessions.map(session => (
                                <div key={session.id} className="bg-white/5 border border-white/5 p-4 rounded-2xl flex items-center justify-between group cursor-default">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                                            <TrendingUp size={14} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-white uppercase tracking-widest mb-0.5">{courses.find(c => c.id === session.courseId)?.code || "General"}</p>
                                            <p className="text-[8px] font-bold text-white/40 uppercase tracking-widest">{new Date(session.date).toLocaleDateString()} • {session.duration}m</p>
                                        </div>
                                    </div>
                                    <div className="text-right flex items-center gap-4">
                                        <div className="flex items-center gap-2 bg-emerald-500/20 px-2 py-1 rounded-lg">
                                            <span className="text-emerald-400 text-[9px] font-black">{session.focusScore}/10</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {recentSessions.length === 0 && (
                                <div className="py-10 text-center flex flex-col items-center">
                                    <ListChecks size={24} className="text-white/20 mb-3" />
                                    <p className="text-[9px] font-black text-white/50 uppercase tracking-[0.3em]">{t("No Telemetry Data", "کوئی ٹیلی میٹری ڈیٹا نہیں")}</p>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
