'use server'

import { auth } from '@/auth'
import sql from '@/lib/db'
import { revalidatePath } from 'next/cache'

type Result = { error: string } | undefined

async function getBusinessId(userId: string) {
  const rows = await sql`SELECT id FROM businesses WHERE owner_id = ${userId} LIMIT 1`
  return rows[0]?.id as string | undefined
}

export async function createService(formData: FormData): Promise<Result> {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) return { error: 'Não autorizado.' }

  const businessId = await getBusinessId(userId)
  if (!businessId) return { error: 'Negócio não encontrado.' }

  const name = formData.get('name') as string
  const description = (formData.get('description') as string) || null
  const price = formData.get('price') ? parseFloat(formData.get('price') as string) : null
  const duration = parseInt(formData.get('duration_minutes') as string)

  if (!name || !duration) return { error: 'Preencha os campos obrigatórios.' }

  await sql`
    INSERT INTO services (business_id, name, description, price, duration_minutes)
    VALUES (${businessId}, ${name}, ${description}, ${price}, ${duration})
  `
  revalidatePath('/dashboard/servicos')
}

export async function updateService(id: string, formData: FormData): Promise<Result> {
  const session = await auth()
  if (!session) return { error: 'Não autorizado.' }

  const name = formData.get('name') as string
  const description = (formData.get('description') as string) || null
  const price = formData.get('price') ? parseFloat(formData.get('price') as string) : null
  const duration = parseInt(formData.get('duration_minutes') as string)

  if (!name || !duration) return { error: 'Preencha os campos obrigatórios.' }

  await sql`
    UPDATE services
    SET name = ${name}, description = ${description}, price = ${price}, duration_minutes = ${duration}
    WHERE id = ${id}
  `
  revalidatePath('/dashboard/servicos')
}

export async function toggleService(id: string): Promise<void> {
  await sql`UPDATE services SET is_active = NOT is_active WHERE id = ${id}`
  revalidatePath('/dashboard/servicos')
}

export async function deleteService(id: string): Promise<void> {
  await sql`DELETE FROM services WHERE id = ${id}`
  revalidatePath('/dashboard/servicos')
}
