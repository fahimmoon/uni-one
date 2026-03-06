"use client";

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  StudentState, Course, Todo, Note, AttendanceStatus,
  Exam, BudgetTransaction, StudySession, TimetableEntry,
  StudyBlock, CourseGradeSheet, TargetGPASim, FinancialGoal,
  RecurringTransaction, CategoryBudget
} from './types';

interface AppActions {
  setStudentDetails: (details: Partial<StudentState>) => void;
  // Course Actions
  addCourse: (course: Course) => void;
  deleteCourse: (id: string) => void;
  updateCourse: (id: string, data: Partial<Course>) => void;

  // Timetable Actions
  addTimetableEntry: (entry: Omit<TimetableEntry, 'id'>) => void;
  deleteTimetableEntry: (id: string) => void;
  updateTimetableEntry: (id: string, data: Partial<TimetableEntry>) => void;

  // Study Block Actions
  addStudyBlock: (block: Omit<StudyBlock, 'id'>) => void;
  deleteStudyBlock: (id: string) => void;

  // Feature Actions
  addAttendance: (courseId: string, status: AttendanceStatus, date?: string, sessionTime?: string) => void;
  addNote: (courseId: string, note: Note) => void;
  updateNote: (courseId: string, noteId: string, data: Partial<Note>) => void;
  deleteNote: (courseId: string, noteId: string) => void;

  // Todo Actions
  addTodo: (todo: Omit<Todo, 'id'>) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;

  // Exam Actions
  addExam: (exam: Omit<Exam, 'id'>) => void;
  updateExam: (id: string, data: Partial<Exam>) => void;
  deleteExam: (id: string) => void;
  toggleExamCompletion: (id: string) => void;

  // Budget Actions
  addBudgetTransaction: (transaction: Omit<BudgetTransaction, 'id'>) => void;
  deleteBudgetTransaction: (id: string) => void;
  setMonthlyBudgetLimit: (limit: number) => void;

  // Advanced Budget Actions
  addFinancialGoal: (goal: Omit<FinancialGoal, 'id'>) => void;
  updateFinancialGoal: (id: string, data: Partial<FinancialGoal>) => void;
  deleteFinancialGoal: (id: string) => void;

  addRecurringTransaction: (rt: Omit<RecurringTransaction, 'id'>) => void;
  deleteRecurringTransaction: (id: string) => void;

  setCategoryBudget: (category: string, limit: number) => void;
  deleteCategoryBudget: (category: string) => void;

  // Study Actions
  addStudySession: (session: Omit<StudySession, 'id'>) => void;

  // Grading Actions
  updateGradeSheet: (sheet: CourseGradeSheet) => void;
  updateGPASimulation: (sim: Partial<TargetGPASim>) => void;
  addWhatIfCourse: (course: Omit<TargetGPASim['whatIfCourses'][0], 'id'>) => void;
  removeWhatIfCourse: (id: string) => void;
  setOnboarded: (status: boolean) => void;
}

export const useStudentStore = create<StudentState & AppActions>()(
  persist(
    (set) => ({
      name: "Scholar",
      university: "Central University",
      major: "Computer Science",
      semester: 1,
      courses: [],
      timetable: [],
      studyBlocks: [],
      todos: [],
      exams: [],
      budget: [],
      recurringTransactions: [],
      financialGoals: [],
      categoryBudgets: [],
      studySessions: [],
      monthlyBudgetLimit: 1000,
      gradeSheets: [],
      gpaSimulation: { targetGPA: 3.5, whatIfCourses: [] },
      language: 'en',
      streaks: 0,
      totalPoints: 0,
      achievements: [],
      hasOnboarded: false,

      setStudentDetails: (details) => set((state) => ({ ...state, ...details })),

      addCourse: (course) => set((state) => ({
        courses: [...state.courses, course]
      })),

      deleteCourse: (id) => set((state) => ({
        courses: state.courses.filter((c) => c.id !== id)
      })),

      updateCourse: (id, data) => set((state) => ({
        courses: state.courses.map((c) => c.id === id ? { ...c, ...data } : c)
      })),

      addTimetableEntry: (entry) => set((state) => ({
        timetable: [...state.timetable, { id: Math.random().toString(36).substr(2, 9), ...entry }]
      })),

      deleteTimetableEntry: (id) => set((state) => ({
        timetable: state.timetable.filter(e => e.id !== id)
      })),

      updateTimetableEntry: (id, data) => set((state) => ({
        timetable: state.timetable.map(e => e.id === id ? { ...e, ...data } : e)
      })),

      addStudyBlock: (block) => set((state) => ({
        studyBlocks: [...state.studyBlocks, { id: Math.random().toString(36).substr(2, 9), ...block }]
      })),

      deleteStudyBlock: (id) => set((state) => ({
        studyBlocks: state.studyBlocks.filter(b => b.id !== id)
      })),

      addAttendance: (courseId, status, date, sessionTime) => set((state) => ({
        courses: state.courses.map((c) => {
          if (c.id !== courseId) return c;

          const todayStr = (date || new Date().toISOString()).split('T')[0];
          const existingIndex = c.attendance.findIndex(a =>
            a.date.startsWith(todayStr) && (sessionTime ? a.sessionTime === sessionTime : true)
          );

          const newRecord = {
            date: date || new Date().toISOString(),
            status,
            sessionTime
          };

          let newAttendance;
          if (existingIndex >= 0 && sessionTime) {
            newAttendance = [...c.attendance];
            newAttendance[existingIndex] = newRecord;
          } else {
            newAttendance = [...c.attendance, newRecord];
          }

          return { ...c, attendance: newAttendance };
        })
      })),

      addNote: (courseId, note) => set((state) => ({
        courses: state.courses.map((c) =>
          c.id === courseId ? { ...c, notes: [...c.notes, note] } : c
        )
      })),

      updateNote: (courseId, noteId, data) => set((state) => ({
        courses: state.courses.map((c) =>
          c.id === courseId ? {
            ...c,
            notes: c.notes.map(n => n.id === noteId ? { ...n, ...data } : n)
          } : c
        )
      })),

      deleteNote: (courseId, noteId) => set((state) => ({
        courses: state.courses.map((c) =>
          c.id === courseId ? { ...c, notes: c.notes.filter(n => n.id !== noteId) } : c
        )
      })),

      addTodo: (todo) => set((state) => ({
        todos: [
          { id: Math.random().toString(36).substr(2, 9), ...todo },
          ...state.todos
        ]
      })),

      toggleTodo: (id) => set((state) => ({
        todos: state.todos.map((t) =>
          t.id === id ? { ...t, completed: !t.completed } : t
        )
      })),

      deleteTodo: (id) => set((state) => ({
        todos: state.todos.filter((t) => t.id !== id)
      })),

      addExam: (exam) => set((state) => ({
        exams: [...state.exams, { id: Math.random().toString(36).substr(2, 9), ...exam }]
      })),

      updateExam: (id, data) => set((state) => ({
        exams: state.exams.map(e => e.id === id ? { ...e, ...data } : e)
      })),

      deleteExam: (id) => set((state) => ({
        exams: state.exams.filter(e => e.id !== id)
      })),

      toggleExamCompletion: (id) => set((state) => ({
        exams: state.exams.map(e => e.id === id ? { ...e, isCompleted: !e.isCompleted } : e)
      })),

      addBudgetTransaction: (transaction) => set((state) => ({
        budget: [...state.budget, { id: Math.random().toString(36).substr(2, 9), ...transaction }]
      })),

      deleteBudgetTransaction: (id) => set((state) => ({
        budget: state.budget.filter(b => b.id !== id)
      })),

      setMonthlyBudgetLimit: (limit) => set({ monthlyBudgetLimit: limit }),

      addFinancialGoal: (goal) => set((state) => ({
        financialGoals: [...state.financialGoals, { id: Math.random().toString(36).substr(2, 9), ...goal }]
      })),

      updateFinancialGoal: (id, data) => set((state) => ({
        financialGoals: state.financialGoals.map(g => g.id === id ? { ...g, ...data } : g)
      })),

      deleteFinancialGoal: (id) => set((state) => ({
        financialGoals: state.financialGoals.filter(g => g.id !== id)
      })),

      addRecurringTransaction: (rt) => set((state) => ({
        recurringTransactions: [...state.recurringTransactions, { id: Math.random().toString(36).substr(2, 9), ...rt }]
      })),

      deleteRecurringTransaction: (id) => set((state) => ({
        recurringTransactions: state.recurringTransactions.filter(rt => rt.id !== id)
      })),

      setCategoryBudget: (category, limit) => set((state) => ({
        categoryBudgets: state.categoryBudgets.find(b => b.category === category)
          ? state.categoryBudgets.map(b => b.category === category ? { ...b, limit } : b)
          : [...state.categoryBudgets, { category, limit }]
      })),

      deleteCategoryBudget: (category) => set((state) => ({
        categoryBudgets: state.categoryBudgets.filter(b => b.category !== category)
      })),

      addStudySession: (session) => set((state) => ({
        studySessions: [...state.studySessions, { id: Math.random().toString(36).substr(2, 9), ...session }]
      })),

      updateGradeSheet: (sheet) => set((state) => ({
        gradeSheets: state.gradeSheets.find(s => s.courseId === sheet.courseId)
          ? state.gradeSheets.map(s => s.courseId === sheet.courseId ? sheet : s)
          : [...state.gradeSheets, sheet]
      })),

      updateGPASimulation: (sim) => set((state) => ({
        gpaSimulation: { ...state.gpaSimulation, ...sim }
      })),

      addWhatIfCourse: (course) => set((state) => ({
        gpaSimulation: {
          ...state.gpaSimulation,
          whatIfCourses: [
            ...state.gpaSimulation.whatIfCourses,
            { id: Math.random().toString(36).substr(2, 9), ...course }
          ]
        }
      })),

      removeWhatIfCourse: (id) => set((state) => ({
        gpaSimulation: {
          ...state.gpaSimulation,
          whatIfCourses: state.gpaSimulation.whatIfCourses.filter(c => c.id !== id)
        }
      })),

      setOnboarded: (status: boolean) => set({ hasOnboarded: status }),
    }),
    {
      name: 'uni-one-storage',
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    }
  )
);
