import { notFound } from 'next/navigation'
import sql from '@/lib/db'
import BookingFlow from '@/components/booking/BookingFlow'
import { Business, Service, Professional, Availability } from '@/types'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const rows = await sql`SELECT name FROM businesses WHERE slug = ${slug} LIMIT 1`
  return { title: rows[0] ? `Agendar — ${rows[0].name}` : 'Agendar' }
}

export default async function BookingPage({ params }: Props) {
  const { slug } = await params

  const businesses = await sql<Business>`SELECT * FROM businesses WHERE slug = ${slug} LIMIT 1`
  const business = businesses[0]
  if (!business) notFound()

  const [services, profRows, psRows, availRows] = await Promise.all([
    sql<Service>`
      SELECT * FROM services
      WHERE business_id = ${business.id} AND is_active = true
      ORDER BY name ASC
    `,
    sql<Professional>`
      SELECT * FROM professionals
      WHERE business_id = ${business.id} AND is_active = true
      ORDER BY name ASC
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
      WHERE p.business_id = ${business.id} AND a.is_available = true
    `,
  ])

  const professionals = profRows.map((p) => ({
    ...p,
    service_ids: psRows.filter((ps) => ps.professional_id === p.id).map((ps) => ps.service_id),
    availability: availRows.filter((a) => a.professional_id === p.id),
  }))

  return (
    <BookingFlow business={business} services={services} professionals={professionals} />
  )
}
