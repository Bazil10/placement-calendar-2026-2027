'use client'

import { useState } from 'react'
import { format, isToday } from 'date-fns'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import DriveListPopover from './DriveListPopover'
import DriveModal from './DriveModal'
import StatusBadge from './StatusBadge'
import {
  generateWeekDays,
  formatWeekRange,
  prevWeek,
  nextWeek,
  DAY_LABELS,
  RANGE_START,
  RANGE_END,
} from '@/lib/utils/calendar'
import type { Drive, Profile, DayCell } from '@/types'

interface WeekViewProps {
  drives: Drive[]
  profile: Profile
  showEmptyDates: boolean
  onSuccess?: () => void
}

export default function WeekView({
  drives,
  profile,
  showEmptyDates,
  onSuccess,
}: WeekViewProps) {
  const [currentWeek, setCurrentWeek] = useState(() => new Date('2026-01-04')) // First Sunday Jan 2026
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [addDriveDate, setAddDriveDate] = useState<string | null>(null)

  const weekDays = generateWeekDays(currentWeek, drives)

  const canGoPrev = currentWeek > RANGE_START
  const canGoNext = currentWeek < RANGE_END

  function goToToday() {
    const today = new Date()
    if (today >= RANGE_START && today <= RANGE_END) {
      setCurrentWeek(today)
    }
  }

  const selectedDateDrives = selectedDate
    ? drives.filter((d) => d.assigned_date === format(selectedDate, 'yyyy-MM-dd'))
    : []

  return (
    <div className="flex flex-col gap-3">
      {/* Week Navigation */}
      <div className="flex items-center justify-between px-1">
        <button
          onClick={() => setCurrentWeek(prevWeek(currentWeek))}
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

        <div className="flex items-center gap-2 text-center">
          <h2 className="text-base font-semibold text-ink">
            {formatWeekRange(currentWeek)}
          </h2>
          <button
            onClick={goToToday}
            className="text-xs font-medium text-brand-green-dark border border-brand-green-soft bg-surface-feature rounded-full px-2.5 py-0.5 active:opacity-80"
          >
            Today
          </button>
        </div>

        <button
          onClick={() => setCurrentWeek(nextWeek(currentWeek))}
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

      {/* Week Grid (horizontal scrollable on mobile) */}
      <div className="overflow-x-auto scrollbar-hidden -mx-2 sm:mx-0">
        <div className="min-w-[560px] sm:min-w-0 px-2 sm:px-0">
          {/* Day header row */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((cell: DayCell, idx) => (
              <div
                key={idx}
                className={cn(
                  'flex flex-col items-center rounded-lg py-2',
                  cell.isToday && 'bg-brand-teal-deep',
                  !cell.isInRange && 'opacity-40',
                )}
              >
                <span className={cn(
                  'text-[11px] font-semibold uppercase tracking-wide',
                  cell.isToday ? 'text-on-dark-muted' : 'text-stone'
                )}>
                  {DAY_LABELS[idx].slice(0, 3)}
                </span>
                <span className={cn(
                  'text-xl font-semibold mt-0.5',
                  cell.isToday ? 'text-on-dark' : 'text-ink'
                )}>
                  {format(cell.date, 'd')}
                </span>
                {cell.drives.length > 0 && (
                  <span className={cn(
                    'text-[10px] font-medium mt-0.5 px-1.5 rounded-full',
                    cell.isToday ? 'bg-brand-green text-on-primary' : 'bg-surface text-stone'
                  )}>
                    {cell.drives.length}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Drive columns */}
          <div className="grid grid-cols-7 gap-1">
            {weekDays.map((cell: DayCell, idx) => {
              const dateStr = format(cell.date, 'yyyy-MM-dd')
              const isEmpty = cell.drives.length === 0

              return (
                <div
                  key={idx}
                  className={cn(
                    'min-h-[140px] rounded-lg border flex flex-col gap-1 p-1.5',
                    cell.isToday ? 'border-brand-teal bg-blue-50/30' : 'border-hairline bg-canvas',
                    !cell.isInRange && 'opacity-30 pointer-events-none',
                    showEmptyDates && isEmpty && cell.isInRange && 'bg-surface-feature border-brand-green-soft',
                  )}
                >
                  {/* Drive chips */}
                  {cell.drives.map((drive) => (
                    <button
                      key={drive.id}
                      onClick={() => setSelectedDate(cell.date)}
                      className={cn(
                        'w-full text-left rounded p-1.5 text-[10px] font-medium transition-all',
                        drive.status === 'tentative'
                          ? 'bg-amber-100 text-amber-800 active:bg-amber-200'
                          : drive.status === 'fixed'
                          ? 'bg-red-100 text-red-700 active:bg-red-200'
                          : 'bg-gray-100 text-gray-500'
                      )}
                    >
                      <div className="flex items-center gap-1 mb-0.5">
                        <span className={cn(
                          'w-1.5 h-1.5 rounded-full flex-shrink-0',
                          drive.status === 'tentative' ? 'bg-amber-400' :
                          drive.status === 'fixed' ? 'bg-red-500' : 'bg-gray-400'
                        )} />
                        <span className="font-semibold truncate">{drive.company_name}</span>
                      </div>
                      <span className="opacity-75 truncate block">{drive.drive_type}</span>
                    </button>
                  ))}

                  {/* Add button */}
                  {cell.isInRange && (
                    <button
                      onClick={() => setAddDriveDate(dateStr)}
                      className={cn(
                        'mt-auto w-full flex items-center justify-center',
                        'text-[11px] text-stone rounded border border-dashed border-hairline',
                        'py-1 transition-colors active:bg-surface-soft',
                      )}
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Popover for date with drives */}
      {selectedDate && (
        <DriveListPopover
          date={selectedDate}
          drives={selectedDateDrives}
          profile={profile}
          onClose={() => setSelectedDate(null)}
          onSuccess={() => { onSuccess?.(); setSelectedDate(null) }}
        />
      )}

      {/* Modal for quick add */}
      {addDriveDate && (
        <DriveModal
          drive={null}
          selectedDate={addDriveDate}
          profile={profile}
          onClose={() => setAddDriveDate(null)}
          onSuccess={() => { onSuccess?.(); setAddDriveDate(null) }}
        />
      )}
    </div>
  )
}
