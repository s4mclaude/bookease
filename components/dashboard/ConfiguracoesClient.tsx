'use client'

import { useState, useTransition, useRef } from 'react'
import { updateBusiness } from '@/app/actions/business'
import { Business } from '@/types'
import ImageCropModal from '@/components/ui/ImageCropModal'
import { Camera } from 'lucide-react'

const BUSINESS_TYPES = [
  { value: 'barbershop', label: 'Barbearia' },
  { value: 'salon', label: 'Salão de Beleza' },
  { value: 'clinic', label: 'Clínica' },
]

export default function ConfiguracoesClient({ business }: { business: Business }) {
  const [isPending, startTransition] = useTransition()
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string>()
  const [logoPreview, setLogoPreview] = useState<string>(business.logo_url ?? '')
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

  function handleCropConfirm(base64: string) {
    setLogoPreview(base64)
    setCropSrc(null)
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSuccess(false)
    setError(undefined)
    const fd = new FormData(e.currentTarget)
    fd.set('logo_url', logoPreview)
    startTransition(async () => {
      const result = await updateBusiness(fd)
      if (result?.error) {
        setError(result.error)
      } else {
        setSuccess(true)
      }
    })
  }

  return (
    <>
      {cropSrc && (
        <ImageCropModal
          imageSrc={cropSrc}
          onConfirm={handleCropConfirm}
          onCancel={() => setCropSrc(null)}
        />
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3">
            Informações salvas com sucesso!
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest">
            Informações do negócio
          </h2>

          {/* Logo upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Logo</label>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-dashed border-gray-300 hover:border-green-400 bg-gray-50 flex items-center justify-center transition-colors group shrink-0"
              >
                {logoPreview ? (
                  <>
                    <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Camera className="w-5 h-5 text-white" />
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-1 text-gray-400 group-hover:text-green-500 transition-colors">
                    <Camera className="w-6 h-6" />
                    <span className="text-xs">Logo</span>
                  </div>
                )}
              </button>
              <div className="text-sm text-gray-500 space-y-1">
                <p>Clique para enviar uma imagem</p>
                <p className="text-xs text-gray-400">PNG, JPG ou WEBP · Máx. 5 MB</p>
                {logoPreview && (
                  <button
                    type="button"
                    onClick={() => setLogoPreview('')}
                    className="text-xs text-red-400 hover:text-red-500 transition-colors"
                  >
                    Remover logo
                  </button>
                )}
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nome do estabelecimento *</label>
            <input
              name="name"
              defaultValue={business.name}
              required
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Descrição</label>
            <textarea
              name="description"
              defaultValue={business.description ?? ''}
              rows={3}
              placeholder="Fale um pouco sobre o seu negócio para os clientes..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Tipo de negócio</label>
            <select
              name="type"
              defaultValue={business.type ?? ''}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Selecione o tipo</option>
              {BUSINESS_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest">
            Contato e localização
          </h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Telefone / WhatsApp</label>
            <input
              name="phone"
              defaultValue={business.phone ?? ''}
              placeholder="(11) 99999-9999"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">E-mail de contato</label>
            <input
              name="email"
              type="email"
              defaultValue={business.email ?? ''}
              placeholder="contato@seunegocio.com.br"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Endereço</label>
            <input
              name="address"
              defaultValue={business.address ?? ''}
              placeholder="Rua Exemplo, 123 — Bairro, Cidade - UF"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">
            Sua página pública
          </h2>
          <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
            <span className="text-sm text-gray-500 flex-1 truncate">/booking/{business.slug}</span>
            <a
              href={`/booking/${business.slug}`}
              target="_blank"
              className="text-sm text-green-600 font-medium hover:text-green-700 shrink-0"
            >
              Abrir →
            </a>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Este é o link que você compartilha com os seus clientes.
          </p>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
        >
          {isPending ? 'Salvando...' : 'Salvar configurações'}
        </button>
      </form>
    </>
  )
}
