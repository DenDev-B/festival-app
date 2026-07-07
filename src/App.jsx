import { useState } from 'react'
import './App.css'
import Schedule from './components/Schedule'
import MapView from './components/MapView'
import Reminders from './components/Reminders'
import BottomNav from './components/BottomNav'
import { useLang } from './context/LangContext'
function App() {
  const { lang, setLang, t } = useLang()
  const [activeTab, setActiveTab] = useState('schedule')
  return (
    <div className="app">
      <h1>{t('appTitle')}</h1>
      <div className="lang-switcher">
        {['cz','en','uk'].map(l => (
          <button key={l} className={`lang-btn ${lang===l?'active':''}`} onClick={()=>setLang(l)}>
            {l.toUpperCase()}
          </button>
        ))}
      </div>
      {activeTab === 'schedule' && <Schedule />}
      {activeTab === 'map' && <MapView />}
      {activeTab === 'reminders' && <Reminders />}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}

export default App
