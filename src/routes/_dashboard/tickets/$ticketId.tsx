import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { ticketsApi } from '@/apis/tickets'
import { useQueuePosition } from '../../../lib/useQueuePosition'
import { useAuth } from '../../../context/auth'
import type { TicketPriority } from '../../../lib/types'
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

function TicketDetailPage() {
  const { ticketId } = Route.useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  // Fetch ticket data using TanStack Query
  const {
    data: ticket,
    isLoading: loading,
    isError,
    error: loadError,
    refetch: loadTicket,
  } = ticketsApi.getById.useQuery(ticketId)

  // Fetch technicians for admin assign
  const { data: technicians = [] } = ticketsApi.getTechnicians.useQuery()

  // Description edit
  const [isEditingDesc, setIsEditingDesc] = useState(false)
  const [descValue, setDescValue] = useState('')

  // Update descValue when ticket loads
  useEffect(() => {
    if (ticket?.description) {
      setDescValue(ticket.description)
    }
  }, [ticket?.description])

  // Review
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')

  // Resolve
  const [showResolveForm, setShowResolveForm] = useState(false)
  const [resolutionNotes, setResolutionNotes] = useState('')

  // Admin assign
  const [assignToId, setAssignToId] = useState('')

  // Priority update
  const [priorityDraft, setPriorityDraft] = useState<TicketPriority>('MEDIUM')

  // Update priorityDraft when ticket loads
  useEffect(() => {
    if (ticket?.priority) {
      setPriorityDraft(ticket.priority)
    }
  }, [ticket?.priority])

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

  // Mutations using TanStack Query
  const { mutate: updateTicket } = ticketsApi.update.useMutation({
    onSuccess: () => {
      loadTicket()
      setIsEditingDesc(false)
    },
  })

  const { mutate: assignTicket } = ticketsApi.assign.useMutation({
    onSuccess: () => {
      loadTicket()
      setAssignToId('')
    },
  })

  const { mutate: resolveTicket } = ticketsApi.resolve.useMutation({
    onSuccess: () => {
      loadTicket()
      setShowResolveForm(false)
      setResolutionNotes('')
    },
  })

  const { mutate: reopenTicket } = ticketsApi.reopen.useMutation({
    onSuccess: () => {
      loadTicket()
    },
  })

  const { mutate: reviewTicket } = ticketsApi.review.useMutation({
    onSuccess: () => {
      loadTicket()
      setShowReviewForm(false)
      setRating(5)
      setComment('')
    },
  })

  // Action handlers
  function handleCancel() {
    updateTicket({
      id: ticketId,
      data: { status: 'CANCELLED' },
    })
  }

  function handleSaveDescription() {
    updateTicket({
      id: ticketId,
      data: { description: descValue },
    })
  }

  function handleStartWork() {
    updateTicket({
      id: ticketId,
      data: { status: 'IN_PROGRESS' },
    })
  }

  function handleResolve(e: React.FormEvent) {
    e.preventDefault()
    if (!resolutionNotes.trim()) return
    resolveTicket({
      id: ticketId,
      resolution: resolutionNotes,
    })
  }

  function handleReopen() {
    reopenTicket(ticketId)
  }

  function handleAssign() {
    if (!assignToId) return
    assignTicket({
      id: ticketId,
      technicianId: assignToId,
    })
  }

  function handleSubmitReview(e: React.FormEvent) {
    e.preventDefault()
    if (!comment.trim()) return
    reviewTicket({
      id: ticketId,
      rating,
      comment,
    })
  }

  function handleSavePriority() {
    updateTicket({
      id: ticketId,
      data: { priority: priorityDraft },
    })
  }

  if (loading) return <LoadingSpinner size="lg" />
  if (isError)
    return (
      <ErrorMessage
        message={loadError?.message || 'Failed to load ticket'}
        retry={loadTicket}
      />
    )
  if (!ticket) return <ErrorMessage message="Ticket not found" />

  const statusConfig = STATUS_CONFIG[ticket.status]
  const priorityConfig = PRIORITY_CONFIG[ticket.priority]
  const categoryLabel = CATEGORY_LABELS[ticket.category]

  const canEditDescription = isCustomer && ticket.status === 'OPEN'
  const canCancel =
    isCustomer &&
    (ticket.status === 'OPEN' ||
      ticket.status === 'ASSIGNED' ||
      ticket.status === 'IN_PROGRESS')
  const canStartWork =
    isAssignedTech &&
    (ticket.status === 'ASSIGNED' || ticket.status === 'OPEN')
  const canResolve =
    (isAssignedTech || isAdmin) && ticket.status === 'IN_PROGRESS'
  const canReopen =
    (isCustomer || isAdmin) &&
    (ticket.status === 'RESOLVED' || ticket.status === 'CLOSED')
  const canReview =
    isCustomer &&
    (ticket.status === 'RESOLVED' || ticket.status === 'CLOSED') &&
    !ticket.review

  return (
    <motion.div
      className="w-full max-w-5xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header */}
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
      </div>

      {/* Queue Info */}
      {queueEnabled && queueInfo && (
        <QueueInfoCards
          queue={{
            position: queueInfo.position,
            ahead: queueInfo.ahead,
            estimatedWaitMinutes: queueInfo.estimatedWaitMinutes,
          }}
          updatedAt={queueUpdatedAt}
          error={queueError}
          onRefresh={refreshQueue}
        />
      )}

      {/* Status Track */}
      <div className="mb-6">
        <StatusTrack status={ticket.status} />
      </div>

      {/* Main Card */}
      <div className="bg-card rounded-xl border border-border p-6 shadow-sm mb-6">
        {/* Ticket ID & Status */}
        <div className="flex items-start justify-between mb-6 pb-6 border-b border-border">
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

        {/* Subject */}
        <InfoField label="Subject" value={ticket.subject} />

        {/* Service Number */}
        <InfoField label="Service Number" value={ticket.serviceNumber} />

        {/* Category */}
        <InfoField label="Category" value={categoryLabel} />

        {/* Priority with Edit */}
        {isAdmin ? (
          <div className="mb-4">
            <label className="block text-sm font-semibold text-text-secondary mb-2">
              Priority
            </label>
            <div className="flex items-center gap-3">
              <select
                value={priorityDraft}
                onChange={(e) =>
                  setPriorityDraft(e.target.value as TicketPriority)
                }
                className="px-3 py-2 rounded-lg border border-border bg-bg text-text-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue"
              >
                {(
                  ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as TicketPriority[]
                ).map((p) => (
                  <option key={p} value={p}>
                    {PRIORITY_CONFIG[p].label}
                  </option>
                ))}
              </select>
              {priorityDraft !== ticket.priority && (
                <button
                  onClick={handleSavePriority}
                  className="px-4 py-2 rounded-lg bg-primary-blue text-white text-sm font-medium hover:bg-primary-blue/90 transition-colors"
                >
                  Save
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="mb-4">
            <p className="text-sm font-semibold text-text-secondary mb-2">
              Priority
            </p>
            <div
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${priorityConfig.bg} ${priorityConfig.color}`}
            >
              {priorityConfig.label}
            </div>
          </div>
        )}

        {/* Description with Edit */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-text-secondary">
              Description
            </p>
            {canEditDescription && !isEditingDesc && (
              <button
                onClick={() => {
                  setIsEditingDesc(true)
                  setDescValue(ticket.description || '')
                }}
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
                  onClick={handleSaveDescription}
                  className="px-4 py-2 rounded-lg bg-primary-blue text-white text-sm font-medium hover:bg-primary-blue/90 transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setIsEditingDesc(false)
                    setDescValue(ticket.description || '')
                  }}
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

        {/* Resolution */}
        {ticket.resolution && (
          <div className="mb-4 p-4 bg-success/10 rounded-lg border border-success/20">
            <p className="text-sm font-semibold text-success mb-2">
              Resolution
            </p>
            <p className="text-text-dark whitespace-pre-wrap">
              {ticket.resolution}
            </p>
          </div>
        )}

        {/* Technician Assignment (Admin) */}
        {isAdmin && (
          <div className="mb-4">
            <p className="text-sm font-semibold text-text-secondary mb-2">
              Assign Technician
            </p>
            <div className="flex items-center gap-3">
              <select
                value={assignToId}
                onChange={(e) => setAssignToId(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg border border-border bg-bg text-text-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue"
              >
                <option value="">
                  {ticket.technician?.name || 'Select Technician'}
                </option>
                {technicians.map((tech) => (
                  <option key={tech.id} value={tech.id}>
                    {tech.name} ({tech.openTickets || 0} open)
                  </option>
                ))}
              </select>
              {assignToId && assignToId !== ticket.technicianId && (
                <button
                  onClick={handleAssign}
                  className="px-4 py-2 rounded-lg bg-primary-blue text-white text-sm font-medium hover:bg-primary-blue/90 transition-colors"
                >
                  Assign
                </button>
              )}
            </div>
          </div>
        )}

        {/* Assigned Technician Display */}
        {ticket.technician && (
          <InfoField label="Assigned To" value={ticket.technician.name} />
        )}

        {/* Timestamps */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-text-secondary mb-1">Created</p>
            <p className="text-text-dark">
              {new Date(ticket.createdAt).toLocaleString('en-ET', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </p>
          </div>
          {ticket.resolvedAt && (
            <div>
              <p className="text-text-secondary mb-1">Resolved</p>
              <p className="text-text-dark">
                {new Date(ticket.resolvedAt).toLocaleString('en-ET', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Review Section */}
      {ticket.review ? (
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm mb-6">
          <h3 className="text-lg font-bold mb-4">Customer Review</h3>
          <div className="flex items-center gap-2 mb-3">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`text-xl ${
                    star <= ticket.review!.rating
                      ? 'text-warning'
                      : 'text-gray-300'
                  }`}
                >
                  ★
                </span>
              ))}
            </div>
            <span className="text-sm font-semibold text-text-dark">
              {ticket.review.rating} / 5
            </span>
          </div>
          <p className="text-text-dark whitespace-pre-wrap">
            {ticket.review.comment}
          </p>
        </div>
      ) : (
        canReview && (
          <div className="bg-card rounded-xl border border-border p-6 shadow-sm mb-6">
            <h3 className="text-lg font-bold mb-4">Leave a Review</h3>
            {!showReviewForm ? (
              <button
                onClick={() => setShowReviewForm(true)}
                className="px-4 py-2 rounded-lg bg-primary-blue text-white text-sm font-medium hover:bg-primary-blue/90 transition-colors"
              >
                Write Review
              </button>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-text-secondary mb-2">
                    Rating
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className={`text-3xl transition-colors ${
                          star <= rating ? 'text-warning' : 'text-gray-300'
                        } hover:text-warning`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-text-secondary mb-2">
                    Comment
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your experience..."
                    className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-text-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue resize-none"
                    rows={4}
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-primary-blue text-white text-sm font-medium hover:bg-primary-blue/90 transition-colors"
                  >
                    Submit Review
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowReviewForm(false)
                      setRating(5)
                      setComment('')
                    }}
                    className="px-4 py-2 rounded-lg border border-border text-text-dark text-sm font-medium hover:bg-bg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        )
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        {canStartWork && (
          <button
            onClick={handleStartWork}
            className="px-6 py-3 rounded-lg bg-primary-blue text-white font-medium hover:bg-primary-blue/90 transition-colors"
          >
            Start Work
          </button>
        )}

        {canResolve && (
          <>
            {!showResolveForm ? (
              <button
                onClick={() => setShowResolveForm(true)}
                className="px-6 py-3 rounded-lg bg-success text-white font-medium hover:bg-success/90 transition-colors"
              >
                Mark as Resolved
              </button>
            ) : (
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="w-full"
                >
                  <form
                    onSubmit={handleResolve}
                    className="bg-card rounded-xl border border-border p-6 shadow-sm space-y-4"
                  >
                    <h3 className="text-lg font-bold">Resolution Notes</h3>
                    <textarea
                      value={resolutionNotes}
                      onChange={(e) => setResolutionNotes(e.target.value)}
                      placeholder="Describe how the issue was resolved..."
                      className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-text-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue resize-none"
                      rows={4}
                      required
                    />
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-lg bg-success text-white text-sm font-medium hover:bg-success/90 transition-colors"
                      >
                        Confirm Resolution
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowResolveForm(false)
                          setResolutionNotes('')
                        }}
                        className="px-4 py-2 rounded-lg border border-border text-text-dark text-sm font-medium hover:bg-bg transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </motion.div>
              </AnimatePresence>
            )}
          </>
        )}

        {canReopen && (
          <button
            onClick={handleReopen}
            className="px-6 py-3 rounded-lg bg-warning text-white font-medium hover:bg-warning/90 transition-colors"
          >
            Reopen Ticket
          </button>
        )}

        {canCancel && (
          <button
            onClick={handleCancel}
            className="px-6 py-3 rounded-lg border border-error text-error font-medium hover:bg-error/10 transition-colors"
          >
            Cancel Ticket
          </button>
        )}
      </div>
    </motion.div>
  )
}
