import { z } from "zod";

export const QuestionSchema = z.object({
  title: z.string().min(2).describe("A brief title of the question"),
  description: z
    .string()
    .min(2)
    .describe(
      "Detailed description of the question, including necessary context",
    ),
});

export type Question = z.infer<typeof QuestionSchema>;

export const QuestionListSchema = z.array(QuestionSchema);

export type QuestionList = z.infer<typeof QuestionListSchema>;
