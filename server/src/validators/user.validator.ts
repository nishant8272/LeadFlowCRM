import { z } from 'zod';

export const createUserSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').max(100),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    role: z.enum(['ADMIN', 'MEMBER']).default('MEMBER'),
    avatar: z.string().url('Avatar must be a valid URL').optional().or(z.literal('')),
    isActive: z.boolean().optional(),
  }),
});

export const updateUserSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    email: z.string().email('Invalid email address').optional(),
    password: z.string().min(6).optional(),
    role: z.enum(['ADMIN', 'MEMBER']).optional(),
    avatar: z.string().url().optional().or(z.literal('')),
    isActive: z.boolean().optional(),
  }),
});
