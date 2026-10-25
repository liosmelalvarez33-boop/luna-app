import { useState, useEffect } from 'react'
import {
  subscribe, getState, addDailyLog, setSexualMetodo,
  SYMPTOMS, MOODS, SKIN_STATES, HAIR_STATES, EXERCISE_LEVELS, METODOS
} from '../store'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { FaHeart, FaSave, FaTag, FaPlus, FaDove, FaVenus } from 'react-icons/fa'

export default function MyDay() {
  const [state, setState] = useState(getState())
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const unsub = subscribe(setState)
    return unsub
  }, [])

  const today = format(new Date(), 'yyyy-MM-dd')
  const log = state.dailyLogs?.find(d => d.date === today) || {}

  const setLog = (patch) => {
    setSaved(false)
    addDailyLog({ ...log, ...patch })
  }

  const intensity = log.intensity ?? 3
  const sticker = pickSticker(log.mood)

  const saveAndFly = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2200)
  }

  return (
    <div className="card-content fade-in-stagger">
      <h2 className="section-title">
        <FaHeart className="text-danger" />
        Mi día
        {sticker && <span className="sticker-float section-sticker">{sticker}</span>}
      </h2>

      {/* ¿Cómo estás? */}
      <div className="card mb-4 sticker-lane">
        <h3 className="card-subtitle">Estado de ánimo ✨</h3>
        <div className="chip-grid">
          {MOODS.map(m => (
            <button
              key={m.id}
              onClick={() => setLog({ mood: log.mood === m.id ? '' : m.id })}
              className={`chip ${log.mood === m.id ? 'chip-active' : ''}`}
            >
              <span className="chip-icon">{m.icon}</span>
              <span>{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Piel y cabello */}
      <div className="card mb-4">
        <h3 className="card-subtitle">Piel y cabello 💇‍♀️</h3>
        <label className="mini-label">Piel</label>
        <div className="chip-grid mb-3">
          {SKIN_STATES.map(s => (
            <button
              key={s.id}
              onClick={() => setLog({ skin: log.skin === s.id ? '' : s.id })}
              className={`chip ${log.skin === s.id ? 'chip-active' : ''}`}
            >
              <span className="chip-icon">{s.icon}</span>
              <span>{s.label}</span>
            </button>
          ))}
        </div>
        <label className="mini-label">Cabello</label>
        <div className="chip-grid">
          {HAIR_STATES.map(h => (
            <button
              key={h.id}
              onClick={() => setLog({ hair: log.hair === h.id ? '' : h.id })}
              className={`chip ${log.hair === h.id ? 'chip-active' : ''}`}
            >
              <span className="chip-icon">{h.icon}</span>
              <span>{h.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Estilo de vida */}
      <div className="card mb-4">
        <h3 className="card-subtitle">Estilo de vida 🏃‍♀️</h3>
        <label className="mini-label">Ejercicio</label>
        <div className="chip-grid mb-3">
          {EXERCISE_LEVELS.map(e => (
            <button
              key={e.id}
              onClick={() => setLog({ exercise: log.exercise === e.id ? '' : e.id })}
              className={`chip ${log.exercise === e.id ? 'chip-active' : ''}`}
            >
              <span className="chip-icon">{e.icon}</span>
              <span>{e.label}</span>
            </button>
          ))}
        </div>
        <label className="mini-label">ciclo de sueño 🌙 {log.sleepHours ?? 8} h</label>
        <input
          type="range" min="0" max="12" step="1"
          value={log.sleepHours ?? 8}
          onChange={e => setLog({ sleepHours: Number(e.target.value) })}
          className="slider mb-3"
        />
        <label className="mini-label">Agua 💧 {log.water ?? 6} vasos</label>
        <input
          type="range" min="0" max="12" step="1"
          value={log.water ?? 6}
          onChange={e => setLog({ water: Number(e.target.value) })}
          className="slider"
        />
      </div>

      {/* Vida Sexual */}
      <div className="card mb-4">
        <h3 className="card-subtitle">Vida sexual 🌹</h3>
        <div className="flex items-center justify-between p-3 rounded-xl bg-bg-secondary mb-3">
          <span>¿Hubo actividad hoy?</span>
          <button
            onClick={() => setLog({ sexual: !log.sexual })}
            className={`pill-toggle ${log.sexual ? 'pill-active' : ''}`}
          >
            {log.sexual ? 'Sí ✓' : 'No'}
          </button>
        </div>
        <label className="mini-label">Método anticonceptivo</label>
        <div className="chip-grid mb-2">
          {METODOS.map(m => (
            <button
              key={m.id}
              onClick={() => setSexualMetodo(state.sexual.metodo === m.id ? '' : m.id)}
              className={`chip ${state.sexual.metodo === m.id ? 'chip-active' : ''}`}
            >
              <span className="chip-icon">{m.icon}</span>
              <span>{m.label}</span>
            </button>
          ))}
        </div>
        <p className="hint">🔒 Privado; consulta con tu profesional de salud qué opción es la mejor para ti.</p>
      </div>

      {/* Síntomas */}
      <div className="card mb-4">
        <h3 className="card-subtitle">Síntomas 🩹</h3>
        <div className="chip-grid">
          {SYMPTOMS.map(s => {
            const isSel = (log.symptoms || []).includes(s.id)
            return (
              <button
                key={s.id}
                onClick={() => {
                  const set = new Set(log.symptoms || [])
                  isSel ? set.delete(s.id) : set.add(s.id)
                  setLog({ symptoms: [...set] })
                }}
                className={`chip ${isSel ? 'chip-active' : ''}`}
              >
                <span className="chip-icon">{s.icon}</span>
                <span>{s.label}</span>
              </button>
            )
          })}
        </div>
        <label className="mini-label" style={{ marginTop: '.9rem' }}>Intensidad general {intensity}/5</label>
        <input
          type="range" min="1" max="5" step="1"
          value={intensity}
          onChange={e => setLog({ intensity: Number(e.target.value) })}
          className="slider"
        />
      </div>

      {/* Etiquetas */}
      <div className="card mb-4">
        <h3 className="card-subtitle">Etiquetas del día 🏷️</h3>
        <div className="flex flex-wrap gap-2 mb-2">
          {state.tags?.map(t => {
            const isSel = (log.tags || []).includes(t.id)
            return (
              <button
                key={t.id}
                onClick={() => {
                  const set = new Set(log.tags || [])
                  isSel ? set.delete(t.id) : set.add(t.id)
                  setLog({ tags: [...set] })
                }}
                className={`tag-chip ${isSel ? 'tag-chip-active' : ''}`}
                style={{ borderColor: t.color, background: isSel ? `${t.color}33` : '' }}
              >
                <span>{t.emoji}</span>
                <span>{t.label}</span>
              </button>
            )
          })}
          {!(state.tags || []).length && (
            <p className="hint">Crea etiquetas en Ajustes → Etiquetas personalizadas</p>
          )}
        </div>
      </div>

      {/* Notas */}
      <div className="card mb-4">
        <h3 className="card-subtitle">Notas ✍️</h3>
        <textarea
          value={log.notes || ''}
          onChange={e => setLog({ notes: e.target.value })}
          placeholder="¿Algo más de hoy?..."
          className="input"
          rows={3}
          style={{ resize: 'none' }}
        />
      </div>

      <button
        onClick={saveAndFly}
        className="btn-primary w-full mb-2"
      >
        <FaSave className="mr-2" />
        {saved ? '¡Guardado!' : 'Guardar mi día'}
      </button>
      {saved && (
        <div className="save-sticker slide-up">🎉✨💖</div>
      )}
    </div>
  )
}

function pickSticker(mood) {
  if (!mood) return '✨'
  const m = MOODS.find(x => x.id === mood)
  return m ? m.icon : '✨'
}
