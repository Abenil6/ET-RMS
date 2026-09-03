import type { Ticket } from '@/lib/types'
import { useTranslation } from 'react-i18next'

interface TicketReviewSectionProps {
  ticket: Ticket
  canReview: boolean
  showReviewForm: boolean
  rating: number
  comment: string
  setRating: (rating: number) => void
  setComment: (comment: string) => void
  setShowReviewForm: (show: boolean) => void
  onSubmit: (e: React.FormEvent) => void
}

export function TicketReviewSection({
  ticket,
  canReview,
  showReviewForm,
  rating,
  comment,
  setRating,
  setComment,
  setShowReviewForm,
  onSubmit,
}: TicketReviewSectionProps) {
  const { t } = useTranslation()
  // If ticket has a review, display it
  if (ticket.review) {
    return (
      <div className="bg-card rounded-xl border border-border p-6 shadow-sm mb-6">
        <h3 className="text-lg font-bold mb-4">
          {t('ticket_review.customer_review')}
        </h3>
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
    )
  }

  // If customer can review, show review form
  if (canReview) {
    return (
      <div className="bg-card rounded-xl border border-border p-6 shadow-sm mb-6">
        <h3 className="text-lg font-bold mb-4">
          {t('ticket_review.leave_review')}
        </h3>
        {!showReviewForm ? (
          <button
            onClick={() => setShowReviewForm(true)}
            className="px-4 py-2 rounded-lg bg-primary-blue text-white text-sm font-medium hover:bg-primary-blue/90 transition-colors"
          >
            {t('ticket_review.write_review')}
          </button>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-text-secondary mb-2">
                {t('ticket_review.rating')}
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
                {t('ticket_review.comment')}
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={t('ticket_review.comment_placeholder')}
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
                {t('ticket_review.submit_review')}
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
                {t('common.cancel')}
              </button>
            </div>
          </form>
        )}
      </div>
    )
  }

  return null
}
