import { useLang } from '../context/LangContext'

const NAV_ITEMS = [
  { id: 'schedule', icon: '📅', labelKey: 'scheduleTitle' },
  { id: 'map',      icon: '🗺️',  labelKey: 'mapTitle' },
  { id: 'reminders',icon: '🔔', labelKey: 'remindersTitle' },
]

export default function BottomNav({ activeTab, onTabChange }) {
  const { t } = useLang()
  return (
    <nav className="bottom-nav">
      {NAV_ITEMS.map(item => (
        <button
          key={item.id}
          className={`nav-btn ${activeTab === item.id ? 'active' : ''}`}
          onClick={() => onTabChange(item.id)}
        >
          <span className="nav-icon">{item.icon}</span>
          <span className="nav-label">{t(item.labelKey)}</span>
        </button>
      ))}
    </nav>
  )
}