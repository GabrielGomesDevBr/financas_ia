'use client'

import { useState, useEffect, useRef } from 'react'
import { ChatMessage } from '@/components/chat/ChatMessage'
import { ChatHero } from '@/components/chat/ChatHero'
import { ChatHeader } from '@/components/chat/ChatHeader'
import { ChatInput } from '@/components/chat/ChatInput'
import { ConversationModal } from '@/components/chat/ConversationModal'
import { LoadingIndicator } from '@/components/chat/LoadingIndicator'
import { PersonalitySwitcher } from '@/components/chat/PersonalitySwitcher'
import { createClient } from '@/lib/supabase/client'
import { personalities } from '@/lib/openai/personalities'
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
  const [userAvatar, setUserAvatar] = useState<string | undefined>()
  const [userPersonality, setUserPersonality] = useState<string>('padrao')
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  const currentPersonality = personalities[userPersonality] || personalities.padrao

  // Fetch user data on mount
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
        // TODO: Add personality field to users table
        // For now, defaulting to 'julius' for testing
        setUserPersonality('julius')
      }
    }
    fetchUserData()
  }, [supabase])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Load conversation messages
  const loadConversation = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (error) throw error
      setMessages(data || [])
      setCurrentConversationId(conversationId)
    } catch (error) {
      console.error('Error loading conversation:', error)
      toast.error('Erro ao carregar conversa')
    }
  }

  const handleNewConversation = () => {
    setCurrentConversationId(undefined)
    setMessages([])
    setInput('')
  }

  const handlePromptSelect = (prompt: string) => {
    setInput(prompt)
    // Focus on input (optional)
  }

  const handleSendMessage = async () => {
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

    // Set input to last user message and trigger send
    setInput(lastUserMessage.content)
  }

  const handlePersonalitySwitch = (newPersonality: string) => {
    setUserPersonality(newPersonality)
    const personality = personalities[newPersonality] || personalities.padrao
    toast.success(`Personalidade alterada para ${personality.name}! ${personality.avatar}`, {
      icon: personality.avatar,
      duration: 2000
    })
  }

  return (
    <div className="flex h-screen flex-col bg-gradient-to-br from-gray-50 via-white to-purple-50/30">
      {/* Header */}
      <ChatHeader
        onNewConversation={handleNewConversation}
        onHistoryClick={() => setIsHistoryModalOpen(true)}
        currentTitle={currentPersonality.displayTitle}
      >
        {/* Personality Switcher */}
        <PersonalitySwitcher
          currentPersonality={userPersonality}
          onSwitch={handlePersonalitySwitch}
        />
      </ChatHeader>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <ChatHero onPromptSelect={handlePromptSelect} />
        ) : (
          <div className="mx-auto max-w-3xl px-4 py-6 md:px-6">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                role={message.role}
                content={message.content}
                userAvatar={userAvatar}
                personalityKey={userPersonality}
                onRegenerate={
                  message.role === 'assistant' &&
                    message.id === messages[messages.length - 1]?.id
                    ? handleRegenerate
                    : undefined
                }
              />
            ))}
            {isLoading && (
              <LoadingIndicator personalityKey={userPersonality} />
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <ChatInput
        value={input}
        onChange={setInput}
        onSubmit={handleSendMessage}
        isLoading={isLoading}
      />

      {/* Conversation History Modal */}
      <ConversationModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        currentConversationId={currentConversationId}
        onSelectConversation={loadConversation}
      />
    </div>
  )
}
