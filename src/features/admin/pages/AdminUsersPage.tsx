import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
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
} from 'lucide-react'
import { useAuth } from '@/features/auth/hooks/useAuth'
import api from '@/apis'
import type { AdminUserType } from '@/apis'
import type { Role } from '@/lib/types'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { InviteUserModal } from '@/features/admin/components/InviteUserModal'
import { EditUserModal } from '@/features/admin/components/EditUserModal'

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
  { kind: 'invite' } | { kind: 'edit'; user: AdminUserType } | null

export function AdminUsersPage() {
  const { t } = useTranslation()
  const { user } = useAuth()

  // Fetch users using TanStack Query
  const {
    data: users = [],
    isLoading: loading,
    isError,
    error,
    refetch: loadUsers,
  } = api.Admin.getUsers.useQuery()

  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 10
  const [modal, setModal] = useState<ModalState>(null)
  const [confirm, setConfirm] = useState<{
    kind: 'ban' | 'unban' | 'reset' | 'delete'
    user: AdminUserType
  } | null>(null)

  // Mutations using TanStack Query
  const { mutate: createUser } = api.Admin.createUser.useMutation({
    onSuccess: () => {
      loadUsers()
      setModal(null)
    },
  })

  const { mutate: updateUser } = api.Admin.updateUser.useMutation({
    onSuccess: () => {
      loadUsers()
      setModal(null)
    },
  })

  const { mutate: banUser } = api.Admin.banUser.useMutation({
    onSuccess: () => {
      loadUsers()
      setConfirm(null)
    },
  })

  const { mutate: unbanUser } = api.Admin.unbanUser.useMutation({
    onSuccess: () => {
      loadUsers()
      setConfirm(null)
    },
  })

  const { mutate: resetPassword } = api.Admin.resetUserPassword.useMutation({
    onSuccess: () => {
      loadUsers()
      setConfirm(null)
    },
  })

  const { mutate: deleteUser } = api.Admin.deleteUser.useMutation({
    onSuccess: () => {
      loadUsers()
      setConfirm(null)
    },
  })

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return users
    return users.filter(
      (u: AdminUserType) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.phone ?? '').toLowerCase().includes(q),
    )
  }, [users, query])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pagedUsers = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  )

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="p-8 text-center text-text-secondary">
        {t('admin_users.unauthorized')}
      </div>
    )
  }

  if (loading) return <LoadingSpinner size="lg" />
  if (isError)
    return (
      <ErrorMessage
        message={error.message || t('admin_users.error_loading')}
        retry={loadUsers}
      />
    )

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className="w-full">
        <div className="flex items-start justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-text-dark mb-1">
              {t('admin_users.title')}
            </h1>
            <p className="text-text-secondary">{t('admin_users.subtitle')}</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => loadUsers()}
              className="p-2 rounded-lg border border-border text-text-dark hover:bg-bg transition"
              type="button"
              title={t('admin_users.refresh')}
            >
              <RefreshCw size={18} />
            </button>

            <button
              onClick={() => setModal({ kind: 'invite' })}
              className="px-4 py-2 rounded-lg bg-primary-blue text-white text-sm font-medium hover:bg-primary-blue/90 transition flex items-center gap-2"
              type="button"
            >
              <Plus size={18} />
              {t('admin_users.invite_user')}
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setPage(1)
            }}
            placeholder={t('admin_users.search_placeholder')}
            className="w-full px-4 py-2 rounded-lg border border-border bg-bg text-text-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="p-4 rounded-lg border border-border bg-card">
            <p className="text-xs text-text-secondary uppercase tracking-wide mb-1">
              {t('admin_users.total_users')}
            </p>
            <p className="text-2xl font-bold text-text-dark">{users.length}</p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card">
            <p className="text-xs text-text-secondary uppercase tracking-wide mb-1">
              {t('admin_users.active')}
            </p>
            <p className="text-2xl font-bold text-success">
              {users.filter((u: AdminUserType) => !u.banned).length}
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card">
            <p className="text-xs text-text-secondary uppercase tracking-wide mb-1">
              {t('admin_users.banned')}
            </p>
            <p className="text-2xl font-bold text-error">
              {users.filter((u: AdminUserType) => u.banned).length}
            </p>
          </div>
        </div>

        {/* Table */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <table className="w-full">
            <thead className="bg-bg border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wide">
                  {t('admin_users.name_column')}
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wide">
                  {t('admin_users.email_column')}
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wide">
                  {t('admin_users.phone_column')}
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wide">
                  {t('admin_users.role_column')}
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wide">
                  {t('admin_users.status_column')}
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wide">
                  {t('admin_users.actions_column')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {pagedUsers.map((u: AdminUserType) => (
                <tr key={u.id} className="hover:bg-bg/50 transition">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <UsersIcon size={16} className="text-text-secondary" />
                      <span className="text-sm font-medium text-text-dark">
                        {u.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-text-secondary">
                    {u.email}
                  </td>
                  <td className="px-4 py-3 text-sm text-text-secondary">
                    {u.phone || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${ROLE_STYLES[u.role]}`}
                    >
                      {t(`admin_users.roles.${u.role}`, {
                        defaultValue: ROLE_LABELS[u.role],
                      })}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {u.banned ? (
                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-error/10 text-error">
                        {t('admin_users.banned')}
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-success/10 text-success">
                        {t('admin_users.active')}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <IconButton
                        icon={Pencil}
                        title={t('admin_users.edit')}
                        onClick={() => setModal({ kind: 'edit', user: u })}
                      />
                      {u.banned ? (
                        <IconButton
                          icon={ShieldCheck}
                          title={t('admin_users.unban')}
                          onClick={() => setConfirm({ kind: 'unban', user: u })}
                        />
                      ) : (
                        <IconButton
                          icon={Ban}
                          title={t('admin_users.ban')}
                          onClick={() => setConfirm({ kind: 'ban', user: u })}
                        />
                      )}
                      <IconButton
                        icon={KeyRound}
                        title={t('admin_users.reset_password')}
                        onClick={() => setConfirm({ kind: 'reset', user: u })}
                      />
                      <IconButton
                        icon={Trash2}
                        title={t('admin_users.delete')}
                        onClick={() => setConfirm({ kind: 'delete', user: u })}
                        className="text-error hover:bg-error/10"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-text-secondary">
              {t('admin_users.showing', {
                from: (safePage - 1) * PAGE_SIZE + 1,
                to: Math.min(safePage * PAGE_SIZE, filtered.length),
                total: filtered.length,
              })}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className="px-3 py-1.5 rounded-lg border border-border text-sm text-text-dark hover:bg-bg transition disabled:opacity-50 disabled:cursor-not-allowed"
                type="button"
              >
                {t('admin_users.previous')}
              </button>
              <span className="text-sm text-text-secondary">
                {t('admin_users.page', { page: safePage, totalPages })}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                className="px-3 py-1.5 rounded-lg border border-border text-sm text-text-dark hover:bg-bg transition disabled:opacity-50 disabled:cursor-not-allowed"
                type="button"
              >
                {t('admin_users.next')}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Invite/Edit Modal */}
      <AnimatePresence>
        {modal && modal.kind === 'invite' && (
          <InviteUserModal
            onSubmit={(data) => createUser(data)}
            onCancel={() => setModal(null)}
          />
        )}
        {modal && modal.kind === 'edit' && (
          <EditUserModal
            user={modal.user}
            onSubmit={(data) => updateUser({ id: modal.user.id, data })}
            onCancel={() => setModal(null)}
          />
        )}
      </AnimatePresence>

      {/* Confirm Dialog */}
      {confirm && (
        <ConfirmDialog
          open={!!confirm}
          onConfirm={() => {
            const { kind, user: u } = confirm
            if (kind === 'ban') {
              banUser(u.id)
            } else if (kind === 'unban') {
              unbanUser(u.id)
            } else if (kind === 'reset') {
              resetPassword(u.id)
            } else {
              deleteUser(u.id)
            }
          }}
          onCancel={() => setConfirm(null)}
          title={
            confirm.kind === 'ban'
              ? t('admin_users.confirm_titles.ban')
              : confirm.kind === 'unban'
                ? t('admin_users.confirm_titles.unban')
                : confirm.kind === 'reset'
                  ? t('admin_users.confirm_titles.reset')
                  : t('admin_users.confirm_titles.delete')
          }
          description={
            confirm.kind === 'ban'
              ? t('admin_users.confirm_descriptions.ban', {
                  name: confirm.user.name,
                })
              : confirm.kind === 'unban'
                ? t('admin_users.confirm_descriptions.unban', {
                    name: confirm.user.name,
                  })
                : confirm.kind === 'reset'
                  ? t('admin_users.confirm_descriptions.reset', {
                      email: confirm.user.email,
                    })
                  : t('admin_users.confirm_descriptions.delete', {
                      name: confirm.user.name,
                    })
          }
          confirmLabel={
            confirm.kind === 'ban'
              ? t('admin_users.ban')
              : confirm.kind === 'unban'
                ? t('admin_users.unban')
                : confirm.kind === 'reset'
                  ? t('admin_users.reset')
                  : t('admin_users.delete')
          }
        />
      )}
    </motion.div>
  )
}

function IconButton({
  icon: Icon,
  title,
  onClick,
  className = '',
}: {
  icon: React.ComponentType<{ size?: number }>
  title: string
  onClick: () => void
  className?: string
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`p-2 rounded-lg border border-border text-text-secondary hover:bg-bg transition ${className}`}
      type="button"
    >
      <Icon size={16} />
    </button>
  )
}
