# Especificações de Imagens - Agenda Kaki

## Documento para Marketing

---

## 1. Página de Registro da Empresa

**Arquivo:** `src/app/auth/register-company/page.tsx`

### Layout Geral

- **Estrutura:** Grid responsivo 2 colunas (1 coluna em mobile, 2 em desktop)
- **Proporção Desktop:** 50% formulário | 50% área visual
- **Altura:** Tela completa (100vh)

### Área do Formulário (Coluna Esquerda)

- **Largura máxima:** 448px (max-w-md)
- **Padding:** 24px mobile | 40px desktop
- **Alinhamento:** Centro vertical e horizontal

### Área Visual (Coluna Direita)

- **Background:** Cor muted (cinza claro)
- **Padding:** 40px horizontal | 48px vertical
- **Conteúdo:** Texto + elementos animados

#### Elementos Visuais Animados:

1. **Blob Azul:**

   - Dimensões: 288px × 288px (w-72 h-72)
   - Cor: bg-blue-300
   - Opacidade: 30%
   - Efeito: blur-3xl
   - Posição: top 20%, left -10%

2. **Blob Roxo:**
   - Dimensões: 320px × 320px (w-80 h-80)
   - Cor: bg-purple-500
   - Opacidade: 20%
   - Efeito: blur-3xl
   - Posição: bottom 10%, right -15%

#### Tipografia:

- **Título Principal:**

  - Mobile: text-4xl (36px)
  - Desktop: text-5xl (48px) / text-6xl (60px)
  - Cor: #1a2b47 (azul escuro)
  - Font-weight: bold

- **Subtítulo:**
  - Tamanho: text-lg (18px)
  - Cor: text-muted-foreground

### Responsividade:

- **Mobile:** Layout em coluna única
- **Desktop (lg+):** Grid 2 colunas 50/50
- **Breakpoint:** 1024px (lg)

### Características Especiais:

- Animações suaves com Framer Motion
- Elementos flutuantes com movimento contínuo
- Background com gradiente sutil através dos blobs
- Efeito de profundidade com z-index

---

_Documento criado em: July 1, 2025_
_Próximas páginas serão adicionadas conforme solicitação_
