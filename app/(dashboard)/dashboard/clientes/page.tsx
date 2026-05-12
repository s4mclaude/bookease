import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import sql from '@/lib/db'
import ClientesClient from '@/components/dashboard/ClientesClient'

export default async function ClientesPage() {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) redirect('/login')

  const businesses = await sql`SELECT id FROM businesses WHERE owner_id = ${userId} LIMIT 1`
  const business = businesses[0]
  if (!business) redirect('/dashboard')

  const [customers, appointments] = await Promise.all([
    sql`
      SELECT
        c.id,
        c.name,
        c.whatsapp,
        c.created_at,
        COUNT(a.id)    FILTER (WHERE a.status != 'canceled')  AS total_appointments,
        MAX(a.scheduled_date) FILTER (WHERE a.status != 'canceled') AS last_visit,
        COALESCE(SUM(s.price) FILTER (WHERE a.status = 'completed'), 0) AS total_spent
      FROM customers c
      LEFT JOIN appointments a ON a.customer_id = c.id
      LEFT JOIN services s ON s.id = a.service_id
      WHERE c.business_id = ${business.id}
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `,
    sql`
      SELECT
        a.id,
        a.customer_id,
        a.scheduled_date,
        a.start_time,
        a.status,
        s.name AS service_name,
        p.name AS professional_name
      FROM appointments a
      JOIN services s ON s.id = a.service_id
      JOIN professionals p ON p.id = a.professional_id
      WHERE a.business_id = ${business.id}
      ORDER BY a.scheduled_date DESC
    `,
  ])

  return <ClientesClient customers={customers as any} appointments={appointments as any} />
}
