'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';

export interface Language {
  code: string;
  name: string;
  nativeName: string;
}

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
];

// Translation cache: language -> original -> translated
const translationCache: Record<string, Record<string, string>> = {};

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (text: string) => string;
  isTranslating: boolean;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (text: string) => text,
  isTranslating: false,
});

export const useLanguage = () => useContext(LanguageContext);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState('en');
  const [isTranslating, setIsTranslating] = useState(false);
  const [, forceUpdate] = useState(0);
  const pendingTexts = useRef<Set<string>>(new Set());
  const batchTimer = useRef<NodeJS.Timeout | null>(null);

  // Load saved language from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('tourjet-language');
    if (saved) {
      setLanguageState(saved);
    }
  }, []);

  const translateBatch = useCallback(async (texts: string[], targetLang: string) => {
    if (targetLang === 'en' || texts.length === 0) return;

    // Filter out already cached texts
    const uncached = texts.filter(t => !translationCache[targetLang]?.[t]);
    if (uncached.length === 0) return;

    setIsTranslating(true);
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texts: uncached, targetLanguage: targetLang }),
      });

      if (response.ok) {
        const { translations } = await response.json();
        if (!translationCache[targetLang]) translationCache[targetLang] = {};
        uncached.forEach((text, i) => {
          if (translations[i]) {
            translationCache[targetLang][text] = translations[i];
          }
        });
        forceUpdate(n => n + 1); // trigger re-render with new translations
      }
    } catch (err) {
      console.error('Translation batch error:', err);
    } finally {
      setIsTranslating(false);
    }
  }, []);

  const processPendingBatch = useCallback(() => {
    if (pendingTexts.current.size === 0) return;
    const batch = Array.from(pendingTexts.current);
    pendingTexts.current.clear();
    translateBatch(batch, language);
  }, [language, translateBatch]);

  const setLanguage = useCallback((lang: string) => {
    setLanguageState(lang);
    localStorage.setItem('tourjet-language', lang);

    if (lang === 'en') {
      forceUpdate(n => n + 1);
      return;
    }

    // Collect all visible text nodes and translate them
    // We gather from cache misses
    const allTexts = new Set<string>();
    document.querySelectorAll('[data-t]').forEach(el => {
      const original = el.getAttribute('data-t');
      if (original && !translationCache[lang]?.[original]) {
        allTexts.add(original);
      }
    });

    if (allTexts.size > 0) {
      translateBatch(Array.from(allTexts), lang);
    } else {
      forceUpdate(n => n + 1);
    }
  }, [translateBatch]);

  // The translation function - returns translated text or queues for translation
  const t = useCallback((text: string): string => {
    if (!text || language === 'en') return text;

    // Check cache
    const cached = translationCache[language]?.[text];
    if (cached) return cached;

    // Queue for batch translation
    if (!pendingTexts.current.has(text)) {
      pendingTexts.current.add(text);

      // Debounce batch processing
      if (batchTimer.current) clearTimeout(batchTimer.current);
      batchTimer.current = setTimeout(() => {
        processPendingBatch();
      }, 150);
    }

    return text; // Return original while loading
  }, [language, processPendingBatch]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isTranslating }}>
      {children}
    </LanguageContext.Provider>
  );
}
