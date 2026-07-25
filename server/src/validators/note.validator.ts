import { z } from 'zod';

export const createNoteSchema = z.object({
  body: z.object({
    message: z.string().min(1, 'Note message is required').max(1000),
  }),
});
