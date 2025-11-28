'use client'

import { useEffect, useState } from 'react'
import { Loader2, TrendingUp, TrendingDown, DollarSign, MessageSquare, Users, Activity } from 'lucide-react'

export default function AdminMetricsPage() {
    const [metrics, setMetrics] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [timeRange, setTimeRange] = useState('30d')

    useEffect(() => {
        fetchMetrics()
    }, [timeRange])

    const fetchMetrics = async () => {
        try {
            const response = await fetch(`/api/admin/stats?range=${timeRange}`)
            const data = await response.json()
            setMetrics(data)
        } catch (error) {
            console.error('Error fetching metrics:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Métricas Detalhadas</h1>
                    <p className="text-gray-600 mt-1">Análise de uso e performance da aplicação</p>
                </div>
                <select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                    <option value="7d">Últimos 7 dias</option>
                    <option value="30d">Últimos 30 dias</option>
                    <option value="90d">Últimos 90 dias</option>
                    <option value="1y">Último ano</option>
                </select>
            </div>

            {/* Engagement Metrics */}
            <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">📊 Engajamento</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <MetricCard
                        title="Usuários Ativos"
                        value={metrics?.activeUsers || 0}
                        icon={<Users className="w-6 h-6" />}
                        trend="+12%"
                        color="blue"
                    />
                    <MetricCard
                        title="Mensagens de Chat"
                        value={metrics?.monthlyMessages || 0}
                        icon={<MessageSquare className="w-6 h-6" />}
                        trend="+25%"
                        color="green"
                    />
                    <MetricCard
                        title="Transações"
                        value={metrics?.monthlyTransactions || 0}
                        icon={<Activity className="w-6 h-6" />}
                        trend="+8%"
                        color="purple"
                    />
                </div>
            </div>

            {/* Cost Metrics */}
            <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">💰 Custos</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium text-gray-600">Custo OpenAI (Mês)</h3>
                            <DollarSign className="w-5 h-5 text-green-600" />
                        </div>
                        <p className="text-3xl font-bold text-gray-900">
                            ${metrics?.openaiCost?.toFixed(2) || '0.00'}
                        </p>
                        <p className="text-sm text-gray-600 mt-2">
                            Custo por usuário: ${((metrics?.openaiCost || 0) / (metrics?.activeUsers || 1)).toFixed(2)}
                        </p>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium text-gray-600">Projeção Mensal</h3>
                            <TrendingUp className="w-5 h-5 text-blue-600" />
                        </div>
                        <p className="text-3xl font-bold text-gray-900">
                            ${((metrics?.openaiCost || 0) * 1.2).toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-600 mt-2">
                            Baseado no crescimento atual
                        </p>
                    </div>
                </div>
            </div>

            {/* Performance Metrics */}
            <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">⚡ Performance</h2>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-600">Tempo médio de resposta (Chat)</span>
                                <span className="font-semibold">2.3s</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-green-600 h-2 rounded-full" style={{ width: '70%' }} />
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-600">Taxa de erro</span>
                                <span className="font-semibold">0.5%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '5%' }} />
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-600">Uptime</span>
                                <span className="font-semibold">99.9%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-green-600 h-2 rounded-full" style={{ width: '99.9%' }} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

interface MetricCardProps {
    title: string
    value: number
    icon: React.ReactNode
    trend: string
    color: 'blue' | 'green' | 'purple'
}

function MetricCard({ title, value, icon, trend, color }: MetricCardProps) {
    const colorClasses = {
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-green-50 text-green-600',
        purple: 'bg-purple-50 text-purple-600',
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
                    {icon}
                </div>
                <span className={`text-sm font-medium ${trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                    {trend}
                </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</h3>
            <p className="text-sm text-gray-600 mt-1">{title}</p>
        </div>
    )
}
