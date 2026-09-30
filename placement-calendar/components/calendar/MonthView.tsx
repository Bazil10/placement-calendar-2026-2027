'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import { format, isToday, isSameMonth } from 'date-fns'
import { cn } from '@/lib/utils/cn'
import DriveListPopover from './DriveListPopover'
import {
  generateMonthGrid,
  formatMonthYear,
  prevMonth,
  nextMonth,
  DAY_LABELS,
  DAY_LABELS_MOBILE,
  RANGE_START,
  RANGE_END,
} from '@/lib/utils/calendar'
import type { Drive, Profile, DayCell } from '@/types'

interface MonthViewProps {
  drives: Drive[]
  profile: Profile
  showEmptyDates: boolean
  onSuccess?: () => void
}

export default function MonthView({
  drives,
  profile,
  showEmptyDates,
  onSuccess,
}: MonthViewProps) {
  const [currentMonth, setCurrentMonth] = useState(() => new Date('2026-01-01'))
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const grid = generateMonthGrid(currentMonth, drives)

  const canGoPrev = currentMonth > RANGE_START
  const canGoNext = (() => {
    const next = nextMonth(currentMonth)
    return next <= RANGE_END
  })()

  function goToToday() {
    const today = new Date()
    if (today >= RANGE_START && today <= RANGE_END) {
      setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1))
    }
  }

  const selectedDateDrives = selectedDate
    ? drives.filter((d) => d.assigned_date === format(selectedDate, 'yyyy-MM-dd'))
    : []

  return (
    <div className="flex flex-col h-full">
      {/* Month Navigation */}
      <div className="flex items-center justify-between px-1 mb-3">
        <button
          onClick={() => setCurrentMonth(prevMonth(currentMonth))}
          disabled={!canGoPrev}
          className={cn(
            'w-9 h-9 flex items-center justify-center rounded-full',
            'text-steel border border-hairline transition-colors duration-150',
            'active:bg-surface-soft',
            !canGoPrev && 'opacity-30 cursor-not-allowed'
          )}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-ink">
            {formatMonthYear(currentMonth)}
          </h2>
          <button
            onClick={goToToday}
            className="text-xs font-medium text-brand-green-dark border border-brand-green-soft bg-surface-feature rounded-full px-2.5 py-0.5 active:opacity-80"
          >
            Today
          </button>
        </div>

        <button
          onClick={() => setCurrentMonth(nextMonth(currentMonth))}
          disabled={!canGoNext}
          className={cn(
            'w-9 h-9 flex items-center justify-center rounded-full',
            'text-steel border border-hairline transition-colors duration-150',
            'active:bg-surface-soft',
            !canGoNext && 'opacity-30 cursor-not-allowed'
          )}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Day Labels */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_LABELS.map((label, i) => (
          <div
            key={label}
            className="text-center text-[11px] font-semibold text-stone uppercase tracking-wide py-1.5"
          >
            <span className="hidden sm:inline">{label}</span>
            <span className="sm:hidden">{DAY_LABELS_MOBILE[i]}</span>
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 border-l border-t border-hairline rounded-lg overflow-hidden bg-canvas flex-1">
        {grid.map((cell: DayCell, idx) => {
          const dateStr     = format(cell.date, 'yyyy-MM-dd')
          const isEmpty     = cell.drives.length === 0
          const isSelected  = selectedDate ? format(selectedDate, 'yyyy-MM-dd') === dateStr : false
          const tentative   = cell.drives.filter((d) => d.status === 'tentative')
          const fixed       = cell.drives.filter((d) => d.status === 'fixed')
          const dimmed      = !cell.isCurrentMonth || !cell.isInRange

          return (
            <div
              key={idx}
              onClick={() => {
                if (cell.isInRange) setSelectedDate(cell.date)
              }}
              className={cn(
                'cal-day',
                dimmed && 'opacity-40 cursor-default',
                cell.isInRange && !dimmed && 'cursor-pointer',
                isSelected && 'bg-surface-feature ring-2 ring-inset ring-brand-green',
                cell.isToday && !isSelected && 'bg-blue-50/50',
                showEmptyDates && isEmpty && cell.isInRange && !dimmed && 'cal-day-empty-highlight',
              )}
            >
              {/* Date number */}
              <div className={cn(
                'text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full mb-0.5',
                cell.isToday ? 'bg-brand-teal-deep text-on-dark' : 'text-ink',
                dimmed && 'text-stone'
              )}>
                {format(cell.date, 'd')}
              </div>

              {/* Drive indicators */}
              <div className="flex flex-col gap-0.5 overflow-hidden">
                {fixed.slice(0, 2).map((d) => (
                  <div
                    key={d.id}
                    className="flex items-center gap-1 bg-red-100 rounded text-[10px] text-red-700 font-medium px-1 py-0.5 truncate"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                    <span className="truncate hidden sm:block">{d.company_name}</span>
                  </div>
                ))}
                {tentative.slice(0, 2).map((d) => (
                  <div
                    key={d.id}
                    className="flex items-center gap-1 bg-amber-100 rounded text-[10px] text-amber-800 font-medium px-1 py-0.5 truncate"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                    <span className="truncate hidden sm:block">{d.company_name}</span>
                  </div>
                ))}
                {/* Overflow indicator */}
                {cell.drives.length > 4 && (
                  <div className="text-[10px] text-stone font-medium px-1">
                    +{cell.drives.length - 4} more
                  </div>
                )}
                {/* Mobile: dot count only */}
                {cell.drives.length > 0 && (
                  <div className="sm:hidden flex items-center gap-0.5 mt-0.5">
                    {fixed.length > 0 && (
                      <span className="flex items-center gap-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                        {fixed.length > 1 && <span className="text-[9px] text-red-600">{fixed.length}</span>}
                      </span>
                    )}
                    {tentative.length > 0 && (
                      <span className="flex items-center gap-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        {tentative.length > 1 && <span className="text-[9px] text-amber-700">{tentative.length}</span>}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 px-1 flex-wrap">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
          <span className="text-xs text-steel">Fixed / Confirmed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <span className="text-xs text-steel">Tentative</span>
        </div>
        {showEmptyDates && (
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-surface-feature border border-brand-green-soft" />
            <span className="text-xs text-brand-green-dark font-medium">Empty date</span>
          </div>
        )}
      </div>

      {/* Drive List Popover */}
      {selectedDate && (
        <DriveListPopover
          date={selectedDate}
          drives={selectedDateDrives}
          profile={profile}
          onClose={() => setSelectedDate(null)}
          onSuccess={() => { onSuccess?.(); setSelectedDate(null) }}
        />
      )}
    </div>
  )
}
