import { z } from "zod";

export const BusinessSchema = z.object({
  businessName: z.string().min(2, "Nome é obrigatório"),
});
