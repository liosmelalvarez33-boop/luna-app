import { useMemo } from 'react'

/**
 * Ambiente visual por tema ("pieles" de la colección Diseños Luna).
 * - serena: destellos/estrellas titilando + luna dorada brillando
 * - petalos: pétalos rosados cayendo despacio
 * - aurora: solo degradado animado (CSS en body), sin capa aquí
 * - botanica: hojas que flotan como en un herbario
 */
const CONFIG = {
  serena: {
    items: ['✦', '✧', '✦', '˚', '✧', '✦', '˚', '✧', '✦', '˚', '✧', '✦'],
    cls: 'ambient-star',
    anim: 'twinkle',
    flota: true
  },
  petalos: {
    items: ['🌸', '🍃', '🌸', '🌸', '🌷', '🌸', '🍃', '🌸', '🌸', '🌷', '🌸', '🍃'],
    cls: 'ambient-petal',
    anim: 'caida',
    flota: false
  },
  botanica: {
    items: ['🌿', '🍃', '🌿', '✿', '🌿', '🍃', '🌿', '✿', '🌿', '🍃', '🌿', '✿'],
    cls: 'ambient-hoja',
    anim: 'deriva',
    flota: false
  }
}

// posiciones prefijadas = sin re-render aleatorio
const POS = [4, 14, 26, 33, 44, 55, 62, 71, 80, 88, 94, 50]

export default function AmbientOverlay({ theme }) {
  const conf = CONFIG[theme]
  if (!conf) return null

  const items = useMemo(
    () =>
      conf.items.map((emoji, i) => ({
        emoji,
        left: POS[i],
        top: conf.flota ? 6 + (i % 5) * 17 : -8,
        delay: -((i * 0.9) % 8).toFixed(1),
        dur: (7 + (i % 5) * 2.3).toFixed(1),
        size: conf.flota ? 8 + (i % 3) * 5 : 14 + (i % 4) * 5
      })),
    [theme]
  )

  return (
    <div className="ambient" aria-hidden="true">
      {theme === 'serena' && <span className="ambient-moon" />}
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
