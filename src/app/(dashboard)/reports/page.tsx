'use client'

import { useEffect, useState } from 'react'
import { MobileHeader } from '@/components/mobile/MobileHeader'
import { MetricCard } from '@/components/ui/MetricCard'
import { BalanceHistoryChart } from '@/components/dashboard/BalanceHistoryChart'
import { IncomeVsExpenseChart } from '@/components/dashboard/IncomeVsExpenseChart'
import { ExpenseChart } from '@/components/transactions/ExpenseChart'
import { usePeriodFilter } from '@/hooks/usePeriodFilter'
import { PeriodSelector } from '@/components/filters/PeriodSelector'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/utils'
import { motion } from 'framer-motion'
import {
    BarChart3,
    TrendingUp,
    TrendingDown,
    Wallet,
    Calendar,
    Download,
    Target,
    AlertCircle,
    CheckCircle,
    ArrowUpCircle,
    ArrowDownCircle,
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Transaction {
    type: 'income' | 'expense'
    amount: number
    category: { name: string } | null
    date: string
}

interface MonthlySummary {
    month: string
    income: number
    expense: number
    balance: number
}

export default function ReportsPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const { period, setPeriod, customRange, setCustomRange, dateRange } = usePeriodFilter()
    const supabase = createClient()

    useEffect(() => {
        loadTransactions()
    }, [period, customRange])

    const loadTransactions = async () => {
        setIsLoading(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data: userData } = await supabase
                .from('users')
                .select('family_id')
                .eq('id', user.id)
                .single()

            if (!userData?.family_id) return

            let query = supabase
                .from('transactions')
                .select('type, amount, date, category:categories!transactions_category_id_fkey(name)')
                .eq('family_id', userData.family_id)

            if (dateRange) {
                query = query
                    .gte('date', dateRange.startDate.split('T')[0])
                    .lte('date', dateRange.endDate.split('T')[0])
            }

            const { data, error } = await query.order('date', { ascending: true })

            if (error) throw error

            const transformedData = (data || []).map((t: any) => ({
                type: t.type,
                amount: t.amount,
                date: t.date,
                category: Array.isArray(t.category) ? t.category[0] : t.category,
            }))

            setTransactions(transformedData)
        } catch (error) {
            console.error('Error loading transactions:', error)
            toast.error('Erro ao carregar relatórios')
        } finally {
            setIsLoading(false)
        }
    }

    // Calculate totals
    const totals = transactions.reduce(
        (acc, t) => {
            if (t.type === 'income') {
                acc.totalIncome += Number(t.amount)
            } else {
                acc.totalExpense += Number(t.amount)
            }
            return acc
        },
        { totalIncome: 0, totalExpense: 0 }
    )

    const balance = totals.totalIncome - totals.totalExpense
    const savingsRate = totals.totalIncome > 0 ? (balance / totals.totalIncome) * 100 : 0

    // Monthly breakdown
    const monthlyData = transactions.reduce((acc, t) => {
        const month = new Date(t.date).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
        if (!acc[month]) {
            acc[month] = { month, income: 0, expense: 0, balance: 0 }
        }
        if (t.type === 'income') {
            acc[month].income += Number(t.amount)
        } else {
            acc[month].expense += Number(t.amount)
        }
        acc[month].balance = acc[month].income - acc[month].expense
        return acc
    }, {} as Record<string, MonthlySummary>)

    const monthlySummaries = Object.values(monthlyData).sort((a, b) => {
        const [aMonth, aYear] = a.month.split(' ')
        const [bMonth, bYear] = b.month.split(' ')
        const aDate = new Date(`${aYear}-${aMonth}-01`)
        const bDate = new Date(`${bYear}-${bMonth}-01`)
        return aDate.getTime() - bDate.getTime()
    })

    // Top categories
    const categoryTotals = transactions
        .filter((t) => t.type === 'expense')
        .reduce((acc, t) => {
            const catName = t.category?.name || 'Sem categoria'
            acc[catName] = (acc[catName] || 0) + Number(t.amount)
            return acc
        }, {} as Record<string, number>)

    const topCategories = Object.entries(categoryTotals)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)

    // Generate insights
    const insights = []

    if (savingsRate > 20) {
        insights.push({
            type: 'success',
            icon: CheckCircle,
            title: 'Ótima taxa de poupança!',
            description: `Você está economizando ${savingsRate.toFixed(1)}% da sua renda. Continue assim!`,
        })
    } else if (savingsRate < 10 && savingsRate > 0) {
        insights.push({
            type: 'warning',
            icon: AlertCircle,
            title: 'Taxa de poupança baixa',
            description: `Você está economizando apenas ${savingsRate.toFixed(1)}% da sua renda. Tente reduzir despesas.`,
        })
    } else if (balance < 0) {
        insights.push({
            type: 'danger',
            icon: TrendingDown,
            title: 'Atenção: Gastos excedem receitas',
            description: `Você está gastando R$ ${Math.abs(balance).toFixed(2)} a mais do que ganha. Revise seus gastos.`,
        })
    }

    if (topCategories.length > 0) {
        const topCat = topCategories[0]
        const percentage = (topCat[1] / totals.totalExpense) * 100
        if (percentage > 40) {
            insights.push({
                type: 'warning',
                icon: Target,
                title: `${topCat[0]} representa ${percentage.toFixed(1)}% dos gastos`,
                description: 'Esta categoria está consumindo grande parte do seu orçamento. Avalie se há espaço para otimização.',
            })
        }
    }

    if (insights.length === 0) {
        insights.push({
            type: 'info',
            icon: BarChart3,
            title: 'Continue acompanhando suas finanças',
            description: 'Monitore regularmente seus gastos para identificar oportunidades de economia.',
        })
    }

    const handleExport = () => {
        const csv = [
            ['Data', 'Tipo', 'Categoria', 'Valor'],
            ...transactions.map((t) => [
                new Date(t.date).toLocaleDateString('pt-BR'),
                t.type === 'income' ? 'Receita' : 'Despesa',
                t.category?.name || 'Sem categoria',
                t.amount.toString(),
            ]),
        ]
            .map((row) => row.join(','))
            .join('\n')

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = `relatorio-${new Date().toISOString().split('T')[0]}.csv`
        link.click()
        toast.success('Relatório exportado com sucesso!')
    }

    return (
        <>
            <MobileHeader title="Relatórios" />
            <div className="space-y-4 md:space-y-6 animate-fade-in pb-6">
                {/* Hero Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-6 md:p-8 text-white shadow-2xl"
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
                                    <h1 className="text-2xl md:text-3xl font-bold">Relatórios Financeiros</h1>
                                    <p className="text-white/80 text-sm md:text-base mt-1">
                                        Análise detalhada das suas finanças
                                    </p>
                                </div>
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleExport}
                                className="flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3 font-semibold text-purple-600 shadow-lg shadow-black/10 transition-all hover:shadow-xl"
                            >
                                <Download className="h-5 w-5" />
                                <span>Exportar CSV</span>
                            </motion.button>
                        </div>

                        {/* Period Selector */}
                        <div className="mt-6 max-w-full md:max-w-2xl">
                            <div className="rounded-2xl bg-white/10 p-3 md:p-4 backdrop-blur-xl">
                                <PeriodSelector
                                    period={period}
                                    onPeriodChange={setPeriod}
                                    onCustomRangeChange={(start, end) => setCustomRange({ start, end })}
                                />
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Summary Cards */}
                <div className="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-4">
                    <MetricCard
                        icon={ArrowUpCircle}
                        label="Total Receitas"
                        value={totals.totalIncome}
                        prefix="R$ "
                        decimals={2}
                        variant="success"
                        delay={0.1}
                    />
                    <MetricCard
                        icon={ArrowDownCircle}
                        label="Total Despesas"
                        value={totals.totalExpense}
                        prefix="R$ "
                        decimals={2}
                        variant="danger"
                        delay={0.2}
                    />
                    <MetricCard
                        icon={Wallet}
                        label="Saldo Período"
                        value={balance}
                        prefix="R$ "
                        decimals={2}
                        variant={balance >= 0 ? 'default' : 'danger'}
                        delay={0.3}
                    />
                    <MetricCard
                        icon={Target}
                        label="Taxa de Poupança"
                        value={savingsRate}
                        suffix="%"
                        decimals={1}
                        variant={savingsRate > 20 ? 'success' : savingsRate > 10 ? 'warning' : 'danger'}
                        delay={0.4}
                    />
                </div>

                {/* Insights */}
                {insights.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.5 }}
                        className="space-y-3"
                    >
                        {insights.map((insight, index) => (
                            <div
                                key={index}
                                className={`rounded-2xl border-2 p-4 md:p-6 ${insight.type === 'success'
                                    ? 'bg-green-50 border-green-200'
                                    : insight.type === 'warning'
                                        ? 'bg-yellow-50 border-yellow-200'
                                        : insight.type === 'danger'
                                            ? 'bg-red-50 border-red-200'
                                            : 'bg-blue-50 border-blue-200'
                                    }`}
                            >
                                <div className="flex items-start gap-4">
                                    <div
                                        className={`rounded-xl p-2.5 ${insight.type === 'success'
                                            ? 'bg-green-100 text-green-600'
                                            : insight.type === 'warning'
                                                ? 'bg-yellow-100 text-yellow-600'
                                                : insight.type === 'danger'
                                                    ? 'bg-red-100 text-red-600'
                                                    : 'bg-blue-100 text-blue-600'
                                            }`}
                                    >
                                        <insight.icon className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900 mb-1">{insight.title}</h3>
                                        <p className="text-sm text-gray-600">{insight.description}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                )}

                {/* Charts Grid */}
                <div className="grid gap-4 md:gap-6 md:grid-cols-2">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.6 }}
                    >
                        <BalanceHistoryChart
                            data={monthlySummaries.map((m) => ({
                                date: m.month,
                                balance: m.balance,
                                income: m.income,
                                expense: m.expense,
                            }))}
                        />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.7 }}
                    >
                        <IncomeVsExpenseChart
                            data={monthlySummaries.map((m) => ({
                                period: m.month,
                                income: m.income,
                                expense: m.expense,
                            }))}
                        />
                    </motion.div>
                </div>

                {/* Expense Breakdown */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.8 }}
                >
                    <ExpenseChart transactions={transactions} />
                </motion.div>

                {/* Monthly Summary Table */}
                {monthlySummaries.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.9 }}
                        className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden"
                    >
                        <div className="p-6 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                                    <Calendar className="h-5 w-5" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">Resumo Mensal</h2>
                                    <p className="text-sm text-gray-500">Comparativo mês a mês</p>
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50/50 border-b border-gray-100">
                                    <tr>
                                        <th className="p-4 text-left text-sm font-semibold text-gray-600">Mês</th>
                                        <th className="p-4 text-right text-sm font-semibold text-gray-600">Receitas</th>
                                        <th className="p-4 text-right text-sm font-semibold text-gray-600">Despesas</th>
                                        <th className="p-4 text-right text-sm font-semibold text-gray-600">Saldo</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {monthlySummaries.map((summary) => (
                                        <tr key={summary.month} className="hover:bg-gray-50/50">
                                            <td className="p-4 text-sm font-medium text-gray-900 capitalize">{summary.month}</td>
                                            <td className="p-4 text-right text-sm font-semibold text-green-600">
                                                {formatCurrency(summary.income)}
                                            </td>
                                            <td className="p-4 text-right text-sm font-semibold text-red-600">
                                                {formatCurrency(summary.expense)}
                                            </td>
                                            <td
                                                className={`p-4 text-right text-sm font-bold ${summary.balance >= 0 ? 'text-blue-600' : 'text-red-600'
                                                    }`}
                                            >
                                                {formatCurrency(summary.balance)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}
            </div>
        </>
    )
}
