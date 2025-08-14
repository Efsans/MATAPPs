import { revalidatePath } from "next/cache";
import { z } from "zod";

import { materialInputSchema } from "@/lib/validations/contact";

const MATERIALS_URL = process.env.NEXT_PUBLIC_API_URL_M;

export async function updateMaterial(
  id: string,
  input: z.infer<typeof materialInputSchema>,
) {
  const parsedInput = materialInputSchema.parse(input);
  const res = await fetch(`${MATERIALS_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ...parsedInput, id_material: id }),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.detail || "Falha ao atualizar o material");
  }
  revalidatePath("/dashboard/materials");
  return res.status === 204;
}
