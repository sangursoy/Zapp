import { z } from 'zod';

export const profileSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be less than 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(50, 'First name must be less than 50 characters'),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be less than 50 characters'),
  bio: z
    .string()
    .max(500, 'Bio must be less than 500 characters')
    .optional(),
  avatarUrl: z
    .string()
    .url('Invalid avatar URL')
    .optional()
});

export const contentSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(100, 'Title must be less than 100 characters'),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(2000, 'Description must be less than 2000 characters'),
  type: z.enum(['text', 'image', 'video']),
  mediaUrl: z.string().url().optional(),
  tags: z.array(z.string()).max(5, 'Maximum 5 tags allowed')
});

export const messageSchema = z.object({
  text: z
    .string()
    .min(1, 'Message cannot be empty')
    .max(1000, 'Message must be less than 1000 characters')
});

export type ProfileFormData = z.infer<typeof profileSchema>;
export type ContentFormData = z.infer<typeof contentSchema>;
export type MessageFormData = z.infer<typeof messageSchema>;