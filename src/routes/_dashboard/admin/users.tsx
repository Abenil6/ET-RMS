import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  Users as UsersIcon,
  Plus,
  Pencil,
  Ban,
  ShieldCheck,
  KeyRound,
  Trash2,
  RefreshCw,
  X,
} from 'lucide-react'
import { useAuth } from '../../../context/auth'
import { api, ApiError } from '../../../lib/api'
import type { AdminUser, Role } from '../../../lib/types'
import { LoadingSpinner } from '../../../components/LoadingSpinner'
import { ErrorMessage } from '../../../components/ErrorMessage'
import ConfirmDialog from '../../../components/ConfirmDialog'

export const Route = createFileRoute('/_dashboard/admin/users')({
  component: AdminUsersPage,
})

const ROLE_LABELS: Record<Role, string> = {
  CUSTOMER: 'Customer',
  TECHNICIAN: 'Technician',
  ADMIN: 'Admin',
}

const ROLE_STYLES: Record<Role, string> = {
  CUSTOMER: 'bg-bg text-text-secondary',
  TECHNICIAN: 'bg-primary-blue/10 text-primary-blue',
  ADMIN: 'bg-primary-green/10 text-primary-green',
}

type ModalState =
  | { kind: 'invite' }
  | { kind: 'edit'; user: AdminUser }
  | null

function AdminUsersPage() {
  const { user } = useAuth()

  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [modal, setModal] = useState<ModalState>(null)
  const [confirm, setConfirm] = useState<{
    kind: 'ban' | 'unban' | 'reset' | 'delete'
    user: AdminUser
  } | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const loadUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await api.admin.getUsers()
      setUsers(data.users as AdminUser[])
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user?.role !== 'ADMIN') return
    void loadUsers()
  }, [user])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return users
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.phone ?? '').toLowerCase().includes(q),
    )
  }, [users, query])

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="p-8 text-center text-text-secondary">
        Unauthorized access.
      </div>
    )
  }

  if (loading) return <LoadingSpinner size="lg" />
  if (error) return <ErrorMessage message={error} retry={loadUsers} />

  const flash = (msg: string) => {
    setToast(msg)
    window.setTimeout(() => setToast(null), 4000)
  }

  async function runAction(action: () => Promise<unknown>, id: string) {
    setBusyId(id)
    try {
      const res = await action()
      flash(
        typeof res === 'object' && res !== null && 'message' in res
          ? String((res as { message: string }).message)
          : 'Done.',
      )
      setConfirm(null)
      await loadUsers()
    } catch (err) {
      flash(err instanceof ApiError ? err.message : 'Action failed.')
      setConfirm(null)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className="max-w-5xl">
        <div className="flex items-start justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-text-dark mb-1">
              User Management
            </h1>
            <p className="text-text-secondary">
              Invite staff and manage every account on the platform.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadUsers}
              className="p-2 rounded-lg border border-border text-text-dark hover:bg-bg transition"
              type="button"
              title="Refresh"
            >
              <RefreshCw size={18} />
            </button>

            <button
              onClick={() => setModal({ kind: 'invite' })}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-green text-white text-sm font-semibold hover:bg-primary-green/90 transition"
              type="button"
            >
              <Plus size={16} />
              Invite User
            </button>
          </div>
        </div>

        {toast && (
          <div className="mb-5 p-4 rounded-xl border border-primary-green/20 bg-primary-green/10 text-primary-green text-sm font-semibold">
            {toast}
          </div>
        )}

        <div className="mb-5">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, email or phone…"
            className="w-full max-w-sm px-4 py-2 rounded-lg border border-border bg-card text-text-dark placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary-green"
          />
        </div>

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-bg border-b border-border text-text-secondary">
              <tr>
                <th className="px-5 py-3 font-semibold uppercase tracking-wide text-xs">
                  User
                </th>
                <th className="px-5 py-3 font-semibold uppercase tracking-wide text-xs">
                  Role
                </th>
                <th className="px-5 py-3 font-semibold uppercase tracking-wide text-xs">
                  Status
                </th>
                <th className="px-5 py-3 font-semibold uppercase tracking-wide text-xs">
                  Joined
                </th>
                <th className="px-5 py-3 font-semibold uppercase tracking-wide text-xs text-right">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-text-secondary">
                    {users.length === 0
                      ? 'No users yet.'
                      : 'No users match your search.'}
                  </td>
                </tr>
              ) : (
                filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-bg/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary-green/10 flex items-center justify-center shrink-0">
                          <UsersIcon size={15} className="text-primary-green" />
                        </div>
                        <div>
                          <p className="font-semibold text-text-dark">{u.name}</p>
                          <p className="text-xs text-text-secondary">{u.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${ROLE_STYLES[u.role]}`}
                      >
                        {ROLE_LABELS[u.role]}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      {u.banned ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-error/10 text-error">
                          Banned
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-success/10 text-success">
                          Active
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4 text-text-secondary">
                      {new Date(u.createdAt).toLocaleDateString('en-ET', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <IconButton
                          title="Edit"
                          onClick={() => setModal({ kind: 'edit', user: u })}
                        >
                          <Pencil size={15} />
                        </IconButton>

                        {u.banned ? (
                          <IconButton
                            title="Unban"
                            onClick={() => setConfirm({ kind: 'unban', user: u })}
                          >
                            <ShieldCheck size={15} />
                          </IconButton>
                        ) : (
                          <IconButton
                            title="Ban"
                            onClick={() => setConfirm({ kind: 'ban', user: u })}
                          >
                            <Ban size={15} />
                          </IconButton>
                        )}

                        <IconButton
                          title="Reset password"
                          onClick={() => setConfirm({ kind: 'reset', user: u })}
                        >
                          <KeyRound size={15} />
                        </IconButton>

                        <IconButton
                          title="Delete"
                          danger
                          onClick={() => setConfirm({ kind: 'delete', user: u })}
                        >
                          <Trash2 size={15} />
                        </IconButton>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modal?.kind === 'invite' && (
        <InviteUserModal
          onClose={() => setModal(null)}
          onCreated={async () => {
            setModal(null)
            await loadUsers()
            flash('Invitation sent. Temporary password is in the email.')
          }}
        />
      )}

      {modal?.kind === 'edit' && (
        <EditUserModal
          user={modal.user}
          onClose={() => setModal(null)}
          onSaved={async () => {
            setModal(null)
            await loadUsers()
            flash('User updated.')
          }}
        />
      )}

      {confirm && (
        <ConfirmDialog
          open
          loading={busyId === confirm.user.id}
          variant={confirm.kind === 'ban' || confirm.kind === 'delete' ? 'danger' : 'warning'}
          title={
            confirm.kind === 'ban'
              ? 'Ban this user?'
              : confirm.kind === 'unban'
                ? 'Unban this user?'
                : confirm.kind === 'reset'
                  ? 'Reset this password?'
                  : 'Delete this user?'
          }
          description={
            confirm.kind === 'ban'
              ? `${confirm.user.name} will be blocked immediately and all sessions revoked. They can still be unbanned later.`
              : confirm.kind === 'unban'
                ? `${confirm.user.name} will regain access to their account.`
                : confirm.kind === 'reset'
                  ? `A temporary password will be emailed to ${confirm.user.email}. All sessions will be revoked.`
                  : `${confirm.user.name} and all their data (tickets, appointments, notifications) will be permanently deleted. This cannot be undone.`
          }
          confirmLabel={
            confirm.kind === 'ban'
              ? 'Ban'
              : confirm.kind === 'unban'
                ? 'Unban'
                : confirm.kind === 'reset'
                  ? 'Reset'
                  : 'Delete'
          }
          onCancel={() => setConfirm(null)}
          onConfirm={() => {
            const { kind, user: u } = confirm
            if (kind === 'ban') {
              void runAction(() => api.admin.banUser(u.id), u.id)
            } else if (kind === 'unban') {
              void runAction(() => api.admin.unbanUser(u.id), u.id)
            } else if (kind === 'reset') {
              void runAction(() => api.admin.resetUserPassword(u.id), u.id)
            } else {
              void runAction(() => api.admin.deleteUser(u.id), u.id)
            }
          }}
        />
      )}
    </motion.div>
  )
}

function IconButton({
  children,
  title,
  danger = false,
  onClick,
}: {
  children: React.ReactNode
  title: string
  danger?: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      type="button"
      className={`p-2 rounded-lg border border-border text-text-secondary hover:bg-bg transition ${
        danger
          ? 'hover:text-error hover:border-error/30'
          : 'hover:text-text-dark'
      }`}
    >
      {children}
    </button>
  )
}

function ModalShell({
  title,
  subtitle,
  onClose,
  children,
}: {
  title: string
  subtitle?: string
  onClose: () => void
  children: React.ReactNode
}) {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-[2px] z-[100]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
        <motion.div
          className="relative bg-card rounded-2xl border border-border shadow-2xl w-full max-w-md overflow-hidden"
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.95, y: 10, opacity: 0 }}
          transition={{ type: 'spring', duration: 0.35, bounce: 0.2 }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-full text-text-secondary hover:bg-bg hover:text-text-dark transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>

          <div className="px-6 pt-6 pb-4">
            <h2 className="text-lg font-bold text-text-dark">{title}</h2>
            {subtitle && (
              <p className="text-sm text-text-secondary mt-1">{subtitle}</p>
            )}
          </div>

          <div className="px-6 pb-6">{children}</div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-text-dark mb-1">
        {label}
      </label>
      {children}
    </div>
  )
}

const inputClass =
  'w-full px-3 py-2 rounded-lg border border-border bg-bg text-text-dark focus:outline-none focus:ring-2 focus:ring-primary-green'

function InviteUserModal({
  onClose,
  onCreated,
}: {
  onClose: () => void
  onCreated: () => void
}) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'ADMIN' | 'TECHNICIAN'>('TECHNICIAN')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      setSubmitting(true)
      await api.admin.createUser({ name, email, role })
      onCreated()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to invite user.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <ModalShell
      title="Invite User"
      subtitle="A temporary password is emailed to the invitee."
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg border border-error/20 bg-error/10 text-error text-sm font-semibold">
            {error}
          </div>
        )}

        <Field label="Full Name">
          <input
            className={inputClass}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="e.g. Abebe Kebede"
          />
        </Field>

        <Field label="Email">
          <input
            type="email"
            className={inputClass}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="name@example.com"
          />
        </Field>

        <Field label="Role">
          <select
            className={inputClass}
            value={role}
            onChange={(e) => setRole(e.target.value as 'ADMIN' | 'TECHNICIAN')}
          >
            <option value="TECHNICIAN">Technician</option>
            <option value="ADMIN">Admin</option>
          </select>
        </Field>

        <div className="pt-2 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-6 py-2 rounded-lg border border-border text-text-dark font-semibold hover:bg-bg"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 px-6 py-2 rounded-lg bg-primary-green text-white font-semibold hover:bg-primary-green/90 disabled:opacity-50"
          >
            {submitting ? 'Inviting…' : 'Send Invite'}
          </button>
        </div>
      </form>
    </ModalShell>
  )
}

function EditUserModal({
  user,
  onClose,
  onSaved,
}: {
  user: AdminUser
  onClose: () => void
  onSaved: () => void
}) {
  const [name, setName] = useState(user.name)
  const [email, setEmail] = useState(user.email)
  const [phone, setPhone] = useState(user.phone ?? '')
  const [role, setRole] = useState<Role>(user.role)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      setSubmitting(true)
      await api.admin.updateUser(user.id, {
        name,
        email,
        role,
        phone: phone || undefined,
      })
      onSaved()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to update user.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <ModalShell
      title="Edit User"
      subtitle={user.email}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg border border-error/20 bg-error/10 text-error text-sm font-semibold">
            {error}
          </div>
        )}

        <Field label="Full Name">
          <input
            className={inputClass}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </Field>

        <Field label="Email">
          <input
            type="email"
            className={inputClass}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Field>

        <Field label="Phone">
          <input
            className={inputClass}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+251…"
          />
        </Field>

        <Field label="Role">
          <select
            className={inputClass}
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
          >
            <option value="CUSTOMER">Customer</option>
            <option value="TECHNICIAN">Technician</option>
            <option value="ADMIN">Admin</option>
          </select>
        </Field>

        <div className="pt-2 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-6 py-2 rounded-lg border border-border text-text-dark font-semibold hover:bg-bg"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 px-6 py-2 rounded-lg bg-primary-green text-white font-semibold hover:bg-primary-green/90 disabled:opacity-50"
          >
            {submitting ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </ModalShell>
  )
}
