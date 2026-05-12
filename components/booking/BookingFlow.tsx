'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, Check, Clock } from 'lucide-react'
import { Business, Service } from '@/types'
import { getAvailableSlots, createAppointment } from '@/app/actions/booking'
import { formatCurrency } from '@/lib/utils'
import BusinessLanding from '@/components/booking/BusinessLanding'

type Availability = { day_of_week: number; start_time: string; end_time: string }

type Professional = {
  id: string
  name: string
  role: string | null
  photo_url?: string | null
  service_ids: string[]
  availability: Availability[]
}

type Step = 1 | 2 | 3 | 4 | 5

const STEP_LABELS = ['Serviços', 'Profissional', 'Data', 'Horário', 'Seus dados']
const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
const WEEKDAYS_SHORT = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']
const WEEKDAYS_LONG = ['domingo','segunda','terça','quarta','quinta','sexta','sábado']

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 2) return `(${digits}`
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

function formatDatePT(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00')
  return `${WEEKDAYS_LONG[d.getDay()]}, ${d.getDate()} de ${MONTHS[d.getMonth()].toLowerCase()} de ${d.getFullYear()}`
}

function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}min` : `${h}h`
}

// ── Step indicator ──────────────────────────────────────────────────────────

function StepIndicator({ step }: { step: Step }) {
  return (
    <div className="flex items-center justify-center gap-1 mb-8">
      {STEP_LABELS.map((label, i) => {
        const num = i + 1
        const done = step > num
        const active = step === num
        return (
          <div key={label} className="flex items-center gap-1">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              done ? 'bg-green-500 text-white' : active ? 'bg-green-50 text-green-700 border border-green-300' : 'bg-gray-100 text-gray-400'
            }`}>
              {done ? <Check className="w-3 h-3" /> : <span>{num}</span>}
              <span className="hidden sm:inline">{label}</span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div className={`w-4 h-px ${step > num ? 'bg-green-400' : 'bg-gray-200'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Calendar ────────────────────────────────────────────────────────────────

function Calendar({
  availableDays,
  selected,
  onSelect,
}: {
  availableDays: number[]
  selected: string | null
  onSelect: (date: string) => void
}) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const [view, setView] = useState(new Date(today.getFullYear(), today.getMonth(), 1))

  const year = view.getFullYear()
  const month = view.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  function toDateStr(day: number) {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  function isAvailable(day: number) {
    const d = new Date(year, month, day)
    if (d < today) return false
    return availableDays.includes(d.getDay())
  }

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setView(new Date(year, month - 1, 1))}
          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-4 h-4 text-gray-600" />
        </button>
        <span className="text-sm font-semibold text-gray-900">
          {MONTHS[month]} {year}
        </span>
        <button
          onClick={() => setView(new Date(year, month + 1, 1))}
          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronRight className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      <div className="grid grid-cols-7 mb-2">
        {WEEKDAYS_SHORT.map((d) => (
          <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((day, i) => {
          if (!day) return <div key={i} />
          const ds = toDateStr(day)
          const avail = isAvailable(day)
          const sel = selected === ds
          return (
            <button
              key={i}
              disabled={!avail}
              onClick={() => onSelect(ds)}
              className={`h-9 w-full rounded-xl text-sm font-medium transition-colors
                ${sel ? 'bg-green-500 text-white' : ''}
                ${avail && !sel ? 'hover:bg-green-50 text-gray-900' : ''}
                ${!avail ? 'text-gray-300 cursor-not-allowed' : ''}
              `}
            >
              {day}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── Main component ──────────────────────────────────────────────────────────

export default function BookingFlow({
  business,
  services,
  professionals,
}: {
  business: Business
  services: Service[]
  professionals: Professional[]
}) {
  const router = useRouter()
  const [showLanding, setShowLanding] = useState(true)
  const [step, setStep] = useState<Step>(1)
  const [selectedServices, setSelectedServices] = useState<Service[]>([])
  const [professional, setProfessional] = useState<Professional | null>(null)
  const [date, setDate] = useState<string | null>(null)
  const [time, setTime] = useState<string | null>(null)
  const [slots, setSlots] = useState<string[]>([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [name, setName] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string>()

  const totalDuration = selectedServices.reduce((sum, s) => sum + s.duration_minutes, 0)
  const totalPrice = selectedServices.reduce((sum, s) => sum + Number(s.price ?? 0), 0)
  const hasPrice = selectedServices.some((s) => s.price != null)

  function toggleService(service: Service) {
    setSelectedServices((prev) =>
      prev.find((s) => s.id === service.id)
        ? prev.filter((s) => s.id !== service.id)
        : [...prev, service]
    )
  }

  function handleLandingBook(preSelected?: Service) {
    if (preSelected) {
      setSelectedServices([preSelected])
      setStep(2)
    } else {
      setSelectedServices([])
      setStep(1)
    }
    setShowLanding(false)
  }

  if (showLanding) {
    return (
      <BusinessLanding
        business={business}
        services={services}
        professionals={professionals}
        onBook={handleLandingBook}
      />
    )
  }

  // Filter professionals who can perform ALL selected services
  const availableProfessionals = professionals.filter((p) =>
    selectedServices.every((s) => p.service_ids.includes(s.id))
  )

  const availableDays = professional?.availability.map((a) => a.day_of_week) ?? []

  async function handleDateSelect(d: string) {
    setDate(d)
    setTime(null)
    setSlotsLoading(true)
    const result = await getAvailableSlots(professional!.id, d, totalDuration)
    setSlots(result)
    setSlotsLoading(false)
    setStep(4)
  }

  async function handleConfirm() {
    if (!selectedServices.length || !professional || !date || !time || !name || !whatsapp) return
    setSubmitting(true)
    setSubmitError(undefined)
    const result = await createAppointment({
      businessId: business.id,
      professionalId: professional.id,
      services: selectedServices.map((s) => ({ id: s.id, durationMinutes: s.duration_minutes })),
      date,
      startTime: time,
      customerName: name,
      customerWhatsapp: whatsapp,
    })
    if (result.error) {
      setSubmitError(result.error)
      setSubmitting(false)
    } else {
      const params = new URLSearchParams({
        service: selectedServices.map((s) => s.name).join(', '),
        professional: professional.name,
        date,
        time,
        customer: name,
        negocio: business.name,
      })
      router.push(`/booking/${business.slug}/sucesso?${params.toString()}`)
    }
  }

  function goBack() {
    if (step > 1) setStep((prev) => (prev - 1) as Step)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <span className="font-bold text-gray-900">{business.name}</span>
          {business.type && (
            <span className="text-xs text-gray-400 capitalize">{
              business.type === 'barbershop' ? 'Barbearia' :
              business.type === 'salon' ? 'Salão' : 'Clínica'
            }</span>
          )}
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-8">
        <StepIndicator step={step} />

        {/* Step 1 — Serviços (multi-select) */}
        {step === 1 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Escolha os serviços</h2>
            <p className="text-sm text-gray-500 mb-5">Selecione um ou mais serviços</p>
            {services.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
                <p className="text-gray-500 text-sm">Nenhum serviço disponível no momento.</p>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {services.map((s) => {
                    const selected = !!selectedServices.find((x) => x.id === s.id)
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => toggleService(s)}
                        className={`w-full rounded-2xl border p-5 text-left transition-all ${
                          selected
                            ? 'border-green-400 bg-green-50 shadow-sm'
                            : 'border-gray-200 bg-white hover:border-green-300 hover:shadow-sm'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                            selected ? 'border-green-500 bg-green-500' : 'border-gray-300'
                          }`}>
                            {selected && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <div className="flex-1">
                            <p className={`font-medium transition-colors ${selected ? 'text-green-700' : 'text-gray-900'}`}>
                              {s.name}
                            </p>
                            {s.description && (
                              <p className="text-sm text-gray-400 mt-0.5">{s.description}</p>
                            )}
                            <div className="flex items-center gap-3 mt-2">
                              <span className="flex items-center gap-1 text-xs text-gray-500">
                                <Clock className="w-3 h-3" />
                                {formatDuration(s.duration_minutes)}
                              </span>
                              {s.price != null && (
                                <span className="text-xs font-medium text-gray-700">
                                  {formatCurrency(s.price)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>

                {/* Summary bar + continue button */}
                {selectedServices.length > 0 && (
                  <div className="mt-5 bg-white rounded-2xl border border-green-200 p-4 flex items-center justify-between gap-4">
                    <div className="text-sm text-gray-600">
                      <span className="font-semibold text-gray-900">{selectedServices.length} serviço{selectedServices.length > 1 ? 's' : ''}</span>
                      <span className="text-gray-400 mx-1.5">·</span>
                      <span>{formatDuration(totalDuration)}</span>
                      {hasPrice && (
                        <>
                          <span className="text-gray-400 mx-1.5">·</span>
                          <span className="font-medium text-green-700">{formatCurrency(totalPrice)}</span>
                        </>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setProfessional(null)
                        setDate(null)
                        setTime(null)
                        setStep(2)
                      }}
                      className="bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-colors shrink-0"
                    >
                      Continuar
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Step 2 — Profissional */}
        {step === 2 && (
          <div>
            <button onClick={goBack} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-5">
              <ChevronLeft className="w-4 h-4" /> Voltar
            </button>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Escolha o profissional</h2>
            <p className="text-sm text-gray-500 mb-5">
              Para: <strong>{selectedServices.map((s) => s.name).join(', ')}</strong>
            </p>
            {availableProfessionals.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
                <p className="text-gray-500 text-sm">Nenhum profissional disponível para a combinação de serviços selecionada.</p>
                <button onClick={goBack} className="mt-3 text-green-600 text-sm font-medium hover:text-green-700">
                  Ajustar serviços
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {availableProfessionals.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setProfessional(p)
                      setDate(null)
                      setTime(null)
                      setStep(3)
                    }}
                    className="w-full bg-white rounded-2xl border border-gray-200 p-5 text-left hover:border-green-300 hover:shadow-sm transition-all group flex items-center gap-4"
                  >
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0 overflow-hidden">
                      {p.photo_url ? (
                        <img src={p.photo_url} alt={p.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-green-700 font-semibold text-sm">
                          {p.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 group-hover:text-green-700 transition-colors">
                        {p.name}
                      </p>
                      {p.role && <p className="text-sm text-gray-400">{p.role}</p>}
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-green-500 transition-colors" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 3 — Data */}
        {step === 3 && (
          <div>
            <button onClick={goBack} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-5">
              <ChevronLeft className="w-4 h-4" /> Voltar
            </button>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Escolha a data</h2>
            <p className="text-sm text-gray-500 mb-5">Com <strong>{professional?.name}</strong></p>
            {availableDays.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
                <p className="text-gray-500 text-sm">Este profissional não tem dias disponíveis cadastrados.</p>
              </div>
            ) : (
              <Calendar availableDays={availableDays} selected={date} onSelect={handleDateSelect} />
            )}
            {slotsLoading && (
              <p className="text-center text-sm text-gray-400 mt-4">Buscando horários...</p>
            )}
          </div>
        )}

        {/* Step 4 — Horário */}
        {step === 4 && (
          <div>
            <button onClick={goBack} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-5">
              <ChevronLeft className="w-4 h-4" /> Voltar
            </button>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Escolha o horário</h2>
            <p className="text-sm text-gray-500 mb-5">{date ? formatDatePT(date) : ''}</p>
            {slots.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
                <p className="text-gray-600 font-medium">Nenhum horário disponível</p>
                <p className="text-sm text-gray-400 mt-1">Tente outro dia.</p>
                <button
                  onClick={() => setStep(3)}
                  className="mt-4 text-green-600 text-sm font-medium hover:text-green-700"
                >
                  Escolher outra data
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {slots.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => {
                      setTime(slot)
                      setStep(5)
                    }}
                    className={`py-3 rounded-xl text-sm font-medium border transition-colors ${
                      time === slot
                        ? 'bg-green-500 text-white border-green-500'
                        : 'border-gray-200 text-gray-700 hover:border-green-300 hover:bg-green-50'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 5 — Dados + Confirmação */}
        {step === 5 && (
          <div>
            <button onClick={goBack} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-5">
              <ChevronLeft className="w-4 h-4" /> Voltar
            </button>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Seus dados</h2>
            <p className="text-sm text-gray-500 mb-5">Quase lá! Preencha para confirmar.</p>

            {/* Resumo */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-5 space-y-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Resumo do agendamento</p>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">
                  {selectedServices.length === 1 ? 'Serviço' : 'Serviços'}
                </span>
                <span className="font-medium text-gray-900 text-right max-w-[60%]">
                  {selectedServices.map((s) => s.name).join(', ')}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Duração total</span>
                <span className="font-medium text-gray-900">{formatDuration(totalDuration)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Profissional</span>
                <span className="font-medium text-gray-900">{professional?.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Data</span>
                <span className="font-medium text-gray-900">{date ? formatDatePT(date) : ''}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Horário</span>
                <span className="font-medium text-gray-900">{time}</span>
              </div>
              {hasPrice && (
                <div className="flex justify-between text-sm pt-2 border-t border-gray-100">
                  <span className="text-gray-500">Total</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(totalPrice)}</span>
                </div>
              )}
            </div>

            {/* Form */}
            <div className="space-y-4">
              {submitError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                  {submitError}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Seu nome *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Como você se chama?"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">WhatsApp *</label>
                <input
                  type="tel"
                  required
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(formatPhone(e.target.value))}
                  placeholder="(11) 99999-9999"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={handleConfirm}
                disabled={submitting || !name || !whatsapp}
                className="w-full bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white font-semibold py-3.5 rounded-xl transition-colors text-sm mt-2"
              >
                {submitting ? 'Confirmando...' : 'Confirmar agendamento'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
