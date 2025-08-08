// src/actions/get-libraries/index.ts
"use server";

import { revalidateTag } from "next/cache";
import { createSafeActionClient } from "next-safe-action";

const actionClient = createSafeActionClient();

// ✅ As interfaces estão corretas
interface LibraryApiResponse {
  id_lib: string;
  name: string;
  materiaisSolidWorks: null;
}

interface Library {
  id: string;
  name: string;
}

export const getLibraries = actionClient.action(async () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL_B;

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
      next: { tags: ["libraries"], revalidate: 0 },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      return {
        success: false,
        message: error?.message || "Erro desconhecido da API.",
        data: null,
      };
    }

    const librariesData = await response.json();

    if (!Array.isArray(librariesData)) {
      return {
        success: false,
        message: "Dados da API em formato inválido.",
      };
    }

    // ✅ CORREÇÃO: Mapeamos o array de retorno da API para a interface `Library`
    const libraries: Library[] = librariesData.map(
      (lib: LibraryApiResponse) => ({
        id: lib.id_lib,
        name: lib.name,
      }),
    );

    return {
      success: true,
      message: "Bibliotecas carregadas com sucesso!",
      data: libraries,
    };
  } catch (error) {
    console.error("Erro ao carregar bibliotecas:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? `Erro de rede: ${error.message}`
          : "Erro inesperado.",
      data: null,
    };
  }
});
