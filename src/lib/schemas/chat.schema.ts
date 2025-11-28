import { z } from 'zod';

/**
 * Schema de validação para mensagem de chat
 */
export const chatMessageSchema = z.object({
    message: z.string()
        .min(1, 'Mensagem não pode estar vazia')
        .max(2000, 'Mensagem muito longa (máximo 2000 caracteres)')
        .refine(
            (msg) => {
                // Filtro básico de prompt injection
                const suspiciousPatterns = [
                    /ignore\s+(previous|all)\s+instructions?/i,
                    /system\s*:\s*/i,
                    /you\s+are\s+now/i,
                    /forget\s+(everything|all)/i,
                ];
                return !suspiciousPatterns.some(pattern => pattern.test(msg));
            },
            { message: 'Mensagem contém padrões suspeitos' }
        ),
    conversation_id: z.string().uuid('ID de conversa inválido').optional(),
});

/**
 * Schema de validação para histórico de mensagens
 */
export const chatHistorySchema = z.object({
    limit: z.number().int().min(1).max(100).default(50),
    offset: z.number().int().min(0).default(0),
    conversation_id: z.string().uuid().optional(),
});

/**
 * Tipos TypeScript inferidos dos schemas
 */
export type ChatMessageInput = z.infer<typeof chatMessageSchema>;
export type ChatHistoryQuery = z.infer<typeof chatHistorySchema>;
