'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Loader2, CheckCircle, XCircle, Clock } from 'lucide-react'
import toast from 'react-hot-toast'

interface WaitlistUser {
    id: string
    email: string
    name: string
    created_at: string
    access_status: string
}

export default function AdminWaitlistPage() {
    const [users, setUsers] = useState<WaitlistUser[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        fetchWaitlistUsers()
    }, [])

    const fetchWaitlistUsers = async () => {
        try {
            // Use API route instead of direct Supabase client to bypass RLS
            const response = await fetch('/api/admin/waitlist')
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }
            const { users } = await response.json()
            setUsers(users || [])
        } catch (error) {
            console.error('Error fetching waitlist:', error)
            toast.error('Erro ao carregar waitlist')
        } finally {
            setLoading(false)
        }
    }

    const handleApprove = async (userId: string) => {
        try {
            const response = await fetch('/api/admin/users/approve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId })
            })

            if (!response.ok) throw new Error('Failed to approve')

            toast.success('Usuário aprovado!')
            fetchWaitlistUsers()
        } catch (error) {
            console.error('Error approving user:', error)
            toast.error('Erro ao aprovar usuário')
        }
    }

    const handleReject = async (userId: string) => {
        if (!confirm('Tem certeza que deseja bloquear este usuário?')) return

        try {
            const response = await fetch('/api/admin/users/block', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId })
            })

            if (!response.ok) throw new Error('Failed to block')

            toast.success('Usuário bloqueado')
            fetchWaitlistUsers()
        } catch (error) {
            console.error('Error blocking user:', error)
            toast.error('Erro ao bloquear usuário')
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Waitlist</h1>
                <p className="text-gray-600 mt-1">
                    Usuários aguardando aprovação ({users.length})
                </p>
            </div>

            {users.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                    <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Nenhum usuário na waitlist
                    </h3>
                    <p className="text-gray-600">
                        Todos os usuários foram aprovados ou bloqueados
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Usuário
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Email
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Data de Cadastro
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Ações
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {user.name || 'Sem nome'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-600">{user.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-600">
                                            {new Date(user.created_at).toLocaleDateString('pt-BR')}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleApprove(user.id)}
                                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors mr-2"
                                        >
                                            <CheckCircle className="w-4 h-4" />
                                            Aprovar
                                        </button>
                                        <button
                                            onClick={() => handleReject(user.id)}
                                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                        >
                                            <XCircle className="w-4 h-4" />
                                            Bloquear
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
