import localforage from 'localforage'

const STORE_KEY = 'luna-period-data'

const defaultSettings = {
  cycleLength: 28,
  periodLength: 5,
  theme: 'dark',
  notifications: true,
  lastPeriodStart: null,
  name: ''
}

let listeners = []
let state = {
  cycles: [],
  symptoms: [],
  settings: defaultSettings
}

// Configurar localforage
localforage.config({
  name: 'luna',
  storeName: 'period-tracker'
})

// Cargar datos al iniciar
export async function loadData() {
  try {
    const data = await localforage.getItem(STORE_KEY)
    if (data) {
      state = { ...state, ...data }
      // Asegurar que settings tiene todos los defaults
      if (data.settings) {
        state.settings = { ...defaultSettings, ...data.settings }
      }
    }
  } catch (e) {
    console.warn('No se pudieron cargar los datos', e)
  }
  notify()
  return state
}

// Guardar datos
async function save() {
  try {
    await localforage.setItem(STORE_KEY, state)
  } catch (e) {
    console.warn('No se pudieron guardar los datos', e)
  }
}

// Suscribirse a cambios
export function subscribe(fn) {
  listeners.push(fn)
  return () => {
    listeners = listeners.filter(l => l !== fn)
  }
}

function notify() {
  listeners.forEach(fn => fn(getState()))
}

// Actions
export function setLastPeriodStart(dateStr) {
  state.settings = { ...state.settings, lastPeriodStart: dateStr }
  save(); notify()
}

export function addCycle(cycle) {
  state.cycles.push({ ...cycle, id: Date.now() })
  save(); notify()
}

export function addSymptom(symptom) {
  state.symptoms.push({ ...symptom, id: Date.now() })
  save(); notify()
}

export function removeSymptom(id) {
  state.symptoms = state.symptoms.filter(s => s.id !== id)
  save(); notify()
}

export function setSettings(newSettings) {
  state.settings = { ...state.settings, ...newSettings }
  save(); notify()
}

export function getState() {
  return JSON.parse(JSON.stringify(state))
}

// Calcular siguiente período
export function predictNextPeriod() {
  const { cycleLength, periodLength, lastPeriodStart } = state.settings
  if (!lastPeriodStart) return null

  const start = new Date(lastPeriodStart + 'T00:00:00')
  const nextStart = new Date(start)
  nextStart.setDate(nextStart.getDate() + cycleLength)
  const fertileStart = new Date(nextStart)
  fertileStart.setDate(fertileStart.getDate() - 14)
  const fertileEnd = new Date(fertileStart)
  fertileEnd.setDate(fertileEnd.getDate() + 5)

  const ovulation = new Date(fertileStart)
  ovulation.setDate(ovulation.getDate() + 1)

  const end = new Date(nextStart)
  end.setDate(end.getDate() + periodLength - 1)

  return {
    nextStart,
    fertileStart,
    fertileEnd,
    ovulation,
    end
  }
}

// Obtener día del ciclo para una fecha
export function getDayInfo(dateStr) {
  const { lastPeriodStart, cycleLength, periodLength } = state.settings
  if (!lastPeriodStart) return { phase: 'none', day: 0, label: '' }

  const date = new Date(dateStr + 'T00:00:00')
  const start = new Date(lastPeriodStart + 'T00:00:00')
  const diff = Math.floor((date - start) / (1000 * 60 * 60 * 24))

  if (diff < 0) return { phase: 'none', day: 0, label: '' }

  const day = (diff % cycleLength) + 1

  // Período actual
  if (day <= periodLength) {
    return { phase: 'period', day, label: 'Período' }
  }

  const prediction = predictNextPeriod()

  // Período predicho
  if (prediction) {
    const pDate = new Date(dateStr + 'T00:00:00')
    if (pDate >= prediction.nextStart && pDate <= prediction.end) {
      return { phase: 'period-predicted', day, label: 'Período predicho' }
    }
    if (pDate >= prediction.fertileStart && pDate <= prediction.fertileEnd) {
      return { phase: 'fertile', day, label: 'Ventana fértil' }
    }
    if (pDate.toDateString() === prediction.ovulation.toDateString()) {
      return { phase: 'ovulation', day, label: 'Ovulación' }
    }
  }

  // Fases del ciclo
  if (day <= 7) {
    return { phase: 'follicular', day, label: 'Fase folicular' }
  } else if (day <= 14) {
    return { phase: 'pre-ovulation', day, label: 'Pre-ovulación' }
  } else if (day <= 21) {
    return { phase: 'luteal', day, label: 'Fase lútea' }
  } else {
    return { phase: 'premenstrual', day, label: 'Premenstrual' }
  }
}

// Estadísticas
export function getStats() {
  const cycles = state.cycles
  if (cycles.length === 0) {
    return {
      avgCycle: state.settings.cycleLength,
      avgPeriod: state.settings.periodLength,
      lastPeriod: state.settings.lastPeriodStart,
      count: 0,
      symptomCount: state.symptoms.length
    }
  }

  const durations = cycles.map(c => c.length).filter(Boolean)
  const periodDurs = cycles.map(c => c.periodLength).filter(Boolean)

  return {
    avgCycle: durations.length ? Math.round(durations.reduce((a,b) => a+b, 0) / durations.length) : state.settings.cycleLength,
    avgPeriod: periodDurs.length ? Math.round(periodDurs.reduce((a,b) => a+b, 0) / periodDurs.length) : state.settings.periodLength,
    lastPeriod: state.settings.lastPeriodStart,
    count: cycles.length,
    symptomCount: state.symptoms.length
  }
}

// Síntomas comunes
export const SYMPTOMS = [
  { id: 'cramps', icon: '🩹', label: 'Cólicos', color: '#ff6b9d' },
  { id: 'bloating', icon: '🎈', label: 'Hinchazón', color: '#c77dff' },
  { id: 'headache', icon: '🤕', label: 'Dolor de cabeza', color: '#9d8fef' },
  { id: 'fatigue', icon: '😴', label: 'Cansancio', color: '#b19cd9' },
  { id: 'mood', icon: '😢', label: 'Cambios de ánimo', color: '#e0aaff' },
  { id: 'acne', icon: '✨', label: 'Acné', color: '#ffd93d' },
  { id: 'food', icon: '🍫', label: 'Antojos', color: '#ffb347' },
  { id: 'sleep', icon: '🌙', label: 'Insomnio', color: '#6a5acd' }
]

// Consejos según fase
export function getPhaseTip(phase) {
  const tips = {
    period: [
      '💧 Mantente hidratada, ayuda con los cólicos',
      '🍫 Un poco de chocolate es bueno (magnesio)',
      '🧘‍♀️ Yoga suave puede aliviar el dolor',
      '🫖 Té de manzanilla o jengibre ayuda'
    ],
    follicular: [
      '🏃‍♀️ ¡Buen momento para aumentar ejercicio!',
      '🥗 Tu energía está subiendo, aprovéchalo',
      '💡 Creatividad al máximo, ¡toma ideas!'
    ],
    'pre-ovulation': [
      '✨ Tu piel está radiante',
      '💪 Energía en su punto máximo',
      '📅 Si buscas concebir, ¡próximamente!'
    ],
    'luteal': [
      '🥰 Tu cuerpo necesita más calorías',
      '🛁 Baños tibios para relajarte',
      '📝 Registra cómo te sientes'
    ],
    'premenstrual': [
      '🌿 Té de valeriana para calmarte',
      '😴 Duerme 30 min más si puedes',
      '🧘‍♀️ Respiración profunda ayuda',
      '💪 Reduce ejercicio intenso si sientes dolor'
    ],
    'fertile': [
      '✨ Tu cuerpo está en su mejor momento',
      '💫 Energía alta, ¡aprovéchala!'
    ],
    'ovulation': [
      '🌙 Día de ovulación aproximada',
      '💪 Tu temperatura basal sube ligeramente'
    ]
  }
  const phaseTips = tips[phase] || tips['follicular']
  return phaseTips[Math.floor(Math.random() * phaseTips.length)]
}
