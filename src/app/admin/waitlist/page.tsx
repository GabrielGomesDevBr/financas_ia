'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Loader2, CheckCircle, XCircle, Clock, UserPlus, Mail, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'

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
    const [selectedUsers, setSelectedUsers] = useState<string[]>([])
    const [bulkApproving, setBulkApproving] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        fetchWaitlistUsers()
    }, [])

    const fetchWaitlistUsers = async () => {
        try {
            setLoading(true)
            const response = await fetch('/api/admin/waitlist')
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }
            const { users } = await response.json()
            setUsers(users || [])
            setSelectedUsers([]) // Clear selection on refresh
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

    const handleBulkApprove = async () => {
        if (selectedUsers.length === 0) {
            toast.error('Selecione pelo menos um usuário')
            return
        }

        if (!confirm(`Aprovar ${selectedUsers.length} usuário(s)?`)) return

        setBulkApproving(true)
        try {
            const promises = selectedUsers.map(userId =>
                fetch('/api/admin/users/approve', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId })
                })
            )

            await Promise.all(promises)
            toast.success(`${selectedUsers.length} usuário(s) aprovado(s)!`)
            setSelectedUsers([])
            fetchWaitlistUsers()
        } catch (error) {
            toast.error('Erro ao aprovar usuários')
        } finally {
            setBulkApproving(false)
        }
    }

    const toggleSelectUser = (userId: string) => {
        setSelectedUsers(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        )
    }

    const toggleSelectAll = () => {
        if (selectedUsers.length === users.length) {
            setSelectedUsers([])
        } else {
            setSelectedUsers(users.map(u => u.id))
        }
    }

    const getTimeAgo = (date: string) => {
        const now = new Date()
        const created = new Date(date)
        const diffMs = now.getTime() - created.getTime()
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

        if (diffDays === 0) return 'Hoje'
        if (diffDays === 1) return 'Ontem'
        if (diffDays < 7) return `${diffDays} dias atrás`
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} semanas atrás`
        return `${Math.floor(diffDays / 30)} meses atrás`
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 text-yellow-600 animate-spin" />
            </div>
        )
    }

    return (
        <div className="space-y-4 md:space-y-6 animate-fade-in pb-6">
            {/* Hero Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-to-br from-yellow-500 via-orange-500 to-red-500 p-6 md:p-8 text-white shadow-2xl"
            >
                <div className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-white/10 rounded-full blur-3xl -z-0" />
                <div className="absolute bottom-0 left-0 w-48 h-48 md:w-72 md:h-72 bg-white/10 rounded-full blur-3xl -z-0" />

                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="rounded-2xl bg-white/20 p-3 backdrop-blur-xl">
                                <Clock className="h-8 w-8 md:h-10 md:w-10" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold">Waitlist</h1>
                                <p className="text-white/80 text-sm md:text-base mt-1">
                                    Gerenciar solicitações de acesso
                                </p>
                            </div>
                        </div>

                        {selectedUsers.length > 0 && (
                            <motion.button
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                onClick={handleBulkApprove}
                                disabled={bulkApproving}
                                className="px-6 py-3 bg-white text-orange-600 rounded-xl font-semibold hover:bg-white/90 transition-all shadow-lg disabled:opacity-50 flex items-center gap-2"
                            >
                                {bulkApproving ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <CheckCircle className="w-5 h-5" />
                                )}
                                Aprovar {selectedUsers.length} Selecionado(s)
                            </motion.button>
                        )}
                    </div>

                    {/* Stats inline */}
                    <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-3">
                        <div className="bg-white/10 backdrop-blur-xl rounded-xl p-3 border border-white/20">
                            <p className="text-xs font-medium text-white/80">Na Waitlist</p>
                            <p className="text-xl md:text-2xl font-bold mt-1">{users.length}</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-xl rounded-xl p-3 border border-white/20">
                            <p className="text-xs font-medium text-white/80">Selecionados</p>
                            <p className="text-xl md:text-2xl font-bold mt-1">{selectedUsers.length}</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-xl rounded-xl p-3 border border-white/20 col-span-2 md:col-span-1">
                            <p className="text-xs font-medium text-white/80">Mais Antigo</p>
                            <p className="text-sm md:text-base font-bold mt-1">
                                {users.length > 0 ? getTimeAgo(users[users.length - 1].created_at) : '-'}
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Content */}
            {users.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center"
                >
                    <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                        Nenhum usuário na waitlist
                    </h3>
                    <p className="text-gray-500">
                        Todos os usuários foram aprovados ou bloqueados
                    </p>
                </motion.div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className="space-y-3"
                >
                    {/* Select All */}
                    <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3 border border-gray-200">
                        <input
                            type="checkbox"
                            checked={selectedUsers.length === users.length && users.length > 0}
                            onChange={toggleSelectAll}
                            className="w-5 h-5 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                        />
                        <span className="text-sm font-semibold text-gray-700">
                            Selecionar Todos ({users.length})
                        </span>
                    </div>

                    {/* User Cards */}
                    {users.map((user, index) => (
                        <motion.div
                            key={user.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            className={`bg-white rounded-2xl shadow-md border-2 transition-all hover:shadow-lg ${selectedUsers.includes(user.id)
                                    ? 'border-orange-400 bg-orange-50'
                                    : 'border-gray-100'
                                }`}
                        >
                            <div className="p-5">
                                <div className="flex items-start gap-4">
                                    {/* Checkbox */}
                                    <input
                                        type="checkbox"
                                        checked={selectedUsers.includes(user.id)}
                                        onChange={() => toggleSelectUser(user.id)}
                                        className="mt-1 w-5 h-5 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                                    />

                                    {/* Avatar */}
                                    <div className="flex-shrink-0 h-14 w-14 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                                        <span className="text-white font-bold text-xl">
                                            {user.name?.charAt(0) || user.email?.charAt(0)}
                                        </span>
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                                            {user.name || 'Sem nome'}
                                        </h3>
                                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                                            <div className="flex items-center gap-1.5">
                                                <Mail className="w-4 h-4" />
                                                <span>{user.email}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="w-4 h-4" />
                                                <span>{new Date(user.created_at).toLocaleDateString('pt-BR')}</span>
                                            </div>
                                        </div>
                                        <div className="mt-2">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 border border-yellow-200">
                                                <Clock className="w-3 h-3 mr-1" />
                                                {getTimeAgo(user.created_at)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleApprove(user.id)}
                                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all shadow-md hover:shadow-lg font-semibold"
                                        >
                                            <CheckCircle className="w-4 h-4" />
                                            <span className="hidden sm:inline">Aprovar</span>
                                        </button>
                                        <button
                                            onClick={() => handleReject(user.id)}
                                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all shadow-md hover:shadow-lg font-semibold"
                                        >
                                            <XCircle className="w-4 h-4" />
                                            <span className="hidden sm:inline">Bloquear</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            )}
        </div>
    )
}
