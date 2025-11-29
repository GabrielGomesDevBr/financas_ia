'use client'

import { Card } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'

interface IncomeVsExpenseChartProps {
    data: Array<{
        period: string
        income: number
        expense: number
    }>
}

export function IncomeVsExpenseChart({ data }: IncomeVsExpenseChartProps) {
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 0,
        }).format(value)
    }

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const income = payload.find((p: any) => p.dataKey === 'income')?.value || 0
            const expense = payload.find((p: any) => p.dataKey === 'expense')?.value || 0
            const balance = income - expense

            return (
                <div className="rounded-xl border border-gray-200 bg-white/95 p-4 shadow-xl backdrop-blur-xl">
                    <p className="mb-2 text-sm font-semibold text-gray-900">{label}</p>
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-6">
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full bg-green-500" />
                                <span className="text-xs text-gray-600">Receitas:</span>
                            </div>
                            <span className="text-sm font-bold text-green-600">{formatCurrency(income)}</span>
                        </div>
                        <div className="flex items-center justify-between gap-6">
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full bg-red-500" />
                                <span className="text-xs text-gray-600">Despesas:</span>
                            </div>
                            <span className="text-sm font-bold text-red-600">{formatCurrency(expense)}</span>
                        </div>
                        <div className="mt-2 flex items-center justify-between gap-6 border-t border-gray-200 pt-2">
                            <span className="text-xs font-semibold text-gray-700">Saldo:</span>
                            <span className={`text-sm font-bold ${balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                                {formatCurrency(balance)}
                            </span>
                        </div>
                    </div>
                </div>
            )
        }
        return null
    }

    // Filter out months with no data
    const validData = data.filter(d => d.income > 0 || d.expense > 0)

    if (!validData || validData.length === 0) {
        return (
            <Card className="overflow-hidden border-gray-200 bg-white p-6 shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                    <div className="rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 p-3 shadow-lg shadow-purple-500/20">
                        <TrendingUp className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Receitas vs Despesas</h3>
                        <p className="text-sm text-gray-500">Comparação mensal</p>
                    </div>
                </div>
                <div className="flex h-64 items-center justify-center rounded-xl border-2 border-dashed border-gray-200">
                    <div className="text-center">
                        <TrendingUp className="mx-auto mb-3 h-12 w-12 text-gray-300" />
                        <p className="text-sm font-medium text-gray-500">Sem dados para exibir</p>
                    </div>
                </div>
            </Card>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
            <Card className="overflow-hidden border-gray-200 bg-gradient-to-br from-white via-white to-purple-50/30 shadow-xl">
                {/* Header */}
                <div className="relative overflow-hidden border-b border-gray-100">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-blue-500/5" />
                    <div className="relative p-4 md:p-6">
                        <div className="flex items-center gap-3">
                            <div className="rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 p-2.5 md:p-3 shadow-lg shadow-purple-500/20">
                                <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-white" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-base md:text-lg font-bold text-gray-900">Receitas vs Despesas</h3>
                                <p className="text-xs md:text-sm text-gray-500">Comparação mensal</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Chart */}
                <div className="p-4 md:p-6">
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={validData} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
                                    <stop offset="100%" stopColor="#059669" stopOpacity={0.8} />
                                </linearGradient>
                                <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#ef4444" stopOpacity={1} />
                                    <stop offset="100%" stopColor="#dc2626" stopOpacity={0.8} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                            <XAxis
                                dataKey="period"
                                stroke="#9ca3af"
                                style={{ fontSize: '12px' }}
                                tickLine={false}
                            />
                            <YAxis
                                tickFormatter={formatCurrency}
                                stroke="#9ca3af"
                                style={{ fontSize: '12px' }}
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend
                                wrapperStyle={{ paddingTop: '20px' }}
                                iconType="circle"
                                formatter={(value) => (
                                    <span className="text-sm font-medium text-gray-700">{value}</span>
                                )}
                            />
                            <Bar
                                dataKey="income"
                                name="Receitas"
                                fill="url(#incomeGradient)"
                                radius={[8, 8, 0, 0]}
                                maxBarSize={60}
                            />
                            <Bar
                                dataKey="expense"
                                name="Despesas"
                                fill="url(#expenseGradient)"
                                radius={[8, 8, 0, 0]}
                                maxBarSize={60}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </Card>
        </motion.div>
    )
}
