import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import sql from '@/lib/db'
import { TrendingUp, Users, CheckCircle, DollarSign, Scissors, UserCheck } from 'lucide-react'

const MONTH_NAMES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']

function formatCurrency(val: unknown) {
  return `R$ ${Number(val).toFixed(2).replace('.', ',')}`
}

function MetricCard({
  label,
  value,
  sub,
  icon: Icon,
  color,
}: {
  label: string
  value: string
  sub?: string
  icon: React.ElementType
  color: string
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-gray-500">{label}</p>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}

export default async function RelatoriosPage() {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) redirect('/login')

  const businesses = await sql`SELECT id FROM businesses WHERE owner_id = ${userId} LIMIT 1`
  const business = businesses[0]
  if (!business) redirect('/dashboard')

  const [totals, topServices, topProfessionals, byMonth, totalClients] = await Promise.all([
    sql`
      SELECT
        COUNT(*)                                               AS total,
        COUNT(*) FILTER (WHERE a.status = 'completed')        AS completed,
        COUNT(*) FILTER (WHERE a.status = 'canceled')         AS canceled,
        COALESCE(SUM(s.price) FILTER (WHERE a.status = 'completed'), 0) AS revenue
      FROM appointments a
      JOIN services s ON s.id = a.service_id
      WHERE a.business_id = ${business.id}
    `,
    sql`
      SELECT s.name, COUNT(*) AS total
      FROM appointments a
      JOIN services s ON s.id = a.service_id
      WHERE a.business_id = ${business.id} AND a.status != 'canceled'
      GROUP BY s.name
      ORDER BY total DESC
      LIMIT 5
    `,
    sql`
      SELECT p.name, COUNT(*) AS total
      FROM appointments a
      JOIN professionals p ON p.id = a.professional_id
      WHERE a.business_id = ${business.id} AND a.status != 'canceled'
      GROUP BY p.name
      ORDER BY total DESC
      LIMIT 5
    `,
    sql`
      SELECT
        TO_CHAR(scheduled_date, 'YYYY-MM') AS month,
        COUNT(*)                            AS total,
        COUNT(*) FILTER (WHERE status = 'completed') AS completed
      FROM appointments
      WHERE business_id = ${business.id}
        AND scheduled_date >= NOW() - INTERVAL '6 months'
      GROUP BY month
      ORDER BY month ASC
    `,
    sql`SELECT COUNT(*) AS total FROM customers WHERE business_id = ${business.id}`,
  ])

  const t = totals[0]
  const totalAppts = Number(t?.total ?? 0)
  const completedAppts = Number(t?.completed ?? 0)
  const canceledAppts = Number(t?.canceled ?? 0)
  const revenue = Number(t?.revenue ?? 0)
  const conclusionRate = totalAppts > 0 ? Math.round((completedAppts / totalAppts) * 100) : 0
  const clients = Number(totalClients[0]?.total ?? 0)

  const topService = topServices[0]
  const topProfessional = topProfessionals[0]

  return (
    <div className="p-4 md:p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
        <p className="text-gray-500 text-sm mt-1">Visão geral do desempenho do negócio</p>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <MetricCard
          label="Total de agendamentos"
          value={String(totalAppts)}
          icon={TrendingUp}
          color="bg-blue-50 text-blue-600"
        />
        <MetricCard
          label="Receita gerada"
          value={formatCurrency(revenue)}
          sub="agendamentos concluídos"
          icon={DollarSign}
          color="bg-green-50 text-green-600"
        />
        <MetricCard
          label="Taxa de conclusão"
          value={`${conclusionRate}%`}
          sub={`${completedAppts} de ${totalAppts} agendamentos`}
          icon={CheckCircle}
          color="bg-emerald-50 text-emerald-600"
        />
        <MetricCard
          label="Clientes cadastrados"
          value={String(clients)}
          icon={Users}
          color="bg-purple-50 text-purple-600"
        />
        <MetricCard
          label="Serviço mais popular"
          value={topService ? String(topService.name) : '—'}
          sub={topService ? `${topService.total} agendamentos` : undefined}
          icon={Scissors}
          color="bg-orange-50 text-orange-600"
        />
        <MetricCard
          label="Profissional mais solicitado"
          value={topProfessional ? String(topProfessional.name) : '—'}
          sub={topProfessional ? `${topProfessional.total} agendamentos` : undefined}
          icon={UserCheck}
          color="bg-pink-50 text-pink-600"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Agendamentos por mês */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Agendamentos por mês</h2>
          {byMonth.length === 0 ? (
            <p className="text-sm text-gray-400">Nenhum agendamento ainda.</p>
          ) : (
            <div className="space-y-3">
              {byMonth.map((row) => {
                const monthStr = row.month instanceof Date ? row.month.toISOString().slice(0, 7) : String(row.month)
                const [year, month] = monthStr.split('-')
                const label = `${MONTH_NAMES[parseInt(month) - 1]} ${year}`
                const total = Number(row.total)
                const completed = Number(row.completed)
                const pct = total > 0 ? Math.round((completed / total) * 100) : 0
                return (
                  <div key={String(row.month)}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600">{label}</span>
                      <span className="text-gray-900 font-medium">{total} agendamentos</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div
                        className="bg-green-500 h-1.5 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{completed} concluídos ({pct}%)</p>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Serviços */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Serviços mais solicitados</h2>
          {topServices.length === 0 ? (
            <p className="text-sm text-gray-400">Nenhum agendamento ainda.</p>
          ) : (
            <div className="space-y-3">
              {topServices.map((s, i) => {
                const max = Number(topServices[0].total)
                const pct = max > 0 ? Math.round((Number(s.total) / max) * 100) : 0
                return (
                  <div key={String(s.name)}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="flex items-center gap-2 text-gray-600">
                        <span className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-500">
                          {i + 1}
                        </span>
                        {s.name}
                      </span>
                      <span className="text-gray-900 font-medium">{s.total}x</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div
                        className="bg-blue-400 h-1.5 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Cancelados */}
      {canceledAppts > 0 && (
        <div className="mt-6 bg-red-50 border border-red-100 rounded-2xl px-5 py-4">
          <p className="text-sm text-red-700">
            <span className="font-semibold">{canceledAppts} agendamento{canceledAppts !== 1 ? 's' : ''} cancelado{canceledAppts !== 1 ? 's' : ''}</span>
            {' '}no total — {totalAppts > 0 ? Math.round((canceledAppts / totalAppts) * 100) : 0}% dos agendamentos.
          </p>
        </div>
      )}
    </div>
  )
}
