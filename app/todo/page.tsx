"use client";

import { useStudentStore } from "@/lib/store";
import { useEffect, useState } from "react";
import { Plus, CheckCircle, Circle, Trash2, Flag, CheckSquare, Sparkles, Filter, ListChecks, ArrowUpCircle } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import { useLanguage } from "@/lib/LanguageContext";

export default function TodoPage() {
    const [mounted, setMounted] = useState(false);
    const { todos, addTodo, toggleTodo, deleteTodo, courses } = useStudentStore();
    const [newTodoText, setNewTodoText] = useState("");
    const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
    const [selectedCourseId, setSelectedCourseId] = useState<string>("");
    const [dueDate, setDueDate] = useState<string>("");
    const [filterCourse, setFilterCourse] = useState<string>("all");
    const { t } = useLanguage();

    useEffect(() => {
        useStudentStore.persist.rehydrate();
        const timer = setTimeout(() => setMounted(true), 0);
        return () => clearTimeout(timer);
    }, []);

    if (!mounted) return null;

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTodoText.trim()) return;

        addTodo({
            text: newTodoText,
            completed: false,
            priority,
            courseId: selectedCourseId || undefined,
            dueDate: dueDate || new Date().toISOString()
        });
        setNewTodoText("");
        setDueDate("");
    };

    const displayTodos = todos.filter(t => filterCourse === 'all' || t.courseId === filterCourse);
    const pendingTodos = displayTodos.filter(t => !t.completed).sort((a, b) => {
        const priorityWeight = { high: 3, medium: 2, low: 1 };
        return priorityWeight[b.priority] - priorityWeight[a.priority];
    });
    const completedTodos = displayTodos.filter(t => t.completed);

    const stats = {
        total: todos.length,
        pending: todos.filter(t => !t.completed).length,
        urgent: todos.filter(t => !t.completed && t.priority === 'high').length,
        completedToday: todos.filter(t => t.completed).length // Mocking today logic simply
    };

    return (
        <div className="bg-[#FBFCFE] min-h-screen pb-40 font-sans px-8 pt-6 no-scrollbar overflow-x-hidden">
            <PageHeader
                title={t("Focus Hub", "فوکس ہب")}
                subtitle={t("Master Your Daily Missions", "اپنے روزانہ کے مشن کو مکمل کریں")}
                icon={ListChecks}
                accentColor="bg-indigo-600"
            />

            {/* MISSION ANALYTICS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8 animate-in fade-in slide-in-from-bottom-4">
                <div className="bg-white p-4 md:p-5 rounded-[24px] shadow-sm border border-slate-50 flex items-center gap-4 group">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-[14px] bg-slate-50 flex items-center justify-center text-slate-400 group-hover:scale-110 transition-transform">
                        <ListChecks size={18} />
                    </div>
                    <div>
                        <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">{t("Total Stack", "کل اسٹیک")}</p>
                        <p className="text-lg md:text-xl font-black text-slate-900 leading-none">{stats.total}</p>
                    </div>
                </div>
                <div className="bg-white p-4 md:p-5 rounded-[24px] shadow-sm border border-slate-50 flex items-center gap-4 group">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-[14px] bg-indigo-50 flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform">
                        <ArrowUpCircle size={18} />
                    </div>
                    <div>
                        <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">{t("Active", "فعال")}</p>
                        <p className="text-lg md:text-xl font-black text-slate-900 leading-none">{stats.pending}</p>
                    </div>
                </div>
                <div className="bg-white p-4 md:p-5 rounded-[24px] shadow-sm border border-slate-50 flex items-center gap-4 group">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-[14px] bg-red-50 flex items-center justify-center text-red-500 group-hover:scale-110 group-hover:bg-red-500 group-hover:text-white transition-all">
                        <Flag size={18} fill="currentColor" />
                    </div>
                    <div>
                        <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">{t("Critical", "اہم")}</p>
                        <p className="text-lg md:text-xl font-black text-slate-900 leading-none">{stats.urgent}</p>
                    </div>
                </div>
                <div className="bg-white p-4 md:p-5 rounded-[24px] shadow-sm border border-slate-50 flex items-center gap-4 group">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-[14px] bg-emerald-50 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                        <CheckCircle size={18} />
                    </div>
                    <div>
                        <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">{t("Yield", "پیداوار")}</p>
                        <p className="text-lg md:text-xl font-black text-slate-900 leading-none">{stats.completedToday}</p>
                    </div>
                </div>
            </div>

            {/* QUICK ACTIONS & FILTER STRIP */}
            <div className="flex bg-slate-100/50 p-1.5 rounded-2xl md:rounded-[24px] border border-slate-200/50 overflow-x-auto no-scrollbar mb-6 md:mb-8 gap-1 md:gap-2 snap-x">
                <button
                    onClick={() => setFilterCourse('all')}
                    className={`shrink-0 snap-center py-2.5 md:py-3 px-5 md:px-6 rounded-xl md:rounded-[18px] text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap ${filterCourse === 'all' ? 'bg-white text-indigo-600 shadow-sm border border-indigo-100' : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'}`}
                >
                    {t("All Missions", "تمام مشن")}
                </button>
                {courses.map(c => (
                    <button
                        key={c.id}
                        onClick={() => setFilterCourse(c.id)}
                        className={`shrink-0 snap-center py-2.5 md:py-3 px-5 md:px-6 rounded-xl md:rounded-[18px] text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap flex items-center gap-2 ${filterCourse === c.id ? 'bg-white shadow-sm border' : 'text-slate-400 hover:text-slate-600 hover:bg-white/50 border border-transparent'}`}
                        style={{ borderColor: filterCourse === c.id ? c.color : 'transparent', color: filterCourse === c.id ? c.color : undefined }}
                    >
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: c.color }}></div>
                        {c.code}
                    </button>
                ))}
            </div>

            {/* ADD MISSION FORM */}
            <form onSubmit={handleAdd} className="bg-white p-4 md:p-6 rounded-[32px] md:rounded-[48px] border border-slate-50 shadow-2xl shadow-indigo-900/5 mb-8 md:mb-10 space-y-4 md:space-y-5 relative overflow-hidden group col-span-1">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>

                <div className="flex gap-4 relative z-10 w-full">
                    <div className="flex-1 bg-slate-50 rounded-[24px] md:rounded-[28px] p-1 shadow-inner flex flex-wrap md:flex-nowrap items-center pr-3 border border-transparent focus-within:border-indigo-500/20 focus-within:bg-white transition-all">
                        <input
                            title={t("New Mission", "نیا مشن")}
                            type="text"
                            name="todoText"
                            placeholder={t("Enter your next mission...", "اپنا اگلا مشن درج کریں...")}
                            className="flex-1 bg-transparent border-none py-3.5 md:py-4 px-4 md:px-6 text-sm font-black text-slate-800 focus:ring-0 outline-none placeholder:text-slate-300 min-w-[200px]"
                            value={newTodoText}
                            onChange={(e) => setNewTodoText(e.target.value)}
                        />
                        <button
                            title={t("Add", "شامل کریں")}
                            type="submit"
                            className="w-full md:w-10 h-10 mt-2 md:mt-0 bg-slate-900 text-white rounded-xl md:rounded-[18px] flex items-center justify-center shadow-xl hover:bg-indigo-600 active:scale-95 transition-all text-[10px] uppercase font-black tracking-widest md:text-sm gap-2"
                        >
                            <span className="md:hidden">Commit</span> <ArrowUpCircle size={18} strokeWidth={2.5} className="md:w-5 md:h-5" />
                        </button>
                    </div>
                </div>

                <div className="flex flex-col xl:flex-row items-stretch xl:items-center gap-4 md:gap-6 relative z-10 px-1">
                    <div className="flex-1 grid grid-cols-3 gap-2 order-2 xl:order-1">
                        <div className="space-y-1 md:space-y-2 col-span-3 lg:col-span-1">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{t("Priority Level", "ترجیحی سطح")}:</span>
                            <div className="flex gap-1 md:gap-2">
                                {(['low', 'medium', 'high'] as const).map(p => (
                                    <button
                                        key={p}
                                        type="button"
                                        onClick={() => setPriority(p)}
                                        className={`flex-1 md:px-4 py-2.5 md:py-2 rounded-xl text-[8px] md:text-[9px] font-black uppercase tracking-widest transition-all ${priority === p
                                            ? p === 'high' ? 'bg-red-500 text-white shadow-lg shadow-red-200' : p === 'medium' ? 'bg-amber-500 text-white shadow-lg shadow-amber-200' : 'bg-emerald-500 text-white shadow-lg shadow-emerald-200'
                                            : 'bg-slate-50 text-slate-400 border border-slate-100 hover:bg-slate-100'
                                            }`}
                                    >
                                        {t(p, p)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-1 md:space-y-2 col-span-3 lg:col-span-1 w-full">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{t("Link to Course", "کورس کے ساتھ لنک کریں")}:</span>
                            <div className="relative">
                                <select
                                    name="todoCourse"
                                    className="w-full bg-slate-50 text-[9px] md:text-[10px] font-black py-3 px-3 md:px-5 rounded-xl border border-slate-100 outline-none focus:ring-4 focus:ring-indigo-500/10 text-slate-600 appearance-none uppercase tracking-widest cursor-pointer"
                                    value={selectedCourseId}
                                    onChange={(e) => setSelectedCourseId(e.target.value)}
                                    title="Select Course"
                                >
                                    <option value="">{t("General Mission", "عمومی مشن")}</option>
                                    {courses.map(c => (
                                        <option key={c.id} value={c.id}>{c.code}</option>
                                    ))}
                                </select>
                                <Filter size={12} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                            </div>
                        </div>

                        <div className="space-y-1 md:space-y-2 col-span-3 lg:col-span-1 w-full">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{t("Deadline", "آخری تاریخ")}:</span>
                            <div className="relative">
                                <input
                                    type="date"
                                    name="todoDueDate"
                                    className="w-full bg-slate-50 text-[9px] md:text-[10px] font-black py-3 px-3 md:px-5 rounded-xl border border-slate-100 outline-none focus:ring-4 focus:ring-indigo-500/10 text-slate-600 uppercase tracking-widest cursor-pointer"
                                    value={dueDate.split('T')[0] || ""}
                                    onChange={(e) => setDueDate(e.target.value ? new Date(e.target.value).toISOString() : "")}
                                    title="Select Due Date"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </form>

            {/* MISSION LISTS */}
            <div className="space-y-10">
                <section>
                    <div className="flex justify-between items-center mb-6 px-2">
                        <div className="flex items-center gap-3">
                            <h2 className="font-black text-slate-900 text-lg tracking-tight uppercase">{t("Pending Missions", "زیر التواء مشن")}</h2>
                            <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-[10px] font-black shadow-sm">{pendingTodos.length}</span>
                        </div>
                        <Sparkles size={16} className="text-amber-500 animate-pulse" />
                    </div>

                    <div className="grid gap-4">
                        {pendingTodos.map(todo => (
                            <div key={todo.id} className="bg-white p-5 rounded-[40px] border border-slate-50 shadow-xl shadow-slate-900/5 group hover:shadow-2xl active:scale-[0.99] transition-all relative overflow-hidden">
                                <div className="flex items-start gap-6 relative z-10">
                                    <button
                                        onClick={() => toggleTodo(todo.id)}
                                        className="shrink-0 group/check"
                                        title="Complete Mission"
                                    >
                                        <div className="w-9 h-9 rounded-[14px] border-4 border-slate-50 bg-white flex items-center justify-center group-hover/check:border-blue-500/20 group-hover/check:bg-blue-50 transition-all">
                                            <Circle className="text-slate-200 group-hover/check:text-blue-500 transition-colors" size={24} />
                                        </div>
                                    </button>
                                    <div className="flex-1 min-w-0 py-1">
                                        <p className="text-slate-800 font-bold text-xs md:text-sm leading-tight group-hover:text-blue-600 transition-colors truncate mb-3">{todo.text}</p>
                                        <div className="flex flex-wrap items-center gap-2 md:gap-4 mt-auto">
                                            {todo.courseId && (
                                                <div className="bg-slate-900 text-white px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400" style={{ backgroundColor: courses.find(c => c.id === todo.courseId)?.color }}></div>
                                                    <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest">{courses.find(c => c.id === todo.courseId)?.code}</span>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-2">
                                                <Flag size={12} className={todo.priority === 'high' ? 'text-red-500' : todo.priority === 'medium' ? 'text-amber-500' : 'text-emerald-500'} fill="currentColor" />
                                                <span className={`text-[9px] font-black uppercase tracking-widest ${todo.priority === 'high' ? 'text-red-500' : todo.priority === 'medium' ? 'text-amber-500' : 'text-emerald-500'}`}>
                                                    {todo.priority} {t("Priority", "ترجیح")}
                                                </span>
                                            </div>
                                            {todo.dueDate && (
                                                <div className="flex items-center gap-1.5 bg-slate-50/80 px-2 py-1.5 rounded-lg border border-slate-100">
                                                    <span className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase tracking-widest">
                                                        {new Date(todo.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => deleteTodo(todo.id)}
                                        className="w-8 h-8 md:w-10 md:h-10 shrink-0 rounded-[14px] md:rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 hover:bg-red-50 hover:text-red-500 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all self-center shadow-sm"
                                        title="Delete Mission"
                                    >
                                        <Trash2 size={14} className="md:w-4 md:h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {pendingTodos.length === 0 && (
                            <div className="text-center py-20 bg-slate-50/50 rounded-[56px] border-4 border-dashed border-slate-100 flex flex-col items-center">
                                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl mb-6 scale-animation">
                                    <CheckCircle className="text-emerald-500" size={36} strokeWidth={2.5} />
                                </div>
                                <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest mb-2">{t("Mission Accomplished", "مشن مکمل ہوا")}</h3>
                                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">{t("All daily tasks have been liquidated", "تمام روزانہ کے کام ختم کر دیے گئے ہیں")}</p>
                            </div>
                        )}
                    </div>
                </section>

                {completedTodos.length > 0 && (
                    <section>
                        <div className="flex items-center gap-4 mb-6 px-2">
                            <h2 className="font-black text-slate-400 text-xs tracking-tight uppercase">{t("Archived Missions", "محفوظ شدہ مشن")}</h2>
                            <div className="flex-1 h-px bg-slate-100"></div>
                        </div>
                        <div className="grid gap-4 opacity-50">
                            {completedTodos.map(todo => (
                                <div key={todo.id} className="bg-slate-50 p-4 rounded-[24px] border border-transparent flex items-center gap-4 group hover:translate-x-1 transition-transform">
                                    <button onClick={() => toggleTodo(todo.id)} className="shrink-0" title="Revive Mission">
                                        <CheckCircle className="text-emerald-500" size={20} strokeWidth={3} />
                                    </button>
                                    <p className="text-slate-500 line-through text-sm font-bold flex-1 truncate">{todo.text}</p>
                                    <button onClick={() => deleteTodo(todo.id)} className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-slate-300 hover:text-red-500 shadow-sm" title="Delete Permanent">
                                        <Trash2 size={13} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}
