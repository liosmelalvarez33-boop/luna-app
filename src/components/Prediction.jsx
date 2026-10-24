import { useState, useEffect } from 'react'
import { format, differenceInDays } from 'date-fns'
import { es } from 'date-fns/locale'
import { predictNextPeriod, getState, getPhaseTip } from '../store'
import { FaChartLine, FaHeart, FaThermometerHalf } from 'react-icons/fa'

export default function Prediction() {
  const [state, setState] = useState(getState())
  const prediction = predictNextPeriod()

  useEffect(() => {
    const unsub = subscribe(setState)
    return unsub
  }, [])

  if (!prediction || !state.settings.lastPeriodStart) {
    return (
      <div className="card-content">
        <div className="card" style={{padding: '3rem 1.5rem', textAlign: 'center'}}>
          <div className="float" style={{fontSize: '3rem', marginBottom: '1rem'}}>🌙</div>
          <h3 className="text-lg font-semibold mb-2">Aún no tienes un ciclo registrado</h3>
          <p className="text-sm text-text-secondary mb-4">
            Ve al calendario y marca tu primer día para ver predicciones personalizadas
          </p>
          <div className="card" style={{
            background: 'linear-gradient(135deg, rgba(199, 125, 255, 0.1), rgba(255, 107, 157, 0.05))',
            padding: '1rem',
            borderRadius: '0.75rem'
          }}>
            <p className="text-sm">💡 Las predicciones mejoran con cada ciclo que registras</p>
          </div>
        </div>
      </div>
    )
  }

  const today = new Date()
  const daysUntilPeriod = differenceInDays(prediction.nextStart, today)
  const daysUntilFertile = differenceInDays(prediction.fertileStart, today)
  const daysUntilOvulation = differenceInDays(prediction.ovulation, today)

  const cyclePhases = [
    { day: 1, end: state.settings.periodLength, label: 'Período', icon: '🩸', color: '#ff6b9d' },
    { day: state.settings.periodLength + 1, end: 13, label: 'Folicular', icon: '🌱', color: '#9d8fef' },
    { day: 14, end: 16, label: 'Ovulación', icon: '🌙', color: '#c77dff' },
    { day: 17, end: state.settings.cycleLength, label: 'Lútea', icon: '🌓', color: '#b19cd9' }
  ]

  return (
    <div className="card-content fade-in-stagger">
      <h2 className="section-title">
        <FaChartLine className="text-accent" />
        Próximos ciclos
      </h2>

      {/* Prediction card */}
      <div className="card mb-4">
        <div className="text-center mb-4" style={{position: 'relative'}}>
          <div className="float" style={{fontSize: '2rem', marginBottom: '0.5rem'}}>🌙</div>
          <p className="text-sm text-text-secondary">Tu próximo período</p>
          <p className="text-2xl font-bold mt-1 mb-2">
            {format(prediction.nextStart, "dd 'de' MMMM", { locale: es })}
          </p>
          <p className={`text-lg font-semibold ${daysUntilPeriod > 0 ? 'text-warning' : 'text-danger'}`}>
            {daysUntilPeriod > 0
              ? `Faltan ${daysUntilPeriod} días`
              : daysUntilPeriod === 0
                ? '¡Es hoy!'
                : `Hace ${Math.abs(daysUntilPeriod)} días`}
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-accent/10">
            <span className="flex items-center gap-2">
              <span className="text-lg">✨</span>
              Ventana fértil
            </span>
            <span className="text-accent font-medium">
              {format(prediction.fertileStart, "dd/MM", { locale: es })} - {format(prediction.fertileEnd, "dd/MM", { locale: es })}
            </span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-accent/10">
            <span className="flex items-center gap-2">
              <span className="text-lg">🌙</span>
              Ovulación
            </span>
            <span className="text-accent font-medium">
              {format(prediction.ovulation, "dd 'de' MMMM", { locale: es })}
            </span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="flex items-center gap-2">
              <span className="text-lg">🩸</span>
              Duración estimada
            </span>
            <span className="text-text-secondary">
              {state.settings.periodLength} días
            </span>
          </div>
        </div>
      </div>

      {/* Ciclo visual */}
      <div className="card mb-4">
        <h3 className="card-subtitle">Tu ciclo típico ({state.settings.cycleLength} días)</h3>
        <div className="space-y-3">
          {cyclePhases.map((phase, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-xl" style={{animation: `float ${2 + i * 0.3}s ease-in-out infinite`, animationDelay: `${i * 0.2}s`}}>{phase.icon}</span>
              <div className="flex-1">
                <div className="progress-bar relative overflow-hidden">
                  <div
                    className="progress-bar-fill absolute top-0 left-0 h-full rounded-full"
                    style={{
                      background: `linear-gradient(90deg, ${phase.color}, ${phase.color}88)`,
                      width: `${(phase.end - phase.day + 1) / state.settings.cycleLength * 100}%`,
                      left: `${(phase.day - 1) / state.settings.cycleLength * 100}%`
                    }}
                  />
                </div>
              </div>
              <span className="text-xs text-muted" style={{width: '5rem', textAlign: 'right'}}>{phase.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Consejos */}
      <div className="card">
        <h3 className="card-subtitle">
          <FaThermometerHalf className="text-warning mr-2" />
          Consejitos del día
        </h3>
        <div className="space-y-2 text-sm">
          {daysUntilPeriod <= 3 && daysUntilPeriod >= 0 && (
            <div className="card" style={{
              background: 'linear-gradient(135deg, rgba(255, 107, 157, 0.15), rgba(255, 107, 157, 0.05))',
              border: '1px solid rgba(255, 107, 157, 0.3)',
              padding: '0.75rem',
              borderRadius: '0.75rem'
            }}>
              <p className="flex items-start gap-2">
                <span>💡</span>
                <span>Tu período está cerca. Considera llevar productos de higiene menstrual contigo.</span>
              </p>
            </div>
          )}
          {daysUntilFertile > 0 && daysUntilFertile <= 5 && (
            <div className="card" style={{
              background: 'linear-gradient(135deg, rgba(157, 143, 239, 0.15), rgba(157, 143, 239, 0.05))',
              border: '1px solid rgba(157, 143, 239, 0.3)',
              padding: '0.75rem',
              borderRadius: '0.75rem'
            }}>
              <p className="flex items-start gap-2">
                <span>💡</span>
                <span>Tu ventana fértil está próxima. Si estás buscando concebir, esta es una buena oportunidad.</span>
              </p>
            </div>
          )}
          <div className="card" style={{
            background: 'linear-gradient(135deg, rgba(199, 125, 255, 0.1), rgba(199, 125, 255, 0.05))',
            border: '1px solid rgba(199, 125, 255, 0.2)',
            padding: '0.75rem',
            borderRadius: '0.75rem'
          }}>
            <p className="flex items-start gap-2">
              <span>💡</span>
              <span>Las predicciones se basan en tus datos. Cuanto más registres, más precisas serán.</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}