import { useState, useEffect } from 'react'
import { subscribe, getState, setSettings, PETS } from '../store'
import { FaSun, FaMoon, FaShareAlt, FaCog } from 'react-icons/fa'

export default function Header() {
  const [state, setState] = useState(getState())

  useEffect(() => {
    const unsub = subscribe(setState)
    return unsub
  }, [])

  const toggleTheme = () => {
    const current = state.settings.theme
    const newTheme = (current === 'rosa' || current === 'luna') ? 'medianoche' : 'luna'
    setSettings({ theme: newTheme })
    document.documentElement.setAttribute('data-theme', newTheme)
  }

  const pet = PETS.find(p => p.id === state.settings.pet) || PETS[4]

  return (
    <header className="header">
      <div className="header-inner">
        <div className="header-brand">
          <div className="header-logo sticker-float">{pet.icon}</div>
          <div>
            <h1 className="header-title">Luna</h1>
            <p className="header-subtitle">{pet.frase}</p>
          </div>
        </div>

        <div className="header-actions">
          <button
            onClick={toggleTheme}
            className="btn-icon"
            title="Cambiar tema"
          >
            {['medianoche', 'oceano', 'bosque'].includes(state.settings.theme) ? (
              <FaSun style={{ color: 'var(--warning)' }} />
            ) : (
              <FaMoon style={{ color: 'var(--accent)' }} />
            )}
          </button>
          <button
            className="btn-icon"
            title="Compartir"
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: 'Luna App',
                  text: 'Descubre tu ciclo con la App Luna',
                  url: window.location.href
                })
              } else {
                const tmp = document.createElement('textarea')
                tmp.value = window.location.href
                document.body.appendChild(tmp)
                tmp.select()
                document.execCommand('copy')
                document.body.removeChild(tmp)
                alert('URL copiada a tu portapapeles')
              }
            }}
          >
            <FaShareAlt />
          </button>
          <button
            className="btn-icon"
            title="Ajustes"
            onClick={() => window.dispatchEvent(new CustomEvent('luna:nav', { detail: 'settings' }))}
          >
            <FaCog />
          </button>
        </div>
      </div>
    </header>
  )
}
