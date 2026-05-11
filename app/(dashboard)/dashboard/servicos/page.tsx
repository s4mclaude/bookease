import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Serviços',
}

// CRUD de serviços — implementada na Fase 5
export default function ServicosPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900">Serviços</h1>
      <p className="mt-2 text-gray-500">Gerenciar serviços — Fase 5</p>
    </div>
  )
}
