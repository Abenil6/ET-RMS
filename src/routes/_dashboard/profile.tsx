import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Mail, Shield, Edit2, KeyRound, Trash2, X, Phone } from 'lucide-react'
import ConfirmDialog from '../../components/ConfirmDialog'
import { useEffect, useState } from 'react'
import { useAuth } from '../../context/auth'
import { motion, AnimatePresence } from 'motion/react'
import {
  AVATAR_STYLES,
  AVATAR_SEEDS,
  getAvatarUrl,
  DEFAULT_AVATAR_STYLE,
  DEFAULT_AVATAR_SEED,
} from '../../lib/avatars'
import { api, ApiError } from '../../lib/api'

export const Route = createFileRoute('/_dashboard/profile')({
  component: ProfilePage,
})

type Notice = { kind: 'success' | 'error'; message: string } | null

function ProfilePage() {
  const navigate = useNavigate()
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

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    setProfileNotice(null)

    if (!name.trim()) {
      setProfileNotice({ kind: 'error', message: 'Name is required.' })
      return
    }
    if (!email.trim()) {
      setProfileNotice({ kind: 'error', message: 'Email is required.' })
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
        setProfileNotice({ kind: 'error', message: result.error || 'Failed to update profile.' })
        return
      }

      setIsEditing(false)
      setProfileNotice({ kind: 'success', message: 'Profile updated successfully.' })
      setTimeout(() => setProfileNotice(null), 4000)
    } finally {
      setSavingProfile(false)
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    setSecurityNotice(null)

    if (!currentPassword || !newPassword) {
      setSecurityNotice({ kind: 'error', message: 'Please fill in both current and new passwords.' })
      return
    }
    if (newPassword.length < 6) {
      setSecurityNotice({ kind: 'error', message: 'New password must be at least 6 characters.' })
      return
    }

    try {
      setChangingPassword(true)
      await api.auth.changePassword(currentPassword, newPassword)

      setCurrentPassword('')
      setNewPassword('')
      setIsChangingPassword(false)

      setSecurityNotice({ kind: 'success', message: 'Password updated successfully.' })
      setTimeout(() => setSecurityNotice(null), 4000)
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to change password.'
      setSecurityNotice({ kind: 'error', message: msg })
    } finally {
      setChangingPassword(false)
    }
  }

  function handleAvatarSelect(seed: string) {
    setSelectedAvatarSeed(seed)
    setShowAvatarPicker(false)
  }

  async function confirmDeleteAccount() {
    setSecurityNotice(null)

    try {
      setDeleting(true)
      await api.auth.deleteAccount()

      // After deletion, clear local session
      await logout()
      navigate({ to: '/login' })
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to delete account.'
      // Common case: 409 "Cannot delete account with existing tickets"
      setSecurityNotice({ kind: 'error', message: msg })
    } finally {
      setDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  return (
    <motion.div
      className="w-full space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h1 className="text-2xl font-bold text-text-dark mb-4">My Profile</h1>

      <AnimatePresence mode="wait">
        {profileNotice && (
          <motion.div
            className={`p-4 rounded-xl border text-sm font-semibold ${profileNotice.kind === 'success'
              ? 'border-success/20 bg-success/10 text-success'
              : 'border-error/20 bg-error/10 text-error'
              }`}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            {profileNotice.message}
          </motion.div>
        )}

        {securityNotice && (
          <motion.div
            className={`p-4 rounded-xl border text-sm font-semibold ${securityNotice.kind === 'success'
              ? 'border-primary-blue/20 bg-primary-blue/10 text-primary-blue'
              : 'border-error/20 bg-error/10 text-error'
              }`}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            {securityNotice.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile card */}
      <motion.div
        className="p-6 rounded-xl border border-border bg-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
      >
        <div className="flex items-center justify-between pb-5 mb-5 border-b border-border">
          <div className="flex items-center gap-4">
            <div className="relative">
              <motion.div
                className="w-14 h-14 rounded-full overflow-hidden bg-primary-green/10 cursor-pointer ring-2 ring-primary-green/20"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
                onClick={() => isEditing && setShowAvatarPicker(true)}
              >
                <img
                  src={getAvatarUrl(selectedAvatarStyle, selectedAvatarSeed)}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              </motion.div>

              {isEditing && (
                <motion.button
                  type="button"
                  onClick={() => setShowAvatarPicker(true)}
                  className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary-green text-white flex items-center justify-center hover:bg-primary-green/90 shadow-md"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Edit2 size={12} />
                </motion.button>
              )}
            </div>

            <div>
              <p className="font-bold text-text-dark">{user.name}</p>
              <p className="text-sm text-text-secondary capitalize">{user.role}</p>
            </div>
          </div>

          <motion.button
            onClick={() => {
              setProfileNotice(null)
              setName(user.name)
              setEmail(user.email)
              setPhone((user as any)?.phone || '')
              setSelectedAvatarStyle(user.avatarStyle || DEFAULT_AVATAR_STYLE)
              setSelectedAvatarSeed(user.avatarSeed || DEFAULT_AVATAR_SEED)
              setIsEditing((v) => !v)
            }}
            className="text-primary-green text-sm font-semibold hover:underline flex items-center gap-1"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Edit2 size={16} />
            {isEditing ? 'Cancel' : 'Edit'}
          </motion.button>
        </div>

        {/* Avatar Picker Modal */}
        <AnimatePresence>
          {showAvatarPicker && (
            <>
              <motion.div
                className="fixed inset-0 bg-black/50 z-40"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowAvatarPicker(false)}
              />
              <motion.div
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card rounded-2xl border border-border shadow-2xl z-50 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
                initial={{ opacity: 0, scale: 0.9, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                transition={{ type: 'spring', duration: 0.3 }}
              >
                <div className="flex items-center justify-between p-4 border-b border-border">
                  <h3 className="text-lg font-bold text-text-dark">Choose Your Avatar</h3>
                  <motion.button
                    onClick={() => setShowAvatarPicker(false)}
                    className="p-1 rounded-full hover:bg-bg text-text-secondary"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X size={20} />
                  </motion.button>
                </div>

                <div className="p-4 border-b border-border overflow-x-auto">
                  <p className="text-xs font-semibold text-text-secondary mb-2 uppercase">Style</p>
                  <div className="flex gap-2">
                    {AVATAR_STYLES.map((style) => (
                      <motion.button
                        key={style.name}
                        type="button"
                        onClick={() => setSelectedAvatarStyle(style.name)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${selectedAvatarStyle === style.name
                          ? 'bg-primary-green text-white'
                          : 'bg-bg text-text-secondary hover:bg-primary-green/10'
                          }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {style.name}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div className="p-4 grid grid-cols-4 gap-3 overflow-y-auto flex-1">
                  {AVATAR_SEEDS.map((seed, index) => (
                    <motion.button
                      key={seed}
                      type="button"
                      onClick={() => handleAvatarSelect(seed)}
                      className={`aspect-square rounded-xl overflow-hidden transition-all ${selectedAvatarSeed === seed
                        ? 'ring-4 ring-primary-green'
                        : 'ring-2 ring-border hover:ring-primary-green/50'
                        }`}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.03 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <img
                        src={getAvatarUrl(selectedAvatarStyle, seed)}
                        alt={`Avatar ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {isEditing ? (
            <motion.form
              className="space-y-4"
              onSubmit={handleSaveProfile}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                  <label className="block text-sm font-medium text-text-dark mb-1">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-text-dark focus:outline-none focus:ring-2 focus:ring-primary-green transition-all"
                  />
                </motion.div>

                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
                  <label className="block text-sm font-medium text-text-dark mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-text-dark focus:outline-none focus:ring-2 focus:ring-primary-green transition-all"
                  />
                </motion.div>

                <motion.div
                  className="sm:col-span-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <label className="block text-sm font-medium text-text-dark mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+2519..."
                    className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-text-dark focus:outline-none focus:ring-2 focus:ring-primary-green transition-all"
                  />
                </motion.div>
              </div>

              <motion.button
                type="submit"
                disabled={savingProfile}
                className="px-5 py-2 rounded-lg bg-primary-green text-white font-semibold hover:bg-primary-green/90 text-sm disabled:opacity-50"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {savingProfile ? 'Saving…' : 'Save Changes'}
              </motion.button>
            </motion.form>
          ) : (
            <motion.div
              className="space-y-5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <InfoRow icon={Mail} label="Email" value={user.email} index={0} />
              <InfoRow icon={Phone} label="Phone" value={(user as any)?.phone || '—'} index={1} />
              <InfoRow icon={Shield} label="Role" value={user.role} index={2} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Security */}
      <motion.div
        className="p-6 rounded-xl border border-border bg-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-text-dark">Security</h2>
            <p className="text-sm text-text-secondary mt-1">Manage your password and account security.</p>
          </div>

          <motion.button
            onClick={() => {
              setSecurityNotice(null)
              setIsChangingPassword((v) => !v)
            }}
            className="text-primary-green text-sm font-semibold hover:underline flex items-center gap-1"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <KeyRound size={16} />
            {isChangingPassword ? 'Cancel' : 'Change Password'}
          </motion.button>
        </div>

        <AnimatePresence>
          {isChangingPassword && (
            <motion.form
              className="mt-5 space-y-4 pt-5 border-t border-border"
              onSubmit={handleChangePassword}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                <label className="block text-sm font-medium text-text-dark mb-1">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full sm:max-w-md px-3 py-2 rounded-lg border border-border bg-bg text-text-dark focus:outline-none focus:ring-2 focus:ring-primary-green transition-all"
                />
              </motion.div>

              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
                <label className="block text-sm font-medium text-text-dark mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full sm:max-w-md px-3 py-2 rounded-lg border border-border bg-bg text-text-dark focus:outline-none focus:ring-2 focus:ring-primary-green transition-all"
                />
              </motion.div>

              <motion.button
                type="submit"
                disabled={changingPassword}
                className="px-5 py-2 rounded-lg bg-primary-green text-white font-semibold hover:bg-primary-green/90 text-sm disabled:opacity-50"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {changingPassword ? 'Updating…' : 'Update Password'}
              </motion.button>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Danger Zone */}
      <motion.div
        className="p-6 rounded-xl border border-error/20 bg-error/5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        <h2 className="text-lg font-bold text-error">Danger Zone</h2>
        <p className="text-sm text-text-secondary mt-1 mb-4">
          Once you delete your account, there is no going back. Please be certain.
        </p>
        <motion.button
          type="button"
          onClick={() => setShowDeleteConfirm(true)}
          className="px-5 py-2 rounded-lg bg-error text-white font-semibold hover:bg-error/90 text-sm flex items-center gap-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Trash2 size={16} />
          Delete Account
        </motion.button>
      </motion.div>

      {/* Delete Account Confirmation Dialog */}
      <ConfirmDialog
        open={showDeleteConfirm}
        onCancel={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDeleteAccount}
        title="Delete your account?"
        description="This action is permanent and cannot be undone. All your data, tickets, and history will be removed."
        confirmLabel={deleting ? 'Deleting…' : 'Yes, Delete My Account'}
        cancelLabel="Keep My Account"
        variant="danger"
        loading={deleting}
      />
    </motion.div>
  )
}

function InfoRow({
  icon: Icon,
  label,
  value,
  index,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>
  label: string
  value: string
  index: number
}) {
  return (
    <motion.div
      className="flex items-center gap-3"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Icon size={16} className="text-text-secondary" />
      <div>
        <p className="text-xs text-text-secondary">{label}</p>
        <p className="text-sm font-medium text-text-dark capitalize">{value}</p>
      </div>
    </motion.div>
  )
}