import { useState, useEffect } from 'react'
import { subscribe, getState, getStats, SYMPTOMS } from '../store'
import { FaChartBar, FaCalendarCheck, FaHeartbeat, FaHeart, FaSmile, FaDownload } from 'react-icons/fa'

function exportCSV() {
  const headers = ['Fecha', 'Síntomas', 'Intensidad', 'Notas']
  const rows = []
  const symptoms = getState().symptoms || []
  
  symptoms.forEach(entry => {
    const symptomNames = entry.symptoms?.map(id => {
      const sym = SYMPTOMS.find(s => s.id === id)
      return sym ? sym.label : ''
    }).filter(Boolean).join('; ')
    rows.push([entry.date, symptomNames, entry.intensity, entry.notes || ''])
  })

  const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'luna-datos.csv'
  a.click()
  URL.revokeObjectURL(url)
}

export default function Statistics() {
  const [state, setState] = useState(getState())
  const stats = getStats()
  const symptoms = state.symptoms || []

  useEffect(() => {
    const unsub = subscribe(setState)
    return unsub
  }, [])

  // Contar síntomas más frecuentes
  const symptomFrequency = {}
  symptoms.forEach(entry => {
    entry.symptoms?.forEach(symId => {
      symptomFrequency[symId] = (symptomFrequency[symId] || 0) + 1
    })
  })

  const sortedSymptoms = Object.entries(symptomFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  const avgIntensity = symptoms.length
    ? Math.round(symptoms.reduce((sum, s) => sum + (s.intensity || 0), 0) / symptoms.length * 10) / 10
    : 0

  // Calcular racha actual
  const streak = (() => {
    let s = 0
    for (let i = 0; i < 30; i++) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = format(date, 'yyyy-MM-dd')
      if (symptoms.some(s => s.date === dateStr)) {
        s++
      } else {
        break
      }
    }
    return s
  })()

  const format = (date, fmt) => {
    if (!date) return 'Aún no'
    const d = new Date(date)
    const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
    return `${d.getDate()} de ${months[d.getMonth()]}`
  }

  return (
    <div className="card-content fade-in-stagger">
      <h2 className="section-title">
        <FaChartBar className="text-accent" />
        Tus estadísticas
        <button
          onClick={exportCSV}
          className="btn-primary ml-auto"
          style={{padding: '0.5rem 1rem', fontSize: '0.85rem'}}
          title="Exportar a CSV"
        >
          <FaDownload className="mr-1" />
          Exportar
        </button>
      </h2>

      {/* Stats header */}
      <div className="card mb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-text-secondary">Registros activos</p>
            <p className="text-2xl font-bold text-accent">{symptoms.length}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-text-secondary">Racha actual</p>
            <p className="text-2xl font-bold text-danger">{streak} días 🔥</p>
          </div>
        </div>
      </div>

      {/* Resumen numérico */}
      <div className="stat-grid mb-4">
        <div className="stat-card">
          <FaCalendarCheck className="stat-icon" />
          <p className="stat-value">{stats.avgCycle}</p>
          <p className="stat-label">Días de ciclo promedio</p>
        </div>
        <div className="stat-card">
          <FaHeartbeat className="stat-icon" style={{color: 'var(--danger)'}} />
          <p className="stat-value">{stats.avgPeriod}</p>
          <p className="stat-label">Días de período</p>
        </div>
      </div>

      {/* Intensidad promedio */}
      <div className="card mb-4">
        <h3 className="card-subtitle">Resumen general</h3>
        <div className="space-y-2">
          <div className="flex justify-between items-center py-2 border-b border-accent/10">
            <span className="text-sm flex items-center gap-2">
              <span>📅</span> Ciclos registrados
            </span>
            <span className="text-accent font-semibold">{stats.count || 0}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-accent/10">
            <span className="text-sm flex items-center gap-2">
              <span>🔥</span> Intensidad promedio
            </span>
            <span className="text-accent font-semibold">{avgIntensity}/5</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-sm flex items-center gap-2">
              <span>💝</span> Registro más antiguo
            </span>
            <span className="text-accent font-semibold">
              {symptoms.length > 0 ? format(symptoms[symptoms.length - 1]?.date, 'dd/MM/yyyy') : '-'}
            </span>
          </div>
        </div>
      </div>

      {/* Síntomas más frecuentes */}
      <div className="card mb-4">
        <h3 className="card-subtitle">
          <FaHeart className="text-danger mr-2" />
          Síntomas más frecuentes
        </h3>
        {sortedSymptoms.length > 0 ? (
          <div className="space-y-3">
            {sortedSymptoms.map(([symId, count], i) => {
              const sym = SYMPTOMS.find(s => s.id === symId)
              if (!sym) return null
              const maxCount = sortedSymptoms[0]?.[1] || 1
              const percentage = (count / maxCount) * 100

              const emojis = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣']

              return (
                <div key={symId} className="flex items-center gap-3" style={{animationDelay: `${i * 100}ms`}}>
                  <span className="text-xl">{emojis[i]}</span>
                  <span className="text-2xl" style={{minWidth: '2rem'}}>{sym.icon}</span>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">{sym.label}</span>
                      <span className="text-xs text-text-secondary">{count} veces</span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-bar-fill"
                        style={{
                          width: `${percentage}%`,
                          background: `linear-gradient(90deg, ${sym.color}, ${sym.color}88)`
                        }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center" style={{padding: '2rem'}}>
            <p className="text-sm text-text-secondary mb-2">
              Aún no hay datos. Registra tus síntomas para ver estadísticas.
            </p>
            <div style={{fontSize: '2.5rem'}} className="pulse">📊</div>
          </div>
        )}
      </div>

      {/* Consejos personalizados */}
      <div className="card">
        <h3 className="card-subtitle">💡 Basado en tus datos</h3>
        <ul className="space-y-2 text-sm">
          {stats.avgCycle > 35 && (
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>Tu ciclo es más largo que el promedio. Esto es normal y saludable.</span>
            </li>
          )}
          {stats.avgCycle < 21 && (
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>Tu ciclo es más corto que el promedio. Si es constante, generalmente es normal.</span>
            </li>
          )}
          {stats.avgPeriod > 7 && (
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>Tu período dura más de lo habitual. Considera consultar con un profesional.</span>
            </li>
          )}
          {symptoms.length > 10 && avgIntensity > 3 && (
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>Tus síntomas han sido intensos frecuentemente. Considera registrarlos para compartir con tu ginecólogo.</span>
            </li>
          )}
          {symptoms.length === 0 && (
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>¡Empieza a registrar tus síntomas para obtener estadísticas útiles!</span>
            </li>
          )}
          <li className="flex items-start gap-2">
            <span>💝</span>
            <span>Recuerda: cada ciclo es único. ¡Celebra tu cuerpo!</span>
          </li>
        </ul>
      </div>
    </div>
  )
}

function format(dateStr, fmt) {
  if (!dateStr) return 'Aún no'
  const date = new Date(dateStr)
  const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
  const day = String(date.getDate()).padStart(2, '0')
  const month = months[date.getMonth()]
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}