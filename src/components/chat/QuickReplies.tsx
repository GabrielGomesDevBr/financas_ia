'use client'

import { motion } from 'framer-motion'
import { Sparkles, TrendingUp, HelpCircle, BarChart3 } from 'lucide-react'

interface QuickReply {
    text: string
    icon?: React.ReactNode
}

interface QuickRepliesProps {
    onSelect: (text: string) => void
    personalityColor?: string
}

const defaultQuickReplies: QuickReply[] = [
    { text: '📊 Analise meus gastos', icon: <BarChart3 className="w-3.5 h-3.5" /> },
    { text: '💡 Me dê dicas de economia', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { text: '🎯 Ajude criar uma meta', icon: <TrendingUp className="w-3.5 h-3.5" /> },
    { text: '❓ Explique melhor', icon: <HelpCircle className="w-3.5 h-3.5" /> },
]

export function QuickReplies({ onSelect, personalityColor = 'purple' }: QuickRepliesProps) {
    const getColorClasses = (color: string) => {
        const colors: Record<string, string> = {
            yellow: 'border-yellow-400/50 hover:border-yellow-500 hover:bg-yellow-50 text-yellow-700',
            pink: 'border-pink-400/50 hover:border-pink-500 hover:bg-pink-50 text-pink-700',
            green: 'border-green-400/50 hover:border-green-500 hover:bg-green-50 text-green-700',
            'green-light': 'border-teal-400/50 hover:border-teal-500 hover:bg-teal-50 text-teal-700',
            blue: 'border-blue-400/50 hover:border-blue-500 hover:bg-blue-50 text-blue-700',
            orange: 'border-orange-400/50 hover:border-orange-500 hover:bg-orange-50 text-orange-700',
            purple: 'border-purple-400/50 hover:border-purple-500 hover:bg-purple-50 text-purple-700',
        }
        return colors[color] || colors.purple
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="flex flex-wrap gap-2 mt-3"
        >
            {defaultQuickReplies.map((reply, index) => (
                <motion.button
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2, delay: 0.3 + index * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onSelect(reply.text)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 text-xs md:text-sm font-medium transition-all ${getColorClasses(personalityColor)}`}
                >
                    {reply.icon}
                    <span>{reply.text}</span>
                </motion.button>
            ))}
        </motion.div>
    )
}
