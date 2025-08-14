"use server";

import { createSafeActionClient } from "next-safe-action";
import { z } from "zod";

const actionClient = createSafeActionClient();

export interface SubbMaterialSolidworks {
  id_sub: string;
  idMaterialSolidWorks: string;
  name: string;
  descricao: string;
}

export const getSubMaterialSolidworks = actionClient
  .schema(z.object({}))
  .action(async () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL_SD;

    if (!apiUrl) {
      return {
        success: false,
        message: "URL da API de sub-bancos não definida.",
      };
    }

    try {
      const response = await fetch(apiUrl, { next: { revalidate: 0 } });

      if (!response.ok) {
        return {
          success: false,
          message: "Falha ao carregar a lista de sub-bancos.",
        };
      }

      const data = await response.json();

      if (!data || !Array.isArray(data)) {
        return {
          success: false,
          message: "Dados da API em formato inválido.",
        };
      }

      return {
        success: true,
        message: "Sub-bancos carregados com sucesso.",
        data: data,
      };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: "Erro inesperado ao carregar dados.",
      };
    }
  });
