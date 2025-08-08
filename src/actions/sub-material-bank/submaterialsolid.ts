"use server";

import { createSafeActionClient } from "next-safe-action";
import { z } from "zod";

const actionClient = createSafeActionClient();

export interface Library {
  id_lib: string;
  name: string;
}

export const getBank = actionClient.schema(z.object({})).action(async () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL_D;

  if (!apiUrl) {
    console.error("Erro de configuração: NEXT_PUBLIC_API_URL_B não definida.");
    return {
      success: false,
      message: "Erro de configuração: NEXT_PUBLIC_API_URL_B não definida.",
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
        message: error?.message || "Erro desconhecido da API.",
      };
    }

    const data_lib = await response.json();

    if (!Array.isArray(data_lib)) {
      return {
        success: false,
        message: "Dados da API de bibliotecas em formato inválido.",
      };
    }

    return {
      success: true,
      message: "Bibliotecas carregadas com sucesso!",
      data: data_lib,
    };
  } catch (error) {
    console.error("Erro ao carregar bibliotecas:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? `Erro de rede: ${error.message}`
          : "Erro inesperado.",
    };
  }
});
