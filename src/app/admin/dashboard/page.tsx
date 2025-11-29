'use client'

import { useEffect, useState } from 'react'
import { MetricCard } from '@/components/ui/MetricCard'
import {
    Loader2,
    Shield,
    Users,
    MessageSquare,
    DollarSign,
    Home,
    TrendingUp,
    Activity,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    Database,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface AdminStats {
    activeUsers: number
    waitlistUsers: number
    monthlyMessages: number
    openaiCost: number
    monthlyTransactions: number
    activeFamilies: number
    usersTrend?: number
    waitlistTrend?: number
    messagesTrend?: number
    costTrend?: number
    recentActivity?: Array<{
        icon: string
        title: string
        time: string
        type: 'success' | 'warning' | 'error' | 'info'
    }>
    userGrowth?: Array<{ date: string; users: number }>
    messagesByDay?: Array<{ day: string; messages: number }>
    userDistribution?: Array<{ name: string; value: number }>
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export default function AdminDashboard() {
    const [stats, setStats] = useState<AdminStats | null>(null)
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
                <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
            </div>
        )
    }

    if (!stats) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <p className="text-gray-600">Erro ao carregar estatísticas</p>
            </div>
        )
    }

    // Use real data from API (no more mock data!)
    const userGrowthData = stats.userGrowth || []
    const messagesByDayData = stats.messagesByDay || []
    const userDistributionData = stats.userDistribution || []
    const recentActivity = stats.recentActivity || []

    const quickActions = [
        { icon: Users, label: 'Aprovar Waitlist', color: 'from-blue-500 to-cyan-500', href: '/admin/waitlist' },
        { icon: Activity, label: 'Ver Logs', color: 'from-purple-500 to-pink-500', href: '/admin/metrics' },
        {
            icon: Database,
            label: 'Backup BD',
            color: 'from-green-500 to-emerald-500',
            action: async () => {
                try {
                    const response = await fetch('/api/admin/backup')
                    if (!response.ok) throw new Error('Backup failed')

                    const blob = await response.blob()
                    const url = window.URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = `backup_${new Date().toISOString().split('T')[0]}.json`
                    document.body.appendChild(a)
                    a.click()
                    window.URL.revokeObjectURL(url)
                    document.body.removeChild(a)

                    alert('Backup gerado com sucesso!')
                } catch (error) {
                    alert('Erro ao gerar backup')
                    console.error(error)
                }
            }
        },
        { icon: Shield, label: 'Segurança', color: 'from-red-500 to-orange-500', href: '/admin/settings' },
    ]

    return (
        <div className="space-y-4 md:space-y-6 animate-fade-in pb-6">
            {/* Hero Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-to-br from-red-500 via-red-600 to-orange-600 p-6 md:p-8 text-white shadow-2xl"
            >
                <div className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-white/10 rounded-full blur-3xl -z-0" />
                <div className="absolute bottom-0 left-0 w-48 h-48 md:w-72 md:h-72 bg-white/10 rounded-full blur-3xl -z-0" />

                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="rounded-2xl bg-white/20 p-3 backdrop-blur-xl">
                                <Shield className="h-8 w-8 md:h-10 md:w-10" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h1 className="text-2xl md:text-3xl font-bold">Admin Dashboard</h1>
                                    <span className="px-2 py-0.5 bg-white/20 text-xs font-bold rounded-full backdrop-blur-xl">
                                        DEV MODE
                                    </span>
                                </div>
                                <p className="text-white/80 text-sm md:text-base">
                                    Monitoramento e controle do sistema
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats in Hero */}
                    <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                        <div className="bg-white/10 backdrop-blur-xl rounded-xl p-3 border border-white/20">
                            <div className="flex items-center gap-2 mb-1">
                                <Users className="w-4 h-4" />
                                <span className="text-xs font-medium text-white/80">Usuários</span>
                            </div>
                            <p className="text-xl md:text-2xl font-bold">{stats?.activeUsers || 0}</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-xl rounded-xl p-3 border border-white/20">
                            <div className="flex items-center gap-2 mb-1">
                                <MessageSquare className="w-4 h-4" />
                                <span className="text-xs font-medium text-white/80">Mensagens</span>
                            </div>
                            <p className="text-xl md:text-2xl font-bold">{stats?.monthlyMessages || 0}</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-xl rounded-xl p-3 border border-white/20">
                            <div className="flex items-center gap-2 mb-1">
                                <Home className="w-4 h-4" />
                                <span className="text-xs font-medium text-white/80">Famílias</span>
                            </div>
                            <p className="text-xl md:text-2xl font-bold">{stats?.activeFamilies || 0}</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-xl rounded-xl p-3 border border-white/20">
                            <div className="flex items-center gap-2 mb-1">
                                <DollarSign className="w-4 h-4" />
                                <span className="text-xs font-medium text-white/80">Custo IA</span>
                            </div>
                            <p className="text-xl md:text-2xl font-bold">${stats?.openaiCost?.toFixed(2) || '0.00'}</p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Main Metrics */}
            <div className="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-4">
                <MetricCard
                    icon={Users}
                    label="Usuários Ativos"
                    value={stats?.activeUsers || 0}
                    variant="default"
                    delay={0.1}
                />
                <MetricCard
                    icon={Clock}
                    label="Na Waitlist"
                    value={stats?.waitlistUsers || 0}
                    variant="warning"
                    delay={0.2}
                />
                <MetricCard
                    icon={MessageSquare}
                    label="Mensagens (Mês)"
                    value={stats?.monthlyMessages || 0}
                    variant="success"
                    delay={0.3}
                />
                <MetricCard
                    icon={DollarSign}
                    label="Custo OpenAI"
                    value={stats?.openaiCost || 0}
                    prefix="$"
                    decimals={2}
                    variant="danger"
                    delay={0.4}
                />
            </div>

            {/* Quick Actions */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.5 }}
            >
                <h2 className="text-lg font-bold text-gray-900 mb-3">Ações Rápidas</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {quickActions.map((action, index) => {
                        const Icon = action.icon
                        const handleClick = () => {
                            if (action.href) {
                                window.location.href = action.href
                            } else if (action.action) {
                                action.action()
                            }
                        }

                        return (
                            <motion.button
                                key={index}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleClick}
                                className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${action.color} p-4 text-white shadow-lg hover:shadow-xl transition-all`}
                            >
                                <div className="absolute inset-0 bg-white/10" />
                                <div className="relative z-10 flex flex-col items-center gap-2">
                                    <Icon className="w-6 h-6" />
                                    <span className="text-sm font-semibold text-center">{action.label}</span>
                                </div>
                            </motion.button>
                        )
                    })}
                </div>
            </motion.div>

            {/* Charts Grid */}
            <div className="grid gap-4 md:gap-6 md:grid-cols-2">
                {/* User Growth Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.6 }}
                    className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6"
                >
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Crescimento de Usuários</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={userGrowthData}>
                            <defs>
                                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                            <YAxis stroke="#6b7280" fontSize={12} />
                            <Tooltip />
                            <Area type="monotone" dataKey="users" stroke="#3b82f6" fill="url(#colorUsers)" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* Messages by Day Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.7 }}
                    className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6"
                >
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Mensagens por Dia</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={messagesByDayData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="day" stroke="#6b7280" fontSize={12} />
                            <YAxis stroke="#6b7280" fontSize={12} />
                            <Tooltip />
                            <Bar dataKey="messages" fill="#10b981" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </motion.div>
            </div>

            {/* Bottom Grid */}
            <div className="grid gap-4 md:gap-6 md:grid-cols-2">
                {/* User Distribution - Improved Cards */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.8 }}
                    className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Distribuição de Usuários</h3>
                            <p className="text-sm text-gray-500 mt-1">Status dos usuários na plataforma</p>
                        </div>
                        <div className="p-2 bg-blue-50 rounded-xl">
                            <Users className="w-5 h-5 text-blue-600" />
                        </div>
                    </div>

                    <div className="space-y-4">
                        {userDistributionData.map((item, index) => {
                            const total = userDistributionData.reduce((sum, i) => sum + i.value, 0)
                            const percentage = ((item.value / total) * 100).toFixed(1)
                            const color = COLORS[index % COLORS.length]

                            return (
                                <div key={item.name} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-3 h-3 rounded-full"
                                                style={{ backgroundColor: color }}
                                            />
                                            <span className="text-sm font-medium text-gray-700">{item.name}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-bold text-gray-900">{item.value}</span>
                                            <span className="text-xs text-gray-500 min-w-[45px] text-right">{percentage}%</span>
                                        </div>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${percentage}%` }}
                                            transition={{ duration: 1, delay: 0.8 + index * 0.1, ease: 'easeOut' }}
                                            className="h-full rounded-full"
                                            style={{ backgroundColor: color }}
                                        />
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* Summary */}
                    <div className="mt-6 pt-6 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-gray-700">Total de Usuários</span>
                            <span className="text-xl font-bold text-gray-900">
                                {userDistributionData.reduce((sum, i) => sum + i.value, 0)}
                            </span>
                        </div>
                    </div>
                </motion.div>

                {/* Recent Activity - Enhanced */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.9 }}
                    className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Atividade Recente</h3>
                            <p className="text-sm text-gray-500 mt-1">Últimos eventos do sistema</p>
                        </div>
                        <div className="p-2 bg-purple-50 rounded-xl">
                            <Activity className="w-5 h-5 text-purple-600" />
                        </div>
                    </div>

                    <div className="space-y-3">
                        {recentActivity.map((activity, index) => {
                            const configMap = {
                                success: {
                                    bg: 'bg-green-50',
                                    border: 'border-green-200',
                                    iconBg: 'bg-green-100',
                                    iconColor: 'text-green-600',
                                    textColor: 'text-green-900',
                                    Icon: CheckCircle,
                                },
                                warning: {
                                    bg: 'bg-yellow-50',
                                    border: 'border-yellow-200',
                                    iconBg: 'bg-yellow-100',
                                    iconColor: 'text-yellow-600',
                                    textColor: 'text-yellow-900',
                                    Icon: AlertCircle,
                                },
                                error: {
                                    bg: 'bg-red-50',
                                    border: 'border-red-200',
                                    iconBg: 'bg-red-100',
                                    iconColor: 'text-red-600',
                                    textColor: 'text-red-900',
                                    Icon: XCircle,
                                },
                                info: {
                                    bg: 'bg-blue-50',
                                    border: 'border-blue-200',
                                    iconBg: 'bg-blue-100',
                                    iconColor: 'text-blue-600',
                                    textColor: 'text-blue-900',
                                    Icon: Activity,
                                },
                            }

                            const config = configMap[activity.type as keyof typeof configMap] || configMap.info
                            const StatusIcon = config.Icon

                            return (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.3, delay: 0.9 + index * 0.1 }}
                                    className={`flex items-start gap-3 p-4 rounded-xl border-2 ${config.bg} ${config.border} hover:shadow-md transition-all`}
                                >
                                    {/* Icon with status indicator */}
                                    <div className="relative flex-shrink-0">
                                        <div className={`w-10 h-10 ${config.iconBg} rounded-xl flex items-center justify-center`}>
                                            <span className="text-lg">{activity.icon}</span>
                                        </div>
                                        <div className={`absolute -top-1 -right-1 w-4 h-4 ${config.iconBg} rounded-full border-2 border-white flex items-center justify-center`}>
                                            <StatusIcon className={`w-2.5 h-2.5 ${config.iconColor}`} />
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-semibold ${config.textColor} mb-0.5`}>
                                            {activity.title}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-3 h-3 text-gray-400" />
                                            <p className="text-xs text-gray-600">{activity.time}</p>
                                        </div>
                                    </div>

                                    {/* Action indicator */}
                                    <button className="flex-shrink-0 p-1.5 hover:bg-white rounded-lg transition-colors">
                                        <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                                    </button>
                                </motion.div>
                            )
                        })}
                    </div>

                    {/* View all button */}
                    <button className="w-full mt-4 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium rounded-xl transition-colors text-sm border border-gray-200">
                        Ver Todos os Logs →
                    </button>
                </motion.div>
            </div>
        </div>
    )
}
