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
        COUNT(DISTINCT CASE WHEN a.status != 'canceled'
          THEN a.professional_id::text || a.scheduled_date::text END)   AS total_appointments,
        (MAX(a.scheduled_date) FILTER (WHERE a.status != 'canceled'))::text AS last_visit,
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
        MIN(a.id::text)                                                    AS id,
        a.customer_id::text,
        a.scheduled_date::text,
        MIN(a.start_time)::text                                            AS start_time,
        a.status,
        p.name                                                             AS professional_name,
        STRING_AGG(s.name, ' + ' ORDER BY a.start_time)                   AS service_name
      FROM appointments a
      JOIN services s ON s.id = a.service_id
      JOIN professionals p ON p.id = a.professional_id
      WHERE a.business_id = ${business.id}
      GROUP BY a.customer_id, a.professional_id, a.scheduled_date, a.status, p.name
      ORDER BY a.scheduled_date DESC
    `,
  ])

  return <ClientesClient customers={customers as any} appointments={appointments as any} />
}
