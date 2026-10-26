import { format } from 'date-fns'
import { es } from 'date-fns/locale'

/**
 * Barra de ciclo estilo Flo: segmentos rosa (período) / gris (folicular) /
 * amarillo (fértil con óvulo) / rosita (lútea) / gris (total), con un
 * apuntador "Día N" que señala la posición de hoy o del día consultado.
 *
 * Props:
 *  - cycleLength, periodLength: números (settings)
 *  - dia: día del ciclo a señalar (1..cycleLength)
 *  - label: texto del apuntador (ej. "Día 5")
 *  - compact: versión mini para historial
 */
export default function CycleBar({ cycleLength = 28, periodLength = 5, dia = 0, label, compact = false }) {
  const total = cycleLength
  const pct = (n) => `${(n / total) * 100}%`

  // Ventana fértil: ovulación ≈ total - 14; fértil = ovul-4 .. ovul+1
  const ovulDay = Math.max(10, total - 14)
  const fertStart = Math.max(periodLength + 1, ovulDay - 4)
  const fertEnd = Math.min(total - 6, ovulDay + 1)

  const segPct = (a, b) => `${((b - a) / total) * 100}%`

  const segments = [
    { from: 0, to: periodLength, color: 'var(--cyc-period, #ff5f9e)', radius: '999px 3px 3px 999px' },
    { from: periodLength, to: fertStart, color: 'var(--cyc-gap, rgba(150, 140, 160, 0.35))' },
    { from: fertStart, to: fertEnd, color: 'var(--cyc-fertile, #ffc94a)' },
    { from: fertEnd, to: total - 4, color: 'var(--cyc-luteal, rgba(255, 170, 200, 0.45))' },
    { from: total - 4, to: total, color: 'var(--cyc-gap, rgba(150, 140, 160, 0.35))', radius: '3px 999px 999px 3px' }
  ].filter(s => s.to > s.from)

  const ovulCenter = ovulDay / total

  // Sujetar la burbuja "Día N" para que no se corte en los bordes
  const pctDia = total > 0 ? (dia / total) * 100 : 0
  const shift = pctDia < 12 ? 'translateX(-6%)' : pctDia > 88 ? 'translateX(-94%)' : 'translateX(-88%)'

  return (
    <div className={`cyclebar ${compact ? 'cyclebar--compact' : ''}`}>
      <div className="cyclebar-track">
        {segments.map((s, i) => (
          <div
            key={i}
            className="cyclebar-seg"
            style={{
              left: pct(s.from),
              width: segPct(s.from, Math.min(s.to, total)),
              background: s.color,
              borderRadius: s.radius || '3px'
            }}
          />
        ))}
        {/* Óvulo en el centro de la ventana fértil */}
        <span className="cyclebar-ovul" style={{ left: `calc(${ovulCenter * 100}% - 9px)` }}>
          ⬤
        </span>
        {/* Apuntador del día actual */}
        {dia > 0 && (
          <div className="cyclebar-marker" style={{ left: `calc(${(dia / total) * 100}% )` }}>
            <span className="cyclebar-pin" />
            <span className="cyclebar-bubble" style={{ transform: shift }}>{label || `Día ${dia}`}</span>
          </div>
        )}
      </div>
    </div>
  )
}

/* Barra completa con fecha arriba (para tarjetas "Análisis del ciclo") */
export function CycleBarCard({ ciclo, dia, titulo, subtitulo }) {
  return (
    <div className="card cyclebar-card">
      <h3 className="cyclebar-title">{titulo}</h3>
      {subtitulo && <p className="cyclebar-sub">{subtitulo}</p>}
      <p className="cyclebar-fechas">
        {format(new Date(ciclo.start + 'T00:00:00'), 'd MMM', { locale: es })}
      </p>
      <CycleBar dia={dia} label={`Día ${dia}`} />
    </div>
  )
}
