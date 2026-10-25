import { useState, useEffect } from 'react'
import { loadData, getState, PETS } from './store'
import Header from './components/Header'
import Calendar from './components/Calendar'
import Prediction from './components/Prediction'
import MyDay from './components/MyDay'
import Salud from './components/Salud'
import Settings from './components/Settings'
import { FaCalendarAlt, FaChartLine, FaHeart, FaCog, FaShieldAlt } from 'react-icons/fa'

const SALUDOS = [
  '¡Hola', '¡Buen día', '¡Hey', '¡Qué gusto verte'
]

function App() {
  const [activeView, setActiveView] = useState('calendar')
  const [isLoading, setIsLoading] = useState(true)
  const [tip, setTip] = useState('🌙 Tu cuerpo es sabio, escúchalo')
  const [state, setState] = useState(getState())

  useEffect(() => {
    // Tema persistido: aplicarlo apenas cargue
    document.documentElement.setAttribute('data-theme', state.settings.theme || 'luna')

    const init = async () => {
      const s = await loadData()
      setState(s)
      document.documentElement.setAttribute('data-theme', s.settings.theme || 'luna')
      setIsLoading(false)
    }
    init()

    // Escuchar navegación desde Header (botón Ajustes)
    const onNav = (e) => setActiveView(e.detail)
    window.addEventListener('luna:nav', onNav)
    return () => window.removeEventListener('luna:nav', onNav)
  }, [])

  // Rotar tips
  useEffect(() => {
    const interval = setInterval(() => {
      const tips = [
        '💧 Hidrátate bonita',
        '🧘‍♀️ Un respiro profundo nunca está de más',
        '🥗 La comida colorida suma energía',
        '😴 Dormir bien equilibra hormonas',
        '📝 Registrar agranda tu autoconocimiento',
        '🫖 Té de manzanilla para cólicos',
        '💜 Celebra tu cuerpo todos los días',
        '✨ Cada ciclo, una versión mejor de ti'
      ]
      setTip(tips[Math.floor(Math.random() * tips.length)])
    }, 8000)
    return () => clearInterval(interval)
  }, [])

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-card">
          <div className="loading-logo sticker-float">🌙</div>
          <div className="sticker-row">
            <span className="sticker-float" style={{ animationDelay: '0s' }}>✨</span>
            <span className="sticker-float" style={{ animationDelay: '.3s' }}>💖</span>
            <span className="sticker-float" style={{ animationDelay: '.6s' }}>🌸</span>
          </div>
          <h1 className="loading-title">Luna</h1>
          <p className="text-sm text-text-secondary">Preparando tu rincón seguro...</p>
        </div>
      </div>
    )
  }

  const navItems = [
    { id: 'calendar', icon: <FaCalendarAlt />, label: 'Calendario' },
    { id: 'prediction', icon: <FaChartLine />, label: 'Predicción' },
    { id: 'myday', icon: <FaHeart />, label: 'Mi día' },
    { id: 'salud', icon: <FaShieldAlt />, label: 'Salud' },
    { id: 'settings', icon: <FaCog />, label: 'Ajustes' }
  ]

  const nombre = state.settings.name?.trim()
  const saludo = nombre ? `${SALUDOS[Math.floor(Math.random() * SALUDOS.length)]}, ${nombre} 💜` : 'Tu rincón seguro 💜'

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

        {/* Saludo + tip */}
        <div className="px-4 mb-4">
          <div className="welcome-card slide-up">
            <div className="welcome-sticker sticker-float">
              {(PETS.find(p => p.id === state.settings.pet) || PETS[4]).icon}
            </div>
            <div>
              <p className="welcome-saludo">{saludo}</p>
              <p className="text-sm">{tip}</p>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="px-4 view-switch" key={activeView}>
          {activeView === 'calendar' && <Calendar />}
          {activeView === 'prediction' && <Prediction />}
          {activeView === 'myday' && <MyDay />}
          {activeView === 'salud' && <Salud />}
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
