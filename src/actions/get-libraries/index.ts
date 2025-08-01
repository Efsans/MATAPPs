"use server";

import { revalidateTag } from "next/cache";
import { createSafeActionClient } from "next-safe-action";

const actionClient = createSafeActionClient();

// ✅ CORREÇÃO: Definimos uma interface para o formato de retorno da nossa API
interface LibraryApiResponse {
  id_lib: string;
  name: string;
  materiaisSolidWorks: null;
}

// ✅ CORREÇÃO: Definimos um tipo para o nosso objeto `Library` processado
interface Library {
  id: string;
  name: string;
}

export const getLibraries = actionClient.action(async () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL_B;
  // ... (lógica de verificação da API_URL) ...
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
      next: { tags: ["libraries"] },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      return {
        success: false,
        message: error?.message || "Erro desconhecido da API.",
        data: null,
      };
    }

    const { $values } = await response.json();

    // ✅ CORREÇÃO: Usamos a interface correta na função de map
    const libraries: Library[] = $values.map((lib: LibraryApiResponse) => ({
      id: lib.id_lib,
      name: lib.name,
    }));

    // ✅ CORREÇÃO: Garantimos que o retorno da ação tenha o tipo correto
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
