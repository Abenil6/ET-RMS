import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useAuth } from '../context/auth'
import { motion } from 'motion/react'
import { useState } from 'react'
import { HeroShowcase } from '../components/HeroShowcase'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!email || !password) {
      setError('Please enter both email and password')
      return
    }

    setError('')
    setLoading(true)

    const result = await login(email, password)

    setLoading(false)

    if (result.success) {
      navigate({ to: '/dashboard' })
    } else {
      setError(result.error || 'Invalid email or password')
    }
  }

  return (
    <div className="min-h-[80vh] lg:min-h-screen grid grid-cols-1 lg:grid-cols-2">
      <div className="flex items-center justify-center px-4 py-12">
        <motion.div
          className="w-full max-w-sm p-8 rounded-xl border border-border bg-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <h1 className="text-2xl font-bold text-text-dark mb-1">
            Welcome back
          </h1>
          <p className="text-sm text-text-secondary mb-6">
            Log in to track your support tickets.
          </p>

          {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

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
                className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-text-dark focus:outline-none focus:ring-2 focus:ring-primary-green"
              />
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between gap-3">
                <label className="block text-sm font-medium text-text-dark">
                  Password
                </label>
                <Link
                  to="/forgotPassword"
                  className="text-xs font-semibold text-primary-green hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-text-dark focus:outline-none focus:ring-2 focus:ring-primary-green"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-primary-green text-white font-semibold hover:bg-primary-green/90 disabled:opacity-50 transition"
            >
              {loading ? 'Signing in...' : 'Log In'}
            </button>
          </form>

          <p className="mt-6 text-sm text-center text-text-secondary">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-primary-green font-semibold hover:underline"
            >
              Sign up
            </Link>
          </p>
        </motion.div>
      </div>

      <div className="hidden items-center justify-center px-6 py-12 lg:flex">
        <HeroShowcase compact />
      </div>
    </div>
  )
}