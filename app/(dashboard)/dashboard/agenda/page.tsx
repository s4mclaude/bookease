import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Agenda',
}

// Agendamentos por dia — implementada na Fase 7
export default function AgendaPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900">Agenda</h1>
      <p className="mt-2 text-gray-500">Visualização diária — Fase 7</p>
    </div>
  )
}
