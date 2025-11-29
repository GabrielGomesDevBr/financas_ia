'use client'

import { Card } from '@/components/ui/card'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Calendar } from 'lucide-react'
import { motion } from 'framer-motion'

interface BalanceHistoryChartProps {
    data: Array<{
        date: string
        balance: number
        income: number
        expense: number
    }>
}

export function BalanceHistoryChart({ data }: BalanceHistoryChartProps) {
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 0,
        }).format(value)
    }

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr)
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
    }

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="rounded-xl border border-gray-200 bg-white/95 p-4 shadow-xl backdrop-blur-xl">
                    <p className="mb-2 text-sm font-semibold text-gray-900">
                        {formatDate(payload[0].payload.date)}
                    </p>
                    <div className="space-y-1">
                        <div className="flex items-center justify-between gap-4">
                            <span className="text-xs text-gray-600">Saldo:</span>
                            <span className="text-sm font-bold text-blue-600">
                                {formatCurrency(payload[0].payload.balance)}
                            </span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                            <span className="text-xs text-gray-600">Receitas:</span>
                            <span className="text-sm font-semibold text-green-600">
                                {formatCurrency(payload[0].payload.income)}
                            </span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                            <span className="text-xs text-gray-600">Despesas:</span>
                            <span className="text-sm font-semibold text-red-600">
                                {formatCurrency(payload[0].payload.expense)}
                            </span>
                        </div>
                    </div>
                </div>
            )
        }
        return null
    }

    if (!data || data.length === 0) {
        return (
            <Card className="overflow-hidden border-gray-200 bg-white p-6 shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                    <div className="rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-3 shadow-lg shadow-blue-500/20">
                        <Calendar className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Histórico de Saldo</h3>
                        <p className="text-sm text-gray-500">Evolução do seu saldo ao longo do tempo</p>
                    </div>
                </div>
                <div className="flex h-64 items-center justify-center rounded-xl border-2 border-dashed border-gray-200">
                    <p className="text-sm text-gray-500">Sem dados para exibir</p>
                </div>
            </Card>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
            <Card className="overflow-hidden border-gray-200 bg-gradient-to-br from-white via-white to-blue-50/30 shadow-xl">
                {/* Header */}
                <div className="relative overflow-hidden border-b border-gray-100">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-cyan-500/5" />
                    <div className="relative p-4 md:p-6 pb-3 md:pb-4">
                        <div className="flex items-center gap-3">
                            <div className="rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-2.5 md:p-3 shadow-lg shadow-blue-500/20">
                                <Calendar className="h-4 w-4 md:h-5 md:w-5 text-white" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-base md:text-lg font-bold text-gray-900">Histórico de Saldo</h3>
                                <p className="text-xs md:text-sm text-gray-500">Evolução do seu saldo ao longo do tempo</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Chart */}
                <div className="p-4 md:p-6 pt-2">
                    <ResponsiveContainer width="100%" height={280}>
                        <AreaChart data={data} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                            <XAxis
                                dataKey="date"
                                tickFormatter={formatDate}
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
                            <Area
                                type="monotone"
                                dataKey="balance"
                                name="Saldo"
                                stroke="#3b82f6"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorBalance)"
                                activeDot={{ r: 6, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </Card>
        </motion.div>
    )
}
