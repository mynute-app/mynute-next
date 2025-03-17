import { z } from "zod";

export const registerSchema = z
  .object({
    name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
    surname: z.string().min(3, "O sobrenome deve ter pelo menos 3 caracteres"),
    email: z.string().email("Digite um email válido"),
    password: z
      .string()
      .min(6, "A senha deve ter pelo menos 6 caracteres")
      .max(16, "A senha pode ter no máximo 16 caracteres")
      .regex(/[A-Z]/, "A senha deve conter pelo menos uma letra maiúscula")
      .regex(/[a-z]/, "A senha deve conter pelo menos uma letra minúscula")
      .regex(/[0-9]/, "A senha deve conter pelo menos um número")
      .regex(/[^A-Za-z0-9]/, "A senha deve conter pelo menos um caractere especial"),
    confirmPassword: z.string(),
    phone: z
      .string()
      .min(10, "O telefone deve ter pelo menos 10 dígitos")
      .max(11, "O telefone deve ter no máximo 11 dígitos"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;