import { z } from "zod";

export const createTaskSchema = z.object({
  title: z
    .string({ required_error: "Título é obrigatório" })
    .min(1, "Título não pode estar vazio")
    .max(255, "Título deve ter no máximo 255 caracteres")
    .trim(),
  category: z
    .string({ required_error: "Categoria é obrigatória" })
    .min(1, "Categoria não pode estar vazia")
    .max(100, "Categoria deve ter no máximo 100 caracteres")
    .trim(),
  durationMinutes: z
    .number()
    .int("Deve ser um número inteiro")
    .min(1, "Mínimo 1 minuto")
    .max(1440, "Máximo 1440 minutos (24h)")
    .optional(),
});

export const updateTaskSchema = z.object({
  title: z
    .string()
    .min(1, "Título não pode estar vazio")
    .max(255, "Título deve ter no máximo 255 caracteres")
    .trim()
    .optional(),
  category: z
    .string()
    .min(1, "Categoria não pode estar vazia")
    .max(100, "Categoria deve ter no máximo 100 caracteres")
    .trim()
    .optional(),
  completed: z.boolean().optional(),
  durationMinutes: z
    .number()
    .int("Deve ser um número inteiro")
    .min(1, "Mínimo 1 minuto")
    .max(1440, "Máximo 1440 minutos (24h)")
    .nullable()
    .optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: "Ao menos um campo deve ser informado para atualização" }
);

export const taskIdSchema = z.object({
  id: z.string({ required_error: "ID da tarefa é obrigatório" }).uuid("ID inválido"),
});

export type CreateTaskDTO = z.infer<typeof createTaskSchema>
export type UpdateTaskDTO = z.infer<typeof updateTaskSchema>
