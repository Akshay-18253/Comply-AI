import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { languages, translations } from '../locales/translations';
import { statutoryTranslations } from '../locales/statutoryTranslations';

const LanguageContext = createContext({});

export function LanguageProvider({ children }) {
  const [currentLang, setCurrentLang] = useState(() => {
    return localStorage.getItem('complyai_language') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('complyai_language', currentLang);
  }, [currentLang]);

  const t = (key) => {
    const langDict = translations[currentLang] || translations.en;
    if (langDict && langDict[key]) return langDict[key];
    if (statutoryTranslations[currentLang]?.[key]) return statutoryTranslations[currentLang][key];
    if (translations.en && translations.en[key]) return translations.en[key];
    if (statutoryTranslations.en?.[key]) return statutoryTranslations.en[key];
    return key;
  };

  const translateText = (text) => {
    if (!text || typeof text !== 'string') return text;
    if (currentLang === 'en') return text;

    const trimmed = text.trim();

    // 1. Check in regular translations
    const langDict = translations[currentLang] || {};
    if (langDict[trimmed]) return langDict[trimmed];

    // 2. Check statutory translations
    const statDict = statutoryTranslations[currentLang] || {};
    if (statDict[trimmed]) return statDict[trimmed];

    // 3. Check case-insensitive
    const lower = trimmed.toLowerCase();
    for (const [k, v] of Object.entries(statDict)) {
      if (k.toLowerCase() === lower) return v;
    }

    return text;
  };

  const translateCategory = (cat) => {
    if (!cat) return t('comp_all_categories');
    if (currentLang === 'en') return cat;
    return translateText(cat);
  };

  const value = useMemo(() => ({
    currentLang,
    languages,
    changeLanguage: (code) => {
      if (translations[code] || statutoryTranslations[code]) {
        setCurrentLang(code);
      }
    },
    t,
    translateText,
    translateCategory,
  }), [currentLang]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};

