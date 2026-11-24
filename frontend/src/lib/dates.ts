import {
  addDays,
  differenceInCalendarDays,
  format,
  isValid,
  parseISO,
  startOfWeek,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'

export const ISO_DATE = 'yyyy-MM-dd'

export function todayISO(now = new Date()): string {
  return format(now, ISO_DATE)
}

export function parseISODate(value: string): Date {
  const parsed = parseISO(value)
  return isValid(parsed) ? parsed : new Date()
}

export function isValidISODate(value: string): boolean {
  return isValid(parseISO(value))
}

export function addDaysISO(value: string, amount: number): string {
  return format(addDays(parseISODate(value), amount), ISO_DATE)
}

export function startOfWeekISO(value: string, weekStartsOn: 0 | 1 = 1): string {
  return format(
    startOfWeek(parseISODate(value), { weekStartsOn }),
    ISO_DATE,
  )
}

export function weekDates(anchorISO: string): string[] {
  const start = startOfWeekISO(anchorISO)
  return Array.from({ length: 7 }, (_, index) => addDaysISO(start, index))
}

export function formatDateLong(value: string): string {
  return capitalize(
    format(parseISODate(value), "EEEE, d 'de' MMMM", { locale: ptBR }),
  )
}

export function formatDateShort(value: string): string {
  return format(parseISODate(value), "d 'de' MMM", { locale: ptBR })
}

export function formatDateCompact(value: string): string {
  return format(parseISODate(value), 'dd/MM/yyyy')
}

export function formatWeekdayShort(value: string): string {
  return format(parseISODate(value), 'EEE', { locale: ptBR }).replace('.', '')
}

export function formatWeekdayLong(value: string): string {
  return capitalize(
    format(parseISODate(value), 'EEEE', { locale: ptBR }),
  )
}

export function formatDayNumber(value: string): string {
  return format(parseISODate(value), 'd')
}

export function formatMonthShort(value: string): string {
  return format(parseISODate(value), 'MMM', { locale: ptBR }).replace('.', '')
}

export function formatMonthYear(value: string): string {
  return capitalize(
    format(parseISODate(value), "MMMM 'de' yyyy", { locale: ptBR }),
  )
}

export function formatWeekRange(startISO: string): string {
  const endISO = addDaysISO(startISO, 6)
  const start = parseISODate(startISO)
  const end = parseISODate(endISO)
  if (start.getMonth() === end.getMonth()) {
    return `${format(start, 'd', { locale: ptBR })}–${format(end, "d 'de' MMM", {
      locale: ptBR,
    })}`
  }
  return `${format(start, "d 'de' MMM", { locale: ptBR })} – ${format(
    end,
    "d 'de' MMM",
    { locale: ptBR },
  )}`
}

export function isToday(value: string): boolean {
  return value === todayISO()
}

export function relativeDayLabel(value: string): string {
  const diff = differenceInCalendarDays(parseISODate(value), new Date())
  if (diff === 0) return 'Hoje'
  if (diff === 1) return 'Amanhã'
  if (diff === -1) return 'Ontem'
  return capitalize(
    format(parseISODate(value), "EEE, d 'de' MMM", { locale: ptBR }),
  )
}

export function greetingFor(date = new Date()): string {
  const hour = date.getHours()
  if (hour < 12) return 'Bom dia'
  if (hour < 18) return 'Boa tarde'
  return 'Boa noite'
}

export function longTodayLabel(date = new Date()): string {
  return capitalize(format(date, "EEEE, d 'de' MMMM", { locale: ptBR }))
}

export function toDateInputValue(date: Date): string {
  return format(date, ISO_DATE)
}

export function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}
