import { z } from 'zod';

/**
 * Schema de validação para variáveis de ambiente
 * Garante que a aplicação não inicie com configuração incompleta
 */
const envSchema = z.object({
    // Supabase
    NEXT_PUBLIC_SUPABASE_URL: z.string().url('NEXT_PUBLIC_SUPABASE_URL deve ser uma URL válida'),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'NEXT_PUBLIC_SUPABASE_ANON_KEY é obrigatória'),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY é obrigatória'),

    // OpenAI
    OPENAI_API_KEY: z.string().min(1, 'OPENAI_API_KEY é obrigatória'),

    // Resend (Email)
    RESEND_API_KEY: z.string().min(1, 'RESEND_API_KEY é obrigatória'),

    // Application
    NEXT_PUBLIC_APP_URL: z.string().url('NEXT_PUBLIC_APP_URL deve ser uma URL válida'),

    // Admin & Support
    SUPER_ADMIN_EMAIL: z.string().email('SUPER_ADMIN_EMAIL deve ser um email válido'),
    SUPPORT_EMAIL: z.string().email('SUPPORT_EMAIL deve ser um email válido'),

    // Node Environment
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

/**
 * Tipo TypeScript inferido do schema
 */
export type Env = z.infer<typeof envSchema>;

/**
 * Valida e exporta variáveis de ambiente
 * Lança erro se alguma variável obrigatória estiver faltando ou inválida
 */
function validateEnv(): Env {
    try {
        return envSchema.parse(process.env);
    } catch (error) {
        if (error instanceof z.ZodError) {
            const missingVars = error.errors.map(err => `  - ${err.path.join('.')}: ${err.message}`).join('\n');

            console.error('❌ Erro de configuração: Variáveis de ambiente inválidas ou faltando:\n');
            console.error(missingVars);
            console.error('\n💡 Verifique seu arquivo .env.local e compare com .env.example\n');

            throw new Error('Configuração de ambiente inválida. Verifique os logs acima.');
        }
        throw error;
    }
}

/**
 * Variáveis de ambiente validadas
 * Use este objeto em vez de process.env diretamente
 */
export const env = validateEnv();
