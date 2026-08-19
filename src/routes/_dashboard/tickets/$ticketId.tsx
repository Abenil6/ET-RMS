import { createFileRoute } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { useEffect } from 'react'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { InfoField } from '@/components/shared/InfoField'
import { StatusTrack } from '@/components/shared/StatusTrack'
import { QueueInfoCards } from '@/components/shared/QueueInfoCards'
import { TicketHeader } from '@/features/tickets/components/TicketHeader'
import { TicketDescription } from '@/features/tickets/components/TicketDescription'
import { TicketReviewSection } from '@/features/tickets/components/TicketReviewSection'
import { TicketActions } from '@/features/tickets/components/TicketActions'
import { useTicketDetail } from '@/features/tickets/hooks/useTicketDetail'
import { useTicketActions } from '@/features/tickets/hooks/useTicketActions'
import { PRIORITY_CONFIG, CATEGORY_LABELS } from '../../../data/tickets'
import type { TicketPriority } from '../../../lib/types'

export const Route = createFileRoute('/_dashboard/tickets/$ticketId')({
  component: TicketDetailPage,
})

function TicketDetailPage() {
  const { ticketId } = Route.useParams()

  const {
    ticket,
    loading,
    isError,
    loadError,
    loadTicket,
    technicians,
    isAdmin,
    queueEnabled,
    queueInfo,
    queueUpdatedAt,
    queueError,
    refreshQueue,
    canEditDescription,
    canCancel,
    canStartWork,
    canResolve,
    canReopen,
    canReview,
  } = useTicketDetail(ticketId)

  const {
    isEditingDesc,
    setIsEditingDesc,
    descValue,
    setDescValue,
    showReviewForm,
    setShowReviewForm,
    rating,
    setRating,
    comment,
    setComment,
    showResolveForm,
    setShowResolveForm,
    resolutionNotes,
    setResolutionNotes,
    assignToId,
    setAssignToId,
    priorityDraft,
    setPriorityDraft,
    handleCancel,
    handleSaveDescription,
    handleStartWork,
    handleResolve,
    handleReopen,
    handleAssign,
    handleSubmitReview,
    handleSavePriority,
  } = useTicketActions(ticketId, loadTicket)

  // Update descValue when ticket loads
  useEffect(() => {
    if (ticket?.description) {
      setDescValue(ticket.description)
    }
  }, [ticket?.description, setDescValue])

  // Update priorityDraft when ticket loads
  useEffect(() => {
    if (ticket?.priority) {
      setPriorityDraft(ticket.priority)
    }
  }, [ticket?.priority, setPriorityDraft])

  if (loading) return <LoadingSpinner size="lg" />
  if (isError)
    return (
      <ErrorMessage
        message={loadError?.message || 'Failed to load ticket'}
        retry={loadTicket}
      />
    )
  if (!ticket) return <ErrorMessage message="Ticket not found" />

  const priorityConfig = PRIORITY_CONFIG[ticket.priority]
  const categoryLabel = CATEGORY_LABELS[ticket.category]

  return (
    <motion.div
      className="w-full max-w-5xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <TicketHeader ticket={ticket} />

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
        <TicketDescription
          ticket={ticket}
          isEditingDesc={isEditingDesc}
          descValue={descValue}
          setDescValue={setDescValue}
          canEditDescription={canEditDescription}
          onStartEdit={() => {
            setIsEditingDesc(true)
            setDescValue(ticket.description || '')
          }}
          onSave={handleSaveDescription}
          onCancel={() => {
            setIsEditingDesc(false)
            setDescValue(ticket.description || '')
          }}
        />

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
      <TicketReviewSection
        ticket={ticket}
        canReview={canReview}
        showReviewForm={showReviewForm}
        rating={rating}
        comment={comment}
        setRating={setRating}
        setComment={setComment}
        setShowReviewForm={setShowReviewForm}
        onSubmit={handleSubmitReview}
      />

      {/* Action Buttons */}
      <TicketActions
        canStartWork={canStartWork}
        canResolve={canResolve}
        canReopen={canReopen}
        canCancel={canCancel}
        showResolveForm={showResolveForm}
        resolutionNotes={resolutionNotes}
        setResolutionNotes={setResolutionNotes}
        setShowResolveForm={setShowResolveForm}
        onStartWork={handleStartWork}
        onResolve={handleResolve}
        onReopen={handleReopen}
        onCancel={handleCancel}
      />
    </motion.div>
  )
}
