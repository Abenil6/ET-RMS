import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { api, ApiError } from '../../lib/api'
import { useAuth } from '../../context/auth'
import type { TicketCategory, TicketPriority } from '../../lib/types'

export const Route = createFileRoute('/_dashboard/report')({
  component: ReportPage,
})

function ReportPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  // API-required fields
  const [subject, setSubject] = useState('')
  const [serviceNumber, setServiceNumber] = useState('')
  const [category, setCategory] = useState<TicketCategory>('CONNECTIVITY')
  const [priority, setPriority] = useState<TicketPriority>('MEDIUM')
  const [problemDescription, setProblemDescription] = useState('')

  // Extra UI fields (not sent directly; appended into description)
  const [accessTechnology, setAccessTechnology] = useState('')
  const [bandwidth, setBandwidth] = useState('')

  const [region, setRegion] = useState('')
  const [subCity, setSubCity] = useState('')
  const [woreda, setWoreda] = useState('')
  const [kebele, setKebele] = useState('')
  const [houseNumber, setHouseNumber] = useState('')

  const [fullName, setFullName] = useState('')
  const [primaryMobile, setPrimaryMobile] = useState('')
  const [email, setEmail] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Prefill contact from logged-in user (optional)
  useEffect(() => {
    if (!user) return
    setFullName(user.name || '')
    setEmail(user.email || '')
    setPrimaryMobile(user.phone || '')
  }, [user])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!subject.trim()) return setError('Subject is required')
    if (!serviceNumber.trim()) return setError('Service/Account number is required')
    if (!problemDescription.trim()) return setError('Problem description is required')

    const extraLines: string[] = []
    if (accessTechnology) extraLines.push(`Access Technology: ${accessTechnology}`)
    if (bandwidth) extraLines.push(`Requested Bandwidth: ${bandwidth}`)
    if (region || subCity || woreda || kebele || houseNumber) {
      extraLines.push(
        `Location: ${[region, subCity, woreda && `Woreda ${woreda}`, kebele && `Kebele/Block ${kebele}`, houseNumber && `House ${houseNumber}`]
          .filter(Boolean)
          .join(', ')}`,
      )
    }
    if (fullName) extraLines.push(`Contact Name: ${fullName}`)
    if (primaryMobile) extraLines.push(`Contact Phone: ${primaryMobile}`)
    if (email) extraLines.push(`Contact Email: ${email}`)

    const finalDescription =
      extraLines.length === 0
        ? problemDescription.trim()
        : `${problemDescription.trim()}\n\n---\n${extraLines.join('\n')}`

    try {
      setSubmitting(true)
      const created = await api.tickets.create({
        subject: subject.trim(),
        serviceNumber: serviceNumber.trim(),
        description: finalDescription,
        category,
        priority,
      })

      // Go to ticket detail page
      navigate({ to: '/tickets/$ticketId', params: { ticketId: created.id } })
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Failed to submit ticket. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <motion.div
      className="max-w-3xl"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <h1 className="text-2xl font-bold text-text-dark mb-1">Report a Problem</h1>
      <p className="text-text-secondary mb-8">
        Fill in your service details so we can route your ticket to the right technician.
      </p>

      {error && (
        <div className="mb-6 rounded-lg border border-error bg-error/10 px-4 py-3 text-sm text-error">
          {error}
        </div>
      )}

      <form className="space-y-10" onSubmit={handleSubmit}>
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
        >
          <Section title="Ticket Info">
            <Field label="Subject">
              <input
                type="text"
                placeholder="e.g. Internet not working"
                className={inputClass}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </Field>

            <Field label="Category">
              <select
                className={inputClass}
                value={category}
                onChange={(e) => setCategory(e.target.value as TicketCategory)}
              >
                <option value="CONNECTIVITY">Connectivity</option>
                <option value="HARDWARE">Hardware</option>
                <option value="SOFTWARE">Software</option>
                <option value="BILLING">Billing</option>
                <option value="OTHER">Other</option>
              </select>
            </Field>

            <Field label="Priority">
              <select
                className={inputClass}
                value={priority}
                onChange={(e) => setPriority(e.target.value as TicketPriority)}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </Field>

            <Field label="Service Number / Account Number">
              <input
                type="text"
                placeholder="e.g. 0911223344"
                className={inputClass}
                value={serviceNumber}
                onChange={(e) => setServiceNumber(e.target.value)}
              />
            </Field>
          </Section>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Section title="Service Details">
            <Field label="Access Technology">
              <select
                className={inputClass}
                value={accessTechnology}
                onChange={(e) => setAccessTechnology(e.target.value)}
              >
                <option value="">Select technology</option>
                <option value="FTTH">Fiber to the Home (FTTH)</option>
                <option value="ADSL">ADSL</option>
                <option value="FIXED_WIRELESS">Fixed Wireless</option>
              </select>
            </Field>

            <Field label="Requested Bandwidth">
              <select
                className={inputClass}
                value={bandwidth}
                onChange={(e) => setBandwidth(e.target.value)}
              >
                <option value="">Select speed</option>
                <option value="5 Mbps">5 Mbps</option>
                <option value="7 Mbps">7 Mbps</option>
                <option value="10 Mbps">10 Mbps</option>
                <option value="20 Mbps">20 Mbps</option>
                <option value="50 Mbps+">50 Mbps+</option>
              </select>
            </Field>
          </Section>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Section title="Location">
            <Field label="Region / City">
              <input
                type="text"
                placeholder="Addis Ababa"
                className={inputClass}
                value={region}
                onChange={(e) => setRegion(e.target.value)}
              />
            </Field>

            <Field label="Sub-City / Zone">
              <input
                type="text"
                placeholder="Bole"
                className={inputClass}
                value={subCity}
                onChange={(e) => setSubCity(e.target.value)}
              />
            </Field>

            <Field label="Woreda">
              <input
                type="text"
                placeholder="e.g. 07"
                className={inputClass}
                value={woreda}
                onChange={(e) => setWoreda(e.target.value)}
              />
            </Field>

            <Field label="Kebele / Block">
              <input
                type="text"
                placeholder="e.g. 03"
                className={inputClass}
                value={kebele}
                onChange={(e) => setKebele(e.target.value)}
              />
            </Field>

            <Field label="House Number">
              <input
                type="text"
                placeholder="e.g. 245"
                className={inputClass}
                value={houseNumber}
                onChange={(e) => setHouseNumber(e.target.value)}
              />
            </Field>
          </Section>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Section title="Contact & Problem">
            <Field label="Full Name">
              <input
                type="text"
                placeholder="Abebe Kebede"
                className={inputClass}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </Field>

            <Field label="Primary Mobile Number">
              <input
                type="tel"
                placeholder="09xx xxx xxx"
                className={inputClass}
                value={primaryMobile}
                onChange={(e) => setPrimaryMobile(e.target.value)}
              />
            </Field>

            <Field label="Email Address">
              <input
                type="email"
                placeholder="you@example.com"
                className={inputClass}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field>

            <Field label="Problem Description" full>
              <textarea
                rows={4}
                placeholder="Describe the issue — e.g. no connection since morning, intermittent drops, slow speeds..."
                className={inputClass}
                value={problemDescription}
                onChange={(e) => setProblemDescription(e.target.value)}
              />
            </Field>
          </Section>
        </motion.div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full sm:w-auto px-8 py-3 rounded-lg bg-primary-green text-white font-semibold hover:bg-primary-green/90 disabled:opacity-50"
        >
          {submitting ? 'Submitting...' : 'Submit Ticket'}
        </button>
      </form>
    </motion.div>
  )
}

const inputClass =
  'w-full px-3 py-2 rounded-lg border border-border bg-bg text-text-dark focus:outline-none focus:ring-2 focus:ring-primary-green'

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-4">
        {title}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>
    </div>
  )
}

function Field({
  label,
  children,
  full,
}: {
  label: string
  children: React.ReactNode
  full?: boolean
}) {
  return (
    <div className={full ? 'sm:col-span-2' : ''}>
      <label className="block text-sm font-medium text-text-dark mb-1">
        {label}
      </label>
      {children}
    </div>
  )
}