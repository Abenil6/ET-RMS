import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { KeyRound } from 'lucide-react'
import { motion } from 'motion/react'
import { useState } from 'react'
import { HeroShowcase } from '../components/HeroShowcase'
import { api, ApiError } from '../lib/api'

type ResetPasswordSearch = {
  token?: string
}

export const Route = createFileRoute('/reset-password')({
  validateSearch: (search: Record<string, unknown>): ResetPasswordSearch => {
    return {
      token: typeof search.token === 'string' ? search.token : '',
    }
  },
  component: ResetPasswordPage,
})

function ResetPasswordPage() {
  const navigate = useNavigate()
  const search = Route.useSearch()
  const token = search.token || ''

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!token) {
      setError('Reset token missing. Please use the link from your email.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    try {
      setError('')
      setLoading(true)

      await api.auth.resetPassword(token, password)

      setSubmitted(true)
      setTimeout(() => {
        navigate({ to: '/login' })
      }, 2500)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to reset password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] lg:min-h-screen grid grid-cols-1 lg:grid-cols-2">
      <div className="flex items-center justify-center px-4 py-12">
        <motion.div
          className="w-full max-w-sm rounded-xl border border-border bg-card p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-green/10 text-primary-green">
            <KeyRound size={22} />
          </div>

          <h1 className="text-2xl font-bold text-text-dark mb-1">
            Set new password
          </h1>

          <p className="text-sm text-text-secondary mb-6">
            Your new password must be different from previously used passwords.
          </p>

          {!token && !submitted && (
            <div className="mb-4 rounded-lg bg-error/10 p-3 text-sm text-error">
              Reset token missing. Please use the link from your email.
            </div>
          )}

          {submitted ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-success/20 bg-success/10 p-4">
                <p className="text-sm font-semibold text-success">
                  Password reset successful
                </p>
                <p className="mt-1 text-sm text-text-secondary">
                  Redirecting to login...
                </p>
              </div>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              {error && (
                <div className="rounded-lg bg-error/10 p-3 text-sm text-error">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-text-dark focus:outline-none focus:ring-2 focus:ring-primary-green"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-text-dark focus:outline-none focus:ring-2 focus:ring-primary-green"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading || !token}
                className="w-full rounded-lg bg-primary-green py-2.5 font-semibold text-white hover:bg-primary-green/90 disabled:opacity-50"
              >
                {loading ? 'Resetting…' : 'Reset Password'}
              </button>
            </form>
          )}
        </motion.div>
      </div>

      <div className="hidden items-center justify-center px-6 py-12 lg:flex">
        <HeroShowcase compact />
      </div>
    </div>
  )
}