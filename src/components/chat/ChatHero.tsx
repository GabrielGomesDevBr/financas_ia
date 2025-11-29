'use client'

import { Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { SuggestedPromptCard } from './SuggestedPromptCard'
import { Receipt, TrendingUp, Target, PiggyBank } from 'lucide-react'

interface ChatHeroProps {
    onPromptSelect: (prompt: string) => void
}

const suggestedPrompts = [
    {
        icon: Receipt,
        title: 'Adicionar Transação',
        description: 'Registre uma despesa ou receita',
        prompt: 'Quero registrar uma despesa de R$ 50 no supermercado',
        gradient: 'from-green-500 to-emerald-500',
    },
    {
        icon: TrendingUp,
        title: 'Ver Meus Gastos',
        description: 'Consulte suas despesas',
        prompt: 'Quanto gastei este mês?',
        gradient: 'from-blue-500 to-cyan-500',
    },
    {
        icon: PiggyBank,
        title: 'Criar Orçamento',
        description: 'Defina limites de gastos',
        prompt: 'Quero criar um orçamento mensal de R$ 2000 para alimentação',
        gradient: 'from-orange-500 to-red-500',
    },
    {
        icon: Target,
        title: 'Minhas Metas',
        description: 'Acompanhe seus objetivos',
        prompt: 'Quais são minhas metas financeiras ativas?',
        gradient: 'from-purple-500 to-pink-500',
    },
]

export function ChatHero({ onPromptSelect }: ChatHeroProps) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 py-8 md:py-12">
            {/* Animated gradient background */}
            <div className="absolute inset-0 overflow-hidden -z-10">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-indigo-400/30 to-purple-400/30 rounded-full blur-3xl animate-pulse-subtle" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-purple-400/30 to-pink-400/30 rounded-full blur-3xl animate-pulse-subtle" style={{ animationDelay: '1s' }} />
            </div>

            {/* AI Avatar with pulse */}
            <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="relative mb-6"
            >
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-2xl shadow-purple-500/50">
                    <Sparkles className="w-10 h-10 md:w-12 md:h-12 text-white" />
                </div>
                {/* Glow effect */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 blur-xl opacity-50 animate-pulse-glow -z-10" />
            </motion.div>

            {/* Title */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-center mb-8 md:mb-10 max-w-2xl"
            >
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                    Seu Assistente Financeiro Pessoal
                </h1>
                <p className="text-base md:text-lg text-gray-600">
                    Converse naturalmente sobre suas finanças. Eu posso ajudar com transações, orçamentos, metas e muito mais!
                </p>
            </motion.div>

            {/* Suggested Prompts Grid */}
            <div className="w-full max-w-4xl">
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4 text-center"
                >
                    Experimente perguntar:
                </motion.p>
                <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                    {suggestedPrompts.map((prompt, index) => (
                        <SuggestedPromptCard
                            key={index}
                            {...prompt}
                            onClick={() => onPromptSelect(prompt.prompt)}
                            delay={0.1 * index}
                        />
                    ))}
                </div>
            </div>

            {/* Hint */}
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                className="text-xs text-gray-500 mt-8 text-center"
            >
                💡 Dica: Você pode digitar ou falar naturalmente
            </motion.p>
        </div>
    )
}
