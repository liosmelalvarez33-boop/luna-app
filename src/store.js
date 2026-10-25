import localforage from 'localforage'

const STORE_KEY = 'luna-period-data'

const defaultSettings = {
  cycleLength: 28,
  periodLength: 5,
  theme: 'luna',
  pet: 'lunita',
  notifications: true,
  lastPeriodStart: null,
  name: '',
  email: ''
}

let listeners = []
let state = {
  cycles: [],
  symptoms: [],
  dailyLogs: [],      // {id, date, mood, skin, hair, exercise, sleepHours, water, sexual, tags[], notes, intensity, symptoms[]}
  sexual: { metodo: '', notas: [] },  // metodo anticonceptivo activo
  profile: { peso: null, estatura: null }, // kg, cm
  basal: [],          // {id, date, temp}
  mamaria: [],        // {id, date, nota}
  ovulTest: [],       // {id, date, resultado: 'positivo'|'negativo'}
  tags: [],           // {id, emoji, label, color}
  settings: defaultSettings
}

localforage.config({
  name: 'luna',
  storeName: 'period-tracker'
})

export async function loadData() {
  try {
    const data = await localforage.getItem(STORE_KEY)
    if (data) {
      state = {
        ...state,
        ...data,
        settings: { ...defaultSettings, ...(data.settings || {}) },
        profile: { ...state.profile, ...(data.profile || {}) },
        sexual: { ...state.sexual, ...(data.sexual || {}) }
      }
      // Validar mascota guardada (valores antiguos eran emoji suelto)
      if (!PETS.some(p => p.id === state.settings.pet)) {
        state.settings.pet = defaultSettings.pet
      }
    }
  } catch (e) {
    console.warn('No se pudieron cargar los datos', e)
  }
  notify()
  return getState()
}

async function save() {
  try {
    await localforage.setItem(STORE_KEY, state)
  } catch (e) {
    console.warn('No se pudieron guardar los datos', e)
  }
}

export function subscribe(fn) {
  listeners.push(fn)
  return () => {
    listeners = listeners.filter(l => l !== fn)
  }
}

function notify() {
  listeners.forEach(fn => fn(getState()))
}

/* ===== Superficial helpers ===== */
export const todayStr = () => formatDateStr(new Date())
export function formatDateStr(d) {
  const dt = d instanceof Date ? d : new Date(d)
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`
}

/* ===== Actions ===== */
export function setLastPeriodStart(dateStr) {
  state.settings = { ...state.settings, lastPeriodStart: dateStr }
  save(); notify()
}

export function addCycle(cycle) {
  state.cycles.push({ ...cycle, id: Date.now() })
  save(); notify()
}

export function addSymptom(symptom) {
  const today = todayStr()
  const existing = state.symptoms.filter(s => s.date === today)
  const entry = { ...symptom, id: Date.now(), date: today }
  if (existing.length > 0) {
    state.symptoms = state.symptoms.map(s => s.date === today ? entry : s)
  } else {
    state.symptoms.push(entry)
  }
  save(); notify()
}

export function removeSymptom(id) {
  state.symptoms = state.symptoms.filter(s => s.id !== id)
  save(); notify()
}

export function setSettings(newSettings) {
  state.settings = { ...state.settings, ...newSettings }
  // Aplicar tema inyectado
  if (newSettings.theme) {
    document.documentElement.setAttribute('data-theme', newSettings.theme)
  }
  save(); notify()
}

/* Perfil */
export function setProfile(peso, estatura) {
  state.profile = {
    peso: peso !== undefined ? peso : state.profile.peso,
    estatura: estatura !== undefined ? estatura : state.profile.estatura
  }
  save(); notify()
}

/* Registro diario (Mi día) */
export function addDailyLog(entry) {
  const date = entry.date || todayStr()
  const existing = state.dailyLogs.find(d => d.date === date)
  if (existing) {
    state.dailyLogs = state.dailyLogs.map(d => d.date === date ? { ...d, ...entry, date, id: d.id } : d)
  } else {
    state.dailyLogs.push({ ...entry, date, id: Date.now() })
  }
  // Sincronizar sexual
  if (entry.sexual !== undefined) {
    state.sexual.notas = state.sexual.notas.filter(n => n.date !== date)
    if (entry.sexual) state.sexual.notas.push({ date })
  }
  save(); notify()
}

export function setSexualMetodo(metodo) {
  state.sexual.metodo = metodo
  save(); notify()
}

/* Temperatura basal */
export function addBasal(temp, date) {
  const d = date || todayStr()
  const existing = state.basal.find(b => b.date === d)
  if (existing) {
    state.basal = state.basal.map(b => b.date === d ? { ...b, temp } : b)
  } else {
    state.basal.push({ id: Date.now(), date: d, temp })
  }
  save(); notify()
}

/* Autoexamen de mama */
export function addMamaria(nota) {
  state.mamaria.push({ id: Date.now(), date: todayStr(), nota: nota || '' })
  save(); notify()
}

/* Test de ovulación */
export function addOvulTest(resultado, date) {
  state.ovulTest.push({ id: Date.now(), date: date || todayStr(), resultado })
  save(); notify()
}

/* Etiquetas */
export function addTag(tag) {
  state.tags.push({ ...tag, id: Date.now() })
  save(); notify()
}

export function removeTag(id) {
  state.tags = state.tags.filter(t => t.id !== id)
  save(); notify()
}

/* Cuenta / respaldo */
export function exportBackup() {
  return JSON.stringify(state)
}

export function importBackup(json) {
  try {
    const parsed = JSON.parse(json)
    state = {
      ...state,
      ...parsed,
      settings: { ...defaultSettings, ...(parsed.settings || {}) },
      profile: { ...state.profile, ...(parsed.profile || {}) },
      sexual: { ...state.sexual, ...(parsed.sexual || {}) }
    }
    if (state.settings.theme) document.documentElement.setAttribute('data-theme', state.settings.theme)
    // Validar mascota importada
    if (!PETS.some(p => p.id === state.settings.pet)) {
      state.settings.pet = defaultSettings.pet
    }
    save(); notify()
    return true
  } catch (e) {
    console.warn('Backup inválido', e)
    return false
  }
}

export function getState() {
  return JSON.parse(JSON.stringify(state))
}

/* ===== Predicción ===== */
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

  return { nextStart, fertileStart, fertileEnd, ovulation, end }
}

export function getDayInfo(dateStr) {
  const { lastPeriodStart, cycleLength, periodLength } = state.settings
  if (!lastPeriodStart) return { phase: 'none', day: 0, label: '' }

  const date = new Date(dateStr + 'T00:00:00')
  const start = new Date(lastPeriodStart + 'T00:00:00')
  const diff = Math.floor((date - start) / (1000 * 60 * 60 * 24))

  if (diff < 0) return { phase: 'none', day: 0, label: '' }

  const day = (diff % cycleLength) + 1

  if (day <= periodLength) {
    return { phase: 'period', day, label: 'Período' }
  }

  const prediction = predictNextPeriod()

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

/* ===== Catálogos ===== */
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

export const MOODS = [
  { id: 'feliz', icon: '😊', label: 'Feliz' },
  { id: 'motivada', icon: '💪', label: 'Motivada' },
  { id: 'relajada', icon: '🧘‍♀️', label: 'Relajada' },
  { id: 'tranquila', icon: '😌', label: 'Tranquila' },
  { id: 'cansada', icon: '😴', label: 'Cansada' },
  { id: 'triste', icon: '😢', label: 'Triste' },
  { id: 'irritable', icon: '😤', label: 'Irritable' },
  { id: 'ansiosa', icon: '😰', label: 'Ansiosa' },
  { id: 'amorosa', icon: '🥰', label: 'Amorosa' },
  { id: 'neutra', icon: '🙂', label: 'Normal' }
]

export const SKIN_STATES = [
  { id: 'normal', icon: '✅', label: 'Normal' },
  { id: 'grasa', icon: '💦', label: 'Grasa' },
  { id: 'seca', icon: '🌵', label: 'Seca' },
  { id: 'mixta', icon: '🌗', label: 'Mixta' },
  { id: 'acne', icon: '🔴', label: 'Con acné' },
  { id: 'brillante', icon: '✨', label: 'Radiante' }
]

export const HAIR_STATES = [
  { id: 'normal', icon: '✅', label: 'Normal' },
  { id: 'seco', icon: '🌾', label: 'Seco' },
  { id: 'graso', icon: '💧', label: 'Graso' },
  { id: 'caida', icon: '🍂', label: 'Con caída' },
  { id: 'fuerte', icon: '💪', label: 'Fuerte' }
]

export const EXERCISE_LEVELS = [
  { id: 'ninguno', icon: '🛋️', label: 'Descanso' },
  { id: 'suave', icon: '🚶‍♀️', label: 'Suave' },
  { id: 'moderado', icon: '🏃‍♀️', label: 'Moderado' },
  { id: 'intenso', icon: '🏋️‍♀️', label: 'Intenso' }
]

export const METODOS = [
  { id: 'condon', icon: '🛡️', label: 'Condón' },
  { id: 'hormonal', icon: '💊', label: 'Pastillas' },
  { id: 'iu', icon: '⚓', label: 'DIU' },
  { id: 'implante', icon: '💉', label: 'Implante' },
  { id: 'inyeccion', icon: '🌡️', label: 'Inyección' },
  { id: 'parche', icon: '🩹', label: 'Parche' },
  { id: 'natural', icon: '🌿', label: 'Natural' },
  { id: 'ninguno', icon: '👀', label: 'Ninguno' }
]

export const PETS = [
  { id: 'gata', icon: '🐱', nombre: 'Mishi', frase: 'Miau, ¿cómo andas?' },
  { id: 'coneja', icon: '🐰', nombre: 'Nube', frase: 'Saltando de alegría!' },
  { id: 'zorrita', icon: '🦊', nombre: 'Rúbia', frase: '¡Detective del ciclo al rescate!' },
  { id: 'panda', icon: '🐼', nombre: 'Mei', frase: 'Zzz... ¡pero para la ester no!' },
  { id: 'mariposa', icon: '🦋', nombre: 'Alba', frase: '¡Nueva fase, nueva yo!' },
  { id: 'lunita', icon: '🌙', nombre: 'Luna', frase: 'Tu cuerpo es magia' },
  { id: 'flor', icon: '🌸', nombre: 'Blossom', frase: 'Eres asombrosa' },
  { id: 'pollito', icon: '🐣', nombre: 'Pipo', frase: 'Pio pio, ¡a crecer!' }
]

export const THEMES = [
  { id: 'luna', emoji: '💜', nombre: 'Luna Morada' },
  { id: 'rosa', emoji: '🌸', nombre: 'Rosa Crema' },
  { id: 'oceano', emoji: '🌊', nombre: 'Océano' },
  { id: 'bosque', emoji: '🌿', nombre: 'Bosque' },
  { id: 'atardecer', emoji: '🌅', nombre: 'Atardecer' },
  { id: 'medianoche', emoji: '🌌', nombre: 'Medianoche' }
]

/* ===== Consejos ===== */
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
      '📅 ¡Próximamente tu ventana fértil!'
    ],
    fertile: [
      '✨ Tu cuerpo está en su mejor momento',
      '💫 Energía alta, ¡aprovéchala!'
    ],
    ovulation: [
      '🌙 Día de ovulación aproximada',
      '💪 Tu temperatura basal sube ligeramente'
    ],
    luteal: [
      '🥰 Tu cuerpo necesita más calorías',
      '🛁 Baños tibios para relajarte',
      '📝 Registra cómo te sientes'
    ],
    premenstrual: [
      '🌿 Té de valeriana para calmarte',
      '😴 Duerme 30 min más si puedes',
      '🧘‍♀️ Respiración profunda ayuda'
    ]
  }
  const phaseTips = tips[phase] || tips['follicular']
  return phaseTips[Math.floor(Math.random() * phaseTips.length)]
}
