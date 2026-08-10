import { createFileRoute, Link } from '@tanstack/react-router'
import { useMemo } from 'react'
import { useAuth } from '../../context/auth'
import { api } from '../../lib/api'
import { useFetch } from '../../lib/useFetch'
import { STATUS_CONFIG } from '../../data/tickets'
import type { Ticket } from '../../lib/types'
import {
  AlertCircle,
  UserCheck,
  CheckCircle2,
  Clock,
  Star,
  Wrench,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { motion } from 'motion/react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
} from 'recharts'
import {
  computeKpis,
  dailySeries,
  weekdayBuckets,
  categoryBreakdown,
  repeatRate,
  topTechnicians,
  ticketsToExport,
} from '../../lib/dashboardStats'
import { useDateRange } from '../../lib/useDateRange'
import { KpiCard } from '../../components/dashboard/KpiCard'
import { ChartCard } from '../../components/dashboard/ChartCard'
import { DateRangePicker } from '../../components/dashboard/DateRangePicker'
import { PdfExportButton } from '../../components/dashboard/PdfExportButton'
import { LoadingSpinner } from '../../components/LoadingSpinner'
import { ErrorMessage } from '../../components/ErrorMessage'

export const Route = createFileRoute('/_dashboard/dashboard')({
  component: DashboardPage,
})

function DashboardPage() {
  const { user } = useAuth()
  if (!user) return null

  if (user.role === 'ADMIN') return <AdminOverview />
  if (user.role === 'TECHNICIAN') return <TechnicianOverview />
  return <CustomerOverview />
}

function AdminOverview() {
  const {
    data: tickets,
    loading,
    error,
    refresh,
  } = useFetch<Ticket[]>(() => api.tickets.getAll(), [])

  const { preset, setPreset, custom, setCustom, range } = useDateRange()

  const list = useMemo(() => tickets ?? [], [tickets])

  const kpis = useMemo(() => computeKpis(list, range), [list, range])
  const series = useMemo(() => dailySeries(list, range), [list, range])
  const weekdays = useMemo(() => weekdayBuckets(list, range), [list, range])
  const categories = useMemo(() => categoryBreakdown(list, range), [list, range])
  const repeat = useMemo(() => repeatRate(list, range), [list, range])
  const techs = useMemo(() => topTechnicians(list, range), [list, range])
  const csv = useMemo(() => ticketsToExport(list, range), [list, range])

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={error} retry={refresh} />

  const kpiConfig: { icon: LucideIcon; color: 'warning' | 'primary-blue' | 'success' | 'primary-green' }[] = [
    { icon: AlertCircle, color: 'warning' },
    { icon: UserCheck, color: 'primary-blue' },
    { icon: CheckCircle2, color: 'success' },
    { icon: Clock, color: 'primary-green' },
  ]

  return (
    <motion.div
      className="w-full"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {/* Header with date range + export */}
      <div className="flex items-start justify-between gap-3 mb-8 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-text-dark mb-1">
            Admin Overview
          </h1>
          <p className="text-text-secondary">
            System-wide ticket status and trends.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <DateRangePicker
            preset={preset}
            onPresetChange={setPreset}
            custom={custom}
            onCustomChange={setCustom}
            range={range}
          />
          <PdfExportButton
            title="Admin Overview"
            filename={`tickets-report-${new Date().toISOString().slice(0, 10)}.pdf`}
            headers={csv.headers}
            rows={csv.rows}
          />
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {kpis.map((kpi, i) => (
          <KpiCard
            key={kpi.key}
            icon={kpiConfig[i].icon}
            label={kpi.label}
            value={kpi.value}
            delta={kpi.delta}
            unit={kpi.unit}
            color={kpiConfig[i].color}
            delay={0.1 + i * 0.1}
          />
        ))}
      </div>

      {/* Trend + weekday charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <ChartCard
          title="Tickets Created vs Resolved"
          subtitle="Per day over the selected period"
          className="lg:col-span-2"
          delay={0.5}
        >
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={series} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }}
                minTickGap={24}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }}
              />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line
                type="monotone"
                dataKey="created"
                name="Created"
                stroke="#0072CE"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="resolved"
                name="Resolved"
                stroke="#2BB673"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Most Active Day"
          subtitle="Tickets created by weekday"
          delay={0.6}
        >
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={weekdays} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }} />
              <Tooltip />
              <Bar dataKey="created" name="Tickets" fill="#2BB673" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Gauge + category + technicians */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <ChartCard
          title="Repeat Customer Rate"
          subtitle="Customers with more than one ticket"
          delay={0.7}
        >
          <div className="relative h-52">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                data={[{ name: 'repeat', value: repeat.rate }]}
                startAngle={90}
                endAngle={-270}
                innerRadius="70%"
                outerRadius="100%"
              >
                <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                <RadialBar
                  dataKey="value"
                  fill="#2BB673"
                  cornerRadius={8}
                  background={{ fill: 'rgba(0, 0, 0, 0.06)' }}
                />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="text-3xl font-bold text-text-dark">{repeat.rate}%</p>
              <p className="text-xs text-text-secondary">
                Target {repeat.target}%
              </p>
              <p className="text-xs text-text-secondary mt-1">
                {repeat.repeat} of {repeat.customers} customers
              </p>
            </div>
          </div>
        </ChartCard>

        <ChartCard
          title="Tickets by Category"
          subtitle="Distribution of service requests"
          delay={0.8}
        >
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={categories}
              layout="vertical"
              margin={{ top: 0, right: 20, left: 10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }} />
              <YAxis
                type="category"
                dataKey="label"
                width={80}
                tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }}
              />
              <Tooltip />
              <Bar dataKey="count" name="Tickets" fill="#F59E0B" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Top Technicians"
          subtitle="By tickets handled in the period"
          delay={0.9}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-text-secondary">
                  <th className="py-2 pr-2 font-semibold">Technician</th>
                  <th className="py-2 pr-2 font-semibold text-right">Handled</th>
                  <th className="py-2 pr-2 font-semibold text-right">Rating</th>
                  <th className="py-2 font-semibold text-right">Avg hrs</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {techs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-text-secondary">
                      No technicians active in this period.
                    </td>
                  </tr>
                ) : (
                  techs.map((t) => (
                    <tr key={t.id}>
                      <td className="py-2.5 pr-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-primary-green/10 flex items-center justify-center shrink-0">
                            <Wrench size={13} className="text-primary-green" />
                          </div>
                          <span className="font-semibold text-text-dark truncate max-w-28">
                            {t.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 pr-2 text-right text-text-dark font-medium">
                        {t.handled}
                      </td>
                      <td className="py-2.5 pr-2 text-right">
                        <span className="inline-flex items-center gap-1 text-text-secondary">
                          {t.avgRating > 0 ? t.avgRating : '—'}
                          {t.avgRating > 0 && <Star size={12} className="text-warning" />}
                        </span>
                      </td>
                      <td className="py-2.5 text-right text-text-secondary">
                        {t.avgHours > 0 ? t.avgHours : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </ChartCard>
      </div>

      {/* Recent tickets */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-text-dark">Recent Tickets</h2>
        <Link to="/tickets" className="text-sm font-semibold text-primary-green hover:underline">
          View all →
        </Link>
      </div>

      <div className="rounded-xl border border-border bg-card divide-y divide-border">
        {list.length === 0 ? (
          <p className="p-5 text-text-secondary text-sm">No tickets yet.</p>
        ) : (
          list.slice(0, 5).map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.08 }}
            >
              <TicketRow ticket={t} />
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  )
}

function TechnicianOverview() {
  const {
    data: tickets,
    loading,
    error,
    refresh,
  } = useFetch<Ticket[]>(() => api.tickets.getAll(), [])

  const list = useMemo(() => tickets ?? [], [tickets])
  const kpis = useMemo(() => computeKpis(list, null), [list])

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={error} retry={refresh} />

  return (
    <motion.div
      className="w-full"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-text-dark mb-1">Assigned to You</h1>
        <p className="text-text-secondary mb-8">Tickets currently on your queue.</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {kpis.map((kpi, i) => (
          <KpiCard
            key={kpi.key}
            icon={[AlertCircle, UserCheck, CheckCircle2, Clock][i]}
            label={kpi.label}
            value={kpi.value}
            delta={kpi.delta}
            unit={kpi.unit}
            color={['warning', 'primary-blue', 'success', 'primary-green'][i] as 'warning' | 'primary-blue' | 'success' | 'primary-green'}
            delay={0.1 + i * 0.1}
          />
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card divide-y divide-border">
        {list.length === 0 ? (
          <p className="p-5 text-text-secondary text-sm">No tickets assigned yet.</p>
        ) : (
          list.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Link
                to="/tickets/$ticketId"
                params={{ ticketId: t.id }}
                className="flex items-center justify-between px-5 py-4 hover:bg-bg transition"
              >
                <div>
                  <p className="font-semibold text-text-dark">
                    {t.ticketNumber} — {t.subject}
                  </p>
                  <p className="text-xs text-text-secondary mt-0.5">
                    {t.customer.name} · {t.customer.email}
                  </p>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_CONFIG[t.status].bg
                    } ${STATUS_CONFIG[t.status].color}`}
                >
                  {STATUS_CONFIG[t.status].label}
                </span>
              </Link>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  )
}

function CustomerOverview() {
  const {
    data: tickets,
    loading,
    error,
    refresh,
  } = useFetch<Ticket[]>(() => api.tickets.getAll(), [])

  const list = useMemo(() => tickets ?? [], [tickets])
  const kpis = useMemo(() => computeKpis(list, null), [list])

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={error} retry={refresh} />

  return (
    <motion.div
      className="w-full"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-text-dark mb-1">My Tickets</h1>
        <p className="text-text-secondary mb-8">Track the status of your service requests.</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {kpis.map((kpi, i) => (
          <KpiCard
            key={kpi.key}
            icon={[AlertCircle, UserCheck, CheckCircle2, Clock][i]}
            label={kpi.label}
            value={kpi.value}
            delta={kpi.delta}
            unit={kpi.unit}
            color={['warning', 'primary-blue', 'success', 'primary-green'][i] as 'warning' | 'primary-blue' | 'success' | 'primary-green'}
            delay={0.1 + i * 0.1}
          />
        ))}
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-text-dark">Recent Tickets</h2>
        <Link to="/tickets" className="text-sm font-semibold text-primary-green hover:underline">
          View all →
        </Link>
      </div>

      <div className="rounded-xl border border-border bg-card divide-y divide-border">
        {list.length === 0 ? (
          <p className="p-5 text-text-secondary text-sm">No tickets yet. Click "Create Ticket" to submit a new request.</p>
        ) : (
          list.slice(0, 5).map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.08 }}
            >
              <TicketRow ticket={t} />
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  )
}

function TicketRow({ ticket }: { ticket: Ticket }) {
  return (
    <Link
      to="/tickets/$ticketId"
      params={{ ticketId: ticket.id }}
      className="flex items-center justify-between px-5 py-4 hover:bg-bg transition"
    >
      <div>
        <div className="flex items-center gap-2 mb-1">
          <p className="font-semibold text-text-dark">{ticket.ticketNumber}</p>
          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${STATUS_CONFIG[ticket.status].bg} ${STATUS_CONFIG[ticket.status].color}`}>
            {STATUS_CONFIG[ticket.status].label}
          </span>
        </div>
        <p className="font-semibold text-text-dark">{ticket.subject}</p>
        <p className="text-xs text-text-secondary">
          {ticket.customer.name} · {new Date(ticket.createdAt).toLocaleString()}
        </p>
      </div>
      <div className="text-right">
        <p className="text-sm text-text-dark">{ticket.serviceNumber}</p>
        <p className="text-xs text-text-secondary">Service No.</p>
      </div>
    </Link>
  )
}
