import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Profissionais',
}

// CRUD de profissionais — implementada na Fase 5
export default function ProfissionaisPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900">Profissionais</h1>
      <p className="mt-2 text-gray-500">Gerenciar profissionais — Fase 5</p>
    </div>
  )
}
