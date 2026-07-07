import { useState, useEffect } from 'react'
import { getReminders, removeReminder } from '../utils/localStorage'
import festivalData from '../data/festival.json'
import { useLang } from '../context/LangContext'
import { requestPermission } from '../utils/notifications'

function fmtTime(iso) {
  const d = new Date(iso)
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${hh}:${mm}`
}

function pickTitle(title, lang) {
  return title[lang] ?? title.en ?? title.cz ?? Object.values(title)[0] ?? ''
}

export default function Reminders() {
  const { lang, t } = useLang()
  const [reminders, setReminders] = useState([])
  const [permGranted, setPermGranted] = useState(Notification?.permission === 'granted')

  useEffect(() => {
    setReminders(getReminders())
  }, [])

  const venueMap = Object.fromEntries(festivalData.venues.map((v) => [v.id, v]))

  function handleRemove(id) {
    removeReminder(id)
    setReminders(getReminders())
  }

  function handleClear() {
    for (const r of reminders) {
      removeReminder(r.performanceId)
    }
    setReminders([])
  }

  return (
    <div className="reminders-screen">
      {!permGranted && (
        <div className="notif-banner">
          <p>{t('notifBanner')}</p>
          <button onClick={async () => {
            const ok = await requestPermission()
            setPermGranted(ok)
          }}>{t('notifAllow')}</button>
        </div>
      )}
      {reminders.length === 0 ? (
        <p className="reminders-empty">{t('noReminders')}</p>
      ) : (
        <>
          {reminders.map((r) => {
        const venue = venueMap[r.venueId]
        return (
          <div key={r.performanceId} className="reminder-item">
            <div className="reminder-info">
              <div className="reminder-title">{pickTitle(r.title, lang)}</div>
              <div className="reminder-meta">
                {venue ? pickTitle(venue.name, lang) : r.venueId} — {fmtTime(r.start)} – {fmtTime(r.end)}
              </div>
            </div>
            <button className="reminder-remove" onClick={() => handleRemove(r.performanceId)}>✕</button>
          </div>
        )
          })}
          <button className="reminders-clear" onClick={handleClear}>{t('clearAll')}</button>
        </>
      )}
    </div>
  )
}
