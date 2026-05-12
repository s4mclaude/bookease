'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Calendar, Scissors, Users, UserCheck,
  BarChart3, Settings, LogOut, ExternalLink, Menu, X, Sun, Moon,
} from 'lucide-react'
import { logout } from '@/app/actions/auth'
import { getMyPlan } from '@/app/actions/plan'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Visão geral', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/agenda', label: 'Agenda', icon: Calendar },
  { href: '/dashboard/servicos', label: 'Serviços', icon: Scissors },
  { href: '/dashboard/profissionais', label: 'Profissionais', icon: Users },
  { href: '/dashboard/clientes', label: 'Clientes', icon: UserCheck },
  { href: '/dashboard/relatorios', label: 'Relatórios', icon: BarChart3 },
  { href: '/dashboard/configuracoes', label: 'Configurações', icon: Settings },
]

export default function Sidebar({
  bookingSlug,
  email,
  plan,
}: {
  bookingSlug?: string
  email?: string
  plan?: string
}) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [dark, setDark] = useState(false)
  const [planState, setPlanState] = useState(plan)

  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'))
  }, [])

  useEffect(() => {
    async function refresh() {
      const latest = await getMyPlan()
      if (latest !== null) setPlanState(latest)
    }

    const interval = setInterval(refresh, 15_000)
    window.addEventListener('focus', refresh)
    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', refresh)
    }
  }, [])

  function toggleTheme() {
    const html = document.documentElement
    if (html.classList.contains('dark')) {
      html.classList.remove('dark')
      localStorage.setItem('theme', 'light')
      setDark(false)
    } else {
      html.classList.add('dark')
      localStorage.setItem('theme', 'dark')
      setDark(true)
    }
  }

  function isActive(href: string, exact?: boolean) {
    return exact ? pathname === href : pathname.startsWith(href)
  }

  function close() { setOpen(false) }

  return (
    <>
      {/* Mobile top bar */}
      <div className="fixed top-0 left-0 right-0 h-14 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center px-4 gap-3 md:hidden z-40">
        <button
          onClick={() => setOpen(true)}
          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          aria-label="Abrir menu"
        >
          <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        </button>
        <span className="font-bold text-gray-900 dark:text-white">BookEase</span>
      </div>

      {open && <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={close} />}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col
        transform transition-transform duration-200 ease-in-out
        md:static md:translate-x-0 md:h-screen md:sticky md:top-0
        ${open ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Header */}
        <div className="p-5 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <Link href="/dashboard" className="text-xl font-bold text-gray-900 dark:text-white" onClick={close}>
              BookEase
            </Link>
            <div className="flex items-center gap-1">
              <button
                onClick={toggleTheme}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                aria-label="Alternar tema"
              >
                {dark
                  ? <Sun className="w-4 h-4 text-gray-400 dark:text-gray-400" />
                  : <Moon className="w-4 h-4 text-gray-500" />
                }
              </button>
              <button
                onClick={close}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors md:hidden"
                aria-label="Fechar menu"
              >
                <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
          </div>

          {email && (
            <div className="flex items-center gap-2 min-w-0">
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate flex-1">{email}</p>
              {planState === 'pro' ? (
                <span className="shrink-0 text-xs font-semibold px-1.5 py-0.5 rounded-md bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400">
                  Pro
                </span>
              ) : (
                <span className="shrink-0 text-xs font-semibold px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  Free
                </span>
              )}
            </div>
          )}
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href, item.exact)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={close}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  active
                    ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                <item.icon className={`w-4 h-4 shrink-0 ${active ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}`} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-1">
          {bookingSlug && (
            <Link
              href={`/booking/${bookingSlug}`}
              target="_blank"
              onClick={close}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
            >
              <ExternalLink className="w-4 h-4 shrink-0" />
              Minha página pública
            </Link>
          )}
          <form action={logout}>
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              <LogOut className="w-4 h-4 shrink-0 text-gray-400 dark:text-gray-500" />
              Sair
            </button>
          </form>
        </div>
      </aside>
    </>
  )
}
