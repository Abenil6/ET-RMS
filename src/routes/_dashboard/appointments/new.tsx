import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { BRANCHES, TIME_SLOTS } from '../../../data/appointments'
import { motion } from 'motion/react'
import api from '@/apis'
import { useAuth } from '../../../context/auth'

export const Route = createFileRoute('/_dashboard/appointments/new')({
  component: NewAppointmentPage,
})

function parseStartTimeTo24h(timeSlot: string): string {
  const start = timeSlot.split('-')[0]?.trim() ?? timeSlot.trim()

  const ampm = start.match(/(AM|PM)$/i)
  if (!ampm) {
    const hm = start.match(/^(\d{1,2}):(\d{2})$/)
    if (hm) {
      const hh = hm[1].padStart(2, '0')
      return `${hh}:${hm[2]}`
    }
    return '09:00'
  }

  const m = start.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
  if (!m) return '09:00'

  let hh = Number(m[1])
  const mm = m[2]
  const mer = m[3].toUpperCase()

  if (mer === 'PM' && hh !== 12) hh += 12
  if (mer === 'AM' && hh === 12) hh = 0

  return `${String(hh).padStart(2, '0')}:${mm}`
}

function NewAppointmentPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [branch, setBranch] = useState('')
  const [date, setDate] = useState('')
  const [timeSlot, setTimeSlot] = useState('')
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string | null>(null)

  const canBook = useMemo(() => user?.role === 'CUSTOMER', [user])

  const { mutate: createAppointment, isPending: submitting } = api.Appointments.create.useMutation({
    onSuccess: () => {
      navigate({ to: '/appointments' })
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : 'Failed to create appointment.')
    },
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!canBook) {
      setError('Only customers can book appointments.')
      return
    }

    const hhmm = parseStartTimeTo24h(timeSlot)
    const localDate = new Date(`${date}T${hhmm}:00`)
    const slotTime = localDate.toISOString()

    createAppointment({ branch, slotTime, notes: reason || undefined })
  }

  return (
    <motion.div
      className="max-w-3xl"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold text-text-dark mb-1">Book an Appointment</h1>
        <p className="text-text-secondary mb-8">
          Reserve a time slot at your preferred branch to avoid waiting in line.
        </p>

        {error && (
          <div className="mb-5 p-4 rounded-xl border border-error/20 bg-error/10 text-error text-sm font-semibold">
            {error}
          </div>
        )}

        <div className="space-y-5">
          <div>
            <label htmlFor="branch" className="block text-sm font-semibold text-text-secondary mb-2">
              Branch
            </label>
            <select
              id="branch"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-text-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue"
            >
              <option value="">Select a branch</option>
              {BRANCHES.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="date" className="block text-sm font-semibold text-text-secondary mb-2">
              Date
            </label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-text-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue"
            />
          </div>

          <div>
            <label htmlFor="timeSlot" className="block text-sm font-semibold text-text-secondary mb-2">
              Time Slot
            </label>
            <select
              id="timeSlot"
              value={timeSlot}
              onChange={(e) => setTimeSlot(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-text-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue"
            >
              <option value="">Select a time slot</option>
              {TIME_SLOTS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="reason" className="block text-sm font-semibold text-text-secondary mb-2">
              Reason (optional)
            </label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="Describe the issue or service needed..."
              className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-text-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue resize-none"
            />
          </div>

          <button
            type="submit"
            onClick={handleSubmit}
            disabled={submitting || !branch || !date || !timeSlot}
            className="w-full py-2.5 px-4 rounded-lg bg-primary-blue text-white font-medium hover:bg-primary-blue/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Booking...' : 'Book Appointment'}
          </button>
        </div>
      </div>
    </motion.div>
  )
}
