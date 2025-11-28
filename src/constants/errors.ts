/**
 * Error messages used across the application
 * Centralized for consistency and easy updates
 */

export const ERROR_MESSAGES = {
    AUTH: {
        NOT_AUTHENTICATED: 'Usuário não autenticado',
        UNAUTHORIZED: 'Sem permissão para esta ação',
        SESSION_EXPIRED: 'Sessão expirada. Faça login novamente',
    },

    USER: {
        NOT_FOUND: 'Usuário não encontrado',
        ALREADY_EXISTS: 'Usuário já existe',
        EMAIL_IN_USE: 'Email já está em uso',
        INVALID_EMAIL: 'Email inválido',
    },

    FAMILY: {
        NOT_FOUND: 'Família não encontrada',
        ALREADY_MEMBER: 'Você já pertence a uma família',
        NOT_MEMBER: 'Você não é membro desta família',
        NOT_ADMIN: 'Apenas administradores podem realizar esta ação',
    },

    INVITE: {
        NOT_FOUND: 'Convite não encontrado',
        EXPIRED: 'Convite expirado',
        ALREADY_ACCEPTED: 'Convite já foi aceito',
        ALREADY_MEMBER: 'Usuário já é membro da família',
        INVALID_TOKEN: 'Token de convite inválido',
        EMAIL_MISMATCH: 'Email não corresponde ao convite',
    },

    ACCOUNT: {
        ALREADY_DELETED: 'Conta já marcada para deleção',
        NOT_DELETED: 'Conta não está marcada para deleção',
        RECOVERY_EXPIRED: 'Período de recuperação expirou',
    },

    TRANSACTION: {
        NOT_FOUND: 'Transação não encontrada',
        INVALID_AMOUNT: 'Valor inválido',
        INVALID_DATE: 'Data inválida',
        MISSING_CATEGORY: 'Categoria é obrigatória',
    },

    BUDGET: {
        NOT_FOUND: 'Orçamento não encontrado',
        OVERLAPPING: 'Já existe orçamento para este período',
    },

    GOAL: {
        NOT_FOUND: 'Meta não encontrada',
        ALREADY_COMPLETED: 'Meta já foi concluída',
    },

    VALIDATION: {
        REQUIRED_FIELD: 'Campo obrigatório',
        INVALID_FORMAT: 'Formato inválido',
        MIN_LENGTH: 'Mínimo de {min} caracteres',
        MAX_LENGTH: 'Máximo de {max} caracteres',
    },

    SERVER: {
        INTERNAL_ERROR: 'Erro interno do servidor',
        DATABASE_ERROR: 'Erro no banco de dados',
        NETWORK_ERROR: 'Erro de conexão',
    },
} as const
