"use client";

import { useStudentStore } from "@/lib/store";
import { useEffect, useState, use } from "react";
import Link from "next/link";
import {
    ArrowLeft,
    Calendar,
    FileText,
    CheckCircle,
    Clock,
    Plus,
    ChevronRight,
    BookOpen,
    PlusCircle,
    MoreVertical,
    Edit2
} from "lucide-react";
import { Course, Note } from "@/lib/types";

export default function CourseDetailClient({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const [mounted, setMounted] = useState(false);
    const [activeTab, setActiveTab] = useState<'notes' | 'attendance' | 'info'>('notes');
    const { courses, addAttendance, addNote } = useStudentStore();
    const [newNote, setNewNote] = useState({ title: "", topic: "", content: "", week: 1 });

    useEffect(() => {
        useStudentStore.persist.rehydrate();
        setMounted(true);
    }, []);

    const handleAddNote = () => {
        if (!newNote.title || !newNote.content) return;
        addNote(resolvedParams.id, {
            id: Date.now().toString() + Math.random().toString(36).slice(2, 6),
            title: newNote.title,
            topic: newNote.topic || "General",
            content: newNote.content,
            week: newNote.week,
            subject: course?.name || "General",
            createdAt: new Date().toISOString()
        });
        setNewNote({ title: "", topic: "", content: "", week: newNote.week });
    };

    const course = courses.find(c => c.id === resolvedParams.id);

    if (!mounted) return null;
    if (!course) return (
        <div className="p-10 text-center">
            <p>Course not found</p>
            <Link href="/courses" className="text-blue-500 underline mt-4 block">Back to Courses</Link>
        </div>
    );

    // Group notes by week
    const notesByWeek = course.notes.reduce((acc, note) => {
        const week = note.week || 0;
        if (!acc[week]) acc[week] = [];
        acc[week].push(note);
        return acc;
    }, {} as Record<number, Note[]>);

    const sortedWeeks = Object.keys(notesByWeek).map(Number).sort((a, b) => a - b);

    return (
        <div className="bg-slate-50 min-h-screen pb-32 font-sans">
            {/* HEADER BAR */}
            <div
                className="h-64 relative flex flex-col justify-end p-6 overflow-hidden"
                style={{ backgroundColor: course.color || '#3b82f6' }}
            >
                <Link href="/courses" className="absolute top-8 left-6 bg-white/20 backdrop-blur-md p-2 rounded-xl text-white border border-white/20 active:scale-90 transition-transform z-20">
                    <ArrowLeft size={20} />
                </Link>
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                <div className="absolute bottom-0 right-0 w-48 h-48 bg-black/10 rounded-full blur-2xl -mr-10 -mb-10"></div>

                <div className="relative z-10 text-white">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-black/20 px-3 py-1 rounded-full border border-white/10">{course.code}</span>
                    <h1 className="text-3xl font-black mt-3 leading-tight tracking-tight">{course.name}</h1>
                    <p className="text-white/70 text-sm mt-1 font-medium">{course.credits} Academic Credits</p>
                </div>
            </div>

            {/* TABS */}
            <div className="flex bg-white border-b border-slate-100 sticky top-0 z-30 px-4">
                {[
                    { id: 'notes', label: 'Course Notes', icon: FileText },
                    { id: 'attendance', label: 'Attendance', icon: CheckCircle },
                    { id: 'info', label: 'Information', icon: Clock }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex-1 flex items-center justify-center gap-2 py-4 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'
                            }`}
                    >
                        <tab.icon size={14} />
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="p-6">
                {activeTab === 'notes' && (
                    <div className="space-y-8">
                        {/* NOTES CREATION FORM */}
                        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm mb-10 overflow-hidden relative">
                            <div className="absolute top-0 left-0 right-0 h-1.5 bg-blue-600"></div>
                            <h3 className="text-xl font-black text-slate-800 tracking-tight mb-6">Create Study Note</h3>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <input
                                        type="text"
                                        name="noteTitle"
                                        placeholder="Topic Title"
                                        className="bg-slate-50 border-none rounded-2xl py-3 px-5 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                                        value={newNote.title}
                                        onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                                    />
                                    <input
                                        type="text"
                                        name="noteTopic"
                                        placeholder="Subject Topic"
                                        className="bg-slate-50 border-none rounded-2xl py-3 px-5 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                                        value={newNote.topic}
                                        onChange={(e) => setNewNote({ ...newNote, topic: e.target.value })}
                                    />
                                </div>
                                <input
                                    type="number"
                                    name="noteWeek"
                                    placeholder="Week #"
                                    className="w-full bg-slate-50 border-none rounded-2xl py-3 px-5 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                                    value={newNote.week}
                                    onChange={(e) => setNewNote({ ...newNote, week: parseInt(e.target.value) || 1 })}
                                />

                                {/* RICH TEXT TOOLBAR SIMULATION */}
                                <div className="border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
                                    <div className="flex items-center gap-1 bg-slate-50/50 p-2 border-b border-slate-50">
                                        {['B', 'I', 'U', '•', '1.', '🔗'].map(tool => (
                                            <button
                                                key={tool}
                                                className="h-8 w-8 rounded-lg flex items-center justify-center font-bold text-slate-400 hover:bg-white hover:text-blue-600 hover:shadow-sm transition-all text-xs"
                                                title={tool}
                                                type="button"
                                            >
                                                {tool}
                                            </button>
                                        ))}
                                    </div>
                                    <textarea
                                        name="noteContent"
                                        placeholder="Unleash your knowledge here..."
                                        className="w-full bg-white border-none rounded-b-3xl py-5 px-6 text-sm font-medium text-slate-600 focus:ring-0 transition-all min-h-[200px]"
                                        value={newNote.content}
                                        onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                                    ></textarea>
                                </div>
                                <button
                                    onClick={handleAddNote}
                                    className="w-full bg-blue-600 text-white py-5 rounded-[24px] font-black text-[10px] uppercase tracking-[0.3em] active:scale-[0.98] transition-all shadow-xl shadow-blue-100"
                                >
                                    Save Note
                                </button>
                            </div>
                        </div>

                        <div className="flex justify-between items-center">
                            <h2 className="font-bold text-slate-800 text-lg">Curriculum &amp; Notes</h2>
                        </div>

                        {sortedWeeks.length > 0 ? (
                            sortedWeeks.map(week => (
                                <div key={week} className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <span className="bg-slate-200 h-px flex-1"></span>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 py-1 rounded-full border border-slate-200">Week {week}</span>
                                        <span className="bg-slate-200 h-px flex-1"></span>
                                    </div>

                                    <div className="grid gap-3">
                                        {notesByWeek[week].map(note => (
                                            <div key={note.id} className="bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="text-[9px] font-black text-blue-500 uppercase tracking-tighter bg-blue-50 px-2 py-0.5 rounded-md">{note.topic}</span>
                                                    <span className="text-[10px] text-slate-300 font-bold">{new Date(note.createdAt).toLocaleDateString()}</span>
                                                </div>
                                                <h3 className="text-slate-800 font-bold text-base mb-1">{note.title}</h3>
                                                <p className="text-slate-500 text-xs line-clamp-2 font-medium leading-relaxed">{note.content || "No content added yet. Click to view or edit this note."}</p>

                                                <div className="mt-4 pt-4 border-t border-slate-50 flex justify-end">
                                                    <button className="text-blue-600 font-black text-[10px] uppercase tracking-widest flex items-center gap-1">
                                                        View Details <ChevronRight size={12} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10 bg-white/50 rounded-[32px] border-2 border-dashed border-slate-200">
                                <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                                <p className="text-slate-400 text-sm font-medium">No notes recorded for this course.</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'attendance' && (
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Current Attendance</p>
                                <h2 className="text-4xl font-black text-slate-800">
                                    {course.attendance.length > 0
                                        ? Math.round((course.attendance.filter(r => r.status === 'present').length / course.attendance.length) * 100)
                                        : "100"}%
                                </h2>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => addAttendance(course.id, 'present')}
                                    className="bg-green-100 text-green-600 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-green-600 hover:text-white transition-all shadow-sm active:scale-95"
                                >
                                    Present
                                </button>
                                <button
                                    onClick={() => addAttendance(course.id, 'absent')}
                                    className="bg-red-100 text-red-600 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-sm active:scale-95"
                                >
                                    Absent
                                </button>
                            </div>
                        </div>

                        <h3 className="font-bold text-slate-800 text-sm px-1">History</h3>
                        <div className="bg-white rounded-[32px] overflow-hidden border border-slate-100 divide-y divide-slate-50 shadow-sm">
                            {course.attendance.slice().reverse().map((record, idx) => (
                                <div key={idx} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-xl ${record.status === 'present' ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'
                                            }`}>
                                            {record.status === 'present' ? <CheckCircle size={18} /> : <Clock size={18} />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-800">{new Date(record.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Recorded at {new Date(record.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                        </div>
                                    </div>
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${record.status === 'present' ? 'text-green-500' : 'text-red-400'
                                        }`}>
                                        {record.status}
                                    </span>
                                </div>
                            ))}
                            {course.attendance.length === 0 && (
                                <div className="p-10 text-center text-slate-400 text-xs font-medium uppercase tracking-widest">No history yet</div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'info' && (
                    <div className="space-y-6">
                        <div className="grid gap-4">
                            <div className="bg-white p-5 rounded-[24px] border border-slate-100">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Schedule</p>
                                <div className="space-y-3 mt-4">
                                    {course.schedule.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center text-sm">
                                            <span className="font-bold text-slate-700">{item.day}</span>
                                            <div className="flex items-center gap-3">
                                                <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-2 py-0.5 rounded uppercase">{item.startTime} - {item.endTime}</span>
                                                <span className="text-slate-400 font-medium">{item.room}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white p-5 rounded-[24px] border border-slate-100 flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Course Credits</p>
                                    <p className="text-lg font-bold text-slate-800">{course.credits} Credits</p>
                                </div>
                                <Edit2 size={18} className="text-slate-300 hover:text-blue-500 cursor-pointer" />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
