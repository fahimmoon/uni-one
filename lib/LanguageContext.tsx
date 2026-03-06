"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useStudentStore } from './store';

type Language = 'en' | 'ur';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (en: string, ur: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const { language, setStudentDetails } = useStudentStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const frame = requestAnimationFrame(() => setMounted(true));
        return () => cancelAnimationFrame(frame);
    }, []);

    const setLanguage = (lang: Language) => {
        setStudentDetails({ language: lang });
    };

    const t = (en: string, ur: string) => {
        return language === 'ur' ? ur : en;
    };

    return (
        <LanguageContext.Provider value={{ language: (language as Language) || 'en', setLanguage, t }}>
            {mounted ? (
                <div dir={language === 'ur' ? 'rtl' : 'ltr'} className={language === 'ur' ? 'font-urdu' : ''}>
                    {children}
                </div>
            ) : (
                children
            )}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
