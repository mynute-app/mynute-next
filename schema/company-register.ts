import { z } from "zod";

function countDigits(value: string): number {
  return value.replace(/\D/g, "").length;
}

export const companyRegisterSchema = z
  .object({
    name: z.string().min(1, "Nome da empresa é obrigatório"),
    tax_id: z.string().refine(val => countDigits(val) === 14, {
      message: "CNPJ inválido (precisa ter 14 dígitos)",
    }),
    trading_name: z.string().min(1, "Nome fantasia é obrigatório"),
    start_subdomain: z
      .string()
      .min(3, "Subdomínio é obrigatório")
      .regex(/^[a-z0-9\-]+$/, "Use apenas letras minúsculas, números e hífens"),
    owner_name: z.string().min(1, "Nome é obrigatório"),
    owner_surname: z.string().min(1, "Sobrenome é obrigatório"),
    owner_email: z.string().email("E-mail inválido"),
    owner_phone: z.string().refine(
      val => {
        const len = countDigits(val);
        return len >= 10 && len <= 11;
      },
      {
        message: "Telefone deve ter entre 10 e 11 dígitos numéricos",
      }
    ),
    owner_password: z
      .string()
      .min(6, "A senha deve ter pelo menos 6 caracteres")
      .max(16, "A senha pode ter no máximo 16 caracteres")
      .regex(/[A-Z]/, "A senha deve conter pelo menos uma letra maiúscula")
      .regex(/[a-z]/, "A senha deve conter pelo menos uma letra minúscula")
      .regex(/[0-9]/, "A senha deve conter pelo menos um número")
      .regex(
        /[^A-Za-z0-9]/,
        "A senha deve conter pelo menos um caractere especial"
      ),
    confirmPassword: z.string(),
  })
  .refine(data => data.owner_password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

export type CompanyRegisterSchema = z.infer<typeof companyRegisterSchema>;
