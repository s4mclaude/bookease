import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import sql from '@/lib/db'
import AgendaClient from '@/components/dashboard/AgendaClient'

type Props = {
  searchParams: Promise<{ data?: string }>
}

export default async function AgendaPage({ searchParams }: Props) {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) redirect('/login')

  const { data } = await searchParams
  const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/
  const date = data && ISO_DATE.test(data) ? data : new Date().toISOString().slice(0, 10)

  const business = await sql`
    SELECT id FROM businesses WHERE owner_id = ${userId} LIMIT 1
  `
  if (!business[0]) redirect('/dashboard')

  const [appointments, upcoming] = await Promise.all([
    sql`
      SELECT
        a.id,
        a.start_time,
        a.end_time,
        a.status,
        c.name     AS customer_name,
        c.whatsapp AS customer_whatsapp,
        p.name     AS professional_name,
        s.name     AS service_name,
        s.price    AS service_price
      FROM appointments a
      JOIN customers     c ON c.id = a.customer_id
      JOIN professionals p ON p.id = a.professional_id
      JOIN services      s ON s.id = a.service_id
      WHERE a.business_id = ${business[0].id}
        AND a.scheduled_date = ${date}
      ORDER BY a.start_time
    `,
    sql`
      SELECT
        a.id,
        a.scheduled_date,
        a.start_time,
        a.end_time,
        a.status,
        c.name     AS customer_name,
        c.whatsapp AS customer_whatsapp,
        p.name     AS professional_name,
        s.name     AS service_name,
        s.price    AS service_price
      FROM appointments a
      JOIN customers     c ON c.id = a.customer_id
      JOIN professionals p ON p.id = a.professional_id
      JOIN services      s ON s.id = a.service_id
      WHERE a.business_id = ${business[0].id}
        AND a.scheduled_date != ${date}
        AND a.status != 'canceled'
      ORDER BY a.scheduled_date, a.start_time
      LIMIT 50
    `,
  ])

  return (
    <div className="p-4 md:p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Agenda</h1>
        <p className="text-gray-500 text-sm mt-1">Gerencie os agendamentos do dia</p>
      </div>
      <AgendaClient
        appointments={appointments as any}
        upcoming={upcoming as any}
        date={date}
      />
    </div>
  )
}
