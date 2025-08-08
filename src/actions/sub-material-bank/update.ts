"use server";

import { createSafeActionClient } from "next-safe-action";
import { z } from "zod";

const actionClient = createSafeActionClient();

const updateSchema = z.object({
  id_bank: z.string(),
  name: z.string().min(1, { message: "O nome é obrigatório." }),
  idBliblioteca: z.string().min(1, { message: "A biblioteca é obrigatória." }),
});

export const subupdateMaterialSolidworks = actionClient
  .schema(updateSchema)
  .action(async ({ parsedInput }) => {
    const { id_bank, name, idBliblioteca } = parsedInput;

    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL_SD}/${id_bank}`;

    if (!apiUrl) {
      return {
        success: false,
        message: "URL da API de bancos de dados não definida.",
      };
    }

    try {
      const response = await fetch(apiUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, idBliblioteca, id_bank }),
      });

      if (!response.ok) {
        return {
          success: false,
          message: "Falha ao atualizar o banco de dados.",
        };
      }

      return {
        success: true,
        message: "Banco de dados atualizado com sucesso.",
      };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: "Erro inesperado ao atualizar.",
      };
    }
  });
