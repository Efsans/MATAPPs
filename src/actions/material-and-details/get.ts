import { z } from "zod";

import { materialSchema } from "@/lib/validations/contact";

const MATERIALS_URL = process.env.NEXT_PUBLIC_API_URL_M;

export async function getMaterials() {
  const res = await fetch(MATERIALS_URL as string);
  if (!res.ok) {
    throw new Error("Falha ao obter os materiais");
  }
  const data = await res.json();
  const parsedData = z
    .array(
      materialSchema.extend({
        SubMaterialSolidWorks: z.object({
          MaterialSolidWorks: z.object({
            Bliblioteca: z.any(),
          }),
        }),
      }),
    )
    .parse(data);
  return parsedData;
}

export async function getMaterial(id: string) {
  const res = await fetch(`${MATERIALS_URL}/${id}`);
  if (!res.ok) {
    if (res.status === 404) {
      return null;
    }
    throw new Error("Falha ao obter o material");
  }
  const data = await res.json();
  const parsedData = materialSchema
    .extend({
      SubMaterialSolidWorks: z.object({
        MaterialSolidWorks: z.object({
          Bliblioteca: z.any(),
        }),
      }),
    })
    .parse(data);
  return parsedData;
}
