import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import en, { Translations } from './en';
import ar from './ar';

type Language = 'ar' | 'en';

interface LanguageContextType {
  lang: Language;
  t: Translations;
  setLanguage: (lang: Language) => void;
  isRTL: boolean;
}

const translations: Record<Language, Translations> = { en, ar };

const LanguageContext = createContext<LanguageContextType>({
  lang: 'ar',
  t: ar,
  setLanguage: () => {},
  isRTL: true,
});

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('sweetops-lang');
    return (saved === 'en' || saved === 'ar') ? saved : 'ar';
  });

  const isRTL = lang === 'ar';
  const t = translations[lang];

  const setLanguage = useCallback((newLang: Language) => {
    setLang(newLang);
    localStorage.setItem('sweetops-lang', newLang);
  }, []);

  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang, isRTL]);

  return (
    <LanguageContext.Provider value={{ lang, t, setLanguage, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
