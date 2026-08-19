import { AnimatePresence, motion } from 'motion/react'

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
  return (
    <div className="flex flex-wrap gap-3">
      {canStartWork && (
        <button
          onClick={onStartWork}
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
                  onSubmit={onResolve}
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
          onClick={onReopen}
          className="px-6 py-3 rounded-lg bg-warning text-white font-medium hover:bg-warning/90 transition-colors"
        >
          Reopen Ticket
        </button>
      )}

      {canCancel && (
        <button
          onClick={onCancel}
          className="px-6 py-3 rounded-lg border border-error text-error font-medium hover:bg-error/10 transition-colors"
        >
          Cancel Ticket
        </button>
      )}
    </div>
  )
}
