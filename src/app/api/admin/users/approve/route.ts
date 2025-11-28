import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'

export async function POST(request: Request) {
    try {
        const supabase = await createClient()
        const { userId } = await request.json()

        // Verificar se é super admin
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { data: adminData } = await supabase
            .from('users')
            .select('user_type')
            .eq('id', user.id)
            .single()

        if (adminData?.user_type !== 'super_admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        // Usar service role key para fazer o UPDATE (bypass RLS)
        const supabaseAdmin = createSupabaseClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        // Aprovar usuário
        const { error: updateError } = await supabaseAdmin
            .from('users')
            .update({
                access_status: 'active',
                approved_at: new Date().toISOString(),
                approved_by: user.id
            })
            .eq('id', userId)

        if (updateError) {
            console.error('Error updating user:', updateError)
            throw updateError
        }

        // Registrar audit log (também com service role)
        await supabaseAdmin.from('admin_audit_logs').insert({
            admin_id: user.id,
            action: 'APPROVE_USER',
            target_user_id: userId,
            details: { timestamp: new Date().toISOString() }
        })

        // Buscar dados do usuário para enviar e-mail
        const { data: approvedUser } = await supabaseAdmin
            .from('users')
            .select('email, name')
            .eq('id', userId)
            .single()

        if (approvedUser?.email) {
            await sendEmail(
                approvedUser.email,
                'Acesso Aprovado - Assistente Financeiro',
                `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Acesso Aprovado! 🎉</h2>
            <p>Olá${approvedUser.name ? `, ${approvedUser.name}` : ''}!</p>
            <p>Seu acesso ao Assistente Financeiro foi aprovado.</p>
            <p>Você já pode fazer login e começar a usar a aplicação.</p>
            <br/>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/login" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Acessar Aplicação
            </a>
          </div>
        `
            )
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error approving user:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
