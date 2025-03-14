import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  surname: z.string().min(3, "O sobrenome deve ter pelo menos 3 caracteres"),
  email: z.string().email("Digite um email válido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
  phone: z
    .string()
    .min(10, "O telefone deve ter pelo menos 10 dígitos")
    .max(11, "O telefone deve ter no máximo 11 dígitos"),
});

export type RegisterFormData = z.infer<typeof registerSchema>;
