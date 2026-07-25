import { z } from 'zod';

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format');

export const createLeadSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Lead name is required').max(100),
    email: z.string().email('Invalid email address'),
    phone: z.string().max(20).optional().or(z.literal('')),
    company: z.string().max(100).optional().or(z.literal('')),
    source: z.string().max(100).optional().or(z.literal('')),
    status: z.enum(['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST']).optional(),
    assignedTo: objectIdSchema.nullable().optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
    tags: z.array(z.string()).optional(),
  }),
});

export const updateLeadSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    email: z.string().email('Invalid email address').optional(),
    phone: z.string().max(20).optional().or(z.literal('')),
    company: z.string().max(100).optional().or(z.literal('')),
    source: z.string().max(100).optional().or(z.literal('')),
    status: z.enum(['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST']).optional(),
    assignedTo: objectIdSchema.nullable().optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
    tags: z.array(z.string()).optional(),
  }),
});

export const assignLeadSchema = z.object({
  body: z.object({
    assignedTo: objectIdSchema.nullable(),
  }),
});

export const updateStatusSchema = z.object({
  body: z.object({
    status: z.enum(['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST']),
  }),
});
