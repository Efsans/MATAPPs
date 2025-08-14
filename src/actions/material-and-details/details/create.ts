import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  colorInputSchema,
  colorSchema,
  customPropertyInputSchema,
  customPropertySchema,
  physicalPropertyInputSchema,
  physicalPropertySchema,
  shaderInputSchema,
  shaderSchema,
} from "@/lib/validations/contact";

const DETALHES_URL = process.env.NEXT_PUBLIC_API_URL_DET;

export async function createShader(
  idMaterial: string,
  input: z.infer<typeof shaderInputSchema>,
) {
  const parsedInput = shaderInputSchema.parse(input);
  const res = await fetch(`${DETALHES_URL}/${idMaterial}/shaders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ...parsedInput, IdMaterial: idMaterial }),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.detail || "Falha ao criar o shader");
  }
  revalidatePath("/dashboard/materials");
  const data = await res.json();
  return shaderSchema.parse(data);
}

export async function createColor(
  idMaterial: string,
  input: z.infer<typeof colorInputSchema>,
) {
  const parsedInput = colorInputSchema.parse(input);
  const res = await fetch(`${DETALHES_URL}/${idMaterial}/colors`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ...parsedInput, IdMaterial: idMaterial }),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.detail || "Falha ao criar a cor");
  }
  revalidatePath("/dashboard/materials");
  const data = await res.json();
  return colorSchema.parse(data);
}

export async function createCustomProperty(
  idMaterial: string,
  input: z.infer<typeof customPropertyInputSchema>,
) {
  const parsedInput = customPropertyInputSchema.parse(input);
  const res = await fetch(`${DETALHES_URL}/${idMaterial}/custom`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ...parsedInput, IdMaterial: idMaterial }),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.detail || "Falha ao criar a propriedade custom");
  }
  revalidatePath("/dashboard/materials");
  const data = await res.json();
  return customPropertySchema.parse(data);
}

export async function createPhysicalProperty(
  idMaterial: string,
  input: z.infer<typeof physicalPropertyInputSchema>,
) {
  const parsedInput = physicalPropertyInputSchema.parse(input);
  const res = await fetch(`${DETALHES_URL}/${idMaterial}/physical`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ...parsedInput, IdMaterial: idMaterial }),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.detail || "Falha ao criar a propriedade física");
  }
  revalidatePath("/dashboard/materials");
  const data = await res.json();
  return physicalPropertySchema.parse(data);
}
