import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import sql from '@/lib/db'
import { Business } from '@/types'
import ConfiguracoesClient from '@/components/dashboard/ConfiguracoesClient'

export default async function ConfiguracoesPage() {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) redirect('/login')

  const rows = await sql<Business>`
    SELECT * FROM businesses WHERE owner_id = ${userId} LIMIT 1
  `
  const business = rows[0]
  if (!business) redirect('/dashboard')

  return (
    <div className="p-4 md:p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-500 text-sm mt-1">Gerencie as informações do seu negócio</p>
      </div>
      <ConfiguracoesClient business={business} />
    </div>
  )
}
