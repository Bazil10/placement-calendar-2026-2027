'use client'

import { useState, useMemo } from 'react'
import { format } from 'date-fns'
import {
  ArrowUpDown,
  Building2,
  Calendar,
  Tag,
  User,
  Layers,
  ChevronUp,
  ChevronDown,
  Search,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import StatusBadge from './StatusBadge'
import DriveModal from './DriveModal'
import { formatDriveDate } from '@/lib/utils/calendar'
import type { Drive, Profile, DriveStatus } from '@/types'

interface DriveGridProps {
  drives: Drive[]
  profile: Profile
  onSuccess?: () => void
}

type SortField = 'assigned_date' | 'company_name' | 'drive_type' | 'status'
type SortDir   = 'asc' | 'desc'

export default function DriveGrid({ drives, profile, onSuccess }: DriveGridProps) {
  const [selectedDrive, setSelectedDrive] = useState<Drive | null>(null)
  const [sortField, setSortField]         = useState<SortField>('assigned_date')
  const [sortDir, setSortDir]             = useState<SortDir>('asc')
  const [searchQuery, setSearchQuery]     = useState('')
  const [statusFilter, setStatusFilter]   = useState<DriveStatus | 'all'>('all')

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir('asc')
    }
  }

  const filtered = useMemo(() => {
    let result = [...drives]

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter((d) => d.status === statusFilter)
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (d) =>
          d.company_name.toLowerCase().includes(q) ||
          d.drive_type.toLowerCase().includes(q) ||
          d.poc_name.toLowerCase().includes(q) ||
          (d.notes || '').toLowerCase().includes(q)
      )
    }

    // Sort
    result.sort((a, b) => {
      let cmp = 0
      if (sortField === 'assigned_date') {
        cmp = a.assigned_date.localeCompare(b.assigned_date)
      } else if (sortField === 'company_name') {
        cmp = a.company_name.localeCompare(b.company_name)
      } else if (sortField === 'drive_type') {
        cmp = a.drive_type.localeCompare(b.drive_type)
      } else if (sortField === 'status') {
        cmp = a.status.localeCompare(b.status)
      }
      return sortDir === 'asc' ? cmp : -cmp
    })

    return result
  }, [drives, statusFilter, searchQuery, sortField, sortDir])

  function SortIcon({ field }: { field: SortField }) {
    if (sortField !== field) return <ArrowUpDown className="w-3.5 h-3.5 text-stone" />
    return sortDir === 'asc'
      ? <ChevronUp   className="w-3.5 h-3.5 text-brand-green-dark" />
      : <ChevronDown className="w-3.5 h-3.5 text-brand-green-dark" />
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-2">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone" />
          <input
            type="text"
            placeholder="Search company, type, POC…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-9 pr-9 text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Status filter pills */}
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hidden flex-shrink-0">
          {(['all', 'tentative', 'fixed'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                statusFilter === s ? 'pill-tab-active' : 'pill-tab',
                'flex-shrink-0 capitalize'
              )}
            >
              {s === 'all' ? 'All Drives' : s}
            </button>
          ))}
        </div>
      </div>

      {/* Result count */}
      <p className="text-xs text-stone px-1">
        Showing <span className="font-semibold text-ink">{filtered.length}</span> drive{filtered.length !== 1 ? 's' : ''}
        {searchQuery && ` matching "${searchQuery}"`}
      </p>

      {/* Table (desktop) */}
      <div className="hidden sm:block overflow-x-auto rounded-lg border border-hairline">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-surface border-b border-hairline">
              <th className="text-left px-4 py-3">
                <button
                  onClick={() => toggleSort('assigned_date')}
                  className="flex items-center gap-1 text-xs font-semibold text-slate uppercase tracking-wide"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  Date <SortIcon field="assigned_date" />
                </button>
              </th>
              <th className="text-left px-4 py-3">
                <button
                  onClick={() => toggleSort('company_name')}
                  className="flex items-center gap-1 text-xs font-semibold text-slate uppercase tracking-wide"
                >
                  <Building2 className="w-3.5 h-3.5" />
                  Company <SortIcon field="company_name" />
                </button>
              </th>
              <th className="text-left px-4 py-3">
                <button
                  onClick={() => toggleSort('drive_type')}
                  className="flex items-center gap-1 text-xs font-semibold text-slate uppercase tracking-wide"
                >
                  <Tag className="w-3.5 h-3.5" />
                  Type <SortIcon field="drive_type" />
                </button>
              </th>
              <th className="text-left px-4 py-3">
                <span className="flex items-center gap-1 text-xs font-semibold text-slate uppercase tracking-wide">
                  <Layers className="w-3.5 h-3.5" />
                  Stages
                </span>
              </th>
              <th className="text-left px-4 py-3">
                <span className="flex items-center gap-1 text-xs font-semibold text-slate uppercase tracking-wide">
                  <User className="w-3.5 h-3.5" />
                  POC
                </span>
              </th>
              <th className="text-left px-4 py-3">
                <button
                  onClick={() => toggleSort('status')}
                  className="flex items-center gap-1 text-xs font-semibold text-slate uppercase tracking-wide"
                >
                  Status <SortIcon field="status" />
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-stone text-sm">
                  No drives found
                </td>
              </tr>
            ) : (
              filtered.map((drive, idx) => (
                <tr
                  key={drive.id}
                  onClick={() => setSelectedDrive(drive)}
                  className={cn(
                    'border-b border-hairline-soft cursor-pointer transition-colors',
                    'active:bg-surface-soft',
                    idx % 2 === 0 ? 'bg-canvas' : 'bg-surface/50',
                  )}
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="font-medium text-ink">{formatDriveDate(drive.assigned_date)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-ink">{drive.company_name}</span>
                    {drive.notes && (
                      <p className="text-xs text-stone truncate max-w-[180px] mt-0.5">{drive.notes}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-slate">{drive.drive_type}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {drive.process_stages.map((s) => (
                        <span
                          key={s}
                          className="text-[11px] bg-surface text-steel px-2 py-0.5 rounded-full border border-hairline"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-slate">
                    {drive.poc_name}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={drive.status} size="sm" />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Card list (mobile) */}
      <div className="sm:hidden space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-10 text-stone text-sm">No drives found</div>
        ) : (
          filtered.map((drive) => (
            <button
              key={drive.id}
              onClick={() => setSelectedDrive(drive)}
              className="w-full text-left card p-4 active:bg-surface-soft transition-colors"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="font-semibold text-ink">{drive.company_name}</span>
                <StatusBadge status={drive.status} size="sm" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-steel">
                  <Calendar className="w-3 h-3" />
                  {formatDriveDate(drive.assigned_date)}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-steel">
                  <Tag className="w-3 h-3" />
                  {drive.drive_type}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-steel">
                  <Layers className="w-3 h-3" />
                  {drive.process_stages.join(' → ')}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-steel">
                  <User className="w-3 h-3" />
                  {drive.poc_name}
                </div>
              </div>
            </button>
          ))
        )}
      </div>

      {/* Drive detail modal */}
      {selectedDrive && (
        <DriveModal
          drive={selectedDrive}
          profile={profile}
          onClose={() => setSelectedDrive(null)}
          onSuccess={() => { onSuccess?.(); setSelectedDrive(null) }}
        />
      )}
    </div>
  )
}
