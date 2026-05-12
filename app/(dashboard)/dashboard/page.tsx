import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import sql from '@/lib/db'
import { Calendar, Users, Clock, TrendingUp } from 'lucide-react'

export default async function DashboardPage() {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) redirect('/login')

  const businesses = await sql`
    SELECT id, name FROM businesses WHERE owner_id = ${userId} LIMIT 1
  `
  const business = businesses[0]

  if (!business) {
    return (
      <div className="p-8">
        <p className="text-gray-500 dark:text-gray-400">Nenhum negócio encontrado.</p>
      </div>
    )
  }

  const today = new Date().toISOString().split('T')[0]

  const [todayRows, upcomingRows, clientRows, completedRows] = await Promise.all([
    sql`SELECT COUNT(*)::int AS count FROM appointments
        WHERE business_id = ${business.id} AND scheduled_date = ${today}
        AND status != 'canceled'`,
    sql`SELECT COUNT(*)::int AS count FROM appointments
        WHERE business_id = ${business.id} AND scheduled_date > ${today}
        AND status != 'canceled'`,
    sql`SELECT COUNT(*)::int AS count FROM customers
        WHERE business_id = ${business.id}`,
    sql`SELECT COUNT(*)::int AS count FROM appointments
        WHERE business_id = ${business.id} AND status = 'completed'`,
  ])

  const metrics = [
    { label: 'Agendamentos hoje', value: todayRows[0].count, icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/30' },
    { label: 'Próximos agendamentos', value: upcomingRows[0].count, icon: Clock, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/30' },
    { label: 'Total de clientes', value: clientRows[0].count, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/30' },
    { label: 'Atendimentos concluídos', value: completedRows[0].count, icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/30' },
  ]

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Visão geral</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{business.name}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {metrics.map((m) => (
          <div key={m.label} className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm dark:shadow-none">
            <div className={`w-10 h-10 ${m.bg} rounded-xl flex items-center justify-center mb-4`}>
              <m.icon className={`w-5 h-5 ${m.color}`} />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{m.value}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{m.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm dark:shadow-none">
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">Agendamentos de hoje</h2>
        {todayRows[0].count === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500">Nenhum agendamento para hoje.</p>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Você tem <span className="font-semibold text-gray-900 dark:text-gray-100">{todayRows[0].count}</span> agendamento(s) hoje.
          </p>
        )}
      </div>
    </div>
  )
}
