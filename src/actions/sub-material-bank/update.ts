"use server";

import { createSafeActionClient } from "next-safe-action";
import { z } from "zod";

const actionClient = createSafeActionClient();

const updateSchema = z.object({
  id_sub: z.string(),
  name: z.string().min(1, { message: "O nome é obrigatório." }),
  idMaterialSolidWorks: z
    .string()
    .min(1, { message: "O banco de dados é obrigatório." }),
});

export const updateSubMaterialSolidworks = actionClient
  .schema(updateSchema)
  .action(async ({ parsedInput }) => {
    const { id_sub, name, idMaterialSolidWorks } = parsedInput;

    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL_SD}/${id_sub}`;

    if (!apiUrl) {
      return {
        success: false,
        message: "URL da API de sub-bancos não definida.",
      };
    }

    try {
      const response = await fetch(apiUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id_sub, name, idMaterialSolidWorks }),
      });

      if (!response.ok) {
        return {
          success: false,
          message: "Falha ao atualizar o sub-banco.",
        };
      }

      return {
        success: true,
        message: "Sub-banco atualizado com sucesso.",
      };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: "Erro inesperado ao atualizar.",
      };
    }
  });
