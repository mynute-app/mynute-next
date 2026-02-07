import { z } from "zod";

export const companyClientFormSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  surname: z.string().min(1, "Sobrenome é obrigatório"),
  email: z
    .string()
    .min(1, "Email é obrigatório")
    .email("Email deve ter um formato válido"),
  phone: z
    .string()
    .min(1, "Telefone é obrigatório")
    .regex(/^[\d\s\-\(\)\+]+$/, "Telefone deve conter apenas números"),
  street: z.string().optional(),
  number: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  zip_code: z.string().optional(),
});

export type CompanyClientFormData = z.infer<typeof companyClientFormSchema>;
