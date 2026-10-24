import { useState, useEffect } from 'react'
import { loadData, getState, predictNextPeriod } from './store'
import Header from './components/Header'
import Calendar from './components/Calendar'
import Prediction from './components/Prediction'
import Symptoms from './components/Symptoms'
import Settings from './components/Settings'
import { FaCalendarAlt, FaChartLine, FaHeart, FaCog } from 'react-icons/fa'
import { format, differenceInDays } from 'date-fns'
import { es } from 'date-fns/locale'

function App() {
  const [activeView, setActiveView] = useState('calendar')
  const [isLoading, setIsLoading] = useState(true)
  const [tip, setTip] = useState('💧 Mantente hidratada y cuídate')

  useEffect(() => {
    const init = async () => {
      await loadData()
      setIsLoading(false)
    }
    init()

    // Scheduling notifications
    const scheduleNotification = async () => {
      const settings = getState().settings
      const perms = await Notification.requestPermission()
      if (perms === 'granted' && settings.notifications) {
        const prediction = predictNextPeriod()
        if (prediction) {
          const now = new Date()
          const daysUntil = differenceInDays(prediction.nextStart, now)
          if (daysUntil === 2) {
            new Notification('Luna 🌙', {
              body: `Tu período comienza en 2 días (${format(prediction.nextStart, "dd/MM", { locale: es })})`,
              icon: '/favicon.svg'
            })
          }
        }
      }
    }

    // Check immediately and set interval
    scheduleNotification()
    setInterval(scheduleNotification, 3600000) // check every hour

    // Rotar tips
    setInterval(() => {
      const tips = [
        '💧 Mantente hidratada y cuídate',
        '🧘‍♀️ El ejercicio suave ayuda con los síntomas',
        '🥗 Una dieta balanceada regula tu ciclo',
        '😴 Dormir bien es crucial para tu salud hormonal',
        '📝 Registrar tu ciclo ayuda a conocerte mejor',
        '🫖 El té de manzanilla alivia cólicos',
        '💜 Tu cuerpo es sabio, escúchalo'
      ]
      setTip(tips[Math.floor(Math.random() * tips.length)])
    }, 8000)
  }, [])

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div>
          <div className="loading-logo">🌙</div>
          <h1 className="text-xl font-bold mb-2" style={{
            background: 'linear-gradient(135deg, #c77dff, #e0aaff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Luna
          </h1>
          <p className="text-sm text-text-secondary">Cargando tu información...</p>
        </div>
      </div>
    )
  }

  const navItems = [
    { id: 'calendar', icon: <FaCalendarAlt />, label: 'Calendario' },
    { id: 'prediction', icon: <FaChartLine />, label: 'Predicción' },
    { id: 'symptoms', icon: <FaHeart />, label: 'Síntomas' },
    { id: 'settings', icon: <FaCog />, label: 'Ajustes' }
  ]

  return (
    <div className="app-container">
      <Header />

      <div className="app-content">
        {/* Navigation tabs */}
        <div className="nav-tabs">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`nav-tab ${activeView === item.id ? 'nav-tab-active' : ''}`}
            >
              <span className="block mb-1">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>

        {/* Tip del día */}
        <div className="px-4 mb-4">
          <div className="card" style={{
            background: 'linear-gradient(135deg, rgba(199, 125, 255, 0.15), rgba(255, 107, 157, 0.1))',
            border: '1px solid rgba(199, 125, 255, 0.25)',
            padding: '0.75rem 1rem',
            borderRadius: '1rem'
          }}>
            <div className="flex items-center gap-2">
              <span className="float">🌙</span>
              <p className="text-sm" style={{animation: 'fade-in 0.5s ease-out'}}>{tip}</p>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="px-4">
          {activeView === 'calendar' && <Calendar />}
          {activeView === 'prediction' && <Prediction />}
          {activeView === 'symptoms' && <Symptoms />}
          {activeView === 'settings' && <Settings />}
        </div>
      </div>

      {/* Bottom navigation for mobile */}
      <div className="bottom-nav">
        <div className="bottom-nav-inner">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`bottom-nav-item ${activeView === item.id ? 'bottom-nav-item-active' : ''}`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default App