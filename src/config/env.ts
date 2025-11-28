/**
 * Environment Variables Validation
 * Ensures all required env vars are present
 */

function getEnvVar(key: string, required: boolean = true): string {
    const value = process.env[key]

    if (!value && required) {
        throw new Error(`Missing required environment variable: ${key}`)
    }

    return value || ''
}

export const env = {
    // Supabase
    supabase: {
        url: getEnvVar('NEXT_PUBLIC_SUPABASE_URL'),
        anonKey: getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
        serviceRoleKey: getEnvVar('SUPABASE_SERVICE_ROLE_KEY'),
    },

    // OpenAI
    openai: {
        apiKey: getEnvVar('OPENAI_API_KEY'),
    },

    // Resend (optional)
    resend: {
        apiKey: getEnvVar('RESEND_API_KEY', false),
    },

    // App
    nodeEnv: getEnvVar('NODE_ENV', false) || 'development',
    isDev: process.env.NODE_ENV === 'development',
    isProd: process.env.NODE_ENV === 'production',
} as const

// Validate on import
if (typeof window === 'undefined') {
    // Server-side only validation
    const requiredVars = [
        'NEXT_PUBLIC_SUPABASE_URL',
        'NEXT_PUBLIC_SUPABASE_ANON_KEY',
        'SUPABASE_SERVICE_ROLE_KEY',
        'OPENAI_API_KEY',
    ]

    const missing = requiredVars.filter(key => !process.env[key])

    if (missing.length > 0) {
        console.error('❌ Missing required environment variables:')
        missing.forEach(key => console.error(`   - ${key}`))

        if (env.isProd) {
            throw new Error('Missing required environment variables')
        }
    }
}
