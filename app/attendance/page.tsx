"use client";

import { useStudentStore } from "@/lib/store";
import { useEffect, useState, useMemo } from "react";
import {
    UserCheck, Calendar, CheckCircle2, XCircle, Clock,
    AlertCircle, TrendingUp, Sparkles,
    Zap, Target, ChevronLeft, ChevronRight, CalendarDays,
    Activity, ArrowUpRight, Minus, History as HistoryIcon
} from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import { useLanguage } from "@/lib/LanguageContext";

export default function AttendancePage() {
    const [mounted, setMounted] = useState(false);
    const { courses, timetable = [], addAttendance } = useStudentStore();
    const [selectedCourseId, setSelectedCourseId] = useState<string | undefined>();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const { t, language } = useLanguage();

    useEffect(() => {
        useStudentStore.persist.rehydrate();
        const timer = setTimeout(() => setMounted(true), 0);
        return () => clearTimeout(timer);
    }, []);

    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const activeDayName = days[selectedDate.getDay()] as any;
    const isToday = selectedDate.toDateString() === new Date().toDateString();

    const scheduledClasses = useMemo(() => {
        const dateStr = selectedDate.toISOString().split('T')[0];
        return (timetable || [])
            .filter(item => item.day === activeDayName)
            .map(item => {
                const course = courses.find(c => c.id === item.courseId);
                const attendanceRecord = course?.attendance.find(a =>
                    a.date.startsWith(dateStr) && a.sessionTime === item.startTime
                );

                return {
                    ...item,
                    courseName: course?.name || 'Unknown',
                    color: course?.color || '#3b82f6',
                    courseCode: course?.code || '???',
                    markedStatus: attendanceRecord?.status
                };
            })
            .sort((a, b) => a.startTime.localeCompare(b.startTime));
    }, [timetable, courses, activeDayName, selectedDate]);

    if (!mounted) return null;

    const calculateAttendance = (courseId: string) => {
        const course = courses.find(c => c.id === courseId);
        if (!course || course.attendance.length === 0) return 100;
        const presentCount = course.attendance.filter(a => a.status === 'present' || a.status === 'late').length;
        return Math.round((presentCount / course.attendance.length) * 100);
    };

    const overallAttendance = courses.length > 0
        ? Math.round(courses.reduce((sum, c) => sum + calculateAttendance(c.id), 0) / courses.length)
        : 100;

    const changeDate = (offset: number) => {
        const newDate = new Date(selectedDate);
        newDate.setDate(selectedDate.getDate() + offset);
        setSelectedDate(newDate);
    };

    return (
        <div className="bg-[#FBFCFE] min-h-screen pb-32 font-sans px-4 md:px-10 pt-8 no-scrollbar overflow-x-hidden selection:bg-blue-100 selection:text-blue-900">
            <PageHeader
                title={t("Consistency", "مستقل مزاجی")}
                subtitle={t("Presence Tracking System", "موجودگی کا ٹریکنگ سسٹم")}
                icon={UserCheck}
                accentColor="bg-emerald-600"
            />

            <div className="max-w-[1400px] mx-auto grid grid-cols-1 xl:grid-cols-12 gap-6 mt-8">

                {/* LEFT COLUMN: CONTROL CENTER & LOGS (8 COLS) */}
                <div className="xl:col-span-8 space-y-6">

                    {/* STATS & DATE NAVIGATION CONSOLIDATED */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* OVERALL PERCENTAGE COMPACT */}
                        <div className="bg-white p-6 rounded-[32px] shadow-xl shadow-slate-900/5 border border-slate-50 flex items-center gap-6 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-colors"></div>
                            <div className="relative w-20 h-20 shrink-0">
                                <svg className="w-20 h-20 -rotate-90">
                                    <circle cx="40" cy="40" r="34" fill="none" stroke="#f1f5f9" strokeWidth="8" />
                                    <circle
                                        cx="40" cy="40" r="34"
                                        fill="none"
                                        stroke="#10b981"
                                        strokeWidth="8"
                                        strokeDasharray="213.6"
                                        strokeDashoffset={213.6 - (213.6 * (overallAttendance / 100))}
                                        strokeLinecap="round"
                                        className="transition-all duration-1000 ease-out"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-xl font-black text-slate-900 tracking-tighter">{overallAttendance}%</span>
                                </div>
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{t("Mission Index", "مشن انڈیکس")}</p>
                                <h3 className="text-lg font-black text-slate-900 leading-tight mb-2 tracking-tight">{t("Consistency Grade", "مستقل مزاجی کا درجہ")}</h3>
                                <div className="flex items-center gap-2 py-1 px-3 bg-emerald-50 text-emerald-600 rounded-full text-[8px] font-black uppercase tracking-widest w-fit border border-emerald-100/30">
                                    <Zap size={10} fill="currentColor" />
                                    {t("Optimal Zone", "بہترین زون")}
                                </div>
                            </div>
                        </div>

                        {/* DATE NAVIGATOR COMPACT */}
                        <div className="bg-slate-900 p-6 rounded-[32px] shadow-2xl shadow-indigo-900/20 border border-white/5 flex items-center justify-between relative overflow-hidden group">
                            <div className="absolute -inset-1 bg-linear-to-r from-blue-600/10 to-indigo-600/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <button onClick={() => changeDate(-1)} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 active:scale-95 transition-all">
                                <ChevronLeft size={18} />
                            </button>
                            <div className="text-center relative z-10">
                                <h4 className="text-white font-black text-sm uppercase tracking-tighter mb-1 select-none">
                                    {isToday ? t("Today", "آج") : activeDayName}
                                </h4>
                                <div className="flex items-center gap-1 text-[9px] font-black text-blue-400 uppercase tracking-[0.2em]">
                                    <CalendarDays size={10} />
                                    {selectedDate.toLocaleDateString(language === 'ur' ? 'ur-PK' : 'en-US', { day: 'numeric', month: 'short' })}
                                </div>
                            </div>
                            <button onClick={() => changeDate(1)} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 active:scale-95 transition-all">
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>

                    {/* MISSION LOG (MAIN FEED) */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center px-2">
                            <div className="flex items-center gap-2">
                                <Activity size={14} className="text-indigo-500" />
                                <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em]">{t("Operational Pulse", "آپریشنل نبض")}</h3>
                            </div>
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-1 rounded-md">{scheduledClasses.length} {t("Segments", "حصے")}</span>
                        </div>

                        <div className="grid gap-3">
                            {scheduledClasses.length > 0 ? scheduledClasses.map((item, idx) => (
                                <div key={idx} className="bg-white p-5 md:p-6 rounded-[32px] border border-slate-50 shadow-xl shadow-slate-900/5 hover:shadow-2xl hover:border-blue-100 transition-all duration-300 group relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-48 h-48 rounded-full blur-[80px] -mr-24 -mt-24 opacity-20 pointer-events-none group-hover:scale-150 transition-transform duration-700" style={{ backgroundColor: item.color }}></div>
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative z-10">
                                        <div className="flex items-start sm:items-center gap-5">
                                            <div className="w-14 h-14 rounded-[20px] flex flex-col items-center justify-center text-white font-black text-[10px] shrink-0 shadow-lg group-hover:-translate-y-1 transition-transform border-b-4 border-black/10" style={{ backgroundColor: item.color }}>
                                                <span className="text-[8px] opacity-70 mb-0.5 leading-none">{item.courseCode.slice(0, 2)}</span>
                                                <span className="text-xl leading-none">{item.courseName.charAt(0)}</span>
                                            </div>
                                            <div>
                                                <h4 className="font-black text-slate-900 text-[16px] leading-none mb-2 uppercase tracking-tight">{item.courseName}</h4>
                                                <div className="flex items-center gap-3 text-slate-500 text-[9px] font-black uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                                                    <div className="flex items-center gap-1.5">
                                                        <Clock size={12} className="text-indigo-500" />
                                                        {item.startTime} — {item.endTime}
                                                    </div>
                                                    {item.location && (
                                                        <>
                                                            <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                                                            <div className="flex items-center gap-1.5 text-slate-400">
                                                                <Target size={12} />
                                                                {item.location}
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 self-start sm:self-center bg-slate-50 p-1.5 rounded-[20px] border border-slate-100/50 shadow-inner">
                                            {item.markedStatus ? (
                                                <div className={`flex items-center gap-2 px-5 py-3 rounded-[16px] border text-[10px] font-black uppercase tracking-widest transition-all ${item.markedStatus === 'present' ? 'bg-emerald-500 border-emerald-400 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]' :
                                                        item.markedStatus === 'late' ? 'bg-amber-500 border-amber-400 text-white shadow-[0_0_20px_rgba(245,158,11,0.3)]' :
                                                            'bg-rose-500 border-rose-400 text-white shadow-[0_0_20px_rgba(244,63,94,0.3)]'
                                                    }`}>
                                                    <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                                                        {item.markedStatus === 'present' && <CheckCircle2 size={12} strokeWidth={3} />}
                                                        {item.markedStatus === 'late' && <Clock size={12} strokeWidth={3} />}
                                                        {item.markedStatus === 'absent' && <XCircle size={12} strokeWidth={3} />}
                                                    </div>
                                                    <span className="mr-2 pr-2 border-r border-white/20">{t(item.markedStatus.charAt(0).toUpperCase() + item.markedStatus.slice(1), item.markedStatus)}</span>
                                                    <button
                                                        onClick={() => addAttendance(item.courseId, item.markedStatus === 'present' ? 'absent' : 'present', selectedDate.toISOString(), item.startTime)}
                                                        className="w-6 h-6 bg-white/10 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors shadow-sm"
                                                        title="Change Override"
                                                    >
                                                        <Activity size={10} strokeWidth={3} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex gap-1.5">
                                                    {[
                                                        { status: 'present', color: 'bg-emerald-500 shadow-emerald-500/20 text-emerald-100', hover: 'hover:bg-emerald-400', icon: CheckCircle2, label: 'P' },
                                                        { status: 'late', color: 'bg-amber-500 shadow-amber-500/20 text-amber-100', hover: 'hover:bg-amber-400', icon: Clock, label: 'L' },
                                                        { status: 'absent', color: 'bg-rose-500 shadow-rose-500/20 text-rose-100', hover: 'hover:bg-rose-400', icon: XCircle, label: 'A' },
                                                    ].map(btn => (
                                                        <button
                                                            key={btn.status}
                                                            onClick={() => addAttendance(item.courseId, btn.status as any, selectedDate.toISOString(), item.startTime)}
                                                            className={`w-12 h-12 rounded-[16px] flex flex-col items-center justify-center transition-all active:scale-90 shadow-xl border border-black/5 hover:-translate-y-1 ${btn.color} ${btn.hover}`}
                                                            title={btn.status}
                                                        >
                                                            <btn.icon size={16} strokeWidth={3} className="text-white mb-0.5" />
                                                            <span className="text-[7px] font-black uppercase tracking-widest text-white/70 leading-none">{btn.label}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-20 bg-slate-50/50 rounded-[40px] border-2 border-dashed border-slate-100 flex flex-col items-center">
                                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4 text-slate-200">
                                        <HistoryIcon size={28} />
                                    </div>
                                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.4em]">{t("Ghost Protocol Active", "گھوسٹ پروٹوکول فعال")}</p>
                                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-1">{t("No Scheduled Operations", "کوئی شیڈول شدہ آپریشن نہیں")}</h4>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: MANUAL & ANALYTICS (4 COLS) */}
                <div className="xl:col-span-4 space-y-6">

                    {/* MANUAL HUB COMPACT */}
                    <div className="bg-slate-900 p-6 rounded-[32px] shadow-2xl shadow-indigo-900/10 border border-white/5 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/10 rounded-full blur-2xl"></div>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-white/5 rounded-xl border border-white/10 text-amber-400">
                                <Sparkles size={16} />
                            </div>
                            <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">{t("Manual Override", "دستی اوور رائڈ")}</h3>
                        </div>

                        <div className="space-y-4 relative z-10">
                            <div className="relative">
                                <select
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-[12px] font-black text-white outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none cursor-pointer hover:bg-white/10 transition-all shadow-inner"
                                    value={selectedCourseId || ""}
                                    onChange={(e) => setSelectedCourseId(e.target.value)}
                                    title="Target"
                                >
                                    <option value="" className="bg-slate-900">{t("Target Vector...", "ٹارگٹ ویکٹر...")}</option>
                                    {courses.map(c => (
                                        <option key={c.id} value={c.id} className="bg-slate-900">{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex gap-2">
                                {[
                                    { status: 'present', color: 'bg-emerald-500', icon: CheckCircle2, label: t('P', 'م') },
                                    { status: 'late', color: 'bg-amber-500', icon: Clock, label: t('L', 'ت') },
                                    { status: 'absent', color: 'bg-red-500', icon: XCircle, label: t('A', 'غ') },
                                ].map(btn => (
                                    <button
                                        key={btn.status}
                                        disabled={!selectedCourseId}
                                        onClick={() => selectedCourseId && addAttendance(selectedCourseId, btn.status as any, selectedDate.toISOString())}
                                        className={`flex-1 flex flex-col items-center justify-center py-4 rounded-2xl gap-2 transition-all border border-white/5 shadow-xl ${btn.color} ${!selectedCourseId ? 'opacity-20 grayscale' : 'hover:-translate-y-1 active:scale-95'}`}
                                    >
                                        <btn.icon size={20} strokeWidth={2.5} className="text-white" />
                                        <span className="text-[9px] font-black text-white uppercase">{btn.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* RISK ASSESSMENT ENGINE (NEW) */}
                    {courses.some(c => calculateAttendance(c.id) < 80) && (
                        <div className="bg-rose-600 p-6 rounded-[32px] shadow-2xl shadow-rose-600/20 relative overflow-hidden group border border-rose-500">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500 rounded-full blur-2xl -mr-12 -mt-12 group-hover:scale-110 transition-transform duration-700"></div>
                            <div className="relative z-10 flex items-start gap-4">
                                <div className="w-12 h-12 bg-white/20 text-white rounded-2xl flex items-center justify-center shrink-0 border border-white/20 shadow-inner">
                                    <AlertCircle size={24} />
                                </div>
                                <div className="text-white">
                                    <h3 className="text-[12px] font-black uppercase tracking-[0.2em] mb-1">{t("Critical Defense Breach", "اہم دفاعی خلاف ورزی")}</h3>
                                    <p className="text-[10px] font-bold text-rose-200 uppercase tracking-widest leading-relaxed">
                                        {courses.filter(c => calculateAttendance(c.id) < 80).length} {t("sectors have fallen below operational threshold. Tactical intervention required.", "شعبے 75 فیصد سے نیچے گر گئے ہیں۔")}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SECTOR ANALYTICS (ENHANCED) */}
                    <div className="bg-white p-6 rounded-[32px] shadow-xl shadow-slate-900/5 border border-slate-50 space-y-5">
                        <div className="flex items-center justify-between">
                            <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em]">{t("Track Analytics", "تجزیات ٹریک کریں")}</h3>
                            <TrendingUp size={14} className="text-emerald-500" />
                        </div>

                        <div className="grid gap-4">
                            {courses.map(course => {
                                const attendance = calculateAttendance(course.id);
                                const total = course.attendance.length;
                                const present = course.attendance.filter(a => a.status === 'present').length;
                                const late = course.attendance.filter(a => a.status === 'late').length;
                                const absent = course.attendance.filter(a => a.status === 'absent').length;
                                const impactNextMiss = total > 0 ? (attendance - (((present + late) / (total + 1)) * 100)).toFixed(1) : "0.0";
                                const isRisk = attendance < 75;

                                return (
                                    <div key={course.id} className="p-4 rounded-[24px] bg-slate-50 border border-slate-100 flex flex-col group hover:border-blue-200 transition-all shadow-sm">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-[14px] flex items-center justify-center text-white font-black text-[9px] shadow-sm transform group-hover:rotate-6 transition-transform" style={{ backgroundColor: course.color }}>
                                                    {course.code.slice(0, 2)}
                                                </div>
                                                <div className="min-w-0 pr-2">
                                                    <h4 className="font-black text-slate-800 text-xs leading-none mb-1.5 uppercase truncate">{course.name}</h4>
                                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{total} {t("Sessions Logged", "سیشن لاگڈ")}</p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end shrink-0">
                                                <span className={`text-xl font-black tracking-tighter ${isRisk ? 'text-rose-500 group-hover:animate-pulse' : 'text-slate-900'}`}>{attendance}%</span>
                                                <div className="flex items-center gap-1 mt-0.5">
                                                    {isRisk && <AlertCircle size={10} className="text-rose-500" />}
                                                    <span className={`text-[8px] font-black uppercase tracking-widest ${isRisk ? 'text-rose-400' : 'text-slate-400'}`}>
                                                        {isRisk ? "Zone Alert" : "Secure"}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-4 gap-2 mb-4">
                                            <div className="bg-white p-2 text-center rounded-xl border border-slate-100 shadow-sm flex flex-col justify-center">
                                                <span className="text-emerald-500 font-black text-sm">{present}</span>
                                                <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest mt-0.5">P</span>
                                            </div>
                                            <div className="bg-white p-2 text-center rounded-xl border border-slate-100 shadow-sm flex flex-col justify-center">
                                                <span className="text-amber-500 font-black text-sm">{late}</span>
                                                <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest mt-0.5">L</span>
                                            </div>
                                            <div className="bg-white p-2 text-center rounded-xl border border-slate-100 shadow-sm flex flex-col justify-center">
                                                <span className="text-rose-500 font-black text-sm">{absent}</span>
                                                <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest mt-0.5">A</span>
                                            </div>
                                            <div className="bg-slate-900 p-2 text-center rounded-xl shadow-inner border border-slate-800 flex flex-col justify-center relative group/impact">
                                                <span className="text-white font-black text-[11px] leading-tight">-{impactNextMiss}</span>
                                                <span className="text-[7px] font-black text-amber-400 uppercase tracking-widest mt-0.5">Drop</span>
                                                <div className="absolute top-full right-0 mt-2 w-40 bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest p-3 rounded-[16px] opacity-0 invisible group-hover/impact:opacity-100 group-hover/impact:visible transition-all z-20 text-center shadow-2xl border border-white/10 before:content-[''] before:absolute before:bottom-full before:right-6 before:border-4 before:border-transparent before:border-b-slate-900">
                                                    Drop if next is missed
                                                </div>
                                            </div>
                                        </div>

                                        <div className="w-full h-1.5 bg-white rounded-full overflow-hidden p-[1px] shadow-inner border border-slate-100">
                                            <div className={`h-full rounded-full ${isRisk ? 'bg-rose-500' : 'bg-linear-to-r from-blue-500 to-indigo-500'}`} style={{ width: `${attendance}%` }}></div>
                                        </div>
                                    </div>
                                );
                            })}
                            {courses.length === 0 && (
                                <p className="text-center text-[9px] font-black text-slate-300 uppercase tracking-widest py-4">{t("No Data Available", "کوئی ڈیٹا دستیاب نہیں")}</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
