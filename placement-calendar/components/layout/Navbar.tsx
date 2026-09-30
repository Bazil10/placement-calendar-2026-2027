'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Building2,
  LogOut,
  Menu,
  X,
  CalendarDays,
  ChevronDown,
  User,
  Shield,
  Users,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types'
import { cn } from '@/lib/utils/cn'

interface NavbarProps {
  profile: Profile | null
}

export default function Navbar({ profile }: NavbarProps) {
  const router  = useRouter()
  const [menuOpen, setMenuOpen]   = useState(false)
  const [userOpen, setUserOpen]   = useState(false)
  const [signing, setSigning]     = useState(false)

  async function handleSignOut() {
    setSigning(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const isAdmin = profile?.role === 'admin'

  return (
    <>
      {/* ── Top Nav ───────────────────────────────────────── */}
      <header className="sticky top-0 z-50 w-full bg-brand-teal-deep border-b border-hairline-dark shadow-card pt-safe">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">

          {/* Left: Logo + Title */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-green rounded-md flex items-center justify-center flex-shrink-0">
              <CalendarDays className="w-4 h-4 text-on-primary" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <span className="text-on-dark font-semibold text-[15px] leading-tight">
                Placement Drive
              </span>
              <span className="text-on-dark-muted text-[11px] leading-tight tracking-wide uppercase font-medium">
                Calendar
              </span>
            </div>
          </div>

          {/* Right: User + Mobile menu */}
          <div className="flex items-center gap-2">

            {/* User Dropdown (Desktop) */}
            {profile && (
              <div className="hidden sm:block relative">
                <button
                  onClick={() => setUserOpen(!userOpen)}
                  className={cn(
                    'flex items-center gap-2 rounded-full px-3 py-1.5',
                    'border border-hairline-dark text-on-dark text-sm font-medium',
                    'transition-colors duration-150 active:bg-brand-teal',
                    userOpen && 'bg-brand-teal'
                  )}
                >
                  {/* Role icon */}
                  <span className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold',
                    isAdmin ? 'bg-brand-green text-on-primary' : 'bg-brand-teal text-on-dark'
                  )}>
                    {profile.full_name.charAt(0).toUpperCase()}
                  </span>
                  <span className="max-w-[100px] truncate">
                    {profile.full_name || profile.email.split('@')[0]}
                  </span>
                  <ChevronDown className={cn(
                    'w-3.5 h-3.5 text-on-dark-muted transition-transform duration-150',
                    userOpen && 'rotate-180'
                  )} />
                </button>

                {/* Dropdown */}
                {userOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-canvas rounded-lg shadow-modal border border-hairline z-50 animate-fade-in">
                      <div className="p-3 border-b border-hairline">
                        <p className="text-sm font-semibold text-ink truncate">
                          {profile.full_name || 'User'}
                        </p>
                        <p className="text-xs text-stone truncate">{profile.email}</p>
                        <div className="mt-2 flex items-center gap-1.5">
                          {isAdmin
                            ? <Shield className="w-3.5 h-3.5 text-brand-green-dark" />
                            : <Users className="w-3.5 h-3.5 text-stone" />
                          }
                          <span className={cn(
                            'text-[11px] font-semibold uppercase tracking-wide',
                            isAdmin ? 'text-brand-green-dark' : 'text-stone'
                          )}>
                            {isAdmin ? 'Admin · Placement Lead' : 'Coordinator'}
                          </span>
                        </div>
                      </div>
                      <div className="p-1">
                        <button
                          onClick={handleSignOut}
                          disabled={signing}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-red-600 transition-colors active:bg-red-50"
                        >
                          <LogOut className="w-4 h-4" />
                          {signing ? 'Signing out…' : 'Sign out'}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="sm:hidden w-9 h-9 flex items-center justify-center rounded-md border border-hairline-dark text-on-dark"
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile Slide-Down Menu ─────────────────────────── */}
      {menuOpen && (
        <div className="sm:hidden fixed inset-0 z-40 bg-brand-teal-deep pt-16 animate-fade-in">
          <div className="p-4 border-b border-hairline-dark">
            <div className="flex items-center gap-3">
              <div className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold',
                isAdmin ? 'bg-brand-green text-on-primary' : 'bg-brand-teal text-on-dark'
              )}>
                {profile?.full_name.charAt(0).toUpperCase() ?? <User className="w-5 h-5" />}
              </div>
              <div>
                <p className="text-on-dark font-semibold text-sm">
                  {profile?.full_name || profile?.email?.split('@')[0]}
                </p>
                <div className="flex items-center gap-1">
                  {isAdmin
                    ? <Shield className="w-3 h-3 text-brand-green" />
                    : <Users className="w-3 h-3 text-on-dark-muted" />
                  }
                  <span className={cn(
                    'text-[11px] font-medium',
                    isAdmin ? 'text-brand-green' : 'text-on-dark-muted'
                  )}>
                    {isAdmin ? 'Admin · Placement Lead' : 'Coordinator'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4">
            <button
              onClick={handleSignOut}
              disabled={signing}
              className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-lg text-red-400 text-sm font-medium"
            >
              <LogOut className="w-5 h-5" />
              {signing ? 'Signing out…' : 'Sign out'}
            </button>
          </div>
        </div>
      )}
    </>
  )
}
