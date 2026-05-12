import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import sql from '@/lib/db'
import Sidebar from '@/components/dashboard/Sidebar'
import ParticlesComponent from '@/components/ui/ParticlesComponent'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) redirect('/login')

  await sql`
    UPDATE businesses
    SET plan = 'free', plan_expires_at = NULL
    WHERE owner_id = ${userId}
      AND plan = 'pro'
      AND plan_expires_at IS NOT NULL
      AND plan_expires_at < NOW()
  `

  const businesses = await sql`SELECT slug, plan FROM businesses WHERE owner_id = ${userId} LIMIT 1`
  const slug = businesses[0]?.slug as string | undefined
  const plan = businesses[0]?.plan as string | undefined
  const email = session.user?.email ?? undefined

  return (
    <div className="min-h-screen flex relative">
      <ParticlesComponent />
      <Sidebar bookingSlug={slug} email={email} plan={plan} />
      <main className="flex-1 overflow-auto pt-14 md:pt-0 relative z-10">
        {children}
      </main>
    </div>
  )
}
