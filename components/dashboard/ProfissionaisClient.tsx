'use client'

import { useState, useTransition, useRef } from 'react'
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight, Camera } from 'lucide-react'
import { Service, Professional, Availability } from '@/types'
import {
  createProfessional,
  updateProfessional,
  toggleProfessional,
  deleteProfessional,
} from '@/app/actions/professionals'
import Modal from '@/components/ui/Modal'
import ImageCropModal from '@/components/ui/ImageCropModal'

const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

type ProfWithDetails = Professional & {
  service_ids: string[]
  availability: Pick<Availability, 'day_of_week' | 'start_time' | 'end_time'>[]
}

type DayState = { checked: boolean; start: string; end: string }

function initDays(availability: Pick<Availability, 'day_of_week' | 'start_time' | 'end_time'>[] = []): DayState[] {
  return Array.from({ length: 7 }, (_, i) => {
    const found = availability.find((a) => a.day_of_week === i)
    return {
      checked: !!found,
      start: found?.start_time?.slice(0, 5) ?? '09:00',
      end: found?.end_time?.slice(0, 5) ?? '18:00',
    }
  })
}

function ProfessionalAvatar({ name, photoUrl, size = 'md' }: { name: string; photoUrl?: string | null; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'w-8 h-8 text-sm', md: 'w-10 h-10 text-base', lg: 'w-12 h-12 text-lg' }
  return (
    <div className={`${sizes[size]} rounded-full bg-green-100 flex items-center justify-center shrink-0 overflow-hidden`}>
      {photoUrl ? (
        <img src={photoUrl} alt={name} className="w-full h-full object-cover" />
      ) : (
        <span className="text-green-700 font-bold">{name.charAt(0).toUpperCase()}</span>
      )}
    </div>
  )
}

function ProfessionalForm({
  professional,
  services,
  onSubmit,
  isPending,
  error,
}: {
  professional?: ProfWithDetails
  services: Service[]
  onSubmit: (fd: FormData) => void
  isPending: boolean
  error?: string
}) {
  const [days, setDays] = useState<DayState[]>(() => initDays(professional?.availability))
  const [photoPreview, setPhotoPreview] = useState<string>(professional?.photo_url ?? '')
  const [cropSrc, setCropSrc] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setCropSrc(reader.result as string)
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  function toggleDay(i: number) {
    setDays((prev) => prev.map((d, idx) => (idx === i ? { ...d, checked: !d.checked } : d)))
  }

  function updateTime(i: number, field: 'start' | 'end', value: string) {
    setDays((prev) => prev.map((d, idx) => (idx === i ? { ...d, [field]: value } : d)))
  }

  function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    fd.set('photo_url', photoPreview)
    onSubmit(fd)
  }

  return (
    <>
      {cropSrc && (
        <ImageCropModal
          imageSrc={cropSrc}
          onConfirm={(base64) => { setPhotoPreview(base64); setCropSrc(null) }}
          onCancel={() => setCropSrc(null)}
        />
      )}

      <form onSubmit={handleFormSubmit} className="space-y-5">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        {/* Photo upload */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-dashed border-gray-300 hover:border-green-400 bg-gray-50 flex items-center justify-center transition-colors group shrink-0"
          >
            {photoPreview ? (
              <>
                <img src={photoPreview} alt="Foto" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="w-4 h-4 text-white" />
                </div>
              </>
            ) : (
              <Camera className="w-5 h-5 text-gray-400 group-hover:text-green-500 transition-colors" />
            )}
          </button>
          <div className="text-sm text-gray-500">
            <p>Foto do profissional</p>
            <p className="text-xs text-gray-400 mt-0.5">PNG, JPG · Máx. 5 MB</p>
            {photoPreview && (
              <button
                type="button"
                onClick={() => setPhotoPreview('')}
                className="text-xs text-red-400 hover:text-red-500 transition-colors mt-1"
              >
                Remover foto
              </button>
            )}
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Nome *</label>
          <input
            name="name"
            defaultValue={professional?.name}
            required
            placeholder="Ex: João Silva"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Função</label>
          <input
            name="role"
            defaultValue={professional?.role ?? ''}
            placeholder="Ex: Barbeiro, Cabeleireira"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        {services.length > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Serviços realizados</p>
            <div className="space-y-2">
              {services.map((s) => (
                <label key={s.id} className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    name="service_ids"
                    value={s.id}
                    defaultChecked={professional?.service_ids.includes(s.id)}
                    className="w-4 h-4 accent-green-500"
                  />
                  <span className="text-sm text-gray-700">{s.name}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        <div>
          <p className="text-sm font-medium text-gray-700 mb-3">Disponibilidade semanal</p>
          <div className="space-y-2">
            {days.map((day, i) => (
              <div key={i} className="flex items-center gap-3">
                <label className="flex items-center gap-2 w-16 cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    name={`day_${i}`}
                    checked={day.checked}
                    onChange={() => toggleDay(i)}
                    className="w-4 h-4 accent-green-500"
                  />
                  <span className="text-sm text-gray-700">{DAYS[i]}</span>
                </label>
                {day.checked && (
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="time"
                      name={`start_${i}`}
                      value={day.start}
                      onChange={(e) => updateTime(i, 'start', e.target.value)}
                      className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <span className="text-gray-400 text-sm">até</span>
                    <input
                      type="time"
                      name={`end_${i}`}
                      value={day.end}
                      onChange={(e) => updateTime(i, 'end', e.target.value)}
                      className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
        >
          {isPending ? 'Salvando...' : professional ? 'Salvar alterações' : 'Criar profissional'}
        </button>
      </form>
    </>
  )
}

type ModalState =
  | { type: 'create' }
  | { type: 'edit'; professional: ProfWithDetails }
  | null

export default function ProfissionaisClient({
  professionals,
  services,
}: {
  professionals: ProfWithDetails[]
  services: Service[]
}) {
  const [modal, setModal] = useState<ModalState>(null)
  const [error, setError] = useState<string>()
  const [isPending, startTransition] = useTransition()

  function openCreate() { setError(undefined); setModal({ type: 'create' }) }
  function openEdit(professional: ProfWithDetails) { setError(undefined); setModal({ type: 'edit', professional }) }
  function closeModal() { setModal(null); setError(undefined) }

  function handleCreate(fd: FormData) {
    startTransition(async () => {
      const result = await createProfessional(fd)
      if (result?.error) setError(result.error)
      else closeModal()
    })
  }

  function handleEdit(id: string, fd: FormData) {
    startTransition(async () => {
      const result = await updateProfessional(id, fd)
      if (result?.error) setError(result.error)
      else closeModal()
    })
  }

  function handleToggle(id: string) { startTransition(() => toggleProfessional(id)) }

  function handleDelete(id: string) {
    if (!confirm('Excluir este profissional? Os agendamentos existentes não serão afetados.')) return
    startTransition(() => deleteProfessional(id))
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profissionais</h1>
          <p className="text-gray-500 text-sm mt-1">Gerencie a equipe e a disponibilidade</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-medium px-4 py-2.5 rounded-xl transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          Novo profissional
        </button>
      </div>

      {professionals.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
          <p className="text-gray-500 text-sm">Nenhum profissional cadastrado ainda.</p>
          <button onClick={openCreate} className="mt-4 text-green-600 text-sm font-medium hover:text-green-700">
            Adicionar primeiro profissional →
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="hidden md:grid grid-cols-[1fr_1fr_80px_96px] px-6 py-3 border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wide">
            <span>Profissional</span>
            <span>Serviços</span>
            <span>Status</span>
            <span />
          </div>
          {professionals.map((prof) => (
            <div
              key={prof.id}
              className="grid md:grid-cols-[1fr_1fr_80px_96px] gap-3 px-6 py-4 border-b border-gray-100 last:border-0 items-center"
            >
              <div className="flex items-center gap-3">
                <ProfessionalAvatar name={prof.name} photoUrl={prof.photo_url} />
                <div>
                  <p className="text-sm font-medium text-gray-900">{prof.name}</p>
                  {prof.role && <p className="text-xs text-gray-400 mt-0.5">{prof.role}</p>}
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                {prof.service_ids.length === 0 ? (
                  <span className="text-xs text-gray-400">Nenhum serviço</span>
                ) : (
                  services
                    .filter((s) => prof.service_ids.includes(s.id))
                    .map((s) => (
                      <span key={s.id} className="inline-flex px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-lg">
                        {s.name}
                      </span>
                    ))
                )}
              </div>
              <span>
                <span className={`inline-flex px-2 py-1 rounded-lg text-xs font-medium ${prof.is_active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {prof.is_active ? 'Ativo' : 'Inativo'}
                </span>
              </span>
              <div className="flex items-center gap-1 justify-end">
                <button onClick={() => openEdit(prof)} title="Editar" className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleToggle(prof.id)} title={prof.is_active ? 'Desativar' : 'Ativar'} className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                  {prof.is_active ? <ToggleRight className="w-4 h-4 text-green-500" /> : <ToggleLeft className="w-4 h-4" />}
                </button>
                <button onClick={() => handleDelete(prof.id)} title="Excluir" className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <Modal
          title={modal.type === 'create' ? 'Novo profissional' : 'Editar profissional'}
          onClose={closeModal}
        >
          <ProfessionalForm
            professional={modal.type === 'edit' ? modal.professional : undefined}
            services={services}
            onSubmit={
              modal.type === 'create'
                ? handleCreate
                : (fd) => handleEdit((modal as { type: 'edit'; professional: ProfWithDetails }).professional.id, fd)
            }
            isPending={isPending}
            error={error}
          />
        </Modal>
      )}
    </div>
  )
}
