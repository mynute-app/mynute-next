// src/schemas/company-register.ts
import { z } from "zod";

export const companyRegisterSchema = z.object({
  name: z.string().min(1, "Nome da empresa é obrigatório"),
  tax_id: z.string().min(14, "CNPJ inválido"),
  owner_name: z.string().min(1, "Nome é obrigatório"),
  owner_surname: z.string().min(1, "Sobrenome é obrigatório"),
  owner_email: z.string().email("E-mail inválido"),
  owner_phone: z.string().min(10, "Telefone inválido"),
  owner_password: z
    .string()
    .min(6, "A senha precisa ter no mínimo 6 caracteres"),
});

export type CompanyRegisterSchema = z.infer<typeof companyRegisterSchema>;
