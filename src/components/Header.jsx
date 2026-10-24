import { useState, useEffect } from 'react'
import { subscribe, getState, setSettings } from '../store'
import { FaSun, FaMoon, FaCog, FaShareAlt } from 'react-icons/fa'

export default function Header() {
  const [state, setState] = useState(getState())

  useEffect(() => {
    const unsub = subscribe(setState)
    return unsub
  }, [])

  const toggleTheme = () => {
    const newTheme = state.settings.theme === 'dark' ? 'light' : 'dark'
    setSettings({ theme: newTheme })
    document.body.classList.toggle('light-mode', newTheme === 'light')
  }

  return (
    <header className="header">
      <div className="header-inner">
        <div className="header-brand">
          <div className="header-logo">🌙</div>
          <div>
            <h1 className="header-title">Luna</h1>
            <p className="header-subtitle">Tu ciclo, en tus manos</p>
          </div>
        </div>

        <div className="header-actions">
          <button
            onClick={toggleTheme}
            className="btn-icon"
            title="Cambiar tema"
          >
            {state.settings.theme === 'dark' ? (
              <FaSun style={{ color: 'var(--warning)' }} />
            ) : (
              <FaMoon style={{ color: 'var(--accent)' }} />
            )}
          </button>
          <button
            onClick={() => window.location.hash = 'settings'}
            className="btn-icon"
            title="Ajustes"
          >
            <FaCog />
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
        </div>
      </div>
    </header>
  )
}