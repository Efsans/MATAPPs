// src/lib/validations/contact.ts
import { z } from "zod";

// Define o schema de validação para o formulário de contato
export const contactSchema = z.object({
  message: z
    .string()
    .min(1, "A mensagem não pode ser vazia.")
    .max(500, "A mensagem não pode ter mais de 500 caracteres."),
});

// Infere o tipo TypeScript a partir do schema Zod
export type ContactFormValues = z.infer<typeof contactSchema>;
