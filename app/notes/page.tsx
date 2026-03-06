"use client";

import { useStudentStore } from "@/lib/store";
import { useEffect, useState } from "react";
import { BookOpen, Search, Plus, Filter, FileText, ChevronRight, Hash, Calendar, MoreVertical, Trash2, Edit3 } from "lucide-react";
import Link from "next/link";

import PageHeader from "@/components/ui/PageHeader";

export default function NotesPage() {
    const [mounted, setMounted] = useState(false);
    const { courses, deleteNote } = useStudentStore();
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        useStudentStore.persist.rehydrate();
        const timer = setTimeout(() => setMounted(true), 0);
        return () => clearTimeout(timer);
    }, []);

    if (!mounted) return null;

    const allNotes = courses.flatMap(course =>
        course.notes.map(note => ({
            ...note,
            courseName: course.name,
            courseCode: course.code,
            courseId: course.id,
            color: course.color
        }))
    ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const filteredNotes = allNotes.filter(note =>
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.courseName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="bg-slate-50 min-h-screen pb-32 font-sans px-6 pt-8 no-scrollbar overflow-x-hidden">
            <PageHeader
                title="Knowledge Hub"
                subtitle="All your study notes in one place"
                icon={BookOpen}
                accentColor="bg-blue-600"
            />

            {/* SEARCH BAR */}
            <div className="relative mb-6">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <Search size={16} />
                </div>
                <input
                    type="text"
                    title="Search Notes"
                    placeholder="Search by topic, course, or content..."
                    className="w-full bg-white border border-slate-100 rounded-[20px] py-3.5 pl-11 pr-4 text-xs font-medium shadow-sm focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all outline-none"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 bg-slate-50 rounded-xl text-slate-400" title="Filter">
                    <Filter size={16} />
                </button>
            </div>

            {/* QUICK STATS */}
            <div className="flex gap-4 mb-8 overflow-x-auto pb-2 no-scrollbar">
                <div className="bg-blue-600 px-5 py-3.5 rounded-[24px] text-white shrink-0 min-w-[130px] shadow-lg shadow-blue-100">
                    <p className="text-[9px] font-black uppercase tracking-widest opacity-60">Total Notes</p>
                    <p className="text-xl font-black">{allNotes.length}</p>
                </div>
                {courses.slice(0, 3).map(c => (
                    <div key={c.id} className="bg-white px-5 py-3.5 rounded-[24px] border border-slate-100 shrink-0 min-w-[130px] shadow-sm">
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 truncate w-24" title={c.name}>{c.code}</p>
                        <p className="text-xl font-black text-slate-800">{c.notes.length}</p>
                    </div>
                ))}
            </div>

            {/* NOTES LIST */}
            <div className="space-y-3">
                {filteredNotes.length > 0 ? (
                    filteredNotes.map((note) => (
                        <div key={note.id} className="bg-white p-5 rounded-[32px] border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                            <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ backgroundColor: note.color }}></div>

                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-2">
                                    <span className="bg-slate-50 px-2.5 py-1 rounded text-[9px] font-black text-slate-400 uppercase tracking-widest border border-slate-100">{note.courseCode}</span>
                                    <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">Week {note.week}</span>
                                </div>
                                <button className="p-2 text-slate-200 hover:text-slate-400 transition-colors">
                                    <MoreVertical size={18} />
                                </button>
                            </div>

                            <h3 className="text-lg font-black text-slate-800 leading-tight mb-2">{note.title}</h3>
                            <p className="text-slate-500 text-xs font-medium line-clamp-2 mb-6 leading-relaxed">
                                {note.content}
                            </p>

                            <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold">
                                        <Calendar size={12} /> {new Date(note.createdAt).toLocaleDateString()}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold">
                                        <Hash size={12} /> {note.topic}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => deleteNote(note.courseId, note.id)}
                                        className="p-2 text-red-100 hover:text-red-500 transition-colors"
                                        title="Delete Note"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                    <Link
                                        href={`/courses/${note.courseId}`}
                                        className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                        title="View/Edit"
                                    >
                                        <Edit3 size={16} />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-20 bg-white/50 rounded-[40px] border-2 border-dashed border-slate-200">
                        <FileText className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">No notes found</p>
                    </div>
                )}
            </div>

            <Link
                href="/courses"
                className="fixed bottom-24 right-6 w-16 h-16 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-2xl active:scale-90 transition-transform z-50 border-4 border-white"
            >
                <Plus size={32} />
            </Link>
        </div>
    );
}
