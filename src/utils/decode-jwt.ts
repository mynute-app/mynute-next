/**
 * Tipo que representa os dados do usuário no JWT
 */
export interface JWTUserData {
  id: string;
  name: string;
  surname: string;
  email: string;
  phone: string;
  verified: boolean;
  company_id: string;
}

/**
 * Tipo que representa o payload completo do JWT
 */
export interface JWTPayload {
  data: JWTUserData;
  exp: number;
}

/**
 * Decodifica um JWT token e retorna os dados do usuário
 * @param token - O JWT token (com ou sem 'Bearer ')
 * @returns Os dados do usuário ou null se inválido
 */
export function decodeJWTToken(token: string): JWTUserData | null {
  try {
    // Remove o prefixo 'Bearer ' se existir
    const cleanToken = token.replace(/^Bearer\s+/, "");

    // Decodifica o payload (segunda parte do JWT)
    const base64Payload = cleanToken.split(".")[1];
    const decodedPayload = atob(base64Payload);
    const payload: JWTPayload = JSON.parse(decodedPayload);

    return payload.data;
  } catch (error) {
    console.error("Erro ao decodificar JWT:", error);
    return null;
  }
}

/**
 * Extrai o company_id do JWT token
 * @param token - O JWT token
 * @returns O company_id ou null se não encontrado
 */
export function getCompanyIdFromToken(token: string): string | null {
  const userData = decodeJWTToken(token);
  return userData?.company_id || null;
}

/**
 * Extrai informações essenciais do JWT token para uso em rotas
 * @param token - O JWT token
 * @returns Objeto com email, company_id e dados completos do usuário
 */
export function getAuthDataFromToken(token: string) {
  const userData = decodeJWTToken(token);

  if (!userData) {
    return {
      email: null,
      companyId: null,
      user: null,
      isValid: false,
    };
  }

  return {
    email: userData.email,
    companyId: userData.company_id,
    user: userData,
    isValid: true,
  };
}

/**
 * Função completa que busca o token da requisição e extrai todas as informações
 * @param req - A requisição Next.js com NextAuth
 * @returns Objeto completo com token, email, company_id, dados do usuário e status de validação
 */
export function getAuthDataFromRequest(req: {
  auth?: { accessToken?: string } | null;
}) {
  const token = req.auth?.accessToken;
  console.log("Token recebido do NextAuth:", token);

  if (!token) {
    return {
      token: null,
      email: null,
      companyId: null,
      user: null,
      isValid: false,
      error: "Token não encontrado no NextAuth",
    };
  }

  // Decodifica o token
  const userData = decodeJWTToken(token);

  if (!userData) {
    return {
      token: token,
      email: null,
      companyId: null,
      user: null,
      isValid: false,
      error: "Token inválido ou não foi possível decodificar",
    };
  }

  return {
    token: token,
    email: userData.email,
    companyId: userData.company_id,
    user: userData,
    isValid: true,
    error: null,
  };
}
