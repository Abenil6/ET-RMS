import { useState } from 'react'
import { Modal } from '@/components/shared/Modal'
import type { AdminUserType, UpdateUserPayload } from '@/apis/admin'
import type { Role } from '@/lib/types'

const ROLE_LABELS: Record<Role, string> = {
  CUSTOMER: 'Customer',
  TECHNICIAN: 'Technician',
  ADMIN: 'Admin',
}

interface EditUserModalProps {
  user: AdminUserType
  onSubmit: (data: UpdateUserPayload) => void
  onCancel: () => void
}

export function EditUserModal({ user, onSubmit, onCancel }: EditUserModalProps) {
  const [name, setName] = useState(user.name)
  const [email, setEmail] = useState(user.email)
  const [phone, setPhone] = useState(user.phone || '')
  const [role, setRole] = useState<Role>(user.role)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const data: UpdateUserPayload = {}
    if (name !== user.name) data.name = name
    if (email !== user.email) data.email = email
    if (phone !== user.phone) data.phone = phone || null as any
    if (role !== user.role) data.role = role
    onSubmit(data)
  }

  return (
    <Modal onClose={onCancel} title="Edit User">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-text-secondary mb-2">
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-text-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-text-secondary mb-2">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-text-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-text-secondary mb-2">
            Phone
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-text-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-text-secondary mb-2">
            Role
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
            className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-text-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue"
          >
            {(Object.keys(ROLE_LABELS) as Role[]).map((r) => (
              <option key={r} value={r}>
                {ROLE_LABELS[r]}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            className="flex-1 px-4 py-2 rounded-lg bg-primary-blue text-white text-sm font-medium hover:bg-primary-blue/90 transition"
          >
            Save
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 rounded-lg border border-border text-text-dark text-sm font-medium hover:bg-bg transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  )
}
