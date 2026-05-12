# Changelog — BookEase

Todas as atualizações do projeto estão documentadas aqui.
Formato: `[versão] — data` · Ordem: mais recente no topo.

---

## 🚀 [v1.3.0] — 2026-05-11

### ✨ Adicionado
- `[Admin]` Botão de WhatsApp na agenda com mensagem pré-preenchida (nome, serviço, profissional, data e horário)
- `[Admin]` Filtro de status na agenda (Todos, Pendentes, Confirmados, Concluídos, Cancelados) com contagem por status
- `[Site]` Botão de compartilhamento por WhatsApp na tela de confirmação de agendamento
- `[Site]` Nome do cliente e nome do negócio exibidos na tela de sucesso
- `[Site]` Foto do profissional exibida na etapa de seleção do fluxo de agendamento
- `[Admin]` Estados de carregamento (skeleton) para Agenda, Serviços, Profissionais e Dashboard
- `[Admin]` Sidebar responsiva com menu mobile (ícone hambúrguer + slide lateral)
- `[Site + Admin]` Padding responsivo em todas as páginas do dashboard (`p-4 md:p-8`)

### 🔄 Alterado
- `[Admin]` Layout das colunas da agenda ajustado para empilhar no mobile e exibir lado a lado no desktop

### 🐛 Corrigido
- `[Site + Admin]` Erro TypeScript em `session.user.id` — extraído para `userId` com guard adequado em todos os Server Actions e páginas do dashboard
- `[Site + Admin]` Erro de tipo genérico no cliente Neon — criado wrapper tipado em `lib/db.ts` compatível com `@neondatabase/serverless` v1.1.0
- `[Site + Admin]` Tipagem incorreta de `sql<Type[]>` corrigida para `sql<Type>` em todo o projeto

---

## 🛠️ [v1.2.0] — 2026-05-10

### ✨ Adicionado
- `[Admin]` CRUD completo de profissionais com vínculo a serviços e disponibilidade semanal
- `[Admin]` Upload de foto de profissional via URL
- `[Admin]` Ativar/desativar profissional e serviço individualmente
- `[Admin]` Dashboard com métricas: agendamentos hoje, amanhã, esta semana e total de clientes
- `[Admin]` Página de clientes com histórico de agendamentos por cliente
- `[Admin]` Página de configurações da empresa (nome, slug, tipo, telefone, e-mail, endereço, logo)

---

## ✈️ [v1.1.0] — 2026-05-09

### ✨ Adicionado
- `[Site]` Fluxo de agendamento público em `/booking/[slug]` com 5 etapas: serviço → profissional → data → horário → confirmação
- `[Site]` Geração de slots de horário baseada na disponibilidade real do profissional e conflitos existentes
- `[Site]` Tela de sucesso após agendamento em `/booking/[slug]/sucesso`
- `[Admin]` CRUD completo de serviços (criar, editar, ativar/desativar, excluir)
- `[Admin]` CRUD base de profissionais

---

## 🌱 [v1.0.0] — 2026-05-08

### ✨ Adicionado
- `[Deploy]` Projeto Next.js (App Router) com Tailwind CSS v4 inicializado
- `[Deploy]` Banco de dados Neon PostgreSQL com schema completo (businesses, services, professionals, availability, customers, appointments)
- `[Deploy]` Autenticação com Auth.js v5 (GitHub OAuth) e guard de rotas no dashboard
- `[Deploy]` Tipos TypeScript completos do domínio em `types/index.ts`
- `[Site]` Landing page pública com seções: Hero, Benefícios, Como Funciona, Planos e CTA
- `[Admin]` Layout do dashboard com sidebar de navegação
- `[Admin]` Criação automática de empresa no primeiro login
