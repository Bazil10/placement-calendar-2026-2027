import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CalendarShell from '@/components/calendar/CalendarShell'
import type { Profile } from '@/types'

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  return <CalendarShell profile={profile as Profile} />
}
