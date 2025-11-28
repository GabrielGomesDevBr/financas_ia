'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { Wallet, TrendingUp, TrendingDown, Target, Sparkles, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { usePeriodFilter } from '@/hooks/usePeriodFilter'
import { PeriodSelector } from '@/components/filters/PeriodSelector'

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    goalsCount: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const { period, setPeriod, customRange, setCustomRange, dateRange } = usePeriodFilter()
  const supabase = createClient()

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data: userData } = await supabase
          .from('users')
          .select('family_id')
          .eq('id', user.id)
          .single()

        if (!userData?.family_id) return

        // Fetch transactions
        let query = supabase
          .from('transactions')
          .select('type, amount')
          .eq('family_id', userData.family_id)

        // Apply date range filter if exists
        if (dateRange) {
          query = query
            .gte('date', dateRange.startDate.split('T')[0])
            .lte('date', dateRange.endDate.split('T')[0])
        }

        const { data: transactions } = await query

        // Calculate totals
        const income = transactions
          ?.filter(t => t.type === 'income')
          .reduce((sum, t) => sum + Number(t.amount), 0) || 0

        const expenses = transactions
          ?.filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + Number(t.amount), 0) || 0

        // Fetch goals count
        const { count: goalsCount } = await supabase
          .from('goals')
          .select('*', { count: 'exact', head: true })
          .eq('family_id', userData.family_id)
          .eq('status', 'active')

        setStats({
          totalIncome: income,
          totalExpenses: expenses,
          balance: income - expenses,
          goalsCount: goalsCount || 0,
        })
      } catch (error) {
        console.error('Erro ao buscar estatísticas:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [period, customRange, supabase])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
          <p className="text-sm text-muted-foreground animate-pulse-subtle">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="relative">
        {/* Decorative gradient blobs - optimized for mobile */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-primary/10 rounded-full blur-2xl md:blur-3xl -z-10 animate-pulse-subtle will-change-transform" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-2xl md:blur-3xl -z-10 will-change-transform" />

        <div>
          <h1 className="text-h1 text-gray-900">Dashboard</h1>
          <p className="text-muted-foreground mt-2 text-body-lg">
            Visão geral das suas finanças
          </p>
        </div>
      </div>

      {/* Period Filter */}
      <Card>
        <CardContent className="pt-6">
          <PeriodSelector
            period={period}
            onPeriodChange={setPeriod}
            onCustomRangeChange={(start, end) => setCustomRange({ start, end })}
          />
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-3 grid-cols-1 xs:grid-cols-2 lg:grid-cols-4">
        {/* Receitas Card */}
        <div className="animate-slide-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="group bg-white rounded-2xl border border-green-100 shadow-lg shadow-green-500/5 hover:shadow-xl hover:shadow-green-500/10 hover:-translate-y-1 transition-all duration-300 overflow-hidden">
            {/* Gradient accent bar */}
            <div className="h-1 gradient-success" />

            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg shadow-green-500/30 group-hover:scale-110 transition-transform duration-300">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Receitas</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <ArrowUpRight className="w-3 h-3 text-green-600" />
                      <span className="text-xs text-green-600 font-semibold">Este período</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-3xl font-bold text-green-600">
                  {formatCurrency(stats.totalIncome)}
                </div>
                <p className="text-xs text-gray-500">
                  Total de receitas
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Despesas Card */}
        <div className="animate-slide-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="group bg-white rounded-2xl border border-red-100 shadow-lg shadow-red-500/5 hover:shadow-xl hover:shadow-red-500/10 hover:-translate-y-1 transition-all duration-300 overflow-hidden">
            {/* Gradient accent bar */}
            <div className="h-1 gradient-danger" />

            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg shadow-red-500/30 group-hover:scale-110 transition-transform duration-300">
                    <TrendingDown className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Despesas</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <ArrowDownRight className="w-3 h-3 text-red-600" />
                      <span className="text-xs text-red-600 font-semibold">Este período</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-3xl font-bold text-red-600">
                  {formatCurrency(stats.totalExpenses)}
                </div>
                <p className="text-xs text-gray-500">
                  Total de despesas
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Saldo Card */}
        <div className="animate-slide-in-up" style={{ animationDelay: '0.3s' }}>
          <div className={`group bg-white rounded-2xl border shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden ${stats.balance >= 0
            ? 'border-blue-100 shadow-blue-500/5 hover:shadow-blue-500/10'
            : 'border-red-100 shadow-red-500/5 hover:shadow-red-500/10'
            }`}>
            {/* Gradient accent bar */}
            <div className={stats.balance >= 0 ? 'h-1 gradient-primary-soft' : 'h-1 gradient-danger'} />

            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300 ${stats.balance >= 0
                    ? 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-blue-500/30'
                    : 'bg-gradient-to-br from-red-500 to-red-600 shadow-red-500/30'
                    }`}>
                    <Wallet className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Saldo</p>
                    <span className="text-xs text-gray-400 font-medium">Receitas - Despesas</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <div className={`text-3xl font-bold ${stats.balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  {formatCurrency(stats.balance)}
                </div>
                <p className="text-xs text-gray-500">
                  {stats.balance >= 0 ? 'Saldo positivo' : 'Saldo negativo'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Metas Card */}
        <div className="animate-slide-in-up" style={{ animationDelay: '0.4s' }}>
          <div className="group bg-white rounded-2xl border border-purple-100 shadow-lg shadow-purple-500/5 hover:shadow-xl hover:shadow-purple-500/10 hover:-translate-y-1 transition-all duration-300 overflow-hidden">
            {/* Gradient accent bar */}
            <div className="h-1 gradient-accent" />

            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform duration-300">
                    <Target className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Metas</p>
                    <span className="text-xs text-purple-600 font-semibold">Ativas</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-3xl font-bold text-purple-600">
                  {stats.goalsCount}
                </div>
                <p className="text-xs text-gray-500">
                  Metas em andamento
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Welcome Card */}
      <div className="animate-slide-in-up" style={{ animationDelay: '0.5s' }}>
        <div className="relative overflow-hidden bg-white rounded-2xl shadow-xl border border-gray-100">
          {/* Background gradient mesh - optimized for mobile */}
          <div className="absolute inset-0 mesh-gradient-soft -z-10 will-change-transform" />

          <div className="relative p-6 md:p-8">
            <div className="flex flex-col items-center text-center md:flex-row md:items-start md:text-left gap-4">
              {/* Icon with gradient background */}
              <div className="flex-shrink-0">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 shadow-lg shadow-primary-500/30">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 w-full">
                <h2 className="text-h2 text-gray-900 mb-3">
                  Bem-vindo ao Assistente Financeiro IA!
                </h2>
                <p className="text-gray-600 text-body-lg mb-6 leading-relaxed">
                  Seu assistente pessoal para controle financeiro inteligente.
                  Gerencie suas finanças de forma simples e eficiente.
                </p>

                {/* Quick Start Guide */}
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-gray-100">
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                    <div className="w-1 h-6 bg-gradient-to-b from-primary-500 to-accent-500 rounded-full" />
                    <p className="text-sm font-semibold text-gray-900">
                      Comece usando o Chat IA para registrar suas transações
                    </p>
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm font-medium text-gray-700 mb-3">Exemplos de comandos:</p>
                    <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 md:gap-3">
                      <div className="flex items-start gap-2 p-2.5 md:p-3 rounded-lg bg-green-50 border border-green-100">
                        <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5" />
                        <p className="text-xs md:text-sm text-gray-700">&quot;Gastei R$ 50 no Uber hoje&quot;</p>
                      </div>
                      <div className="flex items-start gap-2 p-2.5 md:p-3 rounded-lg bg-blue-50 border border-blue-100">
                        <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5" />
                        <p className="text-xs md:text-sm text-gray-700">&quot;Recebi meu salário de R$ 5.000&quot;</p>
                      </div>
                      <div className="flex items-start gap-2 p-2.5 md:p-3 rounded-lg bg-purple-50 border border-purple-100">
                        <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5" />
                        <p className="text-xs md:text-sm text-gray-700">&quot;Quanto gastei em alimentação?&quot;</p>
                      </div>
                      <div className="flex items-start gap-2 p-2.5 md:p-3 rounded-lg bg-amber-50 border border-amber-100">
                        <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5" />
                        <p className="text-xs md:text-sm text-gray-700">&quot;Criar orçamento de R$ 800 para lazer&quot;</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
