import { z } from "zod";

export const registerSchema = z.object({
  name: z.string({ required_error: "Nome é obrigatório" }).min(2, "Nome deve ter ao menos 2 caracteres").trim(),
  email: z.string({ required_error: "E-mail é obrigatório" }).email("E-mail inválido").toLowerCase().trim(),
  password: z
    .string({ required_error: "Senha é obrigatória" })
    .min(6, "Senha deve ter ao menos 6 caracteres"),
});

export const loginSchema = z.object({
  email: z.string({ required_error: "E-mail é obrigatório" }).email("E-mail inválido").toLowerCase().trim(),
  password: z.string({ required_error: "Senha é obrigatória" }),
});

export type RegisterDTO = z.infer<typeof registerSchema>;
export type LoginDTO = z.infer<typeof loginSchema>;
