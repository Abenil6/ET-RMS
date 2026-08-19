import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft, MailCheck } from 'lucide-react'
import { motion } from 'motion/react'
import { useState } from 'react'
import { HeroShowcase } from '../components/HeroShowcase'
import api from '@/apis'

export const Route = createFileRoute('/forgotPassword')({
  component: ForgotPasswordPage,
})

function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const { mutate: forgotPassword, isPending: loading } = api.Auth.forgotPassword.useMutation({
    onSuccess: () => {
      setSubmitted(true)
    },
    onError: (err) => {
      // For network/server issues, it's okay to show an error
      const message = err instanceof Error ? err.message : 'Failed to send reset link. Please try again.'
      // We could set an error state here if needed, but the spec says to always show success
      console.error('Forgot password error:', message)
    },
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!email.trim()) {
      return
    }

    forgotPassword({ email: email.trim() })
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
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-primary-green/10">
            <MailCheck size={24} className="text-primary-green" />
          </div>

          <h1 className="text-2xl font-bold text-text-dark mb-2">
            Forgot Password?
          </h1>

          {!submitted ? (
            <p className="text-text-secondary mb-6">
              Enter your email address and we'll send you a link to reset your
              password.
            </p>
          ) : (
            <div className="mb-6 p-4 bg-success/10 text-success rounded-lg text-sm">
              If an account with that email exists, you will receive a password
              reset link shortly.
            </div>
          )}

          {!submitted && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-text-secondary mb-2"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-text-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-lg bg-primary-blue text-white font-medium hover:bg-primary-blue/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          )}

          <div className="mt-6">
            <Link
              to="/login"
              className="flex items-center justify-center gap-2 text-sm text-text-secondary hover:text-primary-blue transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Login
            </Link>
          </div>
        </motion.div>
      </div>

      <div className="hidden lg:block relative">
        <HeroShowcase />
      </div>
    </div>
  )
}
