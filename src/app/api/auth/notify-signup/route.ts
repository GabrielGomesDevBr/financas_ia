import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { sendWaitlistNotificationEmail, sendAdminNewUserNotification } from '@/lib/email'

export async function POST(request: Request) {
    try {
        const { userId } = await request.json()

        const supabase = await createClient()

        // Buscar dados do usuário
        const { data: user } = await supabase
            .from('users')
            .select('email, name, access_status')
            .eq('id', userId)
            .single()

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Se está na waitlist, enviar e-mails
        if (user.access_status === 'waitlist') {
            // E-mail para o usuário
            await sendWaitlistNotificationEmail(user.email, user.name || '')

            // E-mail para o admin
            const adminEmail = process.env.SUPER_ADMIN_EMAIL || process.env.SUPPORT_EMAIL || 'admin@exemplo.com'
            await sendAdminNewUserNotification(adminEmail, user.email, user.name || '')
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error sending notifications:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
