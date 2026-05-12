import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import sql from '@/lib/db'
import AdminClient from './AdminClient'

export default async function AdminPage() {
  const session = await auth()
  if (session?.user?.email !== process.env.ADMIN_EMAIL) redirect('/dashboard')

  await sql`
    UPDATE businesses
    SET plan = 'free', plan_expires_at = NULL
    WHERE plan = 'pro' AND plan_expires_at IS NOT NULL AND plan_expires_at < NOW()
  `

  const businesses = await sql`
    SELECT
      b.id,
      b.name                   AS business_name,
      b.slug,
      b.logo_url,
      b.plan,
      b.plan_expires_at::text  AS plan_expires_at,
      b.created_at,
      u.name                   AS owner_name,
      u.email                  AS owner_email,
      u.phone                  AS owner_phone,
      COALESCE(appt.total_appointments, 0)  AS total_appointments,
      COALESCE(appt.total_revenue, 0)       AS total_revenue,
      COALESCE(prof.total_professionals, 0) AS total_professionals,
      COALESCE(avail.has_availability, false) AS has_availability
    FROM businesses b
    JOIN users u ON u.id::text = b.owner_id::text
    LEFT JOIN (
      SELECT
        a.business_id,
        COUNT(a.id)                                                                      AS total_appointments,
        COALESCE(SUM(CASE WHEN a.status IN ('confirmed','completed') THEN sv.price ELSE 0 END), 0) AS total_revenue
      FROM appointments a
      LEFT JOIN services sv ON sv.id = a.service_id
      GROUP BY a.business_id
    ) appt ON appt.business_id = b.id
    LEFT JOIN (
      SELECT business_id, COUNT(*) AS total_professionals
      FROM professionals
      WHERE is_active = true
      GROUP BY business_id
    ) prof ON prof.business_id = b.id
    LEFT JOIN (
      SELECT DISTINCT pr.business_id, true AS has_availability
      FROM availability av
      JOIN professionals pr ON pr.id = av.professional_id
      WHERE av.is_available = true
    ) avail ON avail.business_id = b.id
    ORDER BY b.created_at DESC
  `

  return <AdminClient businesses={businesses as any} />
}
