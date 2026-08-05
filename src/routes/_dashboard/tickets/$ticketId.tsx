import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { api, ApiError } from '../../../lib/api'
import { useQueuePosition } from '../../../lib/useQueuePosition'
import { useAuth } from '../../../context/auth'
import type { Ticket, TicketPriority } from '../../../lib/types'
import { LoadingSpinner } from '../../../components/LoadingSpinner'
import { ErrorMessage } from '../../../components/ErrorMessage'
import { InfoField } from '../../../components/InfoField'
import { StatusTrack } from '../../../components/StatusTrack'
import { QueueInfoCards } from '../../../components/QueueInfoCards'
import {
  STATUS_CONFIG,
  PRIORITY_CONFIG,
  CATEGORY_LABELS,
} from '../../../data/tickets'

export const Route = createFileRoute('/_dashboard/tickets/$ticketId')({
  component: TicketDetailPage,
})

type TechnicianListItem = {
  id: string
  name: string
  openTickets?: number
  activeTickets?: number
}

function TicketDetailPage() {
  const { ticketId } = Route.useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [actionError, setActionError] = useState<string | null>(null)
  const [actionSuccess, setActionSuccess] = useState<string | null>(null)

  // Description edit
  const [isEditingDesc, setIsEditingDesc] = useState(false)
  const [descValue, setDescValue] = useState('')

  // Review
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')

  // Resolve
  const [showResolveForm, setShowResolveForm] = useState(false)
  const [resolutionNotes, setResolutionNotes] = useState('')

  // Admin assign
  const [technicians, setTechnicians] = useState<TechnicianListItem[]>([])
  const [techLoading, setTechLoading] = useState(false)
  const [assignToId, setAssignToId] = useState('')

  // Priority update
  const [priorityDraft, setPriorityDraft] = useState<TicketPriority>('MEDIUM')
  const [prioritySaving, setPrioritySaving] = useState(false)

  const isAdmin = !!user && user.role === 'ADMIN'
  const isCustomer =
    !!user &&
    !!ticket &&
    user.role === 'CUSTOMER' &&
    user.id === ticket.customerId

  const isAssignedTech =
    !!user &&
    !!ticket &&
    user.role === 'TECHNICIAN' &&
    user.id === ticket.technicianId

  const queueEnabled =
    !!ticket &&
    ticket.status !== 'RESOLVED' &&
    ticket.status !== 'CLOSED' &&
    ticket.status !== 'CANCELLED'

  const {
    queue: liveQueue,
    lastUpdated: queueUpdatedAt,
    error: queueError,
    refresh: refreshQueue,
  } = useQueuePosition(ticket?.id, queueEnabled, 30000)

  const queueInfo = liveQueue ?? ticket?.queue

  async function loadTicket() {
    try {
      setLoading(true)
      setLoadError(null)
      setActionError(null)

      const data = (await api.tickets.getById(ticketId)) as Ticket
      setTicket(data)
      setDescValue(data.description || '')
      setPriorityDraft(data.priority)
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : 'Failed to load ticket.')
    } finally {
      setLoading(false)
    }
  }

  async function loadTechnicians() {
    if (!isAdmin) return
    try {
      setTechLoading(true)
      const data = (await api.admin.getTechnicians()) as TechnicianListItem[]
      setTechnicians(data)
    } catch (err) {
      // non-blocking
      console.error(err)
    } finally {
      setTechLoading(false)
    }
  }

  useEffect(() => {
    loadTicket()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticketId])

  useEffect(() => {
    if (isAdmin) loadTechnicians()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin])

  useEffect(() => {
    if (!actionSuccess) return
    const t = setTimeout(() => setActionSuccess(null), 3500)
    return () => clearTimeout(t)
  }, [actionSuccess])

  if (loading) return <LoadingSpinner size="lg" />
  if (loadError) return <ErrorMessage message={loadError} retry={loadTicket} />
  if (!ticket || !user) return <p className="text-text-secondary">Ticket not found.</p>

  const statusBadge = STATUS_CONFIG[ticket.status]
  const priorityBadge = PRIORITY_CONFIG[ticket.priority]

  async function handleCancel() {
    setActionError(null)
    setActionSuccess(null)
    if (!confirm('Cancel this ticket?')) return
    try {
      await api.tickets.update(ticket!.id, { status: 'CANCELLED' })
      setActionSuccess('Ticket cancelled.')
      await loadTicket()
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : 'Failed to cancel ticket.')
    }
  }

  async function handleSaveDescription() {
    setActionError(null)
    setActionSuccess(null)
    try {
      await api.tickets.update(ticket!.id, { description: descValue })
      setIsEditingDesc(false)
      setActionSuccess('Description updated.')
      await loadTicket()
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : 'Failed to update description.')
    }
  }

  async function handleStartWork() {
    setActionError(null)
    setActionSuccess(null)
    try {
      await api.tickets.update(ticket!.id, { status: 'IN_PROGRESS' })
      setActionSuccess('Ticket moved to In Progress.')
      await loadTicket()
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : 'Failed to start work.')
    }
  }

  async function handleResolve(e: React.FormEvent) {
    e.preventDefault()
    setActionError(null)
    setActionSuccess(null)
    try {
      await api.tickets.resolve(ticket!.id, resolutionNotes.trim() || 'Resolved')
      setShowResolveForm(false)
      setResolutionNotes('')
      setActionSuccess('Ticket resolved.')
      await loadTicket()
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : 'Failed to resolve ticket.')
    }
  }

  async function handleReopen() {
    setActionError(null)
    setActionSuccess(null)
    if (!confirm('Reopen this resolved ticket?')) return
    try {
      await api.tickets.reopen(ticket!.id)
      setActionSuccess('Ticket reopened and moved to In Progress.')
      await loadTicket()
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : 'Failed to reopen ticket.')
    }
  }

  async function handleAssign() {
    if (!assignToId) return
    setActionError(null)
    setActionSuccess(null)
    try {
      await api.tickets.assign(ticket!.id, assignToId)
      setAssignToId('')
      setActionSuccess('Technician assigned.')
      await loadTicket()
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : 'Failed to assign technician.')
    }
  }

  async function handleSubmitReview(e: React.FormEvent) {
    e.preventDefault()
    setActionError(null)
    setActionSuccess(null)
    try {
      await api.tickets.review(ticket!.id, rating, comment)
      setShowReviewForm(false)
      setComment('')
      setActionSuccess('Review submitted. Ticket closed.')
      await loadTicket()
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : 'Failed to submit review.')
    }
  }

  async function handleSavePriority() {
    setActionError(null)
    setActionSuccess(null)
    try {
      setPrioritySaving(true)
      await api.tickets.update(ticket!.id, { priority: priorityDraft })
      setActionSuccess('Priority updated.')
      await loadTicket()
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : 'Failed to update priority.')
    } finally {
      setPrioritySaving(false)
    }
  }

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-3 gap-2 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-text-dark">{ticket.ticketNumber}</h1>
          <p className="text-text-secondary font-medium">
            <span className="text-text-dark font-mono">
              Service Number: {ticket.serviceNumber}
            </span>
            <br />
            <span className="text-text-dark">Subject: {ticket.subject}</span>
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-bg border border-border text-text-dark">
            {CATEGORY_LABELS[ticket.category] || ticket.category}
          </span>

          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${priorityBadge.bg} ${priorityBadge.color}`}
          >
            {priorityBadge.label} Priority
          </span>

          <span
            className={`px-3 py-1 rounded-full text-sm font-semibold ${statusBadge.bg} ${statusBadge.color}`}
          >
            {statusBadge.label}
          </span>
        </div>
      </div>

      {/* Inline action feedback */}
      {(actionError || actionSuccess) && (
        <div
          className={`mb-4 p-4 rounded-xl border text-sm font-semibold ${actionError
            ? 'border-error/20 bg-error/10 text-error'
            : 'border-success/20 bg-success/10 text-success'
            }`}
        >
          {actionError || actionSuccess}
        </div>
      )}

      {/* Customer/Technician info */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 p-5 rounded-xl border border-border bg-card">
        <InfoField label="Customer" value={ticket.customer.name} />
        <InfoField label="Customer Email" value={ticket.customer.email} />
        <InfoField label="Assigned Technician" value={ticket.technician?.name ?? 'Unassigned'} />
      </div>

      {/* Description + inline edit for customer while OPEN */}
      <div className="mb-6 p-4 rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase text-text-secondary tracking-wide">
            Description
          </span>

          {isCustomer && ticket.status === 'OPEN' && !isEditingDesc && (
            <button
              type="button"
              onClick={() => {
                setDescValue(ticket.description || '')
                setIsEditingDesc(true)
              }}
              className="text-xs text-primary-green font-semibold hover:underline"
            >
              Edit description
            </button>
          )}
        </div>

        {isEditingDesc ? (
          <div className="space-y-3">
            <textarea
              value={descValue}
              onChange={(e) => setDescValue(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-text-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary-green"
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSaveDescription}
                className="px-3 py-1.5 rounded-lg bg-primary-green text-white text-xs font-semibold hover:bg-primary-green/90"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setIsEditingDesc(false)}
                className="px-3 py-1.5 rounded-lg border border-border text-text-secondary text-xs font-semibold hover:bg-bg"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-text-dark whitespace-pre-wrap">
            {ticket.description || 'No detailed description provided.'}
          </p>
        )}
      </div>

      {/* Status track (hide if cancelled) */}
      {ticket.status !== 'CANCELLED' && <StatusTrack status={ticket.status} />}

      {/* Queue info */}
      {queueInfo && queueEnabled && (
        <QueueInfoCards
          queue={queueInfo}
          updatedAt={queueUpdatedAt}
          error={queueError}
          onRefresh={refreshQueue}
        />
      )}

      {/* Admin: Assign / Reassign Technician */}
      {isAdmin && ticket.status !== 'RESOLVED' && ticket.status !== 'CLOSED' && ticket.status !== 'CANCELLED' && (
        <div className="p-6 rounded-xl border border-border bg-card space-y-3 mb-6">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-bold text-text-dark uppercase tracking-wide">
              Admin Actions
            </h2>
            <button
              onClick={loadTechnicians}
              className="text-xs text-primary-green font-semibold hover:underline"
              type="button"
            >
              Refresh technicians
            </button>
          </div>

          <p className="text-sm text-text-secondary">
            Current technician:{' '}
            <span className="font-semibold text-text-dark">
              {ticket.technician?.name ?? 'Unassigned'}
            </span>
          </p>

          <div className="flex items-center gap-3 flex-wrap">
            <select
              value={assignToId}
              onChange={(e) => setAssignToId(e.target.value)}
              className="px-3 py-2 rounded-lg border border-border bg-bg text-text-dark min-w-[240px]"
              disabled={techLoading}
            >
              <option value="">
                {ticket.technician ? 'Reassign to…' : 'Assign to…'}
              </option>

              {technicians.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                  {typeof t.openTickets === 'number' ? ` (open: ${t.openTickets})` : ''}
                </option>
              ))}
            </select>

            <button
              onClick={handleAssign}
              disabled={!assignToId || techLoading}
              className="px-4 py-2 rounded-lg bg-primary-green text-white font-semibold hover:bg-primary-green/90 disabled:opacity-40"
              type="button"
            >
              {ticket.technician ? 'Reassign' : 'Assign'}
            </button>
          </div>

          {techLoading && <p className="text-xs text-text-secondary">Loading technicians…</p>}

          {!techLoading && technicians.length === 0 && (
            <p className="text-xs text-text-secondary">
              No technicians found. (Check seed / TECHNICIAN users)
            </p>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="p-6 rounded-xl border border-border bg-card space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-text-dark uppercase tracking-wide">
            Actions
          </h2>
          <button
            type="button"
            onClick={loadTicket}
            className="text-xs text-primary-green font-semibold hover:underline"
          >
            Refresh
          </button>
        </div>

        {/* Customer: cancel while OPEN */}
        {isCustomer && ticket.status === 'OPEN' && (
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 rounded-lg border border-error text-error font-semibold hover:bg-error/10"
          >
            Cancel Ticket
          </button>
        )}

        {/* Technician: start work when ASSIGNED */}
        {isAssignedTech && ticket.status === 'ASSIGNED' && (
          <button
            type="button"
            onClick={handleStartWork}
            className="px-4 py-2 rounded-lg bg-primary-blue text-white font-semibold hover:bg-primary-blue/90"
          >
            Start Work
          </button>
        )}

        {/* Resolve: assigned tech OR admin */}
        {(isAssignedTech || isAdmin) &&
          (ticket.status === 'IN_PROGRESS' || ticket.status === 'ASSIGNED') &&
          !showResolveForm && (
            <button
              type="button"
              onClick={() => setShowResolveForm(true)}
              className="px-4 py-2 rounded-lg bg-primary-green text-white font-semibold hover:bg-primary-green/90"
            >
              Mark Resolved
            </button>
          )}

        <AnimatePresence>
          {showResolveForm && (
            <motion.form
              onSubmit={handleResolve}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3 overflow-hidden"
            >
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">
                  Resolution notes
                </label>
                <textarea
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-text-dark"
                  placeholder="What was done to resolve the issue?"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-primary-green text-white font-semibold hover:bg-primary-green/90"
                >
                  Confirm Resolve
                </button>
                <button
                  type="button"
                  onClick={() => setShowResolveForm(false)}
                  className="px-4 py-2 rounded-lg border border-border text-text-secondary font-semibold hover:bg-bg"
                >
                  Cancel
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Reopen: admin or assigned tech on a RESOLVED ticket */}
        {(isAdmin || isAssignedTech) && ticket.status === 'RESOLVED' && (
          <button
            type="button"
            onClick={handleReopen}
            className="px-4 py-2 rounded-lg bg-warning text-white font-semibold hover:bg-warning/90"
          >
            Reopen Ticket
          </button>
        )}

        {/* Customer review when RESOLVED */}
        {isCustomer && ticket.status === 'RESOLVED' && !ticket.review && !showReviewForm && (
          <button
            type="button"
            onClick={() => setShowReviewForm(true)}
            className="px-4 py-2 rounded-lg bg-primary-green text-white font-semibold hover:bg-primary-green/90"
          >
            Leave a Review
          </button>
        )}

        {isCustomer && ticket.review && (
          <p className="text-sm text-text-secondary">
            You rated this service {ticket.review.rating}/5
            {ticket.review.comment ? ` — "${ticket.review.comment}"` : ''}
          </p>
        )}

        <AnimatePresence>
          {showReviewForm && (
            <motion.form
              onSubmit={handleSubmitReview}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3 overflow-hidden"
            >
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">
                  Rating
                </label>
                <select
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="px-3 py-2 rounded-lg border border-border bg-bg text-text-dark"
                >
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>
                      {n} ⭐️
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">
                  Comment (optional)
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-text-dark"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-primary-green text-white font-semibold hover:bg-primary-green/90"
                >
                  Submit Review
                </button>
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  className="px-4 py-2 rounded-lg border border-border text-text-secondary font-semibold hover:bg-bg"
                >
                  Cancel
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Priority update (admin or assigned tech) */}
        {(isAdmin || isAssignedTech) && ticket.status !== 'RESOLVED' && ticket.status !== 'CLOSED' && ticket.status !== 'CANCELLED' && (
          <div className="pt-3 border-t border-border">
            <p className="text-xs font-bold uppercase text-text-secondary tracking-wide mb-2">
              Priority
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <select
                value={priorityDraft}
                onChange={(e) => setPriorityDraft(e.target.value as TicketPriority)}
                className="px-3 py-2 rounded-lg border border-border bg-bg text-text-dark"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>

              <button
                type="button"
                onClick={handleSavePriority}
                disabled={prioritySaving || priorityDraft === ticket.priority}
                className="px-4 py-2 rounded-lg border border-border text-text-dark font-semibold hover:bg-bg disabled:opacity-40"
              >
                {prioritySaving ? 'Saving…' : 'Save Priority'}
              </button>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => navigate({ to: '/tickets' })}
          className="text-sm text-primary-green font-semibold hover:underline"
        >
          ← Back to tickets
        </button>
      </div>
    </div>
  )
}