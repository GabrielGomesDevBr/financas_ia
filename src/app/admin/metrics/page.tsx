'use client'

import { useEffect, useState } from 'react'
import { Loader2, TrendingUp, TrendingDown, DollarSign, MessageSquare, Users, Activity, BarChart3, Download, Calendar, Zap, Target, CreditCard } from 'lucide-react'
import { motion } from 'framer-motion'
import { LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import toast from 'react-hot-toast'

const COLORS = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444']

type TabType = 'overview' | 'users' | 'engagement' | 'financial' | 'chatAI' | 'goals'

export default function AdminMetricsPage() {
    const [metrics, setMetrics] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [period, setPeriod] = useState('30d')
    const [activeTab, setActiveTab] = useState<TabType>('overview')

    useEffect(() => {
        fetchMetrics()
    }, [period])

    const fetchMetrics = async () => {
        try {
            setLoading(true)
            const response = await fetch(`/api/admin/metrics?period=${period}`)
            if (!response.ok) throw new Error('Failed to fetch')
            const data = await response.json()
            setMetrics(data)
        } catch (error) {
            console.error('Error fetching metrics:', error)
            toast.error('Erro ao carregar métricas')
        } finally {
            setLoading(false)
        }
    }

    const exportData = () => {
        if (!metrics) return
        const csv = JSON.stringify(metrics, null, 2)
        const blob = new Blob([csv], { type: 'application/json' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `metrics_${period}_${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        toast.success('Dados exportados!')
    }

    const tabs = [
        { id: 'overview' as TabType, label: 'Visão Geral', icon: BarChart3 },
        { id: 'users' as TabType, label: 'Usuários', icon: Users },
        { id: 'engagement' as TabType, label: 'Engajamento', icon: Activity },
        { id: 'financial' as TabType, label: 'Financeiro', icon: DollarSign },
        { id: 'chatAI' as TabType, label: 'Chat IA', icon: MessageSquare },
        { id: 'goals' as TabType, label: 'Metas', icon: Target },
    ]

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
            </div>
        )
    }

    if (!metrics) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <p className="text-gray-600">Erro ao carregar métricas</p>
            </div>
        )
    }

    return (
        <div className="space-y-4 md:space-y-6 animate-fade-in pb-6">
            {/* Hero Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-to-br from-purple-600 via-purple-700 to-pink-600 p-6 md:p-8 text-white shadow-2xl"
            >
                <div className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-white/10 rounded-full blur-3xl -z-0" />
                <div className="absolute bottom-0 left-0 w-48 h-48 md:w-72 md:h-72 bg-white/10 rounded-full blur-3xl -z-0" />

                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="rounded-2xl bg-white/20 p-3 backdrop-blur-xl">
                                <BarChart3 className="h-8 w-8 md:h-10 md:w-10" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold">Métricas Avançadas</h1>
                                <p className="text-white/80 text-sm md:text-base mt-1">
                                    Análise completa de uso e performance
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <select
                                value={period}
                                onChange={(e) => setPeriod(e.target.value)}
                                className="px-4 py-2 bg-white/20 backdrop-blur-xl border border-white/30 rounded-xl text-white font-semibold focus:outline-none focus:ring-2 focus:ring-white/50"
                            >
                                <option value="7d" className="text-gray-900">7 dias</option>
                                <option value="30d" className="text-gray-900">30 dias</option>
                                <option value="90d" className="text-gray-900">90 dias</option>
                                <option value="1y" className="text-gray-900">1 ano</option>
                            </select>
                            <button
                                onClick={exportData}
                                className="px-4 py-2 bg-white text-purple-600 rounded-xl font-semibold hover:bg-white/90 transition-all shadow-lg flex items-center gap-2"
                            >
                                <Download className="w-5 h-5" />
                                <span className="hidden sm:inline">Exportar</span>
                            </button>
                        </div>
                    </div>

                    {/* Quick KPIs */}
                    <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="bg-white/10 backdrop-blur-xl rounded-xl p-3 border border-white/20">
                            <p className="text-xs font-medium text-white/80">Usuários Ativos</p>
                            <p className="text-xl md:text-2xl font-bold mt-1">{metrics.overview.activeUsers}</p>
                            <p className="text-xs text-white/70 mt-1">{metrics.overview.userGrowthRate}</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-xl rounded-xl p-3 border border-white/20">
                            <p className="text-xs font-medium text-white/80">Mensagens</p>
                            <p className="text-xl md:text-2xl font-bold mt-1">{metrics.overview.messages}</p>
                            <p className="text-xs text-white/70 mt-1">{metrics.overview.messageGrowthRate}</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-xl rounded-xl p-3 border border-white/20">
                            <p className="text-xs font-medium text-white/80">Transações</p>
                            <p className="text-xl md:text-2xl font-bold mt-1">{metrics.overview.transactions}</p>
                            <p className="text-xs text-white/70 mt-1">{metrics.overview.transactionGrowthRate}</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-xl rounded-xl p-3 border border-white/20">
                            <p className="text-xs font-medium text-white/80">Custo IA</p>
                            <p className="text-xl md:text-2xl font-bold mt-1">${metrics.overview.estimatedCost.toFixed(2)}</p>
                            <p className="text-xs text-white/70 mt-1">${metrics.overview.costPerUser}/user</p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Tabs */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 p-2 overflow-x-auto"
            >
                <div className="flex gap-2 min-w-max">
                    {tabs.map((tab) => {
                        const Icon = tab.icon
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all whitespace-nowrap ${activeTab === tab.id
                                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                                        : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                <Icon className="w-5 h-5" />
                                {tab.label}
                            </button>
                        )
                    })}
                </div>
            </motion.div>

            {/* Content */}
            <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
            >
                {activeTab === 'overview' && <OverviewTab metrics={metrics} />}
                {activeTab === 'users' && <UsersTab metrics={metrics} />}
                {activeTab === 'engagement' && <EngagementTab metrics={metrics} />}
                {activeTab === 'financial' && <FinancialTab metrics={metrics} />}
                {activeTab === 'chatAI' && <ChatAITab metrics={metrics} />}
                {activeTab === 'goals' && <GoalsTab metrics={metrics} />}
            </motion.div>
        </div>
    )
}

// ===== TAB COMPONENTS =====

function OverviewTab({ metrics }: { metrics: any }) {
    return (
        <div className="space-y-6">
            {/* Main Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    title="Total de Usuários"
                    value={metrics.users.total}
                    change={metrics.users.growthRate}
                    icon={<Users className="w-6 h-6" />}
                    color="purple"
                />
                <MetricCard
                    title="Engajamento"
                    value={`${metrics.engagement.messagesPerUser} msg/user`}
                    change={metrics.overview.messageGrowthRate}
                    icon={<Activity className="w-6 h-6" />}
                    color="blue"
                />
                <MetricCard
                    title="Saldo Líquido"
                    value={`R$ ${metrics.financial.netBalance.toFixed(2)}`}
                    change={metrics.overview.transactionGrowthRate}
                    icon={<DollarSign className="w-6 h-6" />}
                    color="green"
                />
                <MetricCard
                    title="Metas Concluídas"
                    value={`${metrics.goalsAndBudgets.goalCompletionRate}`}
                    change="+5%"
                    icon={<Target className="w-6 h-6" />}
                    color="orange"
                />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* User Growth */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Crescimento de Usuários</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={metrics.users.timeline}>
                            <defs>
                                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip />
                            <Area type="monotone" dataKey="users" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorUsers)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Activity */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Atividade Diária</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={metrics.engagement.timeline}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="messages" fill="#ec4899" name="Mensagens" />
                            <Bar dataKey="transactions" fill="#8b5cf6" name="Transações" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Insights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InsightCard
                    icon={<TrendingUp className="w-6 h-6 text-green-600" />}
                    title="Crescimento Positivo"
                    description={`${metrics.overview.newUsers} novos usuários no período`}
                    color="green"
                />
                <InsightCard
                    icon={<MessageSquare className="w-6 h-6 text-blue-600" />}
                    title="Alto Engajamento"
                    description={`${metrics.engagement.messagesPerUser} mensagens por usuário`}
                    color="blue"
                />
                <InsightCard
                    icon={<DollarSign className="w-6 h-6 text-purple-600" />}
                    title="Custo Controlado"
                    description={`$${metrics.overview.costPerUser} custo IA por usuário`}
                    color="purple"
                />
            </div>
        </div>
    )
}

function UsersTab({ metrics }: { metrics: any }) {
    const distributionData = [
        { name: 'Ativos', value: metrics.users.active },
        { name: 'Waitlist', value: metrics.users.waitlist },
        { name: 'Novos', value: metrics.users.new },
    ]

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <MetricCard
                    title="Usuários Ativos"
                    value={metrics.users.active}
                    change={metrics.users.growthRate}
                    icon={<Users className="w-6 h-6" />}
                    color="green"
                />
                <MetricCard
                    title="Na Waitlist"
                    value={metrics.users.waitlist}
                    change="+5%"
                    icon={<Users className="w-6 h-6" />}
                    color="yellow"
                />
                <MetricCard
                    title="Novos (Período)"
                    value={metrics.users.new}
                    change={metrics.users.growthRate}
                    icon={<Users className="w-6 h-6" />}
                    color="blue"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Distribuição de Usuários</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={distributionData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={(entry) => `${entry.name}: ${entry.value}`}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {distributionData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Crescimento Acumulado</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={metrics.users.timeline}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip />
                            <Line type="monotone" dataKey="users" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: '#8b5cf6' }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    )
}

function EngagementTab({ metrics }: { metrics: any }) {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <MetricCard
                    title="Mensagens Totais"
                    value={metrics.engagement.messages}
                    change={"+15%"}
                    icon={<MessageSquare className="w-6 h-6" />}
                    color="purple"
                />
                <MetricCard
                    title="Transações"
                    value={metrics.engagement.transactions}
                    change={"+8%"}
                    icon={<CreditCard className="w-6 h-6" />}
                    color="blue"
                />
                <MetricCard
                    title="Msgs por Usuário"
                    value={metrics.engagement.messagesPerUser}
                    change={"+12%"}
                    icon={<Activity className="w-6 h-6" />}
                    color="green"
                />
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Engajamento ao Longo do Tempo</h3>
                <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={metrics.engagement.timeline}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="messages" stroke="#ec4899" strokeWidth={2} name="Mensagens" />
                        <Line type="monotone" dataKey="transactions" stroke="#8b5cf6" strokeWidth={2} name="Transações" />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}

function FinancialTab({ metrics }: { metrics: any }) {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <MetricCard
                    title="Receitas"
                    value={`R$ ${metrics.financial.revenue.toFixed(2)}`}
                    change="+10%"
                    icon={<TrendingUp className="w-6 h-6" />}
                    color="green"
                />
                <MetricCard
                    title="Despesas"
                    value={`R$ ${metrics.financial.expenses.toFixed(2)}`}
                    change="+5%"
                    icon={<TrendingDown className="w-6 h-6" />}
                    color="red"
                />
                <MetricCard
                    title="Saldo"
                    value={`R$ ${metrics.financial.netBalance.toFixed(2)}`}
                    change={"+15%"}
                    icon={<DollarSign className="w-6 h-6" />}
                    color="purple"
                />
                <MetricCard
                    title="Transações"
                    value={metrics.financial.transactionCount}
                    change={"+8%"}
                    icon={<CreditCard className="w-6 h-6" />}
                    color="blue"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Top Categorias</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={metrics.financial.topCategories} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis type="number" tick={{ fontSize: 12 }} />
                            <YAxis dataKey="category" type="category" width={120} tick={{ fontSize: 12 }} />
                            <Tooltip />
                            <Bar dataKey="amount" fill="#8b5cf6" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Receitas vs Despesas</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={[
                                    { name: 'Receitas', value: metrics.financial.revenue },
                                    { name: 'Despesas', value: metrics.financial.expenses },
                                ]}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={(entry) => `${entry.name}: R$ ${entry.value.toFixed(2)}`}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                <Cell fill="#10b981" />
                                <Cell fill="#ef4444" />
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    )
}

function ChatAITab({ metrics }: { metrics: any }) {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <MetricCard
                    title="Total Mensagens"
                    value={metrics.chatAI.totalMessages}
                    change={"+20%"}
                    icon={<MessageSquare className="w-6 h-6" />}
                    color="purple"
                />
                <MetricCard
                    title="Custo Total"
                    value={`$${metrics.chatAI.estimatedCost.toFixed(2)}`}
                    change={"+18%"}
                    icon={<DollarSign className="w-6 h-6" />}
                    color="red"
                />
                <MetricCard
                    title="Custo/Usuário"
                    value={`$${metrics.chatAI.costPerUser}`}
                    change={"+5%"}
                    icon={<Users className="w-6 h-6" />}
                    color="blue"
                />
                <MetricCard
                    title="Msgs/Usuário"
                    value={metrics.chatAI.avgMessagesPerUser}
                    change={"+12%"}
                    icon={<Activity className="w-6 h-6" />}
                    color="green"
                />
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Análise de Custos</h3>
                <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-purple-50 rounded-xl">
                        <span className="font-semibold text-gray-700">Custo por Mensagem</span>
                        <span className="text-2xl font-bold text-purple-600">${metrics.chatAI.costPerMessage}</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-blue-50 rounded-xl">
                        <span className="font-semibold text-gray-700">Média de Mensagens por Usuário</span>
                        <span className="text-2xl font-bold text-blue-600">{metrics.chatAI.avgMessagesPerUser}</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-green-50 rounded-xl">
                        <span className="font-semibold text-gray-700">Total de Mensagens</span>
                        <span className="text-2xl font-bold text-green-600">{metrics.chatAI.totalMessages}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

function GoalsTab({ metrics }: { metrics: any }) {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <MetricCard
                    title="Metas Criadas"
                    value={metrics.goalsAndBudgets.goalsCreated}
                    change={"+10%"}
                    icon={<Target className="w-6 h-6" />}
                    color="purple"
                />
                <MetricCard
                    title="Metas Concluídas"
                    value={metrics.goalsAndBudgets.goalsCompleted}
                    change={"+15%"}
                    icon={<Target className="w-6 h-6" />}
                    color="green"
                />
                <MetricCard
                    title="Taxa de Conclusão"
                    value={metrics.goalsAndBudgets.goalCompletionRate}
                    change={"+5%"}
                    icon={<TrendingUp className="w-6 h-6" />}
                    color="blue"
                />
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Performance de Metas</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={[
                                { name: 'Concluídas', value: metrics.goalsAndBudgets.goalsCompleted },
                                { name: 'Em Andamento', value: metrics.goalsAndBudgets.goalsCreated - metrics.goalsAndBudgets.goalsCompleted },
                            ]}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={(entry) => `${entry.name}: ${entry.value}`}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            <Cell fill="#10b981" />
                            <Cell fill="#f59e0b" />
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}

// ===== HELPER COMPONENTS =====

interface MetricCardProps {
    title: string
    value: number | string
    change: string
    icon: React.ReactNode
    color: 'purple' | 'blue' | 'green' | 'red' | 'yellow' | 'orange'
}

function MetricCard({ title, value, change, icon, color }: MetricCardProps) {
    const colorClasses = {
        purple: 'bg-purple-50 text-purple-600',
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-green-50 text-green-600',
        red: 'bg-red-50 text-red-600',
        yellow: 'bg-yellow-50 text-yellow-600',
        orange: 'bg-orange-50 text-orange-600',
    }

    const isPositive = change.startsWith('+')

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
                    {icon}
                </div>
                <span className={`text-sm font-bold px-2 py-1 rounded-lg ${isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {change}
                </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
            <p className="text-sm text-gray-600 mt-1">{title}</p>
        </div>
    )
}

interface InsightCardProps {
    icon: React.ReactNode
    title: string
    description: string
    color: 'green' | 'blue' | 'purple'
}

function InsightCard({ icon, title, description, color }: InsightCardProps) {
    const colorClasses = {
        green: 'border-green-200 bg-green-50',
        blue: 'border-blue-200 bg-blue-50',
        purple: 'border-purple-200 bg-purple-50',
    }

    return (
        <div className={`rounded-2xl border-2 p-6 ${colorClasses[color]}`}>
            <div className="flex items-center gap-3 mb-3">
                {icon}
                <h4 className="font-bold text-gray-900">{title}</h4>
            </div>
            <p className="text-sm text-gray-700">{description}</p>
        </div>
    )
}
