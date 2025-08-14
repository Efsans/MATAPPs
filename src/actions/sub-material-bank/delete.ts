"use server";

import { createSafeActionClient } from "next-safe-action";
import { z } from "zod";

const actionClient = createSafeActionClient();

const deleteSchema = z.object({
  id: z.string().min(1),
});

export const deleteSubMaterialSolidworks = actionClient
  .schema(deleteSchema)
  .action(async ({ parsedInput }) => {
    const { id } = parsedInput;

    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL_SD}/${id}`;

    if (!apiUrl) {
      return {
        success: false,
        message: "URL da API de sub-bancos não definida.",
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
          message: error?.message || "Falha ao excluir o sub-banco.",
        };
      }

      return {
        success: true,
        message: "Sub-banco excluído com sucesso.",
      };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: "Erro inesperado ao excluir.",
      };
    }
  });
