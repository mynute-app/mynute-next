import { z } from "zod";

export const companyRegisterSchema = z
  .object({
    name: z.string().min(1, "Nome da empresa é obrigatório"),
    tax_id: z.string().min(14, "CNPJ inválido"),
    owner_name: z.string().min(1, "Nome é obrigatório"),
    owner_surname: z.string().min(1, "Sobrenome é obrigatório"),
    owner_email: z.string().email("E-mail inválido"),
    owner_phone: z
      .string()
      .min(10, "O telefone deve ter pelo menos 10 dígitos")
      .max(11, "O telefone deve ter no máximo 11 dígitos"),
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
