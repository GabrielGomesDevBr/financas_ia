/**
 * Application Constants
 * Centralized configuration values
 */

export const APP_CONFIG = {
    name: 'Assistente Financeiro IA',
    version: '1.0.0',
    description: 'Gestão financeira pessoal e familiar com IA',
} as const

export const OPENAI_CONFIG = {
    model: 'gpt-4o',
    maxTokens: 1000,
    temperature: 0.7,
} as const

export const PERIOD_OPTIONS = {
    '7d': { label: 'Últimos 7 dias', days: 7 },
    '30d': { label: 'Últimos 30 dias', days: 30 },
    '90d': { label: 'Últimos 90 dias', days: 90 },
    '1y': { label: 'Último ano', days: 365 },
    'all': { label: 'Tudo', days: null },
    'custom': { label: 'Personalizado', days: null },
} as const

export const DEFAULT_PERIOD = '30d' as const

export const CHAT_CONFIG = {
    maxMessages: 50,
    maxHistoryLength: 20,
    typingDelay: 100,
} as const

export const PAGINATION = {
    defaultPageSize: 20,
    maxPageSize: 100,
} as const

export const ROUTES = {
    public: ['/login', '/waitlist', '/blocked', '/auth/callback'],
    admin: ['/admin'],
    dashboard: '/dashboard',
    chat: '/chat',
    transactions: '/transactions',
    settings: '/settings',
} as const

export const USER_TYPES = {
    SUPER_ADMIN: 'super_admin',
    ADMIN: 'admin',
    USER: 'user',
} as const

export const ACCESS_STATUS = {
    ACTIVE: 'active',
    WAITLIST: 'waitlist',
    BLOCKED: 'blocked',
} as const

export const TRANSACTION_TYPES = {
    INCOME: 'income',
    EXPENSE: 'expense',
} as const
