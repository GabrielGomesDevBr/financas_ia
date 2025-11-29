'use client'

import { useState } from 'react'
import { Copy, ThumbsUp, ThumbsDown, RefreshCw, Check, User, Bot } from 'lucide-react'
import { toast } from 'react-hot-toast'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { personalities } from '@/lib/openai/personalities'
import { motion } from 'framer-motion'
import { QuickReplies } from './QuickReplies'

interface ChatMessageProps {
  role: 'user' | 'assistant'
  content: string
  onRegenerate?: () => void
  userAvatar?: string
  personalityKey?: string
  onQuickReply?: (text: string) => void
  showQuickReplies?: boolean
}

export function ChatMessage({ role, content, onRegenerate, userAvatar, personalityKey = 'padrao', onQuickReply, showQuickReplies = false }: ChatMessageProps) {
  const [copied, setCopied] = useState(false)
  const [liked, setLiked] = useState<boolean | null>(null)
  const personality = personalities[personalityKey] || personalities.padrao

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      toast.success('Copiado!')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error('Erro ao copiar')
    }
  }

  const handleLike = () => {
    setLiked(liked === true ? null : true)
  }

  const handleDislike = () => {
    setLiked(liked === false ? null : false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: role === 'user' ? 20 : -20, y: 10 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`group w-full border-b border-neutral-200 dark:border-neutral-800 ${role === 'assistant' ? 'bg-neutral-50 dark:bg-neutral-900/50' : 'bg-white dark:bg-neutral-950'
        }`}
    >
      <div className="max-w-3xl mx-auto px-4 py-6 md:px-6">
        <div className="flex gap-4">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {role === 'user' ? (
              userAvatar ? (
                <img
                  src={userAvatar}
                  alt="User"
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-blue-500"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                  <User className="w-5 h-5 text-white" />
                </div>
              )
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                <Bot className="w-5 h-5 text-white" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 space-y-2 overflow-hidden">
            {/* Personality Badge for AI messages */}
            {role === 'assistant' && (
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-xs">{personality.avatar}</span>
                <span className="text-xs font-semibold text-gray-600">{personality.name}</span>
              </div>
            )}

            <div className="prose dark:prose-invert max-w-none prose-p:my-2 prose-headings:my-3">
              {role === 'assistant' ? (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    p: ({ children }) => (
                      <p className="text-neutral-900 dark:text-neutral-100 leading-relaxed">
                        {children}
                      </p>
                    ),
                    strong: ({ children }) => (
                      <strong className="font-bold text-neutral-950 dark:text-white">
                        {children}
                      </strong>
                    ),
                    em: ({ children }) => (
                      <em className="italic text-neutral-800 dark:text-neutral-200">
                        {children}
                      </em>
                    ),
                    ul: ({ children }) => (
                      <ul className="list-disc list-inside space-y-1 my-2">
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="list-decimal list-inside space-y-1 my-2">
                        {children}
                      </ol>
                    ),
                    code: ({ children }) => (
                      <code className="bg-neutral-200 dark:bg-neutral-800 px-1.5 py-0.5 rounded text-sm font-mono">
                        {children}
                      </code>
                    ),
                  }}
                >
                  {content}
                </ReactMarkdown>
              ) : (
                <p className="text-neutral-900 dark:text-neutral-100 whitespace-pre-wrap">
                  {content}
                </p>
              )}
            </div>

            {/* Actions - Only for assistant messages */}
            {role === 'assistant' && (
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={handleCopy}
                  className="p-1.5 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
                  title="Copiar"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
                  )}
                </button>

                <button
                  onClick={handleLike}
                  className={`p-1.5 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors ${liked === true ? 'text-blue-600' : 'text-neutral-600 dark:text-neutral-400'
                    }`}
                  title="Gostei"
                >
                  <ThumbsUp className="w-4 h-4" />
                </button>

                <button
                  onClick={handleDislike}
                  className={`p-1.5 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors ${liked === false ? 'text-blue-600' : 'text-neutral-600 dark:text-neutral-400'
                    }`}
                  title="Não gostei"
                >
                  <ThumbsDown className="w-4 h-4" />
                </button>

                {onRegenerate && (
                  <button
                    onClick={onRegenerate}
                    className="p-1.5 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
                    title="Regenerar resposta"
                  >
                    <RefreshCw className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
                  </button>
                )}
              </div>
            )}

            {/* Quick Replies */}
            {role === 'assistant' && showQuickReplies && onQuickReply && (
              <QuickReplies onSelect={onQuickReply} personalityColor={personality.color} />
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
