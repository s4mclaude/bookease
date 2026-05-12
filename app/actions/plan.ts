'use server'

import { auth } from '@/auth'
import sql from '@/lib/db'

export async function getMyPlan(): Promise<string | null> {
  const session = await auth()
  if (!session?.user?.id) return null
  const rows = await sql`SELECT plan FROM businesses WHERE owner_id = ${session.user.id} LIMIT 1`
  return (rows[0]?.plan as string) ?? null
}
