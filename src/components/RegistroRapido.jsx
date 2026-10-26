import { useState, useEffect } from 'react'
import {
  subscribe, getState, addDailyLog, setLastPeriodStart, setPeriodEnd,
  SYMPTOMS, MOODS, formatDateStr
} from '../store'
import { format, addDays, differenceInCalendarDays } from 'date-fns'
import { es } from 'date-fns/locale'
import { FaTimes, FaCheck } from 'react-icons/fa'

const SANGRADO = [
  { id: 'poco', icon: '💧', label: 'Poco' },
  { id: 'media', icon: '💧', label: 'Media' },
  { id: 'mucho', icon: '💦', label: 'Mucho' },
  { id: 'inundacion', icon: '🌊', label: 'Inundación' }
]

/**
 * Hoja de registro rápido tipo Flo (botón + del menú):
 * fila de días · Período Inicio/Fin · Sangrado · Notas ·
 * Acto sexual · Síntomas · Ánimo · Guardar.
 */
export default function RegistroRapido({ open, onClose, destaque, onVerDetalle }) {
  const [state, setState] = useState(getState())
  const [fecha, setFecha] = useState(formatDateStr(new Date()))
  const [guardado, setGuardado] = useState(false)

  useEffect(() => subscribe(setState), [])
  useEffect(() => { if (open) setGuardado(false) }, [open])
  useEffect(() => { if (open) setFecha(formatDateStr(new Date())) }, [open])

  if (!open) return null

  const log = (state.dailyLogs || []).find(d => d.date === fecha) || {}
  const guardarLog = (patch) => addDailyLog({ ...log, ...patch, date: fecha })

  const dias = Array.from({ length: 7 }, (_, i) => {
    const f = formatDateStr(addDays(new Date(), i - 6))
    return { date: f, num: new Date(f + 'T00:00:00').getDate(), hoy: f === formatDateStr(new Date()) }
  })

  const esPeriodo = (() => {
    const info = { last: state.settings.lastPeriodStart }
    if (!info.last) return false
    const d = differenceInCalendarDays(new Date(fecha + 'T00:00:00'), new Date(info.last + 'T00:00:00'))
    return d >= 0 && d < state.settings.periodLength
  })()

  const marcarInicio = () => {
    setLastPeriodStart(fecha)
    setGuardado('inicio')
  }

  const marcarFin = () => {
    const ok = setPeriodEnd(fecha)
    setGuardado(ok ? 'fin' : 'fin-error')
  }

  return (
    <div className="registro-overlay">
      <div className="registro-sheet slide-up">
        <div className="registro-head">
          <button className="registro-close" onClick={onClose}><FaTimes /></button>
          <h2 className="registro-title">Hoy {format(new Date(fecha + 'T00:00:00'), '· d MMM', { locale: es })}</h2>
          <button className="registro-ok" onClick={onClose}><FaCheck /></button>
        </div>

        {/* Fila de días */}
        <div className="registro-dias">
          {dias.map(d => (
            <button
              key={d.date}
              onClick={() => setFecha(d.date)}
              className={`dia-bubble ${d.date === fecha ? 'dia-bubble-active' : ''}`}
            >
              {d.num}
            </button>
          ))}
        </div>

        {/* Período */}
        <div className="registro-card">
          <h3 className="rc-title">Período</h3>
          <div className="rc-row">
            <button
              onClick={marcarInicio}
              className={`pill-big pill-inicio ${state.settings.lastPeriodStart === fecha ? 'pill-big-active' : ''}`}
            >
              ▶ Inicio
            </button>
            <button
              onClick={marcarFin}
              className={`pill-big pill-fin ${esPeriodo && state.settings.periodLength > 1 ? '' : ''}`}
            >
              ■ Fin
            </button>
          </div>
          {guardado === 'inicio' && <p className="rc-ok">✓ Período iniciado en el {format(new Date(fecha + 'T00:00:00'), 'd MMM', { locale: es })}</p>}
          {guardado === 'fin' && <p className="rc-ok">✓ Fin del período guardado</p>}
          {guardado === 'fin-error' && <p className="rc-err">El fin debe ser después del inicio (máx. 20 días)</p>}
        </div>

        {/* Sangrado */}
        <div className="registro-card">
          <h3 className="rc-title">Sangrado</h3>
          <div className="rc-chips">
            {SANGRADO.map(s => (
              <button
                key={s.id}
                onClick={() => guardarLog({ sangrado: log.sangrado === s.id ? '' : s.id })}
                className={`chip china ${log.sangrado === s.id ? 'chip-active' : ''}`}
              >
                <span className="chip-icon">{s.icon}</span>{s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Notas */}
        <div className="registro-card">
          <h3 className="rc-title">Notas</h3>
          <input
            className="input rc-nota"
            placeholder="✏️ Escribe algo..."
            value={log.notes || ''}
            onChange={e => guardarLog({ notes: e.target.value })}
          />
        </div>

        {/* Acto sexual */}
        <div className="registro-card">
          <h3 className="rc-title">Acto sexual</h3>
          <div className="rc-burbujas">
            <button
              onClick={() => guardarLog({ sexual: false, proteccion: false })}
              className={`burbuja ${log.sexual === false ? 'burbuja-active' : ''}`}
            >
              <span className="burbuja-icon">🚫</span>
              <span>No tuvo</span>
            </button>
            <button
              onClick={() => guardarLog({ sexual: true, proteccion: false })}
              className={`burbuja ${log.sexual === true && log.proteccion === false ? 'burbuja-active' : ''}`}
            >
              <span className="burbuja-icon">💗</span>
              <span>Sí, sin protección</span>
            </button>
            <button
              onClick={() => guardarLog({ sexual: true, proteccion: true })}
              className={`burbuja ${log.sexual === true && log.proteccion === true ? 'burbuja-active' : ''}`}
            >
              <span className="burbuja-icon">🛡️</span>
              <span>Con protección</span>
            </button>
          </div>
          <p className="hint">🔒 privado: ideas con tu profesional de salud</p>
        </div>

        {/* Síntomas */}
        <div className="registro-card">
          <h3 className="rc-title">Síntomas</h3>
          <div className="rc-chips">
            {SYMPTOMS.map(s => {
              const sel = (log.symptoms || []).includes(s.id)
              return (
                <button
                  key={s.id}
                  onClick={() => {
                    const set = new Set(log.symptoms || [])
                    sel ? set.delete(s.id) : set.add(s.id)
                    guardarLog({ symptoms: [...set] })
                  }}
                  className={`chip china ${sel ? 'chip-active' : ''}`}
                >
                  <span className="chip-icon">{s.icon}</span>{s.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Ánimo */}
        <div className="registro-card">
          <h3 className="rc-title">¿Ánimo de hoy?</h3>
          <div className="rc-chips">
            {MOODS.map(m => (
              <button
                key={m.id}
                onClick={() => guardarLog({ mood: log.mood === m.id ? '' : m.id })}
                className={`chip china ${log.mood === m.id ? 'chip-active' : ''}`}
              >
                <span className="chip-icon">{m.icon}</span>{m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Guardar + ver todo */}
        <button className="btn-primary rc-save" onClick={() => { setGuardado('todo'); setTimeout(onClose, 700) }}>
          ✓ Guardar registro del {format(new Date(fecha + 'T00:00:00'), 'd MMM', { locale: es })}
        </button>
        <button className="btn-ghost" onClick={onVerDetalle}>
          Registrar todo mi día (piel, ejercicio...) →
        </button>
      </div>
    </div>
  )
}
