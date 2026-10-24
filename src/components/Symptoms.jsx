import { useState, useEffect } from 'react'
import { subscribe, getState, addSymptom, SYMPTOMS } from '../store'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { FaHeart, FaTimes, FaSave, FaTrash } from 'react-icons/fa'

export default function Symptoms() {
  const [state, setState] = useState(getState())
  const [selectedSymptoms, setSelectedSymptoms] = useState([])
  const [notes, setNotes] = useState('')
  const [intensity, setIntensity] = useState(3)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const unsub = subscribe(setState)
    return unsub
  }, [])

  const today = format(new Date(), 'yyyy-MM-dd')
  const todaySymptoms = state.symptoms?.filter(s => s.date === today) || []

  const toggleSymptom = (id) => {
    setSelectedSymptoms(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    )
  }

  const saveSymptoms = () => {
    if (selectedSymptoms.length === 0) return

    addSymptom({
      id: Date.now(),
      date: today,
      symptoms: selectedSymptoms,
      intensity,
      notes: notes.trim()
    })

    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    setSelectedSymptoms([])
    setNotes('')
    setIntensity(3)
  }

  const intensityLabels = {
    1: '🌱 Leve',
    2: '🌿 Moderado',
    3: '🌳 Regular',
    4: '🔥 Intenso',
    5: '⚡ Muy intenso'
  }

  const intensityColors = {
    1: '#9d8fef',
    2: '#b19cd9',
    3: '#c77dff',
    4: '#ff6b9d',
    5: '#ff3366'
  }

  return (
    <div className="card-content fade-in-stagger">
      <h2 className="section-title">
        <FaHeart className="text-danger" />
        Registro de síntomas
      </h2>

      {/* Síntomas para marcar */}
      <div className="card mb-4">
        <h3 className="card-subtitle">¿Cómo te sientes hoy?</h3>
        <div className="grid grid-cols-2 gap-2">
          {SYMPTOMS.map((symptom, i) => {
            const isSelected = selectedSymptoms.includes(symptom.id)
            return (
              <button
                key={symptom.id}
                onClick={() => toggleSymptom(symptom.id)}
                className={`symptom-btn ${isSelected ? 'symptom-btn-active' : ''}`}
                style={{animationDelay: `${i * 50}ms`}}
              >
                <span className="text-2xl block mb-1">{symptom.icon}</span>
                <span className="text-sm">{symptom.label}</span>
                {isSelected && (
                  <span className="absolute top-1 right-1 text-accent text-xs">
                    <FaTimes />
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Intensidad */}
      <div className="card mb-4">
        <h3 className="card-subtitle">Intensidad general</h3>
        <div className="flex justify-between mb-3" style={{gap: '0.5rem'}}>
          {[1, 2, 3, 4, 5].map(level => (
            <button
              key={level}
              onClick={() => setIntensity(level)}
              className={`intensity-btn ${level <= intensity ? 'active' : ''}`}
              style={level <= intensity && intensity === level ? {background: `linear-gradient(135deg, ${intensityColors[level]}, ${intensityColors[level]}88)`} : {}}
            >
              {level}
            </button>
          ))}
        </div>
        <p className="text-center text-sm font-medium">{intensityLabels[intensity]}</p>
      </div>

      {/* Notas */}
      <div className="card mb-4">
        <h3 className="card-subtitle">Notas adicionales</h3>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="¿Algo más que quieras registrar hoy?..."
          className="input"
          rows={3}
          style={{resize: 'none'}}
        />
      </div>

      {/* Guardar */}
      <button
        onClick={saveSymptoms}
        disabled={selectedSymptoms.length === 0}
        className={`btn-primary w-full mb-4 ${
          selectedSymptoms.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        <FaSave className="mr-2" />
        {saved ? '✓ Guardado!' : 'Guardar síntomas'}
        {saved && <span className="slide-up">✓</span>}
      </button>

      {/* Síntomas de hoy */}
      {todaySymptoms.length > 0 && (
        <div className="card">
          <h3 className="card-subtitle">Síntomas registrados hoy</h3>
          <div className="space-y-3">
            {todaySymptoms.map(entry => (
              <div key={entry.id} className="slide-up" style={{
                padding: '1rem',
                background: 'var(--bg-secondary)',
                borderRadius: '0.75rem',
                border: '1px solid rgba(199, 125, 255, 0.1)'
              }}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-accent text-xs">
                    {intensityLabels[entry.intensity]}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 mb-2">
                  {entry.symptoms?.map(symId => {
                    const sym = SYMPTOMS.find(s => s.id === symId)
                    return sym ? (
                      <span
                        key={symId}
                        className="symptom-tag"
                      >
                        {sym.icon} {sym.label}
                      </span>
                    ) : null
                  })}
                </div>
                {entry.notes && (
                  <p className="text-sm text-text-secondary italic">{entry.notes}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}