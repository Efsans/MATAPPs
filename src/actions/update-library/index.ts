"use server";

import { revalidateTag } from "next/cache";
import { createSafeActionClient } from "next-safe-action";
import { z } from "zod";

const updateLibrarySchema = z.object({
  id: z.string().uuid("ID de biblioteca inválido."),
  name: z.string().min(1, "O nome da biblioteca é obrigatório."),
});

const actionClient = createSafeActionClient();

export const updateLibrary = actionClient
  .schema(updateLibrarySchema)
  .action(async ({ parsedInput }) => {
    const { id, name } = parsedInput;
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL_B}/${id}`;

    if (!apiUrl) {
      console.error(
        "Erro de configuração: NEXT_PUBLIC_API_URL_B não definida.",
      );
      return {
        success: false,
        message: "Erro de configuração: NEXT_PUBLIC_API_URL_B não definida.",
      };
    }

    try {
      // ✅ CORREÇÃO: Construindo o corpo da requisição exatamente como a API espera
      const requestBody = {
        id_lib: id,
        name: name,
        materiaisSolidWorks: [], // Enviado como array vazio para satisfazer o contrato da API
      };

      const response = await fetch(apiUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        return {
          success: false,
          message: error?.message || "Erro ao alterar a biblioteca.",
        };
      }

      revalidateTag("libraries");

      return {
        success: true,
        message: "Biblioteca alterada com sucesso!",
      };
    } catch (error) {
      console.error("Erro ao alterar biblioteca:", error);
      return {
        success: false,
        message:
          error instanceof Error
            ? `Erro de rede: ${error.message}`
            : "Erro inesperado.",
      };
    }
  });
