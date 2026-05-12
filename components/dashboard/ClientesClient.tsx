'use client'

import { useState } from 'react'
import { Phone, Calendar, ChevronDown, ChevronUp } from 'lucide-react'

const MONTHS = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez']

function formatDate(val: unknown) {
  const d = val instanceof Date ? val : new Date(String(val).slice(0, 10) + 'T12:00:00')
  return `${d.getDate()} de ${MONTHS[d.getMonth()]} de ${d.getFullYear()}`
}

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  pending:   { label: 'Pendente',   className: 'bg-yellow-50 text-yellow-700' },
  confirmed: { label: 'Confirmado', className: 'bg-blue-50 text-blue-700' },
  completed: { label: 'Concluído',  className: 'bg-green-50 text-green-700' },
  canceled:  { label: 'Cancelado',  className: 'bg-gray-100 text-gray-500' },
}

type CustomerRow = {
  id: string
  name: string
  whatsapp: string
  total_appointments: string | number
  last_visit: string | null
  total_spent: string | number
}

type AppointmentRow = {
  id: string
  customer_id: string
  scheduled_date: string
  start_time: string
  status: string
  service_name: string
  professional_name: string
}

export default function ClientesClient({
  customers,
  appointments,
}: {
  customers: CustomerRow[]
  appointments: AppointmentRow[]
}) {
  const [expanded, setExpanded] = useState<string | null>(null)

  function toggle(id: string) {
    setExpanded((prev) => (prev === id ? null : id))
  }

  return (
    <div className="p-4 md:p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
        <p className="text-gray-500 text-sm mt-1">
          {customers.length} cliente{customers.length !== 1 ? 's' : ''} cadastrado{customers.length !== 1 ? 's' : ''}
        </p>
      </div>

      {customers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <p className="text-gray-400 text-sm">Nenhum cliente ainda.</p>
          <p className="text-gray-300 text-xs mt-1">Os clientes aparecem aqui após o primeiro agendamento.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {customers.map((c, i) => {
            const isExpanded = expanded === c.id
            const clientAppts = appointments.filter((a) => a.customer_id === c.id)
            const isLast = i === customers.length - 1

            return (
              <div key={c.id} className={!isLast ? 'border-b border-gray-100' : ''}>
                <button
                  onClick={() => toggle(c.id)}
                  className="w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                    <span className="text-green-700 font-semibold text-sm">
                      {c.name.charAt(0).toUpperCase()}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{c.name}</p>
                    <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                      <Phone className="w-3 h-3" />
                      {c.whatsapp}
                    </div>
                  </div>

                  <div className="text-right shrink-0 mr-2">
                    <p className="text-sm font-semibold text-gray-900">
                      {Number(c.total_appointments)} agendamento{Number(c.total_appointments) !== 1 ? 's' : ''}
                    </p>
                    {Number(c.total_spent) > 0 && (
                      <p className="text-xs text-green-600 font-medium mt-0.5">
                        R$ {Number(c.total_spent).toFixed(2).replace('.', ',')} gastos
                      </p>
                    )}
                    {c.last_visit && (
                      <p className="flex items-center gap-1 text-xs text-gray-400 mt-0.5 justify-end">
                        <Calendar className="w-3 h-3" />
                        {formatDate(String(c.last_visit))}
                      </p>
                    )}
                  </div>

                  {isExpanded
                    ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" />
                    : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                  }
                </button>

                {isExpanded && (
                  <div className="border-t border-gray-100 bg-gray-50 px-5 py-3">
                    {clientAppts.length === 0 ? (
                      <p className="text-xs text-gray-400 py-2">Nenhum agendamento registrado.</p>
                    ) : (
                      <div className="space-y-0 divide-y divide-gray-100">
                        {clientAppts.map((a) => {
                          const st = STATUS_LABELS[a.status] ?? { label: a.status, className: 'bg-gray-100 text-gray-500' }
                          return (
                            <div key={a.id} className="flex items-center gap-3 py-2.5">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-800">{a.service_name}</p>
                                <p className="text-xs text-gray-400 mt-0.5">
                                  com {a.professional_name} · {formatDate(String(a.scheduled_date))} às {a.start_time.slice(0, 5)}
                                </p>
                              </div>
                              <span className={`text-xs font-medium px-2 py-1 rounded-lg shrink-0 ${st.className}`}>
                                {st.label}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    )}

                    <a
                      href={`https://wa.me/55${c.whatsapp.replace(/\D/g, '')}`}
                      target="_blank"
                      className="inline-flex items-center gap-1.5 text-xs text-green-600 font-medium hover:text-green-700 transition-colors mt-3"
                    >
                      <Phone className="w-3 h-3" />
                      Enviar mensagem pelo WhatsApp
                    </a>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
