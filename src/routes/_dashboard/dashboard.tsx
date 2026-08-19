import { createFileRoute, Link } from '@tanstack/react-router'
import { useMemo } from 'react'
import { useAuth } from '../../context/auth'
import { ticketsApi } from '@/apis/tickets'
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Star,
  Activity,
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
import type { KpiKey } from '../../lib/dashboardStats'
import { useDateRange } from '../../lib/useDateRange'
import { KpiCard } from '../../components/dashboard/KpiCard'
import { ChartCard } from '../../components/dashboard/ChartCard'
import { DateRangePicker } from '../../components/dashboard/DateRangePicker'
import { PdfExportButton } from '../../components/dashboard/PdfExportButton'
import { LoadingSpinner } from '../../components/LoadingSpinner'
import { ErrorMessage } from '../../components/ErrorMessage'
import { Ticket } from 'lucide-react'

export const Route = createFileRoute('/_dashboard/dashboard')({
  component: DashboardPage,
})

const KPI_ICONS: Record<KpiKey, LucideIcon> = {
  open: AlertCircle,
  inProgress: Clock,
  resolved: CheckCircle2,
  avgResolution: Activity,
}

function DashboardPage() {
  const { user } = useAuth()
  if (!user) return null

  if (user.role === 'ADMIN') return <AdminOverview />
  if (user.role === 'TECHNICIAN') return <TechnicianOverview />
  return <CustomerOverview />
}

function AdminOverview() {
  const { data: tickets, isLoading: loading, isError, error, refetch: refresh } = ticketsApi.getAll.useQuery()
  const { preset, setPreset, custom, setCustom, range } = useDateRange()

  const kpis = useMemo(() => computeKpis(tickets ?? [], range), [tickets, range])
  const daily = useMemo(() => dailySeries(tickets ?? [], range), [tickets, range])
  const weekday = useMemo(() => weekdayBuckets(tickets ?? [], range), [tickets, range])
  const categories = useMemo(() => categoryBreakdown(tickets ?? [], range), [tickets, range])
  const repeat = useMemo(() => repeatRate(tickets ?? [], range), [tickets, range])
  const topTechs = useMemo(() => topTechnicians(tickets ?? [], range), [tickets, range])
  const exportData = useMemo(() => ticketsToExport(tickets ?? [], range), [tickets, range])

  if (loading) return <LoadingSpinner size="lg" />
  if (isError) return <ErrorMessage message={error?.message || 'Failed to load tickets'} retry={refresh} />

  return (
    <motion.div
      className="w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-text-secondary">
            System overview and performance metrics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <DateRangePicker 
            preset={preset} 
            onPresetChange={setPreset} 
            custom={custom} 
            onCustomChange={setCustom} 
            range={range} 
          />
          <PdfExportButton 
            filename="tickets-export.pdf"
            title="Tickets Export"
            headers={exportData.headers}
            rows={exportData.rows}
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {kpis.map((kpi, index) => (
          <KpiCard 
            key={kpi.key} 
            icon={KPI_ICONS[kpi.key]}
            label={kpi.label}
            value={kpi.value}
            delta={kpi.delta}
            unit={kpi.unit}
            delay={index * 0.1}
          />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        <ChartCard title="Daily Ticket Trend">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={daily}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="open"
                stroke="#3b82f6"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="resolved"
                stroke="#10b981"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Tickets by Weekday">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weekday}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Category Breakdown">
          <ResponsiveContainer width="100%" height={300}>
            <RadialBarChart
              cx="50%"
              cy="50%"
              innerRadius="10%"
              outerRadius="80%"
              data={categories}
              startAngle={180}
              endAngle={0}
            >
              <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
              <RadialBar dataKey="percent" cornerRadius={10} />
              <Legend iconSize={10} layout="vertical" verticalAlign="middle" />
              <Tooltip />
            </RadialBarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Top Technicians">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topTechs} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={100} />
              <Tooltip />
              <Bar dataKey="resolved" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="mt-6 p-4 bg-card rounded-lg border border-border">
        <p className="text-sm text-text-secondary">
          <strong>Repeat Rate:</strong> {repeat.rate}% of
          customers have multiple tickets.
        </p>
      </div>
    </motion.div>
  )
}

function TechnicianOverview() {
  const { user } = useAuth()
  const { data: tickets, isLoading: loading, isError, error, refetch: refresh } = ticketsApi.getAll.useQuery()

  const myTickets = useMemo(
    () => (tickets ?? []).filter((t) => t.technicianId === user?.id),
    [tickets, user],
  )

  const stats = useMemo(() => {
    const open = myTickets.filter(
      (t) => t.status === 'OPEN' || t.status === 'ASSIGNED',
    ).length
    const inProgress = myTickets.filter((t) => t.status === 'IN_PROGRESS').length
    const resolved = myTickets.filter((t) => t.status === 'RESOLVED').length
    
    const ratedTickets = myTickets.filter((t) => t.review?.rating)
    const avgRating = ratedTickets.length > 0
      ? ratedTickets.reduce((sum, t) => sum + (t.review?.rating || 0), 0) / ratedTickets.length
      : 0

    return { open, inProgress, resolved, avgRating }
  }, [myTickets])

  if (loading) return <LoadingSpinner size="lg" />
  if (isError) return <ErrorMessage message={error?.message || 'Failed to load tickets'} retry={refresh} />

  return (
    <motion.div
      className="w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Technician Dashboard</h1>
        <p className="text-text-secondary">
          Your assigned tickets and performance
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={AlertCircle}
          label="Open"
          value={stats.open}
          color="text-blue-600"
          bgColor="bg-blue-100"
        />
        <StatCard
          icon={Clock}
          label="In Progress"
          value={stats.inProgress}
          color="text-yellow-600"
          bgColor="bg-yellow-100"
        />
        <StatCard
          icon={CheckCircle2}
          label="Resolved"
          value={stats.resolved}
          color="text-green-600"
          bgColor="bg-green-100"
        />
        <StatCard
          icon={Star}
          label="Avg Rating"
          value={stats.avgRating.toFixed(1)}
          color="text-purple-600"
          bgColor="bg-purple-100"
        />
      </div>

      <div className="mt-6">
        <Link
          to="/tickets"
          className="inline-block px-4 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-blue/90 transition-colors"
        >
          View All Tickets
        </Link>
      </div>
    </motion.div>
  )
}

function CustomerOverview() {
  const { user } = useAuth()
  const { data: tickets, isLoading: loading, isError, error, refetch: refresh } = ticketsApi.getAll.useQuery()

  const myTickets = useMemo(
    () => (tickets ?? []).filter((t) => t.customerId === user?.id),
    [tickets, user],
  )

  const stats = useMemo(() => {
    const open = myTickets.filter(
      (t) => t.status === 'OPEN' || t.status === 'ASSIGNED',
    ).length
    const inProgress = myTickets.filter((t) => t.status === 'IN_PROGRESS').length
    const resolved = myTickets.filter(
      (t) => t.status === 'RESOLVED' || t.status === 'CLOSED',
    ).length
    const total = myTickets.length

    return { open, inProgress, resolved, total }
  }, [myTickets])

  if (loading) return <LoadingSpinner size="lg" />
  if (isError) return <ErrorMessage message={error?.message || 'Failed to load tickets'} retry={refresh} />

  return (
    <motion.div
      className="w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="mb-6">
        <h1 className="text-3xl font-bold">My Dashboard</h1>
        <p className="text-text-secondary">
          Overview of your support tickets
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Ticket}
          label="Total Tickets"
          value={stats.total}
          color="text-gray-600"
          bgColor="bg-gray-100"
        />
        <StatCard
          icon={AlertCircle}
          label="Open"
          value={stats.open}
          color="text-blue-600"
          bgColor="bg-blue-100"
        />
        <StatCard
          icon={Clock}
          label="In Progress"
          value={stats.inProgress}
          color="text-yellow-600"
          bgColor="bg-yellow-100"
        />
        <StatCard
          icon={CheckCircle2}
          label="Resolved"
          value={stats.resolved}
          color="text-green-600"
          bgColor="bg-green-100"
        />
      </div>

      <div className="mt-6 flex gap-4">
        <Link
          to="/report"
          className="inline-block px-4 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-blue/90 transition-colors"
        >
          Report New Issue
        </Link>
        <Link
          to="/tickets"
          className="inline-block px-4 py-2 border border-border rounded-lg hover:bg-bg transition-colors"
        >
          View All Tickets
        </Link>
      </div>
    </motion.div>
  )
}

type StatCardProps = {
  icon: LucideIcon
  label: string
  value: number | string
  color: string
  bgColor: string
}

function StatCard({ icon: Icon, label, value, color, bgColor }: StatCardProps) {
  return (
    <motion.div
      className="p-6 bg-card rounded-lg border border-border"
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-text-secondary text-sm">{label}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${bgColor}`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
    </motion.div>
  )
}
