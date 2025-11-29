'use client'

import { Card } from '@/components/ui/card'
import { Receipt, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface Transaction {
    id: string
    description: string
    amount: number
    type: 'income' | 'expense'
    category: string
    date: string
}

interface RecentTransactionsTableProps {
    transactions: Transaction[]
}

export function RecentTransactionsTable({ transactions }: RecentTransactionsTableProps) {
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(value)
    }

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr)
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
            <Card className="overflow-hidden border-gray-200 bg-white shadow-xl">
                {/* Header */}
                <div className="border-b border-gray-100 p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 p-3 shadow-lg shadow-indigo-500/20">
                                <Receipt className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Transações Recentes</h3>
                                <p className="text-sm text-gray-500">Últimas movimentações</p>
                            </div>
                        </div>
                        <Link
                            href="/transactions"
                            className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold text-indigo-600 transition-colors hover:bg-indigo-50"
                        >
                            Ver todas
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>

                {/* Transactions List */}
                <div className="divide-y divide-gray-100">
                    {transactions.length === 0 ? (
                        <div className="flex h-40 items-center justify-center">
                            <p className="text-sm text-gray-500">Nenhuma transação recente</p>
                        </div>
                    ) : (
                        transactions.slice(0, 5).map((transaction, index) => (
                            <motion.div
                                key={transaction.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                className="group flex items-center gap-4 p-4 transition-colors hover:bg-gray-50"
                            >
                                {/* Icon */}
                                <div
                                    className={cn(
                                        'rounded-xl p-3 shadow-sm',
                                        transaction.type === 'income'
                                            ? 'bg-green-50 text-green-600'
                                            : 'bg-red-50 text-red-600'
                                    )}
                                >
                                    <Receipt className="h-4 w-4" />
                                </div>

                                {/* Details */}
                                <div className="flex-1 min-w-0">
                                    <p className="truncate font-semibold text-gray-900">
                                        {transaction.description}
                                    </p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-xs text-gray-500">{transaction.category}</span>
                                        <span className="text-xs text-gray-400">•</span>
                                        <span className="text-xs text-gray-500">{formatDate(transaction.date)}</span>
                                    </div>
                                </div>

                                {/* Amount */}
                                <div className="text-right">
                                    <p
                                        className={cn(
                                            'font-bold',
                                            transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                                        )}
                                    >
                                        {transaction.type === 'income' ? '+' : '-'} {formatCurrency(Math.abs(transaction.amount))}
                                    </p>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </Card>
        </motion.div>
    )
}
