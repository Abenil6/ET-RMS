import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Modal } from '@/components/shared/Modal'
import { updateUserSchema } from '@/types/admin'
import type { UpdateUserInput } from '@/types/admin'
import type { AdminUserType } from '@/apis'
import { useTranslation } from 'react-i18next'

const ROLE_LABELS = {
  CUSTOMER: 'Customer',
  TECHNICIAN: 'Technician',
  ADMIN: 'Admin',
} as const

interface EditUserModalProps {
  user: AdminUserType
  onSubmit: (data: UpdateUserInput) => void
  onCancel: () => void
}

export function EditUserModal({
  user,
  onSubmit,
  onCancel,
}: EditUserModalProps) {
  const { t } = useTranslation()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UpdateUserInput>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
    },
  })

  return (
    <Modal onClose={onCancel} title={t('admin_users.edit_user')}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-text-secondary mb-2">
            {t('admin_users.name_column')}
          </label>
          <input
            type="text"
            {...register('name')}
            className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-text-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue"
          />
          {errors.name && (
            <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-text-secondary mb-2">
            {t('admin_users.email_column')}
          </label>
          <input
            type="email"
            {...register('email')}
            className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-text-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue"
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-text-secondary mb-2">
            {t('admin_users.phone_column')}
          </label>
          <input
            type="tel"
            {...register('phone')}
            className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-text-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue"
          />
          {errors.phone && (
            <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-text-secondary mb-2">
            {t('admin_users.role_column')}
          </label>
          <select
            {...register('role')}
            className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-text-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue"
          >
            {Object.entries(ROLE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {t(`admin_users.roles.${value}`, { defaultValue: label })}
              </option>
            ))}
          </select>
          {errors.role && (
            <p className="mt-1 text-xs text-red-500">{errors.role.message}</p>
          )}
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 rounded-lg bg-primary-blue text-white text-sm font-medium hover:bg-primary-blue/90 transition disabled:opacity-50"
          >
            {isSubmitting ? t('profile.saving') : t('common.save')}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 rounded-lg border border-border text-text-dark text-sm font-medium hover:bg-bg transition"
          >
            {t('common.cancel')}
          </button>
        </div>
      </form>
    </Modal>
  )
}
