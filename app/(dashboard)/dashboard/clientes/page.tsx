import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Clientes',
}

// Lista de clientes — implementada na Fase 7
export default function ClientesPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
      <p className="mt-2 text-gray-500">Histórico de clientes — Fase 7</p>
    </div>
  )
}
