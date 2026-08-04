import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { BRANCHES, TIME_SLOTS } from '../../../data/appointments'
import { motion } from 'motion/react'
import { api, ApiError } from '../../../lib/api'
import { useAuth } from '../../../context/auth'

export const Route = createFileRoute('/_dashboard/appointments/new')({
  component: NewAppointmentPage,
})

function parseStartTimeTo24h(timeSlot: string): string {
  // Accepts formats like:
  // "09:00", "09:00 - 10:00", "9:00 AM - 10:00 AM", "2:30 PM"
  const start = timeSlot.split('-')[0]?.trim() ?? timeSlot.trim()

  const ampm = start.match(/(AM|PM)$/i)
  if (!ampm) {
    // maybe already "HH:MM"
    const hm = start.match(/^(\d{1,2}):(\d{2})$/)
    if (hm) {
      const hh = hm[1].padStart(2, '0')
      return `${hh}:${hm[2]}`
    }
    // fallback
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
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canBook = useMemo(() => user?.role === 'CUSTOMER', [user])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!canBook) {
      setError('Only customers can book appointments.')
      return
    }

    try {
      setSubmitting(true)

      const hhmm = parseStartTimeTo24h(timeSlot)
      const localDate = new Date(`${date}T${hhmm}:00`)
      const slotTime = localDate.toISOString()

      await api.appointments.create({
        branch,
        slotTime,
        notes: reason || undefined,
      })

      navigate({ to: '/appointments' })
    } catch (err) {
      // Backend messages should already be good; show them directly.
      setError(err instanceof ApiError ? err.message : 'Failed to create appointment.')
    } finally {
      setSubmitting(false)
    }
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

        <div className="p-6 rounded-xl border border-border bg-card">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-text-dark mb-1">Select Branch</label>
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-text-dark focus:outline-none focus:ring-2 focus:ring-primary-green"
              >
                <option value="" disabled>
                  Choose a branch
                </option>
                {BRANCHES.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-text-dark focus:outline-none focus:ring-2 focus:ring-primary-green"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">Time Slot</label>
                <select
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-text-dark focus:outline-none focus:ring-2 focus:ring-primary-green"
                >
                  <option value="" disabled>
                    Choose a time
                  </option>
                  {TIME_SLOTS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-dark mb-1">Reason for Visit</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
                rows={3}
                placeholder="E.g. New Fiber Installation Inquiry"
                className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-text-dark focus:outline-none focus:ring-2 focus:ring-primary-green"
              />
            </div>

            <div className="pt-4 flex gap-3">
              <button
                type="button"
                onClick={() => navigate({ to: '/appointments' })}
                className="px-6 py-2 rounded-lg border border-border text-text-dark font-semibold hover:bg-bg"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 rounded-lg bg-primary-green text-white font-semibold hover:bg-primary-green/90 disabled:opacity-50"
              >
                {submitting ? 'Booking…' : 'Confirm Booking'}
              </button>
            </div>

            <p className="text-xs text-text-secondary">
              Notes: booking the same slot twice should return a 409 conflict. Selecting a past slot should return 422.
            </p>
          </form>
        </div>
      </div>
    </motion.div>
  )
}