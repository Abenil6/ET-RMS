import { createFileRoute } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { Wrench } from 'lucide-react'
import { useAuth } from '@/features/auth/hooks/useAuth'
import api from '@/apis'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ErrorMessage } from '@/components/shared/ErrorMessage'

export const Route = createFileRoute('/_dashboard/technicians')({
  component: TechniciansPage,
})


function TechniciansPage() {
  const { user } = useAuth()

  const { data: techs = [], isLoading: loading, isError, error, refetch: loadTechs } = api.Admin.getTechnicians.useQuery()

  if (!user || user.role !== 'ADMIN') {
    return <div className="p-8 text-center text-text-secondary">Unauthorized access.</div>
  }

  if (loading) return <LoadingSpinner size="lg" />
  if (isError) return <ErrorMessage message={error.message || 'Failed to load technicians'} retry={loadTechs} />

  return (
    <motion.div
      className="w-full"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Wrench size={28} className="text-primary-blue" />
          Technicians
        </h1>
        <p className="text-text-secondary">
          View all technicians and their current workload
        </p>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full">
          <thead className="bg-bg border-b border-border">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wide">
                Technician
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wide">
                Email
              </th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wide">
                Open Tickets
              </th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wide">
                Active Tickets
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {techs.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-text-secondary">
                  No technicians found.
                </td>
              </tr>
            ) : (
              techs.map((tech) => (
                <tr key={tech.id} className="hover:bg-bg/50 transition">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-blue/10 flex items-center justify-center">
                        <Wrench size={20} className="text-primary-blue" />
                      </div>
                      <span className="font-medium text-text-dark">{tech.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-text-secondary">{tech.email}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-primary-blue/10 text-primary-blue">
                      {tech.openTickets || 0}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-warning/10 text-warning">
                      {tech.activeTickets || 0}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  )
}
