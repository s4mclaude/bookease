import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import sql from '@/lib/db'
import ProfissionaisClient from '@/components/dashboard/ProfissionaisClient'
import { Service, Professional, Availability } from '@/types'

type ProfRow = Professional & {
  service_ids: string[]
  availability: Pick<Availability, 'day_of_week' | 'start_time' | 'end_time'>[]
}

export default async function ProfissionaisPage() {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) redirect('/login')

  const businesses = await sql`
    SELECT id FROM businesses WHERE owner_id = ${userId} LIMIT 1
  `
  const business = businesses[0]
  if (!business) redirect('/dashboard')

  const [profRows, serviceRows, psRows, availRows] = await Promise.all([
    sql<Professional>`
      SELECT * FROM professionals WHERE business_id = ${business.id} ORDER BY created_at ASC
    `,
    sql<Service>`
      SELECT * FROM services WHERE business_id = ${business.id} AND is_active = true ORDER BY name ASC
    `,
    sql<{ professional_id: string; service_id: string }>`
      SELECT ps.professional_id, ps.service_id
      FROM professional_services ps
      JOIN professionals p ON p.id = ps.professional_id
      WHERE p.business_id = ${business.id}
    `,
    sql<Pick<Availability, 'professional_id' | 'day_of_week' | 'start_time' | 'end_time'>>`
      SELECT a.professional_id, a.day_of_week, a.start_time, a.end_time
      FROM availability a
      JOIN professionals p ON p.id = a.professional_id
      WHERE p.business_id = ${business.id}
    `,
  ])

  const professionals: ProfRow[] = profRows.map((p) => ({
    ...p,
    service_ids: psRows.filter((ps) => ps.professional_id === p.id).map((ps) => ps.service_id),
    availability: availRows.filter((a) => a.professional_id === p.id),
  }))

  return <ProfissionaisClient professionals={professionals} services={serviceRows} />
}
