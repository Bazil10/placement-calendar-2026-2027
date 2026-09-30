import {
  addDays,
  addMonths,
  addWeeks,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  getDay,
  isSameDay,
  isSameMonth,
  isToday,
  isWithinInterval,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
  subWeeks,
} from 'date-fns'
import type { DayCell, Drive } from '@/types'

// ── Constants ────────────────────────────────────────────────
export const RANGE_START = new Date('2026-01-01')
export const RANGE_END   = new Date('2027-06-30')

export const DRIVE_TYPE_OPTIONS = [
  'Summer Internship',
  'Final Placement',
  'Both',
  'GL',
] as const

export const PROCESS_STAGE_OPTIONS = [
  'PPT',
  'Aptitude/Coding Test',
  'GD',
  'PI',
] as const

export const STATUS_LABELS = {
  tentative: 'Tentative',
  fixed:     'Fixed',
  cancelled: 'Cancelled',
} as const

export const STATUS_COLORS = {
  tentative: {
    bg:   'bg-amber-100',
    text: 'text-amber-800',
    dot:  'bg-amber-400',
    border: 'border-amber-300',
  },
  fixed: {
    bg:   'bg-red-100',
    text: 'text-red-800',
    dot:  'bg-red-500',
    border: 'border-red-300',
  },
  cancelled: {
    bg:   'bg-gray-100',
    text: 'text-gray-500',
    dot:  'bg-gray-400',
    border: 'border-gray-300',
  },
} as const

// ── Month View ───────────────────────────────────────────────

/**
 * Generate a 6-week grid (42 cells) for a given month.
 * Includes leading/trailing days from adjacent months.
 */
export function generateMonthGrid(month: Date, drives: Drive[]): DayCell[] {
  const monthStart  = startOfMonth(month)
  const monthEnd    = endOfMonth(month)
  const gridStart   = startOfWeek(monthStart, { weekStartsOn: 0 }) // Sunday
  const gridEnd     = endOfWeek(monthEnd, { weekStartsOn: 0 })

  return eachDayOfInterval({ start: gridStart, end: gridEnd }).map((date) => ({
    date,
    isCurrentMonth: isSameMonth(date, month),
    isToday:        isToday(date),
    isInRange:      isWithinInterval(date, { start: RANGE_START, end: RANGE_END }),
    drives: drivesForDate(drives, date),
  }))
}

// ── Week View ────────────────────────────────────────────────

/**
 * Generate 7-day array for a given week.
 */
export function generateWeekDays(week: Date, drives: Drive[]): DayCell[] {
  const weekStart = startOfWeek(week, { weekStartsOn: 0 })
  const weekEnd   = addDays(weekStart, 6)

  return eachDayOfInterval({ start: weekStart, end: weekEnd }).map((date) => ({
    date,
    isCurrentMonth: isSameMonth(date, week),
    isToday:        isToday(date),
    isInRange:      isWithinInterval(date, { start: RANGE_START, end: RANGE_END }),
    drives: drivesForDate(drives, date),
  }))
}

// ── Navigation ───────────────────────────────────────────────

export const prevMonth = (d: Date) => subMonths(d, 1)
export const nextMonth = (d: Date) => addMonths(d, 1)
export const prevWeek  = (d: Date) => subWeeks(d, 1)
export const nextWeek  = (d: Date) => addWeeks(d, 1)

// ── Helpers ──────────────────────────────────────────────────

export function drivesForDate(drives: Drive[], date: Date): Drive[] {
  const iso = format(date, 'yyyy-MM-dd')
  return drives.filter((d) => d.assigned_date === iso)
}

export function isDateEmpty(drives: Drive[], date: Date): boolean {
  return drivesForDate(drives, date).length === 0
}

export function formatDateDisplay(date: Date): string {
  return format(date, 'd')
}

export function formatMonthYear(date: Date): string {
  return format(date, 'MMMM yyyy')
}

export function formatWeekRange(date: Date): string {
  const start = startOfWeek(date, { weekStartsOn: 0 })
  const end   = addDays(start, 6)
  if (isSameMonth(start, end)) {
    return `${format(start, 'MMM d')} – ${format(end, 'd, yyyy')}`
  }
  return `${format(start, 'MMM d')} – ${format(end, 'MMM d, yyyy')}`
}

export function formatDriveDate(isoDate: string): string {
  return format(parseISO(isoDate), 'dd MMM yyyy')
}

export function parseDateToIso(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

/** Returns all unique months in the target range as { label, value: Date } */
export function getRangeMonths(): { label: string; value: Date }[] {
  const months: { label: string; value: Date }[] = []
  let current = RANGE_START
  while (current <= RANGE_END) {
    months.push({ label: format(current, 'MMM yyyy'), value: current })
    current = addMonths(current, 1)
  }
  return months
}

export const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
export const DAY_LABELS_MOBILE = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
