import { useState } from 'react'
import api from '@/apis'
import type { TicketPriority } from '@/lib/types'

export function useTicketActions(ticketId: string, onSuccess?: () => void) {
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
  const [assignToId, setAssignToId] = useState('')

  // Priority update
  const [priorityDraft, setPriorityDraft] = useState<TicketPriority>('MEDIUM')

  // Mutations
  const { mutate: updateTicket, isPending: isUpdating } = api.Tickets.update.useMutation({
    onSuccess: () => {
      onSuccess?.()
      setIsEditingDesc(false)
    },
  })

  const { mutate: assignTicket, isPending: isAssigning } = api.Tickets.assign.useMutation({
    onSuccess: () => {
      onSuccess?.()
      setAssignToId('')
    },
  })

  const { mutate: resolveTicket, isPending: isResolving } = api.Tickets.resolve.useMutation({
    onSuccess: () => {
      onSuccess?.()
      setShowResolveForm(false)
      setResolutionNotes('')
    },
  })

  const { mutate: reopenTicket, isPending: isReopening } = api.Tickets.reopen.useMutation({
    onSuccess: () => {
      onSuccess?.()
    },
  })

  const { mutate: reviewTicket, isPending: isReviewing } = api.Tickets.review.useMutation({
    onSuccess: () => {
      onSuccess?.()
      setShowReviewForm(false)
      setRating(5)
      setComment('')
    },
  })

  // Action handlers
  const handleCancel = () => {
    updateTicket({ id: ticketId, data: { status: 'CANCELLED' } })
  }

  const handleSaveDescription = () => {
    updateTicket({ id: ticketId, data: { description: descValue } })
  }

  const handleStartWork = () => {
    updateTicket({ id: ticketId, data: { status: 'IN_PROGRESS' } })
  }

  const handleResolve = (e: React.FormEvent) => {
    e.preventDefault()
    if (!resolutionNotes.trim()) return
    resolveTicket({ id: ticketId, resolution: resolutionNotes })
  }

  const handleReopen = () => {
    reopenTicket(ticketId)
  }

  const handleAssign = () => {
    if (!assignToId) return
    assignTicket({ id: ticketId, technicianId: assignToId })
  }

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault()
    if (!comment.trim()) return
    reviewTicket({ id: ticketId, rating, comment })
  }

  const handleSavePriority = () => {
    updateTicket({ id: ticketId, data: { priority: priorityDraft } })
  }

  return {
    // Description edit state
    isEditingDesc,
    setIsEditingDesc,
    descValue,
    setDescValue,

    // Review state
    showReviewForm,
    setShowReviewForm,
    rating,
    setRating,
    comment,
    setComment,

    // Resolve state
    showResolveForm,
    setShowResolveForm,
    resolutionNotes,
    setResolutionNotes,

    // Assign state
    assignToId,
    setAssignToId,

    // Priority state
    priorityDraft,
    setPriorityDraft,

    // Action handlers
    handleCancel,
    handleSaveDescription,
    handleStartWork,
    handleResolve,
    handleReopen,
    handleAssign,
    handleSubmitReview,
    handleSavePriority,

    // Loading states
    isUpdating,
    isAssigning,
    isResolving,
    isReopening,
    isReviewing,
  }
}
