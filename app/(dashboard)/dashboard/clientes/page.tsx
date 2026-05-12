import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import sql from '@/lib/db'
import { Phone, Calendar } from 'lucide-react'

const MONTHS = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez']

function formatDate(val: unknown) {
  const iso = val instanceof Date ? val.toISOString().slice(0, 10) : String(val).slice(0, 10)
  const d = new Date(iso + 'T12:00:00')
  return `${d.getDate()} de ${MONTHS[d.getMonth()]} de ${d.getFullYear()}`
}

export default async function ClientesPage() {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) redirect('/login')

  const business = await sql`
    SELECT id FROM businesses WHERE owner_id = ${userId} LIMIT 1
  `
  if (!business[0]) redirect('/dashboard')

  const customers = await sql`
    SELECT
      c.id,
      c.name,
      c.whatsapp,
      c.created_at,
      COUNT(a.id)              AS total_appointments,
      MAX(a.scheduled_date)    AS last_visit
    FROM customers c
    LEFT JOIN appointments a
      ON a.customer_id = c.id AND a.status != 'canceled'
    WHERE c.business_id = ${business[0].id}
    GROUP BY c.id
    ORDER BY c.created_at DESC
  `

  return (
    <div className="p-4 md:p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
        <p className="text-gray-500 text-sm mt-1">
          {customers.length} cliente{customers.length !== 1 ? 's' : ''} cadastrado{customers.length !== 1 ? 's' : ''}
        </p>
      </div>

      {customers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <p className="text-gray-400 text-sm">Nenhum cliente ainda.</p>
          <p className="text-gray-300 text-xs mt-1">Os clientes aparecem aqui após o primeiro agendamento.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {customers.map((c, i) => (
            <div
              key={c.id}
              className={`flex items-center gap-4 px-5 py-4 ${
                i !== customers.length - 1 ? 'border-b border-gray-100' : ''
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                <span className="text-green-700 font-semibold text-sm">
                  {String(c.name).charAt(0).toUpperCase()}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{c.name}</p>
                <a
                  href={`https://wa.me/55${String(c.whatsapp).replace(/\D/g, '')}`}
                  target="_blank"
                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-green-600 transition-colors mt-0.5 w-fit"
                >
                  <Phone className="w-3 h-3" />
                  {c.whatsapp}
                </a>
              </div>

              <div className="text-right shrink-0">
                <p className="text-sm font-semibold text-gray-900">
                  {Number(c.total_appointments)} agendamento{Number(c.total_appointments) !== 1 ? 's' : ''}
                </p>
                {c.last_visit && (
                  <p className="flex items-center gap-1 text-xs text-gray-400 mt-0.5 justify-end">
                    <Calendar className="w-3 h-3" />
                    última visita {formatDate(String(c.last_visit))}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
