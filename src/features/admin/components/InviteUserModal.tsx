import { useState } from 'react'
import { Modal } from '@/components/shared/Modal'
import type { CreateUserPayload } from '@/apis/admin'
import type { Role } from '@/lib/types'

const ROLE_LABELS: Record<Role, string> = {
  CUSTOMER: 'Customer',
  TECHNICIAN: 'Technician',
  ADMIN: 'Admin',
}

interface InviteUserModalProps {
  onSubmit: (data: CreateUserPayload) => void
  onCancel: () => void
}

export function InviteUserModal({ onSubmit, onCancel }: InviteUserModalProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<Role>('CUSTOMER')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit({ name, email, password, role })
  }

  return (
    <Modal onClose={onCancel} title="Invite User">
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
            Temporary Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-text-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue"
            required
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
            Invite
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
