# Changelog — BookEase

Todas as atualizações do projeto estão documentadas aqui.
Formato: `[versão] — data` · Ordem: mais recente no topo.

---

## 🌱 [v1.0.0] — 2026-05-11

### ✨ Adicionado
- `[Site]` Estrutura base do projeto com Next.js 16, React 19 e Tailwind CSS v4
- `[Site]` Configuração do Supabase Auth com `@supabase/ssr` (client e server)
- `[Site]` Proxy de proteção de rotas (`proxy.ts`) — redireciona para `/login` se não autenticado
- `[Site]` Rotas placeholder para todas as páginas: landing, login, dashboard, agenda, serviços, profissionais, clientes, booking e sucesso
- `[Site]` Layout do dashboard com guard de autenticação via Server Component
- `[Deploy]` Schema SQL completo em `supabase/schema.sql` com 7 tabelas, índices e políticas RLS
- `[Deploy]` Tipos TypeScript completos do domínio em `types/index.ts`
- `[Deploy]` Utilitários em `lib/utils.ts` (formatação de moeda, data, hora e geração de slug)
