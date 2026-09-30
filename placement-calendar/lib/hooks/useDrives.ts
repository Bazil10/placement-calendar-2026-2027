'use client'

import { useState, useEffect, useCallback, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Drive, DriveStatus } from '@/types'

interface UseDrivesOptions {
  status?: DriveStatus | 'all'
  dateFrom?: string
  dateTo?: string
}

export function useDrives(options: UseDrivesOptions = {}) {
  const [drives, setDrives]     = useState<Drive[]>([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const fetchDrives = useCallback(async () => {
    setLoading(true)
    setError(null)
    const supabase = createClient()

    let query = supabase
      .from('drives')
      .select('*')
      .order('assigned_date', { ascending: true })

    if (options.status && options.status !== 'all') {
      query = query.eq('status', options.status)
    } else if (!options.status) {
      query = query.neq('status', 'cancelled')
    }

    if (options.dateFrom) {
      query = query.gte('assigned_date', options.dateFrom)
    }
    if (options.dateTo) {
      query = query.lte('assigned_date', options.dateTo)
    }

    const { data, error: fetchError } = await query

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setDrives((data as Drive[]) || [])
    }
    setLoading(false)
  }, [options.status, options.dateFrom, options.dateTo])

  useEffect(() => {
    fetchDrives()
  }, [fetchDrives])

  // Real-time subscription
  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel('drives-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'drives' },
        () => {
          startTransition(() => {
            fetchDrives()
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchDrives])

  return {
    drives,
    loading: loading || isPending,
    error,
    refetch: fetchDrives,
  }
}
