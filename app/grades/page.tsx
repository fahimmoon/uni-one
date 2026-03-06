"use client";

import { useStudentStore } from "@/lib/store";
import { useEffect, useState, useMemo } from "react";
import {
    Plus, Trash2, GraduationCap, TrendingUp, Calculator,
    ChevronDown, ChevronUp, BookOpen, Target, Award,
    CheckCircle2, AlertCircle, Edit3, Save, X, MoreHorizontal
} from "lucide-react";
import { MarksHead, CourseGradeSheet } from "@/lib/types";

import PageHeader from "@/components/ui/PageHeader";

export default function DetailedGradesPage() {
    const [mounted, setMounted] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'simulation' | 'details'>('overview');
    const [expandedCourse, setExpandedCourse] = useState<string | null>(null);
    const [newSimName, setNewSimName] = useState("");
    const [newSimCredits, setNewSimCredits] = useState(3);
    const [newSimGrade, setNewSimGrade] = useState("A");

    const {
        courses, gradeSheets, gpaSimulation,
        updateGradeSheet, updateGPASimulation,
        addWhatIfCourse, removeWhatIfCourse
    } = useStudentStore();

    useEffect(() => {
        useStudentStore.persist.rehydrate();
        setMounted(true);
    }, []);

    // GRADE TO POINTS MAP
    const gradeMap: Record<string, number> = {
        'A+': 4.0, 'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7,
        'C+': 2.3, 'C': 2.0, 'C-': 1.7, 'D+': 1.3, 'D': 1.0, 'F': 0.0
    };

    const calculateCGPA = (courseList: any[]) => {
        let totalPoints = 0;
        let totalCredits = 0;
        courseList.forEach(c => {
            if (c.grade) {
                totalPoints += c.grade * c.credits;
                totalCredits += c.credits;
            }
        });
        return totalCredits ? (totalPoints / totalCredits).toFixed(2) : "0.00";
    };

    const currentGPA = calculateCGPA(courses);

    const simulatedGPA = useMemo(() => {
        let totalPoints = 0;
        let totalCredits = 0;

        // Existing data
        courses.forEach(c => {
            if (c.grade) {
                totalPoints += c.grade * c.credits;
                totalCredits += c.credits;
            }
        });

        // Simulated data
        gpaSimulation.whatIfCourses.forEach(c => {
            totalPoints += (gradeMap[c.expectedGrade] || 0) * c.credits;
            totalCredits += c.credits;
        });

        return totalCredits ? (totalPoints / totalCredits).toFixed(2) : "0.00";
    }, [courses, gpaSimulation]);

    const getLetterGrade = (percentage: number) => {
        if (percentage >= 90) return 'A+';
        if (percentage >= 86) return 'A';
        if (percentage >= 82) return 'A-';
        if (percentage >= 78) return 'B+';
        if (percentage >= 74) return 'B';
        if (percentage >= 70) return 'B-';
        if (percentage >= 66) return 'C+';
        if (percentage >= 62) return 'C';
        if (percentage >= 58) return 'C-';
        if (percentage >= 54) return 'D+';
        if (percentage >= 50) return 'D';
        if (percentage >= 46) return 'D-';
        return 'F';
    };

    const handleUpdateMarks = (courseId: string, headId: string, value: string) => {
        const sheet = gradeSheets.find(s => s.courseId === courseId) || { courseId, marksHeads: [] };
        const newHeads = sheet.marksHeads.map(h =>
            h.id === headId ? { ...h, obtainedMarks: parseFloat(value) || 0 } : h
        );
        updateGradeSheet({ ...sheet, marksHeads: newHeads });
    };

    if (!mounted) return null;

    return (
        <div className="bg-slate-50 min-h-screen pb-40 font-sans px-4 md:px-8 pt-6 md:pt-8 no-scrollbar overflow-x-hidden">
            <PageHeader
                title="Academic Hub"
                subtitle="GPA Tracking & Strategy"
                icon={GraduationCap}
                accentColor="bg-blue-600"
                actions={
                    <div className="text-right">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Current CGPA</p>
                        <p className="text-2xl font-black text-blue-600 tracking-tighter">{currentGPA}</p>
                    </div>
                }
            />

            {/* TABS */}
            <div className="flex bg-white p-1 rounded-2xl md:rounded-[24px] shadow-sm border border-slate-100 mb-6 md:mb-8 overflow-x-auto no-scrollbar gap-1 md:gap-2 snap-x max-w-full">
                {(['overview', 'simulation', 'details'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 shrink-0 snap-center py-3 md:py-2.5 px-3 md:px-6 rounded-xl md:rounded-[20px] text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap ${activeTab === tab ? 'bg-slate-900 text-white shadow-xl pointer-events-none' : 'text-slate-400 hover:bg-slate-50'}`}
                    >
                        {tab === 'overview' && 'Performance'}
                        {tab === 'simulation' && 'What-If Calc'}
                        {tab === 'details' && 'Grading Sheets'}
                    </button>
                ))}
            </div>

            {/* PERFORMANCE OVERVIEW */}
            {activeTab === 'overview' && (
                <section className="space-y-4 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="grid grid-cols-2 gap-3 md:gap-4">
                        <div className="bg-white p-4 md:p-5 rounded-[24px] md:rounded-[34px] border border-slate-100 shadow-sm flex flex-col items-center text-center group hover:shadow-md transition-all">
                            <div className="p-2 md:p-2.5 bg-blue-50 text-blue-600 rounded-xl md:rounded-2xl mb-2 md:mb-3 group-hover:scale-110 transition-transform">
                                <TrendingUp size={20} className="md:w-[22px] md:h-[22px]" />
                            </div>
                            <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Target GPA</p>
                            <p className="text-lg md:text-xl font-black text-slate-800 tracking-tighter">{gpaSimulation.targetGPA.toFixed(1)}</p>
                        </div>
                        <div className="bg-white p-4 md:p-5 rounded-[24px] md:rounded-[34px] border border-slate-100 shadow-sm flex flex-col items-center text-center group hover:shadow-md transition-all">
                            <div className="p-2 md:p-2.5 bg-green-50 text-green-600 rounded-xl md:rounded-2xl mb-2 md:mb-3 group-hover:scale-110 transition-transform">
                                <Award size={20} className="md:w-[22px] md:h-[22px]" />
                            </div>
                            <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Best Subject</p>
                            <p className="text-lg md:text-xl font-black text-slate-800 tracking-tighter">CS-102</p>
                        </div>
                    </div>

                    <div className="bg-white p-5 md:p-6 rounded-[32px] md:rounded-[48px] border border-slate-100 shadow-sm">
                        <h3 className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 md:mb-6">Semester Comparison</h3>
                        <div className="space-y-5 md:space-y-6">
                            {[1, 2, 3].map(sem => (
                                <div key={sem} className="flex items-center justify-between">
                                    <span className="text-[10px] md:text-xs font-black text-slate-600 uppercase tracking-widest">Sem {sem}</span>
                                    <div className="flex-1 mx-4 md:mx-6 h-1.5 bg-slate-50 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-600 rounded-full" style={{ width: `${(Math.random() * 40) + 60}%` }}></div>
                                    </div>
                                    <span className="text-[10px] md:text-xs font-black text-slate-800">3.{(Math.random() * 9).toFixed(0)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* WHAT-IF SIMULATOR */}
            {activeTab === 'simulation' && (
                <section className="space-y-4 md:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-slate-900 p-6 md:p-7 rounded-[32px] md:rounded-[48px] text-white overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-32 h-32 md:w-40 md:h-40 bg-blue-600/30 rounded-full blur-[60px]"></div>
                        <div className="relative z-10 flex justify-between items-center">
                            <div>
                                <p className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest mb-0.5 md:mb-1">Estimated GPA</p>
                                <p className="text-3xl md:text-4xl font-black text-blue-500 tracking-tighter">{simulatedGPA}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 md:mb-2">Target</p>
                                <input
                                    type="number"
                                    step="0.1"
                                    name="targetGPA"
                                    title="Target GPA"
                                    value={gpaSimulation.targetGPA}
                                    onChange={(e) => updateGPASimulation({ targetGPA: parseFloat(e.target.value) })}
                                    className="bg-slate-800 text-white text-base md:text-lg font-black w-14 md:w-16 px-2 py-1.5 rounded-xl text-center outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-5 md:p-7 rounded-[24px] md:rounded-[40px] border border-slate-100 shadow-sm">
                        <h4 className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 md:mb-5">Add Hypothetical Grades</h4>
                        <div className="flex flex-wrap md:flex-nowrap gap-2 md:gap-3 mb-6">
                            <input
                                name="simCourseName"
                                placeholder="Course Name"
                                title="Course Name"
                                value={newSimName}
                                onChange={e => setNewSimName(e.target.value)}
                                className="bg-slate-50 w-full md:flex-1 px-4 py-3 md:py-3 rounded-xl text-[10px] md:text-[11px] font-bold outline-none border border-transparent focus:border-blue-100 transition-colors placeholder:text-slate-300"
                            />
                            <div className="flex gap-2 flex-1 md:flex-none">
                                <select
                                    name="simCredits"
                                    value={newSimCredits}
                                    title="Credits"
                                    onChange={e => setNewSimCredits(parseInt(e.target.value))}
                                    className="bg-slate-50 flex-1 md:w-auto px-2 md:px-4 py-3 rounded-xl text-[10px] md:text-[11px] font-bold outline-none cursor-pointer border border-transparent focus:border-blue-100 transition-colors"
                                >
                                    {[1, 2, 3, 4].map(cr => <option key={cr} value={cr}>{cr} Cr</option>)}
                                </select>
                                <select
                                    name="simGrade"
                                    value={newSimGrade}
                                    title="Expected Grade"
                                    onChange={e => setNewSimGrade(e.target.value)}
                                    className="bg-slate-50 flex-1 md:w-auto px-2 md:px-4 py-3 rounded-xl text-[10px] md:text-[11px] font-bold outline-none cursor-pointer border border-transparent focus:border-blue-100 transition-colors"
                                >
                                    {Object.keys(gradeMap).map(g => <option key={g} value={g}>{g}</option>)}
                                </select>
                            </div>
                            <button
                                onClick={() => {
                                    if (!newSimName) return;
                                    addWhatIfCourse({ name: newSimName, credits: newSimCredits, expectedGrade: newSimGrade });
                                    setNewSimName("");
                                }}
                                className="p-3 w-full md:w-auto bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-100 flex items-center justify-center hover:bg-blue-700 active:scale-95 transition-all"
                            >
                                <Plus size={20} />
                            </button>
                        </div>

                        <div className="space-y-2 md:space-y-3">
                            {gpaSimulation.whatIfCourses.map(course => (
                                <div key={course.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-[16px] md:rounded-2xl group border border-transparent hover:border-slate-200 transition-colors">
                                    <div>
                                        <p className="text-[10px] md:text-xs font-black text-slate-800 uppercase tracking-tight mb-0.5">{course.name}</p>
                                        <p className="text-[8px] md:text-[9px] font-bold text-slate-400 uppercase tracking-widest">{course.credits} Credits • Expected Grade: {course.expectedGrade}</p>
                                    </div>
                                    <button onClick={() => removeWhatIfCourse(course.id)} className="text-slate-300 hover:text-red-500 transition-colors p-2 md:p-0">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                            {gpaSimulation.whatIfCourses.length === 0 && (
                                <div className="py-8 border-2 border-dashed border-slate-100 rounded-[20px] flex flex-col items-center justify-center gap-2">
                                    <Calculator size={16} className="text-slate-300" />
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">No variables injected</p>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            )}

            {/* GRADING SHEETS DETAILS */}
            {activeTab === 'details' && (
                <section className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {courses.map(course => {
                        const sheet = gradeSheets.find(s => s.courseId === course.id);
                        const score = sheet?.marksHeads.reduce((acc, h) => acc + h.obtainedMarks, 0) || 0;
                        const total = sheet?.marksHeads.reduce((acc, h) => acc + h.maxMarks, 0) || 100;
                        const percent = Math.round((score / total) * 100);
                        const isExpanded = expandedCourse === course.id;

                        return (
                            <div key={course.id} className="bg-white rounded-[24px] md:rounded-[34px] border border-slate-100 shadow-sm overflow-hidden transition-all duration-300">
                                <div
                                    className="p-4 md:p-5 flex flex-wrap sm:flex-nowrap items-center justify-between cursor-pointer active:bg-slate-50 gap-4"
                                    onClick={() => setExpandedCourse(isExpanded ? null : course.id)}
                                >
                                    <div className="flex items-center gap-3 md:gap-4 min-w-0">
                                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center text-white font-black text-[10px] md:text-xs shrink-0" style={{ backgroundColor: course.color }}>
                                            {course.code.slice(0, 2)}
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="font-black text-slate-800 tracking-tight text-sm md:text-base truncate">{course.name}</h4>
                                            <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">{course.code} • {percent}% Expected</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 md:gap-4 shrink-0">
                                        <span className={`text-lg md:text-xl font-black ${percent >= 80 ? 'text-green-600' : 'text-slate-400'}`}>
                                            {getLetterGrade(percent)}
                                        </span>
                                        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                        </div>
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div className="px-5 md:px-8 pb-6 md:pb-8 pt-2 animate-in slide-in-from-top-4 duration-300">
                                        <div className="h-px bg-slate-100 mb-5 md:mb-6"></div>
                                        <div className="space-y-5 md:space-y-6">
                                            {sheet?.marksHeads.map(head => (
                                                <div key={head.id} className="space-y-2 group">
                                                    <div className="flex justify-between items-end">
                                                        <p className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest truncate mr-4">{head.title}</p>
                                                        <div className="flex items-baseline gap-1 shrink-0">
                                                            <input
                                                                type="number"
                                                                title="Score"
                                                                value={head.obtainedMarks}
                                                                onChange={(e) => handleUpdateMarks(course.id, head.id, e.target.value)}
                                                                className="w-10 text-right font-black text-slate-800 text-xs md:text-sm bg-slate-50 rounded p-1 outline-none border border-transparent focus:border-blue-100 transition-colors"
                                                            />
                                                            <span className="text-[9px] md:text-[10px] font-black text-slate-400">/ {head.maxMarks}</span>
                                                        </div>
                                                    </div>
                                                    <div className="h-1.5 md:h-2 bg-slate-50 rounded-full overflow-hidden">
                                                        <div className="h-full bg-blue-600 rounded-full transition-all duration-1000" style={{ width: `${(head.obtainedMarks / head.maxMarks) * 100}%` }}></div>
                                                    </div>
                                                </div>
                                            ))}

                                            <button
                                                onClick={() => {
                                                    const newSheet = sheet || { courseId: course.id, marksHeads: [] };
                                                    const newHead: MarksHead = {
                                                        id: Math.random().toString(),
                                                        title: "New Assessment",
                                                        maxMarks: 100,
                                                        obtainedMarks: 0
                                                    };
                                                    updateGradeSheet({ ...newSheet, marksHeads: [...newSheet.marksHeads, newHead] });
                                                }}
                                                className="w-full py-3 md:py-4 border-2 border-dashed border-slate-100 text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest rounded-xl md:rounded-2xl hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                                            >
                                                <Plus size={14} /> Component
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </section>
            )}
        </div>
    );
}
