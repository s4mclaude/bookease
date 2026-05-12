import Link from 'next/link'
import { CheckCircle, MessageCircle } from 'lucide-react'

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{
    service?: string
    professional?: string
    date?: string
    time?: string
    customer?: string
    negocio?: string
  }>
}

const MONTHS = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro']
const WEEKDAYS = ['domingo','segunda','terça','quarta','quinta','sexta','sábado']

function formatDatePT(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00')
  return `${WEEKDAYS[d.getDay()]}, ${d.getDate()} de ${MONTHS[d.getMonth()]} de ${d.getFullYear()}`
}

export default async function SucessoPage({ params, searchParams }: Props) {
  const { slug } = await params
  const { service, professional, date, time, customer, negocio } = await searchParams

  const lines: string[] = []
  if (negocio) lines.push(`Agendamento confirmado em ${negocio}!`)
  else lines.push('Agendamento confirmado!')
  lines.push('')
  if (customer) lines.push(`Cliente: ${customer}`)
  if (service) lines.push(`Serviço(s): ${service}`)
  if (professional) lines.push(`Profissional: ${professional}`)
  if (date) lines.push(`Data: ${formatDatePT(date)}`)
  if (time) lines.push(`Horário: ${time}`)
  lines.push('')
  lines.push('Apresente esta mensagem na chegada.')
  const waMessage = encodeURIComponent(lines.join('\n'))

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">

        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900">Agendamento confirmado!</h1>
        <p className="text-gray-500 text-sm mt-2">
          Em breve entraremos em contato para confirmar.
        </p>

        {(service || professional || date || time) && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mt-8 text-left space-y-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Detalhes</p>
            {customer && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Nome</span>
                <span className="font-medium text-gray-900">{customer}</span>
              </div>
            )}
            {service && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{service.includes(',') ? 'Serviços' : 'Serviço'}</span>
                <span className="font-medium text-gray-900 text-right max-w-[60%]">{service}</span>
              </div>
            )}
            {professional && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Profissional</span>
                <span className="font-medium text-gray-900">{professional}</span>
              </div>
            )}
            {date && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Data</span>
                <span className="font-medium text-gray-900 text-right max-w-[60%] capitalize">{formatDatePT(date)}</span>
              </div>
            )}
            {time && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Horário</span>
                <span className="font-medium text-gray-900">{time}</span>
              </div>
            )}
          </div>
        )}

        <a
          href={`https://wa.me/?text=${waMessage}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 w-full inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-6 py-3 rounded-xl transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          Compartilhar confirmação no WhatsApp
        </a>

        <Link
          href={`/booking/${slug}`}
          className="mt-4 inline-block text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          Fazer outro agendamento
        </Link>
      </div>
    </div>
  )
}
