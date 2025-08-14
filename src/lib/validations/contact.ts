// src/lib/validations/contact.ts
import { z } from "zod";

export const contactSchema = z.object({
  message: z
    .string()
    .min(1, "A mensagem não pode ser vazia.")
    .max(500, "A mensagem não pode ter mais de 500 caracteres."),
});

export const blibliotecaSchema = z.object({
  id_lib: z.string().uuid(),
  name: z.string().min(1, "O nome da biblioteca é obrigatório"),
  description: z.string().nullable(),
  date: z.string().datetime(),
});

export const materialSolidWorksSchema = z.object({
  id_bank: z.string().uuid(),
  IdBliblioteca: z.string().uuid(),
  name: z.string().min(1, "O nome do banco é obrigatório"),
  description: z.string().nullable(),
  date: z.string().datetime(),
  Bliblioteca: blibliotecaSchema.optional().nullable(),
});

export const subMaterialSolidWorksSchema = z.object({
  id_sub: z.string().uuid(),
  IdMaterialSolidWorks: z.string().uuid(),
  name: z.string().min(1, "O nome do sub-banco é obrigatório"),
  description: z.string().nullable(),
  date: z.string().datetime(),
  MaterialSolidWorks: materialSolidWorksSchema.optional().nullable(),
});

export const materialSchema = z.object({
  id_material: z.string().uuid(),
  IdSubMaterialSolidWorks: z.string().uuid().nullable(),
  name: z.string().min(1, "O nome do material é obrigatório"),
  mat_id: z
    .number()
    .int()
    .min(1, "O MatId deve ser um número inteiro positivo")
    .nullable(),
  description: z.string().nullable(),
  date: z.string().datetime().nullable(),
  env_data: z.string().nullable(),
  app_data: z.string().nullable(),
  name_reduz: z.string().nullable(),
  angule: z.string().nullable(),
  color: z.string().nullable(),
  density: z.string().nullable(),
  elastic_module: z.string().nullable(),
  tensile_strength: z.string().nullable(),
  thermal_conductivity: z.string().nullable(),
  thermal_expansion: z.string().nullable(),
  SubMaterialSolidWorks: subMaterialSolidWorksSchema.optional().nullable(),
});

export const createFullMaterialHierarchyRequestSchema = z.object({
  MaterialName: z.string().min(1, "O nome do material é obrigatório."),
  MatId: z.number().int().nullable().optional(),
  Description: z.string().nullable().optional(),
  BlibliotecaId: z.string().uuid().nullable().optional(),
  BlibliotecaName: z.string().nullable().optional(),
  BancoId: z.string().uuid().nullable().optional(),
  BancoName: z.string().nullable().optional(),
  SubBancoId: z.string().uuid().nullable().optional(),
  SubBancoName: z.string().nullable().optional(),
});

export const updateMaterialRequestSchema = z.object({
  id_material: z.string().uuid(),
  MaterialName: z
    .string()
    .min(1, "O nome do material é obrigatório.")
    .optional(),
  MatId: z
    .number()
    .int()
    .min(1, "O MatId deve ser um número inteiro positivo.")
    .nullable()
    .optional(),
  Description: z.string().nullable().optional(),
});

export const deleteMaterialRequestSchema = z.object({
  id: z.string().uuid(),
});

export type Material = z.infer<typeof materialSchema>;
export type MaterialSolidWorks = z.infer<typeof materialSolidWorksSchema>;
export type SubMaterialSolidWorks = z.infer<typeof subMaterialSolidWorksSchema>;
export type Bliblioteca = z.infer<typeof blibliotecaSchema>;
