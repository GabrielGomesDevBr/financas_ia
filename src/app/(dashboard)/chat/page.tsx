'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, Menu } from 'lucide-react'
import { ChatMessage } from '@/components/chat/ChatMessage'
import { ChatSidebar } from '@/components/chat/ChatSidebar'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'react-hot-toast'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [currentConversationId, setCurrentConversationId] = useState<string | undefined>()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userAvatar, setUserAvatar] = useState<string | undefined>()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  // Fetch user avatar on mount
  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: userData } = await supabase
          .from('users')
          .select('avatar_url')
          .eq('id', user.id)
          .single()

        setUserAvatar(userData?.avatar_url)
      }
    }
    fetchUserData()
  }, [])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Load messages for selected conversation
  const loadConversation = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (error) throw error
      setMessages(data || [])
    } catch (error) {
      console.error('Error loading conversation:', error)
      toast.error('Erro ao carregar conversa')
    }
  }

  const handleSelectConversation = (id: string) => {
    setCurrentConversationId(id)
    loadConversation(id)
  }

  const handleNewConversation = () => {
    setCurrentConversationId(undefined)
    setMessages([])
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('')

    // Add user message to UI immediately
    const tempUserMessage: Message = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: userMessage,
      created_at: new Date().toISOString(),
    }
    setMessages(prev => [...prev, tempUserMessage])
    setIsLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')

      // Get or create conversation
      let conversationId = currentConversationId

      if (!conversationId) {
        const { data: newConv, error: convError } = await supabase
          .from('conversations')
          .insert({
            user_id: user.id,
            title: userMessage.slice(0, 50),
          })
          .select()
          .single()

        if (convError) throw convError
        conversationId = newConv.id
        setCurrentConversationId(conversationId)
      }

      // Send message to API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          conversationId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao processar mensagem')
      }

      // Add assistant response
      const assistantMessage: Message = {
        id: `temp-assistant-${Date.now()}`,
        role: 'assistant',
        content: data.message,
        created_at: new Date().toISOString(),
      }
      setMessages(prev => [...prev, assistantMessage])

      // Update conversation timestamp
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId)

    } catch (error: any) {
      console.error('Error sending message:', error)
      toast.error(error.message || 'Erro ao enviar mensagem')

      // Add error message
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `Desculpe, ocorreu um erro: ${error.message}`,
        created_at: new Date().toISOString(),
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegenerate = async () => {
    if (messages.length < 2) return

    // Get last user message
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user')
    if (!lastUserMessage) return

    // Remove last assistant message
    setMessages(prev => prev.slice(0, -1))

    // Resend last user message
    setInput(lastUserMessage.content)
    // Will be sent on next form submit
  }

  return (
    <div className="h-screen flex bg-white dark:bg-neutral-950">
      {/* Sidebar */}
      <ChatSidebar
        currentConversationId={currentConversationId}
        onSelectConversation={handleSelectConversation}
        onNewConversation={handleNewConversation}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-neutral-200 dark:border-neutral-800">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="font-semibold text-neutral-900 dark:text-neutral-100">
            {currentConversationId ? 'Chat' : 'Nova Conversa'}
          </h1>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex flex-col px-4 py-6 md:py-12 max-w-2xl mx-auto">
              {/* Compact Header with Icon */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-primary rounded-2xl flex items-center justify-center flex-shrink-0">
                  <span className="text-xl text-white font-bold">IA</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                    Como posso ajudar você hoje?
                  </h2>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                    Converse naturalmente sobre suas finanças
                  </p>
                </div>
              </div>

              {/* Suggested prompts - 2 columns on mobile */}
              <div className="grid grid-cols-2 gap-2 md:gap-3">
                <button
                  onClick={() => setInput('Registrar uma despesa de R$ 50 no supermercado')}
                  className="p-3 md:p-4 text-left bg-neutral-50 dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors border border-neutral-200 dark:border-neutral-800"
                >
                  <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    Registrar despesa
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                    Adicione uma nova transação
                  </p>
                </button>

                <button
                  onClick={() => setInput('Quanto gastei este mês?')}
                  className="p-3 md:p-4 text-left bg-neutral-50 dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors border border-neutral-200 dark:border-neutral-800"
                >
                  <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    Ver gastos
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                    Consulte seus gastos
                  </p>
                </button>

                <button
                  onClick={() => setInput('Criar um orçamento mensal de R$ 2000')}
                  className="p-3 md:p-4 text-left bg-neutral-50 dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors border border-neutral-200 dark:border-neutral-800"
                >
                  <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    Criar orçamento
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                    Defina limites de gastos
                  </p>
                </button>

                <button
                  onClick={() => setInput('Quais são minhas metas financeiras?')}
                  className="p-3 md:p-4 text-left bg-neutral-50 dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors border border-neutral-200 dark:border-neutral-800"
                >
                  <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    Ver metas
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                    Acompanhe seus objetivos
                  </p>
                </button>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  role={message.role}
                  content={message.content}
                  userAvatar={userAvatar}
                  onRegenerate={
                    message.role === 'assistant' &&
                      message.id === messages[messages.length - 1]?.id
                      ? handleRegenerate
                      : undefined
                  }
                />
              ))}
              {isLoading && (
                <div className="w-full border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
                  <div className="max-w-3xl mx-auto px-4 py-6 md:px-6">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-gradient-success text-white flex items-center justify-center text-sm font-semibold">
                          IA
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 pb-20 md:pb-0">
          <div className="max-w-3xl mx-auto px-4 py-3 md:px-6 md:py-4">
            <form onSubmit={handleSendMessage} className="relative">
              <textarea
                value={input}
                onChange={(e) => {
                  setInput(e.target.value)
                  // Auto-resize
                  e.target.style.height = 'auto'
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage(e)
                  }
                }}
                placeholder="Mensagem..."
                disabled={isLoading}
                rows={1}
                className="w-full resize-none rounded-2xl border-2 border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-3.5 pr-14 text-base text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-50 transition-all"
                style={{
                  minHeight: '52px',
                  maxHeight: '120px',
                  fontSize: '16px', // Prevent iOS zoom
                }}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="absolute right-2 bottom-2 p-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all active:scale-95 touch-target min-w-[44px] min-h-[44px]"
                aria-label="Enviar mensagem"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 text-center mt-2">
              A IA pode cometer erros. Verifique informações importantes.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
