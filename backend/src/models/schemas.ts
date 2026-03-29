import { z } from 'zod';

export const emotionalStateSchema = z.enum([
  'grief',
  'anxiety',
  'anger',
  'motivation-seeking',
  'spiritual-longing',
  'neutral',
]);

export const chatRequestSchema = z.object({
  conversationId: z.string().uuid().nullable().default(null),
  message: z
    .string()
    .min(1, 'Message cannot be empty')
    .max(2000, 'Message is too long (max 2000 characters)'),
  emotionalState: emotionalStateSchema.optional(),
});

export type ChatRequest = z.infer<typeof chatRequestSchema>;
