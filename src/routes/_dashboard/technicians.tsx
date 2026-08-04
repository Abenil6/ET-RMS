import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { Wrench } from 'lucide-react'
import { useAuth } from '../../context/auth'
import { api, ApiError } from '../../lib/api'
import { LoadingSpinner } from '../../components/LoadingSpinner'
import { ErrorMessage } from '../../components/ErrorMessage'

export const Route = createFileRoute('/_dashboard/technicians')({
  component: TechniciansPage,
})

type TechnicianItem = {
  id: string
  name: string
  openTickets?: number
  activeTickets?: number
}

function TechniciansPage() {
  const { user } = useAuth()

  const [techs, setTechs] = useState<TechnicianItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadTechs = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = (await api.admin.getTechnicians()) as TechnicianItem[]
      setTechs(data)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load technicians')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user?.role !== 'ADMIN') return
    loadTechs()
  }, [user])

  if (!user || user.role !== 'ADMIN') {
    return <div className="p-8 text-center text-text-secondary">Unauthorized access.</div>
  }

  if (loading) return <LoadingSpinner size="lg" />
  if (error) return <ErrorMessage message={error} retry={loadTechs} />

  return (
    <motion.div
      className="max-w-3xl"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-text-dark mb-1">Technicians</h1>
            <p className="text-text-secondary">Monitor current workload and assigned tickets.</p>
          </div>

          <button
            onClick={loadTechs}
            className="px-4 py-2 rounded-lg border border-border text-text-dark text-sm font-semibold hover:bg-bg"
            type="button"
          >
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {techs.length === 0 ? (
            <div className="p-8 text-center rounded-xl border border-border bg-card text-text-secondary">
              No technicians found.
            </div>
          ) : (
            techs.map((tech, i) => {
              const openCount = tech.openTickets ?? tech.activeTickets ?? 0

              const badge =
                openCount === 0
                  ? 'bg-success/10 text-success'
                  : openCount <= 2
                    ? 'bg-warning/10 text-warning'
                    : 'bg-error/10 text-error'

              const label =
                openCount === 0 ? 'Available' : openCount <= 2 ? 'Moderate load' : 'High load'

              return (
                <motion.div
                  key={tech.id}
                  className="rounded-xl border border-border bg-card overflow-hidden"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.35 }}
                >
                  <div className="flex items-center justify-between px-5 py-4 bg-bg border-b border-border">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-green/10 flex items-center justify-center">
                        <Wrench size={16} className="text-primary-green" />
                      </div>
                      <div>
                        <p className="font-bold text-text-dark">{tech.name}</p>
                        <p className="text-xs text-text-secondary">
                          {typeof tech.openTickets === 'number'
                            ? `${tech.openTickets} open`
                            : typeof tech.activeTickets === 'number'
                              ? `${tech.activeTickets} active`
                              : 'Workload unknown'}
                        </p>
                      </div>
                    </div>

                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge}`}>
                      {label}
                    </span>
                  </div>

                  <div className="p-4">
                    <p className="text-sm text-text-secondary">
                      Assign tickets from the{' '}
                      <Link to="/queue" className="text-primary-green font-semibold hover:underline">
                        Queue
                      </Link>{' '}
                      or from a ticket’s detail page.
                    </p>
                  </div>
                </motion.div>
              )
            })
          )}
        </div>
      </div>
    </motion.div>
  )
}