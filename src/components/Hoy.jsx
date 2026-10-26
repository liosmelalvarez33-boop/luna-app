import { useState, useEffect } from 'react'
import {
  subscribe, getState, predictNextPeriod, getDayInfo,
  probabilidadEmbarazo, PETS, MOODS, todayStr
} from '../store'
import { format, differenceInCalendarDays } from 'date-fns'
import { es } from 'date-fns/locale'
import CycleBar from './CycleBar'
import { FaHeart, FaLeaf, FaEgg, FaRegCalendarAlt } from 'react-icons/fa'

/**
 * Página «Hoy»: el estado del ciclo primero, con carita grande,
 * botón para iniciar período, mascota, tarjetas rápidas de fase,
 * barra del ciclo y acceso al registro diario.
 */
export default function Hoy({ onAbrirRegistro, onVerDetalle }) {
  const [state, setState] = useState(getState())
  const [tip, setTip] = useState('')

  useEffect(() => subscribe(setState), [])

  const s = state.settings
  const hoy = format(new Date(), 'yyyy-MM-dd')
  const info = getDayInfo(hoy)
  const pred = predictNextPeriod()

  // Retraso: si ya pasó la fecha prevista y no se marcó inicio
  let retraso = 0
  if (pred && differenceInCalendarDays(new Date(), pred.nextStart) > 0) {
    retraso = differenceInCalendarDays(new Date(), pred.nextStart)
  }

  const pet = PETS.find(p => p.id === s.pet) || PETS[5]
  const logHoy = (state.dailyLogs || []).find(d => d.date === hoy)
  const moodDeHoy = MOODS.find(m => m.id === logHoy?.mood)

  const frases = [
    '💧 Hidrátate bonita', '🧘‍♀️ Un respiro profundo nunca está de más',
    '🥗 Comida colorida suma energía', '😴 Dormir bien equilibra hormonas',
    '💜 Celebra tu cuerpo todos los días', '✨ Cada ciclo, una versión mejor de ti'
  ]
  const fraseDeHoy = frases[new Date(fy(hoy)).getDate() % frases.length]

  const faseVisual = {
    period: { icon: <FaHeart />, color: '#fff', bg: 'linear-gradient(135deg, #ff9ec7, #ff6b9d)' },
    'period-predicted': { icon: <FaHeart />, color: '#fff', bg: 'linear-gradient(135deg, #ffb8d9, #ff9ec7)' },
    fertile: { icon: <FaLeaf />, color: '#fff', bg: 'linear-gradient(135deg, #ffd97a, #ffb54a)' },
    ovulation: { icon: <FaEgg />, color: '#fff', bg: 'linear-gradient(135deg, #ffa94a, #ff8a5c)' },
    luteal: { icon: <FaRegCalendarAlt />, color: '#fff', bg: 'linear-gradient(135deg, #c9b8f5, #9d8fef)' },
    premenstrual: { icon: <FaRegCalendarAlt />, color: '#fff', bg: 'linear-gradient(135deg, #b8a8e8, #9d8fef)' },
    follicular: { icon: <FaLeaf />, color: '#fff', bg: 'linear-gradient(135deg, #a8e8c0, #7ee3a5)' },
    'pre-ovulation': { icon: <FaLeaf />, color: '#fff', bg: 'linear-gradient(135deg, #ffd97a, #ffc94a)' },
    none: { icon: <FaRegCalendarAlt />, color: '#fff', bg: 'linear-gradient(135deg, #c77dff, #9d4edd)' }
  }
  const fv = faseVisual[info.phase] || faseVisual.none

  return (
    <div className="hoy fade-in-stagger">
      {/* ---- Estado grande del ciclo ---- */}
      <div className="hoy-hero">
        <p className="hoy-kicker">{info.phase === 'period' ? 'Período' : 'Tu ciclo'}</p>
        <h1 className="hoy-title">
          {retraso > 0 ? (
            <>{retraso} <small>días de retraso</small></>
          ) : info.phase === 'period' ? (
            <>Día {info.day} <small>de tu período</small></>
          ) : (
            <>Día {info.day} <small>del ciclo</small></>
          )}
        </h1>
        <p className="hoy-sub">
          {retraso > 0
            ? `${pred ? format(pred.nextStart, "d 'de' MMMM", { locale: es }) : ''} — inicio previsto (si ya lo iniciaste, tócalo abajo)`
            : pred
              ? `${format(pred.nextStart, "d 'de' MMMM", { locale: es })} · Próx. período`
              : 'Configura tu primer día en ⚙️ Ajustes'}
        </p>

        <div className="hoy-cta-row">
          <button className="hoy-cta" onClick={() => onAbrirRegistro({ periodo: true })}>
            Inicio del período
          </button>
          <div className="hoy-mascot" title={pet.nombre}>
            <span className="hoy-mascot-emoji">{pet.icon}</span>
            <span className="hoy-mascot-nombre">{pet.nombre}</span>
          </div>
        </div>
      </div>

      {/* ---- Frase del día ---- */}
      <p className="hoy-frase">{fraseDeHoy}</p>

      {/* ---- Tarjetas rápidas de fase ---- */}
      <div className="hoy-fases">
        {pred && [
          { t: 'Próx. período', d: format(pred.nextStart, 'd MMM', { locale: es }), icon: '💧', bg: '#ffe3ef', color: '#d94f7f' },
          { t: 'Próx. fértil', d: format(pred.fertileStart, 'd MMM', { locale: es }), icon: '🌱', bg: '#fff6d8', color: '#c58f2a' },
          { t: 'Ovulación', d: format(pred.ovulation, 'd MMM', { locale: es }), icon: '🥚', bg: '#fff0e0', color: '#d97a4a' },
          { t: 'Fin previsto', d: format(pred.end, 'd MMM', { locale: es }), icon: '🩸', bg: '#ffdede', color: '#c74f6e' }
        ].map((c, i) => (
          <div key={i} className="fase-card" style={{ background: c.bg }}>
            <span className="fase-card-icon" style={{ color: c.color }}>{c.icon}</span>
            <p className="fase-card-fecha">{c.d}</p>
            <p className="fase-card-tipo">{c.t}</p>
          </div>
        ))}
      </div>

      {/* ---- Estado del ciclo con barra ---- */}
      <div className="card hoy-ciclo">
        <h3 className="cyclo-title">
          {format(new Date(), 'd MMM', { locale: es })} · Día {info.day} del ciclo previsto
        </h3>
        <p className="cyclo-sub">
          <span className="cyclo-dot" style={{ background: fv.bg }} />
          {probabilidadEmbarazo(info.phase).nivel} · {probabilidadEmbarazo(info.phase).texto}
        </p>
        <CycleBar
          cycleLength={s.cycleLength}
          periodLength={s.periodLength}
          dia={info.day}
          label={`Día ${info.day}`}
        />
      </div>

      {/* ---- ¿Cómo te sientes hoy? ---- */}
      <div className="card hoy-sientes">
        <h3 className="sientes-title">¿Cómo te sientes hoy?</h3>
        <p className="sientes-sub">Cuéntanos más sobre tu cuerpo para el análisis</p>
        <button className="hoy-cta sientes-btn" onClick={() => onAbrirRegistro({ sintomas: true })}>
          Añadir síntoma
        </button>
        <span className="sientes-emoji">{moodDeHoy ? moodDeHoy.icon : '😌'}</span>
      </div>

      {/* ---- Acceso al registro completo ---- */}
      <button className="btn-ghost" onClick={onVerDetalle}>
        📝 Ver/editar todo mi día
      </button>
    </div>
  )
}

// pequeña utilidad local (evita importar startOfDay)
function fy(dateStr) {
  return new Date(dateStr + 'T00:00:00')
}
