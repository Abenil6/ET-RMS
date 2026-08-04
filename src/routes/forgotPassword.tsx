import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft, MailCheck } from 'lucide-react'
import { motion } from 'motion/react'
import { useState } from 'react'
import { HeroShowcase } from '../components/HeroShowcase'
import { api, ApiError } from '../lib/api'

export const Route = createFileRoute('/forgotPassword')({
  component: ForgotPasswordPage,
})

function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!email.trim()) {
      setError('Please enter your email.')
      return
    }

    try {
      setLoading(true)
      await api.auth.forgotPassword(email.trim())

      // Always show success message (don’t leak whether email exists)
      setSubmitted(true)
    } catch (err) {
      // For network/server issues, it’s okay to show an error
      setError(err instanceof ApiError ? err.message : 'Failed to send reset link. Please try again.')
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
            <MailCheck size={22} />
          </div>

          <h1 className="text-2xl font-bold text-text-dark mb-1">
            Reset your password
          </h1>

          <p className="text-sm text-text-secondary mb-6">
            {submitted
              ? 'We sent a reset link if the email exists in our system.'
              : 'Enter your email and we’ll send you a reset link.'}
          </p>

          {error && (
            <div className="mb-4 rounded-lg bg-error/10 p-3 text-sm text-error">
              {error}
            </div>
          )}

          {submitted ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-success/20 bg-success/10 p-4">
                <p className="text-sm font-semibold text-success">Reset link sent</p>
                <p className="mt-1 text-sm text-text-secondary">
                  Check <span className="font-semibold text-text-dark">{email}</span> for the next step.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSubmitted(false)
                  setError(null)
                }}
                className="w-full rounded-lg border border-border bg-bg py-2.5 font-semibold text-text-dark hover:bg-card"
              >
                Send another link
              </button>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-text-dark focus:outline-none focus:ring-2 focus:ring-primary-green"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-primary-green py-2.5 font-semibold text-white hover:bg-primary-green/90 disabled:opacity-50"
              >
                {loading ? 'Sending…' : 'Send Reset Link'}
              </button>
            </form>
          )}

          <div className="mt-6 flex items-center justify-between gap-3 text-sm">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 font-semibold text-primary-green hover:underline"
            >
              <ArrowLeft size={16} />
              Back to login
            </Link>
            <span className="text-text-secondary">
              Support team will help if needed
            </span>
          </div>
        </motion.div>
      </div>

      <div className="hidden items-center justify-center px-6 py-12 lg:flex">
        <HeroShowcase compact />
      </div>
    </div>
  )
}