# Configuração do Supabase

## ✅ Configuração Concluída

A aplicação foi configurada com a estrutura SSR recomendada do Supabase para Next.js 15.

## 📁 Estrutura de Arquivos

```
utils/supabase/
├── server.ts      # Cliente para Server Components
├── client.ts      # Cliente para Client Components
└── middleware.ts  # Cliente para middleware

middleware.ts      # Middleware principal do Next.js
lib/supabase.ts    # Tipos do banco de dados
```

## 🔧 Como Usar

### 1. Server Components (Páginas)

```tsx
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export default async function Page() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: ativos } = await supabase
    .from('ativos')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div>
      {ativos?.map((ativo) => (
        <div key={ativo.id}>{ativo.nome}</div>
      ))}
    </div>
  )
}
```

### 2. Client Components

```tsx
"use client"

import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'

export function MyComponent() {
  const [ativos, setAtivos] = useState([])
  const supabase = createClient()

  useEffect(() => {
    const fetchAtivos = async () => {
      const { data } = await supabase
        .from('ativos')
        .select('*')
      
      setAtivos(data || [])
    }

    fetchAtivos()
  }, [supabase])

  return (
    <div>
      {ativos.map((ativo) => (
        <div key={ativo.id}>{ativo.nome}</div>
      ))}
    </div>
  )
}
```

### 3. Hooks Personalizados

```tsx
"use client"

import { useSupabase } from '@/hooks/use-supabase'

export function MyComponent() {
  const { user, loading, supabase } = useSupabase()

  if (loading) return <div>Carregando...</div>

  return (
    <div>
      {user ? `Olá, ${user.email}` : 'Não logado'}
    </div>
  )
}
```

### 4. Serviços

```tsx
import { AtivoService } from '@/lib/services/ativo-service'

// Em um Server Component
const ativos = await AtivoService.getAll()

// Em um Client Component
useEffect(() => {
  AtivoService.getAll().then(setAtivos)
}, [])
```

## 🗄️ Schema do Banco

Execute o arquivo `supabase-schema.sql` no SQL Editor do Supabase para criar:

- ✅ Tabelas principais (ativos, categorias, localizações, setores, pessoas)
- ✅ Tabelas relacionadas (depreciações, manutenções, aluguéis)
- ✅ Índices para performance
- ✅ Triggers para updated_at
- ✅ Dados iniciais
- ✅ Políticas de segurança (RLS)

## 🔐 Autenticação

O middleware está configurado para:
- ✅ Proteger rotas específicas (`/dashboard`, `/configuracoes`, `/parametros`)
- ✅ Redirecionar usuários não autenticados para `/login`
- ✅ Redirecionar usuários autenticados de `/login` para `/dashboard`

## 🧪 Teste de Conexão

Acesse `/configuracoes` → aba "Backup" para testar a conexão com o Supabase.

## 📝 Variáveis de Ambiente

```env
NEXT_PUBLIC_SUPABASE_URL=https://fabejfsnwkyuileblmwq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🚀 Próximos Passos

1. Execute o schema SQL no Supabase
2. Teste a conexão em `/configuracoes`
3. Implemente autenticação se necessário
4. Crie páginas usando os exemplos acima
5. Use os serviços para operações CRUD

## 📚 Recursos

- [Documentação Supabase SSR](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [Supabase Auth](https://supabase.com/docs/guides/auth)


