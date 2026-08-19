import type { Ticket } from '@/lib/types'

interface TicketDescriptionProps {
  ticket: Ticket
  isEditingDesc: boolean
  descValue: string
  setDescValue: (value: string) => void
  canEditDescription: boolean
  onStartEdit: () => void
  onSave: () => void
  onCancel: () => void
}

export function TicketDescription({
  ticket,
  isEditingDesc,
  descValue,
  setDescValue,
  canEditDescription,
  onStartEdit,
  onSave,
  onCancel,
}: TicketDescriptionProps) {
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-semibold text-text-secondary">
          Description
        </p>
        {canEditDescription && !isEditingDesc && (
          <button
            onClick={onStartEdit}
            className="text-xs text-primary-blue hover:underline"
          >
            Edit
          </button>
        )}
      </div>
      {isEditingDesc ? (
        <div className="space-y-2">
          <textarea
            value={descValue}
            onChange={(e) => setDescValue(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-text-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue resize-none"
            rows={4}
          />
          <div className="flex gap-2">
            <button
              onClick={onSave}
              className="px-4 py-2 rounded-lg bg-primary-blue text-white text-sm font-medium hover:bg-primary-blue/90 transition-colors"
            >
              Save
            </button>
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-lg border border-border text-text-dark text-sm font-medium hover:bg-bg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <p className="text-text-dark whitespace-pre-wrap">
          {ticket.description}
        </p>
      )}
    </div>
  )
}
