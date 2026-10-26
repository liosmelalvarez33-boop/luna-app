import { useState, useRef, useEffect } from 'react'
import Salud from './Salud'
/**
 * Autocuidado: tarjetas grandes de bienestar + paisajes sonoros
 * (generados con Web Audio, sin archivos externos) y debajo
 * todas las secciones de Salud tal cual (IMC, temperatura,
 * autoexamen, test de ovulación).
 */
const PAISAJES = [
  { id: 'lluvia', nombre: 'Lluvia suave', desc: 'Para dormir profundo', bg: 'linear-gradient(140deg, #5b8fe8, #2c4f9e)', icono: '🌧️', freq: 1400, lfo: 0.4, prof: 0.8 },
  { id: 'bosque', nombre: 'Bosque al amanecer', desc: 'Viento entre hojas', bg: 'linear-gradient(140deg, #6fce95, #2f7a52)', icono: '🌲', freq: 600, lfo: 0.15, prof: 0.5 },
  { id: 'mar', nombre: 'Olas del mar', desc: 'Respira con las olas', bg: 'linear-gradient(140deg, #58c4c9, #1f6a78)', icono: '🌊', freq: 800, lfo: 0.1, prof: 0.95 }
]

/* Generador de paisaje: ruido filtrado con respiración lenta */
function crearPaisaje(p) {
  const actx = new (window.AudioContext || window.webkitAudioContext)()
  const duracion = 2.5
  const buffer = actx.createBuffer(1, actx.sampleRate * duracion, actx.sampleRate)
  const data = buffer.getChannelData(0)
  let last = 0
  for (let i = 0; i < data.length; i++) {
    const white = Math.random() * 2 - 1
    // mezcla blanco (lluvia) con brown (viento/olas) según profundidad
    last = (last + 0.02 * white) / 1.02
    data[i] = white * (1 - p.lfo * 0.0) * 0 + (white * (1 - p.prof) + last * 3.2 * p.prof) * 0.55
  }
  const src = actx.createBufferSource()
  src.buffer = buffer
  src.loop = true

  const filtro = actx.createBiquadFilter()
  filtro.type = 'lowpass'
  filtro.frequency.value = p.freq
  filtro.Q.value = 0.8

  const gain = actx.createGain()
  gain.gain.value = 0.0001
  gain.gain.linearRampToValueAtTime(0.16, actx.currentTime + 1.2)

  // Respiración del paisaje (olas/viento)
  const lfo = actx.createOscillator()
  const lfoGain = actx.createGain()
  lfo.frequency.value = p.lfo
  lfoGain.gain.value = 0.06
  lfo.connect(lfoGain).connect(gain.gain)
  lfo.start()

  src.connect(filtro).connect(gain).connect(actx.destination)
  src.start()

  let vivo = true
  return {
    stop: () => {
      if (!vivo) return
      vivo = false
      gain.gain.linearRampToValueAtTime(0.0001, actx.currentTime + 0.5)
      setTimeout(() => { try { actx.close() } catch { } }, 600)
    }
  }
}

const BIENESTAR = [
  {
    t: 'Respira 4-7-8', sub: '4 min · para calmar el cuerpo',
    bg: 'linear-gradient(120deg, #ffd97a, #ffb6c1)',
    pasos: ['Inhala por la nariz 4 tiempos', 'Sostén el aire 7 tiempos', 'Exhala despacio por la boca 8 tiempos', 'Repite 5 rondas']
  },
  {
    t: 'Fortalece tu zona', sub: '7 min · pierna y vientre',
    bg: 'linear-gradient(120deg, #c9b8f5, #9d8fef)',
    pasos: ['Puente de glúteos · 3x12', 'Pata de gato/gato vaca · 8 respiraciones', 'Pecho cobra suave · 3 de 20 seg', 'Piernas contra la pared · 5 min']
  }
]

export default function Autocuidado({ foco }) {
  const [sonando, setSonando] = useState(null)
  const paisajeActivo = useRef(null)
  const [abiertoCard, setAbiertoCard] = useState(null)

  useEffect(() => () => paisajeActivo.current?.stop(), [])

  const toggleSonido = (p) => {
    if (sonando === p.id) {
      paisajeActivo.current?.stop()
      paisajeActivo.current = null
      setSonando(null)
    } else {
      paisajeActivo.current?.stop()
      paisajeActivo.current = crearPaisaje(p)
      setSonando(p.id)
    }
  }

  return (
    <div className="card-content fade-in-stagger">
      <h2 className="section-title centered">Autocuidado 🫶</h2>

      {/* ---- Tarjetas de bienestar ---- */}
      {BIENESTAR.map((b, i) => (
        <div key={i} className="bienestar-card" style={{ background: b.bg }}>
          <div className="well-text">
            <h3>{b.t}</h3>
            <p>{b.sub}</p>
            {abiertoCard === i && (
              <ol className="well-pasos">
                {b.pasos.map((paso, j) => <li key={j}>{paso}</li>)}
              </ol>
            )}
            <button className="pill-mini" onClick={() => setAbiertoCard(abiertoCard === i ? null : i)}>
              {abiertoCard === i ? 'Ocultar ✕' : 'Ver la guía ▸'}
            </button>
          </div>
          <div className="well-emoji" style={{ opacity: 0.9 }}>{i === 0 ? '🌬️' : '🧘‍♀️'}</div>
        </div>
      ))}

      {/* ---- Paisajes sonoros ---- */}
      <h3 className="grupo-titulo">Paisajes sonoros</h3>
      <div className="sonidos-grid">
        {PAISAJES.map(p => {
          const on = sonando === p.id
          return (
            <div key={p.id} className="sonido-card" style={{ background: p.bg }}>
              <span className="sonido-icono">{p.icono}</span>
              <div className="sonido-texto">
                <p className="sonido-nombre">{p.nombre}</p>
                <p className="sonido-desc">{p.desc}</p>
              </div>
              <button
                className={`play-bubble ${on ? 'play-bubble-on' : ''}`}
                onClick={() => toggleSonido(p)}
                aria-label={on ? `Parar ${p.nombre}` : `Reproducir ${p.nombre}`}
              >
                {on ? '❚❚' : '▶'}
              </button>
              {on && <div className="onda onda1" />}
              {on && <div className="onda onda2" />}
              {on && <div className="onda onda3" />}
            </div>
          )
        })}
      </div>

      {/* ---- Salud completa debajo ---- */}
      <Salud seccionInicial={foco} />
    </div>
  )
}
