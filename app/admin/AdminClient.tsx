'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronDown, ChevronUp, ExternalLink, Users, Clock, Calendar, DollarSign } from 'lucide-react'
import { updateBusinessPlan } from '@/app/actions/admin'
import DarkModeToggle from '@/components/ui/DarkModeToggle'
import ParticlesComponent from '@/components/ui/ParticlesComponent'

type BusinessRow = {
  id: string
  business_name: string
  slug: string
  logo_url: string | null
  owner_name: string
  owner_email: string
  owner_phone: string | null
  plan: string
  plan_expires_at: string | null
  created_at: string
  total_appointments: string | number
  total_revenue: string | number
  total_professionals: string | number
  has_availability: boolean
}

const MONTHS = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez']

function formatDate(val: unknown) {
  const d = val instanceof Date ? val : new Date(String(val))
  return `${d.getDate()} de ${MONTHS[d.getMonth()]} de ${d.getFullYear()}`
}

function formatCurrency(val: unknown) {
  return `R$ ${Number(val).toFixed(2).replace('.', ',')}`
}

function getTimeLeft(expiresAt: string) {
  const ms = new Date(expiresAt).getTime() - Date.now()
  if (ms <= 0) return null
  const total = Math.floor(ms / 1000)
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  }
}

function Countdown({ expiresAt }: { expiresAt: string }) {
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(expiresAt))

  useEffect(() => {
    const interval = setInterval(() => setTimeLeft(getTimeLeft(expiresAt)), 1000)
    return () => clearInterval(interval)
  }, [expiresAt])

  if (!timeLeft) return <span className="text-xs font-semibold text-red-500">Expirado</span>

  const { days, hours, minutes, seconds } = timeLeft
  const pad = (n: number) => String(n).padStart(2, '0')

  return (
    <span className={`text-xs font-semibold tabular-nums ${days <= 7 ? 'text-red-500' : 'text-orange-500'}`}>
      {days}d:{pad(hours)}h:{pad(minutes)}min:{pad(seconds)}s
    </span>
  )
}

function PlanBadge({ plan, expiresAt }: { plan: string; expiresAt: string | null }) {
  return (
    <div className="flex flex-col gap-1">
      {plan === 'pro' ? (
        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 w-fit">
          Pro
        </span>
      ) : (
        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 w-fit">
          Free
        </span>
      )}
      {plan === 'pro' && expiresAt && <Countdown expiresAt={expiresAt} />}
    </div>
  )
}

function PlanActions({ business }: { business: BusinessRow }) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function promote() {
    startTransition(async () => {
      await updateBusinessPlan(business.id, 'pro')
      router.refresh()
    })
  }

  function remove() {
    startTransition(async () => {
      await updateBusinessPlan(business.id, 'free')
      router.refresh()
    })
  }

  if (business.plan === 'pro') {
    return (
      <button
        onClick={remove}
        disabled={isPending}
        className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/40 whitespace-nowrap"
      >
        {isPending ? '...' : 'Remover plano'}
      </button>
    )
  }

  return (
    <button
      onClick={promote}
      disabled={isPending}
      className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 bg-green-500 hover:bg-green-600 text-white whitespace-nowrap"
    >
      {isPending ? '...' : 'Promover para Pro'}
    </button>
  )
}

function StatItem({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType
  label: string
  value: string
  color: string
}) {
  return (
    <div className="flex items-start gap-3">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon className="w-3.5 h-3.5" />
      </div>
      <div>
        <p className="text-xs text-gray-400 dark:text-gray-500">{label}</p>
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mt-0.5">{value}</p>
      </div>
    </div>
  )
}

function BusinessCard({ business }: { business: BusinessRow }) {
  const [expanded, setExpanded] = useState(false)

  const initials = business.business_name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

  return (
    <div className="border-b border-gray-100 dark:border-gray-800 last:border-0">
      {/* Linha principal */}
      <div className="px-5 py-4 flex items-center gap-3 md:gap-4">
        {/* Logo / iniciais */}
        <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex-shrink-0 overflow-hidden border border-gray-200 dark:border-gray-700">
          {business.logo_url ? (
            <img
              src={business.logo_url}
              alt={business.business_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400 text-xs font-bold">
              {initials}
            </div>
          )}
        </div>

        {/* Nome e dono */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{business.business_name}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate">
            {business.owner_name} · {formatDate(business.created_at)}
          </p>
        </div>

        {/* E-mail + telefone (lg+) */}
        <div className="hidden lg:block min-w-0 w-52">
          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{business.owner_email}</p>
          {business.owner_phone && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{business.owner_phone}</p>
          )}
        </div>

        {/* Plano */}
        <div className="hidden md:block w-36 flex-shrink-0">
          <PlanBadge plan={business.plan} expiresAt={business.plan_expires_at} />
        </div>

        {/* Ações */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link
            href={`/admin/negocio/${business.id}`}
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/40 transition-colors whitespace-nowrap"
          >
            <ExternalLink className="w-3 h-3" />
            Ver dashboard
          </Link>
          <PlanActions business={business} />
        </div>
      </div>

      {/* Botão expandir */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-5 py-2 flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border-t border-gray-50 dark:border-gray-800"
      >
        {expanded ? (
          <><ChevronUp className="w-3 h-3" /> Exibir menos</>
        ) : (
          <><ChevronDown className="w-3 h-3" /> Exibir mais</>
        )}
      </button>

      {/* Seção expandida */}
      {expanded && (
        <div className="px-5 py-5 bg-gray-50 dark:bg-gray-800/40 border-t border-gray-100 dark:border-gray-700">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            <StatItem
              icon={Users}
              label="Profissionais ativos"
              value={`${Number(business.total_professionals)} ${Number(business.total_professionals) !== 1 ? 'profissionais' : 'profissional'}`}
              color="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
            />
            <StatItem
              icon={Clock}
              label="Horários de trabalho"
              value={business.has_availability ? 'Configurado' : 'Não configurado'}
              color={
                business.has_availability
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
              }
            />
            <StatItem
              icon={Calendar}
              label="Agendamentos"
              value={`${Number(business.total_appointments)} total`}
              color="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
            />
            <StatItem
              icon={DollarSign}
              label="Faturamento estimado"
              value={formatCurrency(business.total_revenue)}
              color="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
            />
          </div>

          {/* Contato — visível só no mobile ou quando não aparece na linha */}
          <div className="mt-5 pt-4 border-t border-gray-200 dark:border-gray-700 flex flex-wrap gap-x-6 gap-y-1 lg:hidden">
            <div>
              <span className="text-xs text-gray-400 dark:text-gray-500">E-mail: </span>
              <span className="text-xs text-gray-600 dark:text-gray-400">{business.owner_email}</span>
            </div>
            {business.owner_phone && (
              <div>
                <span className="text-xs text-gray-400 dark:text-gray-500">Telefone: </span>
                <span className="text-xs text-gray-600 dark:text-gray-400">{business.owner_phone}</span>
              </div>
            )}
            <Link
              href={`/admin/negocio/${business.id}`}
              className="sm:hidden text-xs text-blue-600 dark:text-blue-400 underline"
            >
              Ver dashboard →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

export default function AdminClient({ businesses }: { businesses: BusinessRow[] }) {
  return (
    <div className="min-h-screen relative transition-colors">
      <ParticlesComponent />
      <div className="relative z-10 p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Painel Admin</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              {businesses.length} negócio{businesses.length !== 1 ? 's' : ''} cadastrado{businesses.length !== 1 ? 's' : ''}
            </p>
          </div>
          <DarkModeToggle />
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm dark:shadow-none overflow-hidden">
          {businesses.length === 0 ? (
            <div className="p-12 text-center text-gray-400 dark:text-gray-500 text-sm">
              Nenhum negócio cadastrado ainda.
            </div>
          ) : (
            businesses.map((b) => <BusinessCard key={b.id} business={b} />)
          )}
        </div>
      </div>
      </div>
    </div>
  )
}
