export type AttendanceStatus = 'present' | 'absent' | 'excused' | 'late';

export type AttendanceRecord = {
  date: string;
  status: AttendanceStatus;
  sessionTime?: string; // Format "09:00" - optional for compatibility
};

export type Note = {
  id: string;
  title: string;
  content: string;
  week: number;
  topic: string;    // Added topic
  subject: string;  // Added subject (within the course)
  createdAt: string;
};

export type ScheduleItem = {
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  startTime: string; // Format "14:00"
  endTime: string;   // Format "15:30"
  room: string;
};

export type Course = {
  id: string;
  name: string;      // e.g. "Data Structures"
  code: string;      // e.g. "CS-101"
  credits: number;   // e.g. 3 or 4
  semester: number;  // e.g. 1
  color: string;     // Hex code for UI
  grade?: number;    // Grade point (4.0, 3.7, etc.) for GPA calc
  schedule: ScheduleItem[];
  attendance: AttendanceRecord[];
  notes: Note[];
};

export type Todo = {
  id: string;
  text: string;
  completed: boolean;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high';
  courseId?: string; // Link todo to a course
};

export type TimetableEntry = {
  id: string;
  courseId: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  startTime: string; // "09:00"
  endTime: string;   // "10:30"
  location?: string;
  instructor?: string;
  classType?: string; // "Lecture", "Lab", etc.
  color?: string;
};

export type StudyBlock = {
  id: string;
  title: string;
  day: string;
  startTime: string;
  endTime: string;
  color: string;
};

export type Exam = {
  id: string;
  name: string;
  courseId: string;
  courseName: string;
  date: string;
  time?: string;
  location?: string;
  notes?: string;
  type: 'midterm' | 'final' | 'quiz' | 'presentation' | 'lab' | 'assignment';
  isCompleted: boolean;
};

export type MarksHead = {
  id: string;
  title: string;
  maxMarks: number;
  obtainedMarks: number;
};

export type CourseGradeSheet = {
  courseId: string;
  instructor?: string;
  section?: string;
  marksHeads: MarksHead[];
};

export type TargetGPASim = {
  targetGPA: number;
  whatIfCourses: {
    id: string;
    name: string;
    credits: number;
    expectedGrade: string;
  }[];
};

export type BudgetTransaction = {
  id: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  isRecurring?: boolean;
  recurringId?: string;
};

export type RecurringTransaction = {
  id: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: string;
  nextDate: string;
};

export type FinancialGoal = {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  category: string;
  color: string;
};

export type CategoryBudget = {
  category: string;
  limit: number;
};

export type StudySession = {
  id: string;
  courseId?: string;
  duration: number; // minutes
  date: string;
  focusScore?: number; // 1-10
};

export type StudentState = {
  name: string;
  university: string;
  major: string;
  semester: number;
  courses: Course[];
  timetable: TimetableEntry[];
  studyBlocks: StudyBlock[];
  todos: Todo[];
  exams: Exam[];
  budget: BudgetTransaction[];
  recurringTransactions: RecurringTransaction[];
  financialGoals: FinancialGoal[];
  categoryBudgets: CategoryBudget[];
  studySessions: StudySession[];
  monthlyBudgetLimit: number;
  gradeSheets: CourseGradeSheet[];
  gpaSimulation: TargetGPASim;
  language: 'en' | 'ur';
  streaks: number;
  totalPoints: number;
  achievements: Achievement[];
  hasOnboarded: boolean;
};

export type Achievement = {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
};

export type CourseProgress = {
  courseId: string;
  completedModules: string[];
  lastAccessed: string;
};