import { revalidatePath } from "next/cache";

const MATERIALS_URL = process.env.NEXT_PUBLIC_API_URL_M;

export async function deleteMaterial(id: string) {
  const res = await fetch(`${MATERIALS_URL}/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.detail || "Falha ao excluir o material");
  }
  revalidatePath("/dashboard/materials");
  return res.status === 204;
}
