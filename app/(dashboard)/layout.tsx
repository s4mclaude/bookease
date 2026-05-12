import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import sql from '@/lib/db'
import Sidebar from '@/components/dashboard/Sidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) redirect('/login')

  const businesses = await sql`SELECT slug FROM businesses WHERE owner_id = ${userId} LIMIT 1`
  const slug = businesses[0]?.slug as string | undefined

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar bookingSlug={slug} />
      <main className="flex-1 overflow-auto pt-14 md:pt-0">
        {children}
      </main>
    </div>
  )
}
