import { z } from "zod";

export const supplierFormSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  surname: z.string().optional().default(""),
  email: z
    .string()
    .min(1, "Email é obrigatório")
    .email("Email deve ter um formato válido"),
  phone: z
    .string()
    .min(1, "Telefone é obrigatório")
    .regex(
      /^[\d\s\-\(\)\+]+$/,
      "Telefone deve conter apenas números e caracteres de formatação"
    ),
  street: z.string().optional().default(""),
  number: z.string().optional().default(""),
  neighborhood: z.string().optional().default(""),
  city: z.string().optional().default(""),
  state: z.string().optional().default(""),
  country: z.string().optional().default(""),
  zip_code: z.string().optional().default(""),
});

export type SupplierFormData = z.infer<typeof supplierFormSchema>;
