import { z } from "zod";

export const clientFormSchema = z.object({
  email: z
    .string()
    .min(1, "Email é obrigatório")
    .email("Email deve ter um formato válido"),
  name: z.string().min(1, "Nome é obrigatório"),
  surname: z.string().min(1, "Sobrenome é obrigatório"),
  phone: z
    .string()
    .min(1, "Telefone é obrigatório")
    .regex(/^[\d\s\-\(\)\+]+$/, "Telefone deve conter apenas números"),
});

export type ClientFormData = z.infer<typeof clientFormSchema>;
