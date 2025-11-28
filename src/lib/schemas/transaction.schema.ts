import { z } from 'zod';

/**
 * Schema de validação para criação de transação
 */
export const createTransactionSchema = z.object({
    type: z.enum(['income', 'expense'], {
        errorMap: () => ({ message: 'Tipo deve ser "income" ou "expense"' }),
    }),
    amount: z.number().positive('Valor deve ser maior que zero'),
    description: z.string().min(1, 'Descrição é obrigatória').max(500, 'Descrição muito longa (máximo 500 caracteres)'),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD'),
    category_id: z.string().uuid('ID de categoria inválido').optional(),
    user_id: z.string().uuid('ID de usuário inválido').optional(),
    source: z.enum(['manual', 'chat']).default('manual'),
});

/**
 * Schema de validação para atualização de transação
 */
export const updateTransactionSchema = createTransactionSchema.partial();

/**
 * Schema de validação para filtros de transação
 */
export const transactionFiltersSchema = z.object({
    type: z.enum(['income', 'expense']).optional(),
    category_id: z.string().uuid().optional(),
    user_id: z.string().uuid().optional(),
    start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    source: z.enum(['manual', 'chat']).optional(),
});

/**
 * Tipos TypeScript inferidos dos schemas
 */
export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
export type TransactionFilters = z.infer<typeof transactionFiltersSchema>;
