import { useState } from 'react'
import festivalData from '../data/festival.json'
import { useLang } from '../context/LangContext'
import { getReminders, saveReminder, removeReminder, hasReminder } from '../utils/localStorage'
import { requestPermission, scheduleNotification, cancelNotification } from '../utils/notifications'

function fmtTime(iso) {
  const d = new Date(iso)
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${hh}:${mm}`
}

function Schedule() {
  const { lang, t } = useLang()
  const pickTitle = (title) => title[lang] ?? title.en ?? title.cz ?? Object.values(title)[0] ?? ''
  const DAYS = [
    { key: '2026-06-26', label: t('dayFriday') },
    { key: '2026-06-27', label: t('daySaturday') },
  ]

  const { venues, performances } = festivalData
  const venueMap = Object.fromEntries(venues.map((v) => [v.id, v]))

  const [activeDay, setActiveDay] = useState('2026-06-26')
  const [activeVenue, setActiveVenue] = useState('all')
  const [activeReminders, setActiveReminders] = useState(() => new Set(getReminders().map(r => r.performanceId)))
  const [selectedMinutes, setSelectedMinutes] = useState(15)
  const [notifIds, setNotifIds] = useState({})

  async function toggleReminder(p) {
    if (activeReminders.has(p.id)) {
      cancelNotification(notifIds[p.id])
      removeReminder(p.id)
      setActiveReminders(prev => { const next = new Set(prev); next.delete(p.id); return next })
      setNotifIds(prev => { const next = { ...prev }; delete next[p.id]; return next })
    } else {
      const reminder = {
        performanceId: p.id,
        venueId: p.venueId,
        title: p.title,
        start: p.start,
        end: p.end,
        remindMinutesBefore: selectedMinutes
      }
      saveReminder(reminder)
      setActiveReminders(prev => new Set([...prev, p.id]))

      const granted = await requestPermission()
      if (granted) {
        const venue = festivalData.venues.find(v => v.id === p.venueId)
        const venueName = venue?.name?.cz || venue?.name?.en || ''
        const timeoutId = scheduleNotification({
          performanceId: p.id,
          title: pickTitle(p.title),
          venueName,
          start: p.start,
          minutesBefore: selectedMinutes
        })
        setNotifIds(prev => ({ ...prev, [p.id]: timeoutId }))
      }
    }
  }

  const filtered = performances.filter((p) => {
    const dayMatch = p.start.startsWith(activeDay)
    const venueMatch = activeVenue === 'all' || p.venueId === activeVenue
    return dayMatch && venueMatch
  })

  const groups = {}
  for (const p of filtered) {
    if (!groups[p.venueId]) groups[p.venueId] = []
    groups[p.venueId].push(p)
  }

  const sortedVenueIds = Object.keys(groups).sort()

  return (
    <div className="schedule">
      <div className="day-filters">
        {DAYS.map((d) => (
          <button
            key={d.key}
            className={'filter-btn' + (activeDay === d.key ? ' active' : '')}
            onClick={() => setActiveDay(d.key)}
          >
            {d.label}
          </button>
        ))}
      </div>

      <div className="remind-settings">
        <span style={{color:'var(--text-secondary)', fontSize:'0.8rem'}}>
          {t('remindBefore')}:
        </span>
        <select
          value={selectedMinutes}
          onChange={e => setSelectedMinutes(Number(e.target.value))}
          className="remind-select"
        >
          <option value={5}>5 мин</option>
          <option value={15}>15 мин</option>
          <option value={30}>30 мин</option>
        </select>
      </div>

      <div className="venue-filters">
        <button
          className={'filter-btn' + (activeVenue === 'all' ? ' active' : '')}
          onClick={() => setActiveVenue('all')}
        >
          {t('allVenues')}
        </button>
        {venues.map((v) => (
          <button
            key={v.id}
            className={'filter-btn' + (activeVenue === v.id ? ' active' : '')}
            onClick={() => setActiveVenue(v.id)}
          >
            {pickTitle(v.name)}
          </button>
        ))}
      </div>

      {sortedVenueIds.map((venueId) => {
        const venue = venueMap[venueId]
        const group = groups[venueId].toSorted(
          (a, b) => new Date(a.start) - new Date(b.start)
        )

        return (
          <div key={venueId}>
            <h2>{venue ? (venue.name[lang] ?? venue.name.en ?? venue.name.cz) : venueId}</h2>
            <ul className="performance-list">
              {group.map((p) => (
                <li key={p.id} className="performance-item">
                  <span className="time">{fmtTime(p.start)} – {fmtTime(p.end)}</span> — {pickTitle(p.title)}
                  <button
                    className={`remind-btn ${activeReminders.has(p.id) ? 'active' : ''}`}
                    onClick={(e) => { e.stopPropagation(); toggleReminder(p) }}
                    title={activeReminders.has(p.id) ? 'Убрать напоминание' : 'Напомнить'}
                  >
                    {activeReminders.has(p.id) ? '🔔' : '🔕'}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )
      })}
    </div>
  )
}

export default Schedule