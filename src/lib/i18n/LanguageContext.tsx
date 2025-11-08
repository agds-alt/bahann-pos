'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import idTranslations from '@/locales/id.json'
import enTranslations from '@/locales/en.json'

type Language = 'id' | 'en'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

// Static translations map - fixes Turbopack dynamic import issues
const TRANSLATIONS = {
  id: idTranslations,
  en: enTranslations,
} as const

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('id')
  const [translations, setTranslations] = useState<Record<string, string>>(TRANSLATIONS.id)

  // Load language from localStorage on mount
  useEffect(() => {
    const savedLang = localStorage.getItem('language') as Language
    if (savedLang && (savedLang === 'id' || savedLang === 'en')) {
      setLanguageState(savedLang)
    }
  }, [])

  // Update translations when language changes
  useEffect(() => {
    setTranslations(TRANSLATIONS[language])
  }, [language])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem('language', lang)
  }

  const t = (key: string): string => {
    return translations[key] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
