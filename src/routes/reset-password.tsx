import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { KeyRound } from 'lucide-react'
import { motion } from 'motion/react'
import { useState } from 'react'
import { HeroShowcase } from '../components/HeroShowcase'
import api from '@/apis'

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

  const { mutate: resetPassword, isPending: loading } = api.Auth.resetPassword.useMutation({
    onSuccess: () => {
      setSubmitted(true)
      setTimeout(() => {
        navigate({ to: '/login' })
      }, 2500)
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : 'Failed to reset password. Please try again.')
    },
  })

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

    resetPassword({ token, newPassword: password })
  }

  if (submitted) {
    return (
      <div className="min-h-[80vh] lg:min-h-screen grid grid-cols-1 lg:grid-cols-2">
        <div className="flex items-center justify-center px-4 py-12">
          <motion.div
            className="w-full max-w-sm rounded-xl border border-border bg-card p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
              <KeyRound size={24} className="text-success" />
            </div>

            <h1 className="text-2xl font-bold text-text-dark mb-2">
              Password Reset
            </h1>

            <div className="mb-6 p-4 bg-success/10 text-success rounded-lg text-sm">
              Your password has been successfully updated. Redirecting to login...
            </div>
          </motion.div>
        </div>

        <div className="hidden lg:block relative">
          <HeroShowcase />
        </div>
      </div>
    )
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
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-primary-blue/10">
            <KeyRound size={24} className="text-primary-blue" />
          </div>

          <h1 className="text-2xl font-bold text-text-dark mb-2">
            Reset Password
          </h1>

          <p className="text-text-secondary mb-6">
            Enter your new password below.
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-error/10 text-error text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-text-secondary mb-2"
              >
                New Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                minLength={6}
                className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-text-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-semibold text-text-secondary mb-2"
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
                className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-text-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg bg-primary-blue text-white font-medium hover:bg-primary-blue/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        </motion.div>
      </div>

      <div className="hidden lg:block relative">
        <HeroShowcase />
      </div>
    </div>
  )
}
