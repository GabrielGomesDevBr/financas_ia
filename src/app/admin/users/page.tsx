'use client'

import { useState, useEffect } from 'react'
import { Loader2, CheckCircle, XCircle, Mail, Users as UsersIcon, Search, MoreVertical, UserX, Trash2, UserMinus, Shield, Crown } from 'lucide-react'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'

interface User {
    id: string
    name: string | null
    email: string
    access_status: 'active' | 'waitlist' | 'blocked' | 'inactive'
    user_type: 'super_admin' | 'admin' | 'user'
    created_at: string
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all')
    const [searchTerm, setSearchTerm] = useState('')
    const [openMenuId, setOpenMenuId] = useState<string | null>(null)

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
        setOpenMenuId(null)
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
        setOpenMenuId(null)
    }

    const handleSuspend = async (userId: string) => {
        if (!confirm('Tem certeza que deseja suspender este usuário? Ele poderá ser reativado depois.')) return

        try {
            const response = await fetch('/api/admin/users/suspend', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId })
            })

            if (response.ok) {
                toast.success('Usuário suspenso')
                fetchUsers()
            } else {
                toast.error('Erro ao suspender usuário')
            }
        } catch (error) {
            toast.error('Erro ao suspender usuário')
        }
        setOpenMenuId(null)
    }

    const handleDelete = async (userId: string) => {
        if (!confirm('⚠️ ATENÇÃO: Deletar este usuário irá remover TODOS os seus dados (transações, metas, etc). Esta ação é IRREVERSÍVEL. Tem certeza?')) return

        try {
            const response = await fetch('/api/admin/users/delete', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId })
            })

            if (response.ok) {
                toast.success('Usuário deletado')
                fetchUsers()
            } else {
                const data = await response.json()
                toast.error(data.error || 'Erro ao deletar usuário')
            }
        } catch (error) {
            toast.error('Erro ao deletar usuário')
        }
        setOpenMenuId(null)
    }

    const getStatusBadge = (status: string) => {
        const config = {
            active: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', label: 'Ativo' },
            waitlist: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', label: 'Waitlist' },
            blocked: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', label: 'Bloqueado' },
            inactive: { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', label: 'Inativo' },
        }
        const style = config[status as keyof typeof config] || config.inactive
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${style.bg} ${style.text} ${style.border}`}>
                {style.label}
            </span>
        )
    }

    const filteredUsers = users.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-4 md:space-y-6 animate-fade-in pb-6">
            {/* Hero Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-600 p-6 md:p-8 text-white shadow-2xl"
            >
                <div className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-white/10 rounded-full blur-3xl -z-0" />
                <div className="absolute bottom-0 left-0 w-48 h-48 md:w-72 md:h-72 bg-white/10 rounded-full blur-3xl -z-0" />

                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="rounded-2xl bg-white/20 p-3 backdrop-blur-xl">
                                <UsersIcon className="h-8 w-8 md:h-10 md:w-10" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold">Gerenciar Usuários</h1>
                                <p className="text-white/80 text-sm md:text-base mt-1">
                                    Aprovar, suspender, bloquear e gerenciar usuários
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Stats inline */}
                    <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="bg-white/10 backdrop-blur-xl rounded-xl p-3 border border-white/20">
                            <p className="text-xs font-medium text-white/80">Total</p>
                            <p className="text-xl md:text-2xl font-bold mt-1">{users.length}</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-xl rounded-xl p-3 border border-white/20">
                            <p className="text-xs font-medium text-white/80">Ativos</p>
                            <p className="text-xl md:text-2xl font-bold mt-1">
                                {users.filter(u => u.access_status === 'active').length}
                            </p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-xl rounded-xl p-3 border border-white/20">
                            <p className="text-xs font-medium text-white/80">Waitlist</p>
                            <p className="text-xl md:text-2xl font-bold mt-1">
                                {users.filter(u => u.access_status === 'waitlist').length}
                            </p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-xl rounded-xl p-3 border border-white/20">
                            <p className="text-xs font-medium text-white/80">Bloqueados</p>
                            <p className="text-xl md:text-2xl font-bold mt-1">
                                {users.filter(u => u.access_status === 'blocked').length}
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Filters and Search */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="flex flex-col md:flex-row gap-4"
            >
                {/* Search */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar por nome ou email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                </div>

                {/* Filter */}
                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                >
                    <option value="all">Todos os Status</option>
                    <option value="active">Ativos</option>
                    <option value="waitlist">Waitlist</option>
                    <option value="blocked">Bloqueados</option>
                    <option value="inactive">Inativos</option>
                </select>
            </motion.div>

            {/* Users Table */}
            {loading ? (
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
                >
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Usuário
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Tipo
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Cadastro
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Ações
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {filteredUsers.map((user, index) => (
                                    <motion.tr
                                        key={user.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: index * 0.05 }}
                                        className="hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-12 w-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-md">
                                                    <span className="text-white font-bold text-lg">
                                                        {user.name?.charAt(0) || user.email?.charAt(0)}
                                                    </span>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="text-sm font-semibold text-gray-900">
                                                            {user.name || 'Sem nome'}
                                                        </div>
                                                        {user.user_type === 'super_admin' && (
                                                            <Crown className="w-4 h-4 text-yellow-500" />
                                                        )}
                                                        {user.user_type === 'admin' && (
                                                            <Shield className="w-4 h-4 text-blue-500" />
                                                        )}
                                                    </div>
                                                    <div className="text-sm text-gray-500">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(user.access_status)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-700 font-medium">
                                                {user.user_type === 'super_admin' ? 'Super Admin' : user.user_type === 'admin' ? 'Admin' : 'Usuário'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(user.created_at).toLocaleDateString('pt-BR')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="relative inline-block text-left">
                                                <button
                                                    onClick={() => setOpenMenuId(openMenuId === user.id ? null : user.id)}
                                                    className="inline-flex items-center p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                                                >
                                                    <MoreVertical className="w-5 h-5" />
                                                </button>

                                                {openMenuId === user.id && (
                                                    <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-xl shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                                                        <div className="py-1">
                                                            {user.access_status === 'waitlist' && (
                                                                <button
                                                                    onClick={() => handleApprove(user.id)}
                                                                    className="flex items-center w-full px-4 py-2 text-sm text-green-700 hover:bg-green-50"
                                                                >
                                                                    <CheckCircle className="w-4 h-4 mr-3" />
                                                                    Aprovar
                                                                </button>
                                                            )}
                                                            {user.access_status === 'active' && user.user_type !== 'super_admin' && (
                                                                <button
                                                                    onClick={() => handleSuspend(user.id)}
                                                                    className="flex items-center w-full px-4 py-2 text-sm text-orange-700 hover:bg-orange-50"
                                                                >
                                                                    <UserMinus className="w-4 h-4 mr-3" />
                                                                    Suspender
                                                                </button>
                                                            )}
                                                            {user.access_status !== 'blocked' && user.user_type !== 'super_admin' && (
                                                                <button
                                                                    onClick={() => handleBlock(user.id)}
                                                                    className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                                                                >
                                                                    <UserX className="w-4 h-4 mr-3" />
                                                                    Bloquear
                                                                </button>
                                                            )}
                                                            {user.user_type !== 'super_admin' && (
                                                                <>
                                                                    <div className="border-t border-gray-100 my-1"></div>
                                                                    <button
                                                                        onClick={() => handleDelete(user.id)}
                                                                        className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50 font-semibold"
                                                                    >
                                                                        <Trash2 className="w-4 h-4 mr-3" />
                                                                        Deletar Permanentemente
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredUsers.length === 0 && (
                            <div className="text-center py-12">
                                <UsersIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500 font-medium">Nenhum usuário encontrado</p>
                                <p className="text-gray-400 text-sm mt-1">Tente ajustar os filtros ou busca</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}

            {/* Click outside to close menu */}
            {openMenuId && (
                <div
                    className="fixed inset-0 z-0"
                    onClick={() => setOpenMenuId(null)}
                />
            )}
        </div>
    )
}
