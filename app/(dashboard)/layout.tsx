import { redirect } from 'next/navigation'
import { auth } from '@/auth'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar — implementada na Fase 4 */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <span className="text-xl font-bold text-gray-900">BookEase</span>
        </div>
        <nav className="flex-1 p-4">
          <p className="text-sm text-gray-400">Sidebar — Fase 4</p>
        </nav>
      </aside>

      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
