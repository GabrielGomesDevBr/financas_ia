'use client'

import { useState, useEffect } from 'react'
import { Plus, MessageSquare, Trash2, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'react-hot-toast'

interface Conversation {
    id: string
    title: string
    created_at: string
    updated_at: string
}

interface ChatSidebarProps {
    currentConversationId?: string
    onSelectConversation: (id: string) => void
    onNewConversation: () => void
    isOpen: boolean
    onClose: () => void
}

export function ChatSidebar({
    currentConversationId,
    onSelectConversation,
    onNewConversation,
    isOpen,
    onClose,
}: ChatSidebarProps) {
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        loadConversations()
    }, [])

    const loadConversations = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data, error } = await supabase
                .from('conversations')
                .select('*')
                .eq('user_id', user.id)
                .order('updated_at', { ascending: false })

            if (error) throw error
            setConversations(data || [])
        } catch (error) {
            console.error('Error loading conversations:', error)
            toast.error('Erro ao carregar conversas')
        } finally {
            setLoading(false)
        }
    }

    const deleteConversation = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation()

        try {
            const { error } = await supabase
                .from('conversations')
                .delete()
                .eq('id', id)

            if (error) throw error

            setConversations(conversations.filter(c => c.id !== id))
            toast.success('Conversa excluída')

            if (currentConversationId === id) {
                onNewConversation()
            }
        } catch (error) {
            console.error('Error deleting conversation:', error)
            toast.error('Erro ao excluir conversa')
        }
    }

    const groupConversationsByDate = () => {
        const groups: { [key: string]: Conversation[] } = {
            'Hoje': [],
            'Ontem': [],
            'Últimos 7 dias': [],
            'Últimos 30 dias': [],
            'Mais antigos': [],
        }

        const now = new Date()
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)
        const lastWeek = new Date(today)
        lastWeek.setDate(lastWeek.getDate() - 7)
        const lastMonth = new Date(today)
        lastMonth.setDate(lastMonth.getDate() - 30)

        conversations.forEach(conv => {
            const convDate = new Date(conv.updated_at)

            if (convDate >= today) {
                groups['Hoje'].push(conv)
            } else if (convDate >= yesterday) {
                groups['Ontem'].push(conv)
            } else if (convDate >= lastWeek) {
                groups['Últimos 7 dias'].push(conv)
            } else if (convDate >= lastMonth) {
                groups['Últimos 30 dias'].push(conv)
            } else {
                groups['Mais antigos'].push(conv)
            }
        })

        return groups
    }

    const groups = groupConversationsByDate()

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <div
                className={`fixed md:relative top-0 left-0 h-full md:h-[70vh] md:max-h-[600px] w-60 bg-white dark:bg-neutral-950 border-r border-neutral-200 dark:border-neutral-800 flex flex-col z-50 transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
                    }`}
            >
                {/* Header */}
                <div className="p-3 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
                    <h2 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">Conversas</h2>
                    <button
                        onClick={onClose}
                        className="md:hidden p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-md transition-colors"
                    >
                        <X className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
                    </button>
                </div>

                {/* New Chat Button */}
                <div className="p-2">
                    <button
                        onClick={() => {
                            onNewConversation()
                            onClose()
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-lg transition-all shadow-sm hover:shadow-md"
                    >
                        <Plus className="w-4 h-4" />
                        <span className="text-sm font-medium">Nova Conversa</span>
                    </button>
                </div>

                {/* Conversations List */}
                <div className="flex-1 overflow-y-auto px-2 pb-2">
                    {loading ? (
                        <div className="text-center text-neutral-500 dark:text-neutral-400 py-4 text-sm">
                            Carregando...
                        </div>
                    ) : (
                        <>
                            {Object.entries(groups).map(([groupName, groupConvs]) => {
                                if (groupConvs.length === 0) return null

                                return (
                                    <div key={groupName} className="mb-3">
                                        <h3 className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider px-2 mb-1.5">
                                            {groupName}
                                        </h3>
                                        <div className="space-y-0.5">
                                            {groupConvs.map(conv => (
                                                <div
                                                    key={conv.id}
                                                    onClick={() => {
                                                        onSelectConversation(conv.id)
                                                        onClose()
                                                    }}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' || e.key === ' ') {
                                                            onSelectConversation(conv.id)
                                                            onClose()
                                                        }
                                                    }}
                                                    role="button"
                                                    tabIndex={0}
                                                    className={`group w-full flex items-center gap-2 px-2.5 py-2 rounded-lg transition-all cursor-pointer ${currentConversationId === conv.id
                                                        ? 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300'
                                                        : 'hover:bg-neutral-100 dark:hover:bg-neutral-900 text-neutral-700 dark:text-neutral-300'
                                                        }`}
                                                >
                                                    <MessageSquare className="w-3.5 h-3.5 flex-shrink-0" />
                                                    <span className="flex-1 text-left text-sm truncate">
                                                        {conv.title}
                                                    </span>
                                                    <button
                                                        onClick={(e) => deleteConversation(conv.id, e)}
                                                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 dark:hover:bg-red-950/30 text-neutral-500 hover:text-red-600 dark:hover:text-red-400 rounded transition-all"
                                                        title="Excluir conversa"
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )
                            })}

                            {conversations.length === 0 && (
                                <div className="text-center text-neutral-400 dark:text-neutral-500 py-8">
                                    <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                    <p className="text-xs">Nenhuma conversa ainda</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </>
    )
}
