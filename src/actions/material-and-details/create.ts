import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  createFullMaterialHierarchyRequestSchema,
  materialInputSchema,
  materialSchema,
} from "@/lib/validations/contact";

const MATERIALS_URL = process.env.NEXT_PUBLIC_API_URL_M;
const FULL_HIERARCHY_URL = process.env.NEXT_PUBLIC_API_URL_Mplus;

export async function createMaterial(
  input: z.infer<typeof materialInputSchema>,
) {
  const parsedInput = materialInputSchema.parse(input);
  const res = await fetch(MATERIALS_URL as string, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(parsedInput),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.detail || "Falha ao criar o material");
  }
  revalidatePath("/dashboard/materials");
  const data = await res.json();
  return materialSchema.parse(data);
}

export async function createFullHierarchyMaterial(
  input: z.infer<typeof createFullMaterialHierarchyRequestSchema>,
) {
  const parsedInput = createFullMaterialHierarchyRequestSchema.parse(input);
  const res = await fetch(FULL_HIERARCHY_URL as string, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(parsedInput),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(
      errorData.detail || "Falha ao criar o material com hierarquia completa",
    );
  }
  revalidatePath("/dashboard/materials");
  const data = await res.json();
  return materialSchema.parse(data);
}
