import { getRouteApi, useNavigate } from '@tanstack/react-router'
import { KeyRound } from 'lucide-react'
import { motion } from 'motion/react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import api from '@/apis'
import { HeroShowcase } from '@/components/HeroShowcase'
import { resetPasswordSchema } from '@/types/user'
import type { ResetPasswordInput } from '@/types/user'
import { useTranslation } from 'react-i18next'
const routeApi = getRouteApi('/reset-password')

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const search = routeApi.useSearch()
  const token = search.token || ''
  const [submitted, setSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError: setFormError,
  } = useForm<Omit<ResetPasswordInput, 'token'>>({
    resolver: zodResolver(resetPasswordSchema.omit({ token: true })),
  })

  const { mutate: resetPassword } = api.Auth.resetPassword.useMutation({
    onSuccess: () => {
      setSubmitted(true)
      setTimeout(() => {
        navigate({ to: '/login' })
      }, 2500)
    },
    onError: (err) => {
      setFormError('root', {
        message: err.message || 'Failed to reset password. Please try again.',
      })
    },
  })

  const onSubmit = (data: Omit<ResetPasswordInput, 'token'>) => {
    if (!token) {
      setFormError('root', {
        message: 'Reset token missing. Please use the link from your email.',
      })
      return
    }

    resetPassword({ token, newPassword: data.password })
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
              {t('reset_password.title')}
            </h1>

            <div className="mb-6 p-4 bg-success/10 text-success rounded-lg text-sm">
              {t('reset_password.password_updated')}
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
            {t('reset_password.title')}
          </h1>

          <p className="text-text-secondary mb-6">
            {t('reset_password.subtitle')}
          </p>

          {errors.root && (
            <div className="mb-4 p-3 rounded-lg bg-error/10 text-error text-sm">
              {errors.root.message}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-text-secondary mb-2"
              >
                {t('reset_password.password_label')}
              </label>
              <input
                id="password"
                type="password"
                {...register('password')}
                autoComplete="new-password"
                className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-text-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue"
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-semibold text-text-secondary mb-2"
              >
                {t('reset_password.confirm_password_label')}
              </label>
              <input
                id="confirmPassword"
                type="password"
                {...register('confirmPassword')}
                autoComplete="new-password"
                className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-text-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 rounded-lg bg-primary-blue text-white font-medium hover:bg-primary-blue/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting
                ? t('reset_password.submit_loading')
                : t('reset_password.submit_button')}
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
