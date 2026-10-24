import { useState, useEffect } from 'react'
import { subscribe, getState, setLastPeriodStart, getPhaseTip } from '../store'
import { FaChevronLeft, FaChevronRight, FaHeart } from 'react-icons/fa'
import { format, addMonths, subMonths, startOfMonth, startOfWeek, addDays, isSameDay } from 'date-fns'
import { es } from 'date-fns/locale'
import { getDayInfo, predictNextPeriod } from '../store'

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [state, setState] = useState(getState())
  const [showSave, setShowSave] = useState(false)

  useEffect(() => {
    const unsub = subscribe(setState)
    return unsub
  }, [])

  const weekDays = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do']

  const renderCalendar = () => {
    const monthStart = startOfMonth(currentDate)
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 })
    const days = []
    let day = startDate

    for (let week = 0; week < 6; week++) {
      const weekDaysArr = []
      for (let i = 0; i < 7; i++) {
        const date = addDays(day, i)
        const dateStr = format(date, 'yyyy-MM-dd')
        const info = getDayInfo(dateStr)
        const today = new Date()
        const isToday = isSameDay(date, today)
        const isSelected = isSameDay(date, selectedDate)
        const isCurrentMonth = date.getMonth() === currentDate.getMonth()

        let dayClass = 'calendar-day'
        if (info.phase === 'period' || info.phase === 'period-predicted') dayClass += ' day-period'
        else if (info.phase === 'fertile') dayClass += ' day-fertile'
        else if (info.phase === 'ovulation') dayClass += ' day-ovulation'
        else if (isToday) dayClass += ' day-today'
        if (isSelected) dayClass += ' day-selected'
        if (!isCurrentMonth) dayClass += ' day-other-month'

        weekDaysArr.push(
          <div
            key={dateStr}
            className={dayClass}
            onClick={() => {
              setSelectedDate(date)
              setShowDate(date)
            }}
            title={info.label || 'Día normal'}
          >
            {format(date, 'd')}
            {info.phase === 'period' && <div className="calendar-dot-period" />}
          </div>
        )
      }
      days.push(
        <div key={week} className="calendar-week">
          {weekDaysArr}
        </div>
      )
      day = addDays(day, 7)
    }

    return days
  }

  const [showDate, setShowDate] = useState(new Date())

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1))
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1))
  const handleToday = () => {
    setCurrentDate(new Date())
    setSelectedDate(new Date())
    setShowDate(new Date())
  }

  const prediction = predictNextPeriod()
  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd')
  const selectedInfo = getDayInfo(selectedDateStr)
  const phaseTip = getPhaseTip(selectedInfo.phase)

  return (
    <div className="calendar-container fade-in-stagger">
      {/* Header */}
      <div className="calendar-header">
        <button onClick={handlePrevMonth} className="btn-icon">
          <FaChevronLeft />
        </button>
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">
            {format(currentDate, 'MMMM yyyy', { locale: es })}
          </h2>
          <button onClick={handleToday} className="btn-today">
            Hoy
          </button>
        </div>
        <button onClick={handleNextMonth} className="btn-icon">
          <FaChevronRight />
        </button>
      </div>

      {/* Días de la semana */}
      <div className="weekdays">
        {weekDays.map(day => (
          <div key={day} className="weekday">{day}</div>
        ))}
      </div>

      {/* Calendario */}
      <div className="card" style={{padding: '0.75rem'}}>
        {renderCalendar()}
      </div>

      {/* Leyenda */}
      <div className="card mt-4" style={{padding: '1rem'}}>
        <h3 className="card-subtitle mb-2">Leyenda</h3>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded-full" style={{background: 'linear-gradient(135deg, #ff6b9d, #c77dff)'}} />
            <span className="text-xs">Período</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded-full" style={{background: 'linear-gradient(135deg, #9d8fef, #c77dff)'}} />
            <span className="text-xs">Fértil</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded-full border-2" style={{borderColor: 'var(--accent-soft)'}} />
            <span className="text-xs">Hoy</span>
          </div>
        </div>
      </div>

      {/* Info del día seleccionado */}
      <div className="card mt-4">
        <div className="flex items-center gap-3 mb-3">
          <div className={`phase-icon ${
            selectedInfo.phase === 'period' || selectedInfo.phase === 'period-predicted' ? 'day-period text-white' :
            selectedInfo.phase === 'fertile' ? 'day-fertile text-white' :
            'bg-card text-accent'
          }`}>
            {selectedInfo.phase === 'period' || selectedInfo.phase === 'period-predicted' ? '🩸' :
             selectedInfo.phase === 'fertile' ? '✨' :
             selectedInfo.phase === 'ovulation' ? '🌙' :
             selectedInfo.phase === 'follicular' ? '🌱' :
             selectedInfo.phase === 'luteal' ? '🌓' :
             selectedInfo.phase === 'premenstrual' ? '💫' : '📅'}
          </div>
          <div>
            <p className="font-medium">{selectedInfo.label || 'Sin información'}</p>
            <p className="text-sm text-text-secondary">
              {selectedInfo.day > 0 ? `Ciclo día ${selectedInfo.day}` : 'Fuera del ciclo'}
            </p>
          </div>
        </div>

        {/* Tip de la fase */}
        {selectedInfo.phase !== 'none' && (
          <div className="card mb-4" style={{
            background: 'linear-gradient(135deg, rgba(199, 125, 255, 0.1), rgba(255, 107, 157, 0.05))',
            border: '1px solid rgba(199, 125, 255, 0.2)',
            padding: '0.75rem',
            borderRadius: '0.75rem'
          }}>
            <p className="text-sm">{phaseTip}</p>
          </div>
        )}

        {prediction && (
          <div className="prediction-info">
            <p className="text-xs text-text-secondary mb-1">Próximo ciclo:</p>
            <p className="text-sm mb-1">
              📅 Comienza: {format(prediction.nextStart, "dd/MM/yyyy", { locale: es })}
            </p>
            <p className="text-sm mb-2">
              ✨ Ventana fértil: {format(prediction.fertileStart, "dd/MM", { locale: es })} - {format(prediction.fertileEnd, "dd/MM", { locale: es })}
            </p>
            <button
              onClick={() => {
                setLastPeriodStart(format(selectedDate, 'yyyy-MM-dd'))
                setShowSave(true)
                setTimeout(() => setShowSave(false), 2000)
              }}
              className="btn-primary text-sm py-1 px-3"
            >
              Guardar como primer día
            </button>
            {showSave && (
              <p className="text-xs text-success mt-2 slide-up">
                ✓ Guardado correctamente
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}