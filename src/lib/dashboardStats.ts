import { CATEGORY_LABELS } from '../data/tickets'
import type { Ticket } from './types'

export type DateRange = { from: Date; to: Date } | null

const DAY_MS = 86_400_000

export function startOfDay(d: Date): Date {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

export function isInRange(t: Ticket, range: DateRange): boolean {
  if (!range) return true
  const ts = new Date(t.createdAt).getTime()
  return ts >= range.from.getTime() && ts <= range.to.getTime()
}

export function previousWindow(range: DateRange): DateRange {
  if (!range) return null
  const len = range.to.getTime() - range.from.getTime()
  const toPrev = range.from.getTime() - 1
  return { from: new Date(toPrev - len), to: new Date(toPrev) }
}

// ---------------------------------------------------------------------------
// KPI cards
// ---------------------------------------------------------------------------

export type KpiKey = 'open' | 'inProgress' | 'resolved' | 'avgResolution'

export type KpiResult = {
  key: KpiKey
  label: string
  value: number
  delta: number | null
  unit?: string
}

function countOpen(list: Ticket[]) {
  return list.filter(
    (t) => t.status === 'OPEN' || t.status === 'ASSIGNED',
  ).length
}

function countInProgress(list: Ticket[]) {
  return list.filter((t) => t.status === 'IN_PROGRESS').length
}

function countResolved(list: Ticket[], range: DateRange) {
  return list.filter((t) => {
    if (t.status !== 'RESOLVED' && t.status !== 'CLOSED') return false
    const ts = t.resolvedAt
      ? new Date(t.resolvedAt).getTime()
      : new Date(t.createdAt).getTime()
    return range
      ? ts >= range.from.getTime() && ts <= range.to.getTime()
      : true
  }).length
}

function avgResolutionHours(list: Ticket[], range: DateRange) {
  const resolved = list.filter(
    (t) =>
      t.resolvedAt &&
      (t.status === 'RESOLVED' || t.status === 'CLOSED'),
  )
  const inRange = resolved.filter((t) => {
    const ts = new Date(t.resolvedAt as string).getTime()
    return range
      ? ts >= range.from.getTime() && ts <= range.to.getTime()
      : true
  })
  if (inRange.length === 0) return 0
  const totalMs = inRange.reduce(
    (sum, t) =>
      sum +
      (new Date(t.resolvedAt as string).getTime() -
        new Date(t.createdAt).getTime()),
    0,
  )
  return Math.round((totalMs / inRange.length / 3_600_000) * 10) / 10
}

export function computeKpis(
  list: Ticket[],
  range: DateRange,
): KpiResult[] {
  const current = list.filter((t) => isInRange(t, range))
  const prevRange = previousWindow(range)
  const previous = prevRange ? list.filter((t) => isInRange(t, prevRange)) : []

  const defs: { key: KpiKey; label: string; value: number; unit?: string }[] = [
    { key: 'open', label: 'Open', value: countOpen(current) },
    { key: 'inProgress', label: 'In Progress', value: countInProgress(current) },
    { key: 'resolved', label: 'Resolved', value: countResolved(current, range) },
    {
      key: 'avgResolution',
      label: 'Avg. Resolution',
      value: avgResolutionHours(current, range),
      unit: 'h',
    },
  ]

  return defs.map((d) => {
    let prevValue = 0
    switch (d.key) {
      case 'open':
        prevValue = countOpen(previous)
        break
      case 'inProgress':
        prevValue = countInProgress(previous)
        break
      case 'resolved':
        prevValue = countResolved(previous, prevRange)
        break
      case 'avgResolution':
        prevValue = avgResolutionHours(previous, prevRange)
        break
    }
    const delta =
      prevValue > 0
        ? Math.round(((d.value - prevValue) / prevValue) * 1000) / 10
        : null
    return { ...d, delta }
  })
}

// ---------------------------------------------------------------------------
// Charts
// ---------------------------------------------------------------------------

export function dailySeries(
  list: Ticket[],
  range: DateRange,
): { label: string; created: number; resolved: number }[] {
  const filtered = list.filter((t) => isInRange(t, range))

  let start: Date
  let end: Date
  if (range) {
    start = startOfDay(range.from)
    end = startOfDay(range.to)
  } else if (filtered.length === 0) {
    start = startOfDay(new Date())
    end = startOfDay(new Date())
  } else {
    const times = filtered.map((t) => new Date(t.createdAt).getTime())
    start = startOfDay(new Date(Math.min(...times)))
    end = startOfDay(new Date(Math.max(...times)))
    const spanDays = Math.round((end.getTime() - start.getTime()) / DAY_MS)
    if (spanDays > 60) start = new Date(end.getTime() - 59 * DAY_MS)
  }

  const key = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
  const map = new Map<string, { created: number; resolved: number; date: Date }>()
  for (
    let d = new Date(start);
    d.getTime() <= end.getTime();
    d = new Date(d.getTime() + DAY_MS)
  ) {
    map.set(key(d), { created: 0, resolved: 0, date: new Date(d) })
  }

  for (const t of filtered) {
    const k = key(startOfDay(new Date(t.createdAt)))
    const bucket = map.get(k)
    if (bucket) bucket.created++
    if (t.resolvedAt) {
      const rk = key(startOfDay(new Date(t.resolvedAt)))
      const resolvedBucket = map.get(rk)
      if (resolvedBucket) resolvedBucket.resolved++
    }
  }

  return [...map.values()].map(({ created, resolved, date }) => ({
    label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    created,
    resolved,
  }))
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function weekdayBuckets(
  list: Ticket[],
  range: DateRange,
): { day: string; created: number }[] {
  const buckets = DAY_NAMES.map((day) => ({ day, created: 0 }))
  for (const t of list) {
    if (!isInRange(t, range)) continue
    buckets[new Date(t.createdAt).getDay()].created++
  }
  return buckets
}

export function categoryBreakdown(
  list: Ticket[],
  range: DateRange,
): { category: string; label: string; count: number }[] {
  const counts = new Map<string, number>()
  for (const t of list) {
    if (!isInRange(t, range)) continue
    counts.set(t.category, (counts.get(t.category) ?? 0) + 1)
  }
  return [...counts.entries()]
    .map(([category, count]) => ({
      category,
      label: CATEGORY_LABELS[category] ?? category,
      count,
    }))
    .sort((a, b) => b.count - a.count)
}

export function repeatRate(
  list: Ticket[],
  range: DateRange,
): { rate: number; target: number; customers: number; repeat: number } {
  const customers = new Map<string, number>()
  for (const t of list) {
    if (!isInRange(t, range)) continue
    customers.set(t.customerId, (customers.get(t.customerId) ?? 0) + 1)
  }
  const total = customers.size
  if (total === 0) return { rate: 0, target: 50, customers: 0, repeat: 0 }
  const repeat = [...customers.values()].filter((c) => c >= 2).length
  return {
    rate: Math.round((repeat / total) * 100),
    target: 50,
    customers: total,
    repeat,
  }
}

export type TechnicianPerf = {
  id: string
  name: string
  handled: number
  resolved: number
  avgRating: number
  avgHours: number
}

export function topTechnicians(
  list: Ticket[],
  range: DateRange,
  limit = 5,
): TechnicianPerf[] {
  type Acc = {
    name: string
    handled: number
    resolved: number
    ratingSum: number
    ratingCount: number
    hoursSum: number
    hoursCount: number
  }
  const map = new Map<string, Acc>()
  for (const t of list) {
    if (!isInRange(t, range) || !t.technician) continue
    const tech = t.technician
    let acc = map.get(tech.id)
    if (!acc) {
      acc = {
        name: tech.name,
        handled: 0,
        resolved: 0,
        ratingSum: 0,
        ratingCount: 0,
        hoursSum: 0,
        hoursCount: 0,
      }
      map.set(tech.id, acc)
    }
    acc.handled++
    if (t.status === 'RESOLVED' || t.status === 'CLOSED') acc.resolved++
    if (t.review?.rating) {
      acc.ratingSum += t.review.rating
      acc.ratingCount++
    }
    if (t.resolvedAt) {
      acc.hoursSum +=
        (new Date(t.resolvedAt).getTime() - new Date(t.createdAt).getTime()) /
        3_600_000
      acc.hoursCount++
    }
  }
  return [...map.entries()]
    .map(([id, a]) => ({
      id,
      name: a.name,
      handled: a.handled,
      resolved: a.resolved,
      avgRating: a.ratingCount ? Math.round((a.ratingSum / a.ratingCount) * 10) / 10 : 0,
      avgHours: a.hoursCount ? Math.round((a.hoursSum / a.hoursCount) * 10) / 10 : 0,
    }))
    .sort((a, b) => b.handled - a.handled)
    .slice(0, limit)
}

export function ticketsToCsv(
  list: Ticket[],
  range: DateRange,
): { headers: string[]; rows: (string | number)[][] } {
  const filtered = list.filter((t) => isInRange(t, range))
  const headers = [
    'Ticket',
    'Subject',
    'Status',
    'Priority',
    'Category',
    'Customer',
    'Technician',
    'Created',
    'Resolved',
    'Rating',
  ]
  const rows = filtered.map((t) => [
    t.ticketNumber,
    t.subject,
    t.status,
    t.priority,
    CATEGORY_LABELS[t.category] ?? t.category,
    t.customer.name,
    t.technician?.name ?? '',
    new Date(t.createdAt).toLocaleString(),
    t.resolvedAt ? new Date(t.resolvedAt).toLocaleString() : '',
    t.review?.rating ?? '',
  ])
  return { headers, rows }
}
