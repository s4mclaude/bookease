'use client'

import Link from 'next/link'
import { Check, Calendar, Users, BarChart3, ArrowRight, Star, Clock, Smartphone } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans">

      {/* ── Navbar ── */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="text-xl font-bold text-gray-900">BookEase</span>
          <nav className="hidden md:flex items-center gap-8 text-sm text-gray-600">
            <a href="#como-funciona" className="hover:text-gray-900 transition-colors">Como funciona</a>
            <a href="#beneficios" className="hover:text-gray-900 transition-colors">Benefícios</a>
            <a href="#planos" className="hover:text-gray-900 transition-colors">Planos</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Entrar
            </Link>
            <Link
              href="/login"
              className="bg-green-500 hover:bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
            >
              Começar grátis
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-24 text-center">
        <span className="inline-block bg-green-50 text-green-700 text-xs font-semibold px-3 py-1 rounded-full mb-6 tracking-wide uppercase">
          Para clínicas, barbearias e salões
        </span>
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight max-w-3xl mx-auto">
          Chega de agenda<br className="hidden md:block" /> bagunçada
        </h1>
        <p className="mt-6 text-lg text-gray-500 max-w-xl mx-auto leading-relaxed">
          Seus clientes agendam pelo celular, você acompanha tudo em um painel simples.
          Sem papelada, sem confusão de horário, sem perder cliente por falta de retorno.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/login"
            className="bg-green-500 hover:bg-green-600 text-white font-semibold px-8 py-4 rounded-xl transition-colors flex items-center gap-2 text-base"
          >
            Quero organizar minha agenda
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#como-funciona"
            className="text-gray-600 hover:text-gray-900 font-medium px-8 py-4 rounded-xl border border-gray-200 bg-white hover:border-gray-300 transition-colors text-base"
          >
            Ver como funciona
          </a>
        </div>

        {/* Métricas rápidas */}
        <div className="mt-16 grid grid-cols-3 gap-6 max-w-lg mx-auto">
          {[
            { value: '2 min', label: 'para configurar' },
            { value: '100%', label: 'gratuito para começar' },
            { value: '24/7', label: 'agendamento online' },
          ].map((item) => (
            <div key={item.label} className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
              <p className="text-2xl font-bold text-gray-900">{item.value}</p>
              <p className="text-xs text-gray-500 mt-1">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Como funciona ── */}
      <section id="como-funciona" className="bg-white border-y border-gray-200 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900">Como funciona</h2>
            <p className="text-gray-500 mt-3">Três passos e você já está recebendo agendamentos</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Cadastre seu negócio',
                description: 'Crie sua conta, adicione seus serviços e profissionais em menos de dois minutos.',
                icon: Users,
              },
              {
                step: '02',
                title: 'Compartilhe o link',
                description: 'Você recebe uma página própria. Mande o link pelo WhatsApp, Instagram ou coloque na bio.',
                icon: Smartphone,
              },
              {
                step: '03',
                title: 'Gerencie tudo no painel',
                description: 'Veja os agendamentos do dia, confirme, cancele e acompanhe seus clientes em um lugar só.',
                icon: BarChart3,
              },
            ].map((item) => (
              <div key={item.step} className="bg-gray-50 rounded-2xl p-8 border border-gray-200">
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mb-5">
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs font-semibold text-green-600 tracking-widest">{item.step}</span>
                <h3 className="text-lg font-bold text-gray-900 mt-2 mb-3">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Benefícios ── */}
      <section id="beneficios" className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900">Tudo que você precisa</h2>
            <p className="text-gray-500 mt-3">Sem complicação, sem excesso de funcionalidades que ninguém usa</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Agendamento online 24 horas', description: 'Seu cliente agenda quando quiser, mesmo de madrugada, sem precisar te chamar no WhatsApp.' },
              { title: 'Sem conflito de horário', description: 'O sistema bloqueia automaticamente horários já ocupados. Chega de dois clientes no mesmo horário.' },
              { title: 'Gestão de profissionais', description: 'Cada profissional tem sua própria agenda, seus serviços e seus horários de disponibilidade.' },
              { title: 'Histórico de clientes', description: 'Veja quantas vezes o cliente voltou, quais serviços usou e quanto gastou ao longo do tempo.' },
              { title: 'Página pública personalizada', description: 'Sua barbearia, clínica ou salão com um link único. Compartilhe em qualquer rede social.' },
              { title: 'Funciona no celular', description: 'Painel responsivo para você gerenciar de qualquer lugar, do celular ou computador.' },
            ].map((benefit) => (
              <div key={benefit.title} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center mb-4">
                  <Check className="w-4 h-4 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Depoimentos ── */}
      <section className="bg-white border-y border-gray-200 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900">Quem já usa recomenda</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: 'Rodrigo Almeida',
                role: 'Barbearia Estilo',
                text: 'Antes eu perdia horário toda semana por falta de confirmação. Hoje os clientes agendam sozinhos e eu só gerencio.',
                rating: 5,
              },
              {
                name: 'Dra. Ana Cristina',
                role: 'Clínica de Estética',
                text: 'Minha recepcionista parou de perder tempo no telefone. Os pacientes adoraram poder agendar pelo celular.',
                rating: 5,
              },
              {
                name: 'Fernanda Lima',
                role: 'Salão Beleza & Arte',
                text: 'Em dois dias já tinha meu salão configurado e os clientes agendando. Simples demais.',
                rating: 5,
              },
            ].map((t) => (
              <div key={t.name} className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-green-400 text-green-400" />
                  ))}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-5">"{t.text}"</p>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                  <p className="text-gray-400 text-xs">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Planos ── */}
      <section id="planos" className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900">Planos simples e transparentes</h2>
            <p className="text-gray-500 mt-3">Teste grátis por 7 dias. Depois, continue por um valor acessível.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">

            {/* Teste grátis */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm flex flex-col">
              <div>
                <h3 className="font-bold text-gray-900 text-xl">Teste grátis</h3>
                <p className="text-gray-500 text-sm mt-2">Experimente o sistema completo antes de assinar.</p>
              </div>
              <div className="mt-8 mb-8">
                <div className="flex items-end gap-2">
                  <span className="text-5xl font-bold text-gray-900">R$&nbsp;0</span>
                </div>
                <span className="text-gray-400 text-sm mt-1 block">por 7 dias</span>
              </div>
              <ul className="space-y-3.5 mb-10 flex-1">
                {[
                  'Acesso completo por 7 dias',
                  'Até 2 profissionais',
                  'Agendamentos ilimitados durante o teste',
                  'Página pública de agendamento',
                  'Painel administrativo',
                  'Sem cartão de crédito',
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-gray-600">
                    <Check className="w-4 h-4 text-green-500 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/cadastro"
                className="block text-center border-2 border-gray-200 hover:border-green-400 hover:text-green-600 text-gray-700 font-semibold py-3.5 rounded-xl transition-colors"
              >
                Começar teste grátis
              </Link>
            </div>

            {/* Pro */}
            <div className="bg-green-500 rounded-2xl p-8 shadow-xl relative overflow-hidden flex flex-col">
              <span className="absolute top-5 right-5 bg-white text-green-600 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                Mais escolhido
              </span>
              <div>
                <h3 className="font-bold text-white text-xl">Pro</h3>
                <p className="text-green-100 text-sm mt-2">Para negócios que querem organizar a agenda e reduzir faltas.</p>
              </div>
              <div className="mt-8 mb-8">
                <div className="flex items-end gap-2">
                  <span className="text-5xl font-bold text-white">R$&nbsp;49</span>
                </div>
                <span className="text-green-200 text-sm mt-1 block">/mês</span>
              </div>
              <ul className="space-y-3.5 mb-10 flex-1">
                {[
                  'Profissionais ilimitados',
                  'Agendamentos ilimitados',
                  'Relatórios e métricas',
                  'Histórico completo de clientes',
                  'Lembretes automáticos por WhatsApp',
                  'Suporte prioritário',
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-white">
                    <Check className="w-4 h-4 text-green-200 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href="https://wa.me/5500000000000?text=Olá%2C%20tenho%20interesse%20no%20plano%20Pro%20do%20BookEase!"
                target="_blank"
                className="block text-center bg-white hover:bg-gray-50 text-green-600 font-semibold py-3.5 rounded-xl transition-colors"
              >
                Assinar plano Pro
              </a>
            </div>

          </div>
        </div>
      </section>

      {/* ── CTA Final ── */}
      <section className="bg-white border-t border-gray-200 py-24">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-900">Pronto para organizar sua agenda?</h2>
          <p className="text-gray-500 mt-4 leading-relaxed">
            Crie sua conta grátis em menos de dois minutos e comece a receber agendamentos ainda hoje.
          </p>
          <Link
            href="/login"
            className="mt-8 inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-8 py-4 rounded-xl transition-colors text-base"
          >
            Criar minha conta grátis
            <ArrowRight className="w-4 h-4" />
          </Link>
          <p className="text-xs text-gray-400 mt-4">Sem cartão de crédito. Sem taxa de setup.</p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-gray-50 border-t border-gray-200 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="font-bold text-gray-900">BookEase</span>
          <p className="text-sm text-gray-400">© 2026 BookEase. Todos os direitos reservados.</p>
          <div className="flex gap-6 text-sm text-gray-400">
            <a href="#" className="hover:text-gray-600 transition-colors">Privacidade</a>
            <a href="#" className="hover:text-gray-600 transition-colors">Termos</a>
            <a href="#" className="hover:text-gray-600 transition-colors">Contato</a>
          </div>
        </div>
      </footer>

    </div>
  )
}
