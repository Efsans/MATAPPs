import { revalidatePath } from "next/cache";

const DETALHES_URL = process.env.NEXT_PUBLIC_API_URL_DET;

export async function deleteDetail(
  idMaterial: string,
  tipo: "shaders" | "colors" | "custom" | "physical",
  idDetalhe: string,
) {
  const res = await fetch(
    `${DETALHES_URL}/${idMaterial}/${tipo}/${idDetalhe}`,
    {
      method: "DELETE",
    },
  );
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.detail || "Falha ao excluir o detalhe");
  }
  revalidatePath("/dashboard/materials");
  return res.status === 204;
}
