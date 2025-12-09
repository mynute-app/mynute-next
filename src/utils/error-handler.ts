/**
 * Sistema de tratamento e tradução de erros do backend
 * Mapeia erros técnicos para mensagens amigáveis ao usuário
 */

export interface ErrorMapping {
  field?: string;
  message: string;
  variant?: "destructive" | "default";
}

export interface ParsedError {
  type: "field" | "general" | "constraint";
  field?: string;
  message: string;
  originalError: string;
}

/**
 * Mapeamento de constraints de banco de dados para mensagens traduzidas
 */
const DATABASE_CONSTRAINTS: Record<string, ErrorMapping> = {
  // Nome da empresa / Nome Fantasia
  uni_companies_name: {
    field: "name",
    message: "Já existe uma empresa com esse nome.",
  },
  uni_public_companies_legal_name: {
    field: "name",
    message: "Já existe uma empresa com esse nome.",
  },
  uni_companies_legal_name: {
    field: "name",
    message: "Já existe uma empresa com esse nome.",
  },
  idx_public_companies_trade_name: {
    field: "trade_name",
    message: "Já existe uma empresa com esse nome fantasia.",
  },
  uni_public_companies_trade_name: {
    field: "trade_name",
    message: "Já existe uma empresa com esse nome fantasia.",
  },

  // CNPJ
  uni_companies_tax_id: {
    field: "tax_id",
    message: "Já existe uma empresa com esse CNPJ.",
  },
  uni_public_companies_tax_id: {
    field: "tax_id",
    message: "Já existe uma empresa com esse CNPJ.",
  },
  idx_public_companies_tax_id: {
    field: "tax_id",
    message: "Já existe uma empresa com esse CNPJ.",
  },

  // Email
  idx_employees_email: {
    field: "owner_email",
    message: "Já existe uma conta com esse e-mail.",
  },
  uni_employees_email: {
    field: "owner_email",
    message: "Já existe uma conta com esse e-mail.",
  },

  // Telefone
  idx_employees_phone: {
    field: "owner_phone",
    message: "Já existe uma conta com esse telefone.",
  },
  uni_employees_phone: {
    field: "owner_phone",
    message: "Já existe uma conta com esse telefone.",
  },

  // Subdomínio
  uni_companies_subdomain: {
    field: "start_subdomain",
    message: "Este subdomínio já está em uso. Escolha outro.",
  },
  idx_companies_subdomain: {
    field: "start_subdomain",
    message: "Este subdomínio já está em uso. Escolha outro.",
  },
};

/**
 * Mapeamento de erros SQL genéricos
 */
const SQL_ERROR_PATTERNS: Array<{
  pattern: RegExp;
  getMessage: (match: RegExpMatchArray) => string;
}> = [
  {
    pattern: /duplicate key value violates unique constraint "([^"]+)"/i,
    getMessage: match => {
      const constraint = match[1];
      const mapping = DATABASE_CONSTRAINTS[constraint];
      return (
        mapping?.message ||
        "Já existe um registro com essas informações. Verifique os dados e tente novamente."
      );
    },
  },
  {
    pattern: /foreign key constraint "([^"]+)"/i,
    getMessage: () =>
      "Não foi possível completar a operação devido a dependências no sistema.",
  },
  {
    pattern: /check constraint "([^"]+)"/i,
    getMessage: () =>
      "Os dados fornecidos não atendem aos requisitos do sistema.",
  },
  {
    pattern: /not null constraint "([^"]+)"/i,
    getMessage: () => "Alguns campos obrigatórios não foram preenchidos.",
  },
];

/**
 * Mapeamento de erros HTTP
 */
const HTTP_ERROR_MESSAGES: Record<number, string> = {
  400: "Dados inválidos. Verifique as informações e tente novamente.",
  401: "Sessão expirada. Faça login novamente.",
  403: "Você não tem permissão para realizar esta ação.",
  404: "O recurso solicitado não foi encontrado.",
  409: "Conflito: já existe um registro com essas informações.",
  422: "Os dados fornecidos são inválidos ou incompletos.",
  429: "Muitas tentativas. Aguarde alguns instantes e tente novamente.",
  500: "Erro no servidor. Tente novamente mais tarde.",
  502: "Serviço temporariamente indisponível. Tente novamente.",
  503: "Sistema em manutenção. Tente novamente em alguns minutos.",
};

/**
 * Padrões de erro conhecidos do backend
 */
const BACKEND_ERROR_PATTERNS: Array<{
  pattern: RegExp | string;
  message: string;
  field?: string;
}> = [
  {
    pattern: /subdomain.*already exists/i,
    message: "Este subdomínio já está em uso. Escolha outro.",
    field: "start_subdomain",
  },
  {
    pattern: /email.*already exists/i,
    message: "Já existe uma conta com esse e-mail.",
    field: "owner_email",
  },
  {
    pattern: /tax.?id.*already exists/i,
    message: "Já existe uma empresa com esse CNPJ.",
    field: "tax_id",
  },
  {
    pattern: /phone.*already exists/i,
    message: "Já existe uma conta com esse telefone.",
    field: "owner_phone",
  },
  {
    pattern: /invalid.*email/i,
    message: "O e-mail fornecido é inválido.",
    field: "owner_email",
  },
  {
    pattern: /invalid.*cnpj/i,
    message: "O CNPJ fornecido é inválido.",
    field: "tax_id",
  },
];

/**
 * Extrai o código de status de uma mensagem de erro
 */
function extractStatusCode(errorMessage: string): number | null {
  const match = errorMessage.match(/\((\d{3})\)/);
  return match ? parseInt(match[1], 10) : null;
}

/**
 * Extrai o constraint do PostgreSQL de uma mensagem de erro
 */
function extractConstraint(errorMessage: string): string | null {
  const match = errorMessage.match(
    /violates unique constraint "([^"]+)"|constraint "([^"]+)"/i
  );
  return match ? match[1] || match[2] : null;
}

/**
 * Verifica se o erro é relacionado a SQL
 */
function isSQLError(errorMessage: string): boolean {
  return (
    errorMessage.includes("SQLSTATE") ||
    errorMessage.includes("violates") ||
    errorMessage.includes("constraint") ||
    errorMessage.includes("duplicate key")
  );
}

/**
 * Parse de erro SQL
 */
function parseSQLError(errorMessage: string): ParsedError | null {
  const normalizedMessage = errorMessage.toLowerCase();

  // Tentar extrair constraint
  const constraint = extractConstraint(errorMessage);
  if (constraint) {
    const mapping = DATABASE_CONSTRAINTS[constraint];
    if (mapping) {
      return {
        type: "field",
        field: mapping.field,
        message: mapping.message,
        originalError: errorMessage,
      };
    }
  }

  // Tentar padrões SQL genéricos
  for (const { pattern, getMessage } of SQL_ERROR_PATTERNS) {
    const match = errorMessage.match(pattern);
    if (match) {
      return {
        type: "general",
        message: getMessage(match),
        originalError: errorMessage,
      };
    }
  }

  return null;
}

/**
 * Parse de erro do backend
 */
function parseBackendError(errorMessage: string): ParsedError | null {
  const normalizedMessage = errorMessage.toLowerCase();

  for (const { pattern, message, field } of BACKEND_ERROR_PATTERNS) {
    const isMatch =
      typeof pattern === "string"
        ? normalizedMessage.includes(pattern.toLowerCase())
        : pattern.test(errorMessage);

    if (isMatch) {
      return {
        type: field ? "field" : "general",
        field,
        message,
        originalError: errorMessage,
      };
    }
  }

  return null;
}

/**
 * Função principal para processar erros
 * Recebe uma mensagem de erro bruta e retorna um erro processado e traduzido
 */
export function parseError(error: unknown): ParsedError {
  let errorMessage: string;

  // Extrair mensagem do erro
  if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === "string") {
    errorMessage = error;
  } else {
    errorMessage = "Erro desconhecido ao processar a solicitação.";
  }

  // 1. Verificar se é erro SQL
  if (isSQLError(errorMessage)) {
    const sqlError = parseSQLError(errorMessage);
    if (sqlError) return sqlError;
  }

  // 2. Verificar padrões conhecidos do backend
  const backendError = parseBackendError(errorMessage);
  if (backendError) return backendError;

  // 3. Verificar código de status HTTP
  const statusCode = extractStatusCode(errorMessage);
  if (statusCode && HTTP_ERROR_MESSAGES[statusCode]) {
    return {
      type: "general",
      message: HTTP_ERROR_MESSAGES[statusCode],
      originalError: errorMessage,
    };
  }

  // 4. Retornar mensagem genérica
  return {
    type: "general",
    message:
      "Ocorreu um erro ao processar sua solicitação. Tente novamente ou entre em contato com o suporte.",
    originalError: errorMessage,
  };
}

/**
 * Helper para obter uma mensagem amigável de um erro
 */
export function getErrorMessage(error: unknown): string {
  const parsed = parseError(error);
  return parsed.message;
}

/**
 * Helper para verificar se o erro é de um campo específico
 */
export function isFieldError(error: unknown): boolean {
  const parsed = parseError(error);
  return parsed.type === "field";
}

/**
 * Helper para obter o campo relacionado ao erro
 */
export function getErrorField(error: unknown): string | undefined {
  const parsed = parseError(error);
  return parsed.field;
}
