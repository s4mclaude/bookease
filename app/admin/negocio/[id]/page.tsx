import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import sql from '@/lib/db'
import Link from 'next/link'
import {
  ArrowLeft,
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react'
import DarkModeToggle from '@/components/ui/DarkModeToggle'
import ParticlesComponent from '@/components/ui/ParticlesComponent'

const MONTHS = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez']

function formatDate(val: unknown) {
  const d = val instanceof Date ? val : new Date(String(val))
  return `${d.getDate()} de ${MONTHS[d.getMonth()]} de ${d.getFullYear()}`
}

function formatCurrency(val: unknown) {
  return `R$ ${Number(val).toFixed(2).replace('.', ',')}`
}

const STATUS_CONFIG = {
  pending:   { label: 'Pendente',   color: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400', icon: AlertCircle },
  confirmed: { label: 'Confirmado', color: 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400',         icon: Clock },
  completed: { label: 'Concluído',  color: 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400',     icon: CheckCircle },
  canceled:  { label: 'Cancelado',  color: 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400',             icon: XCircle },
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType
  label: string
  value: string | number
  color: string
}) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
    </div>
  )
}

export default async function AdminNegocioPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (session?.user?.email !== process.env.ADMIN_EMAIL) redirect('/dashboard')

  const { id } = await params

  const [business] = await sql`
    SELECT
      b.id, b.name, b.slug, b.type, b.logo_url, b.plan, b.created_at,
      u.name  AS owner_name,
      u.email AS owner_email,
      u.phone AS owner_phone
    FROM businesses b
    JOIN users u ON u.id::text = b.owner_id::text
    WHERE b.id = ${id}
    LIMIT 1
  `

  if (!business) redirect('/admin')

  const [stats] = await sql`
    SELECT
      COUNT(DISTINCT a.id)                                                                         AS total_appointments,
      COUNT(DISTINCT CASE WHEN a.scheduled_date = CURRENT_DATE THEN a.id END)                     AS today_appointments,
      COUNT(DISTINCT CASE WHEN a.status IN ('pending','confirmed') AND a.scheduled_date >= CURRENT_DATE THEN a.id END) AS upcoming_appointments,
      COUNT(DISTINCT c.id)                                                                         AS total_customers,
      COUNT(DISTINCT pr.id)                                                                        AS total_professionals,
      COALESCE(SUM(CASE WHEN a.status IN ('confirmed','completed') THEN sv.price ELSE 0 END), 0)  AS total_revenue
    FROM businesses b
    LEFT JOIN appointments  a  ON a.business_id  = b.id
    LEFT JOIN customers     c  ON c.business_id  = b.id
    LEFT JOIN professionals pr ON pr.business_id = b.id AND pr.is_active = true
    LEFT JOIN services      sv ON sv.id          = a.service_id
    WHERE b.id = ${id}
    GROUP BY b.id
  `

  const appointments = await sql`
    SELECT
      a.id, a.scheduled_date, a.start_time, a.status,
      c.name  AS customer_name,
      pr.name AS professional_name,
      sv.name AS service_name,
      sv.price
    FROM appointments a
    JOIN customers     c  ON c.id  = a.customer_id
    JOIN professionals pr ON pr.id = a.professional_id
    JOIN services      sv ON sv.id = a.service_id
    WHERE a.business_id = ${id}
    ORDER BY a.scheduled_date DESC, a.start_time DESC
    LIMIT 15
  `

  const TYPE_LABELS: Record<string, string> = {
    barbershop: 'Barbearia',
    salon: 'Salão de beleza',
    clinic: 'Clínica',
  }

  const initials = String(business.name)
    .split(' ')
    .slice(0, 2)
    .map((w: string) => w[0])
    .join('')
    .toUpperCase()

  return (
    <div className="min-h-screen relative transition-colors">
      <ParticlesComponent />
      <div className="relative z-10 p-6 md:p-10">
      <div className="max-w-4xl mx-auto">

        {/* Cabeçalho */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-5">
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar ao painel admin
            </Link>
            <DarkModeToggle />
          </div>

          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex-shrink-0 overflow-hidden">
              {business.logo_url ? (
                <img
                  src={String(business.logo_url)}
                  alt={String(business.name)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400 font-bold text-lg">
                  {initials}
                </div>
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{business.name}</h1>
                {business.type && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-full">
                    {TYPE_LABELS[String(business.type)] ?? business.type}
                  </span>
                )}
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${
                    business.plan === 'pro'
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {business.plan === 'pro' ? 'Pro' : 'Free'}
                </span>
              </div>

              <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-sm text-gray-500 dark:text-gray-400">
                <span>{business.owner_name}</span>
                <span>{business.owner_email}</span>
                {business.owner_phone && <span>{business.owner_phone}</span>}
                <span>Cadastrado em {formatDate(business.created_at)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <StatCard icon={Calendar}   label="Agendamentos hoje"      value={Number(stats?.today_appointments ?? 0)}    color="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" />
          <StatCard icon={TrendingUp} label="Próximos agendamentos"  value={Number(stats?.upcoming_appointments ?? 0)} color="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400" />
          <StatCard icon={Calendar}   label="Total de agendamentos"  value={Number(stats?.total_appointments ?? 0)}    color="bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400" />
          <StatCard icon={Users}      label="Clientes"               value={Number(stats?.total_customers ?? 0)}       color="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400" />
          <StatCard icon={Users}      label="Profissionais ativos"   value={Number(stats?.total_professionals ?? 0)}   color="bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400" />
          <StatCard icon={DollarSign} label="Faturamento estimado"   value={formatCurrency(stats?.total_revenue ?? 0)} color="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400" />
        </div>

        {/* Últimos agendamentos */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm dark:shadow-none overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Últimos agendamentos</h2>
          </div>

          {appointments.length === 0 ? (
            <div className="p-10 text-center text-gray-400 dark:text-gray-500 text-sm">
              Nenhum agendamento ainda.
            </div>
          ) : (
            appointments.map((a, i) => {
              const status = STATUS_CONFIG[a.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.pending
              const StatusIcon = status.icon

              return (
                <div
                  key={String(a.id)}
                  className={`px-6 py-3.5 flex items-center gap-3 ${
                    i !== appointments.length - 1 ? 'border-b border-gray-50 dark:border-gray-800' : ''
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{a.customer_name}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                      {a.service_name} · {a.professional_name}
                    </p>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(a.scheduled_date)} às {String(a.start_time).slice(0, 5)}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                      {a.price != null ? formatCurrency(a.price) : '—'}
                    </p>
                  </div>

                  <span className={`hidden md:inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg flex-shrink-0 ${status.color}`}>
                    <StatusIcon className="w-3 h-3" />
                    {status.label}
                  </span>
                </div>
              )
            })
          )}
        </div>

      </div>
      </div>
    </div>
  )
}
