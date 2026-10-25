import { useMemo } from 'react'

/**
 * Ambiente visual por tema ("pieles" de Luna): cada piel tiene su propia
 * animación característica — pétalos que caen, burbujas que suben,
 * nubes que cruzan, estrellas fugaces, hojas de otoño, chispas...
 */
const CONFIG = {
  // Colección «Diseños Luna»
  serena: {
    items: ['✦', '✧', '✦', '˚', '✧', '✦', '˚', '✧', '✦', '˚', '✧', '✦'],
    cls: 'ambient-star',
    anim: 'twinkle',
    flota: true,
    dur: [6, 1.4],
    size: [8, 5]
  },
  petalos: {
    items: ['🌸', '🍃', '🌸', '🌸', '🌷', '🌸', '🍃', '🌸', '🌸', '🌷', '🌸', '🍃'],
    cls: 'ambient-petal',
    anim: 'caida',
    dur: [8, 2.3],
    size: [14, 5]
  },
  aurora: null, // su ambiente es el degradado animado del body (CSS)
  botanica: {
    items: ['🌿', '🍃', '🌿', '✿', '🌿', '🍃', '🌿', '✿', '🌿', '🍃', '🌿', '✿'],
    cls: 'ambient-hoja',
    anim: 'deriva',
    dur: [9, 2.6],
    size: [14, 5]
  },
  // Pieles clásicas
  luna: {
    items: ['✨', '✧', '✨', '·', '✨', '✧', '·', '✨', '✧', '✨', '·', '✧'],
    cls: 'ambient-chispa',
    anim: 'asciende',
    dur: [10, 2.6],
    size: [10, 6]
  },
  rosa: {
    items: ['💗', '💗', '🤍', '💗', '💗', '💗', '🤍', '💗', '💗', '💗', '🤍', '💗'],
    cls: 'ambient-corazon',
    anim: 'asciende-suave',
    dur: [11, 3],
    size: [13, 7]
  },
  oceano: {
    items: ['🫧', '·', '🫧', '🫧', '·', '🫧', '🫧', '·', '🫧', '🫧', '·', '🫧'],
    cls: 'ambient-burbuja',
    anim: 'asciende',
    dur: [9, 3.4],
    size: [12, 10]
  },
  bosque: {
    items: ['🍂', '🍃', '🍂', '🍂', '🍃', '🍂', '🍂', '🍂', '🍃', '🍂', '🍂', '🍃'],
    cls: 'ambient-otono',
    anim: 'cae-zigzag',
    dur: [10, 2.8],
    size: [14, 7]
  },
  atardecer: {
    items: ['☁️', '☁️', '☁️', '☁️', '☁️', '☁️', '☁️', '☁️', '☁️', '☁️', '☁️', '☁️'],
    cls: 'ambient-nube',
    anim: 'deriva-x',
    top: 'banda',
    dur: [38, 14],
    size: [30, 18]
  },
  medianoche: {
    items: ['✦', '✦', '✦', '✦', '✦', '✦', '✦', '✦', '✦', '✦', '✦', '✦'],
    cls: 'ambient-cometa',
    anim: 'cometa',
    flota: true,
    dur: [10, 3.2],
    size: [10, 5]
  }
}

// posiciones prefijadas = sin re-render aleatorio
const POS = [4, 14, 26, 33, 44, 55, 62, 71, 80, 88, 94, 50]

export default function AmbientOverlay({ theme }) {
  const conf = CONFIG[theme]
  if (!conf) return null

  const items = useMemo(
    () =>
      conf.items.map((emoji, i) => {
        let top = -8
        if (conf.flota) top = 6 + (i % 5) * 17
        else if (conf.top === 'banda') top = 4 + (i % 4) * 9
        return {
          emoji,
          left: POS[i],
          top,
          delay: -(Math.round(i * conf.dur[0] * 0.14) % conf.dur[0]),
          dur: conf.dur[0] + (i % 5) * conf.dur[1],
          size: conf.size[0] + (i % 4) * conf.size[1]
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
          className={`${conf.cls} ${conf.cls}--${conf.anim}`}
          style={{
            left: it.left + '%',
            top: it.top + '%',
            animationDelay: it.delay + 's',
            animationDuration: it.dur + 's',
            fontSize: it.size + 'px'
          }}
        >
          {it.emoji}
        </span>
      ))}
    </div>
  )
}
