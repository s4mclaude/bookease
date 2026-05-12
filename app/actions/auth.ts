'use server'

import { signIn, signOut } from '@/auth'
import { AuthError } from 'next-auth'
import bcrypt from 'bcryptjs'
import sql from '@/lib/db'
import { generateSlug } from '@/lib/utils'

type ActionState = { error: string } | undefined

export async function logout() {
  await signOut({ redirectTo: '/' })
}

export async function login(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    await signIn('credentials', {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      redirectTo: '/dashboard',
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: 'E-mail ou senha incorretos.' }
    }
    throw error
  }
}

export async function register(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const phone = (formData.get('phone') as string)?.trim() || null
  if (!phone) return { error: 'O telefone é obrigatório.' }
  const businessName = formData.get('businessName') as string
  const businessType = formData.get('businessType') as string

  try {
    const existing = await sql`SELECT id FROM users WHERE email = ${email}`
    if (existing.length > 0) {
      return { error: 'Já existe uma conta com esse e-mail.' }
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const created = await sql`
      INSERT INTO users (email, password, name, phone)
      VALUES (${email}, ${hashedPassword}, ${name}, ${phone})
      RETURNING id
    `
    const userId = created[0].id

    let slug = generateSlug(businessName)
    const slugExists = await sql`SELECT id FROM businesses WHERE slug = ${slug}`
    if (slugExists.length > 0) {
      slug = `${slug}-${Math.random().toString(36).substring(2, 6)}`
    }

    await sql`
      INSERT INTO businesses (owner_id, name, slug, type)
      VALUES (${userId}, ${businessName}, ${slug}, ${businessType || null})
    `

    await signIn('credentials', {
      email,
      password,
      redirectTo: '/dashboard',
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: 'Erro ao criar conta. Tente novamente.' }
    }
    throw error
  }
}
