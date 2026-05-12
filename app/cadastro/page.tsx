'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { register } from '@/app/actions/auth'

const BUSINESS_TYPES = [
  { value: 'barbershop', label: 'Barbearia' },
  { value: 'salon', label: 'Salão de beleza' },
  { value: 'clinic', label: 'Clínica' },
]

export default function CadastroPage() {
  const [state, formAction, isPending] = useActionState(register, undefined)

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-gray-900">BookEase</Link>
          <p className="text-gray-500 text-sm mt-2">Crie sua conta e comece a receber agendamentos</p>
        </div>

        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            ← Voltar para a página inicial
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <form action={formAction} className="space-y-5">

            {state?.error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                {state.error}
              </div>
            )}

            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Seus dados</p>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Seu nome
              </label>
              <input
                name="name"
                type="text"
                required
                placeholder="João Silva"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                E-mail
              </label>
              <input
                name="email"
                type="email"
                required
                placeholder="seu@email.com"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Telefone / WhatsApp
              </label>
              <input
                name="phone"
                type="tel"
                required
                placeholder="(11) 99999-9999"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Senha
              </label>
              <input
                name="password"
                type="password"
                required
                minLength={6}
                placeholder="Mínimo 6 caracteres"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
              />
            </div>

            <div className="border-t border-gray-100 pt-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-5">Seu negócio</p>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Nome do estabelecimento
                  </label>
                  <input
                    name="businessName"
                    type="text"
                    required
                    placeholder="Barbearia do João"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Tipo de negócio
                  </label>
                  <select
                    name="businessType"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition bg-white"
                  >
                    <option value="">Selecione o tipo</option>
                    {BUSINESS_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white font-semibold py-3 rounded-xl transition-colors text-sm mt-2"
            >
              {isPending ? 'Criando conta...' : 'Criar minha conta grátis'}
            </button>

          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Já tem uma conta?{' '}
          <Link href="/login" className="text-green-600 font-medium hover:text-green-700 transition-colors">
            Entrar
          </Link>
        </p>

      </div>
    </div>
  )
}
