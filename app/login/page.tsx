import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Entrar',
}

// Página de login — implementada na Fase 3
export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Entrar no BookEase</h1>
        <p className="mt-2 text-gray-500">Autenticação — Fase 3</p>
      </div>
    </main>
  )
}
