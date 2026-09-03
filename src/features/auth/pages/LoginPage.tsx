import { Link, useNavigate } from '@tanstack/react-router'
import { Eye, EyeOff } from 'lucide-react'
import { motion } from 'motion/react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { HeroShowcase } from '@/components/HeroShowcase'
import { loginSchema } from '@/types/user'
import type { LoginInput } from '@/types/user'
import api from '@/apis'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { saveTokens } from '#/apis/core'
export function LoginPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [showPassword, setShowPassword] = useState(false)
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError: setFormError,
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  })

  const { mutate: login } = api.Auth.login.useMutation({
    onSuccess: (data) => {
      saveTokens(data.accessToken, data.refreshToken)
      // Set user data in query cache immediately after successful login
      queryClient.setQueryData(['auth', 'me'], data.user)
      navigate({ to: '/dashboard' })
    },
    onError: (error) => {
      setFormError('root', {
        message: error.message || t('login.default_error'),
      })
    },
  })

  const onSubmit = (data: LoginInput) => {
    login(data)
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
            {t('login.title')}
          </h1>
          <p className="text-sm text-text-secondary mb-6">
            {t('login.subtitle')}
          </p>

          {errors.root && (
            <p className="text-sm text-red-500 mb-4">{errors.root.message}</p>
          )}

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="block text-sm font-medium text-text-dark mb-1">
                {t('login.email_label')}
              </label>
              <input
                type="email"
                {...register('email')}
                placeholder={t('login.email_placeholder')}
                className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-text-dark focus:outline-none focus:ring-2 focus:ring-primary-green"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between gap-3">
                <label className="block text-sm font-medium text-text-dark">
                  {t('login.password_label')}
                </label>
                <Link
                  to="/forgotPassword"
                  className="text-xs font-semibold text-primary-green hover:underline"
                >
                  {t('login.forgot_password')}
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  placeholder={t('login.password_placeholder')}
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
              {errors.password && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-lg bg-primary-green text-white font-semibold hover:bg-primary-green/90 disabled:opacity-50 transition"
            >
              {isSubmitting
                ? t('login.submit_loading')
                : t('login.submit_button')}
            </button>
          </form>

          <p className="mt-6 text-sm text-center text-text-secondary">
            {t('login.no_account')}{' '}
            <Link
              to="/register"
              className="text-primary-green font-semibold hover:underline"
            >
              {t('login.signup_link')}
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
