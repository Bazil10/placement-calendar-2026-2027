'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { Drive, DriveFormData, DriveStatus } from '@/types'

// ── Fetch Drives ─────────────────────────────────────────────

export async function getDrives(filters?: {
  status?: DriveStatus | 'all'
  dateFrom?: string
  dateTo?: string
}): Promise<{ data: Drive[]; error: string | null }> {
  const supabase = await createClient()

  let query = supabase
    .from('drives')
    .select('*')
    .order('assigned_date', { ascending: true })

  if (filters?.status && filters.status !== 'all') {
    query = query.eq('status', filters.status)
  } else {
    // By default exclude cancelled for non-admins (RLS handles this too)
    query = query.neq('status', 'cancelled')
  }

  if (filters?.dateFrom) {
    query = query.gte('assigned_date', filters.dateFrom)
  }
  if (filters?.dateTo) {
    query = query.lte('assigned_date', filters.dateTo)
  }

  const { data, error } = await query

  if (error) {
    console.error('[getDrives]', error)
    return { data: [], error: error.message }
  }

  return { data: data as Drive[], error: null }
}

// ── Create Drive ─────────────────────────────────────────────

export async function createDrive(
  formData: DriveFormData
): Promise<{ data: Drive | null; error: string | null }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { data: null, error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('drives')
    .insert({
      company_name:   formData.company_name,
      drive_type:     formData.drive_type,
      process_stages: formData.process_stages,
      assigned_date:  formData.assigned_date,
      poc_name:       formData.poc_name,
      notes:          formData.notes || '',
      status:         'tentative',
      created_by:     user.id,
    })
    .select()
    .single()

  if (error) {
    console.error('[createDrive]', error)
    return { data: null, error: error.message }
  }

  revalidatePath('/')
  return { data: data as Drive, error: null }
}

// ── Update Drive ─────────────────────────────────────────────

export async function updateDrive(
  id: string,
  formData: DriveFormData
): Promise<{ data: Drive | null; error: string | null }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { data: null, error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('drives')
    .update({
      company_name:   formData.company_name,
      drive_type:     formData.drive_type,
      process_stages: formData.process_stages,
      assigned_date:  formData.assigned_date,
      poc_name:       formData.poc_name,
      notes:          formData.notes || '',
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('[updateDrive]', error)
    return { data: null, error: error.message }
  }

  revalidatePath('/')
  return { data: data as Drive, error: null }
}

// ── Delete Drive ─────────────────────────────────────────────

export async function deleteDrive(
  id: string
): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('drives')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('[deleteDrive]', error)
    return { error: error.message }
  }

  revalidatePath('/')
  return { error: null }
}

// ── Confirm Drive (Admin only) ───────────────────────────────

export async function confirmDrive(
  id: string
): Promise<{ data: Drive | null; error: string | null }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { data: null, error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('drives')
    .update({
      status:       'fixed',
      confirmed_by: user.id,
      confirmed_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('status', 'tentative')
    .select()
    .single()

  if (error) {
    console.error('[confirmDrive]', error)
    return { data: null, error: error.message }
  }

  revalidatePath('/')
  return { data: data as Drive, error: null }
}

// ── Revert Drive (Admin only) ────────────────────────────────

export async function revertDrive(
  id: string
): Promise<{ data: Drive | null; error: string | null }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { data: null, error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('drives')
    .update({
      status:       'tentative',
      confirmed_by: null,
      confirmed_at: null,
    })
    .eq('id', id)
    .eq('status', 'fixed')
    .select()
    .single()

  if (error) {
    console.error('[revertDrive]', error)
    return { data: null, error: error.message }
  }

  revalidatePath('/')
  return { data: data as Drive, error: null }
}

// ── Cancel Drive (Admin only) ────────────────────────────────

export async function cancelDrive(
  id: string
): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('drives')
    .update({ status: 'cancelled' })
    .eq('id', id)

  if (error) {
    console.error('[cancelDrive]', error)
    return { error: error.message }
  }

  revalidatePath('/')
  return { error: null }
}

// ── Auth Actions ─────────────────────────────────────────────

export async function signOut(): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const { error } = await supabase.auth.signOut()

  if (error) return { error: error.message }

  revalidatePath('/', 'layout')
  return { error: null }
}
