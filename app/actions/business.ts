'use server'

import { auth } from '@/auth'
import sql from '@/lib/db'
import { revalidatePath } from 'next/cache'

type Result = { error: string } | undefined

export async function updateBusiness(formData: FormData): Promise<Result> {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) return { error: 'Não autorizado.' }

  const name = formData.get('name') as string
  const description = (formData.get('description') as string) || null
  const type = (formData.get('type') as string) || null
  const phone = (formData.get('phone') as string) || null
  const email = (formData.get('email') as string) || null
  const address = (formData.get('address') as string) || null
  const logo_url = (formData.get('logo_url') as string) || null

  if (!name) return { error: 'O nome do negócio é obrigatório.' }

  await sql`
    UPDATE businesses
    SET
      name        = ${name},
      description = ${description},
      type        = ${type},
      phone       = ${phone},
      email       = ${email},
      address     = ${address},
      logo_url    = ${logo_url}
    WHERE owner_id = ${userId}
  `

  revalidatePath('/dashboard/configuracoes')
  revalidatePath('/dashboard')
}
