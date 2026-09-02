import { useNavigate } from '@tanstack/react-router'
import { Mail, Shield, Edit2, X, Phone } from 'lucide-react'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { useEffect, useState } from 'react'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { motion, AnimatePresence } from 'motion/react'
import { useTranslation } from 'react-i18next'
import {
  AVATAR_STYLES,
  AVATAR_SEEDS,
  getAvatarUrl,
  DEFAULT_AVATAR_STYLE,
  DEFAULT_AVATAR_SEED,
} from '@/lib/avatars'
import api from '@/apis'

type Notice = { kind: 'success' | 'error'; message: string } | null

export function ProfilePage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { user, updateProfile, logout } = useAuth()

  const [isEditing, setIsEditing] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [showAvatarPicker, setShowAvatarPicker] = useState(false)

  // Editable profile fields
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [phone, setPhone] = useState((user as any)?.phone || '')

  const [selectedAvatarStyle, setSelectedAvatarStyle] = useState(
    user?.avatarStyle || DEFAULT_AVATAR_STYLE,
  )
  const [selectedAvatarSeed, setSelectedAvatarSeed] = useState(
    user?.avatarSeed || DEFAULT_AVATAR_SEED,
  )

  // Password change fields
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')

  // UI messages + loading flags
  const [profileNotice, setProfileNotice] = useState<Notice>(null)
  const [securityNotice, setSecurityNotice] = useState<Notice>(null)
  const [savingProfile, setSavingProfile] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Keep displayed values in sync if user changes (e.g., after refresh)
  useEffect(() => {
    if (!user || isEditing) return
    setName(user.name)
    setEmail(user.email)
    setPhone((user as any)?.phone || '')
    setSelectedAvatarStyle(user.avatarStyle || DEFAULT_AVATAR_STYLE)
    setSelectedAvatarSeed(user.avatarSeed || DEFAULT_AVATAR_SEED)
  }, [user, isEditing])

  if (!user) return null

  // Mutations from the centralized API layer.
  const { mutate: changePassword } = api.Auth.changePassword.useMutation({
    onSuccess: () => {
      setCurrentPassword('')
      setNewPassword('')
      setIsChangingPassword(false)
      setSecurityNotice({
        kind: 'success',
        message: t('profile.password_updated'),
      })
      setTimeout(() => setSecurityNotice(null), 4000)
    },
    onError: (err) => {
      const msg =
        err instanceof Error ? err.message : t('profile.error_change_password')
      setSecurityNotice({ kind: 'error', message: msg })
      setChangingPassword(false)
    },
  })

  const { mutate: deleteAccount } = api.Auth.deleteAccount.useMutation({
    onSuccess: async () => {
      await logout()
      navigate({ to: '/login' })
    },
    onError: (err) => {
      const msg =
        err instanceof Error ? err.message : t('profile.error_delete_account')
      setSecurityNotice({ kind: 'error', message: msg })
      setDeleting(false)
    },
  })

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    setProfileNotice(null)

    if (!name.trim()) {
      setProfileNotice({ kind: 'error', message: t('profile.name_required') })
      return
    }
    if (!email.trim()) {
      setProfileNotice({ kind: 'error', message: t('profile.email_required') })
      return
    }

    try {
      setSavingProfile(true)

      const result = await updateProfile({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() ? phone.trim() : undefined,
        avatarStyle: selectedAvatarStyle,
        avatarSeed: selectedAvatarSeed,
      })

      if (!result.success) {
        setProfileNotice({
          kind: 'error',
          message: result.error || t('profile.error_update_profile'),
        })
        return
      }

      setIsEditing(false)
      setProfileNotice({
        kind: 'success',
        message: t('profile.profile_updated'),
      })
      setTimeout(() => setProfileNotice(null), 4000)
    } finally {
      setSavingProfile(false)
    }
  }

  function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    setSecurityNotice(null)

    if (!currentPassword || !newPassword) {
      setSecurityNotice({
        kind: 'error',
        message: t('profile.passwords_required'),
      })
      return
    }
    if (newPassword.length < 6) {
      setSecurityNotice({
        kind: 'error',
        message: t('profile.password_min_length'),
      })
      return
    }

    setChangingPassword(true)
    changePassword({ currentPassword, newPassword })
  }

  function handleAvatarSelect(seed: string) {
    setSelectedAvatarSeed(seed)
    setShowAvatarPicker(false)
  }

  function handleDeleteAccount() {
    setSecurityNotice(null)
    setDeleting(true)
    deleteAccount()
  }

  // ... rest of the component remains the same
  return (
    <motion.div
      className="w-full max-w-5xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{t('profile.title')}</h1>
        <p className="text-text-secondary">{t('profile.subtitle')}</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-card rounded-xl border border-border p-6 sticky top-24">
            <div className="flex flex-col items-center gap-4 mb-6">
              <div className="relative">
                <img
                  src={getAvatarUrl(selectedAvatarStyle, selectedAvatarSeed)}
                  alt={t('profile.avatar_preview')}
                  className="w-24 h-24 rounded-full object-cover border-4 border-border"
                />
                {isEditing && (
                  <button
                    onClick={() => setShowAvatarPicker(true)}
                    className="absolute bottom-0 right-0 p-2 bg-primary-blue text-white rounded-full hover:bg-primary-blue/90 transition"
                  >
                    <Edit2 size={16} />
                  </button>
                )}
              </div>
              <div>
                <p className="text-lg font-bold text-text-dark">{user.name}</p>
                <p className="text-sm text-text-secondary">{user.email}</p>
              </div>
            </div>

            <div className="space-y-2 border-t border-border pt-6">
              <div className="flex items-center gap-3 text-sm text-text-secondary">
                <Mail size={18} />
                <span>{user.email}</span>
              </div>
              {user.phone && (
                <div className="flex items-center gap-3 text-sm text-text-secondary">
                  <Phone size={18} />
                  <span>{user.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-sm text-text-secondary">
                <Shield size={18} />
                <span
                  className={`capitalize px-2 py-0.5 rounded-full text-xs font-semibold ${
                    user.role === 'ADMIN'
                      ? 'bg-primary-green/10 text-primary-green'
                      : user.role === 'TECHNICIAN'
                        ? 'bg-primary-blue/10 text-primary-blue'
                        : 'bg-bg text-text-secondary'
                  }`}
                >
                  {user.role.toLowerCase()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Profile Info */}
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-text-dark">
                {t('profile.information_title')}
              </h2>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  isEditing
                    ? 'border border-border text-text-dark hover:bg-bg'
                    : 'bg-primary-blue text-white hover:bg-primary-blue/90'
                }`}
                type="button"
              >
                {isEditing ? t('profile.cancel') : t('profile.edit')}
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-text-secondary mb-2">
                    {t('profile.name_label')}
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-text-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-text-secondary mb-2">
                    {t('profile.email_label')}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-text-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-2">
                  {t('profile.phone_label')}
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={!isEditing}
                  placeholder={t('profile.optional')}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-text-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-2">
                  {t('profile.avatar_style_label')}
                </label>
                <select
                  value={selectedAvatarStyle}
                  onChange={(e) => setSelectedAvatarStyle(e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-text-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {AVATAR_STYLES.map((style) => (
                    <option key={style.name} value={style.name}>
                      {style.name}
                    </option>
                  ))}
                </select>
              </div>

              {isEditing && (
                <div className="flex gap-2 pt-4 border-t border-border">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="px-4 py-2 rounded-lg bg-primary-blue text-white text-sm font-medium hover:bg-primary-blue/90 transition disabled:opacity-50"
                  >
                    {savingProfile
                      ? t('profile.saving')
                      : t('profile.save_changes')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 rounded-lg border border-border text-text-dark text-sm font-medium hover:bg-bg transition"
                  >
                    {t('profile.cancel')}
                  </button>
                </div>
              )}
            </form>

            {profileNotice && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`mt-4 p-3 rounded-lg text-sm ${
                  profileNotice.kind === 'success'
                    ? 'bg-success/10 text-success'
                    : 'bg-error/10 text-error'
                }`}
              >
                {profileNotice.message}
              </motion.div>
            )}
          </div>

          {/* Security */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="text-xl font-bold text-text-dark mb-6">
              {t('profile.security_title')}
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Change Password */}
              <div className="p-4 rounded-lg border border-border">
                <h3 className="text-lg font-semibold text-text-dark mb-4">
                  {t('profile.change_password_title')}
                </h3>
                {isChangingPassword ? (
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-text-secondary mb-2">
                        {t('profile.current_password_label')}
                      </label>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-text-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-text-secondary mb-2">
                        {t('profile.new_password_label')}
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        minLength={6}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-text-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue"
                        required
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={changingPassword}
                        className="flex-1 px-4 py-2 rounded-lg bg-primary-blue text-white text-sm font-medium hover:bg-primary-blue/90 transition disabled:opacity-50"
                      >
                        {changingPassword
                          ? t('profile.updating')
                          : t('profile.update_password')}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsChangingPassword(false)
                          setCurrentPassword('')
                          setNewPassword('')
                        }}
                        className="flex-1 px-4 py-2 rounded-lg border border-border text-text-dark text-sm font-medium hover:bg-bg transition"
                      >
                        {t('profile.cancel')}
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    onClick={() => setIsChangingPassword(true)}
                    className="w-full px-4 py-2 rounded-lg border border-border text-text-dark text-sm font-medium hover:bg-bg transition"
                  >
                    {t('profile.change_password_button')}
                  </button>
                )}
              </div>

              {/* Delete Account */}
              <div className="p-4 rounded-lg border border-error/20 bg-error/5">
                <h3 className="text-lg font-semibold text-error mb-4">
                  {t('profile.delete_account_title')}
                </h3>
                <p className="text-sm text-text-secondary mb-4">
                  {t('profile.delete_account_description')}
                </p>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={deleting}
                  className="w-full px-4 py-2 rounded-lg bg-error text-white text-sm font-medium hover:bg-error/90 transition disabled:opacity-50"
                >
                  {deleting
                    ? t('profile.deleting')
                    : t('profile.delete_account_button')}
                </button>
              </div>
            </div>

            {securityNotice && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`mt-4 p-3 rounded-lg text-sm ${
                  securityNotice.kind === 'success'
                    ? 'bg-success/10 text-success'
                    : 'bg-error/10 text-error'
                }`}
              >
                {securityNotice.message}
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Avatar Picker Modal */}
      <AnimatePresence>
        {showAvatarPicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowAvatarPicker(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-xl border border-border p-6 w-full max-w-md max-h-[80vh] overflow-y-auto shadow-xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-text-dark">
                  {t('profile.choose_avatar')}
                </h3>
                <button
                  onClick={() => setShowAvatarPicker(false)}
                  className="p-1 rounded-lg text-text-secondary hover:bg-bg transition"
                  type="button"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-text-secondary mb-2">
                    {t('profile.avatar_style', { style: selectedAvatarStyle })}
                  </p>
                  <select
                    value={selectedAvatarStyle}
                    onChange={(e) => setSelectedAvatarStyle(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-text-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue mb-4"
                  >
                    {AVATAR_STYLES.map((style) => (
                      <option key={style.name} value={style.name}>
                        {style.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-secondary mb-2">
                    {t('profile.avatar_seed')}
                  </p>
                  <div className="grid grid-cols-5 gap-3">
                    {AVATAR_SEEDS.map((seed) => (
                      <button
                        key={seed}
                        onClick={() => handleAvatarSelect(seed)}
                        className={`p-3 rounded-lg border-2 transition ${
                          selectedAvatarSeed === seed
                            ? 'border-primary-blue bg-primary-blue/10'
                            : 'border-border hover:border-primary-blue/50'
                        }`}
                        type="button"
                      >
                        <img
                          src={getAvatarUrl(selectedAvatarStyle, seed)}
                          alt={t('profile.avatar_alt', { seed })}
                          className="w-full h-16 rounded-lg object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={showDeleteConfirm}
        onConfirm={handleDeleteAccount}
        onCancel={() => setShowDeleteConfirm(false)}
        title={t('profile.delete_account_confirm_title')}
        description={t('profile.delete_account_confirm_description')}
        confirmLabel={
          deleting ? t('profile.deleting') : t('profile.delete_account_button')
        }
      />
    </motion.div>
  )
}
