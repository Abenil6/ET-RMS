import { AnimatePresence, motion } from 'motion/react'
import { useTranslation } from 'react-i18next'

interface TicketActionsProps {
  canStartWork: boolean
  canResolve: boolean
  canReopen: boolean
  canCancel: boolean
  showResolveForm: boolean
  resolutionNotes: string
  setResolutionNotes: (notes: string) => void
  setShowResolveForm: (show: boolean) => void
  onStartWork: () => void
  onResolve: (e: React.FormEvent) => void
  onReopen: () => void
  onCancel: () => void
}

export function TicketActions({
  canStartWork,
  canResolve,
  canReopen,
  canCancel,
  showResolveForm,
  resolutionNotes,
  setResolutionNotes,
  setShowResolveForm,
  onStartWork,
  onResolve,
  onReopen,
  onCancel,
}: TicketActionsProps) {
  const { t } = useTranslation()
  return (
    <div className="flex flex-wrap gap-3">
      {canStartWork && (
        <button
          onClick={onStartWork}
          className="px-6 py-3 rounded-lg bg-primary-blue text-white font-medium hover:bg-primary-blue/90 transition-colors"
        >
          {t('ticket_actions.start_work')}
        </button>
      )}

      {canResolve && (
        <>
          {!showResolveForm ? (
            <button
              onClick={() => setShowResolveForm(true)}
              className="px-6 py-3 rounded-lg bg-success text-white font-medium hover:bg-success/90 transition-colors"
            >
              {t('ticket_actions.mark_resolved')}
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
                  onSubmit={onResolve}
                  className="bg-card rounded-xl border border-border p-6 shadow-sm space-y-4"
                >
                  <h3 className="text-lg font-bold">
                    {t('ticket_actions.resolution_notes')}
                  </h3>
                  <textarea
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    placeholder={t('ticket_actions.resolution_placeholder')}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-text-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue resize-none"
                    rows={4}
                    required
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-lg bg-success text-white text-sm font-medium hover:bg-success/90 transition-colors"
                    >
                      {t('ticket_actions.confirm_resolution')}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowResolveForm(false)
                        setResolutionNotes('')
                      }}
                      className="px-4 py-2 rounded-lg border border-border text-text-dark text-sm font-medium hover:bg-bg transition-colors"
                    >
                      {t('common.cancel')}
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
          onClick={onReopen}
          className="px-6 py-3 rounded-lg bg-warning text-white font-medium hover:bg-warning/90 transition-colors"
        >
          {t('ticket_actions.reopen_ticket')}
        </button>
      )}

      {canCancel && (
        <button
          onClick={onCancel}
          className="px-6 py-3 rounded-lg border border-error text-error font-medium hover:bg-error/10 transition-colors"
        >
          {t('ticket_actions.cancel_ticket')}
        </button>
      )}
    </div>
  )
}
