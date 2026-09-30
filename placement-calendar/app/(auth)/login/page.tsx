'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Building2, Lock, Mail, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [showPass, setShowPass]   = useState(false)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState<string | null>(null)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    router.push('/')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex flex-col bg-brand-teal-deep">
      {/* Top decorative band */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">

        {/* Logo / Brand */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-14 h-14 bg-brand-green rounded-xl flex items-center justify-center mb-4 shadow-card">
            <Building2 className="w-7 h-7 text-on-primary" strokeWidth={2} />
          </div>
          <h1 className="text-on-dark text-2xl font-semibold tracking-tight">
            Placement Drive Calendar
          </h1>
          <p className="text-on-dark-muted text-sm mt-1">
            Sign in to manage campus placement drives
          </p>
        </div>

        {/* Login Card */}
        <div className="w-full max-w-sm bg-canvas rounded-xl shadow-modal p-8">
          <h2 className="text-ink text-xl font-semibold mb-6">Sign in</h2>

          <form onSubmit={handleLogin} className="space-y-4">

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate mb-1.5"
              >
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@college.edu"
                  className={cn(
                    'input-field pl-10',
                    error && 'border-red-400 focus:border-red-500'
                  )}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone" />
                <input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={cn(
                    'input-field pl-10 pr-10',
                    error && 'border-red-400 focus:border-red-500'
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone"
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass
                    ? <EyeOff className="w-4 h-4" />
                    : <Eye className="w-4 h-4" />
                  }
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 text-red-700 text-sm animate-fade-in">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !email || !password}
              className="btn-primary w-full mt-2 h-11"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Signing in…
                </span>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          {/* Role info */}
          <div className="mt-6 pt-5 border-t border-hairline">
            <p className="text-xs text-stone text-center mb-3">Role access</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-surface rounded-lg px-3 py-2 text-center">
                <p className="text-xs font-semibold text-ink">Admin</p>
                <p className="text-[11px] text-stone mt-0.5">Confirm & fix drives</p>
              </div>
              <div className="bg-surface rounded-lg px-3 py-2 text-center">
                <p className="text-xs font-semibold text-ink">Coordinator</p>
                <p className="text-[11px] text-stone mt-0.5">Propose tentative drives</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer note */}
        <p className="mt-8 text-on-dark-muted text-xs text-center">
          Placement Team · Internal use only
        </p>
      </div>
    </div>
  )
}
