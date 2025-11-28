import { z } from 'zod';

/**
 * Schema de validação para criação/atualização de família
 */
export const familySchema = z.object({
    name: z.string().min(1, 'Nome da família é obrigatório').max(100, 'Nome muito longo'),
});

/**
 * Schema de validação para atualização de membro da família
 */
export const updateFamilyMemberSchema = z.object({
    role: z.enum(['admin', 'member', 'dependent'], {
        errorMap: () => ({ message: 'Role deve ser "admin", "member" ou "dependent"' }),
    }),
    name: z.string().min(1).max(100).optional(),
});

/**
 * Schema de validação para convite de membro
 */
export const inviteMemberSchema = z.object({
    email: z.string().email('Email inválido'),
    role: z.enum(['admin', 'member', 'dependent']).default('member'),
    name: z.string().min(1).max(100).optional(),
});

/**
 * Tipos TypeScript inferidos dos schemas
 */
export type FamilyInput = z.infer<typeof familySchema>;
export type UpdateFamilyMemberInput = z.infer<typeof updateFamilyMemberSchema>;
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
