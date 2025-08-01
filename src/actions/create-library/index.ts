// src/actions/create-library/index.ts
"use server";

import { revalidateTag } from "next/cache";
import { createSafeActionClient } from "next-safe-action";
import { z } from "zod";

// ✅ Esquema de validação para a criação de uma nova biblioteca
const createLibrarySchema = z.object({
  name: z.string().min(1, "O nome da biblioteca é obrigatório."),
});

const actionClient = createSafeActionClient();

export const createLibrary = actionClient
  .schema(createLibrarySchema)
  .action(async ({ parsedInput }) => {
    const { name } = parsedInput;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL_B;

    if (!apiUrl) {
      return {
        success: false,
        message: "Erro de configuração: NEXT_PUBLIC_API_URL_B não definida.",
      };
    }

    // ✅ Corrigido: O payload enviado agora é { name }
    const corpo = {
      name: name,
    };

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(corpo),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        return {
          success: false,
          message: error?.message || "Erro desconhecido da API.",
        };
      }

      revalidateTag("libraries"); // ✅ Corrigido: Revalida o cache após a criação

      return {
        success: true,
        message: "Biblioteca criada com sucesso!",
      };
    } catch (error) {
      console.error("Erro ao criar biblioteca:", error);
      return {
        success: false,
        message:
          error instanceof Error
            ? `Erro de rede: ${error.message}`
            : "Erro inesperado.",
      };
    }
  });
