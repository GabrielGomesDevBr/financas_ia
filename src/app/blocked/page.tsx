'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function BlockedPage() {
    const router = useRouter()
    const supabase = createClient()

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center mx-4">
                <div className="text-6xl mb-6">🚫</div>

                <h1 className="text-3xl font-bold text-gray-900 mb-3">
                    Acesso Bloqueado
                </h1>

                <p className="text-gray-600 mb-6">
                    Sua conta foi bloqueada. Entre em contato com o suporte para mais informações.
                </p>

                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6">
                    <p className="text-sm text-red-900">
                        📧 {process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'suporte@exemplo.com'}
                    </p>
                </div>

                <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2.5 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                >
                    Sair
                </button>
            </div>
        </div>
    )
}
