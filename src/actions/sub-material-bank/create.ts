"use server";

import { createSafeActionClient } from "next-safe-action";
import { z } from "zod";

const actionClient = createSafeActionClient();

const createSchema = z.object({
  name: z.string().min(1, { message: "O nome é obrigatório." }),
  idBliblioteca: z.string().min(1, { message: "A biblioteca é obrigatória." }),
});

export const subcreateMaterialSolidworks = actionClient
  .schema(createSchema)
  .action(async ({ parsedInput }) => {
    const { name, idBliblioteca } = parsedInput;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL_SD;

    if (!apiUrl) {
      return {
        success: false,
        message: "URL da API de bancos de dados não definida.",
      };
    }

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, idBliblioteca }),
      });

      if (!response.ok) {
        return {
          success: false,
          message: "Falha ao criar o banco de dados.",
        };
      }

      return {
        success: true,
        message: "Banco de dados criado com sucesso.",
      };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: "Erro inesperado ao criar.",
      };
    }
  });
