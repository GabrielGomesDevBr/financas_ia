'use client'

import { useEffect, useState } from 'react'
import { StatsCard } from '@/components/admin/StatsCard'
import { Loader2 } from 'lucide-react'

export default function AdminDashboard() {
    const [stats, setStats] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchStats()
    }, [])

    const fetchStats = async () => {
        try {
            const response = await fetch('/api/admin/stats')
            const data = await response.json()
            setStats(data)
        } catch (error) {
            console.error('Error fetching stats:', error)
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
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600 mt-1">Visão geral da aplicação</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Usuários Ativos"
                    value={stats?.activeUsers || 0}
                    icon="👥"
                    trend={stats?.usersTrend}
                    color="blue"
                />
                <StatsCard
                    title="Na Waitlist"
                    value={stats?.waitlistUsers || 0}
                    icon="⏳"
                    trend={stats?.waitlistTrend}
                    color="yellow"
                />
                <StatsCard
                    title="Mensagens (Mês)"
                    value={stats?.monthlyMessages || 0}
                    icon="💬"
                    trend={stats?.messagesTrend}
                    color="green"
                />
                <StatsCard
                    title="Custo OpenAI"
                    value={`$${stats?.openaiCost?.toFixed(2) || '0.00'}`}
                    icon="🤖"
                    trend={stats?.costTrend}
                    color="purple"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold mb-4">Atividade Recente</h2>
                    <div className="space-y-3">
                        {stats?.recentActivity?.map((activity: any, index: number) => (
                            <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <div className="text-2xl">{activity.icon}</div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                                    <p className="text-xs text-gray-600">{activity.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold mb-4">Estatísticas Rápidas</h2>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600">Transações este mês</span>
                                <span className="font-semibold">{stats?.monthlyTransactions || 0}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-blue-600 h-2 rounded-full"
                                    style={{ width: `${Math.min((stats?.monthlyTransactions || 0) / 1000 * 100, 100)}%` }}
                                />
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600">Famílias ativas</span>
                                <span className="font-semibold">{stats?.activeFamilies || 0}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-green-600 h-2 rounded-full"
                                    style={{ width: `${Math.min((stats?.activeFamilies || 0) / 100 * 100, 100)}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
