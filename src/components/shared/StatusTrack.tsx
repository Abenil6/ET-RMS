import { motion } from 'motion/react'
import type { TicketStatus } from '../lib/types'

const STAGES: { status: TicketStatus; label: string }[] = [
  { status: 'OPEN', label: 'Open' },
  { status: 'ASSIGNED', label: 'Assigned' },
  { status: 'IN_PROGRESS', label: 'In Progress' },
  { status: 'RESOLVED', label: 'Resolved' },
  { status: 'CLOSED', label: 'Closed' },
]

export function StatusTrack({ status }: { status: TicketStatus }) {
  const rawIndex = STAGES.findIndex((s) => s.status === status)
  const currentIndex = rawIndex === -1 ? 0 : rawIndex

  return (
    <div className="p-6 rounded-xl border border-border bg-card mb-6">
      <div className="flex items-center">
        {STAGES.map((stage, i) => (
          <div key={stage.status} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <motion.div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  i <= currentIndex
                    ? 'bg-primary-green text-white'
                    : 'bg-bg border-2 border-border text-text-secondary'
                }`}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.12, duration: 0.25 }}
              >
                {i <= currentIndex ? '✓' : i + 1}
              </motion.div>
              <span
                className={`mt-2 text-xs font-medium text-center ${
                  i <= currentIndex ? 'text-text-dark' : 'text-text-secondary'
                }`}
              >
                {stage.label}
              </span>
            </div>

            {i < STAGES.length - 1 && (
              <motion.div
                className={`flex-1 h-1 mx-2 rounded ${i < currentIndex ? 'bg-primary-green' : 'bg-border'}`}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: i * 0.12 + 0.08, duration: 0.25 }}
                style={{ transformOrigin: 'left' }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
