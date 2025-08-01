"use server";

import { createSafeActionClient } from "next-safe-action";
import { z } from "zod";

const actionClient = createSafeActionClient();

export interface Library {
  id_lib: string;
  name: string;
}

export const getLibraries = actionClient
  .schema(z.object({}))
  .action(async () => {
    // **AVISO:** Substitua esta URL pelo endpoint real da sua API de bibliotecas.
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL_D}/libraries`;

    if (!apiUrl) {
      return {
        success: false,
        message: "URL da API de bibliotecas não definida.",
      };
    }

    try {
      const response = await fetch(apiUrl, { next: { revalidate: 3600 } });

      if (!response.ok) {
        return {
          success: false,
          message: "Falha ao carregar a lista de bibliotecas.",
        };
      }

      const data = await response.json();

      if (!data || !Array.isArray(data.$values)) {
        return {
          success: false,
          message: "Dados da API de bibliotecas em formato inválido.",
        };
      }

      return {
        success: true,
        message: "Bibliotecas carregadas com sucesso.",
        data: data.$values as Library[],
      };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: "Erro inesperado ao carregar dados de bibliotecas.",
      };
    }
  });
