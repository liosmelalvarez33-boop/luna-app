import { useState, useEffect } from 'react'
import { subscribe, getState, getStats, predictNextPeriod } from '../store'
import { format, differenceInCalendarDays } from 'date-fns'
import { es } from 'date-fns/locale'
import CycleBar, { } from './CycleBar'
import Prediction from './Prediction'
import { FaWeight, FaThermometerHalf } from 'react-icons/fa'

/**
 * «Análisis»: tarjetas pastel de promedios (estilo Flo) +
 * historial de ciclos en barras + predicciones completas.
 */
export default function Analisis({ onIrSalud }) {
  const [state, setState] = useState(getState())
  useEffect(() => subscribe(setState), [])

  const st = getStats()
  const ciclosOrdenados = [...(state.cycles || [])].sort((a, b) =>
    (b.start || '').localeCompare(a.start || '')
  )
  const ultimos = ciclosOrdenados.slice(0, 3)
  const prof = state.profile
  const ultimaBasal = (state.basal || []).length ? state.basal[state.basal.length - 1] : null

  return (
    <div className="card-content fade-in-stagger">
      <h2 className="section-title centered">Análisis 📊</h2>

      {/* ---- Análisis del ciclo ---- */}
      <div className="card analisis-card">
        <h3 className="ana-title">Análisis del ciclo</h3>
        <p className="ana-sub">Basado en {st.count || 'la configuración'} {st.count === 1 ? 'ciclo registrado' : 'ciclos registrados'}</p>
        <div className="ana-tarjetas">
          <div className="ana-mini" style={{ background: 'linear-gradient(135deg, #ffd9e8, #ffb8d9)' }}>
            <span className="ana-icono">💧</span>
            <p className="ana-num" style={{ color: '#d94f7f' }}>{st.avgPeriod || 5} días</p>
            <p className="ana-lbl">Promedio de período</p>
          </div>
          <div className="ana-mini" style={{ background: 'linear-gradient(135deg, #fdf3d3, #ffe9a8)' }}>
            <span className="ana-icono">🔄</span>
            <p className="ana-num" style={{ color: '#b06a1e' }}>{st.avgCycle || 28} días</p>
            <p className="ana-lbl">Promedio de ciclo</p>
          </div>
        </div>
      </div>

      {/* ---- Historial ---- */}
      {ultimos.length > 0 && (
        <div className="card">
          <h3 className="ana-title">Historial</h3>
          {ultimos.map(c => {
            const diaHoy = Math.min(
              st.avgCycle || 28,
              Math.max(1, differenceInCalendarDays(new Date(), new Date(c.start + 'T00:00:00')) + 1)
            )
            return (
              <div key={c.id} className="hist-row">
                <div className="hist-fechas">
                  <span>{format(new Date(c.start + 'T00:00:00'), 'd MMM', { locale: es })} - {c.length ? format(new Date(new Date(c.start + 'T00:00:00').getTime() + c.length * 86400000), 'd MMM', { locale: es }) : '—'}</span>
                  {c.length && <span className="hist-len">{c.length}</span>}
                </div>
                <CycleBar
                  cycleLength={c.length || st.avgCycle || 28}
                  periodLength={c.periodLength || st.avgPeriod || 5}
                  dia={0}
                  compact
                />
              </div>
            )
          })}
        </div>
      )}

      {/* ---- Datos del cuerpo: accesos rápidos ---- */}
      <div className="card">
        <div className="analisis-fila" onClick={() => onIrSalud('imc')}>
          <span className="ana-icono-lateral" style={{ background: '#efe5ff' }}>⚖️</span>
          <div className="analisis-fila-txt">
            <h4>Peso</h4>
            <p className="ana-big">{prof?.peso ? `${prof.peso} kg` : '-- kg'}</p>
          </div>
          <span className="ana-flecha">›</span>
        </div>
        <div className="analisis-fila" onClick={() => onIrSalud('temp')}>
          <span className="ana-icono-lateral" style={{ background: '#ffe3e3' }}>🌡️</span>
          <div className="analisis-fila-txt">
            <h4>Temperatura</h4>
            <p className="ana-big">{ultimaBasal ? `${ultimaBasal.temp} °C` : '-- °C'}</p>
          </div>
          <span className="ana-flecha">›</span>
        </div>
      </div>

      {/* ---- Predicciones (la vista clásica) ---- */}
      <Prediction />
    </div>
  )
}
