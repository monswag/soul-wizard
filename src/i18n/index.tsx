import { createContext, useContext, useState, type ReactNode } from 'react'
import { ZH } from './zh'
import { EN } from './en'
import { JA } from './ja'
import type { Translation } from './types'

export type Lang = 'zh' | 'en' | 'ja'

const LANGS: Record<Lang, Translation> = { zh: ZH, en: EN, ja: JA }

function detectLang(): Lang {
  // Prefer Telegram user language if available
  const tgLang = (window as any).Telegram?.WebApp?.initDataUnsafe?.user?.language_code ?? ''
  const raw = tgLang || navigator.language || ''
  if (raw.startsWith('zh')) return 'zh'
  if (raw.startsWith('ja')) return 'ja'
  return 'en'
}

interface LangCtx {
  t:       Translation
  lang:    Lang
  setLang: (l: Lang) => void
}

// Default value is ZH so components render correctly without a provider (e.g. in tests)
const LangContext = createContext<LangCtx>({ t: ZH, lang: 'zh', setLang: () => {} })

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(detectLang)
  return (
    <LangContext.Provider value={{ t: LANGS[lang], lang, setLang }}>
      {children}
    </LangContext.Provider>
  )
}

export function useT(): LangCtx {
  return useContext(LangContext)
}
