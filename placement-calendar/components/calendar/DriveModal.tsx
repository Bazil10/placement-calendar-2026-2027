'use client'

import { useState, useTransition } from 'react'
import {
  format,
  parseISO,
  isWithinInterval,
} from 'date-fns'
import {
  X,
  Building2,
  Calendar,
  User,
  Tag,
  FileText,
  CheckCircle2,
  RotateCcw,
  XCircle,
  Trash2,
  Edit3,
  Lock,
  AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import StatusBadge from './StatusBadge'
import {
  DRIVE_TYPE_OPTIONS,
  PROCESS_STAGE_OPTIONS,
  RANGE_START,
  RANGE_END,
} from '@/lib/utils/calendar'
import {
  createDrive,
  updateDrive,
  deleteDrive,
  confirmDrive,
  revertDrive,
  cancelDrive,
} from '@/lib/actions/drives'
import type { Drive, DriveFormData, Profile, ProcessStage, DriveType } from '@/types'

interface DriveModalProps {
  drive?: Drive | null      // null = create mode
  selectedDate?: string     // pre-fill date in create mode
  profile: Profile
  onClose: () => void
  onSuccess?: () => void
}

const EMPTY_FORM: DriveFormData = {
  company_name:   '',
  drive_type:     'Final Placement',
  process_stages: [],
  assigned_date:  '',
  poc_name:       '',
  notes:          '',
}

export default function DriveModal({
  drive,
  selectedDate,
  profile,
  onClose,
  onSuccess,
}: DriveModalProps) {
  const isAdmin       = profile.role === 'admin'
  const isCreate      = !drive
  const isFixed       = drive?.status === 'fixed'
  const isOwnDrive    = drive?.created_by === profile.id
  const isReadOnly    = !isAdmin && isFixed

  // Admin can edit all; Coordinator can only edit own tentative
  const canEdit = isAdmin || (!isFixed && isOwnDrive) || isCreate

  const [form, setForm] = useState<DriveFormData>(() => {
    if (drive) {
      return {
        company_name:   drive.company_name,
        drive_type:     drive.drive_type,
        process_stages: drive.process_stages,
        assigned_date:  drive.assigned_date,
        poc_name:       drive.poc_name,
        notes:          drive.notes || '',
      }
    }
    return { ...EMPTY_FORM, assigned_date: selectedDate || '' }
  })

  const [error, setError]               = useState<string | null>(null)
  const [isPending, startTransition]    = useTransition()
  const [confirmDelete, setConfirmDelete] = useState(false)

  // Validate date is within the allowed range
  const dateInRange = form.assigned_date
    ? isWithinInterval(parseISO(form.assigned_date), { start: RANGE_START, end: RANGE_END })
    : true

  function toggleStage(stage: ProcessStage) {
    setForm((f) => ({
      ...f,
      process_stages: f.process_stages.includes(stage)
        ? f.process_stages.filter((s) => s !== stage)
        : [...f.process_stages, stage],
    }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!dateInRange) {
      setError('Date must be between January 2026 and June 2027')
      return
    }
    if (form.process_stages.length === 0) {
      setError('Select at least one process stage')
      return
    }
    setError(null)

    startTransition(async () => {
      const action = isCreate
        ? createDrive(form)
        : updateDrive(drive!.id, form)

      const result = await action
      if (result.error) {
        setError(result.error)
      } else {
        onSuccess?.()
        onClose()
      }
    })
  }

  async function handleDelete() {
    if (!drive) return
    startTransition(async () => {
      const result = await deleteDrive(drive.id)
      if (result.error) {
        setError(result.error)
      } else {
        onSuccess?.()
        onClose()
      }
    })
  }

  async function handleConfirm() {
    if (!drive) return
    startTransition(async () => {
      const result = await confirmDrive(drive.id)
      if (result.error) setError(result.error)
      else { onSuccess?.(); onClose() }
    })
  }

  async function handleRevert() {
    if (!drive) return
    startTransition(async () => {
      const result = await revertDrive(drive.id)
      if (result.error) setError(result.error)
      else { onSuccess?.(); onClose() }
    })
  }

  async function handleCancel() {
    if (!drive) return
    startTransition(async () => {
      const result = await cancelDrive(drive.id)
      if (result.error) setError(result.error)
      else { onSuccess?.(); onClose() }
    })
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink/50 z-50 animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className={cn(
        'fixed z-50 bg-canvas rounded-t-2xl sm:rounded-xl shadow-modal',
        'bottom-0 left-0 right-0',
        'sm:bottom-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2',
        'sm:w-full sm:max-w-lg',
        'max-h-[92vh] flex flex-col',
        'animate-slide-up'
      )}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-hairline flex-shrink-0">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-brand-green-dark" />
            <h2 className="text-lg font-semibold text-ink">
              {isCreate ? 'Add Drive' : canEdit ? 'Edit Drive' : 'Drive Details'}
            </h2>
            {drive && <StatusBadge status={drive.status} size="sm" />}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-stone hover:bg-surface-soft transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Read-only banner for coordinators on fixed drives */}
        {isReadOnly && (
          <div className="mx-5 mt-4 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5 text-amber-800 text-sm flex-shrink-0">
            <Lock className="w-4 h-4 flex-shrink-0" />
            <span className="font-medium">Confirmed by Placement Leads — read-only</span>
          </div>
        )}

        {/* Form Body */}
        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
          <form id="drive-form" onSubmit={handleSubmit} className="space-y-4">

            {/* Company Name */}
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-slate mb-1.5">
                <Building2 className="w-3.5 h-3.5" />
                Company Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                disabled={isReadOnly || !canEdit}
                value={form.company_name}
                onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                placeholder="e.g. Google, Amazon, TCS"
                className="input-field disabled:bg-surface-soft disabled:text-stone disabled:cursor-not-allowed"
              />
            </div>

            {/* Drive Type */}
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-slate mb-1.5">
                <Tag className="w-3.5 h-3.5" />
                Drive Type <span className="text-red-500">*</span>
              </label>
              <select
                required
                disabled={isReadOnly || !canEdit}
                value={form.drive_type}
                onChange={(e) => setForm({ ...form, drive_type: e.target.value as DriveType })}
                className="input-field disabled:bg-surface-soft disabled:text-stone disabled:cursor-not-allowed"
              >
                {DRIVE_TYPE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            {/* Process Stages */}
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-slate mb-2">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Process Stages <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {PROCESS_STAGE_OPTIONS.map((stage) => {
                  const checked = form.process_stages.includes(stage as ProcessStage)
                  return (
                    <button
                      key={stage}
                      type="button"
                      disabled={isReadOnly || !canEdit}
                      onClick={() => toggleStage(stage as ProcessStage)}
                      className={cn(
                        'px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-150',
                        checked
                          ? 'bg-brand-teal-deep text-on-dark border-brand-teal-deep'
                          : 'bg-surface text-steel border-hairline-strong',
                        (isReadOnly || !canEdit) && 'opacity-60 cursor-not-allowed'
                      )}
                    >
                      {stage}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Assigned Date */}
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-slate mb-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Assigned Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                disabled={isReadOnly || !canEdit}
                min="2026-01-01"
                max="2027-06-30"
                value={form.assigned_date}
                onChange={(e) => setForm({ ...form, assigned_date: e.target.value })}
                className={cn(
                  'input-field disabled:bg-surface-soft disabled:text-stone disabled:cursor-not-allowed',
                  !dateInRange && 'border-red-400'
                )}
              />
              {!dateInRange && (
                <p className="text-xs text-red-600 mt-1">
                  Date must be between Jan 2026 – Jun 2027
                </p>
              )}
            </div>

            {/* POC Name */}
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-slate mb-1.5">
                <User className="w-3.5 h-3.5" />
                POC Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                disabled={isReadOnly || !canEdit}
                value={form.poc_name}
                onChange={(e) => setForm({ ...form, poc_name: e.target.value })}
                placeholder="Point of contact name"
                className="input-field disabled:bg-surface-soft disabled:text-stone disabled:cursor-not-allowed"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-slate mb-1.5">
                <FileText className="w-3.5 h-3.5" />
                Notes
              </label>
              <textarea
                rows={3}
                disabled={isReadOnly || !canEdit}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Additional notes, requirements…"
                className="input-field h-auto py-3 resize-none disabled:bg-surface-soft disabled:text-stone disabled:cursor-not-allowed"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 text-red-700 text-sm">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </form>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-4 border-t border-hairline flex-shrink-0 pb-safe">

          {/* ── ADMIN on TENTATIVE drive ─────────────────── */}
          {isAdmin && drive?.status === 'tentative' && (
            <div className="space-y-2">
              <button
                onClick={handleConfirm}
                disabled={isPending}
                className="btn-primary w-full gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Confirm &amp; Fix Date
              </button>
              <div className="flex gap-2">
                <button
                  type="submit"
                  form="drive-form"
                  disabled={isPending}
                  className="btn-secondary flex-1"
                >
                  {isPending ? 'Saving…' : 'Save Changes'}
                </button>
                <button
                  onClick={() => setConfirmDelete(true)}
                  disabled={isPending}
                  className="btn-danger flex-none px-4"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ── ADMIN on FIXED drive ─────────────────────── */}
          {isAdmin && drive?.status === 'fixed' && (
            <div className="space-y-2">
              <div className="flex gap-2">
                <button
                  type="submit"
                  form="drive-form"
                  disabled={isPending}
                  className="btn-primary flex-1"
                >
                  {isPending ? 'Saving…' : (
                    <><Edit3 className="w-4 h-4" /> Save Changes</>
                  )}
                </button>
                <button
                  onClick={handleRevert}
                  disabled={isPending}
                  className="btn-secondary flex-none px-4 gap-1.5 text-xs"
                  title="Revert to Tentative"
                >
                  <RotateCcw className="w-4 h-4" />
                  Revert
                </button>
              </div>
              <button
                onClick={() => setConfirmDelete(true)}
                disabled={isPending}
                className="btn-danger w-full gap-2"
              >
                <XCircle className="w-4 h-4" />
                Cancel Drive
              </button>
            </div>
          )}

          {/* ── COORDINATOR on TENTATIVE (own) drive ─────── */}
          {!isAdmin && !isFixed && (isCreate || isOwnDrive) && (
            <div className="flex gap-2">
              <button
                type="submit"
                form="drive-form"
                disabled={isPending}
                className="btn-primary flex-1"
              >
                {isPending ? 'Saving…' : isCreate ? 'Add Drive' : 'Save Changes'}
              </button>
              {!isCreate && (
                <button
                  onClick={() => setConfirmDelete(true)}
                  disabled={isPending}
                  className="btn-danger flex-none px-4"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {/* ── COORDINATOR on FIXED drive (read-only) ───── */}
          {isReadOnly && (
            <button onClick={onClose} className="btn-secondary w-full">
              Close
            </button>
          )}
        </div>
      </div>

      {/* Delete Confirmation */}
      {confirmDelete && (
        <>
          <div className="fixed inset-0 bg-ink/70 z-[60]" onClick={() => setConfirmDelete(false)} />
          <div className="fixed z-[60] bg-canvas rounded-xl shadow-modal p-6 w-full max-w-sm top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <h3 className="text-lg font-semibold text-ink mb-2">
              {drive?.status === 'fixed' ? 'Cancel Drive?' : 'Delete Drive?'}
            </h3>
            <p className="text-sm text-steel mb-5">
              {drive?.status === 'fixed'
                ? `This will cancel the fixed drive for "${drive?.company_name}". This action can be undone by an admin.`
                : `This will permanently delete the tentative drive for "${drive?.company_name}".`
              }
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(false)} className="btn-secondary flex-1">
                Go back
              </button>
              <button
                onClick={drive?.status === 'fixed' ? handleCancel : handleDelete}
                disabled={isPending}
                className="btn-danger flex-1"
              >
                {isPending ? 'Processing…' : drive?.status === 'fixed' ? 'Yes, Cancel' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </>
      )}
    </>
  )
}
