"use client";

import { useStudentStore } from "@/lib/store";
import { useEffect, useState } from "react";
import {
    User, Mail, Phone, MapPin,
    Settings, Award, BookOpen,
    Calendar, CheckCircle2, ChevronRight,
    LogOut, Camera, Star, Shield,
    Github, Twitter, Linkedin, Globe,
    Edit3, Save, X, Trophy, Zap, Sparkles, Binary
} from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";

export default function ProfilePage() {
    const [mounted, setMounted] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const { t, language, setLanguage } = useLanguage();

    const {
        name, university, major, semester,
        courses, exams, studySessions, streaks, totalPoints, achievements,
        setStudentDetails
    } = useStudentStore();

    const [editData, setEditData] = useState({
        name, university, major, semester
    });

    useEffect(() => {
        useStudentStore.persist.rehydrate();
        const timer = setTimeout(() => setMounted(true), 0);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        setEditData({ name, university, major, semester });
    }, [name, university, major, semester]);

    if (!mounted) return null;

    const totalStudyTime = studySessions.reduce((acc, s) => acc + s.duration, 0);
    const completedExams = exams.filter(e => e.isCompleted).length;

    const handleSave = () => {
        setStudentDetails(editData);
        setIsEditing(false);
    };

    return (
        <div className="bg-[#FBFCFE] min-h-screen pb-40 font-sans px-8 pt-10 no-scrollbar selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden">
            {/* HEADER SECTION */}
            <header className="mb-8 flex justify-between items-center">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">{t("Identity", "شناخت")}</h1>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">{t("Student Command Center", "طالب علم کمانڈ سینٹر")}</p>
                </div>
                <div className="flex gap-3">
                    <button
                        title={t("Switch Language", "زبان تبدیل کریں")}
                        onClick={() => setLanguage(language === 'en' ? 'ur' : 'en')}
                        className="w-12 h-12 glass flex items-center justify-center rounded-2xl text-[11px] font-black uppercase tracking-widest active:scale-90 transition-transform shadow-lg shadow-indigo-100"
                    >
                        {language === 'en' ? 'Ur' : 'En'}
                    </button>
                    <button
                        title={isEditing ? t("Cancel", "منسوخ کریں") : t("Edit Profile", "پروفائل ایڈٹ کریں")}
                        onClick={() => setIsEditing(!isEditing)}
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isEditing ? 'bg-red-50 text-red-500 shadow-xl shadow-red-100' : 'bg-blue-600 text-white shadow-xl shadow-blue-200'}`}
                    >
                        {isEditing ? <X size={20} strokeWidth={3} /> : <Edit3 size={20} strokeWidth={2.5} />}
                    </button>
                </div>
            </header>

            {/* AVATAR & BASIC INFO */}
            <section className="mb-8 relative">
                <div className="bg-white rounded-[56px] p-8 border border-slate-50 shadow-2xl shadow-slate-900/5 flex flex-col items-center text-center overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/5 rounded-full blur-[64px] -mr-24 -mt-24 animate-float"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-600/5 rounded-full blur-[48px] -ml-16 -mb-16 animate-float [animation-delay:2s]"></div>

                    <div className="relative mb-8 group">
                        <div className="w-36 h-36 rounded-[48px] bg-linear-to-tr from-blue-600 to-indigo-600 p-1.5 shadow-2xl shadow-blue-500/20 group-hover:rotate-3 transition-transform duration-500">
                            <div className="w-full h-full rounded-[42px] bg-white flex items-center justify-center text-6xl font-black text-blue-600 shadow-inner">
                                {name.charAt(0)}
                            </div>
                        </div>
                        <button
                            title={t("Change Photo", "تصویر تبدیل کریں")}
                            className="absolute -bottom-2 -right-2 w-12 h-12 bg-slate-900 text-white rounded-[20px] shadow-2xl border-4 border-white active:scale-90 transition-all flex items-center justify-center group-hover:scale-110">
                            <Camera size={20} />
                        </button>
                    </div>

                    {isEditing ? (
                        <div className="w-full max-w-sm space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t("Full Name", "پورا نام")}</label>
                                <input
                                    name="fullName"
                                    title={t("Name", "نام")}
                                    value={editData.name}
                                    onChange={e => setEditData({ ...editData, name: e.target.value })}
                                    className="w-full text-center text-xl font-black text-slate-800 bg-slate-50 rounded-2xl py-4 px-6 outline-none border border-transparent focus:border-blue-500/20 transition-all"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t("Institution", "ادارہ")}</label>
                                <input
                                    name="institution"
                                    title={t("University", "یونیورسٹی")}
                                    value={editData.university}
                                    onChange={e => setEditData({ ...editData, university: e.target.value })}
                                    className="w-full text-center text-xs font-bold text-slate-500 bg-slate-50 rounded-2xl py-4 px-6 outline-none uppercase tracking-widest"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t("Major", "میجر")}</label>
                                    <input
                                        name="major"
                                        title={t("Major", "میجر")}
                                        value={editData.major}
                                        onChange={e => setEditData({ ...editData, major: e.target.value })}
                                        className="w-full text-center text-[11px] font-black text-slate-500 bg-slate-50 rounded-2xl py-4 px-6 outline-none uppercase tracking-widest"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t("Sem", "سمسٹر")}</label>
                                    <input
                                        name="semester"
                                        title={t("Semester", "سمسٹر")}
                                        type="number"
                                        value={editData.semester}
                                        onChange={e => setEditData({ ...editData, semester: parseInt(e.target.value) || 1 })}
                                        className="w-full text-center text-[11px] font-black text-slate-500 bg-slate-50 rounded-2xl py-4 px-6 outline-none uppercase tracking-widest"
                                    />
                                </div>
                            </div>
                            <button
                                onClick={handleSave}
                                className="w-full bg-slate-900 text-white py-5 rounded-[28px] font-black text-xs uppercase tracking-[0.3em] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3 mt-6"
                            >
                                <Save size={18} /> {t("Sync Identity", "شناخت سنک کریں")}
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center gap-2 mb-2">
                                <Shield size={14} className="text-blue-500" />
                                <span className="text-[9px] font-black text-blue-500 uppercase tracking-[0.5em]">{t("Verified Student", "تصدیق شدہ طالب علم")}</span>
                            </div>
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-1">{name}</h2>
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mb-6">{university}</p>

                            <div className="flex gap-3">
                                <div className="bg-blue-50/50 backdrop-blur-sm text-blue-600 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100/50 shadow-sm">{major}</div>
                                <div className="bg-slate-900 text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-900/20">Sem {semester}</div>
                            </div>
                        </>
                    )}
                </div>
            </section>

            {/* PERFORMANCE METRICS grid */}
            <section className="grid grid-cols-3 gap-5 mb-8">
                <div className="bg-white p-6 rounded-[44px] border border-slate-50 shadow-xl shadow-slate-900/5 flex flex-col items-center text-center group active:scale-95 transition-all relative overflow-hidden">
                    <div className="absolute inset-0 bg-yellow-400/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl mb-4 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                        <Zap size={24} fill="currentColor" strokeWidth={0} />
                    </div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{t("STREAK", "سلہ")}</p>
                    <p className="text-2xl font-black text-slate-900 leading-none tracking-tighter">{streaks || 0}</p>
                </div>
                <div className="bg-white p-6 rounded-[44px] border border-slate-50 shadow-xl shadow-slate-900/5 flex flex-col items-center text-center group active:scale-95 transition-all relative overflow-hidden">
                    <div className="absolute inset-0 bg-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl mb-4 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                        <Trophy size={24} strokeWidth={2.5} />
                    </div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{t("POINTS", "پوائنٹس")}</p>
                    <p className="text-2xl font-black text-slate-900 leading-none tracking-tighter">{totalPoints || 0}</p>
                </div>
                <div className="bg-white p-6 rounded-[44px] border border-slate-50 shadow-xl shadow-slate-900/5 flex flex-col items-center text-center group active:scale-95 transition-all relative overflow-hidden">
                    <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl mb-4 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                        <Award size={24} strokeWidth={2.5} />
                    </div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{t("LEVEL", "لیول")}</p>
                    <p className="text-2xl font-black text-slate-900 leading-none tracking-tighter">12</p>
                </div>
            </section>

            {/* UNLOCKED ACHIEVEMENTS */}
            <section className="mb-8">
                <div className="flex justify-between items-center mb-8 px-2">
                    <h3 className="text-[12px] font-black text-slate-900 uppercase tracking-[0.2em]">{t("Hall of Fame", "ہال آف فیم")}</h3>
                    <Sparkles size={16} className="text-amber-500 animate-pulse" />
                </div>

                <div className="flex gap-5 overflow-x-auto pb-6 no-scrollbar -mx-8 px-8">
                    {achievements && achievements.length > 0 ? achievements.map(ach => (
                        <div key={ach.id} className="min-w-[160px] bg-white p-7 rounded-[48px] border border-slate-50 shadow-xl shadow-slate-900/5 flex flex-col items-center text-center group active:scale-95 transition-all">
                            <div className="w-16 h-16 bg-blue-600 rounded-[28px] flex items-center justify-center mb-4 shadow-xl shadow-blue-500/20 group-hover:-translate-y-1 transition-transform">
                                <Trophy size={32} className="text-white" strokeWidth={2.5} />
                            </div>
                            <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-tighter leading-tight mb-2">{ach.title}</h4>
                            <div className="px-3 py-1 bg-slate-50 rounded-full text-[8px] font-black text-slate-400 uppercase tracking-widest">
                                {ach.unlockedAt ? new Date(ach.unlockedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : "--"}
                            </div>
                        </div>
                    )) : (
                        <div className="w-full py-16 bg-slate-50 rounded-[56px] border-4 border-dashed border-slate-100 flex flex-col items-center justify-center">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg mb-4">
                                <Trophy size={32} className="text-slate-100" />
                            </div>
                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{t("Your trophy cabinet is empty", "آپ کی ٹرافی کیبنٹ خالی ہے")}</p>
                            <p className="text-[9px] text-slate-300 font-bold mt-2 uppercase tracking-tighter">{t("Start learning to unlock badges", "بیجز کو غیر مقفل کرنے کے لیے سیکھنا شروع کریں")}</p>
                        </div>
                    )}
                </div>
            </section>

            {/* PERSISTENCE ANALYTICS */}
            <section className="mb-8">
                <div className="bg-slate-900 rounded-[64px] p-10 text-white relative overflow-hidden shadow-[0_40px_80px_-20px_rgba(15,23,42,0.4)]">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/20 rounded-full blur-[100px] -mr-32 -mt-32"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-[80px] -ml-20 -mb-20"></div>

                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-12">
                            <div>
                                <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.4em] mb-2">{t("Analytics", "اعداد و شمار")}</p>
                                <h3 className="text-2xl font-black tracking-tight">{t("Academic Progress", "تعلیمی کارکردگی")}</h3>
                            </div>
                            <div className="w-14 h-14 bg-white/10 backdrop-blur-xl rounded-[24px] flex items-center justify-center border border-white/10">
                                <Binary size={28} className="text-blue-400" />
                            </div>
                        </div>

                        <div className="space-y-10">
                            <div className="space-y-3">
                                <div className="flex justify-between items-end">
                                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{t("Study Commitment", "مطالعہ کا عزم")}</span>
                                    <span className="text-xl font-black text-blue-400">{(totalStudyTime / 60).toFixed(1)}h</span>
                                </div>
                                <div className="h-3 bg-white/5 rounded-full overflow-hidden border border-white/5 p-0.5">
                                    <div className="h-full bg-linear-to-r from-blue-600 to-indigo-500 rounded-full shadow-[0_0_15px_#2563eb]" style={{ width: '75%' }}></div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between items-end">
                                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{t("Curriculum Conquered", "نصاب فتح کر لیا")}</span>
                                    <span className="text-xl font-black text-emerald-400">{completedExams} / {exams.length}</span>
                                </div>
                                <div className="h-3 bg-white/5 rounded-full overflow-hidden border border-white/5 p-0.5">
                                    <div className="h-full bg-linear-to-r from-emerald-500 to-teal-400 rounded-full shadow-[0_0_15px_#10b981]" style={{ width: `${(completedExams / (exams.length || 1)) * 100}%` }}></div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-16 grid grid-cols-2 gap-4">
                            <div className="p-6 rounded-[32px] bg-white/5 border border-white/10 backdrop-blur-md">
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Weekly Best</p>
                                <p className="text-lg font-black text-white">4.2h Focus</p>
                            </div>
                            <div className="p-6 rounded-[32px] bg-white/5 border border-white/10 backdrop-blur-md">
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Focus Score</p>
                                <p className="text-lg font-black text-white">Platinum</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* DANGER ZONE / LOGOUT */}
            <section>
                <button
                    title={t("Logout", "لاگ آؤٹ")}
                    className="w-full bg-white p-6 rounded-[48px] border border-red-50 shadow-xl shadow-red-900/5 group active:scale-95 transition-all text-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-14 h-14 bg-red-50 text-red-600 rounded-[22px] flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-all shadow-sm">
                            <LogOut size={24} strokeWidth={2.5} />
                        </div>
                        <div>
                            <p className="text-xs font-black text-slate-900 uppercase tracking-[0.3em] mb-1">{t("Logout Securely", "محفوظ طریقے سے لاگ آؤٹ کریں")}</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{t("End your active session and clear temporary data", "اپنا فعال سیشن ختم کریں اور عارضی ڈیٹا صاف کریں")}</p>
                        </div>
                    </div>
                </button>
            </section>
        </div>
    );
}
