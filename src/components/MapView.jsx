import { useState } from 'react'
import festivalData from '../data/festival.json'
import { useLang } from '../context/LangContext'

const VENUE_DOTS = [
  { id: 'scena-alsak',    label: '1', top: '42%', left: '29%' },
  { id: 'scena-kruhac',   label: '2', top: '61%', left: '73%' },
  { id: 'busking-alsak',  label: '3', top: '62%', left: '12%' },
  { id: 'busking-dvore',  label: '4', top: '24%', left: '17%' },
  { id: 'busking-hlavni5', label: '5', top: '12%', left: '46%' },
  { id: 'busking-hlavni6', label: '6', top: '62%', left: '51%' },
  { id: 'pruvod',          label: '7', top: '60%', left: '48%' },
  { id: 'busking-dukla',  label: '8', top: '42%', left: '67%' },
  { id: 'busking-park',   label: '9', top: '30%', left: '88%' },
]


function fmtTime(d) {
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${hh}:${mm}`
}

function pickTitle(title) {
  return title.en || title.cz || Object.values(title)[0] || ''
}

function MapView() {
  const { lang, t } = useLang()
  const { venues, performances } = festivalData
  const venueMap = Object.fromEntries(venues.map((v) => [v.id, v]))

  const [selectedTime, setSelectedTime] = useState(new Date())
  const [selectedVenueId, setSelectedVenueId] = useState(null)

  const setNow = () => setSelectedTime(new Date())
  const add15 = () => setSelectedTime((prev) => new Date(prev.getTime() + 15 * 60 * 1000))

  const toMinutes = (dateStr) => {
    const d = new Date(dateStr)
    return d.getHours() * 60 + d.getMinutes()
  }

  const selectedMinutes = selectedTime.getHours() * 60 + selectedTime.getMinutes()

  const activeVenueIds = new Set(
    performances
      .filter(p => {
        const start = toMinutes(p.start)
        const end = toMinutes(p.end)
        return start <= selectedMinutes && selectedMinutes < end
      })
      .map(p => p.venueId)
  )

  const activeInVenue = selectedVenueId
    ? performances.filter(p => p.venueId === selectedVenueId && toMinutes(p.start) <= selectedMinutes && toMinutes(p.end) > selectedMinutes)
    : []

  const nextInVenue = selectedVenueId
    ? performances.filter(p => p.venueId === selectedVenueId && toMinutes(p.start) > selectedMinutes).sort((a, b) => toMinutes(a.start) - toMinutes(b.start))[0]
    : null

  const venue = selectedVenueId ? venueMap[selectedVenueId] : null

  return (
    <div className="map-view">
      <div className="map-controls">
        <span className="map-time">{fmtTime(selectedTime)}</span>
        <button onClick={setNow}>{t('now')}</button>
        <button onClick={add15}>{t('plus15')}</button>
        <button onClick={() => { const d = new Date(); d.setHours(15,0,0,0); setSelectedTime(d) }}>▶ 15:00</button>
      </div>
      <div className="map-container" style={{ position: 'relative' }}>
        <img src="/map.png" className="map-img" style={{ width: '100%', display: 'block' }} alt="Map" />
        {VENUE_DOTS.map((dot) => (
          <div
            key={dot.id}
            className={`venue-dot${activeVenueIds.has(dot.id) ? ' active' : ''}`}
            style={{
              position: 'absolute',
              top: dot.top,
              left: dot.left,
              transform: 'translate(-50%,-50%)',
            }}
            onClick={() => setSelectedVenueId(selectedVenueId === dot.id ? null : dot.id)}
          >
            {dot.label}
          </div>
        ))}
      </div>
      {selectedVenueId && (
        <div className="venue-popup">
          <div className="venue-popup-header">
            <span className="venue-popup-name">{venue ? (venue.name[lang] ?? venue.name.en ?? venue.name.cz) : selectedVenueId}</span>
            <button className="venue-popup-close" onClick={() => setSelectedVenueId(null)}>✕</button>
          </div>
          {activeInVenue.length > 0 ? (
            <ul className="venue-popup-list">
              {activeInVenue.map(p => (
                <li key={p.id}>
                  <span className="time">{fmtTime(new Date(p.start))} – {fmtTime(new Date(p.end))}</span>
                  {' — '}{pickTitle(p.title)}
                </li>
              ))}
            </ul>
          ) : nextInVenue ? (
            <p className="venue-popup-next">
              {t('next')} <span className="time">{fmtTime(new Date(nextInVenue.start))}</span> — {pickTitle(nextInVenue.title)}
            </p>
          ) : (
            <p className="venue-popup-empty">{t('noMore')}</p>
          )}
        </div>
      )}
    </div>
  )
}

export default MapView