'use client'

import { X, MessageSquare, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'react-hot-toast'

interface Conversation {
    id: string
    title: string
    updated_at: string
    created_at: string
}

interface ConversationModalProps {
    isOpen: boolean
    onClose: () => void
    currentConversationId?: string
    onSelectConversation: (id: string) => void
}

export function ConversationModal({
    isOpen,
    onClose,
    currentConversationId,
    onSelectConversation,
}: ConversationModalProps) {
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        if (isOpen) {
            loadConversations()
        }
    }, [isOpen])

    const loadConversations = async () => {
        setIsLoading(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data, error } = await supabase
                .from('conversations')
                .select('*')
                .eq('user_id', user.id)
                .order('updated_at', { ascending: false })
                .limit(20)

            if (error) throw error
            setConversations(data || [])
        } catch (error) {
            console.error('Error loading conversations:', error)
            toast.error('Erro ao carregar conversas')
        } finally {
            setIsLoading(false)
        }
    }

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation()

        if (!confirm('Deseja excluir esta conversa?')) return

        try {
            const { error } = await supabase
                .from('conversations')
                .delete()
                .eq('id', id)

            if (error) throw error

            toast.success('Conversa excluída')
            loadConversations()

            if (id === currentConversationId) {
                window.location.reload()
            }
        } catch (error) {
            console.error('Error deleting conversation:', error)
            toast.error('Erro ao excluir conversa')
        }
    }

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr)
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

        if (diffDays === 0) {
            return 'Hoje ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        } else if (diffDays === 1) {
            return 'Ontem'
        } else if (diffDays < 7) {
            return date.toLocaleDateString('pt-BR', { weekday: 'long' })
        } else {
            return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm"
                        style={{ margin: 0 }}
                    />

                    {/* Modal Container - Using flexbox centering */}
                    <div className="pointer-events-none fixed inset-0 z-[9999] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ duration: 0.2 }}
                            className="pointer-events-auto w-full max-w-2xl rounded-3xl border-2 border-gray-200 bg-white shadow-2xl"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between border-b border-gray-200 p-6">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 p-2.5 shadow-lg shadow-purple-500/20">
                                        <MessageSquare className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">Histórico de Conversas</h2>
                                        <p className="text-sm text-gray-500">Suas conversas recentes</p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="rounded-xl p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="max-h-[60vh] overflow-y-auto p-6">
                                {isLoading ? (
                                    <div className="flex flex-col items-center gap-3 py-12">
                                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />
                                        <p className="text-sm text-gray-500">Carregando...</p>
                                    </div>
                                ) : conversations.length === 0 ? (
                                    <div className="py-12 text-center">
                                        <MessageSquare className="mx-auto mb-3 h-12 w-12 text-gray-300" />
                                        <p className="text-sm font-medium text-gray-500">Nenhuma conversa encontrada</p>
                                        <p className="text-xs text-gray-400 mt-1">Inicie uma nova conversa para começar</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {conversations.map((conversation, index) => (
                                            <motion.div
                                                key={conversation.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                                onClick={() => {
                                                    onSelectConversation(conversation.id)
                                                    onClose()
                                                }}
                                                className={`group flex w-full cursor-pointer items-center justify-between rounded-xl border-2 p-4 text-left transition-all ${conversation.id === currentConversationId
                                                        ? 'border-purple-500 bg-purple-50'
                                                        : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50/50'
                                                    }`}
                                            >
                                                <div className="flex-1 min-w-0">
                                                    <p className="truncate font-semibold text-gray-900">
                                                        {conversation.title}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {formatDate(conversation.updated_at)}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={(e) => handleDelete(conversation.id, e)}
                                                    className="ml-3 flex-shrink-0 rounded-lg p-2 text-gray-400 opacity-0 transition-all hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    )
}
