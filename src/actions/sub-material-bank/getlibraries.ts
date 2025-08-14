"use server";

import { createSafeActionClient } from "next-safe-action";
import { z } from "zod";

const actionClient = createSafeActionClient();

export interface Library {
  id: number;
  nome: string;
  descricao: string;
}

export const getLibraries2 = actionClient
  .schema(z.object({}))
  .action(async () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL_B;

    if (!apiUrl) {
      return {
        success: false,
        message: "Erro: URL da API de bibliotecas não definida.",
      };
    }

    try {
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        next: { revalidate: 0 },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        return {
          success: false,
          message:
            error?.message ||
            `Erro da API: ${response.status} ${response.statusText}`,
        };
      }

      const data: Library[] = await response.json();

      if (!Array.isArray(data)) {
        return {
          success: false,
          message: "Dados da API de bibliotecas em formato inválido.",
        };
      }

      return {
        success: true,
        message: "Bibliotecas carregadas com sucesso!",
        data,
      };
    } catch (error) {
      console.error("Erro ao carregar bibliotecas:", error);
      return {
        success: false,
        message:
          error instanceof Error
            ? `Erro de rede: ${error.message}`
            : "Erro inesperado ao carregar bibliotecas.",
      };
    }
  });
