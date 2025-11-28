'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function WaitlistPage() {
    const [userEmail, setUserEmail] = useState('')
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        checkAccess()
    }, [])

    const checkAccess = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            setUserEmail(user.email || '')

            // Verificar se foi aprovado
            const { data: userData } = await supabase
                .from('users')
                .select('access_status')
                .eq('id', user.id)
                .single()

            if (userData?.access_status === 'active') {
                router.push('/')
            }
            // Note: Notifications are now sent in auth/callback/route.ts
            // when the user is first created, so we don't need to send them here
        }
    }

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center mx-4">
                <div className="text-6xl mb-6 animate-bounce">⏳</div>

                <h1 className="text-3xl font-bold text-gray-900 mb-3">
                    Aguardando Aprovação
                </h1>

                <p className="text-gray-600 mb-2">
                    Olá! Sua conta está na lista de espera.
                </p>

                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
                    <p className="text-sm font-medium text-blue-900 mb-1">
                        📧 {userEmail}
                    </p>
                    <p className="text-xs text-blue-700">
                        Você receberá um e-mail quando for aprovado
                    </p>
                </div>

                <div className="space-y-3">
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
                        <p className="text-sm text-purple-900 font-medium mb-1">
                            💡 Quer acelerar sua aprovação?
                        </p>
                        <p className="text-xs text-purple-700">
                            Entre em contato conosco pelo e-mail: {process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'suporte@exemplo.com'}
                        </p>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2.5 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                        Sair
                    </button>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                        Estamos analisando seu acesso. Isso pode levar até 24 horas.
                    </p>
                </div>
            </div>
        </div>
    )
}
