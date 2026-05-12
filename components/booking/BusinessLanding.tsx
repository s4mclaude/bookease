'use client'

import { Business, Service } from '@/types'
import { MapPin, Phone, Mail, Clock, ChevronRight, Calendar } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

type Professional = {
  id: string
  name: string
  role: string | null
  availability: { day_of_week: number; start_time: string; end_time: string }[]
}

const DAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

const TYPE_LABEL: Record<string, string> = {
  barbershop: 'Barbearia',
  salon: 'Salão de Beleza',
  clinic: 'Clínica',
}

function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}min` : `${h}h`
}

function computeHours(professionals: Professional[]) {
  const hours = new Map<number, { start: string; end: string }>()
  for (const prof of professionals) {
    for (const a of prof.availability) {
      const start = a.start_time.slice(0, 5)
      const end = a.end_time.slice(0, 5)
      const cur = hours.get(a.day_of_week)
      if (!cur) {
        hours.set(a.day_of_week, { start, end })
      } else {
        hours.set(a.day_of_week, {
          start: start < cur.start ? start : cur.start,
          end: end > cur.end ? end : cur.end,
        })
      }
    }
  }
  return hours
}

export default function BusinessLanding({
  business,
  services,
  professionals,
  onBook,
}: {
  business: Business
  services: Service[]
  professionals: Professional[]
  onBook: (service?: Service) => void
}) {
  const typeLabel = business.type ? (TYPE_LABEL[business.type] ?? '') : ''
  const hours = computeHours(professionals)
  const hasContact = business.address || business.phone || business.email

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-900">{business.name}</span>
            {typeLabel && (
              <span className="text-xs text-gray-400 hidden sm:inline">{typeLabel}</span>
            )}
          </div>
          <button
            onClick={() => onBook()}
            className="bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
          >
            Agendar agora
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-green-600 to-green-400 py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-md overflow-hidden">
            {business.logo_url ? (
              <img
                src={business.logo_url}
                alt={business.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-3xl font-bold text-green-600">
                {business.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <h1 className="text-3xl font-bold text-white">{business.name}</h1>
          {typeLabel && (
            <span className="inline-block mt-2 bg-white/20 text-white text-sm px-3 py-1 rounded-full">
              {typeLabel}
            </span>
          )}
          {business.description && (
            <p className="mt-4 text-white/80 text-base max-w-md mx-auto leading-relaxed">
              {business.description}
            </p>
          )}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-5">
            {business.address && (
              <span className="flex items-center gap-1.5 text-white/90 text-sm">
                <MapPin className="w-4 h-4 shrink-0" />
                {business.address}
              </span>
            )}
            {business.phone && (
              <span className="flex items-center gap-1.5 text-white/90 text-sm">
                <Phone className="w-4 h-4 shrink-0" />
                {business.phone}
              </span>
            )}
          </div>
          <button
            onClick={() => onBook()}
            className="mt-8 bg-white hover:bg-gray-50 text-green-600 font-semibold px-8 py-3.5 rounded-xl transition-colors inline-flex items-center gap-2 shadow-sm"
          >
            <Calendar className="w-4 h-4" />
            Agendar horário
          </button>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 py-12 space-y-12">

        {/* Serviços */}
        {services.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-5">Nossos serviços</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {services.map((s) => (
                <div
                  key={s.id}
                  className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm flex flex-col"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{s.name}</h3>
                    {s.price != null && (
                      <span className="text-green-600 font-semibold text-sm shrink-0 ml-2">
                        {formatCurrency(s.price)}
                      </span>
                    )}
                  </div>
                  {s.description && (
                    <p className="text-sm text-gray-500 mb-3 flex-1">{s.description}</p>
                  )}
                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock className="w-3 h-3" />
                      {formatDuration(s.duration_minutes)}
                    </span>
                    <button
                      onClick={() => onBook(s)}
                      className="text-sm text-green-600 font-medium hover:text-green-700 flex items-center gap-0.5 transition-colors"
                    >
                      Agendar <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Equipe */}
        {professionals.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-5">Nossa equipe</h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {professionals.map((p) => (
                <div
                  key={p.id}
                  className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm flex items-center gap-4"
                >
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center shrink-0 overflow-hidden">
                    {(p as any).photo_url ? (
                      <img src={(p as any).photo_url} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-green-700 font-bold text-lg">
                        {p.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{p.name}</p>
                    {p.role && <p className="text-sm text-gray-400">{p.role}</p>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Horário + Contato */}
        <div className="grid sm:grid-cols-2 gap-6">
          {hours.size > 0 && (
            <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-base font-bold text-gray-900 mb-4">Horário de funcionamento</h2>
              <div className="space-y-2">
                {Array.from({ length: 7 }, (_, i) => {
                  const day = hours.get(i)
                  return (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-gray-500">{DAYS[i]}</span>
                      {day ? (
                        <span className="font-medium text-gray-900">
                          {day.start} – {day.end}
                        </span>
                      ) : (
                        <span className="text-gray-300">Fechado</span>
                      )}
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          {hasContact && (
            <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-base font-bold text-gray-900 mb-4">Contato</h2>
              <div className="space-y-3">
                {business.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                    <span className="text-sm text-gray-600">{business.address}</span>
                  </div>
                )}
                {business.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="text-sm text-gray-600">{business.phone}</span>
                  </div>
                )}
                {business.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="text-sm text-gray-600">{business.email}</span>
                  </div>
                )}
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Footer CTA */}
      <div className="bg-white border-t border-gray-200 py-10">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <p className="text-gray-500 text-sm mb-4">Pronto para agendar?</p>
          <button
            onClick={() => onBook()}
            className="bg-green-500 hover:bg-green-600 text-white font-semibold px-8 py-3 rounded-xl transition-colors"
          >
            Agendar horário agora
          </button>
        </div>
      </div>

    </div>
  )
}
