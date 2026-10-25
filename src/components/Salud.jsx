import { useState, useEffect } from 'react'
import {
  subscribe, getState, setProfile, addBasal, addMamaria, addOvulTest,
  getDayInfo, todayStr
} from '../store'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { FaWeight, FaThermometerHalf, FaVial, FaRibbon, FaShieldAlt } from 'react-icons/fa'

const SECTIONS = [
  { id: 'imc', icon: <FaWeight />, label: 'IMC & peso' },
  { id: 'temp', icon: <FaThermometerHalf />, label: 'Temperatura' },
  { id: 'mama', icon: <FaRibbon />, label: 'Autoexamen' },
  { id: 'ovul', icon: <FaVial />, label: 'Test ovulación' }
]

export default function Salud() {
  const [state, setState] = useState(getState())
  const [sec, setSec] = useState('imc')

  useEffect(() => {
    const unsub = subscribe(setState)
    return unsub
  }, [])

  return (
    <div className="card-content fade-in-stagger">
      <h2 className="section-title">
        <FaShieldAlt className="text-accent" />
        Salud 🩺
      </h2>

      {/* Navegación de secciones */}
      <div className="chips-row mb-4">
        {SECTIONS.map(s => (
          <button
            key={s.id}
            onClick={() => setSec(s.id)}
            className={`chip ${sec === s.id ? 'chip-active' : ''}`}
          >
            <span className="chip-icon">{s.icon}</span>
            <span>{s.label}</span>
          </button>
        ))}
      </div>

      {sec === 'imc' && <PesoSection profile={state.profile} setProfile={setProfile} />}
      {sec === 'temp' && <TempSection basal={state.basal} addBasal={addBasal} />}
      {sec === 'mama' && <MamaSection mamaria={state.mamaria} addMamaria={addMamaria} />}
      {sec === 'ovul' && <OvulSection ovulTest={state.ovulTest} addOvulTest={addOvulTest} />}

      <div className="card mt-4 disclaimer">
        <p className="text-xs text-text-secondary">
          ℹ️ Esta información es orientativa y no sustituye la opinión de una profesional de la salud.
        </p>
      </div>
    </div>
  )
}

/* ============ IMC y peso ideal ============ */
function PesoSection({ profile, setProfile }) {
  const [peso, setPeso] = useState(profile.peso ?? '')
  const [estatura, setEstatura] = useState(profile.estatura ?? '')

  const p = parseFloat(peso)
  const h = parseFloat(estatura)

  const imc = p > 0 && h > 0 ? p / Math.pow(h / 100, 2) : null
  const imcFixed = imc ? imc.toFixed(1) : null

  let categoria = ''
  let color = ''
  if (imc) {
    if (imc < 18.5) { categoria = 'Bajo peso'; color = '#9d8fef' }
    else if (imc < 25) { categoria = 'Peso saludable'; color = '#7ee3a5' }
    else if (imc < 30) { categoria = 'Sobrepeso'; color = '#ffd93d' }
    else { categoria = 'Obesidad'; color = '#ff6b9d' }
  }

  // Peso ideal: fórmula de Lorentz (mujeres)
  const pesoIdeal = h > 0
    ? (h - 100) - ((h - 150) / 4)
    : null
  const rangoMin = pesoIdeal ? (pesoIdeal * 0.9).toFixed(1) : null
  const rangoMax = pesoIdeal ? (pesoIdeal * 1.1).toFixed(1) : null

  const guardarPerfil = () => setProfile(p || null, h || null)

  return (
    <div className="card mb-4">
      <h3 className="card-subtitle">Tu cuerpo 💜</h3>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="mini-label">Peso (kg)</label>
          <input
            type="number" step="0.1" min="30" max="250"
            value={peso} onChange={e => setPeso(e.target.value)}
            className="input" placeholder="62"
          />
        </div>
        <div>
          <label className="mini-label">Estatura (cm)</label>
          <input
            type="number" step="1" min="120" max="210"
            value={estatura} onChange={e => setEstatura(e.target.value)}
            className="input" placeholder="165"
          />
        </div>
      </div>
      <button onClick={guardarPerfil} className="btn-primary w-full mb-4">Guardar medidas</button>

      {imcFixed && (
        <div className="imc-result slide-up">
          <div className="text-center mb-3">
            <p className="text-xs text-text-secondary">Tu IMC</p>
            <p className="imc-number" style={{ color }}>{imcFixed}</p>
            <p className="text-sm font-medium" style={{ color }}>{categoria}</p>
          </div>
          <div className="imc-bar mb-3">
            <div className="imc-segment" style={{ background: '#9d8fef', width: '18.5%' }} />
            <div className="imc-segment" style={{ background: '#7ee3a5', width: '32.5%' }} />
            <div className="imc-segment" style={{ background: '#ffd93d', width: '25%' }} />
            <div className="imc-segment" style={{ background: '#ff6b9d', width: '24%' }} />
            {imc && (
              <div
                className="imc-marker"
                style={{ left: Math.min(99, (imc / 45) * 100) + '%' }}
              />
            )}
          </div>
          <div className="flex text-[10px] justify-between text-text-secondary px-1">
            <span>Bajo</span><span>Saludable</span><span>Sobrepeso</span><span>Obesidad</span>
          </div>
        </div>
      )}

      {pesoIdeal && (
        <div className="card-subcard slide-up">
          <p className="text-sm font-semibold mb-1">🌿 Tu peso ideal (Lorentz)</p>
          <p className="text-2xl font-bold text-accent">{pesoIdeal.toFixed(1)} kg</p>
          <p className="text-xs text-text-secondary">
            Rango saludable: {rangoMin} – {rangoMax} kg
          </p>
          <div className="guide-tips mt-3">
            <p className="text-xs text-text-secondary">💡 Guía de salud:</p>
            <ul className="text-xs text-text-secondary mt-1">
              <li>• Beber agua suficiente (6-8 vasos/día)</li>
              <li>• 30 min de movimiento diario</li>
              <li>• Comidas con proteína y verdura</li>
              <li>• Dormir 7-9 h regula el ciclo</li>
            </ul>
          </div>
        </div>
      )}
      {!h && !p && (
        <p className="hint text-center">Escribe tu peso y estatura para ver tu IMC ✨</p>
      )}
    </div>
  )
}

/* ============ Temperatura basal ============ */
function TempSection({ basal, addBasal }) {
  const [temp, setTemp] = useState('')
  const [date, setDate] = useState(todayStr())
  const sorted = [...basal].sort((a, b) => a.date.localeCompare(b.date))
  const last7 = sorted.slice(-7)
  const min = Math.min(...last7.map(b => b.temp), 36)
  const max = Math.max(...last7.map(b => b.temp), 37.4)

  return (
    <div className="card mb-4">
      <h3 className="card-subtitle">Temperatura basal 🌡️</h3>
      <p className="hint mb-3">Mide al despertar, antes de levantarte. La subida (~0.3-0.5°) tras la ovulación indica que ocurrió.</p>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="mini-label">Temperatura (°C)</label>
          <input
            type="number" step="0.01" min="35" max="42"
            value={temp} onChange={e => setTemp(e.target.value)}
            className="input" placeholder="36.6"
          />
        </div>
        <div>
          <label className="mini-label">Fecha</label>
          <input
            type="date" value={date}
            onChange={e => setDate(e.target.value)}
            className="input"
          />
        </div>
      </div>
      <button
        onClick={() => {
          const t = parseFloat(temp)
          if (t > 0) { addBasal(t, date); setTemp('') }
        }}
        className="btn-primary w-full mb-4"
      >
        Registrar temperatura
      </button>

      {last7.length > 0 ? (
        <div className="flex items-end gap-1 mb-3" style={{ height: '90px' }}>
          {last7.map(b => {
            const hPct = ((b.temp - min) / (max - min || 1)) * 60 + 40
            return (
              <div key={b.id} className="temp-bar flex-col items-center">
                <span className="text-[10px] mb-1">{b.temp.toFixed(1)}</span>
                <div
                  className="temp-bar-fill"
                  style={{ height: hPct + '%' }}
                />
                <span className="text-[9px] mt-1">{b.date.slice(5)}</span>
              </div>
            )
          })}
        </div>
      ) : (
        <p className="hint text-center mb-4">Aún sin registros. ¡Empieza mañana saludando al termómetro! 🌞</p>
      )}
      <p className="hint">💡 Regístrala los mismos días para ver el patrón completo.</p>
    </div>
  )
}

/* ============ Autoexamen de mama ============ */
function MamaSection({ mamaria, addMamaria }) {
  const pasos = [
    { icon: '👀', t: 'Mirar frente al espejo', d: 'Brazos abajo, arriba y en la cadera. Observa cambios de forma, volumen o piel.' },
    { icon: '🔍', t: 'Ver con detalle', d: 'Busca carramas, hundimientos, cambios de color o secreción por el pezón.' },
    { icon: '🤲', t: 'Palpar de pie', d: 'Con las yemas, circula por toda la mama y axila. Presión suave, media y firme.' },
    { icon: '🛁', t: 'Palpar con jabón', d: 'En la ducha, con la piel lubricada, repite el recorrido de arriba a abajo.' },
    { icon: '🛏️', t: 'Palpar acostada', d: 'Con una almohada bajo el hombro, revisa con la mano contraria.' },
    { icon: '🙅‍♀️', t: 'Algo inusual', d: 'Si notas algo raro persistentes, agenda consulta; la revisión anual es ideal.' }
  ]
  const hoyDone = mamaria.find(m => m.date === todayStr())
  const diaIdeal = ['Día ideal: 5-10 del ciclo, tras la menstruación']

  return (
    <div className="card mb-4">
      <h3 className="card-subtitle">Autoexamen de mama 🎀</h3>
      <p className="hint mb-3">Hazlo una vez al mes, idealmente {diaIdeal[0].toLowerCase()}.</p>
      <div className="steps-vertical mb-3">
        {pasos.map((p, i) => (
          <div key={i} className="step-item">
            <div className="step-num">{i + 1}</div>
            <div>
              <p className="text-sm font-medium">{p.icon} {p.t}</p>
              <p className="text-xs text-text-secondary">{p.d}</p>
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={() => addMamaria()}
        disabled={!!hoyDone}
        className={`btn-primary w-full ${hoyDone ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {hoyDone ? '✓ Hoy ya te revisaste 🎀' : 'Realizado hoy'}
      </button>
      {mamaria.length > 0 && (
        <p className="text-xs text-text-secondary mt-2 text-center">
          Última revisión: {new Date(mamaria[mamaria.length - 1].date + 'T00:00:00').toLocaleDateString('es')}
        </p>
      )}
    </div>
  )
}

/* ============ Test de ovulación ============ */
function OvulSection({ ovulTest, addOvulTest }) {
  const [date, setDate] = useState(todayStr())
  const sorted = [...ovulTest].sort((a, b) => b.date.localeCompare(a.date))
  const positivos = ovulTest.filter(o => o.resultado === 'positivo')

  return (
    <div className="card mb-4">
      <h3 className="card-subtitle">Test de ovulación (LH) 🧪</h3>
      <p className="hint mb-3">Registra el resultado de tus tirillas. Días positivos = ventana fértil 💫</p>
      <div className="mb-3">
        <label className="mini-label">Fecha del test</label>
        <input
          type="date" value={date}
          onChange={e => setDate(e.target.value)}
          className="input mb-3"
        />
      </div>
      <div className="grid grid-cols-2 gap-2 mb-4">
        <button onClick={() => addOvulTest('positivo', date)} className="btn-primary" style={{ background: 'linear-gradient(135deg, #ff6b9d, #ff9daa)' }}>
          ➕ Positivo
        </button>
        <button onClick={() => addOvulTest('negativo', date)} className="btn-primary" style={{ background: 'linear-gradient(135deg, #9d8fef, #b19cd9)' }}>
          — Negativo
        </button>
      </div>

      {sorted.length > 0 ? (
        <div className="space-y-2">
          {sorted.slice(0, 6).map(t => (
            <div key={t.id} className={`test-row ${t.resultado === 'positivo' ? 'test-box-positivo' : 'test-box-negativo'}`}>
              <span>{t.resultado === 'positivo' ? '🎉' : '🤍'}</span>
              <span className="text-sm flex-1">{t.resultado === 'positivo' ? 'Positivo' : 'Negativo'}</span>
              <span className="text-xs text-text-secondary">{new Date(t.date + 'T00:00:00').toLocaleDateString('es')}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="hint text-center">Sin tests registrados. 🧪</p>
      )}
      {positivos.length > 0 && (
        <p className="text-xs text-accent text-center mt-3">
          🌟 {positivos.length} test(s) positivo(s) registrados
        </p>
      )}
    </div>
  )
}
