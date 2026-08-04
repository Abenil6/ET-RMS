import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { AlertTriangle, X } from 'lucide-react'

interface ConfirmDialogProps {
  open: boolean
  onConfirm: () => void
  onCancel: () => void
  title?: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  /** Visual style — 'danger' shows red accents, 'warning' shows amber */
  variant?: 'danger' | 'warning'
  /** Show a loading spinner on the confirm button */
  loading?: boolean
}

export default function ConfirmDialog({
  open,
  onConfirm,
  onCancel,
  title = 'Are you sure?',
  description = 'This action cannot be undone.',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  loading = false,
}: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null)

  // Focus the cancel button when dialog opens (safe default)
  useEffect(() => {
    if (open) {
      // Small delay to let AnimatePresence mount
      const t = setTimeout(() => cancelRef.current?.focus(), 80)
      return () => clearTimeout(t)
    }
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onCancel])

  const isDanger = variant === 'danger'

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-[2px] z-[100]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onCancel}
            aria-hidden
          />

          {/* Dialog panel */}
          <motion.div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
            aria-describedby="confirm-dialog-desc"
            className="fixed inset-0 z-[101] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative bg-card rounded-2xl border border-border shadow-2xl w-full max-w-md overflow-hidden"
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 10, opacity: 0 }}
              transition={{ type: 'spring', duration: 0.35, bounce: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={onCancel}
                className="absolute top-3 right-3 p-1.5 rounded-full text-text-secondary hover:bg-bg hover:text-text-dark transition-colors"
                aria-label="Close dialog"
              >
                <X size={18} />
              </button>

              {/* Content */}
              <div className="px-6 pt-6 pb-2 flex flex-col items-center text-center">
                {/* Icon */}
                <motion.div
                  className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${isDanger
                      ? 'bg-error/10 text-error'
                      : 'bg-warning/10 text-warning'
                    }`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.1, stiffness: 400, damping: 15 }}
                >
                  <AlertTriangle size={28} />
                </motion.div>

                <motion.h2
                  id="confirm-dialog-title"
                  className="text-lg font-bold text-text-dark"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.12 }}
                >
                  {title}
                </motion.h2>

                <motion.p
                  id="confirm-dialog-desc"
                  className="text-sm text-text-secondary mt-2 leading-relaxed"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.16 }}
                >
                  {description}
                </motion.p>
              </div>

              {/* Actions */}
              <motion.div
                className="px-6 pb-6 pt-4 flex items-center justify-center gap-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <button
                  ref={cancelRef}
                  onClick={onCancel}
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl border border-border bg-bg text-text-dark text-sm font-semibold hover:bg-card transition-colors focus:outline-none focus:ring-2 focus:ring-primary-green disabled:opacity-50"
                >
                  {cancelLabel}
                </button>

                <button
                  onClick={onConfirm}
                  disabled={loading}
                  className={`px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 flex items-center gap-2 ${isDanger
                      ? 'bg-error hover:bg-error/90 focus:ring-error'
                      : 'bg-warning hover:bg-warning/90 focus:ring-warning'
                    }`}
                >
                  {loading && (
                    <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  )}
                  {confirmLabel}
                </button>
              </motion.div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
