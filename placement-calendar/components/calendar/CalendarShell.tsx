'use client'

import { useState, useMemo } from 'react'
import {
  Calendar,
  Grid3X3,
  LayoutGrid,
  CalendarDays,
  Filter,
  Plus,
  Loader2,
  AlertTriangle,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import MonthView  from './MonthView'
import WeekView   from './WeekView'
import DriveGrid  from './DriveGrid'
import DriveModal from './DriveModal'
import { useDrives }  from '@/lib/hooks/useDrives'
import type { CalendarTab, CalendarView, Profile } from '@/types'

interface CalendarShellProps {
  profile: Profile
}

export default function CalendarShell({ profile }: CalendarShellProps) {
  const [activeTab, setActiveTab]         = useState<CalendarTab>('all')
  const [calView, setCalView]             = useState<CalendarView>('month')
  const [showEmptyDates, setShowEmptyDates] = useState(false)
  const [addModalOpen, setAddModalOpen]   = useState(false)

  // Resolve status filter from active tab
  const statusFilter = useMemo(() => {
    if (activeTab === 'fixed')     return 'fixed' as const
    if (activeTab === 'tentative') return 'tentative' as const
    return 'all' as const
  }, [activeTab])

  const { drives, loading, error, refetch } = useDrives({
    status:   statusFilter,
    dateFrom: '2026-01-01',
    dateTo:   '2027-06-30',
  })

  const tabs: { key: CalendarTab; label: string; icon: React.ReactNode }[] = [
    {
      key: 'fixed',
      label: 'Fixed Calendar',
      icon: <Calendar className="w-4 h-4" />,
    },
    {
      key: 'tentative',
      label: 'Tentative Calendar',
      icon: <CalendarDays className="w-4 h-4" />,
    },
    {
      key: 'all',
      label: 'All Drives',
      icon: <Grid3X3 className="w-4 h-4" />,
    },
  ]

  return (
    <div className="flex flex-col gap-4">

      {/* ── Header Controls ─────────────────────────────── */}
      <div className="flex flex-col gap-3">

        {/* Tab Row */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hidden -mx-1 px-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'flex items-center gap-1.5 flex-shrink-0 transition-all duration-150',
                activeTab === tab.key ? 'pill-tab-active' : 'pill-tab'
              )}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
            </button>
          ))}
        </div>

        {/* Secondary controls row */}
        {activeTab !== 'all' && (
          <div className="flex items-center justify-between gap-2">
            {/* Month / Week toggle */}
            <div className="flex items-center bg-canvas border border-hairline rounded-full p-0.5 gap-0.5">
              <button
                onClick={() => setCalView('month')}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-150',
                  calView === 'month'
                    ? 'bg-ink text-on-dark'
                    : 'text-steel'
                )}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Month</span>
              </button>
              <button
                onClick={() => setCalView('week')}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-150',
                  calView === 'week'
                    ? 'bg-ink text-on-dark'
                    : 'text-steel'
                )}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Week</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              {/* Empty Dates filter */}
              <button
                onClick={() => setShowEmptyDates(!showEmptyDates)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium border transition-all duration-150',
                  showEmptyDates
                    ? 'bg-surface-feature border-brand-green text-brand-green-dark'
                    : 'bg-canvas border-hairline text-steel'
                )}
              >
                <Filter className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Empty Dates</span>
              </button>

              {/* Add Drive button */}
              <button
                onClick={() => setAddModalOpen(true)}
                className="btn-primary py-2 px-4 gap-1.5 text-sm"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add Drive</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'all' && (
          <div className="flex justify-end">
            <button
              onClick={() => setAddModalOpen(true)}
              className="btn-primary py-2 px-4 gap-1.5 text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Drive</span>
            </button>
          </div>
        )}
      </div>

      {/* ── Status Bar ──────────────────────────────────── */}
      <div className="flex items-center gap-2">
        {/* Status summary badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="flex items-center gap-1.5 text-xs text-steel">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            {drives.filter(d => d.status === 'fixed').length} Fixed
          </span>
          <span className="flex items-center gap-1.5 text-xs text-steel">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            {drives.filter(d => d.status === 'tentative').length} Tentative
          </span>
          {loading && (
            <Loader2 className="w-3.5 h-3.5 text-stone animate-spin" />
          )}
        </div>
      </div>

      {/* ── Error State ─────────────────────────────────── */}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-700 text-sm">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>Failed to load drives: {error}</span>
          <button onClick={refetch} className="ml-auto text-xs underline">Retry</button>
        </div>
      )}

      {/* ── Calendar Views ──────────────────────────────── */}
      {loading && drives.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-stone gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-brand-green" />
          <span className="text-sm">Loading drives…</span>
        </div>
      ) : (
        <>
          {activeTab !== 'all' && calView === 'month' && (
            <MonthView
              drives={drives}
              profile={profile}
              showEmptyDates={showEmptyDates}
              onSuccess={refetch}
            />
          )}

          {activeTab !== 'all' && calView === 'week' && (
            <WeekView
              drives={drives}
              profile={profile}
              showEmptyDates={showEmptyDates}
              onSuccess={refetch}
            />
          )}

          {activeTab === 'all' && (
            <DriveGrid
              drives={drives}
              profile={profile}
              onSuccess={refetch}
            />
          )}
        </>
      )}

      {/* ── Add Drive Modal ─────────────────────────────── */}
      {addModalOpen && (
        <DriveModal
          drive={null}
          profile={profile}
          onClose={() => setAddModalOpen(false)}
          onSuccess={() => { refetch(); setAddModalOpen(false) }}
        />
      )}
    </div>
  )
}
