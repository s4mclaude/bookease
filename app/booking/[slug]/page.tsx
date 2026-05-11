import type { Metadata } from 'next'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  return {
    title: `Agendar — ${slug}`,
  }
}

// Fluxo público de agendamento — implementado na Fase 6
export default async function BookingPage({ params }: Props) {
  const { slug } = await params

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Agendar horário</h1>
        <p className="mt-2 text-gray-500">Empresa: {slug} — Fase 6</p>
      </div>
    </main>
  )
}
