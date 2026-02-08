import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import i18n from '../i18n';
import { useTranslation } from 'react-i18next';

type Language = 'uk' | 'en';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'bookstore_language';

export function LanguageProvider({ children }: { children: ReactNode }) {
    const { t: i18nT } = useTranslation();
    const [language, setLanguageState] = useState<Language>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved === 'uk' || saved === 'en') {
                return saved as Language;
            }
        }
        return 'uk'; // Default to Ukrainian
    });

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, language);
        document.documentElement.lang = language;
        i18n.changeLanguage(language);
    }, [language]);

    const setLanguage = useCallback((lang: Language) => {
        setLanguageState(lang);
    }, []);

    const t = useCallback((key: string, params?: Record<string, string | number>): string => {
        return i18nT(key, params);
    }, [i18nT]);

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
