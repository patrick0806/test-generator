import { z } from "zod"

export const questionSchema = z.object({
    description: z.string().min(1, "O enunciado é obrigatório"),
    type: z.enum(["open", "multiple-choice"]),
    options: z.array(z.string()),
})

export const testSchema = z.object({
    id: z.string(),
    school: z.string(),
    teacher: z.string().min(1, "O nome do professor é obrigatório"),
    title: z.string().min(1, "O título da prova é obrigatório"),
    date: z.string().min(1, "A data da prova é obrigatória"),
    questions: z
        .array(questionSchema)
        .min(1, "Adicione ao menos uma questão"),
})

export type QuestionInput = z.infer<typeof questionSchema>
export type TestInput = z.infer<typeof testSchema>
