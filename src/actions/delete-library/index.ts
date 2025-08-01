// src/actions/delete-library/index.ts
"use server";

import { revalidateTag } from "next/cache";
import { createSafeActionClient } from "next-safe-action";
import { z } from "zod";

const deleteLibrarySchema = z.object({
  id: z.string().uuid("ID de biblioteca inválido."),
});

const actionClient = createSafeActionClient();

export const deleteLibrary = actionClient
  .schema(deleteLibrarySchema)
  .action(async ({ parsedInput }) => {
    // ✅ Corrigido: `parsedInput` já está tipado pelo Zod
    const { id } = parsedInput;
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL_B}/${id}`;

    // ... (lógica de verificação de apiUrl)

    try {
      const response = await fetch(apiUrl, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        return {
          success: false,
          message: error?.message || "Erro ao excluir a biblioteca.",
        };
      }

      revalidateTag("libraries");

      return {
        success: true,
        message: "Biblioteca excluída com sucesso!",
      };
    } catch (error) {
      console.error("Erro ao excluir biblioteca:", error);
      return {
        success: false,
        message:
          error instanceof Error
            ? `Erro de rede: ${error.message}`
            : "Erro inesperado.",
      };
    }
  });
