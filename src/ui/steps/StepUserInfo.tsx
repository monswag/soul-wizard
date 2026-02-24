/**
 * Step 1 — 问询
 * Name + timezone. Other profile details (pronouns, background) can be filled
 * in conversation with the agent later.
 */
import { useEffect, useRef, useState } from 'react'
import type { UserProfile } from '../../core/types'
import { CITY_TZ } from '../../core/cityTimezones'
import { useT } from '../../i18n'

interface Props {
  user:    UserProfile
  setUser: (u: UserProfile) => void
  onNext:  () => void
  onPrev:  () => void
}

export function StepUserInfo({ user, setUser, onNext, onPrev }: Props) {
  const { t } = useT()
  const [cityInput,       setCityInput]       = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const nameRef    = useRef<HTMLInputElement>(null)
  const cityRef    = useRef<HTMLInputElement>(null)
  const blurTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!user.timezone) {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
      setUser({ ...user, timezone: tz })
    }
  }, [])

  const suggestions = cityInput.trim()
    ? CITY_TZ.filter(c => c.city.toLowerCase().startsWith(cityInput.toLowerCase())).slice(0, 5)
    : []

  const selectCity = (c: { city: string; tz: string }) => {
    setCityInput(c.city)
    setUser({ ...user, timezone: c.tz })
    setShowSuggestions(false)
  }

  const dismissAndNext = () => {
    nameRef.current?.blur()
    cityRef.current?.blur()
    if (user.name.trim()) onNext()
  }

  const canNext = user.name.trim().length > 0

  return (
    <>
      <h1 className="step-title">{t.userInfo.title}</h1>
      <p className="step-sub">{t.userInfo.subtitle}</p>

      <input
        ref={nameRef}
        type="text"
        className="input-line"
        placeholder={t.userInfo.namePlaceholder}
        autoComplete="off"
        enterKeyHint="done"
        value={user.name}
        onChange={e => {
          setUser({ ...user, name: e.target.value, callMe: e.target.value })
          // Auto-dismiss keyboard after 1.2s of inactivity
          if (blurTimerRef.current) clearTimeout(blurTimerRef.current)
          if (e.target.value.trim()) {
            blurTimerRef.current = setTimeout(() => nameRef.current?.blur(), 1200)
          }
        }}
        onKeyDown={e => {
          if (e.key === 'Enter') {
            ;(e.target as HTMLInputElement).blur()
            if (canNext) onNext()
          }
        }}
        autoFocus
        style={{ marginTop: 8 }}
      />

      <div className="field" style={{ marginTop: 24 }}>
        <label className="field-label">{t.userInfo.timezoneLabel}</label>
        <div className="field-autocomplete">
          <input
            ref={cityRef}
            type="text"
            autoComplete="off"
            className="field-input"
            placeholder={t.userInfo.cityPlaceholder(user.timezone || '…')}
            value={cityInput}
            onChange={e => { setCityInput(e.target.value); setShowSuggestions(true) }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 160)}
            onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur() }}
          />
          {showSuggestions && suggestions.length > 0 && (
            <div className="city-suggestions">
              {suggestions.map(c => (
                <button
                  key={c.city}
                  className="city-suggestion-item"
                  onMouseDown={e => { e.preventDefault(); selectCity(c) }}
                >
                  <span>{c.city}</span>
                  <span className="city-suggestion-tz">{c.tz}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        {cityInput && user.timezone && (
          <span className="field-hint">{user.timezone}</span>
        )}
      </div>

      <div className="nav-row" style={{ marginTop: 'auto' }}>
        <button className="btn-ghost" onClick={onPrev}>{t.userInfo.back}</button>
        <button className="btn-primary" onClick={dismissAndNext} disabled={!canNext}>
          {t.userInfo.next}
        </button>
      </div>
    </>
  )
}
