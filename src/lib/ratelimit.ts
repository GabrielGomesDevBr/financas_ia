/**
 * Rate Limiting System
 * Implementa controle de taxa de requisições para prevenir abuso
 */

interface RateLimitConfig {
    /**
     * Número máximo de requisições permitidas
     */
    maxRequests: number;

    /**
     * Janela de tempo em segundos
     */
    windowSeconds: number;
}

interface RateLimitStore {
    count: number;
    resetTime: number;
}

/**
 * Store em memória para rate limiting
 * Em produção, considere usar Redis (Upstash) para distribuição entre instâncias
 */
const rateLimitStore = new Map<string, RateLimitStore>();

/**
 * Limpa entradas expiradas do store (executado periodicamente)
 */
function cleanupExpiredEntries() {
    const now = Date.now();
    for (const [key, value] of rateLimitStore.entries()) {
        if (now > value.resetTime) {
            rateLimitStore.delete(key);
        }
    }
}

// Limpar entradas expiradas a cada 5 minutos
setInterval(cleanupExpiredEntries, 5 * 60 * 1000);

/**
 * Verifica se uma requisição deve ser permitida ou bloqueada
 * 
 * @param identifier - Identificador único (user_id, IP, etc.)
 * @param config - Configuração de rate limit
 * @returns Objeto com informações de rate limit
 */
export function checkRateLimit(
    identifier: string,
    config: RateLimitConfig
): {
    allowed: boolean;
    remaining: number;
    resetTime: number;
    retryAfter?: number;
} {
    const now = Date.now();
    const windowMs = config.windowSeconds * 1000;

    const current = rateLimitStore.get(identifier);

    // Se não existe ou expirou, criar nova entrada
    if (!current || now > current.resetTime) {
        const resetTime = now + windowMs;
        rateLimitStore.set(identifier, {
            count: 1,
            resetTime,
        });

        return {
            allowed: true,
            remaining: config.maxRequests - 1,
            resetTime,
        };
    }

    // Se ainda está dentro do limite
    if (current.count < config.maxRequests) {
        current.count++;

        return {
            allowed: true,
            remaining: config.maxRequests - current.count,
            resetTime: current.resetTime,
        };
    }

    // Limite excedido
    const retryAfter = Math.ceil((current.resetTime - now) / 1000);

    return {
        allowed: false,
        remaining: 0,
        resetTime: current.resetTime,
        retryAfter,
    };
}

/**
 * Configurações pré-definidas de rate limit
 */
export const RATE_LIMITS = {
    /**
     * Chat AI: 50 mensagens por dia por usuário
     */
    CHAT: {
        maxRequests: 50,
        windowSeconds: 24 * 60 * 60, // 24 horas
    },

    /**
     * APIs gerais: 100 requisições por minuto por usuário
     */
    API_GENERAL: {
        maxRequests: 100,
        windowSeconds: 60, // 1 minuto
    },

    /**
     * Login: 5 tentativas por 15 minutos por IP
     */
    AUTH_LOGIN: {
        maxRequests: 5,
        windowSeconds: 15 * 60, // 15 minutos
    },

    /**
     * Criação de transações: 30 por minuto por usuário
     */
    TRANSACTIONS: {
        maxRequests: 30,
        windowSeconds: 60, // 1 minuto
    },
} as const;

/**
 * Headers HTTP padrão para rate limiting (RFC 6585)
 */
export function getRateLimitHeaders(result: ReturnType<typeof checkRateLimit>) {
    return {
        'X-RateLimit-Limit': result.allowed ? String(RATE_LIMITS.API_GENERAL.maxRequests) : '0',
        'X-RateLimit-Remaining': String(result.remaining),
        'X-RateLimit-Reset': String(Math.floor(result.resetTime / 1000)),
        ...(result.retryAfter && {
            'Retry-After': String(result.retryAfter),
        }),
    };
}
