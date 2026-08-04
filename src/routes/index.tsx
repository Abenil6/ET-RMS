import { createFileRoute, Link } from '@tanstack/react-router'
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Layers3,
  ShieldCheck,
  Ticket,
  Wrench,
} from 'lucide-react'
import { motion } from 'motion/react'
import { HeroShowcase } from '../components/HeroShowcase'
import { LoopingTitle } from '../components/LoopingTitle'
import { MiniStat } from '../components/MiniStat'
import { TrustPill } from '../components/TrustPill'
import { FeatureCard } from '../components/FeatureCard'
import { StepCard } from '../components/StepCard'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return (
    <main className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-primary-green/20 blur-3xl" />
        <div className="absolute top-40 -left-24 h-80 w-80 rounded-full bg-primary-blue/15 blur-3xl" />
        <div className="absolute bottom-[-8rem] right-[-6rem] h-[30rem] w-[30rem] rounded-full bg-warning/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(43,182,115,0.08),_transparent_42%),radial-gradient(circle_at_right,_rgba(0,114,206,0.06),_transparent_38%)]" />
      </div>

      <section className="relative mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-10 lg:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <motion.div
            className="max-w-2xl"
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            <LoopingTitle
              text="Internet support without the wait."
              highlight="without the wait."
              className="text-5xl font-extrabold leading-[1.02] tracking-tight text-text-dark sm:text-6xl lg:text-7xl"
            />

            <p className="mt-6 max-w-xl text-lg leading-8 text-text-secondary sm:text-xl">
              Report service issues, track queue position, and follow ticket
              progress from one clean dashboard built for customers, admins, and
              technicians.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary-green px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-primary-green/20 transition-transform duration-200 hover:-translate-y-0.5 hover:bg-primary-green/90"
              >
                Create Ticket
                <ArrowRight size={18} />
              </Link>
              <a
                href="#features"
                className="inline-flex items-center justify-center rounded-full border border-border bg-card/80 px-6 py-3.5 text-base font-semibold text-text-dark shadow-sm backdrop-blur transition-colors hover:bg-bg"
              >
                Explore Features
              </a>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <MiniStat value="24/7" label="Ticket access" icon={Clock3} />
              <MiniStat value="3 steps" label="Fast reporting" icon={Ticket} />
              <MiniStat
                value="Live"
                label="Queue visibility"
                icon={CheckCircle2}
              />
            </div>
          </motion.div>

          <HeroShowcase />
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-6 pb-8 sm:px-8 lg:px-10">
        <div className="grid gap-4 rounded-[2rem] border border-border bg-card/90 p-5 shadow-sm backdrop-blur sm:grid-cols-3">
          <TrustPill
            icon={Wrench}
            title="Built for technicians"
            description="See workloads, assignments, and ticket state at a glance."
          />
          <TrustPill
            icon={Layers3}
            title="One shared system"
            description="Customers, admins, and support staff stay on the same flow."
          />
          <TrustPill
            icon={ShieldCheck}
            title="Clear escalation"
            description="Status labels keep each ticket stage consistent across the app."
          />
        </div>
      </section>

      <section
        id="features"
        className="relative mx-auto max-w-7xl px-6 py-20 sm:px-8 lg:px-10"
      >
        <div className="mb-8 max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary-blue">
            Features
          </p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-text-dark sm:text-4xl">
            A support experience that feels fast, not bureaucratic.
          </h2>
          <p className="mt-4 text-base leading-7 text-text-secondary">
            Every screen is designed to reduce friction: ticket intake, status
            tracking, assignment, and technician workload all stay visually
            consistent.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <FeatureCard
            icon={Ticket}
            title="Report Internet Issues"
            description="Create a support ticket in a few clear steps with structured service details."
            accent="primary-green"
          />
          <FeatureCard
            icon={Clock3}
            title="Track Queue Position"
            description="See whether your ticket is reported, assigned, in progress, or fixed."
            accent="primary-blue"
          />
          <FeatureCard
            icon={Wrench}
            title="Technician Workload"
            description="Admins can spot open load quickly and rebalance work before delays pile up."
            accent="warning"
          />
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-6 pb-24 sm:px-8 lg:px-10">
        <div className="rounded-[2rem] border border-border bg-card/90 p-6 shadow-sm sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary-green">
                How it works
              </p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-text-dark">
                Three steps from problem to resolution.
              </h2>
              <p className="mt-4 text-base leading-7 text-text-secondary">
                The flow is intentionally short so users can submit issues
                quickly and technicians can start working immediately.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <StepCard
                number="01"
                title="Report"
                description="Add location, contact, and issue details."
              />
              <StepCard
                number="02"
                title="Assign"
                description="Admin routes the ticket to an available technician."
              />
              <StepCard
                number="03"
                title="Resolve"
                description="Track progress until the connection is fixed."
              />
            </div>
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-6 pb-24 sm:px-8 lg:px-10">
        <div className="rounded-[2rem] bg-[linear-gradient(135deg,#2BB673_0%,#1B8F5A_45%,#116B43_100%)] px-6 py-12 text-white shadow-2xl shadow-primary-green/20 sm:px-10">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-white/80">
                Ready to submit a ticket?
              </p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
                Start with a clean dashboard and get routed faster.
              </h2>
              <p className="mt-4 max-w-2xl text-white/85">
                Create a ticket now, or sign in if you already have one in the
                system.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                to="/register"
                className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3.5 font-semibold text-primary-green transition-transform hover:-translate-y-0.5"
              >
                Get Started
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center rounded-full border border-white/30 px-6 py-3.5 font-semibold text-white transition-colors hover:bg-white/10"
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
