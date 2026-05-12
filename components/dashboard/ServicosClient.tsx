'use client'

import { useState, useTransition } from 'react'
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'
import { Service } from '@/types'
import {
  createService,
  updateService,
  toggleService,
  deleteService,
} from '@/app/actions/services'
import Modal from '@/components/ui/Modal'
import { formatCurrency } from '@/lib/utils'

function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}min` : `${h}h`
}

function ServiceForm({
  service,
  onSubmit,
  isPending,
  error,
}: {
  service?: Service
  onSubmit: (fd: FormData) => void
  isPending: boolean
  error?: string
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit(new FormData(e.currentTarget))
      }}
      className="space-y-4"
    >
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
          {error}
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Nome *</label>
        <input
          name="name"
          defaultValue={service?.name}
          required
          placeholder="Ex: Corte de cabelo"
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Descrição</label>
        <textarea
          name="description"
          defaultValue={service?.description ?? ''}
          rows={2}
          placeholder="Descrição opcional do serviço"
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Preço (R$)</label>
          <input
            name="price"
            type="number"
            step="0.01"
            min="0"
            defaultValue={service?.price ?? ''}
            placeholder="0,00"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Duração (min) *</label>
          <input
            name="duration_minutes"
            type="number"
            min="1"
            defaultValue={service?.duration_minutes ?? 30}
            required
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
      >
        {isPending ? 'Salvando...' : service ? 'Salvar alterações' : 'Criar serviço'}
      </button>
    </form>
  )
}

type ModalState =
  | { type: 'create' }
  | { type: 'edit'; service: Service }
  | null

export default function ServicosClient({ services }: { services: Service[] }) {
  const [modal, setModal] = useState<ModalState>(null)
  const [error, setError] = useState<string>()
  const [isPending, startTransition] = useTransition()

  function openCreate() {
    setError(undefined)
    setModal({ type: 'create' })
  }

  function openEdit(service: Service) {
    setError(undefined)
    setModal({ type: 'edit', service })
  }

  function closeModal() {
    setModal(null)
    setError(undefined)
  }

  function handleCreate(fd: FormData) {
    startTransition(async () => {
      const result = await createService(fd)
      if (result?.error) {
        setError(result.error)
      } else {
        closeModal()
      }
    })
  }

  function handleEdit(service: Service, fd: FormData) {
    startTransition(async () => {
      const result = await updateService(service.id, fd)
      if (result?.error) {
        setError(result.error)
      } else {
        closeModal()
      }
    })
  }

  function handleToggle(id: string) {
    startTransition(() => toggleService(id))
  }

  function handleDelete(id: string) {
    if (!confirm('Excluir este serviço? Agendamentos existentes não serão afetados.')) return
    startTransition(() => deleteService(id))
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Serviços</h1>
          <p className="text-gray-500 text-sm mt-1">Gerencie os serviços oferecidos</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-medium px-4 py-2.5 rounded-xl transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          Novo serviço
        </button>
      </div>

      {services.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
          <p className="text-gray-500 text-sm">Nenhum serviço cadastrado ainda.</p>
          <button
            onClick={openCreate}
            className="mt-4 text-green-600 text-sm font-medium hover:text-green-700"
          >
            Criar primeiro serviço →
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="hidden md:grid grid-cols-[1fr_90px_110px_80px_96px] px-6 py-3 border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wide">
            <span>Serviço</span>
            <span>Duração</span>
            <span>Preço</span>
            <span>Status</span>
            <span />
          </div>
          {services.map((service) => (
            <div
              key={service.id}
              className="grid md:grid-cols-[1fr_90px_110px_80px_96px] gap-3 px-6 py-4 border-b border-gray-100 last:border-0 items-center"
            >
              <div>
                <p className="text-sm font-medium text-gray-900">{service.name}</p>
                {service.description && (
                  <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">
                    {service.description}
                  </p>
                )}
              </div>
              <span className="text-sm text-gray-600">{formatDuration(service.duration_minutes)}</span>
              <span className="text-sm text-gray-600">
                {service.price != null ? formatCurrency(service.price) : '—'}
              </span>
              <span>
                <span
                  className={`inline-flex px-2 py-1 rounded-lg text-xs font-medium ${
                    service.is_active
                      ? 'bg-green-50 text-green-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {service.is_active ? 'Ativo' : 'Inativo'}
                </span>
              </span>
              <div className="flex items-center gap-1 justify-end">
                <button
                  onClick={() => openEdit(service)}
                  title="Editar"
                  className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleToggle(service.id)}
                  title={service.is_active ? 'Desativar' : 'Ativar'}
                  className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {service.is_active ? (
                    <ToggleRight className="w-4 h-4 text-green-500" />
                  ) : (
                    <ToggleLeft className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => handleDelete(service.id)}
                  title="Excluir"
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <Modal
          title={modal.type === 'create' ? 'Novo serviço' : 'Editar serviço'}
          onClose={closeModal}
        >
          <ServiceForm
            service={modal.type === 'edit' ? modal.service : undefined}
            onSubmit={
              modal.type === 'create'
                ? handleCreate
                : (fd) => handleEdit((modal as { type: 'edit'; service: Service }).service, fd)
            }
            isPending={isPending}
            error={error}
          />
        </Modal>
      )}
    </div>
  )
}
