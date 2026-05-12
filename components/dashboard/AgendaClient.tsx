'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, MessageCircle, Clock, CalendarDays, Trash2 } from 'lucide-react'
import { updateAppointmentStatus, deleteAppointment } from '@/app/actions/appointments'
import { AppointmentStatus } from '@/types'
import { formatCurrency } from '@/lib/utils'

type AppointmentRow = {
  id: string
  start_time: string
  end_time: string
  status: AppointmentStatus
  customer_name: string
  customer_whatsapp: string
  professional_name: string
  service_name: string
  service_price: number | null
}

type UpcomingRow = AppointmentRow & { scheduled_date: unknown }

const MONTHS = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro']
const MONTHS_SHORT = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez']
const WEEKDAYS = ['domingo','segunda-feira','terça-feira','quarta-feira','quinta-feira','sexta-feira','sábado']
const WEEKDAYS_SHORT = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']

const STATUS_LABEL: Record<AppointmentStatus, string> = {
  pending: 'Pendente',
  confirmed: 'Confirmado',
  completed: 'Concluído',
  canceled: 'Cancelado',
}

const STATUS_STYLE: Record<AppointmentStatus, string> = {
  pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
  completed: 'bg-green-50 text-green-700 border-green-200',
  canceled: 'bg-gray-100 text-gray-400 border-gray-200',
}

const NEXT_ACTIONS: Record<AppointmentStatus, { label: string; status: AppointmentStatus; style: string }[]> = {
  pending: [
    { label: 'Confirmar', status: 'confirmed', style: 'text-blue-600 hover:text-blue-700' },
    { label: 'Cancelar', status: 'canceled', style: 'text-red-400 hover:text-red-500' },
  ],
  confirmed: [
    { label: 'Concluir', status: 'completed', style: 'text-green-600 hover:text-green-700' },
    { label: 'Cancelar', status: 'canceled', style: 'text-red-400 hover:text-red-500' },
  ],
  completed: [],
  canceled: [],
}

const FILTER_LABELS: Record<AppointmentStatus | 'all', string> = {
  all: 'Todos',
  pending: 'Pendentes',
  confirmed: 'Confirmados',
  completed: 'Concluídos',
  canceled: 'Cancelados',
}

function toISODate(val: unknown): string {
  if (val instanceof Date) return val.toISOString().slice(0, 10)
  return String(val).slice(0, 10)
}

function formatDateHeader(dateStr: string) {
  const d = new Date(dateStr + 'T12:00:00')
  return `${WEEKDAYS[d.getDay()]}, ${d.getDate()} de ${MONTHS[d.getMonth()]} de ${d.getFullYear()}`
}

function formatDateShort(dateStr: string) {
  const d = new Date(dateStr + 'T12:00:00')
  return { day: d.getDate(), weekday: WEEKDAYS_SHORT[d.getDay()], month: MONTHS_SHORT[d.getMonth()] }
}

function offsetDate(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T12:00:00')
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

function isToday(dateStr: string): boolean {
  return dateStr === new Date().toISOString().slice(0, 10)
}

function buildWaUrl(first: AppointmentRow, group: AppointmentRow[], date: string): string {
  const last = group[group.length - 1]
  const message =
    `Olá, ${first.customer_name}! Seu agendamento está confirmado:\n\n` +
    `*Serviço(s):* ${group.map((a) => a.service_name).join(' + ')}\n` +
    `*Profissional:* ${first.professional_name}\n` +
    `*Data:* ${formatDateHeader(date)}\n` +
    `*Horário:* ${first.start_time.slice(0, 5)} – ${last.end_time.slice(0, 5)}\n\n` +
    `Até logo!`
  return `https://wa.me/55${first.customer_whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`
}

// Merge consecutive appointments of the same customer into booking groups
function mergeBookings(items: AppointmentRow[]): AppointmentRow[][] {
  const sorted = [...items].sort((a, b) => a.start_time.localeCompare(b.start_time))
  const groups: AppointmentRow[][] = []
  for (const apt of sorted) {
    const last = groups[groups.length - 1]
    if (last) {
      const prev = last[last.length - 1]
      if (
        prev.customer_whatsapp === apt.customer_whatsapp &&
        prev.end_time.slice(0, 5) === apt.start_time.slice(0, 5)
      ) {
        last.push(apt)
        continue
      }
    }
    groups.push([apt])
  }
  return groups
}

function groupByProfessional(rows: AppointmentRow[]): { name: string; bookings: AppointmentRow[][] }[] {
  const map = new Map<string, AppointmentRow[]>()
  for (const row of rows) {
    if (!map.has(row.professional_name)) map.set(row.professional_name, [])
    map.get(row.professional_name)!.push(row)
  }
  return Array.from(map.entries()).map(([name, items]) => ({ name, bookings: mergeBookings(items) }))
}

function groupUpcomingByProfessional(
  rows: UpcomingRow[]
): { name: string; dates: { date: string; bookings: AppointmentRow[][] }[] }[] {
  const profMap = new Map<string, UpcomingRow[]>()
  for (const row of rows) {
    if (!profMap.has(row.professional_name)) profMap.set(row.professional_name, [])
    profMap.get(row.professional_name)!.push(row)
  }
  return Array.from(profMap.entries()).map(([name, profRows]) => {
    const dateMap = new Map<string, AppointmentRow[]>()
    for (const row of profRows) {
      const key = toISODate(row.scheduled_date)
      if (!dateMap.has(key)) dateMap.set(key, [])
      dateMap.get(key)!.push(row as AppointmentRow)
    }
    const dates = Array.from(dateMap.entries()).map(([date, items]) => ({
      date,
      bookings: mergeBookings(items),
    }))
    return { name, dates }
  })
}

// ── Booking card ──────────────────────────────────────────────────────────────

function BookingCard({ group, date }: { group: AppointmentRow[]; date: string }) {
  const [isPending, startTransition] = useTransition()
  const first = group[0]
  const last = group[group.length - 1]
  const status = first.status
  const actions = NEXT_ACTIONS[status]
  const totalPrice = group.reduce((s, a) => s + Number(a.service_price ?? 0), 0)
  const hasPrice = group.some((a) => a.service_price != null)

  function changeStatus(newStatus: AppointmentStatus) {
    startTransition(async () => {
      for (const apt of group) await updateAppointmentStatus(apt.id, newStatus)
    })
  }

  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-4 shadow-sm transition-opacity ${isPending ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{first.customer_name}</p>
          <div className="mt-0.5 space-y-0.5">
            {group.map((apt) => (
              <p key={apt.id} className="text-xs text-gray-500 truncate">
                {apt.service_name}
              </p>
            ))}
          </div>
        </div>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full border shrink-0 ${STATUS_STYLE[status]}`}>
          {STATUS_LABEL[status]}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <Clock className="w-3 h-3" />
            {first.start_time.slice(0, 5)} – {last.end_time.slice(0, 5)}
          </span>
          {hasPrice && (
            <span className="text-xs text-gray-400">{formatCurrency(totalPrice)}</span>
          )}
        </div>
        <a
          href={buildWaUrl(first, group, date)}
          target="_blank"
          className="text-gray-300 hover:text-green-500 transition-colors"
          title="Enviar confirmação no WhatsApp"
        >
          <MessageCircle className="w-3.5 h-3.5" />
        </a>
      </div>

      {(actions.length > 0 || status === 'canceled') && (
        <div className="flex items-center gap-3 mt-3 pt-2 border-t border-gray-100">
          {actions.map((action) => (
            <button
              key={action.status}
              onClick={() => changeStatus(action.status)}
              disabled={isPending}
              className={`text-xs font-medium transition-colors ${action.style}`}
            >
              {action.label}
            </button>
          ))}
          {status === 'canceled' && (
            <button
              onClick={() => startTransition(async () => {
                for (const apt of group) await deleteAppointment(apt.id)
              })}
              disabled={isPending}
              className="text-gray-300 hover:text-red-500 transition-colors ml-auto"
              title="Excluir agendamento"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// ── Professional column ──────────────────────────────────────────────────────

function ProfessionalColumn({ name, bookings, date }: { name: string; bookings: AppointmentRow[][]; date: string }) {
  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center shrink-0">
          <span className="text-green-700 font-bold text-xs">{name.charAt(0).toUpperCase()}</span>
        </div>
        <span className="text-sm font-semibold text-gray-700 truncate">{name}</span>
        <span className="text-xs text-gray-400 shrink-0">{bookings.length}</span>
      </div>
      <div className="space-y-2">
        {bookings.map((group) => (
          <BookingCard key={group[0].id} group={group} date={date} />
        ))}
      </div>
    </div>
  )
}

// ── Main component ───────────────────────────────────────────────────────────

export default function AgendaClient({
  appointments,
  upcoming,
  date,
}: {
  appointments: AppointmentRow[]
  upcoming: UpcomingRow[]
  date: string
}) {
  const router = useRouter()
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | 'all'>('all')

  function navigate(days: number) {
    router.push(`/dashboard/agenda?data=${offsetDate(date, days)}`)
  }

  const statusCounts = {
    pending: appointments.filter((a) => a.status === 'pending').length,
    confirmed: appointments.filter((a) => a.status === 'confirmed').length,
    completed: appointments.filter((a) => a.status === 'completed').length,
    canceled: appointments.filter((a) => a.status === 'canceled').length,
  }

  const filteredAppointments =
    statusFilter === 'all' ? appointments : appointments.filter((a) => a.status === statusFilter)

  const byProfessional = groupByProfessional(filteredAppointments)
  const upcomingByProfessional = groupUpcomingByProfessional(upcoming)

  return (
    <div className="space-y-10">

      {/* ── Daily view ── */}
      <div>
        {/* Date navigator */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>
          <div className="flex-1 text-center">
            <p className="text-sm font-semibold text-gray-900 capitalize">{formatDateHeader(date)}</p>
          </div>
          <button onClick={() => navigate(1)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
          {!isToday(date) && (
            <button
              onClick={() => router.push('/dashboard/agenda')}
              className="text-xs font-medium text-green-600 hover:text-green-700 border border-green-200 px-3 py-1.5 rounded-lg transition-colors"
            >
              Hoje
            </button>
          )}
        </div>

        {/* Status filter chips */}
        {appointments.length > 0 && (
          <div className="flex items-center gap-2 mb-5 flex-wrap">
            {(['all', 'pending', 'confirmed', 'completed', 'canceled'] as const).map((f) => {
              const count = f === 'all' ? appointments.length : statusCounts[f]
              if (f !== 'all' && count === 0) return null
              return (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    statusFilter === f
                      ? 'bg-gray-800 text-white border-gray-800'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400 hover:text-gray-700'
                  }`}
                >
                  {FILTER_LABELS[f]} ({count})
                </button>
              )
            })}
          </div>
        )}

        {filteredAppointments.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center">
            <p className="text-gray-400 text-sm">
              {appointments.length === 0
                ? 'Nenhum agendamento para este dia.'
                : 'Nenhum agendamento com este status.'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-4 md:items-start">
            {byProfessional.map(({ name, bookings }) => (
              <ProfessionalColumn key={name} name={name} bookings={bookings} date={date} />
            ))}
          </div>
        )}
      </div>

      {/* ── Upcoming appointments — columns per professional ── */}
      {upcomingByProfessional.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-5">
            <CalendarDays className="w-4 h-4 text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-widest">
              Outros agendamentos
            </h2>
          </div>

          <div className="flex flex-col md:flex-row gap-4 md:items-start">
            {upcomingByProfessional.map(({ name, dates }) => (
              <div key={name} className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                    <span className="text-green-700 font-bold text-xs">{name.charAt(0).toUpperCase()}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-700">{name}</span>
                </div>

                <div className="space-y-4">
                  {dates.map(({ date: d, bookings }) => {
                    const { day, weekday, month } = formatDateShort(d)
                    return (
                      <div key={d}>
                        <button
                          onClick={() => router.push(`/dashboard/agenda?data=${d}`)}
                          className="flex items-center gap-2 mb-2 group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-green-50 border border-gray-200 group-hover:border-green-200 flex flex-col items-center justify-center transition-colors shrink-0">
                            <span className="text-xs text-gray-400 leading-none" style={{ fontSize: '9px' }}>{weekday}</span>
                            <span className="text-xs font-bold text-gray-900 leading-tight">{day}</span>
                          </div>
                          <span className="text-xs text-gray-400 group-hover:text-green-600 transition-colors capitalize">
                            {month}
                          </span>
                        </button>

                        <div className="space-y-2">
                          {bookings.map((group) => {
                            const first = group[0]
                            const waUrl = buildWaUrl(first, group, d)
                            return (
                              <div
                                key={first.id}
                                className="bg-white rounded-xl border border-gray-200 px-3 py-3 flex items-center gap-2"
                              >
                                <span className="text-xs font-semibold text-gray-900 shrink-0">
                                  {first.start_time.slice(0, 5)}
                                </span>
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm text-gray-900 truncate">{first.customer_name}</p>
                                  <p className="text-xs text-gray-400 truncate">
                                    {group.map((a) => a.service_name).join(' + ')}
                                  </p>
                                </div>
                                <a
                                  href={waUrl}
                                  target="_blank"
                                  className="text-gray-300 hover:text-green-500 transition-colors shrink-0"
                                  title="Enviar no WhatsApp"
                                >
                                  <MessageCircle className="w-3.5 h-3.5" />
                                </a>
                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full border shrink-0 ${STATUS_STYLE[first.status]}`}>
                                  {STATUS_LABEL[first.status]}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
