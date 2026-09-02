import { Link } from '@tanstack/react-router'
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
import { useTranslation } from 'react-i18next'
import { HeroShowcase } from '@/components/HeroShowcase'
import { LoopingTitle } from '@/components/LoopingTitle'
import { MiniStat } from '@/components/MiniStat'
import { TrustPill } from '@/components/TrustPill'
import { FeatureCard } from '@/components/FeatureCard'
import { StepCard } from '@/components/StepCard'

export function HomePage() {
  const { t } = useTranslation()

  return (
    <main className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-primary-green/20 blur-3xl" />
        <div className="absolute top-40 -left-24 h-80 w-80 rounded-full bg-primary-blue/15 blur-3xl" />
        <div className="absolute bottom-32 right-24 h-120 w-120 rounded-full bg-warning/10 blur-3xl" />
        <div className="absolute inset-0 bg-bg-[radial-gradient(circle_at_top,rgba(43,182,115,0.08),transparent_42%),radial-gradient(circle_at_right,rgba(0,114,206,0.06),transparent_38%)]" />
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
              text={t('home.hero_title')}
              highlight={t('home.hero_highlight')}
              className="text-5xl font-extrabold leading-[1.02] tracking-tight text-text-dark sm:text-6xl lg:text-7xl"
            />

            <p className="mt-6 max-w-xl text-lg leading-8 text-text-secondary sm:text-xl">
              {t('home.hero_description')}
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary-green px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-primary-green/20 transition-transform duration-200 hover:-translate-y-0.5 hover:bg-primary-green/90"
              >
                {t('home.create_ticket')}
                <ArrowRight size={18} />
              </Link>
              <a
                href="#features"
                className="inline-flex items-center justify-center rounded-full border border-border bg-card/80 px-6 py-3.5 text-base font-semibold text-text-dark shadow-sm backdrop-blur transition-colors hover:bg-bg"
              >
                {t('home.explore_features')}
              </a>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <MiniStat
                value="24/7"
                label={t('home.ticket_access')}
                icon={Clock3}
              />
              <MiniStat
                value="3 steps"
                label={t('home.fast_reporting')}
                icon={Ticket}
              />
              <MiniStat
                value="Live"
                label={t('home.queue_visibility')}
                icon={CheckCircle2}
              />
            </div>
          </motion.div>

          <HeroShowcase />
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-6 pb-8 sm:px-8 lg:px-10">
        <div className="grid gap-4 rounded-4xl border border-border bg-card/90 p-5 shadow-sm backdrop-blur sm:grid-cols-3">
          <TrustPill
            icon={Wrench}
            title={t('home.built_for_technicians')}
            description={t('home.built_for_technicians_description')}
          />
          <TrustPill
            icon={Layers3}
            title={t('home.one_shared_system')}
            description={t('home.one_shared_system_description')}
          />
          <TrustPill
            icon={ShieldCheck}
            title={t('home.clear_escalation')}
            description={t('home.clear_escalation_description')}
          />
        </div>
      </section>

      <section
        id="features"
        className="relative mx-auto max-w-7xl px-6 py-20 sm:px-8 lg:px-10"
      >
        <div className="mb-8 max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary-blue">
            {t('home.features_label')}
          </p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-text-dark sm:text-4xl">
            {t('home.features_title')}
          </h2>
          <p className="mt-4 text-base leading-7 text-text-secondary">
            {t('home.features_description')}
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <FeatureCard
            icon={Ticket}
            title={t('home.report_issues_title')}
            description={t('home.report_issues_description')}
            accent="primary-green"
          />
          <FeatureCard
            icon={Clock3}
            title={t('home.track_queue_title')}
            description={t('home.track_queue_description')}
            accent="primary-blue"
          />
          <FeatureCard
            icon={Wrench}
            title={t('home.technician_workload_title')}
            description={t('home.technician_workload_description')}
            accent="warning"
          />
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-6 pb-24 sm:px-8 lg:px-10">
        <div className="rounded-4xl border border-border bg-card/90 p-6 shadow-sm sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary-green">
                {t('home.how_it_works_label')}
              </p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-text-dark">
                {t('home.how_it_works_title')}
              </h2>
              <p className="mt-4 text-base leading-7 text-text-secondary">
                {t('home.how_it_works_description')}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <StepCard
                number="01"
                title={t('home.step_report')}
                description={t('home.step_report_description')}
              />
              <StepCard
                number="02"
                title={t('home.step_assign')}
                description={t('home.step_assign_description')}
              />
              <StepCard
                number="03"
                title={t('home.step_resolve')}
                description={t('home.step_resolve_description')}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-6 pb-24 sm:px-8 lg:px-10">
        <div className="rounded-4xl bg-[linear-gradient(135deg,#2BB673_0%,#1B8F5A_45%,#116B43_100%)] px-6 py-12 text-white shadow-2xl shadow-primary-green/20 sm:px-10">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-white/80">
                {t('home.cta_label')}
              </p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
                {t('home.cta_title')}
              </h2>
              <p className="mt-4 max-w-2xl text-white/85">
                {t('home.cta_description')}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                to="/register"
                className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3.5 font-semibold text-primary-green transition-transform hover:-translate-y-0.5"
              >
                {t('home.get_started')}
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center rounded-full border border-white/30 px-6 py-3.5 font-semibold text-white transition-colors hover:bg-white/10"
              >
                {t('home.login')}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
