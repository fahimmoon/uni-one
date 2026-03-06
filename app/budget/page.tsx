"use client";

import { useStudentStore } from "@/lib/store";
import { useEffect, useState, useMemo } from "react";
import {
    Plus, ArrowUpRight, ArrowDownLeft, Trash2, PieChart, Target,
    Sparkles, CreditCard, Landmark, ReceiptText, LayoutGrid,
    UtensilsCrossed, Bus, Receipt, BookOpen, Film, HeartPulse,
    ShoppingBag, Search, Filter, TrendingUp, Calendar,
    ChevronDown, MoreHorizontal, Settings, X, Wallet, ArrowRight,
    Repeat, Trophy, ArrowLeftRight, CheckCircle2, AlertCircle,
    Download, PencilLine, Layers, Activity, History as HistoryIcon,
    Zap, Share2, FilterX, Eye, EyeOff, Minus
} from "lucide-react";

import PageHeader from "@/components/ui/PageHeader";
import { useLanguage } from "@/lib/LanguageContext";
import { FinancialGoal, RecurringTransaction, BudgetTransaction } from "@/lib/types";

const CATEGORIES = [
    { name: "Miscellaneous", icon: LayoutGrid, color: "bg-slate-400" },
    { name: "Food", icon: UtensilsCrossed, color: "bg-orange-500" },
    { name: "Transport", icon: Bus, color: "bg-blue-500" },
    { name: "Bills", icon: Receipt, color: "bg-red-500" },
    { name: "Education", icon: BookOpen, color: "bg-purple-500" },
    { name: "Entertainment", icon: Film, color: "bg-pink-500" },
    { name: "Health", icon: HeartPulse, color: "bg-emerald-500" },
    { name: "Shopping", icon: ShoppingBag, color: "bg-indigo-500" },
];

export default function BudgetPage() {
    const [mounted, setMounted] = useState(false);
    const {
        budget, addBudgetTransaction, deleteBudgetTransaction,
        monthlyBudgetLimit, setMonthlyBudgetLimit,
        financialGoals = [], addFinancialGoal, deleteFinancialGoal, updateFinancialGoal,
        recurringTransactions = [], addRecurringTransaction, deleteRecurringTransaction,
        categoryBudgets = [], setCategoryBudget, deleteCategoryBudget
    } = useStudentStore();

    // UI State
    const [activeTab, setActiveTab] = useState<'matrix' | 'targets' | 'autopilot'>('matrix');
    const [title, setTitle] = useState("");
    const [amount, setAmount] = useState("");
    const [type, setType] = useState<'income' | 'expense'>('expense');
    const [category, setCategory] = useState("Miscellaneous");
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [newLimit, setNewLimit] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [filterCategory, setFilterCategory] = useState("All");
    const [showBalance, setShowBalance] = useState(true);

    // Goal Modal State
    const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
    const [goalTitle, setGoalTitle] = useState("");
    const [goalTarget, setGoalTarget] = useState("");

    // Autopilot Modal State
    const [isAutoModalOpen, setIsAutoModalOpen] = useState(false);
    const [autoTitle, setAutoTitle] = useState("");
    const [autoAmount, setAutoAmount] = useState("");
    const [autoType, setAutoType] = useState<'income' | 'expense'>('expense');
    const [autoFreq, setAutoFreq] = useState<'daily' | 'weekly' | 'monthly'>('monthly');

    const { t } = useLanguage();

    useEffect(() => {
        useStudentStore.persist.rehydrate();
        const timer = setTimeout(() => setMounted(true), 0);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        setNewLimit(monthlyBudgetLimit.toString());
    }, [monthlyBudgetLimit]);

    // Derived Data & Analytics
    const analytics = useMemo(() => {
        const totalIncome = budget.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const totalExpense = budget.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        const balance = totalIncome - totalExpense;
        const progress = Math.min(100, (totalExpense / (monthlyBudgetLimit || 1000)) * 100);

        // Velocity (Daily average spending this month)
        const now = new Date();
        const daysPassed = now.getDate();
        const dailyVelocity = totalExpense / daysPassed;

        return { totalIncome, totalExpense, balance, progress, dailyVelocity };
    }, [budget, monthlyBudgetLimit]);

    const filteredBudget = useMemo(() => {
        return budget
            .filter(t => {
                const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
                const matchesCategory = filterCategory === "All" || t.category === filterCategory;
                return matchesSearch && matchesCategory;
            })
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [budget, searchQuery, filterCategory]);

    const categoryStats = useMemo(() => {
        return CATEGORIES.map(cat => {
            const catTotal = budget
                .filter(t => t.type === 'expense' && t.category === cat.name)
                .reduce((sum, t) => sum + t.amount, 0);
            const catLimit = categoryBudgets.find(b => b.category === cat.name)?.limit || 0;
            return { ...cat, total: catTotal, limit: catLimit };
        }).filter(cat => cat.total > 0 || cat.limit > 0).sort((a, b) => b.total - a.total);
    }, [budget, categoryBudgets]);

    if (!mounted) return null;

    const handleAddTransaction = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !amount) return;
        addBudgetTransaction({
            title,
            amount: parseFloat(amount),
            type,
            category,
            date: new Date().toISOString()
        });
        setTitle("");
        setAmount("");
    };

    const handleAddGoal = (e: React.FormEvent) => {
        e.preventDefault();
        if (!goalTitle || !goalTarget) return;
        addFinancialGoal({
            title: goalTitle,
            targetAmount: parseFloat(goalTarget),
            currentAmount: 0,
            category: "General",
            color: "bg-indigo-500"
        });
        setGoalTitle("");
        setGoalTarget("");
        setIsGoalModalOpen(false);
    };

    const handleAddAuto = (e: React.FormEvent) => {
        e.preventDefault();
        if (!autoTitle || !autoAmount) return;
        addRecurringTransaction({
            title: autoTitle,
            amount: parseFloat(autoAmount),
            type: autoType,
            category: "General",
            frequency: autoFreq,
            startDate: new Date().toISOString(),
            nextDate: new Date(Date.now() + 86400000).toISOString() // Tomorrow mock
        });
        setAutoTitle("");
        setAutoAmount("");
        setIsAutoModalOpen(false);
    };

    const handleExport = () => {
        const data = JSON.stringify(budget, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `scholar_ledger_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
    };

    return (
        <div className="bg-[#FBFCFE] min-h-screen pb-32 font-sans px-4 md:px-10 pt-8 no-scrollbar overflow-x-hidden selection:bg-indigo-100 selection:text-indigo-900">
            <PageHeader
                title={t("Capital Command", "سرمایہ کمانڈ")}
                subtitle={t("Tactical Resource Management System", "ٹیکٹیکل وسائل کے انتظام کا نظام")}
                icon={Landmark}
                accentColor="bg-slate-900"
            />

            {/* TAB NAVIGATOR - HIGH DENSITY */}
            <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100/50 rounded-[24px] w-fit mb-8 border border-slate-200/40 relative z-20">
                {(['matrix', 'targets', 'autopilot'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 md:px-10 py-2.5 rounded-[18px] text-[9px] font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === tab ? 'bg-white text-slate-900 shadow-xl shadow-slate-900/5' : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'}`}
                    >
                        {activeTab === tab && <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-1 bg-indigo-500 rounded-full"></div>}
                        {t(tab.toUpperCase(), tab)}
                    </button>
                ))}
            </div>

            <div className="max-w-[1500px] mx-auto grid grid-cols-1 xl:grid-cols-12 gap-6 md:gap-8">

                {/* LEFT CONTEXT: MAIN OPERATIONS (8 COLS) */}
                <div className="xl:col-span-8 space-y-6">

                    {activeTab === 'matrix' && (
                        <>
                            {/* ULTRA COMPACT BALANCE HUB */}
                            <div className="bg-slate-900 p-8 md:p-10 rounded-[48px] shadow-[0_32px_64px_-16px_rgba(15,23,42,0.3)] relative overflow-hidden text-white border border-white/5 group">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-linear-to-br from-indigo-500/20 to-blue-500/20 rounded-full blur-[80px] -mr-20 -mt-20 group-hover:scale-125 transition-transform duration-1000"></div>
                                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-[60px]"></div>

                                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="flex items-center gap-2 bg-white/5 py-1.5 px-3 rounded-full border border-white/10">
                                                <Activity size={10} className="text-blue-400" />
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">{t("Liquid Assets", "مائع اثاثے")}</span>
                                            </div>
                                            <button onClick={() => setShowBalance(!showBalance)} className="text-white/20 hover:text-white transition-colors">
                                                {showBalance ? <Eye size={14} /> : <EyeOff size={14} />}
                                            </button>
                                        </div>
                                        <h2 className="text-4xl md:text-5xl font-black tracking-tighter leading-none flex items-baseline">
                                            <span className="text-indigo-400 text-2xl mr-1 font-medium opacity-50">$</span>
                                            {showBalance ? analytics.balance.toLocaleString(undefined, { minimumFractionDigits: 2 }) : "••••••"}
                                        </h2>
                                        <div className="flex items-center gap-6 mt-8">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{t("Cash Inflow", "نقد آمدنی")}</span>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-sm bg-emerald-500/30"></div>
                                                    <span className="text-sm font-black text-emerald-400 tracking-tighter">${analytics.totalIncome.toLocaleString()}</span>
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-1 border-l border-white/5 pl-6">
                                                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{t("Capital Burn", "سرمایہ جلانا")}</span>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-sm bg-red-500/30"></div>
                                                    <span className="text-sm font-black text-red-400 tracking-tighter">${analytics.totalExpense.toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="md:w-px h-px md:h-32 bg-white/10 shrink-0"></div>

                                    <div className="flex flex-col items-center md:items-end md:text-right">
                                        <div className="bg-white/5 p-4 rounded-3xl border border-white/10 mb-4 group/velocity">
                                            <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">{t("Burn Velocity", "جلانے کی رفتار")}</p>
                                            <div className="flex items-center gap-2 text-indigo-400">
                                                <TrendingUp size={14} className="group-hover/velocity:-translate-y-0.5 group-hover/velocity:translate-x-0.5 transition-transform" />
                                                <span className="text-lg font-black tracking-tighter">${analytics.dailyVelocity.toFixed(1)} <span className="text-[10px] text-slate-500 font-medium tracking-normal">/day</span></span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={handleExport} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all active:scale-95" title="Export Ledger">
                                                <Download size={16} className="text-slate-400" />
                                            </button>
                                            <button className="p-3 bg-indigo-600 hover:bg-indigo-500 rounded-2xl transition-all shadow-xl shadow-indigo-900/40 active:scale-95">
                                                <Share2 size={16} className="text-white" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* TRANSACTION COMMANDER */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center px-2">
                                    <div className="flex items-center gap-3">
                                        <Activity size={14} className="text-indigo-500" />
                                        <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.4em]">{t("Ledger Stream", "لیجر اسٹریم")}</h3>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="relative group/search">
                                            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within/search:text-indigo-500 transition-colors" />
                                            <input
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                placeholder={t("Filter Vectors...", "فلٹر ویکٹر...")}
                                                className="bg-white border border-slate-100 rounded-xl py-2 pl-9 pr-4 text-[9px] font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-100 transition-all md:w-48"
                                            />
                                        </div>
                                        <button
                                            onClick={() => { setSearchQuery(""); setFilterCategory("All"); }}
                                            className="p-2 bg-slate-50 text-slate-300 hover:text-red-500 rounded-xl transition-all"
                                            title="Clear Filters"
                                        >
                                            <FilterX size={14} />
                                        </button>
                                    </div>
                                </div>

                                {/* FAST FORM - ULTRA COMPACT GRID */}
                                <form onSubmit={handleAddTransaction} className="bg-white p-4 rounded-[32px] border border-slate-50 shadow-sm grid grid-cols-2 md:grid-cols-5 gap-3 relative overflow-hidden group">
                                    <div className="col-span-2 md:col-span-1">
                                        <input
                                            placeholder="Mission..."
                                            className="w-full bg-slate-50/50 border border-slate-50 rounded-2xl py-3 px-4 text-xs font-black text-slate-800 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <div className="relative">
                                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-black text-slate-300 text-[10px]">$</span>
                                            <input
                                                type="number"
                                                placeholder="0.00"
                                                className="w-full bg-slate-50/50 border border-slate-50 rounded-2xl py-3 pl-7 pr-3 text-xs font-black text-slate-800 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                                                value={amount}
                                                onChange={(e) => setAmount(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <select
                                            className="w-full bg-slate-50/50 border border-slate-50 rounded-2xl py-3 px-4 text-[10px] font-black text-slate-800 uppercase tracking-widest appearance-none focus:bg-white transition-all outline-none"
                                            value={category}
                                            onChange={(e) => setCategory(e.target.value)}
                                            title="Category"
                                        >
                                            {CATEGORIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                                        </select>
                                        <ChevronDown size={10} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                    </div>
                                    <div className="flex bg-slate-50/50 p-1 rounded-2xl border border-slate-50">
                                        {(['expense', 'income'] as const).map(trType => (
                                            <button
                                                key={trType}
                                                type="button"
                                                onClick={() => setType(trType)}
                                                className={`flex-1 py-1.5 rounded-xl text-[7px] font-black uppercase tracking-widest transition-all ${type === trType ? (trType === 'income' ? 'bg-emerald-500 text-white shadow-lg' : 'bg-slate-900 text-white shadow-lg') : 'text-slate-400'}`}
                                            >
                                                {trType === 'income' ? 'IN' : 'OUT'}
                                            </button>
                                        ))}
                                    </div>
                                    <button className="bg-slate-900 text-white rounded-2xl py-3 font-black text-[9px] uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-900/10 active:scale-95 md:col-span-1 col-span-2">
                                        <Plus size={14} strokeWidth={3} /> {t("COMMIT", "عہد")}
                                    </button>
                                </form>

                                {/* SCROLLABLE LIST - COMPACT */}
                                <div className="grid gap-2 max-h-[500px] overflow-y-auto pr-1 no-scrollbar pb-10">
                                    {filteredBudget.map(transaction => {
                                        const catInfo = CATEGORIES.find(c => c.name === transaction.category) || CATEGORIES[0];
                                        return (
                                            <div key={transaction.id} className="bg-white p-3.5 rounded-[24px] border border-slate-50 shadow-sm hover:shadow-md transition-all group flex items-center justify-between relative overflow-hidden border-l-4" style={{ borderLeftColor: transaction.type === 'income' ? '#10b981' : '#f1f5f9' }}>
                                                <div className="flex items-center gap-4 relative z-10 min-w-0">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${transaction.type === 'income' ? 'bg-emerald-50 text-emerald-500' : 'bg-slate-50 text-slate-400'} shrink-0`}>
                                                        <catInfo.icon size={16} strokeWidth={2.5} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h4 className="text-[13px] font-black text-slate-800 tracking-tight leading-none mb-1.5 truncate uppercase">{transaction.title}</h4>
                                                        <div className="flex items-center gap-2">
                                                            <span className={`text-[7px] font-black text-white px-2 py-0.5 rounded-md uppercase tracking-widest ${catInfo.color}`}>{transaction.category}</span>
                                                            <span className="text-[8px] font-black text-slate-300 uppercase shrink-0">{new Date(transaction.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right flex items-center gap-4 relative z-10 shrink-0">
                                                    <div>
                                                        <p className={`text-sm font-black tracking-tighter ${transaction.type === 'income' ? 'text-emerald-500' : 'text-slate-900'}`}>
                                                            {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toLocaleString(undefined, { minimumFractionDigits: transaction.amount % 1 !== 0 ? 2 : 0 })}
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() => deleteBudgetTransaction(transaction.id)}
                                                        className="p-2.5 bg-red-50 text-red-500 rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white active:scale-90"
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {filteredBudget.length === 0 && (
                                        <div className="text-center py-20 bg-slate-50/50 rounded-[40px] border-2 border-dashed border-slate-100 flex flex-col items-center">
                                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4 text-slate-200">
                                                <HistoryIcon size={24} />
                                            </div>
                                            <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.4em]">{t("No Data Found", "کوئی ڈیٹا نہیں ملا")}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'targets' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
                            <div className="flex justify-between items-center px-2">
                                <div>
                                    <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.4em] mb-1">{t("Accumulation Matrix", "جمع کرنے کا میٹرکس")}</h3>
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{t("Wealth Preservation Goals", "دولت کے تحفظ کے اہداف")}</p>
                                </div>
                                <button
                                    onClick={() => setIsGoalModalOpen(true)}
                                    className="p-3 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-200 hover:-translate-y-1 active:scale-95 transition-all"
                                >
                                    <Plus size={18} strokeWidth={3} />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {financialGoals.map(goal => {
                                    const goalProgress = (goal.currentAmount / goal.targetAmount) * 100;
                                    return (
                                        <div key={goal.id} className="bg-white p-6 rounded-[32px] border border-slate-50 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
                                            <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-indigo-50 transition-colors"></div>

                                            <div className="relative z-10 flex justify-between items-center mb-6">
                                                <div className="w-10 h-10 bg-white shadow-xl rounded-xl flex items-center justify-center text-indigo-600 border border-slate-50 group-hover:scale-110 transition-transform">
                                                    <Trophy size={18} strokeWidth={2.5} />
                                                </div>
                                                <button onClick={() => deleteFinancialGoal(goal.id)} className="p-2 text-slate-100 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100">
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>

                                            <div className="relative z-10 space-y-4">
                                                <div>
                                                    <h4 className="text-[15px] font-black text-slate-900 tracking-tight leading-none mb-1 uppercase mb-3">{goal.title}</h4>
                                                    <div className="flex justify-between items-end">
                                                        <p className="text-xl font-black text-slate-900 tracking-tighter leading-none">${goal.currentAmount.toLocaleString()} <span className="text-[9px] text-slate-400 font-medium tracking-normal capitalize">of ${goal.targetAmount.toLocaleString()}</span></p>
                                                        <span className="text-[10px] font-black text-indigo-500 tracking-tighter">{Math.round(goalProgress)}%</span>
                                                    </div>
                                                </div>

                                                <div className="h-2.5 bg-slate-50 rounded-full overflow-hidden p-0.5 border border-slate-100 shadow-inner">
                                                    <div
                                                        className="h-full bg-linear-to-r from-indigo-500 to-blue-500 rounded-full transition-all duration-1000 relative"
                                                        style={{ width: `${Math.min(100, goalProgress)}%` }}
                                                    >
                                                        <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                                                    </div>
                                                </div>

                                                <div className="flex gap-2">
                                                    <input
                                                        type="number"
                                                        placeholder="+ Contribution..."
                                                        className="flex-1 bg-slate-50 px-4 py-2 rounded-xl border border-slate-50 text-[9px] font-black uppercase tracking-widest outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/5"
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                const val = parseFloat((e.target as HTMLInputElement).value);
                                                                if (!isNaN(val)) {
                                                                    updateFinancialGoal(goal.id, { currentAmount: goal.currentAmount + val });
                                                                    (e.target as HTMLInputElement).value = "";
                                                                }
                                                            }
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {activeTab === 'autopilot' && (
                        <div className="space-y-6 animate-in px-2 animate-in fade-in slide-in-from-bottom-6 duration-700">
                            <div className="flex justify-between items-center px-1">
                                <div>
                                    <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.4em] mb-1">{t("Autopilot Streams", "آٹو پائلٹ اسٹریمز")}</h3>
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{t("Periodic Resource Allocation", "وقتاً فوقتاً وسائل کی تقسیم")}</p>
                                </div>
                                <button
                                    onClick={() => setIsAutoModalOpen(true)}
                                    className="p-3 bg-slate-900 text-white rounded-2xl shadow-xl shadow-slate-900/20 hover:-translate-y-1 active:scale-95 transition-all"
                                >
                                    <Plus size={18} strokeWidth={3} />
                                </button>
                            </div>

                            <div className="bg-white rounded-[32px] border border-slate-50 shadow-sm overflow-hidden divide-y divide-slate-50">
                                {recurringTransactions.map(rt => (
                                    <div key={rt.id} className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                                                <Repeat size={18} />
                                            </div>
                                            <div>
                                                <h4 className="font-black text-slate-800 text-[13px] mb-1 uppercase">{rt.title}</h4>
                                                <div className="flex items-center gap-2 text-[8px] font-black text-slate-400 uppercase tracking-widest">
                                                    <span className="bg-slate-100 px-1.5 py-0.5 rounded shadow-sm">{rt.frequency}</span>
                                                    <div className="w-1 h-1 bg-slate-200 rounded-full"></div>
                                                    <span className="text-indigo-400">Next: {new Date(rt.nextDate).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <p className="text-lg font-black text-slate-900 tracking-tighter leading-none">${rt.amount.toLocaleString()}</p>
                                            <button onClick={() => deleteRecurringTransaction(rt.id)} className="p-2.5 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {recurringTransactions.length === 0 && (
                                    <div className="p-20 text-center flex flex-col items-center">
                                        <Layers size={32} className="text-slate-100 mb-4" />
                                        <h4 className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">{t("No Active Stream Protocols", "کوئی فعال اسٹریم پروٹوکول نہیں")}</h4>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* RIGHT CONTEXT: ANALYTICS & HUB (4 COLS) */}
                <div className="xl:col-span-4 space-y-6">

                    {/* HUB CONTROL - COMPACT SETTINGS */}
                    <div className="bg-slate-900 p-6 md:p-8 rounded-[40px] shadow-2xl shadow-indigo-900/10 border border-white/5 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-125 transition-transform"></div>

                        <div className="flex justify-between items-center mb-8 relative z-10">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-500/20 rounded-xl text-indigo-400">
                                    <Settings size={14} />
                                </div>
                                <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">{t("Buffer Deck", "بفر ڈیک")}</h3>
                            </div>
                            <button onClick={() => setIsSettingsOpen(true)} className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all text-indigo-400">
                                <PencilLine size={14} />
                            </button>
                        </div>

                        <div className="relative z-10 space-y-8">
                            <div>
                                <div className="flex justify-between items-end mb-3">
                                    <span className="text-3xl font-black text-white tracking-tighter leading-none">${analytics.totalExpense.toLocaleString()}</span>
                                    <div className="text-right">
                                        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">{t("Threshold", "حد")}</p>
                                        <p className="text-sm font-black text-indigo-400 tracking-tighter leading-none">${monthlyBudgetLimit}</p>
                                    </div>
                                </div>
                                <div className="h-3 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5 flex items-center shadow-inner relative">
                                    <div
                                        className={`h-full rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(99,102,241,0.3)] ${analytics.progress > 90 ? 'bg-red-500' : analytics.progress > 75 ? 'bg-amber-500' : 'bg-indigo-500'}`}
                                        style={{ width: `${analytics.progress}%` }}
                                    >
                                        <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 mt-4 px-1">
                                    <Zap size={10} className={analytics.progress > 90 ? "text-red-500" : "text-amber-500"} fill="currentColor" />
                                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{analytics.progress.toFixed(1)}% {t("Allocated", "مختص کیا گیا")}</span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] px-1 mb-2">{t("Sector Thresholds", "سیکٹر کی حدود")}</p>
                                {categoryBudgets.map(cb => {
                                    const catStat = categoryStats.find(s => s.name === cb.category);
                                    const catProgress = catStat ? (catStat.total / cb.limit) * 100 : 0;
                                    return (
                                        <div key={cb.category} className="bg-white/5 p-4 rounded-2xl border border-white/5 flex flex-col gap-3 group/cb">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-1.5 h-1.5 rounded-full ${catProgress > 90 ? 'bg-red-400' : 'bg-indigo-400'}`}></div>
                                                    <span className="text-[10px] font-black text-white uppercase tracking-tighter">{cb.category}</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[11px] font-black text-slate-400 tracking-tighter">${cb.limit}</span>
                                                    <button onClick={() => deleteCategoryBudget(cb.category)} className="text-white/20 hover:text-red-400 opacity-0 group-hover/cb:opacity-100 transition-all">
                                                        <Minus size={10} />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="h-0.5 bg-white/5 rounded-full overflow-hidden">
                                                <div className={`h-full ${catProgress > 100 ? 'bg-red-500' : 'bg-indigo-500'} rounded-full`} style={{ width: `${Math.min(100, catProgress)}%` }}></div>
                                            </div>
                                        </div>
                                    );
                                })}
                                <button
                                    onClick={() => {
                                        const lim = prompt("Set limit for " + category);
                                        if (lim) setCategoryBudget(category, parseFloat(lim));
                                    }}
                                    className="w-full py-3.5 border border-dashed border-white/10 rounded-2xl text-[8px] font-black text-slate-500 uppercase tracking-widest hover:border-indigo-500/50 hover:text-indigo-400 transition-all active:scale-[0.98]"
                                >
                                    + {t("Deploy Sector Link", "سیکٹر لنک تعینات کریں")}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* SECTOR PERCEPTION - VISUAL ANALYTICS */}
                    <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-50 space-y-6">
                        <div className="flex items-center justify-between px-1">
                            <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.4em]">{t("Sector Perception", "سیکٹر کا تصور")}</h3>
                            <PieChart size={14} className="text-slate-300" />
                        </div>

                        <div className="space-y-2">
                            {categoryStats.slice(0, 6).map(cat => {
                                const percentage = (cat.total / analytics.totalExpense) * 100;
                                return (
                                    <div key={cat.name} className="p-3.5 rounded-2xl bg-slate-50/50 border border-transparent hover:border-slate-100 hover:bg-white transition-all group cursor-default">
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className={`w-8 h-8 ${cat.color} rounded-xl shadow-lg shadow-indigo-900/5 flex items-center justify-center text-white shrink-0 group-hover:rotate-6 transition-transform`}>
                                                    <cat.icon size={14} />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-[10px] font-black text-slate-900 tracking-tight leading-none mb-1 uppercase truncate">{cat.name}</p>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-16 h-1 bg-slate-200 rounded-full overflow-hidden">
                                                            <div className={`h-full ${cat.color} rounded-full`} style={{ width: `${percentage}%` }}></div>
                                                        </div>
                                                        <span className="text-[9px] font-black text-slate-400 tracking-tighter">{percentage.toFixed(0)}%</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className="text-[12px] font-black tracking-tighter text-slate-900">${cat.total.toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* MODALS - SYSTEM CORE */}
            {isSettingsOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-3xl animate-in fade-in duration-500">
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        setMonthlyBudgetLimit(parseFloat(newLimit));
                        setIsSettingsOpen(false);
                    }} className="bg-white w-full max-w-xs rounded-[48px] p-8 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-500">
                        <div className="flex justify-between items-center mb-8 relative z-10">
                            <h3 className="text-xl font-black text-slate-900 tracking-tighter">{t("Buffer Threshold", "بفر کی حد")}</h3>
                            <button type="button" onClick={() => setIsSettingsOpen(false)} className="p-2.5 bg-slate-50 rounded-xl text-slate-300 hover:text-red-500 transition-colors"><X size={16} /></button>
                        </div>
                        <div className="space-y-6 relative z-10">
                            <div className="relative">
                                <Wallet size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" />
                                <input
                                    type="number"
                                    value={newLimit}
                                    onChange={(e) => setNewLimit(e.target.value)}
                                    className="w-full bg-slate-50 rounded-[28px] py-4 pl-14 pr-8 text-lg font-black text-slate-900 outline-none focus:ring-4 focus:ring-indigo-600/10"
                                />
                            </div>
                            <button type="submit" className="w-full bg-slate-900 text-white rounded-[24px] py-4 font-black uppercase text-[10px] tracking-[0.3em] flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all">
                                {t("Lock Deck", "ڈیک لاک کریں")} <ArrowRight size={14} />
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {isGoalModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-3xl animate-in fade-in duration-500">
                    <form onSubmit={handleAddGoal} className="bg-white w-full max-w-sm rounded-[48px] p-8 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-500">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-xl font-black text-slate-900 tracking-tighter">{t("New Trajectory", "نیا راستہ")}</h3>
                            <button type="button" onClick={() => setIsGoalModalOpen(false)} className="p-2.5 bg-slate-50 rounded-xl text-slate-300 hover:text-red-500 transition-colors"><X size={16} /></button>
                        </div>
                        <div className="space-y-4">
                            <input
                                placeholder="Objective Name..."
                                value={goalTitle}
                                onChange={(e) => setGoalTitle(e.target.value)}
                                className="w-full bg-slate-50 rounded-2xl py-4 px-6 text-xs font-black text-slate-900 outline-none focus:ring-4 focus:ring-indigo-600/10"
                            />
                            <div className="relative">
                                <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-slate-300 text-xs">$</span>
                                <input
                                    type="number"
                                    placeholder="Target Volume..."
                                    value={goalTarget}
                                    onChange={(e) => setGoalTarget(e.target.value)}
                                    className="w-full bg-slate-50 rounded-2xl py-4 pl-10 pr-6 text-xs font-black text-slate-900 outline-none focus:ring-4 focus:ring-indigo-600/10"
                                />
                            </div>
                            <button type="submit" className="w-full bg-indigo-600 text-white rounded-[24px] py-4 font-black uppercase text-[9px] tracking-[0.3em] flex items-center justify-center gap-3 mt-4 active:scale-95 transition-all">
                                {t("Initialize Target", "ہدف شروع کریں")} <Zap size={14} />
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {isAutoModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-3xl animate-in fade-in duration-500">
                    <form onSubmit={handleAddAuto} className="bg-white w-full max-w-sm rounded-[48px] p-8 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-500">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-xl font-black text-slate-900 tracking-tighter">{t("New Autopilot", "نیا آٹو پائلٹ")}</h3>
                            <button type="button" onClick={() => setIsAutoModalOpen(false)} className="p-2.5 bg-slate-50 rounded-xl text-slate-300 hover:text-red-500 transition-colors"><X size={16} /></button>
                        </div>
                        <div className="space-y-4">
                            <input
                                placeholder="Stream Name..."
                                value={autoTitle}
                                onChange={(e) => setAutoTitle(e.target.value)}
                                className="w-full bg-slate-50 rounded-2xl py-4 px-6 text-xs font-black text-slate-900 outline-none focus:ring-4 focus:ring-slate-900/10"
                            />
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-300 text-xs">$</span>
                                    <input
                                        type="number"
                                        placeholder="0.00"
                                        value={autoAmount}
                                        onChange={(e) => setAutoAmount(e.target.value)}
                                        className="w-full bg-slate-50 rounded-2xl py-4 pl-8 pr-4 text-xs font-black text-slate-900 outline-none focus:ring-4 focus:ring-slate-900/10"
                                    />
                                </div>
                                <select
                                    value={autoFreq}
                                    onChange={(e) => setAutoFreq(e.target.value as any)}
                                    className="bg-slate-50 rounded-2xl py-4 px-4 text-[10px] font-black text-slate-600 outline-none focus:ring-4 uppercase"
                                >
                                    <option value="daily">Daily</option>
                                    <option value="weekly">Weekly</option>
                                    <option value="monthly">Monthly</option>
                                </select>
                            </div>
                            <div className="flex bg-slate-50 p-1 rounded-2xl mt-4">
                                {(['expense', 'income'] as const).map(trType => (
                                    <button
                                        key={trType}
                                        type="button"
                                        onClick={() => setAutoType(trType)}
                                        className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${autoType === trType ? (trType === 'income' ? 'bg-emerald-500 text-white shadow-lg' : 'bg-slate-900 text-white shadow-lg') : 'text-slate-400'}`}
                                    >
                                        {trType}
                                    </button>
                                ))}
                            </div>
                            <button type="submit" className="w-full bg-slate-900 text-white rounded-[24px] py-4 font-black uppercase text-[9px] tracking-[0.3em] flex items-center justify-center gap-3 mt-4 active:scale-95 transition-all">
                                {t("Engage Protocol", "پروٹوکول شامل کریں")} <Repeat size={14} />
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
