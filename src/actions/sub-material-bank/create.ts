"use server";

import { createSafeActionClient } from "next-safe-action";
import { z } from "zod";

const actionClient = createSafeActionClient();

const createSchema = z.object({
  name: z.string().min(1, { message: "O nome é obrigatório." }),
  idMaterialSolidWorks: z
    .string()
    .min(1, { message: "O banco de dados é obrigatório." }),
});

export const createSubMaterialSolidworks = actionClient
  .schema(createSchema)
  .action(async ({ parsedInput }) => {
    const { name, idMaterialSolidWorks } = parsedInput;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL_SD;

    if (!apiUrl) {
      return {
        success: false,
        message: "URL da API de sub-bancos não definida.",
      };
    }

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, idMaterialSolidWorks }),
      });

      if (!response.ok) {
        return {
          success: false,
          message: "Falha ao criar o sub-banco.",
        };
      }

      return {
        success: true,
        message: "Sub-banco criado com sucesso.",
      };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: "Erro inesperado ao criar.",
      };
    }
  });
