import { z } from 'zod';

export const QuestionsSchema = z.object({
  questions: z.string().min(2).describe('Questions content'),
});

export type Questions = z.infer<typeof QuestionsSchema>;

export const AnswersSchema = z.object({
  answers: z.string().min(2).describe('Answers content'),
});

export type Answers = z.infer<typeof AnswersSchema>;
