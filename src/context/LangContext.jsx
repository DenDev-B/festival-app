import { createContext, useContext, useState } from 'react'
import { translations, defaultLang } from '../i18n'

const LangContext = createContext()

export function LangProvider({ children }) {
  const [lang, setLang] = useState(defaultLang)
  const t = (key) => translations[lang]?.[key] ?? translations.en[key] ?? key
  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  )
}

export const useLang = () => useContext(LangContext)