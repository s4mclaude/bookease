import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import sql from '@/lib/db'
import ServicosClient from '@/components/dashboard/ServicosClient'
import { Service } from '@/types'

export default async function ServicosPage() {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) redirect('/login')

  const businesses = await sql`
    SELECT id FROM businesses WHERE owner_id = ${userId} LIMIT 1
  `
  const business = businesses[0]
  if (!business) redirect('/dashboard')

  const services = await sql<Service>`
    SELECT * FROM services WHERE business_id = ${business.id} ORDER BY created_at ASC
  `

  return <ServicosClient services={services} />
}
