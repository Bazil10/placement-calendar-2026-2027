'use client'

import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import {
  X,
  Plus,
  Building2,
  Tag,
  User,
  Layers,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import StatusBadge from './StatusBadge'
import DriveModal from './DriveModal'
import type { Drive, Profile } from '@/types'

interface DriveListPopoverProps {
  date: Date
  drives: Drive[]
  profile: Profile
  onClose: () => void
  onSuccess?: () => void
}

export default function DriveListPopover({
  date,
  drives,
  profile,
  onClose,
  onSuccess,
}: DriveListPopoverProps) {
  const [selectedDrive, setSelectedDrive] = useState<Drive | null | 'create'>(null)
  const isAdmin = profile.role === 'admin'

  const dateStr    = format(date, 'yyyy-MM-dd')
  const dateLabel  = format(date, 'EEEE, d MMMM yyyy')
  const canAddDrive = true // all roles can create tentative

  if (selectedDrive !== null) {
    return (
      <DriveModal
        drive={selectedDrive === 'create' ? null : selectedDrive}
        selectedDate={dateStr}
        profile={profile}
        onClose={() => setSelectedDrive(null)}
        onSuccess={() => { onSuccess?.(); setSelectedDrive(null) }}
      />
    )
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink/40 z-50 animate-fade-in"
        onClick={onClose}
      />

      {/* Sheet / Popover */}
      <div className={cn(
        'fixed z-50 bg-canvas',
        'bottom-0 left-0 right-0 rounded-t-2xl',
        'sm:bottom-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2',
        'sm:w-full sm:max-w-md sm:rounded-xl',
        'max-h-[80vh] flex flex-col shadow-modal animate-slide-up'
      )}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-hairline flex-shrink-0">
          <div>
            <p className="text-xs font-semibold text-stone uppercase tracking-wide">
              {format(date, 'EEEE')}
            </p>
            <h3 className="text-lg font-semibold text-ink">
              {format(date, 'd MMMM yyyy')}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone">
              {drives.length} drive{drives.length !== 1 ? 's' : ''}
            </span>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full text-stone active:bg-surface-soft"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Drive List */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
          {drives.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-12 h-12 rounded-full bg-surface-feature flex items-center justify-center mb-3">
                <Building2 className="w-6 h-6 text-brand-green-dark" />
              </div>
              <p className="text-sm font-medium text-ink">No drives scheduled</p>
              <p className="text-xs text-stone mt-1">Tap "Add Drive" to propose one</p>
            </div>
          ) : (
            drives.map((drive) => (
              <button
                key={drive.id}
                onClick={() => setSelectedDrive(drive)}
                className={cn(
                  'w-full text-left bg-canvas border rounded-lg p-3.5',
                  'transition-all duration-150 active:bg-surface-soft',
                  drive.status === 'tentative' ? 'border-amber-200' :
                  drive.status === 'fixed'     ? 'border-red-200'   :
                  'border-hairline'
                )}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                      drive.status === 'tentative' ? 'bg-amber-100' :
                      drive.status === 'fixed'     ? 'bg-red-100'   :
                      'bg-gray-100'
                    )}>
                      <Building2 className={cn(
                        'w-4 h-4',
                        drive.status === 'tentative' ? 'text-amber-700' :
                        drive.status === 'fixed'     ? 'text-red-600'   :
                        'text-gray-500'
                      )} />
                    </div>
                    <span className="font-semibold text-sm text-ink">{drive.company_name}</span>
                  </div>
                  <StatusBadge status={drive.status} size="sm" />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-steel">
                    <Tag className="w-3 h-3 flex-shrink-0" />
                    <span>{drive.drive_type}</span>
                  </div>
                  {drive.process_stages.length > 0 && (
                    <div className="flex items-center gap-1.5 text-xs text-steel">
                      <Layers className="w-3 h-3 flex-shrink-0" />
                      <span>{drive.process_stages.join(' → ')}</span>
                    </div>
                  )}
                  {drive.poc_name && (
                    <div className="flex items-center gap-1.5 text-xs text-steel">
                      <User className="w-3 h-3 flex-shrink-0" />
                      <span>{drive.poc_name}</span>
                    </div>
                  )}
                </div>

                {isAdmin && drive.status === 'tentative' && (
                  <div className="mt-2 pt-2 border-t border-hairline">
                    <span className="text-[11px] text-brand-green-dark font-medium">
                      Tap to confirm &amp; fix date →
                    </span>
                  </div>
                )}
              </button>
            ))
          )}
        </div>

        {/* Add Drive Button */}
        {canAddDrive && (
          <div className="px-4 py-4 border-t border-hairline flex-shrink-0 pb-safe">
            <button
              onClick={() => setSelectedDrive('create')}
              className="btn-primary w-full gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Drive
            </button>
          </div>
        )}
      </div>
    </>
  )
}
