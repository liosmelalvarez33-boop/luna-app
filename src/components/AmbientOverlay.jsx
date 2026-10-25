import { useMemo } from 'react'

/**
 * Ambiente visual por tema ("pieles" de Luna): cada piel tiene su propia
 * animación característica. Los elementos se distribuyen en 3 capas de
 * PROFUNDIDAD (lejos / medio / cerca) con distinto tamaño, desenfoque y
 * opacidad para dar sensación de paralaje y hacerlos más logrados.
 */
const CONFIG = {
  // Colección «Diseños Luna»
  serena: {
    items: ['✦', '✧', '✦', '˚', '✧', '✦', '˚', '✧', '✦', '˚', '✧', '✦'],
    cls: 'ambient-star',
    anim: 'twinkle',
    flota: true,
    dur: [6, 1.4],
    size: [7, 5]
  },
  petalos: {
    items: ['🌸', '🍃', '🌸', '🌸', '🌷', '🌸', '🍃', '🌸', '🌸', '🌷', '🌸', '🍃'],
    cls: 'ambient-petal',
    anim: 'caida',
    dur: [8, 2.3],
    size: [12, 5]
  },
  aurora: null, // su ambiente es el degradado animado del body (CSS)
  botanica: {
    items: ['🌿', '🍃', '🌿', '✿', '🌿', '🍃', '🌿', '✿', '🌿', '🍃', '🌿', '✿'],
    cls: 'ambient-hoja',
    anim: 'deriva',
    dur: [9, 2.6],
    size: [12, 5]
  },
  // Pieles clásicas
  luna: {
    items: ['✨', '✧', '✨', '·', '✨', '✧', '·', '✨', '✧', '✨', '·', '✧'],
    cls: 'ambient-chispa',
    anim: 'asciende',
    dur: [10, 2.6],
    size: [8, 6]
  },
  rosa: {
    items: ['💗', '💗', '🤍', '💗', '💗', '💗', '🤍', '💗', '💗', '💗', '🤍', '💗'],
    cls: 'ambient-corazon',
    anim: 'asciende-suave',
    dur: [11, 3],
    size: [11, 7]
  },
  oceano: {
    items: ['🫧', '·', '🫧', '🫧', '·', '🫧', '🫧', '·', '🫧', '🫧', '·', '🫧'],
    cls: 'ambient-burbuja',
    anim: 'asciende',
    dur: [9, 3.4],
    size: [10, 9]
  },
  bosque: {
    items: ['🍂', '🍃', '🍂', '🍂', '🍃', '🍂', '🍂', '🍂', '🍃', '🍂', '🍂', '🍃'],
    cls: 'ambient-otono',
    anim: 'cae-zigzag',
    dur: [10, 2.8],
    size: [12, 7]
  },
  atardecer: {
    items: ['☁️', '☁️', '☁️', '☁️', '☁️', '☁️', '☁️', '☁️', '☁️', '☁️', '☁️', '☁️'],
    cls: 'ambient-nube',
    anim: 'deriva-x',
    top: 'banda',
    dur: [36, 13],
    size: [26, 18]
  },
  medianoche: {
    items: ['✦', '✦', '✦', '✦', '✦', '✦', '✦', '✦', '✦', '✦', '✦', '✦'],
    cls: 'ambient-cometa',
    anim: 'cometa',
    flota: true,
    dur: [7, 2],
    size: [9, 5]
  }
}

// posiciones prefijadas = sin re-render aleatorio
const POS = [4, 14, 26, 33, 44, 55, 62, 71, 80, 88, 94, 50]
const DEPTHS = [
  { cls: 'ambient-d-far', scale: 0.6 },
  { cls: 'ambient-d-mid', scale: 1 },
  { cls: 'ambient-d-near', scale: 1.45 }
]

export default function AmbientOverlay({ theme }) {
  const conf = CONFIG[theme]
  if (!conf) return null

  const items = useMemo(
    () =>
      conf.items.map((emoji, i) => {
        const depth = DEPTHS[i % 3]
        let top = -8
        if (conf.flota) top = 6 + (i % 5) * 17
        else if (conf.top === 'banda') top = 4 + (i % 4) * 9
        return {
          depth,
          emoji,
          left: POS[i],
          top,
          delay: -(Math.round(i * conf.dur[0] * 0.14) % conf.dur[0]),
          dur: conf.dur[0] + (i % 5) * conf.dur[1],
          size: (conf.size[0] + (i % 4) * conf.size[1]) * depth.scale
        }
      }),
    [theme]
  )

  return (
    <div className="ambient" aria-hidden="true">
      {theme === 'serena' && <span className="ambient-moon" />}
      {theme === 'atardecer' && <span className="ambient-sol" />}
      {items.map((it, i) => (
        <span
          key={i}
          className={`${conf.cls} ${conf.cls}--${conf.anim} ${it.depth.cls}`}
          style={{
            left: it.left + '%',
            top: it.top + '%',
            animationDelay: it.delay + 's',
            animationDuration: it.dur + 's',
            fontSize: Math.round(it.size * 10) / 10 + 'px'
          }}
        >
          {it.emoji}
        </span>
      ))}
    </div>
  )
}
