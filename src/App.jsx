import { useState, useEffect } from 'react'
import { loadData, getState, subscribe, PETS } from './store'
import Header from './components/Header'
import AmbientOverlay from './components/AmbientOverlay'
import Hoy from './components/Hoy'
import Calendar from './components/Calendar'
import Prediction from './components/Prediction'
import RegistroRapido from './components/RegistroRapido'
import MyDay from './components/MyDay'
import Autocuidado from './components/Autocuidado'
import Analisis from './components/Analisis'
import Settings from './components/Settings'
import { FaCalendarAlt, FaChartLine, FaHeart, FaCog, FaShieldAlt, FaPlus } from 'react-icons/fa'

function App() {
  const [activeView, setActiveView] = useState('hoy')
  const [isLoading, setIsLoading] = useState(true)
  const [registroOpen, setRegistroOpen] = useState(false)
  const [saludFoco, setSaludFoco] = useState()
  const [state, setState] = useState(getState())

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', state.settings.theme || 'luna')

    const init = async () => {
      const s = await loadData()
      setState(s)
      document.documentElement.setAttribute('data-theme', s.settings.theme || 'luna')
      setIsLoading(false)
    }
    init()

    const onNav = (e) => setActiveView(e.detail)
    window.addEventListener('luna:nav', onNav)

    // foco de sección de salud desde Análisis (peso/temperatura)
    const onSalud = (e) => { setSaludFoco(e.detail); setActiveView('autocuidado') }
    window.addEventListener('luna:salud', onSalud)

    // suscripción: reaccionar a cambios (temas, mascotas, datos)
    const unsub = subscribe(setState)

    return () => {
      window.removeEventListener('luna:nav', onNav)
      window.removeEventListener('luna:salud', onSalud)
      unsub()
    }
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
    { id: 'hoy', icon: <FaHeart />, label: 'Hoy' },
    { id: 'calendar', icon: <FaCalendarAlt />, label: 'Calendario' },
    { id: 'autocuidado', icon: <FaShieldAlt />, label: 'Autocuidado' },
    { id: 'analisis', icon: <FaChartLine />, label: 'Análisis' }
  ]

  const abrirRegistro = (opts) => setRegistroOpen(true)
  const irDetalle = () => setActiveView('myday')
  const irSaludSeccion = (seccion) => {
    setSaludFoco(seccion)
    setActiveView('autocuidado')
  }

  return (
    <div className="app-container">
      <Header />

      <div className="app-content">
        {/* Main content */}
        <div className="px-4 view-switch" key={activeView}>
          {activeView === 'hoy' && <Hoy onAbrirRegistro={abrirRegistro} onVerDetalle={irDetalle} />}
          {activeView === 'calendar' && <Calendar />}
          {activeView === 'autocuidado' && <Autocuidado foco={saludFoco} />}
          {activeView === 'analisis' && <Analisis onIrSalud={irSaludSeccion} />}
          {activeView === 'myday' && <MyDay />}
          {activeView === 'settings' && <Settings />}
        </div>
      </div>

      {/* Bottom navigation: Hoy · Calendario · (+) · Autocuidado · Análisis */}
      <div className="bottom-nav">
        <div className="bottom-nav-inner">
          <button
            onClick={() => setActiveView('hoy')}
            className={`bottom-nav-item ${activeView === 'hoy' ? 'bottom-nav-item-active' : ''}`}
          >
            <span>{navItems[0].icon}</span>
            <span>{navItems[0].label}</span>
          </button>
          <button
            onClick={() => setActiveView('calendar')}
            className={`bottom-nav-item ${activeView === 'calendar' ? 'bottom-nav-item-active' : ''}`}
          >
            <span>{navItems[1].icon}</span>
            <span>{navItems[1].label}</span>
          </button>

          <button className="nav-fab" onClick={() => setRegistroOpen(true)} aria-label="Registro rápido">
            <FaPlus />
          </button>

          <button
            onClick={() => setActiveView('autocuidado')}
            className={`bottom-nav-item ${activeView === 'autocuidado' ? 'bottom-nav-item-active' : ''}`}
          >
            <span>{navItems[2].icon}</span>
            <span>{navItems[2].label}</span>
          </button>
          <button
            onClick={() => setActiveView('analisis')}
            className={`bottom-nav-item ${activeView === 'analisis' ? 'bottom-nav-item-active' : ''}`}
          >
            <span>{navItems[3].icon}</span>
            <span>{navItems[3].label}</span>
          </button>
        </div>
      </div>

      {/* Hoja de registro rápido (botón +) */}
      <RegistroRapido
        open={registroOpen}
        onClose={() => setRegistroOpen(false)}
        onVerDetalle={irDetalle}
      />

      {/* Ambiente visual según el tema (pétalos, destellos, hojas...) */}
      <AmbientOverlay theme={state.settings.theme} />
    </div>
  )
}

export default App
