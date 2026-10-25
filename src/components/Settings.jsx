import { useState, useEffect } from 'react'
import {
  subscribe, getState, setSettings, addTag, removeTag,
  PETS, THEMES, exportBackup, importBackup
} from '../store'
import { FaCog, FaUser, FaCalendarAlt, FaBell, FaPalette, FaTag, FaEnvelope, FaDownload, FaUpload, FaSave, FaPlus, FaTrash, FaHeart } from 'react-icons/fa'

const TAG_COLORS = ['#c77dff', '#ff6b9d', '#9d8fef', '#7ee3a5', '#ffd93d', '#4dd0e1', '#ffb347', '#7c9cff']
const TAG_EMOJIS = ['🏷️', '💪', '🌿', '💫', '🏃', '📚', '💼', '🎉', '😌', '🥗', '🛌', '✈️']

export default function Settings() {
  const [state, setState] = useState(getState())
  const [saved, setSaved] = useState(false)
  const [nuevaEtiqueta, setNuevaEtiqueta] = useState({ emoji: '🏷️', label: '', color: TAG_COLORS[0] })
  const [codigo, setCodigo] = useState('')
  const [email, setEmail] = useState('')
  const [estadoRespaldo, setEstadoRespaldo] = useState('')

  useEffect(() => {
    const unsub = subscribe(setState)
    return unsub
  }, [])

  const s = state.settings

  const guardarAjustes = () => {
    setSettings({
      name: state.settings.name?.trim?.() ?? state.settings.name,
      email: state.settings.email?.trim?.() ?? state.settings.email,
      cycleLength: parseInt(state.settings.cycleLength) || 28,
      periodLength: parseInt(state.settings.periodLength) || 5,
      notifications: s.notifications
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const cambiarTema = (theme) => {
    setSettings({ theme })
    document.documentElement.setAttribute('data-theme', theme)
  }

  const cambiarMascota = (pet) => setSettings({ pet })
  const notificar = () => setSettings({ notifications: !s.notifications })

  /* Etiquetas */
  const crearEtiqueta = () => {
    if (!nuevaEtiqueta.label.trim()) return
    addTag({ ...nuevaEtiqueta, label: nuevaEtiqueta.label.trim() })
    setNuevaEtiqueta({ emoji: '🏷️', label: '', color: TAG_COLORS[0] })
  }

  /* Respaldo */
  const generarCodigo = () => {
    const data = exportBackup()
    const code = btoa(unescape(encodeURIComponent(data)))
    setCodigo(code)
    setEstadoRespaldo('Código generado ✓ cópialo y guárdalo (o envíatelo por correo)')
  }

  const enviarPorCorreo = () => {
    const cuerpo = encodeURIComponent(
      `Guarda este código de respaldo de Luna:\n\n${codigo}\n\nPara restaurarlo: Ajustes → Cuenta → Restaurar con código.`
    )
    window.location.href = `mailto:?subject=Respaldo%20Luna%20🌙&body=${cuerpo}`
  }

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(codigo)
      setEstadoRespaldo('¡Código copiado al portapapeles! 📋')
    } catch {
      setEstadoRespaldo('Selecciona y copia manualmente')
    }
  }

  const restaurar = () => {
    if (!codigo.trim()) return
    const ok = importBackup(decodeURIComponent(escape(atob(codigo.trim()))))
    setEstadoRespaldo(ok ? '✓ ¡Cuenta restaurada! Tus datos volvieron 💜' : '❌ El código no es válido')
  }

  const T = null

  return (
    <div className="card-content fade-in-stagger">
      <h2 className="section-title">
        <FaCog className="text-accent" />
        Ajustes
      </h2>

      {/* Perfil */}
      <div className="card mb-4">
        <h3 className="card-title"><FaUser className="text-accent" /> Perfil</h3>
        <input
          className="input mb-2"
          value={state.settings.name || ''}
          onChange={e => setSettings({ name: e.target.value })}
          placeholder="Tu nombre"
        />
        <input
          className="input"
          type="email"
          value={state.settings.email || ''}
          onChange={e => setSettings({ email: e.target.value })}
          placeholder="tu@correo.com (para respaldos)"
        />
      </div>

      {/* Ciclo */}
      <div className="card mb-4">
        <h3 className="card-title"><FaCalendarAlt className="text-accent" /> Ciclo</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mini-label">Duración del ciclo (días)</label>
            <input
              type="number" min="21" max="40"
              className="input"
              value={state.settings.cycleLength ?? 28}
              onChange={e => setSettings({ cycleLength: Number(e.target.value) || 28 })}
            />
          </div>
          <div>
            <label className="mini-label">Duración del período (días)</label>
            <input
              type="number" min="1" max="12"
              className="input"
              value={state.settings.periodLength ?? 5}
              onChange={e => setSettings({ periodLength: Number(e.target.value) || 5 })}
            />
          </div>
        </div>
      </div>

      {/* Temas */}
      <div className="card mb-4 theme-lane">
        <h3 className="card-title"><FaPalette className="text-accent" /> Temas ✨</h3>
        <div className="chip-grid">
          {THEMES.map(t => (
            <button
              key={t.id}
              onClick={() => cambiarTema(t.id)}
              className={`chip ${state.settings.theme === t.id ? 'chip-active' : ''}`}
            >
              <span className="chip-icon sticker-float">{t.emoji}</span>
              <span>{t.nombre}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Mascota */}
      <div className="card mb-4 pet-lane">
        <h3 className="card-title"><FaPalette className="text-accent" /> Tu mascota 🐾</h3>
        <div className="chip-grid">
          {PETS.map(p => (
            <button
              key={p.id}
              onClick={() => cambiarMascota(p.id)}
              className={`chip ${state.settings.pet === p.id ? 'chip-active' : ''}`}
            >
              <span className="chip-icon sticker-float">{p.icon}</span>
              <span>{p.nombre}</span>
            </button>
          ))}
        </div>
        <p className="hint text-center mt-2">
          Tu mascota te acompañará en toda la app 💜
        </p>
      </div>

      {/* Etiquetas personalizadas */}
      <div className="card mb-4">
        <h3 className="card-title"><FaTag className="text-accent" /> Etiquetas personalizadas</h3>
        <div className="flex flex-wrap gap-2 mb-3">
          {state.tags?.map(t => (
            <span
              key={t.id}
              className="tag-chip"
              style={{ borderColor: t.color, background: `${t.color}22` }}
            >
              <span>{t.emoji}</span>
              <span>{t.label}</span>
              <button
                onClick={() => removeTag(t.id)}
                className="tag-remove"
                title="Eliminar"
              >
                ✕
              </button>
            </span>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mini-label">Nombre de etiqueta</label>
            <input
              className="input"
              value={nuevaEtiqueta.label}
              onChange={e => setNuevaEtiqueta(n => ({ ...n, label: e.target.value }))}
              placeholder="Ej: Gym, cuanto..."
            />
          </div>
          <div>
            <label className="mini-label">Icono</label>
            <div className="chip-inline-grid">
              {TAG_EMOJIS.map(e => (
                <button
                  key={e}
                  onClick={() => setNuevaEtiqueta(n => ({ ...n, emoji: e }))}
                  className={`chip-inline ${nuevaEtiqueta.emoji === e ? 'chip-active' : ''}`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-2 mb-3 mt-3">
          {TAG_COLORS.map(c => (
            <button
              key={c}
              onClick={() => setNuevaEtiqueta(n => ({ ...n, color: c }))}
              className={`color-dot ${nuevaEtiqueta.color === c ? 'color-dot-active' : ''}`}
              style={{ background: c }}
            />
          ))}
        </div>
        <button onClick={crearEtiqueta} className="btn-primary w-full">
          <FaPlus className="mr-2" /> Crear etiqueta
        </button>
      </div>

      {/* Notificaciones */}
      <div className="card mb-4">
        <h3 className="card-title"><FaBell className="text-accent" /> Recordatorios</h3>
        <div className="flex items-center justify-between p-3 rounded-xl bg-bg-secondary">
          <span>Avisos 2 días antes</span>
          <button onClick={notificar} className={`pill-toggle ${s.notifications ? 'pill-active' : ''}`}>
            {s.notifications ? 'Activado ✓' : 'Desactivado'}
          </button>
        </div>
      </div>

      {/* Cuenta & respaldo */}
      <div className="card mb-4">
        <h3 className="card-title"><FaEnvelope className="text-accent" /> Cuenta & respaldo</h3>
        <p className="hint mb-3">
          Tus datos viven en este dispositivo. Crea un código de respaldo y guárdalo (o envíatelo a tu correo). Con ese código recuperas todo en otro teléfono.
        </p>
        <div className="flex gap-2 mb-2">
          <button onClick={generarCodigo} className="btn-primary flex-1">
            <FaDownload className="mr-2" /> Generar código
          </button>
          <button onClick={enviarPorCorreo} className="btn-primary" style={{ background: 'linear-gradient(135deg, #9d8fef, #b19cd9)' }}>
            ✉️ Correo
          </button>
        </div>
        {codigo && (
          <>
            <textarea
              className="input mono mb-2"
              rows={4}
              value={codigo}
              readOnly
              placeholder="Tu código aparecerá aquí..."
            />
            <div className="flex gap-2 mb-2">
              <button onClick={copiar} className="btn-primary flex-1" style={{ background: 'linear-gradient(135deg, #7ee3a5, #9fe8bc)' }}>
                📋 Copiar
              </button>
              <button onClick={restaurar} className="btn-primary flex-1" style={{ background: 'linear-gradient(135deg, #ffb347, #ffcf9e)' }}>
                <FaUpload className="mr-2" /> Restaurar
              </button>
            </div>
          </>
        )}
        {estadoRespaldo && <p className="text-xs text-accent mt-1 text-center">{estadoRespaldo}</p>}
      </div>

      {/* Guardar */}
      <button onClick={guardarAjustes} className="btn-primary w-full mb-2">
        <FaSave className="mr-2" />
        {saved ? '✓ Guardado!' : 'Guardar configuración'}
      </button>

      {/* Acerca */}
      <div className="card">
        <h3 className="card-title"><FaHeart className="text-danger" /> Acerca de Luna</h3>
        <div className="space-y-1 text-sm text-text-secondary">
          <p>Versión 2.0 — Tu ciclo, bonito y privado 🔒</p>
          <p>Made with love & un poco de morado.</p>
        </div>
      </div>
    </div>
  )
}
