'use server'

import { auth } from '@/auth'
import sql from '@/lib/db'
import { revalidatePath } from 'next/cache'

async function assertAdmin() {
  const session = await auth()
  if (session?.user?.email !== process.env.ADMIN_EMAIL) {
    throw new Error('Não autorizado.')
  }
}

export async function updateBusinessPlan(
  businessId: string,
  plan: 'free' | 'pro'
): Promise<{ error?: string }> {
  try {
    await assertAdmin()
    if (plan === 'pro') {
      await sql`
        UPDATE businesses
        SET plan = 'pro', plan_expires_at = NOW() + INTERVAL '30 days'
        WHERE id = ${businessId}
      `
    } else {
      await sql`
        UPDATE businesses
        SET plan = 'free', plan_expires_at = NULL
        WHERE id = ${businessId}
      `
    }
    revalidatePath('/admin')
    return {}
  } catch {
    return { error: 'Não autorizado.' }
  }
}
