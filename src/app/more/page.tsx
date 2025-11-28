'use client'

import { MobileHeader } from '@/components/mobile/MobileHeader'
import Link from 'next/link'
import { Target, Users, Settings, LogOut, Shield } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function MorePage() {
    const [isSuperAdmin, setIsSuperAdmin] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        checkAdmin()
    }, [])

    const checkAdmin = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            const { data: userData } = await supabase
                .from('users')
                .select('user_type')
                .eq('id', user.id)
                .single()
            setIsSuperAdmin(userData?.user_type === 'super_admin')
        }
    }

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    const menuItems = [
        {
            href: '/goals',
            icon: Target,
            label: 'Metas',
            description: 'Acompanhe seus objetivos',
            color: 'from-purple-500 to-pink-500'
        },
        {
            href: '/family',
            icon: Users,
            label: 'Família',
            description: 'Gerencie membros',
            color: 'from-blue-500 to-cyan-500'
        },
        {
            href: '/settings',
            icon: Settings,
            label: 'Configurações',
            description: 'Preferências e conta',
            color: 'from-gray-500 to-gray-700'
        },
    ]

    if (isSuperAdmin) {
        menuItems.push({
            href: '/admin/dashboard',
            icon: Shield,
            label: 'Painel Admin',
            description: '🔴 Modo Desenvolvedor',
            color: 'from-red-500 to-orange-500'
        })
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <MobileHeader title="Mais" />

            <div className="p-4 space-y-3">
                {menuItems.map((item, index) => (
                    <Link
                        key={index}
                        href={item.href}
                        className="block bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all active:scale-98"
                    >
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg`}>
                                <item.icon className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-900">{item.label}</h3>
                                <p className="text-sm text-gray-500">{item.description}</p>
                            </div>
                        </div>
                    </Link>
                ))}

                <button
                    onClick={handleLogout}
                    className="w-full bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all active:scale-98"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center shadow-lg">
                            <LogOut className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 text-left">
                            <h3 className="font-semibold text-gray-900">Sair</h3>
                            <p className="text-sm text-gray-500">Fazer logout da conta</p>
                        </div>
                    </div>
                </button>
            </div>
        </div>
    )
}
