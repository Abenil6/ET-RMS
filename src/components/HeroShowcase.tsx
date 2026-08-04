import { ShieldCheck } from 'lucide-react'
import { motion } from 'motion/react'
import heroImage from '../assets/hero.webp'

export function HeroShowcase({ compact = false }: { compact?: boolean }) {
  const outerClass = compact
    ? 'relative max-w-[28rem]'
    : 'relative max-w-[34rem]'

  const imageClass = compact
    ? 'aspect-[4/5] w-full object-cover'
    : 'aspect-[4/5] w-full object-cover md:aspect-[5/6] lg:aspect-[4/5]'

  return (
    <motion.div
      className={outerClass}
      initial={{ opacity: 0, y: 26, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, ease: 'easeOut', delay: 0.08 }}
    >
      <div className="absolute -left-4 top-8 hidden rounded-2xl border border-border bg-card px-4 py-3 shadow-xl shadow-black/5 lg:block">
        <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
          Queue status
        </p>
        <p className="mt-1 text-lg font-extrabold text-text-dark">4 ahead</p>
      </div>

      <div className="absolute -right-3 bottom-8 hidden rounded-2xl border border-border bg-card px-4 py-3 shadow-xl shadow-black/5 lg:block">
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-success/10 p-2 text-success">
            <ShieldCheck size={16} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
              Verified routing
            </p>
            <p className="text-sm font-bold text-text-dark">
              Assigned to the right team
            </p>
          </div>
        </div>
      </div>

      <div className="relative rounded-4xl border border-white/70 bg-card/90 p-4 shadow-2xl shadow-primary-green/10 backdrop-blur">
        <div className="absolute inset-0 rounded-4xl bg-[linear-gradient(135deg,rgba(43,182,115,0.18),transparent_35%,rgba(0,114,206,0.08)_70%,transparent)]" />
        <div className="relative overflow-hidden rounded-3xl border border-border bg-bg">
          <img
            src={heroImage}
            alt="Customer support representative assisting a customer"
            className={imageClass}
          />
          <div className="absolute inset-x-4 bottom-4 rounded-2xl border border-white/50 bg-card/90 p-4 shadow-lg backdrop-blur">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
                  Current ticket
                </p>
                <p className="text-base font-bold text-text-dark">
                  No internet connection
                </p>
              </div>
              <span className="rounded-full bg-warning/10 px-3 py-1 text-xs font-semibold text-warning">
                In Progress
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
