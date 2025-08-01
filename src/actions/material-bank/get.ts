"use server";

import { createSafeActionClient } from "next-safe-action";
import { z } from "zod";

const actionClient = createSafeActionClient();

export interface MaterialSolidworks {
  id_bank: string;
  name: string;
  idBliblioteca: string;
}

export const getMaterialSolidworks = actionClient
  .schema(z.object({}))
  .action(async () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL_D;

    if (!apiUrl) {
      return {
        success: false,
        message: "URL da API de bancos de dados não definida.",
      };
    }

    try {
      const response = await fetch(apiUrl, { next: { revalidate: 3600 } });

      if (!response.ok) {
        return {
          success: false,
          message: "Falha ao carregar a lista de bancos de dados.",
        };
      }

      const data = await response.json();

      if (!data || !Array.isArray(data.$values)) {
        return {
          success: false,
          message: "Dados da API em formato inválido.",
        };
      }

      return {
        success: true,
        message: "Bancos de dados carregados com sucesso.",
        data: data.$values as MaterialSolidworks[],
      };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: "Erro inesperado ao carregar dados.",
      };
    }
  });
