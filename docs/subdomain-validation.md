# Validação de Subdomínio - Guia de Uso

Este módulo fornece uma lógica reutilizável para validar subdomínios e buscar dados da empresa associada.

## Arquivos

- `src/lib/subdomain-validation.ts` - Lógica principal de validação
- `src/hooks/use-subdomain-validation.tsx` - Hook para usar em componentes React
- `src/components/custom/company-not-found.tsx` - Componente de erro para empresa não encontrada
- `src/components/custom/invalid-subdomain.tsx` - Componente de erro para subdomínio inválido

## Variáveis de Ambiente

Certifique-se de ter a variável `NEXT_PUBLIC_FRONTEND_URL` configurada no seu `.env`:

```bash
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
```

## Como Usar

### Em Server Components (Next.js 13+)

```tsx
import { useSubdomainValidation } from "@/hooks/use-subdomain-validation";

export default async function MinhaPage() {
  const { company, errorComponent, subdomain } = await useSubdomainValidation();

  // Se houve erro na validação, retorna o componente de erro
  if (errorComponent) {
    return errorComponent;
  }

  // Se chegou aqui, company não é null
  if (!company) {
    return null; // Nunca será executado, mas satisfaz o TypeScript
  }

  return (
    <div>
      <h1>{company.trading_name || company.legal_name}</h1>
      <p>Subdomínio: {subdomain}</p>
      {/* Resto do seu componente */}
    </div>
  );
}
```

### Usando apenas a função de validação

```tsx
import { validateSubdomainAndGetCompany } from "@/lib/subdomain-validation";

export default async function OutraPage() {
  const result = await validateSubdomainAndGetCompany();

  if (!result.success) {
    if (result.error === "invalid_subdomain") {
      return <div>Subdomínio inválido</div>;
    } else {
      return <div>Empresa não encontrada: {result.subdomain}</div>;
    }
  }

  const { company, subdomain } = result;

  return (
    <div>
      <h1>{company.trading_name || company.legal_name}</h1>
      {/* Resto do seu componente */}
    </div>
  );
}
```

## Tipos TypeScript

```typescript
interface Company {
  id: string;
  legal_name: string;
  trading_name?: string;
  design?: {
    images?: {
      banner_url?: string;
    };
  };
}

interface SubdomainHookResult {
  company: Company | null;
  subdomain: string | null;
  errorComponent: React.ReactElement | null;
}
```

## Casos de Erro Tratados

1. **Subdomínio inválido**: localhost, 127, ou vazio
2. **Empresa não encontrada**: Subdomínio válido mas sem empresa associada
3. **Erro de rede**: Falha na requisição para a API

## Páginas que podem usar esta lógica

- `/auth/employee` ✅ (já implementado)
- `/auth/register-client` (se precisar validar empresa)
- `/scheduling` (se for específico por empresa)
- `/dashboard` (se for específico por empresa)
- Qualquer página que precise validar empresa por subdomínio
