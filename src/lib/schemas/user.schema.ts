import { z } from 'zod';

/**
 * Schema de validação para atualização de usuário
 */
export const updateUserSchema = z.object({
    name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome muito longo').optional(),
    email: z.string().email('Email inválido').optional(),
    access_status: z.enum(['active', 'waitlist', 'blocked']).optional(),
    user_type: z.enum(['super_admin', 'admin', 'user']).optional(),
});

/**
 * Schema de validação para aprovação de usuário (admin)
 */
export const approveUserSchema = z.object({
    user_id: z.string().uuid('ID de usuário inválido'),
    access_status: z.enum(['active', 'blocked']),
});

/**
 * Schema de validação para filtros de usuário
 */
export const userFiltersSchema = z.object({
    access_status: z.enum(['active', 'waitlist', 'blocked']).optional(),
    user_type: z.enum(['super_admin', 'admin', 'user']).optional(),
    search: z.string().max(100).optional(),
});

/**
 * Tipos TypeScript inferidos dos schemas
 */
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type ApproveUserInput = z.infer<typeof approveUserSchema>;
export type UserFilters = z.infer<typeof userFiltersSchema>;
