"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home, Calendar, GraduationCap, Wallet, Timer,
  Menu, X, BookOpen, CheckSquare, Bomb, UserCheck,
  Settings, HelpCircle, Bell, Users, Library, BarChart3, User, Sparkles, LayoutGrid
} from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { useLanguage } from '@/lib/LanguageContext';

export default function BottomNav() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { t } = useLanguage();

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    const handleClickOutside = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setShowMore(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      clearTimeout(timer);
    };
  }, []);

  if (!mounted) return null;

  const mainItems = [
    { name: t('Home', 'ہوم'), href: '/', icon: Home, idx: 0 },
    { name: t('Time', 'وقت'), href: '/schedule', icon: Calendar, idx: 1 },
    { name: t('Study', 'پڑھائی'), href: '/study', icon: Timer, idx: 2 },
    { name: t('Money', 'بجٹ'), href: '/budget', icon: Wallet, idx: 3 },
    { name: t('Grades', 'گریڈز'), href: '/grades', icon: GraduationCap, idx: 4 },
  ];

  const activeIdx = mainItems.findIndex(item => pathname === item.href);

  // High-precision math for fluid slider
  // 5 main items + 1 separator (0.4 fractional unit) + 1 hub button
  const totalUnits = 6.4;
  const activePosition = activeIdx !== -1 ? `${(activeIdx / totalUnits) * 100}%` : '0%';
  const unitWidth = `${(1 / totalUnits) * 100}%`;

  const hubCategories = [
    {
      title: t('Academic Hub', 'اکیڈمک ہب'),
      items: [
        { name: t('Courses', 'کورسز'), href: '/courses', icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-50' },
        { name: t('Attend', 'حاضری'), href: '/attendance', icon: UserCheck, color: 'text-emerald-500', bg: 'bg-emerald-50' },
        { name: t('Exams', 'امتحانات'), href: '/exams', icon: Bomb, color: 'text-red-500', bg: 'bg-red-50' },
        { name: t('Notes', 'نوٹس'), href: '/notes', icon: BarChart3, color: 'text-amber-500', bg: 'bg-amber-50' },
      ]
    },
    {
      title: t('Operations', 'آپریشنز'),
      items: [
        { name: t('Todos', 'ٹاسک'), href: '/todo', icon: CheckSquare, color: 'text-indigo-500', bg: 'bg-indigo-50' },
        { name: t('Profile', 'پروفائل'), href: '/profile', icon: User, color: 'text-slate-900', bg: 'bg-slate-100' },
        { name: t('Wealth', 'دولت'), href: '/budget', icon: Wallet, color: 'text-green-600', bg: 'bg-green-50' },
        { name: t('Library', 'لائبریری'), href: '/library', icon: Library, color: 'text-violet-500', bg: 'bg-violet-50' },
      ]
    },
    {
      title: t('Ecosystem', 'ایکو سسٹم'),
      items: [
        { name: t('Club', 'کلب'), href: '/community', icon: Users, color: 'text-pink-500', bg: 'bg-pink-50' },
        { name: t('Settings', 'سیٹنگز'), href: '/settings', icon: Settings, color: 'text-slate-400', bg: 'bg-slate-50' },
        { name: t('Alerts', 'اطلاعات'), href: '/notifications', icon: Bell, color: 'text-amber-600', bg: 'bg-amber-50' },
        { name: t('Help', 'مدد'), href: '/help', icon: HelpCircle, color: 'text-blue-400', bg: 'bg-blue-50' },
      ]
    }
  ];

  return (
    <>
      <div
        className={`fixed inset-0 bg-slate-900/40 backdrop-blur-xl z-[60] transition-opacity duration-700 ${showMore ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setShowMore(false)}
      ></div>

      <div
        ref={menuRef}
        className={`fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg bg-white rounded-t-[64px] z-[70] transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)] shadow-[0_-40px_100px_rgba(0,0,0,0.3)] px-10 pt-10 pb-32 ${showMore ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}
      >
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-10 h-1 bg-slate-100 rounded-full"></div>

        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg">
              <LayoutGrid size={22} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight leading-none uppercase">{t("Academic Hub", "اکیڈمک ہب")}</h3>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1.5">{t("Integrated Services", "انٹیگریٹڈ سروسز")}</p>
            </div>
          </div>
          <button
            onClick={() => setShowMore(false)}
            className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-all hover:rotate-90 active:scale-90"
          >
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>

        <div className="space-y-10 max-h-[60vh] overflow-y-auto no-scrollbar pb-10">
          {hubCategories.map((category, idx) => (
            <div
              key={idx}
              className={`space-y-6 transition-all duration-700 delay-[${idx * 100}ms] ${showMore ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}
            >
              <div className="flex items-center gap-3 px-2">
                <div className="h-px flex-1 bg-slate-100/50"></div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{category.title}</span>
                <div className="h-px flex-1 bg-slate-100/50"></div>
              </div>
              <div className="grid grid-cols-4 gap-y-8 gap-x-4">
                {category.items.map((item, itemIdx) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setShowMore(false)}
                      className="flex flex-col items-center gap-3 group"
                      style={{ transitionDelay: `${(idx * 4 + itemIdx) * 30}ms` }}
                    >
                      <div className={`w-14 h-14 rounded-[26px] transition-all duration-500 relative flex items-center justify-center group-hover:scale-115 group-hover:-translate-y-1 active:scale-90 shadow-sm ${isActive ? 'bg-slate-900 text-white shadow-2xl scale-110' : `${item.bg} ${item.color} group-hover:bg-white group-hover:shadow-2xl border border-transparent group-hover:border-slate-50`}`}>
                        <Icon size={22} strokeWidth={isActive ? 2.5 : 2} className="relative z-10" />
                        {isActive && <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-4 border-white animate-pulse shadow-lg shadow-blue-500/50"></span>}
                        <div className="absolute inset-0 bg-white/40 opacity-0 group-hover:opacity-100 blur-xl transition-opacity"></div>
                      </div>
                      <span className={`text-[8px] font-black uppercase tracking-[0.1em] text-center transition-all duration-300 ${isActive ? 'text-slate-900 scale-105' : 'text-slate-400 group-hover:text-slate-800'}`}>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg bg-white/80 backdrop-blur-3xl border-t border-slate-100 h-24 pb-6 px-4 rounded-t-[54px] shadow-[0_-30px_100px_rgba(0,0,0,0.15)] z-[80] overflow-hidden">
        <div className="absolute top-0 left-0 right-0 py-2 flex justify-center">
          <div className="w-16 h-1 bg-slate-100 rounded-full"></div>
        </div>

        <div className="relative h-full flex items-center">
          {/* FLUID ACTIVE SLIDER */}
          {activeIdx !== -1 && !showMore && (
            <div
              className="absolute h-14 bg-slate-900 rounded-[24px] transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] z-0 shadow-2xl shadow-slate-900/40"
              style={{
                left: activePosition,
                width: unitWidth
              }}
            >
              <div className="absolute top-0 right-0 w-2 h-2 bg-blue-500 rounded-full border-2 border-slate-900 -mr-0.5 -mt-0.5 animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
            </div>
          )}

          <div className="w-full flex items-center justify-between relative z-10">
            {mainItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex flex-col items-center justify-center flex-1 h-14 transition-all duration-500 relative
                    ${isActive ? 'text-white' : 'text-slate-300 hover:text-slate-500'}`}
                >
                  <div className="flex flex-col items-center justify-center">
                    <div className={`p-2 transition-all duration-500 ${isActive ? 'scale-110' : 'hover:scale-110 active:scale-95'}`}>
                      <Icon size={22} strokeWidth={isActive ? 2.5 : 2} className="relative z-10" />
                    </div>
                    <span className={`text-[7px] font-black uppercase tracking-[0.2em] transition-all duration-500 mt-1 ${isActive ? 'opacity-100 text-white' : 'opacity-0 text-slate-400 translate-y-2'}`}>
                      {item.name}
                    </span>
                  </div>
                </Link>
              );
            })}

            <div className="flex items-center justify-center px-2">
              <div className="w-px h-8 bg-slate-100/50"></div>
            </div>

            <button
              ref={buttonRef}
              onClick={() => setShowMore(!showMore)}
              className={`flex flex-col items-center justify-center flex-1 h-14 transition-all duration-500 relative
                ${showMore ? 'text-slate-900' : 'text-slate-300 hover:text-slate-500'}`}
            >
              <div className="flex flex-col items-center justify-center">
                <div className={`p-2 rounded-2xl transition-all duration-500 ${showMore ? 'bg-slate-900 text-white shadow-2xl scale-110 rotate-90' : 'hover:scale-110 active:scale-95'}`}>
                  {showMore ? <X size={22} strokeWidth={2.5} /> : <Menu size={22} strokeWidth={2.5} />}
                </div>
                <span className={`text-[7px] font-black uppercase tracking-[0.2em] transition-all duration-500 mt-1 ${showMore ? 'opacity-100 text-slate-900' : 'opacity-60 text-slate-400'}`}>
                  {t("Hub", "ہب")}
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
