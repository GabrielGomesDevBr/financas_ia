'use client'

import { useState, useEffect } from 'react'
import { Loader2, CheckCircle, XCircle, Mail } from 'lucide-react'
import toast from 'react-hot-toast'

export default function UsersPage() {
    const [users, setUsers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all')

    useEffect(() => {
        fetchUsers()
    }, [filter])

    const fetchUsers = async () => {
        try {
            setLoading(true)
            const response = await fetch(`/api/admin/users?filter=${filter}`)
            const data = await response.json()
            setUsers(data.users || [])
        } catch (error) {
            console.error('Error fetching users:', error)
            toast.error('Erro ao carregar usuários')
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

            if (response.ok) {
                toast.success('Usuário aprovado!')
                fetchUsers()
            } else {
                toast.error('Erro ao aprovar usuário')
            }
        } catch (error) {
            toast.error('Erro ao aprovar usuário')
        }
    }

    const handleBlock = async (userId: string) => {
        if (!confirm('Tem certeza que deseja bloquear este usuário?')) return

        try {
            const response = await fetch('/api/admin/users/block', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId })
            })

            if (response.ok) {
                toast.success('Usuário bloqueado')
                fetchUsers()
            } else {
                toast.error('Erro ao bloquear usuário')
            }
        } catch (error) {
            toast.error('Erro ao bloquear usuário')
        }
    }

    const getStatusBadge = (status: string) => {
        const styles = {
            active: 'bg-green-100 text-green-800',
            waitlist: 'bg-yellow-100 text-yellow-800',
            blocked: 'bg-red-100 text-red-800',
        }
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
                {status === 'active' ? 'Ativo' : status === 'waitlist' ? 'Waitlist' : 'Bloqueado'}
            </span>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Gerenciar Usuários</h1>
                    <p className="text-gray-600 mt-1">Aprovar, bloquear e gerenciar usuários</p>
                </div>
                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                    <option value="all">Todos</option>
                    <option value="active">Ativos</option>
                    <option value="waitlist">Waitlist</option>
                    <option value="blocked">Bloqueados</option>
                </select>
            </div>

            {loading ? (
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
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
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Tipo
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Cadastro
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
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                <span className="text-blue-600 font-semibold">
                                                    {user.name?.charAt(0) || user.email?.charAt(0)}
                                                </span>
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{user.name || 'Sem nome'}</div>
                                                <div className="text-sm text-gray-500">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {getStatusBadge(user.access_status)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {user.user_type === 'super_admin' ? 'Super Admin' : user.user_type === 'admin' ? 'Admin' : 'Usuário'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(user.created_at).toLocaleDateString('pt-BR')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end gap-2">
                                            {user.access_status === 'waitlist' && (
                                                <button
                                                    onClick={() => handleApprove(user.id)}
                                                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                                                >
                                                    <CheckCircle className="w-4 h-4 mr-1" />
                                                    Aprovar
                                                </button>
                                            )}
                                            {user.access_status !== 'blocked' && user.user_type !== 'super_admin' && (
                                                <button
                                                    onClick={() => handleBlock(user.id)}
                                                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                                                >
                                                    <XCircle className="w-4 h-4 mr-1" />
                                                    Bloquear
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {users.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-gray-500">Nenhum usuário encontrado</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
