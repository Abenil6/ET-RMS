import { motion } from 'motion/react'
import { X } from 'lucide-react'

interface ModalProps {
  onClose: () => void
  title: string
  children: React.ReactNode
}

export function Modal({ onClose, title, children }: ModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-card rounded-xl border border-border p-6 w-full max-w-md shadow-xl"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-text-dark">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-text-secondary hover:bg-bg transition"
            type="button"
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  )
}
