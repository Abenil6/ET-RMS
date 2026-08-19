import { useNavigate } from '@tanstack/react-router'
import type { Ticket } from '@/lib/types'
import { STATUS_CONFIG } from '@/data/tickets'

interface TicketHeaderProps {
  ticket: Ticket
}

export function TicketHeader({ ticket }: TicketHeaderProps) {
  const navigate = useNavigate()
  const statusConfig = STATUS_CONFIG[ticket.status]

  return (
    <div className="mb-6">
      <button
        onClick={() => navigate({ to: '/tickets' })}
        className="text-sm text-text-secondary hover:text-primary-blue mb-2 transition-colors"
      >
        ← Back to Tickets
      </button>
      <h1 className="text-3xl font-bold">Ticket Details</h1>
      <p className="text-text-secondary">
        View and manage ticket information
      </p>
      
      <div className="mt-4 flex items-start justify-between">
        <div>
          <p className="text-xs text-text-secondary uppercase tracking-wide mb-1">
            Ticket ID
          </p>
          <p className="text-lg font-mono font-bold text-text-dark">
            #{ticket.id.slice(0, 8)}
          </p>
        </div>
        <div
          className={`px-3 py-1.5 rounded-full text-xs font-semibold ${statusConfig.bg} ${statusConfig.color}`}
        >
          {statusConfig.label}
        </div>
      </div>
    </div>
  )
}
