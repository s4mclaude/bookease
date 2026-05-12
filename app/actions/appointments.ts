'use server'

import { auth } from '@/auth'
import sql from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { AppointmentStatus } from '@/types'

export async function updateAppointmentStatus(
  appointmentId: string,
  status: AppointmentStatus
): Promise<{ error?: string }> {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) return { error: 'Não autorizado.' }

  await sql`
    UPDATE appointments
    SET status = ${status}
    WHERE id = ${appointmentId}
    AND business_id = (
      SELECT id FROM businesses WHERE owner_id = ${userId} LIMIT 1
    )
  `

  revalidatePath('/dashboard/agenda')
  return {}
}

export async function deleteAppointment(
  appointmentId: string
): Promise<{ error?: string }> {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) return { error: 'Não autorizado.' }

  await sql`
    DELETE FROM appointments
    WHERE id = ${appointmentId}
    AND business_id = (
      SELECT id FROM businesses WHERE owner_id = ${userId} LIMIT 1
    )
  `

  revalidatePath('/dashboard/agenda')
  return {}
}
