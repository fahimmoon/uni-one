"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Calendar, CheckCircle, Plus, Book,
  Menu, BookOpen, BarChart3, Timer, GraduationCap,
  Calculator, Layers, Sparkles, ArrowUpRight,
  Target, Zap, Wallet, ClipboardCheck, Activity,
  Search, Bell, Filter, Clock, FileText, Play,
  Brain, Rocket, Globe, Shield, MessageSquare, AlertTriangle, Lightbulb, TrendingUp, X
} from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import { useStudentStore } from "@/lib/store";
import { useMemo } from "react";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [introState, setIntroState] = useState<'active' | 'fading' | 'complete'>('active');
  const {
    name, university, courses, timetable = [],
    streaks, totalPoints, achievements, budget = [], todos = [],
    exams = [], studySessions = []
  } = useStudentStore();
  const { t, language, setLanguage } = useLanguage();

  useEffect(() => {
    useStudentStore.persist.rehydrate();
    const tMount = setTimeout(() => setMounted(true), 10);
    const tFade = setTimeout(() => setIntroState('fading'), 2500);
    const tComplete = setTimeout(() => setIntroState('complete'), 3200);
    const clockTimer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => {
      clearTimeout(tMount);
      clearTimeout(tFade);
      clearTimeout(tComplete);
      clearInterval(clockTimer);
    };
  }, []);

  const totalBalance = useMemo(() =>
    budget.reduce((acc, curr) => curr.type === 'income' ? acc + curr.amount : acc - curr.amount, 0),
    [budget]
  );

  const taskProgress = useMemo(() => {
    if (todos.length === 0) return 0;
    const completed = todos.filter(t => t.completed).length;
    return Math.round((completed / todos.length) * 100);
  }, [todos]);

  const overallAttendance = useMemo(() => {
    if (courses.length === 0) return 100;
    const calculateCourseAttendance = (course: any) => {
      if (course.attendance.length === 0) return 100;
      const presentCount = course.attendance.filter((a: any) => a.status === 'present' || a.status === 'late').length;
      return (presentCount / course.attendance.length) * 100;
    };
    const total = courses.reduce((sum, c) => sum + calculateCourseAttendance(c), 0);
    return Math.round(total / courses.length);
  }, [courses]);

  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const todayName = days[currentTime.getDay()];

  const todayClasses = useMemo(() => {
    return (timetable || [])
      .filter(item => item.day === todayName)
      .map(item => {
        const course = courses.find(c => c.id === item.courseId);
        return {
          ...item,
          courseName: course?.name || 'Unknown',
          color: course?.color || '#3b82f6',
          courseCode: course?.code || '???'
        };
      })
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [timetable, courses, todayName]);

  const currentClass = useMemo(() => {
    const timeStr = currentTime.getHours().toString().padStart(2, '0') + ":" + currentTime.getMinutes().toString().padStart(2, '0');
    return todayClasses.find(i => timeStr >= i.startTime && timeStr <= i.endTime);
  }, [todayClasses, currentTime]);

  const nextClassItem = useMemo(() => {
    const timeStr = currentTime.getHours().toString().padStart(2, '0') + ":" + currentTime.getMinutes().toString().padStart(2, '0');
    return todayClasses.find(i => i.startTime > timeStr);
  }, [todayClasses, currentTime]);

  const averageGpa = useMemo(() => {
    let totalCredits = 0;
    let totalPoints = 0;
    courses.forEach((c: any) => {
      if (c.grade && c.credits) {
        totalPoints += c.grade * c.credits;
        totalCredits += c.credits;
      }
    });
    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : "0.00";
  }, [courses]);

  const upcomingExams = useMemo(() => {
    return exams
      .filter((e: any) => !e.isCompleted)
      .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 3);
  }, [exams]);

  const totalStudyMinutes = useMemo(() => {
    return studySessions.reduce((acc: number, curr: any) => acc + curr.duration, 0);
  }, [studySessions]);
  const nextClass = nextClassItem ? {
    courseName: nextClassItem.courseName,
    startTime: nextClassItem.startTime
  } : { courseName: t("Mission Clear", "مشن کلئیر"), startTime: "--:--" };

  // Generate Search Results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    const results = [];

    // Search courses
    const matchingCourses = courses.filter(c => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)).slice(0, 3);
    if (matchingCourses.length > 0) results.push({ category: "Modules", items: matchingCourses.map(c => ({ title: c.name, link: `/courses/${c.id}`, icon: BookOpen })) });

    // Search tasks
    const matchingTasks = todos.filter(t => t.text.toLowerCase().includes(q) && !t.completed).slice(0, 3);
    if (matchingTasks.length > 0) results.push({ category: "Active Missions", items: matchingTasks.map(t => ({ title: t.text, link: `/todo`, icon: ClipboardCheck })) });

    // Search exams
    const matchingExams = exams.filter((e: any) => e.name.toLowerCase().includes(q) && !e.isCompleted).slice(0, 3);
    if (matchingExams.length > 0) results.push({ category: "Threats", items: matchingExams.map((e: any) => ({ title: e.name, link: `/exams`, icon: AlertTriangle })) });

    return results;
  }, [searchQuery, courses, todos, exams]);

  // Compute live session progress
  const sessionProgress = useMemo(() => {
    if (!currentClass) return { percent: 0, text: "" };

    const [startH, startM] = currentClass.startTime.split(':').map(Number);
    const [endH, endM] = currentClass.endTime.split(':').map(Number);
    const startTotal = startH * 60 + startM;
    const endTotal = endH * 60 + endM;
    const currentTotal = currentTime.getHours() * 60 + currentTime.getMinutes();

    const totalDuration = endTotal - startTotal;
    const elapsed = currentTotal - startTotal;

    let percent = (elapsed / totalDuration) * 100;
    if (percent < 0) percent = 0;
    if (percent > 100) percent = 100;

    const minsRemaining = endTotal - currentTotal;

    return { percent, text: `${minsRemaining}m remaining` };
  }, [currentClass, currentTime]);

  if (!mounted) return (
    <div className="fixed inset-0 z-[9999] bg-slate-950 flex flex-col items-center justify-center">
      <div className="w-28 h-28 bg-slate-900 rounded-[36px] border border-white/5 flex items-center justify-center">
        <Layers size={40} className="text-slate-800" strokeWidth={1} />
      </div>
    </div>
  );

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { en: "Good Morning", ur: "صبح بخیر" };
    if (hour < 17) return { en: "Good Afternoon", ur: "سہ پہر بخیر" };
    return { en: "Good Evening", ur: "شام بخیر" };
  };

  const greeting = getGreeting();

  return (
    <div className="bg-[#FBFCFE] min-h-screen pb-40 font-sans selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden">

      {/* PREMIUM INTRO APP-LOADER */}
      {introState !== 'complete' && (
        <div className={`fixed inset-0 z-[9999] bg-slate-950 flex flex-col items-center justify-center overflow-hidden transition-all duration-700 ease-in-out ${introState === 'fading' ? 'opacity-0 scale-105 pointer-events-none blur-xl' : 'opacity-100 scale-100'}`}>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[100px] animate-pulse"></div>

          <div className="relative z-10 flex flex-col items-center">
            <div className="relative mb-10">
              <div className="w-28 h-28 bg-slate-900 rounded-[36px] flex items-center justify-center border border-white/10 shadow-[0_0_50px_rgba(59,130,246,0.1)] relative z-10 overflow-hidden">
                <div className="absolute inset-0 bg-linear-to-tr from-blue-600/10 to-purple-600/10"></div>
                <Layers size={48} className="text-blue-500 animate-pulse-glow" strokeWidth={1.5} />
              </div>
              <div className="absolute inset-0 border-[3px] border-blue-500/30 rounded-[36px] animate-ping" style={{ animationDuration: '2s' }}></div>
              <div className="absolute -inset-4 border border-indigo-500/20 rounded-[48px] animate-spin-slow"></div>
              <div className="absolute -inset-8 border border-purple-500/10 rounded-[64px]" style={{ animation: 'spin 4s linear infinite reverse' }}></div>
            </div>

            <h1 className="text-4xl font-black text-white tracking-tighter uppercase mb-3 flex items-center gap-1 overflow-hidden animate-spring-up">
              <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 via-indigo-300 to-purple-400">Uni-One</span>
              <span className="text-white">OS</span>
            </h1>

            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-12 animate-spring-up stagger-1">
              {t("Initializing Neural Engine...", "نیورل انجن شروع ہو رہا ہے...")}
            </p>

            <div className="w-64 space-y-3 animate-spring-up stagger-2">
              <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-slate-400 px-1">
                <span>System Boot</span>
                <span className="text-emerald-400 animate-pulse">100%</span>
              </div>
              <div className="h-1 bg-white/5 rounded-full overflow-hidden p-[1px] relative">
                <div className="h-full bg-linear-to-r from-blue-500 to-indigo-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.6)] w-full relative overflow-hidden">
                  <div className="absolute inset-0 bg-white/20 w-1/2 -skew-x-12 translate-x-[200%] animate-[pulse_2s_infinite]"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PREMIUM HEADER */}
      <div className="bg-slate-900 pt-16 pb-32 px-8 rounded-b-[64px] relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/20 rounded-full blur-[100px] -mr-20 -mt-20 animate-float"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-[80px] -ml-20 -mb-20 animate-float [animation-delay:2s]"></div>

        <div className="relative z-10 flex justify-between items-start">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="relative">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse-glow block"></span>
                <span className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-blue-400 animate-ping opacity-75"></span>
              </div>
              <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.4em] drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]">{t(greeting.en, greeting.ur)}</p>
            </div>
            <h1 className="text-4xl font-black text-white tracking-tighter leading-tight mt-2">
              {t("Hey,", "ہیلو،")} <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 via-indigo-300 to-purple-400 animate-gradient-x">{name.split(' ')[0]}</span>
            </h1>
            <div className="flex items-center gap-3 mt-4">
              <div className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/5 flex items-center gap-2 shadow-sm">
                <Target size={10} className="text-blue-400" />
                <span className="text-[8px] font-black text-white/60 uppercase tracking-widest">{university}</span>
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-white/20"></div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">Active</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-5">
            <div className="flex items-center gap-3">
              <button
                title={t("Notifications", "اطلاعات")}
                className="w-12 h-12 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center text-white/80 border border-white/10 hover:bg-white/20 transition-all relative">
                <Bell size={20} />
                <span className="absolute top-3 right-3 w-2 h-2 bg-rose-500 rounded-full border-2 border-slate-900"></span>
              </button>
              <Link href="/profile" className="group relative">
                <div className="absolute -inset-1 bg-linear-to-tr from-blue-500 to-indigo-500 rounded-[30px] blur opacity-25 group-hover:opacity-60 transition duration-500"></div>
                <div className="relative p-1 bg-slate-900 rounded-[28px] border border-white/10 group-hover:border-white/20 transition-all active:scale-95 shadow-2xl">
                  <div className="w-14 h-14 rounded-[24px] bg-linear-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-xl font-black text-white shadow-inner">
                    {name.charAt(0)}
                  </div>
                </div>
              </Link>
            </div>
            <button
              onClick={() => setLanguage(language === 'en' ? 'ur' : 'en')}
              className="bg-white/5 backdrop-blur-md border border-white/10 px-4 py-2 rounded-2xl text-[9px] font-black text-white uppercase tracking-widest hover:bg-white/10 active:scale-95 transition-all flex items-center gap-2"
            >
              <Zap size={10} className="text-amber-400 fill-amber-400" />
              {language === 'en' ? 'اردو' : 'English'}
            </button>
          </div>
        </div>

        {/* PREMIUM GLOBAL SEARCH */}
        <div className="mt-12 group relative z-50">
          <div className="absolute inset-y-0 left-6 flex items-center text-slate-500 group-focus-within:text-blue-400 transition-colors pointer-events-none">
            <Search size={18} />
          </div>
          <input
            type="text"
            name="globalSearch"
            placeholder={t("Alpha Search: Modules, Tasks, Finance...", "الفا سرچ: ماڈیولز، ٹاسک، فنانس...")}
            className="w-full bg-white/10 backdrop-blur-3xl border border-white/10 rounded-[28px] py-6 pl-16 pr-24 text-sm font-black text-white placeholder:text-slate-500 outline-none focus:ring-4 focus:ring-blue-600/20 focus:bg-white/15 focus:border-blue-400/50 transition-all shadow-2xl"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
          />
          <div className="absolute inset-y-0 right-4 flex items-center gap-2">
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(""); setIsSearchFocused(false); }}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/20 transition-all"
              >
                <X size={14} />
              </button>
            )}
            <kbd className="hidden sm:block px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] font-black text-slate-500 tracking-widest shadow-inner">CMD + K</kbd>
          </div>

          {/* SEARCH DROPDOWN OVERLAY */}
          {isSearchFocused && searchQuery && (
            <div className="absolute top-full left-0 right-0 mt-4 bg-slate-900 border border-slate-700 rounded-[32px] overflow-hidden shadow-2xl shadow-blue-900/40 z-50 p-2 animate-spring-up relative">
              <div className="absolute inset-0 bg-linear-to-b from-blue-900/10 to-transparent pointer-events-none"></div>
              {searchResults.length > 0 ? (
                <div className="max-h-[300px] overflow-y-auto no-scrollbar pb-2 relative z-10">
                  {searchResults.map((category, idx) => (
                    <div key={idx} className="mb-2">
                      <div className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-800/50 rounded-[24px] mb-2">
                        {category.category}
                      </div>
                      <div className="px-1 space-y-1">
                        {category.items.map((item, idxx) => (
                          <Link key={idxx} href={item.link} className="flex items-center gap-4 px-4 py-3 rounded-[20px] hover:bg-white/5 active:scale-95 transition-all text-white group" onClick={() => setIsSearchFocused(false)}>
                            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner border border-slate-700">
                              <item.icon size={16} />
                            </div>
                            <span className="font-bold text-sm leading-none flex-1 truncate">{item.title}</span>
                            <ArrowUpRight size={16} className="text-slate-600 group-hover:text-blue-400 transition-colors" />
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 flex flex-col items-center justify-center text-slate-400 relative z-10">
                  <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                    <Search size={24} className="opacity-50" />
                  </div>
                  <p className="text-xs font-black uppercase tracking-widest mb-1">Target Not Found</p>
                  <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">Modify Search Parameters</p>
                </div>
              )}
            </div>
          )}

          {/* INVISIBLE CLICK-AWAY CLOSE LAYER */}
          {isSearchFocused && (
            <div className="fixed inset-0 z-40" onClick={() => setIsSearchFocused(false)}></div>
          )}
        </div>

        {/* QUICK ACTIONS ROW */}
        <div className="flex flex-wrap items-center gap-3 mt-4">
          <Link href="/todo" className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 text-[10px] font-black text-white uppercase tracking-widest transition-all flex items-center gap-2 active:scale-95">
            <Plus size={12} className="text-blue-400" /> {t("New Mission", "نیا مشن")}
          </Link>
          <Link href="/study" className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 text-[10px] font-black text-white uppercase tracking-widest transition-all flex items-center gap-2 active:scale-95">
            <Play size={12} className="text-indigo-400" /> {t("Deep Focus", "ڈیپ فوکس")}
          </Link>
          <Link href="/budget" className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 text-[10px] font-black text-white uppercase tracking-widest transition-all flex items-center gap-2 active:scale-95">
            <Wallet size={12} className="text-emerald-400" /> {t("Log Expense", "خرچہ درج کریں")}
          </Link>
          <Link href="/notes" className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 text-[10px] font-black text-white uppercase tracking-widest transition-all flex items-center gap-2 active:scale-95">
            <FileText size={12} className="text-amber-400" /> {t("Quick Note", "فوری نوٹ")}
          </Link>
        </div>

        {/* FLOATING STATS OVERLAY */}
        <div className="absolute -bottom-10 left-8 right-8 grid grid-cols-3 gap-3">
          {[
            { label: "CGPA", val: averageGpa, icon: BarChart3, color: "text-blue-600", bg: "bg-blue-50" },
            { label: t("STREAK", "سلسلہ"), val: streaks || 0, icon: Timer, color: "text-amber-600", bg: "bg-amber-50" },
            { label: t("POINTS", "پوائنٹس"), val: totalPoints || 0, icon: GraduationCap, color: "text-purple-600", bg: "bg-purple-50" }
          ].map((stat, i) => (
            <div key={i} className="glass p-5 rounded-[40px] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] flex flex-col items-center border border-white/60 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-500">
              <div className={`w-9 h-9 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center mb-3 shadow-inner`}>
                <stat.icon size={18} strokeWidth={2.5} />
              </div>
              <span className="text-2xl font-black text-slate-900 leading-none tracking-tighter">{stat.val}</span>
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">{stat.label}</span>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-slate-200 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
          ))}
        </div>
      </div>

      <div className="px-8 mt-20 space-y-12">
        {/* TACTICAL OVERVIEW (NEW) */}
        <section className="animate-spring-up">
          <div className="grid grid-cols-3 gap-4">
            <Link href="/budget" className="bg-white rounded-[40px] p-5 border border-slate-50 shadow-xl shadow-slate-900/5 flex flex-col items-center group active:scale-95 transition-all hover:shadow-2xl hover:-translate-y-1">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:bg-emerald-600 group-hover:text-white transition-all transform duration-500">
                <Wallet size={18} strokeWidth={2.5} />
              </div>
              <span className="text-sm font-black text-slate-900 tracking-tighter">${totalBalance}</span>
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Vault</span>
            </Link>

            <Link href="/todo" className="bg-white rounded-[40px] p-5 border border-slate-50 shadow-xl shadow-slate-900/5 flex flex-col items-center group active:scale-95 transition-all hover:shadow-2xl hover:-translate-y-1">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 relative group-hover:bg-blue-600 group-hover:text-white transition-all transform duration-500">
                <ClipboardCheck size={18} strokeWidth={2.5} />
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-600 text-[8px] font-black text-white flex items-center justify-center border-2 border-white group-hover:scale-110 transition-transform">{todos.filter(t => !t.completed).length}</div>
              </div>
              <span className="text-sm font-black text-slate-900 tracking-tighter">{taskProgress}%</span>
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Missions</span>
            </Link>

            <Link href="/grades" className="bg-white rounded-[40px] p-5 border border-slate-50 shadow-xl shadow-slate-900/5 flex flex-col items-center group active:scale-95 transition-all hover:shadow-2xl hover:-translate-y-1">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3 group-hover:bg-rose-600 group-hover:text-white transition-all transform duration-500">
                <Activity size={18} strokeWidth={2.5} />
              </div>
              <span className="text-sm font-black text-slate-900 tracking-tighter">{overallAttendance}%</span>
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Attendance</span>
            </Link>
          </div>
        </section>
        {/* DAILY TACTICAL BRIEFING (NEW) */}
        <section className="animate-spring-up stagger-1">
          <div className="flex justify-between items-center mb-8 px-1">
            <div>
              <h2 className="font-black text-slate-900 text-2xl tracking-tight leading-none uppercase">{t("Pulse Status", "نبض کی صورتحال")}</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">{t("Real-time Mission Data", "فوری مشن ڈیٹا")}</p>
            </div>
            <Link href="/schedule" title="Full Time Matrix" className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:bg-slate-900 hover:text-white transition-all transform hover:rotate-90">
              <Calendar size={18} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* LIVE PULSE CARD */}
            <div className="bg-slate-900 p-8 rounded-[56px] text-white shadow-2xl shadow-blue-900/40 relative overflow-hidden group border border-white/5">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-[80px] -mr-24 -mt-24"></div>

              <div className="relative z-10 flex flex-col h-full">
                <div className="flex justify-between items-start mb-10">
                  <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-[24px] flex items-center justify-center border border-white/10 group-hover:bg-blue-600 transition-all duration-500">
                    <Activity size={24} className="text-blue-400 group-hover:text-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.4em] mb-1">{t("Status", "درجہ")}</p>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                      <span className="text-sm font-black text-white/90">{currentClass ? 'In Session' : 'Standby'}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-2xl font-black tracking-tighter leading-none mb-1">
                    {currentClass ? currentClass.courseName : nextClass.courseName}
                  </h3>
                  <div className="flex items-center gap-4 text-slate-400">
                    <div className="flex items-center gap-2">
                      <Timer size={14} className="text-blue-500" />
                      <span className="text-[11px] font-black uppercase tracking-widest">{currentClass ? `${currentClass.startTime} — ${currentClass.endTime}` : nextClass.startTime}</span>
                    </div>
                    <div className="w-1 h-1 rounded-full bg-slate-600"></div>
                    <div className="flex items-center gap-2">
                      <Globe size={14} className="text-indigo-500" />
                      <span className="text-[11px] font-black uppercase tracking-widest">{currentClass?.location || 'Cyber Lab'}</span>
                    </div>
                  </div>
                </div>

                {currentClass && (
                  <div className="mt-8 pt-8 border-t border-white/5 relative">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-3">
                      <span className="text-slate-500">{t("Progress", "پیشرفت")}</span>
                      <span className={`${sessionProgress.percent >= 90 ? 'text-emerald-400 animate-pulse' : 'text-blue-400'}`}>{sessionProgress.percent.toFixed(0)}% • {sessionProgress.text}</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden p-[1px]">
                      <div className="h-full bg-linear-to-r from-blue-600 to-indigo-400 rounded-full transition-all duration-1000 relative" style={{ width: `${sessionProgress.percent}%` }}>
                        <div className="absolute inset-0 bg-white/20 w-full animate-pulse-glow"></div>
                      </div>
                    </div>
                  </div>
                )}

                {!currentClass && nextClassItem && (
                  <Link href="/schedule" className="mt-10 px-6 py-3 bg-white/5 hover:bg-white/10 rounded-2xl flex items-center justify-between group/btn transition-all border border-white/5">
                    <span className="text-[10px] font-black uppercase tracking-widest">{t("View Full Matrix", "مکمل میٹرکس دیکھیں")}</span>
                    <ArrowUpRight size={18} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                  </Link>
                )}
              </div>
            </div>

            {/* DAILY BRIEFING LIST */}
            <div className="bg-white p-8 rounded-[56px] border border-slate-50 shadow-2xl shadow-slate-900/5">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">{t("Daily Schedule", "روزانہ کا شیڈول")}</h3>
                <div className="flex items-center gap-2 py-1 px-3 bg-indigo-50 text-indigo-600 rounded-full text-[9px] font-black uppercase tracking-widest">
                  {todayClasses.length} {t("Missions", "مشنز")}
                </div>
              </div>

              <div className="space-y-4">
                {todayClasses.length > 0 ? todayClasses.map((item, idx) => {
                  const isPast = currentTime.getHours() * 60 + currentTime.getMinutes() > (parseInt(item.endTime.split(':')[0]) * 60 + parseInt(item.endTime.split(':')[1]));
                  const isOngoing = !isPast && (currentTime.getHours() * 60 + currentTime.getMinutes() >= parseInt(item.startTime.split(':')[0]) * 60 + parseInt(item.startTime.split(':')[1]));
                  return (
                    <div key={idx} className={`group flex items-center gap-5 p-4 rounded-[28px] border transition-all ${isPast ? 'bg-slate-50 border-transparent opacity-60' : 'bg-white border-slate-50 hover:border-indigo-100 hover:shadow-xl'}`}>
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-[10px] shrink-0 shadow-lg`} style={{ backgroundColor: item.color }}>
                        {item.courseCode.slice(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-black text-slate-800 text-sm leading-none mb-1.5 truncate uppercase tracking-tighter">{item.courseName}</h4>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                          {item.startTime} — {item.endTime}
                        </p>
                      </div>
                      {!isPast && !isOngoing && (
                        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner">
                          <Target size={14} />
                        </div>
                      )}
                      {isOngoing && (
                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 animate-pulse">
                          <Activity size={14} />
                        </div>
                      )}
                      {isPast && (
                        <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 shadow-sm">
                          <CheckCircle size={14} />
                        </div>
                      )}
                    </div>
                  );
                }) : (
                  <div className="py-20 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-[28px] flex items-center justify-center mx-auto mb-6">
                      <Rocket size={28} className="text-slate-200" />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t("No Tactical Missions Today", "آج کوئی ٹاپ مشن نہیں")}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ACADEMIC NEURAL MAP (REPLACING LEARNING HUB) */}
        <section className="animate-spring-up stagger-2">
          <div className="flex justify-between items-center mb-8 px-1">
            <div>
              <h2 className="font-black text-slate-900 text-2xl tracking-tight leading-none uppercase">{t("Academic Progress", "اکیڈمک پیشرفت")}</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">{t("Neuro-Course Analytics", "نیورو کورس تجزیات")}</p>
            </div>
            <Link href="/courses" title="View All Courses" className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:bg-slate-900 hover:text-white transition-all transform hover:rotate-90">
              <BookOpen size={18} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(course => (
              <Link key={course.id} href={`/courses/${course.id}`} className="bg-white p-6 rounded-[48px] border border-slate-50 shadow-xl shadow-slate-900/5 group relative overflow-hidden active:scale-95 transition-all hover:shadow-2xl">
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-5 group-hover:opacity-10 transition-opacity" style={{ backgroundColor: course.color || '#3b82f6' }}></div>
                <div className="flex items-center gap-5 mb-6">
                  <div className="w-14 h-14 rounded-[22px] flex items-center justify-center text-white shrink-0 shadow-lg" style={{ backgroundColor: course.color || '#3b82f6' }}>
                    <Book size={24} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-black text-slate-800 text-sm leading-tight truncate uppercase tracking-tighter">{course.name}</h3>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{course.code}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{t("Course Mastery", "کورس کی مہارت")}</span>
                    <span className="text-[12px] font-black text-slate-900">75%</span>
                  </div>
                  <div className="h-1.5 bg-slate-50 rounded-full overflow-hidden p-0.5 border border-slate-100">
                    <div className="h-full bg-slate-900 w-3/4 rounded-full"></div>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle size={10} className="text-emerald-500" />
                      <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">12/16 {t("Modules", "ماڈیولز")}</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-md text-[8px] font-black uppercase tracking-tighter">
                      GPA: {course.grade || '4.0'}
                    </div>
                  </div>
                </div>
              </Link>
            ))}

            <Link href="/courses/create" title="Add New Sector" className="bg-slate-50 p-6 rounded-[48px] border-4 border-dashed border-slate-200 flex flex-col items-center justify-center group cursor-pointer hover:border-indigo-400 hover:bg-white transition-all min-h-[220px]">
              <div className="w-14 h-14 bg-white rounded-[22px] flex items-center justify-center text-slate-300 mb-4 group-hover:text-indigo-600 shadow-sm transition-colors animate-pulse">
                <Plus size={32} />
              </div>
              <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">{t("Expand Neural Map", "نیورل میپ بڑھائیں")}</p>
            </Link>
          </div>
        </section>

        {/* FINANCIAL PULSE MATRIX (NEW) */}
        <section className="animate-spring-up stagger-3">
          <div className="flex justify-between items-center mb-8 px-1">
            <div>
              <h2 className="font-black text-slate-900 text-2xl tracking-tight leading-none uppercase">{t("Budget Matrix", "بجٹ میٹرکس")}</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">{t("Vault Operations & Assets", "والٹ آپریشنز اور اثاثے")}</p>
            </div>
            <Link href="/budget" title="Vault Access" className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:bg-emerald-600 hover:text-white transition-all transform hover:rotate-90">
              <Wallet size={18} />
            </Link>
          </div>

          <div className="bg-white p-8 rounded-[56px] border border-slate-50 shadow-2xl shadow-slate-900/5 relative overflow-hidden flex flex-col md:flex-row gap-10">
            <div className="flex-1">
              <div className="bg-slate-900 p-8 rounded-[40px] text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-600/30 rounded-full blur-[40px] -mr-12 -mt-12 group-hover:scale-150 transition-all duration-1000"></div>
                <div className="relative z-10">
                  <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.4em] mb-3">{t("Total Assets", "کل اثاثے")}</p>
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-black tracking-tighter">${totalBalance}</span>
                    <span className="text-[10px] font-black text-slate-500 uppercase mb-2">USD</span>
                  </div>
                  <div className="mt-8 flex gap-4">
                    <div className="flex-1 bg-white/5 rounded-2xl p-4 border border-white/5 backdrop-blur-md">
                      <p className="text-[8px] font-black text-emerald-400 uppercase tracking-widest mb-1">{t("Revenue", "آمدنی")}</p>
                      <span className="text-sm font-black text-white">$2,450</span>
                    </div>
                    <div className="flex-1 bg-white/5 rounded-2xl p-4 border border-white/5 backdrop-blur-md">
                      <p className="text-[8px] font-black text-rose-400 uppercase tracking-widest mb-1">{t("Expense", "خرچہ")}</p>
                      <span className="text-sm font-black text-white">${2450 - totalBalance}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 flex flex-col justify-center space-y-6">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-2">{t("Fiscal Sector Breakdown", "مالیاتی شعبے کی تقسیم")}</h3>
              <div className="space-y-4">
                {[
                  { label: 'Academic Fees', amount: 450, color: 'bg-indigo-500', percent: '65%' },
                  { label: 'Tactical Gear', amount: 120, color: 'bg-emerald-500', percent: '15%' },
                  { label: 'Nutrition', amount: 200, color: 'bg-amber-500', percent: '20%' }
                ].map((cat, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between text-[9px] font-black text-slate-700 uppercase tracking-widest">
                      <span>{cat.label}</span>
                      <span>${cat.amount}</span>
                    </div>
                    <div className="h-1 bg-slate-50 rounded-full overflow-hidden">
                      <div className={`h-full ${cat.color} transition-all duration-1000`} style={{ width: cat.percent }}></div>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/budget" className="mt-6 flex items-center justify-between p-4 bg-slate-50 rounded-2xl text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] hover:bg-slate-900 hover:text-white transition-all group">
                {t("Execute Audit", "آڈٹ پر عمل کریں")}
                <ArrowUpRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </section>

        {/* MISSION MATRIX (ULTRA PREMIUM ENHANCEMENT) */}
        <section className="animate-spring-up stagger-4">
          <div className="flex justify-between items-center mb-8 px-1">
            <div>
              <h2 className="font-black text-slate-900 text-2xl tracking-tight leading-none uppercase">{t("Mission Matrix", "مشن میٹرکس")}</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">{t("Advanced Task Management", "ایڈوانس ٹاسک مینجمنٹ")}</p>
            </div>
            <Link href="/todo" title="Mission Board" className="p-3 bg-slate-900 rounded-[20px] text-white hover:bg-blue-600 transition-all transform hover:rotate-90 hover:scale-110 shadow-lg shadow-blue-900/20">
              <ClipboardCheck size={18} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-7 bg-white p-8 rounded-[56px] border border-slate-50 shadow-2xl shadow-slate-900/5 flex flex-col h-full relative overflow-hidden group/board">
              <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full blur-[80px] -mr-32 -mt-32 opacity-0 group-hover/board:opacity-100 transition-opacity duration-1000"></div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 relative z-10 border-b border-slate-100 pb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-slate-900 rounded-[24px] flex items-center justify-center text-white shadow-[0_0_30px_rgba(15,23,42,0.2)]">
                    <Target size={24} className="animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-[12px] font-black text-slate-900 uppercase tracking-[0.4em] mb-1">{t("Active Missions", "فعال مشنز")}</h3>
                    <p className="text-[9px] font-black text-slate-400 tracking-widest uppercase">Target Acquisition Log</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-[16px] text-[10px] font-black uppercase tracking-widest shadow-inner shadow-white/10">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping mr-1"></div>
                  {todos.filter(t => !t.completed).length} Priority
                </div>
              </div>

              <div className="space-y-4 flex-1 relative z-10">
                {todos.filter(t => !t.completed).slice(0, 4).map((todo, i) => (
                  <div key={i} className={`flex items-center gap-4 p-5 rounded-[32px] border transition-all duration-300 group/item cursor-pointer hover:shadow-xl hover:-translate-y-1 ${todo.priority === 'high' ? 'bg-rose-50/50 border-rose-100 hover:border-rose-300' : 'bg-slate-50 border-slate-100 hover:border-blue-200 hover:bg-blue-50/30'}`}>
                    <div className={`w-12 h-12 rounded-[20px] shadow-sm flex items-center justify-center shrink-0 border relative overflow-hidden ${todo.priority === 'high' ? 'bg-white border-rose-100 text-rose-500 group-hover/item:text-white' : 'bg-white border-slate-200 text-slate-500 group-hover/item:text-white'}`}>
                      <div className={`absolute inset-0 translate-y-full group-hover/item:translate-y-0 transition-transform ${todo.priority === 'high' ? 'bg-rose-500' : 'bg-blue-600'}`}></div>
                      <Rocket size={18} className="relative z-10" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-black text-slate-800 text-sm leading-tight truncate uppercase tracking-tighter group-hover/item:text-slate-900">{todo.text}</h4>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1.5 flex items-center gap-1.5">
                        <Clock size={10} className={todo.priority === 'high' ? 'text-rose-400' : 'text-slate-300'} /> Due {todo.dueDate || 'TBA'}
                      </p>
                    </div>
                    <button className="w-10 h-10 rounded-[16px] bg-white border border-slate-200 flex items-center justify-center text-slate-300 group-hover/item:border-emerald-200 group-hover/item:bg-emerald-500 group-hover/item:text-white transition-all shadow-sm active:scale-90">
                      <CheckCircle size={18} />
                    </button>
                  </div>
                ))}
                {todos.filter(t => !t.completed).length === 0 && (
                  <div className="py-16 flex flex-col items-center justify-center text-center opacity-70">
                    <div className="w-20 h-20 bg-slate-50 rounded-[32px] flex items-center justify-center mb-6">
                      <Sparkles size={32} className="text-slate-300" />
                    </div>
                    <h4 className="text-sm font-black uppercase text-slate-900 tracking-tight mb-2">Sector Swept Clean</h4>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">All targets have been neutralized</p>
                  </div>
                )}
              </div>

              <Link href="/todo" className="mt-8 relative w-full p-5 bg-slate-900 rounded-[32px] text-white shadow-2xl shadow-blue-900/20 group overflow-hidden flex items-center justify-center gap-3">
                <div className="absolute inset-0 bg-blue-600 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></div>
                <ClipboardCheck size={18} className="relative z-10 opacity-70 group-hover:opacity-100 transition-opacity" />
                <span className="relative z-10 text-[10px] font-black uppercase tracking-[0.4em] drop-shadow-md">{t("Access Full Protocol", "مکمل پروٹوکول تک رسائی")}</span>
                <ArrowUpRight size={18} className="relative z-10 absolute right-6 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all" />
              </Link>
            </div>

            <div className="md:col-span-5 grid grid-cols-2 gap-4">
              {[
                { label: 'Subnet Calc', icon: Calculator, color: 'text-blue-500', bg: 'bg-blue-500', link: '/tools/subnet', desc: 'IP Analysis' },
                { label: 'OSI Map', icon: Layers, color: 'text-orange-500', bg: 'bg-orange-500', link: '/tools/osi', desc: 'Protocol Stack' },
                { label: 'Uni Archive', icon: BookOpen, color: 'text-emerald-500', bg: 'bg-emerald-500', link: '/library', desc: 'Data Vault' },
                { label: 'Intel Grid', icon: BarChart3, color: 'text-rose-500', bg: 'bg-rose-500', link: '/grades', desc: 'Performance' }
              ].map((tool, i) => (
                <Link key={i} href={tool.link} className="bg-slate-900 rounded-[48px] border border-white/5 relative overflow-hidden group active:scale-95 transition-all text-left flex flex-col p-6 shadow-2xl">
                  <div className="absolute top-0 right-0 w-32 h-32 blur-3xl rounded-full opacity-20 group-hover:scale-150 group-hover:opacity-40 transition-all duration-700 -mr-16 -mt-16 pointer-events-none" style={{ backgroundColor: tool.bg.replace('bg-', '') }}></div>
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-black/40 to-transparent pointer-events-none"></div>

                  <div className="flex-1 flex flex-col">
                    <div className={`w-14 h-14 ${tool.bg} rounded-[24px] flex items-center justify-center mb-auto text-white shadow-[0_0_30px_rgba(0,0,0,0.3)] shadow-${tool.bg.replace('bg-', '')}/40 border border-white/20 group-hover:-translate-y-2 group-hover:rotate-6 transition-transform relative z-10`}>
                      <tool.icon size={24} strokeWidth={2} />
                    </div>
                    <div className="relative z-10 mt-10">
                      <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-1">{tool.desc}</span>
                      <span className="text-[12px] font-black text-white uppercase tracking-tight block">{t(tool.label, tool.label)}</span>
                    </div>
                  </div>
                  <div className="absolute right-6 bottom-6 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/50 group-hover:bg-white group-hover:text-slate-900 transition-all z-10 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0">
                    <ArrowUpRight size={14} strokeWidth={3} />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* EXAMS & DEADLINES MATRIX (NEW) */}
        <section className="animate-spring-up stagger-5">
          <div className="flex justify-between items-center mb-8 px-1">
            <div>
              <h2 className="font-black text-slate-900 text-2xl tracking-tight leading-none uppercase">{t("Critical Deadlines", "اہم آخری تاریخ")}</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">{t("Upcoming Exams & Assignments", "آنے والے امتحانات")}</p>
            </div>
            <Link href="/exams" title="View All Threats" className="p-3 bg-red-50 rounded-2xl text-red-500 hover:bg-red-600 hover:text-white transition-all transform hover:rotate-90">
              <AlertTriangle size={18} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {upcomingExams.length > 0 ? upcomingExams.map((exam: any) => (
              <div key={exam.id} className="bg-white p-6 rounded-[40px] border border-slate-50 shadow-xl shadow-slate-900/5 group relative overflow-hidden active:scale-95 transition-all hover:shadow-2xl">
                <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 rounded-full blur-2xl -mr-12 -mt-12 group-hover:bg-red-100 transition-colors"></div>
                <div className="flex items-center gap-4 mb-4 relative z-10">
                  <div className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center shrink-0">
                    <AlertTriangle size={18} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-black text-slate-800 text-sm truncate uppercase">{exam.name}</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{exam.courseName}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest text-slate-500 mt-6 relative z-10 bg-slate-50 px-4 py-2 rounded-xl">
                  <span className="flex items-center gap-2"><Calendar size={12} /> {new Date(exam.date).toLocaleDateString()}</span>
                  {exam.time && <span className="flex items-center gap-2"><Clock size={12} /> {exam.time}</span>}
                </div>
              </div>
            )) : (
              <div className="md:col-span-3 bg-white border border-dashed border-slate-200 p-8 rounded-[48px] text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-4"><CheckCircle size={28} /></div>
                <h3 className="text-slate-900 font-black uppercase tracking-tight text-lg">No Critical Threats</h3>
                <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest mt-2">{t("All exams and assignments cleared", "سب امتحانات صاف ہیں")}</p>
              </div>
            )}
          </div>
        </section>

        {/* NEURO-FOCUS MATRIX (NEW) */}
        <section className="animate-spring-up stagger-6">
          <div className="flex justify-between items-center mb-8 px-1">
            <div>
              <h2 className="font-black text-slate-900 text-2xl tracking-tight leading-none uppercase">{t("Neuro-Focus Engine", "نیورو فوکس انجن")}</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">{t("Study Analytics & Habit Tracking", "مطالعہ کے تجزیاتی اعداد شمار")}</p>
            </div>
            <Link href="/study" title="Launch Focus Protocol" className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:bg-indigo-600 hover:text-white transition-all transform hover:scale-110">
              <Brain size={18} />
            </Link>
          </div>

          <div className="bg-slate-900 rounded-[56px] p-8 md:p-12 relative overflow-hidden shadow-2xl border border-white/10 group">
            <div className="absolute inset-0 bg-linear-to-r from-indigo-500/10 to-purple-500/10 group-hover:opacity-100 transition-opacity"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/20 blur-[100px] rounded-full pointer-events-none"></div>

            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-2">{t("Deep Work Hours", "ڈیپ ورک کے گھنٹے")}</p>
                <div className="flex items-end gap-3 mb-6">
                  <span className="text-5xl font-black tracking-tighter text-white">{(totalStudyMinutes / 60).toFixed(1)}</span>
                  <span className="text-sm font-black text-slate-400 uppercase mb-2">Hrs / Week</span>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-4 bg-white/5 p-4 rounded-[24px] border border-white/5 backdrop-blur-md">
                    <div className="w-10 h-10 bg-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center"><Lightbulb size={18} /></div>
                    <div>
                      <p className="text-white text-xs font-black uppercase">{t("Focus Score", "فوکس سکور")}</p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Average 8.5 / 10</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 bg-white/5 p-4 rounded-[24px] border border-white/5 backdrop-blur-md">
                    <div className="w-10 h-10 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center"><Target size={18} /></div>
                    <div>
                      <p className="text-white text-xs font-black uppercase">{t("Longest Streak", "طویل ترین سلسلہ")}</p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{streaks || 0} Days Protocol</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-center flex-col gap-6">
                <div className="bg-white/5 rounded-[40px] p-8 border border-white/10 backdrop-blur-3xl text-center shadow-2xl">
                  <div className="w-20 h-20 bg-indigo-500 rounded-full flex items-center justify-center mx-auto mb-6 text-white shadow-[0_0_40px_rgba(99,102,241,0.5)] relative">
                    <Play size={32} className="ml-2 animate-pulse" />
                    <div className="absolute inset-0 border-[3px] border-indigo-400/30 rounded-full animate-ping"></div>
                  </div>
                  <h3 className="text-white font-black text-xl uppercase tracking-tight mb-2">{t("Start Session", "سیشن شروع کریں")}</h3>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{t("Initiate Deep Work Mode", "ڈیپ ورک موڈ شروع کریں")}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* AI OMNISCIENCE COPILOT (ENHANCED FEATURE) */}
        <section className="animate-spring-up stagger-7">
          <div className="flex justify-between items-center mb-8 px-1">
            <div>
              <h2 className="font-black text-slate-900 text-2xl tracking-tight leading-none uppercase">{t("AI Copilot", "اے آئی کوپائلٹ")}</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">{t("Omniscience Engine Insights", "اومنی سائنس انجن کی بصیرت")}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-2xl text-blue-500 flex items-center justify-center shadow-inner relative overflow-hidden group cursor-pointer hover:bg-blue-600 hover:text-white transition-all">
              <Sparkles size={18} className="relative z-10" />
              <div className="absolute inset-0 bg-blue-400/20 blur-md group-hover:bg-blue-400 flex items-center justify-center -translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
            </div>
          </div>

          <div className="bg-slate-900 p-8 rounded-[56px] border border-slate-800 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/10 rounded-full blur-[80px] -ml-20 -mb-20 pointer-events-none"></div>

            <div className="relative z-10 space-y-6">
              {/* Insight 1: Exam Warning / Encouragement */}
              <div className="bg-white/5 border border-white/10 p-6 rounded-[32px] flex flex-col md:flex-row gap-5 items-start md:items-center backdrop-blur-md group hover:bg-white/10 transition-colors">
                <div className="w-14 h-14 bg-rose-500/20 text-rose-400 rounded-2xl flex items-center justify-center shrink-0 border border-rose-500/20 shadow-[0_0_30px_rgba(244,63,94,0.15)] group-hover:scale-110 transition-transform">
                  <AlertTriangle size={24} strokeWidth={2.5} />
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-black text-sm uppercase tracking-tight mb-1">{upcomingExams.length > 0 ? t("Critical Defense Breach Upcoming", "اہم دفاعی خلاف ورزی متوقع") : t("Sector Clear", "سیکٹر کلیئر")}</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                    {upcomingExams.length > 0
                      ? t(`Analysis indicates ${upcomingExams.length} imminent exams. Recommend initiating deep focus protocol immediately.`, `تجزیہ بتاتا ہے کہ ${upcomingExams.length} امتحانات آ رہے ہیں۔`)
                      : t("No active threats detected in the academic sector. Maintain regular patrol routines.", "تعلیمی شعبے میں کوئی فعال خطرہ نہیں ملا۔")}
                  </p>
                </div>
                {upcomingExams.length > 0 && (
                  <Link href="/study" className="px-6 py-3 bg-rose-600 hover:bg-rose-500 rounded-xl text-[10px] font-black text-white uppercase tracking-[0.2em] shadow-xl whitespace-nowrap active:scale-95 transition-all">
                    {t("Deploy Copilot", "کوپائلٹ تعینات کریں")}
                  </Link>
                )}
              </div>

              {/* Insight 2: Financial Audit */}
              <div className="bg-white/5 border border-white/10 p-6 rounded-[32px] flex flex-col md:flex-row gap-5 items-start md:items-center backdrop-blur-md group hover:bg-white/10 transition-colors">
                <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center shrink-0 border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.15)] group-hover:scale-110 transition-transform">
                  <TrendingUp size={24} strokeWidth={2.5} />
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-black text-sm uppercase tracking-tight mb-1">{t("Vault Efficiency Status", "والٹ کی کارکردگی")}</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                    {totalBalance > 500
                      ? t("High reserve efficiency confirmed. Asset allocation is optimal for upcoming sector objectives.", "اعلی ریزرو کارکردگی کی تصدیق ہو گئی ہے۔")
                      : t("Warning: Vault reserves are suboptimal. Recommend immediate resource rationing protocols.", "انتباہ: والٹ کے ذخائر کم ہیں۔ فوری ایکشن کی سفارش ہے۔")}
                  </p>
                </div>
                <Link href="/budget" className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-black text-white uppercase tracking-[0.2em] whitespace-nowrap active:scale-95 transition-all">
                  {t("View Matrix", "میٹرکس دیکھیں")}
                </Link>
              </div>

              {/* Suggestions Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-white/5">
                {[
                  { icon: FileText, label: t("Generate Notes", "نوٹس بنائیں"), color: "text-blue-400" },
                  { icon: Layers, label: t("Build Study Plan", "سٹڈی پلان"), color: "text-purple-400" },
                  { icon: Calculator, label: t("Predict GPA", "جی پی اے کا اندازہ"), color: "text-amber-400" },
                  { icon: Target, label: t("Optimize Routine", "روٹین بہتر کریں"), color: "text-emerald-400" }
                ].map((action, idx) => (
                  <button key={idx} className="bg-white/5 hover:bg-white/10 border border-white/5 p-4 rounded-[24px] flex flex-col items-center justify-center gap-3 transition-colors group">
                    <action.icon size={20} className={`${action.color} group-hover:scale-110 transition-transform`} />
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest group-hover:text-white transition-colors">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ACHIEVEMENTS & MILESTONES */}
        <section>
          <div className="bg-slate-900 rounded-[64px] p-12 text-white relative overflow-hidden shadow-[0_40px_100px_-20px_rgba(15,23,42,0.4)] border border-white/5">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[120px] -mr-48 -mt-48"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-600/5 rounded-full blur-[100px] -ml-40 -mb-40"></div>

            <div className="flex flex-col sm:flex-row items-center gap-8 relative z-10 mb-12 text-center sm:text-left">
              <div className="relative">
                <div className="w-24 h-24 bg-white/5 backdrop-blur-2xl rounded-[40px] flex items-center justify-center border border-white/10 shadow-3xl">
                  <GraduationCap size={48} className="text-amber-400 animate-float drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]" />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-blue-600 w-8 h-8 rounded-full border-4 border-slate-900 flex items-center justify-center">
                  <Sparkles size={14} className="text-white animate-pulse" />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-[12px] font-black text-blue-400 uppercase tracking-[0.5em] mb-3">{t("Tier Progress", "درجہ کی ترقی")}</p>
                <h2 className="text-3xl font-black tracking-tighter leading-none mb-4">{t("Dean's Elite Tier", "ڈین کا ایلیٹ ٹائر")}</h2>
                <div className="flex flex-wrap justify-center sm:justify-start gap-3">
                  {['Research Card', 'A+ Streak', 'Top 5%'].map((badge, i) => (
                    <span key={i} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[8px] font-black uppercase tracking-widest text-slate-400">{badge}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4 relative z-10 bg-white/5 p-8 rounded-[40px] border border-white/5 backdrop-blur-sm">
              <div className="flex justify-between items-end text-[10px] font-black uppercase tracking-[0.3em] mb-2 px-1">
                <div className="flex items-center gap-2">
                  <span className="text-blue-400">{t("Current Level", "موجودہ لیول")}</span>
                  <span className="text-white text-base leading-none">08</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 mr-2">{t("Goal", "مقصد")}</span>
                  <span className="text-white text-base leading-none">10</span>
                </div>
              </div>
              <div className="h-4 bg-slate-950 rounded-full overflow-hidden p-1 shadow-inner">
                <div
                  className="h-full bg-linear-to-r from-blue-600 via-indigo-500 to-purple-500 rounded-full shadow-[0_0_30px_rgba(37,99,235,0.6)] animate-pulse-glow"
                  style={{ width: '80%' }}
                ></div>
              </div>
              <div className="flex justify-between items-center mt-6">
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{t("Next: Platinum Certification", "اگلا: پلاٹینم سرٹیفیکیشن")}</p>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-500 rounded-full text-[9px] font-black uppercase tracking-widest">
                  <Zap size={10} fill="currentColor" /> 250 XP
                </div>
              </div>
            </div>

            <footer className="mt-16 text-center border-t border-white/5 pt-10">
              <div className="inline-block px-6 py-2 bg-white/5 rounded-full border border-white/5 backdrop-blur-md mb-6">
                <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.5em]">{t("Uni-One Platinum v2.5", "یونی ون پلاٹینم v2.5")}</p>
              </div>
              <div className="flex justify-center gap-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className={`w-1.5 h-1.5 rounded-full shadow-lg ${i === 1 ? 'bg-blue-500 animate-pulse' : i === 2 ? 'bg-indigo-500' : 'bg-purple-500'}`}></div>
                ))}
              </div>
            </footer>
          </div>
        </section>
      </div>
    </div>
  );
}