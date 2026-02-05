import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import ukTranslations from '../locales/uk.json';
import enTranslations from '../locales/en.json';

type Language = 'uk' | 'en';

type TranslationValue = string | { [key: string]: TranslationValue };
type Translations = { [key: string]: TranslationValue };

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string, params?: Record<string, string | number>) => string;
}

const translations: Record<Language, Translations> = {
    uk: ukTranslations,
    en: enTranslations,
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);
// Context for language management

const STORAGE_KEY = 'bookstore_language';

function getNestedValue(obj: Translations, path: string): string {
    const keys = path.split('.');
    let current: TranslationValue = obj;

    for (const key of keys) {
        if (current && typeof current === 'object' && key in current) {
            current = current[key];
        } else {
            return path; // Return key if not found
        }
    }

    return typeof current === 'string' ? current : path;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguageState] = useState<Language>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved === 'uk' || saved === 'en') {
                return saved;
            }
        }
        return 'uk'; // Default to Ukrainian
    });

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, language);
        document.documentElement.lang = language;
    }, [language]);

    const setLanguage = useCallback((lang: Language) => {
        setLanguageState(lang);
    }, []);

    const t = useCallback((key: string, params?: Record<string, string | number>): string => {
        let text = getNestedValue(translations[language], key);
        if (params) {
            Object.entries(params).forEach(([paramKey, paramValue]) => {
                text = text.replace(new RegExp(`{{${paramKey}}}`, 'g'), String(paramValue));
            });
        }
        return text;
    }, [language]);

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
