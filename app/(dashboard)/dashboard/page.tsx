import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard',
}

// Visão geral com métricas — implementada na Fase 4
export default function DashboardPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      <p className="mt-2 text-gray-500">Métricas e resumo — Fase 4</p>
    </div>
  )
}
