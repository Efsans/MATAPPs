import { z } from "zod";

import {
  colorSchema,
  customPropertySchema,
  physicalPropertySchema,
  shaderSchema,
} from "@/lib/validations/contact";

const DETALHES_URL = process.env.NEXT_PUBLIC_API_URL_DET;

export async function getShadersByMaterial(idMaterial: string) {
  const res = await fetch(`${DETALHES_URL}/${idMaterial}/shaders`);
  if (!res.ok) {
    throw new Error("Falha ao obter os shaders");
  }
  const data = await res.json();
  return z.array(shaderSchema).parse(data);
}

export async function getColorsByMaterial(idMaterial: string) {
  const res = await fetch(`${DETALHES_URL}/${idMaterial}/colors`);
  if (!res.ok) {
    throw new Error("Falha ao obter as cores");
  }
  const data = await res.json();
  return z.array(colorSchema).parse(data);
}

export async function getCustomsByMaterial(idMaterial: string) {
  const res = await fetch(`${DETALHES_URL}/${idMaterial}/custom`);
  if (!res.ok) {
    throw new Error("Falha ao obter as propriedades custom");
  }
  const data = await res.json();
  return z.array(customPropertySchema).parse(data);
}

export async function getPhysicalsByMaterial(idMaterial: string) {
  const res = await fetch(`${DETALHES_URL}/${idMaterial}/physical`);
  if (!res.ok) {
    throw new Error("Falha ao obter as propriedades físicas");
  }
  const data = await res.json();
  return z.array(physicalPropertySchema).parse(data);
}
