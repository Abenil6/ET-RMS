import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { useEffect, useState } from 'react'
import api from '@/apis'
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

  const [error, setError] = useState<string | null>(null)

  // Prefill contact from logged-in user (optional)
  useEffect(() => {
    if (!user) return
    setFullName(user.name || '')
    setEmail(user.email || '')
    setPrimaryMobile(user.phone || '')
  }, [user])

  const { mutate: createTicket, isPending: submitting } = api.Tickets.create.useMutation({
    onSuccess: (created) => {
      // Go to ticket detail page
      navigate({ to: '/tickets/$ticketId', params: { ticketId: created.id } })
    },
    onError: (err) => {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Failed to submit ticket. Please try again.')
      }
    },
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!subject.trim() || !serviceNumber.trim() || !problemDescription.trim()) {
      setError('Please fill in all required fields.')
      return
    }

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

    createTicket({
      subject: subject.trim(),
      serviceNumber: serviceNumber.trim(),
      description: finalDescription,
      category,
      priority,
    })
  }

  return (
    <motion.div
      className="max-w-3xl"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <h1 className="text-2xl font-bold text-text-dark mb-1">Report an Issue</h1>
      <p className="text-text-secondary mb-8">
        Submit a support ticket. Our team will review and respond promptly.
      </p>

      {error && (
        <div className="mb-5 p-4 rounded-xl border border-error/20 bg-error/10 text-error text-sm font-semibold">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Required Fields */}
        <div className="bg-card rounded-xl border border-border p-6 space-y-5">
          <h2 className="text-lg font-semibold text-text-dark border-b border-border pb-3 mb-2">
            Required Information
          </h2>

          <div>
            <label htmlFor="subject" className="block text-sm font-semibold text-text-secondary mb-2">
              Subject <span className="text-error">*</span>
            </label>
            <input
              id="subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-text-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue"
            />
          </div>

          <div>
            <label htmlFor="serviceNumber" className="block text-sm font-semibold text-text-secondary mb-2">
              Service Number <span className="text-error">*</span>
            </label>
            <input
              id="serviceNumber"
              type="text"
              value={serviceNumber}
              onChange={(e) => setServiceNumber(e.target.value)}
              required
              placeholder="e.g., SRV-123456"
              className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-text-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="category" className="block text-sm font-semibold text-text-secondary mb-2">
                Category <span className="text-error">*</span>
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value as TicketCategory)}
                required
                className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-text-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue"
              >
                <option value="CONNECTIVITY">Connectivity</option>
                <option value="BILLING">Billing</option>
                <option value="HARDWARE">Hardware</option>
                <option value="SERVICE_REQUEST">Service Request</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="priority" className="block text-sm font-semibold text-text-secondary mb-2">
                Priority <span className="text-error">*</span>
              </label>
              <select
                id="priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as TicketPriority)}
                required
                className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-text-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="problemDescription" className="block text-sm font-semibold text-text-secondary mb-2">
              Problem Description <span className="text-error">*</span>
            </label>
            <textarea
              id="problemDescription"
              value={problemDescription}
              onChange={(e) => setProblemDescription(e.target.value)}
              required
              rows={4}
              placeholder="Describe the issue in detail..."
              className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-text-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue resize-none"
            />
          </div>
        </div>

        {/* Technical Details */}
        <div className="bg-card rounded-xl border border-border p-6 space-y-5">
          <h2 className="text-lg font-semibold text-text-dark border-b border-border pb-3 mb-2">
            Technical Details (Optional)
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="accessTechnology" className="block text-sm font-semibold text-text-secondary mb-2">
                Access Technology
              </label>
              <select
                id="accessTechnology"
                value={accessTechnology}
                onChange={(e) => setAccessTechnology(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-text-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue"
              >
                <option value="">Select...</option>
                <option value="Fiber">Fiber</option>
                <option value="4G/LTE">4G/LTE</option>
                <option value="5G">5G</option>
                <option value="WiFi">WiFi</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="bandwidth" className="block text-sm font-semibold text-text-secondary mb-2">
                Requested Bandwidth
              </label>
              <input
                id="bandwidth"
                type="text"
                value={bandwidth}
                onChange={(e) => setBandwidth(e.target.value)}
                placeholder="e.g., 100 Mbps"
                className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-text-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue"
              />
            </div>
          </div>
        </div>

        {/* Location Details */}
        <div className="bg-card rounded-xl border border-border p-6 space-y-5">
          <h2 className="text-lg font-semibold text-text-dark border-b border-border pb-3 mb-2">
            Location Details (Optional)
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="region" className="block text-sm font-semibold text-text-secondary mb-2">
                Region
              </label>
              <input
                id="region"
                type="text"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-text-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue"
              />
            </div>
            <div>
              <label htmlFor="subCity" className="block text-sm font-semibold text-text-secondary mb-2">
                Sub City
              </label>
              <input
                id="subCity"
                type="text"
                value={subCity}
                onChange={(e) => setSubCity(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-text-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue"
              />
            </div>
            <div>
              <label htmlFor="woreda" className="block text-sm font-semibold text-text-secondary mb-2">
                Woreda
              </label>
              <input
                id="woreda"
                type="text"
                value={woreda}
                onChange={(e) => setWoreda(e.target.value)}
                placeholder="e.g., 5"
                className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-text-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue"
              />
            </div>
            <div>
              <label htmlFor="kebele" className="block text-sm font-semibold text-text-secondary mb-2">
                Kebele/Block
              </label>
              <input
                id="kebele"
                type="text"
                value={kebele}
                onChange={(e) => setKebele(e.target.value)}
                placeholder="e.g., 12"
                className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-text-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue"
              />
            </div>
            <div>
              <label htmlFor="houseNumber" className="block text-sm font-semibold text-text-secondary mb-2">
                House Number
              </label>
              <input
                id="houseNumber"
                type="text"
                value={houseNumber}
                onChange={(e) => setHouseNumber(e.target.value)}
                placeholder="e.g., 45"
                className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-text-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue"
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-card rounded-xl border border-border p-6 space-y-5">
          <h2 className="text-lg font-semibold text-text-dark border-b border-border pb-3 mb-2">
            Contact Information
          </h2>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="fullName" className="block text-sm font-semibold text-text-secondary mb-2">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-text-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue"
              />
            </div>
            <div>
              <label htmlFor="primaryMobile" className="block text-sm font-semibold text-text-secondary mb-2">
                Mobile Number
              </label>
              <input
                id="primaryMobile"
                type="tel"
                value={primaryMobile}
                onChange={(e) => setPrimaryMobile(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-text-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-text-secondary mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-text-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 px-6 rounded-lg bg-primary-blue text-white font-medium text-lg hover:bg-primary-blue/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Submitting...' : 'Submit Ticket'}
        </button>
      </form>
    </motion.div>
  )
}
