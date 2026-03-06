"use client";

import { useStudentStore } from "@/lib/store";
import { useEffect, useState, useMemo } from "react";
import {
    Calendar, Clock, MapPin, Plus, Trash2, ChevronLeft,
    ChevronRight, Filter, Download, AlertTriangle, Info,
    LayoutGrid, List, Navigation, BookOpen, Timer, CheckCircle2, X, Sparkles, MoveRight, Share2,
    Zap, Coffee, Skull, Target, Layers, Search, Sidebar, MoreVertical, Bell, Save, Activity
} from "lucide-react";

import { useLanguage } from "@/lib/LanguageContext";
import { TimetableEntry, Exam, StudyBlock } from "@/lib/types";

export default function EnhancedSchedule() {
    const [mounted, setMounted] = useState(false);
    const [viewMode, setViewMode] = useState<'week' | 'day' | 'list'>('week');
    const [selectedDay, setSelectedDay] = useState(new Date().getDay() || 7); // 1-7 (Mon-Sun)
    const [courseFilter, setCourseFilter] = useState<string>("all");
    const [editingItem, setEditingItem] = useState<any>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [searchQuery, setSearchQuery] = useState("");
    const [showBreakpoints, setShowBreakpoints] = useState(true);
    const [showStudyBlocks, setShowStudyBlocks] = useState(true);

    const { t } = useLanguage();

    const {
        timetable, courses, exams, studyBlocks,
        deleteTimetableEntry, addTimetableEntry, updateTimetableEntry,
        deleteStudyBlock, addStudyBlock
    } = useStudentStore();

    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    useEffect(() => {
        useStudentStore.persist.rehydrate();
        const timer = setTimeout(() => setMounted(true), 0);
        const clockTimer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => {
            clearTimeout(timer);
            clearInterval(clockTimer);
        };
    }, []);

    // HYBRID CONTENT ENGINE: Merges Timetable, Study Blocks, and Exams
    const hybridSchedule = useMemo(() => {
        let entries: any[] = timetable.map(item => {
            const course = courses.find(c => c.id === item.courseId);
            const attendedCount = course?.attendance?.filter(a => a.status === 'present').length || 0;
            const totalCount = course?.attendance?.length || 0;
            const attendRate = totalCount > 0 ? (attendedCount / totalCount) * 100 : 0;

            return {
                ...item,
                type: 'class',
                title: course?.name || 'Unknown',
                code: course?.code || '???',
                color: course?.color || '#3b82f6',
                attendRate: Math.round(attendRate),
                isStudy: false
            };
        });

        if (showStudyBlocks) {
            const blocks = studyBlocks.map(b => ({
                id: b.id,
                courseId: 'study',
                day: b.day,
                startTime: b.startTime,
                endTime: b.endTime,
                title: b.title,
                type: 'study',
                color: b.color || '#6366f1',
                isStudy: true
            }));
            entries = [...entries, ...blocks];
        }

        // Conflict Detection
        entries = entries.map((item, i, self) => {
            const hasConflict = self.some((other, j) =>
                i !== j &&
                item.day === other.day &&
                ((item.startTime >= other.startTime && item.startTime < other.endTime) ||
                    (other.startTime >= item.startTime && other.startTime < item.endTime))
            );
            return { ...item, hasConflict };
        });

        if (searchQuery) {
            entries = entries.filter(e => e.title.toLowerCase().includes(searchQuery.toLowerCase()));
        }

        if (courseFilter !== "all" && courseFilter !== "study") {
            entries = entries.filter(item => item.classType === courseFilter);
        } else if (courseFilter === "study") {
            entries = entries.filter(item => item.isStudy);
        }

        return entries.sort((a, b) => a.startTime.localeCompare(b.startTime));
    }, [timetable, courses, studyBlocks, courseFilter, searchQuery, showStudyBlocks]);

    // BREAKPOINT ANALYSIS ENGINE
    const dailyBreaks = useMemo(() => {
        const breaks: any[] = [];
        days.forEach(day => {
            const dayItems = hybridSchedule.filter(i => i.day === day);
            for (let i = 0; i < dayItems.length - 1; i++) {
                const currentEnd = dayItems[i].endTime;
                const nextStart = dayItems[i + 1].startTime;

                const [eh, em] = currentEnd.split(':').map(Number);
                const [sh, sm] = nextStart.split(':').map(Number);
                const gap = (sh * 60 + sm) - (eh * 60 + em);

                if (gap >= 30) {
                    breaks.push({
                        id: `break-${day}-${i}`,
                        day,
                        startTime: currentEnd,
                        endTime: nextStart,
                        duration: gap,
                        type: 'break'
                    });
                }
            }
        });
        return breaks;
    }, [hybridSchedule]);

    const todayName = days[currentTime.getDay() === 0 ? 6 : currentTime.getDay() - 1];
    const timeStr = currentTime.getHours().toString().padStart(2, '0') + ":" + currentTime.getMinutes().toString().padStart(2, '0');

    const todaysItems = hybridSchedule.filter(i => i.day === todayName);
    const currentClass = todaysItems.find(i => timeStr >= i.startTime && timeStr <= i.endTime);
    const nextClass = todaysItems.find(i => i.startTime > timeStr);

    const timeRemaining = useMemo(() => {
        if (!currentClass) return null;
        const [eh, em] = currentClass.endTime.split(':').map(Number);
        const end = eh * 60 + em;
        const now = currentTime.getHours() * 60 + currentTime.getMinutes();
        const diff = end - now;
        return diff > 0 ? `${diff}m left` : 'Ending...';
    }, [currentClass, currentTime]);

    const calculateHoursPerWeek = () => {
        let totalMinutes = 0;
        hybridSchedule.forEach(item => {
            const [sh, sm] = item.startTime.split(':').map(Number);
            const [eh, em] = item.endTime.split(':').map(Number);
            totalMinutes += (eh * 60 + em) - (sh * 60 + sm);
        });
        return (totalMinutes / 60).toFixed(1);
    };

    const exportToICS = () => {
        let icsContent = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Uni-One//NONSGML v1.0//EN\n";
        hybridSchedule.forEach(item => {
            icsContent += "BEGIN:VEVENT\n";
            icsContent += `SUMMARY:${item.title}\n`;
            icsContent += `DESCRIPTION:${item.type} mission\n`;
            icsContent += `LOCATION:${item.location || 'Campus'}\n`;
            icsContent += "RRULE:FREQ=WEEKLY;BYDAY=" + item.day.slice(0, 2).toUpperCase() + "\n";
            icsContent += "END:VEVENT\n";
        });
        icsContent += "END:VCALENDAR";
        const blob = new Blob([icsContent], { type: 'text/calendar' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = "uni_one_mission_schedule.ics";
        a.click();
    };

    if (!mounted) return null;

    return (
        <div className="bg-[#FBFCFE] min-h-screen pb-40 font-sans px-4 md:px-8 pt-6 overflow-x-hidden no-scrollbar selection:bg-indigo-100 selection:text-indigo-900">
            {/* FULLY COMPACT TACTICAL HEADER */}
            <header className="mb-6 flex justify-between items-center px-1">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl rotate-3 shrink-0">
                        <Layers size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none uppercase">{t("Time Matrix", "ٹائم میٹرکس")}</h1>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5">{t("Tactical Resource Management", "ٹیکٹیکل وسائل کا انتظام")}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={exportToICS}
                        title="Export ICS"
                        className="w-10 h-10 bg-white border border-slate-100 rounded-2xl shadow-sm text-slate-400 hover:text-indigo-600 transition-all flex items-center justify-center active:scale-90"
                    >
                        <Save size={18} />
                    </button>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="px-6 h-10 bg-slate-900 text-white rounded-2xl shadow-xl shadow-slate-900/10 active:scale-95 transition-all flex items-center gap-2 group font-black text-[10px] uppercase tracking-widest"
                    >
                        <Plus size={16} strokeWidth={3} className="group-hover:rotate-90 transition-transform" />
                        {t("Add Mission", "مشن شامل کریں")}
                    </button>
                </div>
            </header>

            {/* HIGH-INTENSITY ANALYTICS DECK */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
                <div className="bg-white p-3 md:p-4 rounded-[20px] md:rounded-[32px] border border-slate-50 shadow-sm flex items-center gap-3 md:gap-4 group hover:shadow-xl transition-all">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                        <Timer size={18} />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{t("Volume", "حجم")}</p>
                        <p className="text-lg font-black text-slate-900 tracking-tighter truncate">{calculateHoursPerWeek()}h <span className="text-[9px] font-medium tracking-normal text-slate-300">/wk</span></p>
                    </div>
                </div>
                <div className="bg-white p-3 md:p-4 rounded-[20px] md:rounded-[32px] border border-slate-50 shadow-sm flex items-center gap-3 md:gap-4 group hover:shadow-xl transition-all">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <Zap size={18} />
                    </div>
                    <div>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{t("Intensity", "شدت")}</p>
                        <p className="text-lg font-black text-slate-900 tracking-tighter truncate">{hybridSchedule.length} <span className="text-[9px] font-medium tracking-normal text-slate-300">Slots</span></p>
                    </div>
                </div>
                <div className="bg-white p-3 md:p-4 rounded-[20px] md:rounded-[32px] border border-slate-50 shadow-sm flex items-center gap-3 md:gap-4 group hover:shadow-xl transition-all">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                        <Coffee size={18} />
                    </div>
                    <div>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{t("Recess", "ریلیف")}</p>
                        <p className="text-lg font-black text-slate-900 tracking-tighter truncate">{dailyBreaks.filter(b => b.day === todayName).length} <span className="text-[9px] font-medium tracking-normal text-slate-300">Gaps</span></p>
                    </div>
                </div>
                <div className="bg-white p-3 md:p-4 rounded-[20px] md:rounded-[32px] border border-slate-50 shadow-sm flex items-center gap-3 md:gap-4 group hover:shadow-xl transition-all">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <Target size={18} />
                    </div>
                    <div>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{t("Exams", "امتحانات")}</p>
                        <p className="text-lg font-black text-slate-900 tracking-tighter truncate">{exams.filter(e => !e.isCompleted).length} <span className="text-[9px] font-medium tracking-normal text-slate-300">Pending</span></p>
                    </div>
                </div>
            </div>

            {/* DUAL-PANEL LAYOUT */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 items-start">

                {/* LEFT CONTEXT: OPERATIONS (8 COLS) */}
                <div className="lg:col-span-8 space-y-4 md:space-y-6">

                    {/* LIVE COMMAND CARD */}
                    <div className="bg-slate-900 p-5 md:p-8 rounded-[32px] md:rounded-[48px] shadow-2xl md:shadow-[0_40px_80px_-20px_rgba(15,23,42,0.4)] relative overflow-hidden text-white border border-white/5 group">
                        <div className="absolute top-0 right-0 w-80 h-80 bg-linear-to-br from-indigo-600/30 to-blue-600/30 rounded-full blur-[100px] -mr-32 -mt-32 transition-transform duration-1000 group-hover:scale-110"></div>

                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start mb-6 md:mb-10 gap-6 md:gap-0">
                            <div className="flex items-center gap-4 md:gap-6 w-full md:w-auto">
                                <div className="w-16 h-16 md:w-20 md:h-20 bg-white/5 backdrop-blur-3xl rounded-[24px] md:rounded-[32px] border border-white/10 flex flex-col items-center justify-center group/pulse overflow-hidden shrink-0">
                                    {currentClass ? (
                                        <>
                                            <div className="text-indigo-400 animate-pulse mb-1"><Zap size={20} fill="currentColor" /></div>
                                            <span className="text-[8px] font-black uppercase tracking-widest text-indigo-300/60">Live</span>
                                        </>
                                    ) : (
                                        <>
                                            <div className="text-slate-500 mb-1"><Skull size={20} /></div>
                                            <span className="text-[8px] font-black uppercase tracking-widest text-slate-600">Idle</span>
                                        </>
                                    )}
                                    <div className="absolute bottom-0 left-0 h-1 bg-indigo-500 transition-all duration-1000" style={{ width: currentClass ? '100%' : '0%' }}></div>
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">{t("Temporal Analysis", "ٹیمپوریل تجزیہ")}</span>
                                    </div>
                                    <h2 className="text-3xl font-black tracking-tighter leading-none mb-2">
                                        {currentClass ? currentClass.title : t("Standby Mode", "اسٹینڈ بائی موڈ")}
                                    </h2>
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] font-black text-indigo-400 bg-indigo-400/10 px-2 py-0.5 rounded-md uppercase">{currentClass ? currentClass.startTime + ' — ' + currentClass.endTime : t("All Clear", "سب صاف ہے")}</span>
                                        {currentClass && <span className="text-[10px] font-black text-slate-500">at {currentClass.location || 'HQ'}</span>}
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-row md:flex-col justify-between items-center md:items-end w-full md:w-auto border-t md:border-t-0 border-white/10 pt-4 md:pt-0">
                                <p className="text-2xl md:text-4xl font-black tracking-tighter tabular-nums">{timeStr}</p>
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest md:mt-2">{t(todayName, todayName)}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 relative z-10">
                            <div className="p-4 md:p-6 bg-white/5 backdrop-blur-3xl rounded-2xl md:rounded-[32px] border border-white/10 group/stat">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                                        <BookOpen size={18} />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-0.5">{t("Active Sector", "فعال سیکٹر")}</p>
                                        <p className="text-xs font-black text-white">{currentClass?.classType || 'No Active Class'}</p>
                                    </div>
                                </div>
                                {currentClass && (
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                            <div className="h-full bg-blue-500 animate-pulse" style={{ width: '45%' }}></div>
                                        </div>
                                        <span className="text-[9px] font-black text-blue-400">{timeRemaining}</span>
                                    </div>
                                )}
                            </div>
                            <div className="p-4 md:p-6 bg-white/5 backdrop-blur-3xl rounded-2xl md:rounded-[32px] border border-white/10 group/stat">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                                        <MoveRight size={18} />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-0.5">{t("Next Protocol", "اگلا پروٹوکول")}</p>
                                        <p className="text-xs font-black text-white truncate max-w-[120px]">{nextClass ? nextClass.title : 'End of Log'}</p>
                                    </div>
                                </div>
                                {nextClass && <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{t("Synchronizing at", "سنکرونائزنگ")} {nextClass.startTime}</p>}
                            </div>
                        </div>
                    </div>

                    {/* CONTROL & FILTER STRIP */}
                    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 md:gap-4 lg:gap-6 w-full mt-4 md:mt-0">
                        <div className="grid grid-cols-3 bg-white p-1 rounded-2xl md:rounded-[24px] border border-slate-100 shadow-sm w-full md:w-[300px] shrink-0 gap-1">
                            {(['week', 'day', 'list'] as const).map(mode => (
                                <button
                                    key={mode}
                                    onClick={() => setViewMode(mode)}
                                    className={`py-3 md:py-2.5 rounded-xl md:rounded-[20px] text-[10px] md:text-[9px] font-black uppercase tracking-[0.2em] transition-all ${viewMode === mode ? 'bg-slate-900 text-white shadow-xl pointer-events-none' : 'text-slate-400 hover:bg-slate-50'}`}
                                >
                                    {t(mode, mode)}
                                </button>
                            ))}
                        </div>
                        <div className="flex items-center gap-2 w-full md:flex-1 min-w-0">
                            <div className="relative group/search flex-1 min-w-0">
                                <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within/search:text-indigo-500 transition-colors" />
                                <input
                                    name="scheduleSearch"
                                    placeholder={t("Filter Matrices...", "فلٹر...")}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-white border border-slate-100 rounded-2xl md:rounded-[20px] py-3 md:py-2.5 pl-10 pr-6 text-[10px] md:text-[9px] font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all shadow-sm"
                                />
                            </div>
                            <button
                                onClick={() => setShowBreakpoints(!showBreakpoints)}
                                className={`w-12 h-12 md:w-10 md:h-10 shrink-0 rounded-[16px] md:rounded-2xl flex items-center justify-center transition-all ${showBreakpoints ? 'bg-indigo-600 text-white shadow-indigo-200 shadow-lg' : 'bg-white border border-slate-100 text-slate-400'}`}
                            >
                                <Coffee size={18} />
                            </button>
                        </div>
                    </div>

                    {/* MAIN SCROLLABLE MATRIX */}
                    <div className="animate-in fade-in slide-in-from-bottom-5 duration-700 pb-20">
                        {viewMode === 'week' && (
                            <div className="overflow-x-auto no-scrollbar pb-10 w-full">
                                <div className="grid grid-cols-7 gap-2 md:gap-4 min-w-[800px] md:min-w-[1000px]">
                                    {days.map((day, idx) => (
                                        <div key={day} className="space-y-3 md:space-y-4">
                                            <div className={`py-3 md:py-4 rounded-xl md:rounded-[28px] border transition-all text-center ${day === todayName ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-200' : 'bg-white text-slate-500 border-slate-50 shadow-sm'}`}>
                                                <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em]">{dayNames[idx]}</p>
                                                {day === todayName && <div className="w-1.5 h-1.5 bg-white rounded-full mx-auto mt-1.5 md:mt-2 animate-pulse"></div>}
                                            </div>
                                            <div className="space-y-3 md:space-y-4 relative">
                                                {hybridSchedule.filter(i => i.day === day).map(item => (
                                                    <div
                                                        key={item.id}
                                                        className="p-3 md:p-5 rounded-2xl md:rounded-[32px] text-white relative group overflow-hidden shadow-lg transition-all hover:-translate-y-1 active:scale-95 border-b-4 border-black/10"
                                                        style={{ backgroundColor: item.color }}
                                                    >
                                                        <div className="absolute top-0 right-0 w-16 h-16 bg-white/20 rounded-full blur-2xl -mr-8 -mt-8"></div>
                                                        <div className="flex justify-between items-start mb-2 md:mb-4">
                                                            <span className="text-[8px] md:text-[9px] font-black opacity-80 uppercase tracking-widest">{item.startTime}</span>
                                                            {item.hasConflict && <AlertTriangle size={10} className="text-white animate-bounce" />}
                                                        </div>
                                                        <h4 className="text-[10px] md:text-[11px] font-black leading-tight mb-3 md:mb-4 uppercase">{item.title}</h4>
                                                        <div className="flex flex-wrap items-center gap-1 md:gap-2">
                                                            <div className="bg-black/10 px-1.5 py-0.5 rounded flex items-center gap-1">
                                                                <MapPin size={8} />
                                                                <span className="text-[7px] font-black tracking-tighter uppercase truncate max-w-[40px] md:max-w-none">{item.location?.split(' ')[0] || 'LAB'}</span>
                                                            </div>
                                                            {item.attendRate !== undefined && (
                                                                <div className="bg-white/10 px-1.5 py-0.5 rounded text-[7px] font-black">
                                                                    {item.attendRate}%
                                                                </div>
                                                            )}
                                                        </div>
                                                        <button
                                                            onClick={() => item.isStudy ? deleteStudyBlock(item.id) : deleteTimetableEntry(item.id)}
                                                            className="absolute bottom-2 right-2 w-6 h-6 md:w-8 md:h-8 bg-black/20 rounded-lg md:rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                                                        >
                                                            <Trash2 size={10} className="md:w-3 md:h-3" />
                                                        </button>
                                                    </div>
                                                ))}

                                                {showBreakpoints && dailyBreaks.filter(b => b.day === day).map(b => (
                                                    <div key={b.id} className="py-1.5 md:py-2 flex items-center justify-center gap-2 opacity-40 hover:opacity-100 transition-opacity">
                                                        <div className="h-px flex-1 bg-slate-200"></div>
                                                        <div className="flex items-center gap-1 px-2 py-0.5 md:px-3 md:py-1 bg-amber-50 rounded-full border border-amber-100">
                                                            <Coffee size={8} className="text-amber-500" />
                                                            <span className="text-[7px] md:text-[8px] font-black text-amber-500 uppercase tracking-tighter">{b.duration}m</span>
                                                        </div>
                                                        <div className="h-px flex-1 bg-slate-200"></div>
                                                    </div>
                                                ))}

                                                <button
                                                    onClick={() => setShowAddModal(true)}
                                                    className="w-full h-24 md:h-32 border-[3px] md:border-4 border-dashed border-slate-200/60 rounded-[20px] md:rounded-[36px] flex flex-col items-center justify-center text-slate-300 hover:border-indigo-300 hover:bg-indigo-50/50 hover:text-indigo-500 transition-all active:scale-95 group"
                                                >
                                                    <Plus size={20} className="md:w-6 md:h-6 group-hover:rotate-90 transition-transform mb-0.5 md:mb-1.5 stroke-[3px]" />
                                                    <span className="text-[7px] md:text-[8px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">{t("Deploy", "تعینات کریں")}</span>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {viewMode === 'day' && (
                            <div className="max-w-2xl mx-auto space-y-8">
                                {/* TACTICAL DAY PICKER */}
                                <div className="bg-white p-1 rounded-2xl md:rounded-[32px] border border-slate-100 shadow-xl shadow-slate-900/5 flex gap-1.5 overflow-x-auto no-scrollbar snap-x">
                                    {days.map((day, idx) => {
                                        const isSelected = selectedDay === idx + 1;
                                        const isToday = day === todayName;
                                        return (
                                            <button
                                                key={day}
                                                onClick={() => setSelectedDay(idx + 1)}
                                                className={`flex-1 min-w-[60px] md:min-w-[70px] py-3 md:py-4 rounded-xl md:rounded-[28px] transition-all duration-500 relative overflow-hidden snap-center flex flex-col items-center flex-shrink-0 ${isSelected ? 'bg-slate-900 text-white shadow-2xl scale-100' : 'text-slate-400 hover:bg-slate-50'}`}
                                            >
                                                <span className={`text-[7px] font-black uppercase tracking-[0.2em] mb-1 ${isSelected ? 'text-indigo-400' : 'text-slate-300'}`}>{dayNames[idx]}</span>
                                                <span className="text-xs font-black uppercase tracking-tighter">{t(day, day).slice(0, 3)}</span>
                                                {isToday && !isSelected && <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></div>}
                                                {isSelected && <div className="absolute bottom-1 w-4 h-1 bg-indigo-500 rounded-full"></div>}
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="space-y-3 md:space-y-4">
                                    {hybridSchedule.filter(i => i.day === days[selectedDay - 1]).length > 0 ? (
                                        hybridSchedule.filter(i => i.day === days[selectedDay - 1]).map((item, idx) => (
                                            <div
                                                key={item.id}
                                                className={`bg-white p-4 md:p-6 rounded-2xl md:rounded-[40px] border border-slate-50 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden flex flex-wrap md:flex-nowrap items-center gap-4 md:gap-6 animate-spring-up`}
                                                style={{ animationDelay: `${idx * 100}ms` }}
                                            >
                                                <div className="hidden md:block w-1.5 h-12 rounded-full shrink-0" style={{ backgroundColor: item.color }}></div>
                                                <div className="flex-1 min-w-0 w-full md:w-auto">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${timeStr >= item.startTime && timeStr <= item.endTime ? 'text-indigo-600 animate-pulse' : 'text-slate-400'}`}>
                                                            {item.startTime} — {item.endTime}
                                                        </span>
                                                        <span className="px-2.5 py-1 bg-slate-50 text-slate-400 rounded-lg text-[7px] font-black uppercase tracking-widest">{item.classType || 'Protocol'}</span>
                                                        {item.hasConflict && <AlertTriangle size={12} className="text-red-500 shrink-0" />}
                                                    </div>
                                                    <h4 className="text-lg font-black text-slate-900 tracking-tight leading-none mb-3 truncate uppercase">{item.title}</h4>
                                                    <div className="flex items-center gap-5">
                                                        <div className="flex items-center gap-2 text-slate-400 group-hover:text-indigo-600 transition-colors">
                                                            <MapPin size={12} />
                                                            <span className="text-[9px] font-black uppercase tracking-widest truncate">{item.location || 'HQ-1'}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-slate-400 group-hover:text-amber-600 transition-colors">
                                                            <BookOpen size={12} />
                                                            <span className="text-[9px] font-black uppercase tracking-widest truncate">{item.instructor || 'Staff'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all shrink-0">
                                                    <button onClick={() => setEditingItem(item)} className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all">
                                                        <Plus size={18} className="rotate-45" />
                                                    </button>
                                                    <button onClick={() => item.isStudy ? deleteStudyBlock(item.id) : deleteTimetableEntry(item.id)} className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all">
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="py-24 text-center">
                                            <div className="w-20 h-20 bg-slate-50 rounded-[40px] flex items-center justify-center mx-auto mb-6 border-2 border-dashed border-slate-100">
                                                <Sparkles size={32} className="text-slate-200" />
                                            </div>
                                            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{t("Neutral Zone", "غیر جانبدار زون")}</h3>
                                            <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.4em] mt-2">{t("No Missions detected", "کوئی مشن نہیں ملا")}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {viewMode === 'list' && (
                            <div className="space-y-6 max-w-2xl mx-auto">
                                {days.map(day => {
                                    const dayItems = hybridSchedule.filter(i => i.day === day);
                                    if (dayItems.length === 0) return null;
                                    return (
                                        <div key={day} className="relative pl-6 border-l-2 border-slate-100 pb-8 last:pb-0">
                                            <div className="absolute -left-[7px] top-0 w-3 h-3 rounded-full bg-white border-2 border-indigo-600"></div>
                                            <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em] mb-6 bg-slate-100 px-4 py-1.5 rounded-xl inline-block shadow-sm">
                                                {t(day, day)}
                                            </h3>
                                            <div className="grid gap-3">
                                                {dayItems.map(item => (
                                                    <div key={item.id} className="bg-white p-5 rounded-[28px] border border-slate-50 shadow-sm flex items-center justify-between group hover:border-indigo-100 transition-all hover:translate-x-1">
                                                        <div className="flex items-center gap-5 min-w-0">
                                                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-xs shadow-lg shrink-0" style={{ backgroundColor: item.color }}>
                                                                {item.code?.slice(0, 2) || 'S'}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <h4 className="font-black text-slate-800 text-[13px] leading-tight mb-2 uppercase truncate">{item.title}</h4>
                                                                <div className="flex items-center gap-3">
                                                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{item.startTime} — {item.endTime}</span>
                                                                    <div className="w-1 h-1 rounded-full bg-slate-200"></div>
                                                                    <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest truncate">{item.location || 'TBA'}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <button onClick={() => deleteTimetableEntry(item.id)} className="p-3 text-slate-200 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT CONTEXT: INTEL & TOOLS (4 COLS) */}
                <div className="lg:col-span-4 space-y-4 md:space-y-6">

                    {/* UPCOMING EXAM RADAR */}
                    <div className="bg-white p-6 md:p-8 rounded-[32px] md:rounded-[48px] shadow-xl shadow-slate-900/5 border border-slate-50 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-110 transition-transform"></div>
                        <div className="flex items-center justify-between mb-8 relative z-10">
                            <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.4em]">{t("Critical Radar", "اہم ریڈار")}</h3>
                            <div className="p-2 bg-red-50 text-red-500 rounded-xl"><Bell size={16} className="animate-swing" /></div>
                        </div>
                        <div className="space-y-4 relative z-10">
                            {exams.filter(e => !e.isCompleted).slice(0, 3).map(exam => {
                                const examDate = new Date(exam.date);
                                const isSoon = (examDate.getTime() - currentTime.getTime()) < (1000 * 60 * 60 * 24 * 3);
                                return (
                                    <div key={exam.id} className={`p-5 rounded-[32px] border flex items-center gap-4 transition-all hover:bg-slate-50 hover:scale-105 ${isSoon ? 'bg-red-50/50 border-red-100' : 'bg-white border-slate-50'}`}>
                                        <div className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center font-black ${isSoon ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-900'}`}>
                                            <span className="text-[8px] uppercase">{examDate.toLocaleDateString(undefined, { month: 'short' })}</span>
                                            <span className="text-sm tracking-tighter">{examDate.getDate()}</span>
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="text-[11px] font-black text-slate-900 uppercase truncate mb-1">{exam.name}</h4>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{exam.courseName.slice(0, 15)}...</p>
                                        </div>
                                    </div>
                                );
                            })}
                            {exams.filter(e => !e.isCompleted).length === 0 && (
                                <div className="py-8 md:py-10 px-4 text-center border-2 border-dashed border-slate-100 rounded-[24px] md:rounded-[32px] flex flex-col items-center justify-center gap-3">
                                    <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center">
                                        <CheckCircle2 size={16} className="text-slate-300" />
                                    </div>
                                    <span className="text-slate-400 font-black text-[9px] md:text-[10px] uppercase tracking-[0.3em]">{t("No Critical Threats", "کوئی اہم خطرہ نہیں")}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* STUDY BLOCK ARCHITECT */}
                    <div className="bg-slate-900 p-6 md:p-8 rounded-[32px] md:rounded-[48px] shadow-2xl shadow-indigo-900/20 border border-white/5 relative group">
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-600/10 rounded-full blur-3xl -ml-16 -mb-16"></div>
                        <div className="flex items-center justify-between mb-8 relative z-10">
                            <h3 className="text-[11px] font-black text-white uppercase tracking-[0.4em]">{t("Focus Blocks", "فوکس بلاکس")}</h3>
                            <button
                                onClick={() => {
                                    const title = prompt("Study Topic?");
                                    if (title) addStudyBlock({
                                        title,
                                        day: todayName as any,
                                        startTime: timeStr,
                                        endTime: "22:00",
                                        color: "#6366f1"
                                    });
                                }}
                                className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-indigo-400 transition-all active:scale-90"
                            >
                                <Plus size={16} />
                            </button>
                        </div>
                        <div className="space-y-4 relative z-10">
                            {studyBlocks.filter(b => b.day === todayName).map(block => (
                                <div key={block.id} className="p-5 rounded-[32px] bg-white/5 border border-white/5 group/block hover:bg-white/10 transition-all">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="text-sm font-black text-white uppercase tracking-tight">{block.title}</h4>
                                        <button onClick={() => deleteStudyBlock(block.id)} className="text-white/20 hover:text-red-400 opacity-0 group-hover/block:opacity-100 transition-all">
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{block.startTime} — {block.endTime}</span>
                                    </div>
                                </div>
                            ))}
                            {studyBlocks.filter(b => b.day === todayName).length === 0 && (
                                <div className="py-6 md:py-8 px-4 text-center border-2 border-dashed border-white/10 rounded-[24px] md:rounded-[32px] flex flex-col items-center justify-center gap-3">
                                    <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center">
                                        <Timer size={16} className="text-white/20" />
                                    </div>
                                    <span className="text-slate-500 font-black text-[9px] md:text-[10px] uppercase tracking-[0.3em]">{t("No Focus Sessions", "کوئی توجہ کے سیشن نہیں")}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* TACTICAL GUIDELINES */}
                    <div className="bg-white p-6 md:p-8 rounded-[32px] md:rounded-[48px] shadow-sm border border-slate-50">
                        <div className="flex items-center gap-3 mb-6">
                            <Info size={16} className="text-indigo-500" />
                            <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.4em]">{t("Mission Intel", "مشن انٹیل")}</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="flex gap-4 p-4 rounded-3xl bg-slate-50/50">
                                <Activity size={14} className="text-slate-400 shrink-0 mt-0.5" />
                                <p className="text-[10px] font-black text-slate-500 leading-relaxed uppercase tracking-widest">
                                    {t("High Load Detected: Tue/Thu sessions exceed average volume.", "زیادہ لوڈ معلوم ہوا")}
                                </p>
                            </div>
                            <div className="flex gap-4 p-4 rounded-3xl bg-slate-50/50">
                                <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                                <p className="text-[10px] font-black text-slate-500 leading-relaxed uppercase tracking-widest">
                                    {t("Attendance Health: 92% - Critical mission performance maintained.", "حاضری کی صحت: 92 فیصد")}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* UNIVERSAL MISSION MODAL */}
            {(showAddModal || editingItem) && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-3xl z-[100] flex items-center justify-center p-6 animate-in fade-in zoom-in-95 duration-500">
                    <div className="bg-white w-full max-w-sm rounded-[56px] p-10 relative shadow-[0_40px_120px_-20px_rgba(15,23,42,0.5)] border border-white/20">
                        <button
                            onClick={() => { setShowAddModal(false); setEditingItem(null); }}
                            className="absolute top-8 right-8 w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all transform active:scale-90"
                        >
                            <X size={24} strokeWidth={2.5} />
                        </button>

                        <div className="flex items-center gap-5 mb-10">
                            <div className="w-14 h-14 bg-indigo-600 rounded-[24px] flex items-center justify-center text-white shadow-2xl shadow-indigo-500/40 relative">
                                <Sparkles size={28} strokeWidth={2.5} className="animate-pulse" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none uppercase">
                                    {editingItem ? t("Update Protocol", "پروٹوکول اپ ڈیٹ") : t("New Trajectory", "نیا راستہ")}
                                </h1>
                                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mt-2">{t("Coordinate Resource Entry", "وسائل کے اندراج کو ہم آہنگ کریں")}</p>
                            </div>
                        </div>

                        <form className="space-y-4" onSubmit={(e) => {
                            e.preventDefault();
                            const fd = new FormData(e.currentTarget);
                            const entryData = {
                                courseId: fd.get('courseId') as string,
                                day: fd.get('day') as any,
                                startTime: fd.get('start') as string,
                                endTime: fd.get('end') as string,
                                location: fd.get('loc') as string,
                                instructor: fd.get('instr') as string,
                                classType: fd.get('type') as any,
                            };

                            if (editingItem) {
                                updateTimetableEntry(editingItem.id, entryData);
                            } else {
                                addTimetableEntry(entryData);
                            }
                            setShowAddModal(false);
                            setEditingItem(null);
                        }}>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{t("Sector Assignment", "سیکٹر اسائنمنٹ")}</label>
                                <select
                                    name="courseId"
                                    defaultValue={editingItem?.courseId}
                                    required
                                    title="Target Sector"
                                    className="w-full bg-slate-50 rounded-[22px] py-4 px-6 text-sm font-black text-slate-800 outline-none border-2 border-transparent focus:border-indigo-100 transition-all appearance-none cursor-pointer"
                                >
                                    {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{t("Timeline", "ٹائم لائن")}</label>
                                    <select name="day" defaultValue={editingItem?.day} className="w-full bg-slate-50 rounded-[22px] py-4 px-6 text-xs font-black text-slate-800 outline-none border-2 border-transparent focus:border-indigo-100 transition-all cursor-pointer appearance-none">
                                        {days.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{t("Category", "زمرہ")}</label>
                                    <select name="type" defaultValue={editingItem?.classType || "Lecture"} className="w-full bg-slate-50 rounded-[22px] py-4 px-6 text-xs font-black text-slate-800 outline-none border-2 border-transparent focus:border-indigo-100 transition-all cursor-pointer appearance-none">
                                        {['Lecture', 'Lab', 'Seminar', 'Exam', 'Study Hub'].map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <input name="instr" defaultValue={editingItem?.instructor} placeholder="Instructor" title="Mission Instructor" className="w-full bg-slate-50 rounded-[22px] py-4 px-6 text-[11px] font-black text-slate-800 outline-none border-2 border-transparent focus:border-indigo-100 transition-all placeholder:text-slate-300" />
                                <input name="loc" defaultValue={editingItem?.location} placeholder="Location" title="Mission Location" className="w-full bg-slate-50 rounded-[22px] py-4 px-6 text-[11px] font-black text-slate-800 outline-none border-2 border-transparent focus:border-indigo-100 transition-all placeholder:text-slate-300" />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{t("Temporal Range", "ٹیمپوریل رینج")}</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <input name="start" defaultValue={editingItem?.startTime} type="time" required className="bg-slate-50 rounded-[22px] py-4 px-6 text-[11px] font-black text-slate-800 outline-none border-2 border-transparent focus:border-indigo-100 transition-all" />
                                    <input name="end" defaultValue={editingItem?.endTime} type="time" required className="bg-slate-50 rounded-[22px] py-4 px-6 text-[11px] font-black text-slate-800 outline-none border-2 border-transparent focus:border-indigo-100 transition-all" />
                                </div>
                            </div>

                            <button className="w-full bg-slate-900 text-white py-5 rounded-[26px] font-black text-[10px] uppercase tracking-[0.4em] mt-6 shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3">
                                {editingItem ? t("Update Protocol", "پروٹوکول اپ ڈیٹ") : t("Lock Mission", "مشن کو لاک کریں")}
                                <CheckCircle2 size={16} strokeWidth={3} />
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
