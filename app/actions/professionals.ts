'use server'

import { auth } from '@/auth'
import sql from '@/lib/db'
import { revalidatePath } from 'next/cache'

type Result = { error: string } | undefined

async function getBusiness(userId: string) {
  const rows = await sql<{ id: string; plan: string }>`
    SELECT id, plan FROM businesses WHERE owner_id = ${userId} LIMIT 1
  `
  return rows[0] as { id: string; plan: string } | undefined
}

export async function createProfessional(formData: FormData): Promise<Result> {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) return { error: 'Não autorizado.' }

  const business = await getBusiness(userId)
  if (!business) return { error: 'Negócio não encontrado.' }

  const businessId = business.id

  if (business.plan === 'free') {
    const countRows = await sql<{ count: string }>`
      SELECT COUNT(*) AS count FROM professionals WHERE business_id = ${businessId}
    `
    if (parseInt(countRows[0].count) >= 2) {
      return { error: 'Você atingiu o limite de 2 profissionais do plano gratuito. Faça upgrade para adicionar mais.' }
    }
  }

  const name = formData.get('name') as string
  const role = (formData.get('role') as string) || null
  const photo_url = (formData.get('photo_url') as string) || null
  if (!name) return { error: 'Preencha o nome do profissional.' }

  const created = await sql`
    INSERT INTO professionals (business_id, name, role, photo_url)
    VALUES (${businessId}, ${name}, ${role}, ${photo_url})
    RETURNING id
  `
  const profId = created[0].id as string

  const serviceIds = formData.getAll('service_ids') as string[]
  for (const serviceId of serviceIds) {
    await sql`
      INSERT INTO professional_services (professional_id, service_id)
      VALUES (${profId}, ${serviceId})
      ON CONFLICT DO NOTHING
    `
  }

  for (let day = 0; day < 7; day++) {
    const isChecked = formData.get(`day_${day}`) === 'on'
    const start = formData.get(`start_${day}`) as string
    const end = formData.get(`end_${day}`) as string
    if (isChecked && start && end) {
      await sql`
        INSERT INTO availability (professional_id, day_of_week, start_time, end_time, is_available)
        VALUES (${profId}, ${day}, ${start}, ${end}, true)
      `
    }
  }

  revalidatePath('/dashboard/profissionais')
}

export async function updateProfessional(id: string, formData: FormData): Promise<Result> {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) return { error: 'Não autorizado.' }

  const name = formData.get('name') as string
  const role = (formData.get('role') as string) || null
  const photo_url = (formData.get('photo_url') as string) || null
  if (!name) return { error: 'Preencha o nome do profissional.' }

  await sql`UPDATE professionals SET name = ${name}, role = ${role}, photo_url = ${photo_url} WHERE id = ${id}`

  await sql`DELETE FROM professional_services WHERE professional_id = ${id}`
  const serviceIds = formData.getAll('service_ids') as string[]
  for (const serviceId of serviceIds) {
    await sql`
      INSERT INTO professional_services (professional_id, service_id)
      VALUES (${id}, ${serviceId})
      ON CONFLICT DO NOTHING
    `
  }

  await sql`DELETE FROM availability WHERE professional_id = ${id}`
  for (let day = 0; day < 7; day++) {
    const isChecked = formData.get(`day_${day}`) === 'on'
    const start = formData.get(`start_${day}`) as string
    const end = formData.get(`end_${day}`) as string
    if (isChecked && start && end) {
      await sql`
        INSERT INTO availability (professional_id, day_of_week, start_time, end_time, is_available)
        VALUES (${id}, ${day}, ${start}, ${end}, true)
      `
    }
  }

  revalidatePath('/dashboard/profissionais')
}

export async function toggleProfessional(id: string): Promise<void> {
  await sql`UPDATE professionals SET is_active = NOT is_active WHERE id = ${id}`
  revalidatePath('/dashboard/profissionais')
}

export async function deleteProfessional(id: string): Promise<void> {
  await sql`DELETE FROM professionals WHERE id = ${id}`
  revalidatePath('/dashboard/profissionais')
}
