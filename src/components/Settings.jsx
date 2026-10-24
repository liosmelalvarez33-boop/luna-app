import { useState, useEffect } from 'react'
import { subscribe, getState, setSettings } from '../store'
import { FaCog, FaUser, FaCalendarAlt, FaBell, FaMoon, FaSun, FaInfoCircle, FaSave } from 'react-icons/fa'

export default function Settings() {
  const [state, setState] = useState(getState())
  const [name, setName] = useState(state.settings.name || '')
  const [cycleLength, setCycleLength] = useState(state.settings.cycleLength || 28)
  const [periodLength, setPeriodLength] = useState(state.settings.periodLength || 5)
  const [notifications, setNotifications] = useState(state.settings.notifications || true)
  const [theme, setTheme] = useState(state.settings.theme || 'dark')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const unsub = subscribe(setState)
    return unsub
  }, [])

  const saveSettings = () => {
    setSettings({
      name: name.trim(),
      cycleLength: parseInt(cycleLength) || 28,
      periodLength: parseInt(periodLength) || 5,
      notifications,
      theme
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme)
    document.body.classList.toggle('light-mode', newTheme === 'light')
  }

  return (
    <div className="card-content fade-in-stagger">
      <h2 className="section-title">
        <FaCog className="text-accent" />
        Configuración
      </h2>

      {/* Perfil */}
      <div className="card mb-4">
        <h3 className="card-title">
          <FaUser className="text-accent" />
          Perfil
        </h3>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Tu nombre (opcional)"
          className="input"
        />
      </div>

      {/* Ciclo */}
      <div className="card mb-4">
        <h3 className="card-title">
          <FaCalendarAlt className="text-accent" />
          Configuración del ciclo
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-text-secondary mb-2">Longitud del ciclo (días)</label>
            <input
              type="number"
              value={cycleLength}
              onChange={e => setCycleLength(e.target.value)}
              min="21"
              max="35"
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-2">Longitud del período (días)</label>
            <input
              type="number"
              value={periodLength}
              onChange={e => setPeriodLength(e.target.value)}
              min="2"
              max="10"
              className="input"
            />
          </div>
        </div>
      </div>

      {/* Notificaciones */}
      <div className="card mb-4">
        <h3 className="card-title">
          <FaBell className="text-accent" />
          Notificaciones
        </h3>
        <div className="flex items-center justify-between p-3 rounded-xl bg-bg-secondary">
          <span>Recordatorios de período</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={notifications}
              onChange={() => setNotifications(!notifications)}
              className="sr-only peer"
            />
            <div className={`w-12 h-7 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] after:start-[1px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${
              notifications ? 'bg-accent' : 'bg-accent/30'
            }`} />
          </label>
        </div>
        <p className="text-xs text-text-secondary mt-1">
          Recibirás una notificación 2 días antes de tu período estimado
        </p>
      </div>

      {/* Tema */}
      <div className="card mb-4">
        <h3 className="card-title">
          <FaInfoCircle className="text-accent" />
          Tema visual
        </h3>
        <div className="flex gap-3">
          <button
            onClick={() => handleThemeChange('dark')}
            className={`theme-btn ${theme === 'dark' ? 'theme-btn-active' : ''}`}
          >
            <FaMoon className="text-accent mr-2" />
            <span>Oscuro</span>
          </button>
          <button
            onClick={() => handleThemeChange('light')}
            className={`theme-btn ${theme === 'light' ? 'theme-btn-active' : ''}`}
          >
            <FaSun className="text-warning mr-2" />
            <span>Claro</span>
          </button>
        </div>
      </div>

      {/* Acerca de */}
      <div className="card mb-4">
        <h3 className="card-title">
          <FaInfoCircle className="text-accent" />
          Acerca de Luna
        </h3>
        <div className="space-y-2 text-sm text-text-secondary">
          <p>Versión 1.0.0</p>
          <p>Tu seguimiento menstrual privado y bonito</p>
          <p className="pt-2 border-t border-accent/10">
            Los datos se guardan solo en tu dispositivo 🔒
          </p>
        </div>
      </div>

      {/* Guardar */}
      <button
        onClick={saveSettings}
        className="btn-primary w-full"
      >
        <FaSave className="mr-2" />
        {saved ? '✓ Guardado!' : 'Guardar configuración'}
      </button>
    </div>
  )
}