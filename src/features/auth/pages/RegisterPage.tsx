import { Link, useNavigate } from '@tanstack/react-router'
import { Eye, EyeOff } from 'lucide-react'
import { motion } from 'motion/react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { HeroShowcase } from '@/components/HeroShowcase'
import { registerSchema } from '@/types/user'
import type { RegisterInput } from '@/types/user'
import api from '@/apis'

export function RegisterPage() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError: setFormError,
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  })

  const { mutate: registerUser } = api.Auth.register.useMutation({
    onSuccess: () => {
      navigate({ to: '/dashboard' })
    },
    onError: (error) => {
      setFormError('root', {
        message: error.message || 'An error occurred during registration.',
      })
    },
  })

  const onSubmit = (data: RegisterInput) => {
    registerUser(data)
  }

  return (
    <div className="min-h-[80vh] lg:min-h-screen grid grid-cols-1 lg:grid-cols-2">
      <div className="flex items-center justify-center px-4 py-12 order-1 lg:order-1">
        <motion.div
          className="w-full max-w-sm p-8 rounded-xl border border-border bg-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <h1 className="text-2xl font-bold text-text-dark mb-1">Create your account</h1>
          <p className="text-sm text-text-secondary mb-6">
            Report issues and track your tickets in one place.
          </p>

          {errors.root && <p className="text-sm text-red-500 mb-4">{errors.root.message}</p>}

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="block text-sm font-medium text-text-dark mb-1">Full name</label>
              <input
                type="text"
                {...register('name')}
                placeholder="Abebe Kebede"
                className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-text-dark focus:outline-none focus:ring-2 focus:ring-primary-green"
              />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-dark mb-1">Email</label>
              <input
                type="email"
                {...register('email')}
                placeholder="you@example.com"
                className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-text-dark focus:outline-none focus:ring-2 focus:ring-primary-green"
              />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-dark mb-1">Phone (optional)</label>
              <input
                type="tel"
                {...register('phone')}
                placeholder="+251 911 234567"
                className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-text-dark focus:outline-none focus:ring-2 focus:ring-primary-green"
              />
              {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-dark mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 pr-10 rounded-lg border border-border bg-bg text-text-dark focus:outline-none focus:ring-2 focus:ring-primary-green"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-text-secondary hover:text-text-dark transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-dark mb-1">Confirm password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  {...register('confirmPassword')}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 pr-10 rounded-lg border border-border bg-bg text-text-dark focus:outline-none focus:ring-2 focus:ring-primary-green"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((value) => !value)}
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-text-secondary hover:text-text-dark transition-colors"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-lg bg-primary-green text-white font-semibold hover:bg-primary-green/90 disabled:opacity-50 transition"
            >
              {isSubmitting ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>

          <p className="mt-6 text-sm text-center text-text-secondary">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-green font-semibold hover:underline">
              Log in
            </Link>
          </p>
        </motion.div>
      </div>

      <div className="hidden items-center justify-center px-6 py-12 lg:order-2 lg:flex">
        <HeroShowcase compact />
      </div>
    </div>
  )
}
