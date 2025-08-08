"use server";

import { createSafeActionClient } from "next-safe-action";
import { z } from "zod";

const actionClient = createSafeActionClient();

const deleteSchema = z.object({
  id_bank: z.string().min(1),
});

export const subdeleteMaterialSolidworks = actionClient
  .schema(deleteSchema)
  .action(async ({ parsedInput }) => {
    const { id_bank } = parsedInput;

    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL_SD}/${id_bank}`;

    if (!apiUrl) {
      return {
        success: false,
        message: "URL da API de bancos de dados não definida.",
      };
    }

    try {
      const response = await fetch(apiUrl, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        return {
          success: false,
          message: error?.message || "Falha ao excluir o banco de dados.",
        };
      }

      return {
        success: true,
        message: "Banco de dados excluído com sucesso.",
      };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: "Erro inesperado ao excluir.",
      };
    }
  });
