# mynute-next — Instruções Específicas

## Arquitetura
- **Next.js 15** com App Router (`src/app/`)
- **React 19** com TypeScript (modo strict)
- **Next-Auth v5** (`next-auth@5.0.0-beta`) para autenticação
- **Zustand v5** para gerenciamento de estado client-side (NÃO Redux)
- **TailwindCSS v3** + **Radix UI** (shadcn/ui) para componentes de UI
- **Zod** para validação de schema
- **React Hook Form** + `@hookform/resolvers/zod` para formulários
- Porta: **3000** (dev), configurável via padrões do Next.js
- Multi-tenant: cada empresa opera em seu próprio **subdomínio** (ex.: `empresa.app.domain.com`)
- Chamadas ao backend vão para `mynute-go-core` via variável de ambiente `BACKEND_URL`

## Layout do Projeto
```
src/
  app/
    (home)/              ← Landing page pública
    api/                 ← API routes do Next.js (handler Next-Auth, etc.)
    auth/                ← Páginas de login/auth
    dashboard/           ← Dashboard autenticado (agendamentos, clientes, etc.)
    [tenant]/            ← Páginas públicas de agendamento voltadas ao cliente
    layout.tsx           ← Layout raiz
  components/
    auth/                ← Componentes relacionados a auth
    ui/                  ← Primitivos shadcn/ui (Button, Input, Dialog, etc.)
    landing/             ← Componentes da landing page
    public/              ← Componentes da página pública de agendamento
    custom/              ← Componentes reutilizáveis customizados
  hooks/                 ← Custom React hooks (busca de dados + lógica de UI)
  lib/
    api/
      fetch-from-backend.ts   ← Cliente HTTP principal para chamadas ao backend
      get-company-from-request.ts
    tenant.ts            ← Utilitários de resolução de tenant/subdomínio
    tenant-company.ts    ← Lookup de empresa por slug de tenant
    utils.ts             ← Utilitários genéricos
    zod.ts               ← Schemas Zod compartilhados (signInSchema, etc.)
  types/                 ← Definições de tipos TypeScript
  utils/                 ← Utilitários adicionais
types/                   ← Tipos TypeScript globais (Company, User, Appointment, etc.)
validations/
  validation.ts          ← Schemas de validação Zod compartilhados
auth.ts                  ← Configuração NextAuth (providers, session, callbacks)
middleware.ts            ← Middleware Next.js (proteção de rotas, resolução de tenant)
```

## Padrão do Cliente API (`fetchFromBackend`)
Todas as chamadas ao backend DEVEM passar por `fetchFromBackend` de `@/lib/api/fetch-from-backend`:

```typescript
import { fetchFromBackend } from "@/lib/api/fetch-from-backend";

// Em uma API route ou Server Action do Next.js:
export async function GET(req: NextRequest) {
  const { token } = await auth(); // do next-auth
  const data = await fetchFromBackend<ResourceType>(req, "/endpoint", token, {
    method: "GET",
    cache: "no-store",
  });
  return NextResponse.json(data);
}

// Para endpoints públicos/globais (sem contexto de empresa):
await fetchFromBackend(req, "/company/slug/exists", token, {
  skipCompanyContext: true,
});
```

**Importante**: `fetchFromBackend` automaticamente:
- Resolve a empresa pelo subdomínio e injeta os headers `X-Company-ID` e `X-Company-Schema`
- Passa `X-Auth-Token` do token de auth fornecido
- Padrão para `cache: "no-store"` para frescor dos dados
- Lança `BackendUnauthorizedError` em respostas 401

## Autenticação (Next-Auth v5)
- Config em `auth.ts` — exporta `{ handlers, auth, signIn }`
- Provider: `Credentials` com ID `employee-login`
- Estratégia de sessão: JWT
- Token: armazenado na sessão Next-Auth como `token.backendToken`
- Tenant resolvido pelo subdomínio ou campo `tenant` das credenciais
- Acessando sessão em Server Components: `const session = await auth()`
- Acessando sessão em Client Components: `useSession()` de `next-auth/react`
- Proteção de rotas via `middleware.ts` usando `auth()` do Next-Auth

## Gerenciamento de Estado (Zustand)
- Stores Zustand em `src/lib/` ou co-localizadas com features — NÃO em uma pasta `store/` separada
- Padrão:
  ```typescript
  import { create } from "zustand";

  interface MyStore {
    items: Item[];
    loading: boolean;
    setItems: (items: Item[]) => void;
  }

  export const useMyStore = create<MyStore>((set) => ({
    items: [],
    loading: false,
    setItems: (items) => set({ items }),
  }));
  ```
- Estado de servidor (dados da API) → use hooks com fetch + estado local ou padrões estilo SWR
- Estado de UI client-only → Zustand

## Padrão de Custom Hooks
Hooks de busca de dados seguem este padrão:
```typescript
export function useResource(id: string) {
  const [data, setData] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/resource/${id}`)
      .then(res => res.json())
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  return { data, loading, error };
}
```
- Hooks em `src/hooks/` — um arquivo por recurso ou concern
- Hooks usam as API routes internas do Next.js (`/api/...`), NÃO o backend diretamente

## Convenções de Componentes
- Primitivos de UI do **shadcn/ui** (`src/components/ui/`) — Button, Input, Dialog, Select, etc.
- Tema dark/light via `next-themes` (`ThemeProvider`)
- Animações com **Motion** (pacote `motion`, não framer-motion)
- Ícones de `lucide-react` e `@radix-ui/react-icons`
- Formulários: `react-hook-form` + `@hookform/resolvers/zod`

### Padrão de Formulário
```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
});
type FormValues = z.infer<typeof schema>;

export function MyForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    await fetch("/api/resource", { method: "POST", body: JSON.stringify(values) });
  });

  return <form onSubmit={onSubmit}>...</form>;
}
```

## Multi-Tenancy (Subdomínio)
- Cada empresa tem um subdomínio único (ex.: `empresa.mynute.com.br`)
- Slug do tenant resolvido via `extractTenantSlugFromPathname()` ou parsing de subdomínio em `lib/tenant.ts`
- Dados da empresa (ID, schema_name) resolvidos via `getCompanyFromRequest()` em `lib/api/get-company-from-request.ts`
- Nunca hardcode IDs de empresa — sempre derive do contexto da request
- Cache de empresa client-side: sessionStorage com TTL de 60 segundos (veja `hooks/get-company.ts`)

## Convenções de Tipagem
- Tipos globais em `types/` (Company, User, Appointment, etc.)
- Tipos por-feature co-localizados com componentes ou em `src/types/`
- Tipos DTO correspondendo ao backend: use `snake_case` para espelhar as tags JSON das structs Go
- `types.d.ts` na raiz — aumenta a sessão do Next-Auth com `backendToken`

## Build e Dev
```bash
cd mynute-next
npm run dev     # Dev server na porta 3000 (com HMR do Next.js)
npm run build   # Build de produção (deve sair com 0)
npm run lint    # Verificação ESLint
npm start       # Servidor de produção (após build)
```

## Gate de Conclusão
Antes de considerar qualquer tarefa concluída, execute em `mynute-next/`:
```bash
npm run build   # Deve sair com 0 — captura erros TypeScript e de build
npm run lint    # Deve sair com 0 — sem erros ESLint
```

## Regras Chave (NUNCA viole)
- **NUNCA chame o backend (`mynute-go-core`) diretamente de client components** — sempre passe pelas API routes do Next.js (`/api/...`) ou Server Actions que usam `fetchFromBackend`
- **NUNCA armazene o token de auth do backend em localStorage** — use a sessão Next-Auth
- **SEMPRE use `fetchFromBackend`** para chamadas ao backend — nunca use `axios` ou `fetch` puro com URLs hardcoded
- **NUNCA hardcode IDs de empresa ou nomes de schema** — sempre resolva do subdomínio/contexto da request
- **SEMPRE use primitivos shadcn/ui** antes de criar componentes de UI customizados
- Use `async/await` para todas as operações assíncronas — sem cadeias `.then()`
- **Zustand para estado** — NÃO Redux, NÃO React Context para estado compartilhado
- TypeScript modo strict — sem `any` exceto onde inevitável (use `unknown` e narrowing)
- Alias de import `@` → `src/` (configurado em `tsconfig.json`)

## Variáveis de Ambiente (chave)
| Variável | Finalidade |
|---|---|
| `BACKEND_URL` | URL da API mynute-go-core (ex.: `http://localhost:4000`) |
| `AUTH_SECRET` | Secret do Next-Auth (para assinatura JWT) |
| `NEXTAUTH_URL` | URL base para callbacks do Next-Auth |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | Credenciais OAuth do Google (se aplicável) |
