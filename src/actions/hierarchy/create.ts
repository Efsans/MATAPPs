// src/actions/hierarchy/get.ts
import { z } from "zod";

import {
  blibliotecaSchema,
  materialSolidWorksSchema,
  subMaterialSolidWorksSchema,
} from "@/lib/validations/contact";

// Define os tipos a partir dos schemas para uso no frontend
export type Bliblioteca = z.infer<typeof blibliotecaSchema>;
export type MaterialSolidWorks = z.infer<typeof materialSolidWorksSchema>;
export type SubMaterialSolidWorks = z.infer<typeof subMaterialSolidWorksSchema>;

const BIBLIOTECA_URL = process.env.NEXT_PUBLIC_API_URL_B;
const BANCO_URL = process.env.NEXT_PUBLIC_API_URL_D;
const SUB_BANCO_URL = process.env.NEXT_PUBLIC_API_URL_SD;

export async function getBlibliotecas() {
  const res = await fetch(BIBLIOTECA_URL as string);
  if (!res.ok) {
    throw new Error("Falha ao obter as bibliotecas");
  }
  const data = await res.json();
  return z.array(blibliotecaSchema).parse(data);
}

export async function getBancos() {
  const res = await fetch(BANCO_URL as string);
  if (!res.ok) {
    throw new Error("Falha ao obter os bancos");
  }
  const data = await res.json();
  return z.array(materialSolidWorksSchema).parse(data);
}

export async function getSubBancos() {
  const res = await fetch(SUB_BANCO_URL as string);
  if (!res.ok) {
    throw new Error("Falha ao obter os sub-bancos");
  }
  const data = await res.json();
  return z.array(subMaterialSolidWorksSchema).parse(data);
}
