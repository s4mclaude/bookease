import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Agendamento confirmado',
}

// Tela de sucesso após agendamento — implementada na Fase 6
export default function SucessoPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Agendamento confirmado!</h1>
        <p className="mt-2 text-gray-500">Tela de sucesso — Fase 6</p>
      </div>
    </main>
  )
}
