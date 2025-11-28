'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { Input } from '@/components/ui/input'
import { TransactionModal } from '@/components/transactions/TransactionModal'
import { MobileHeader } from '@/components/mobile/MobileHeader'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { Plus, Search, ArrowUpCircle, ArrowDownCircle, Pencil, Trash2, TrendingUp, Lightbulb } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import toast from 'react-hot-toast'
import { usePeriodFilter } from '@/hooks/usePeriodFilter'
import { PeriodSelector } from '@/components/filters/PeriodSelector'
import { logger } from '@/lib/logger'

interface Transaction {
  id: string
  type: 'income' | 'expense'
  amount: number
  description: string
  date: string
  category_id?: string
  subcategory_id?: string
  category: { name: string } | null
  subcategory: { name: string } | null
  source: string
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [familyId, setFamilyId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const { period, setPeriod, customRange, setCustomRange, dateRange } = usePeriodFilter()
  const supabase = createClient()

  // Load family ID and transactions
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/user/me')
        if (!response.ok) throw new Error('Erro ao buscar dados do usuário')

        const data = await response.json()
        if (data.user?.dbData?.family_id) {
          const familyId = data.user.dbData.family_id
          setFamilyId(familyId)
          await loadTransactions(familyId)
        }
      } catch (error) {
        logger.error('Transactions', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // Load transactions
  const loadTransactions = async (familyId: string) => {
    let query = supabase
      .from('transactions')
      .select('id, type, amount, description, date, source, created_at, category_id, subcategory_id, category:categories!transactions_category_id_fkey(name), subcategory:subcategories!transactions_subcategory_id_fkey(name)')
      .eq('family_id', familyId)

    // Apply date range filter if exists
    if (dateRange) {
      query = query
        .gte('date', dateRange.startDate.split('T')[0])
        .lte('date', dateRange.endDate.split('T')[0])
    }

    const { data, error } = await query
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) {
      logger.error('Transactions', error)
      return
    }

    logger.debug('Transactions', data)

    // Transform data to match Transaction interface
    const transformedData = (data || []).map((item: any) => ({
      ...item,
      category: Array.isArray(item.category) ? item.category[0] : item.category,
      subcategory: Array.isArray(item.subcategory) ? item.subcategory[0] : item.subcategory,
    }))

    setTransactions(transformedData)
    setFilteredTransactions(transformedData)
  }

  // Reload transactions when period changes
  useEffect(() => {
    if (familyId) {
      loadTransactions(familyId)
    }
  }, [period, customRange, familyId])

  // Handle edit transaction
  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setIsModalOpen(true)
  }

  // Handle delete transaction
  const handleDelete = async (transactionId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta transação?')) return

    const toastId = toast.loading('Excluindo transação...')

    try {
      const response = await fetch(`/api/transactions/${transactionId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao excluir transação')
      }

      toast.success('Transação excluída com sucesso!', { id: toastId })

      // Recarregar lista
      if (familyId) {
        await loadTransactions(familyId)
      }
    } catch (error) {
      logger.error('Transactions', error)
      toast.error(
        error instanceof Error ? error.message : 'Erro ao excluir transação',
        { id: toastId }
      )
    }
  }

  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false)
    setEditingTransaction(null)
  }

  // Handle save transaction
  const handleSave = async () => {
    if (familyId) {
      await loadTransactions(familyId)
    }
  }

  // Filter transactions
  useEffect(() => {
    let filtered = transactions

    // Filter by type
    if (typeFilter !== 'all') {
      filtered = filtered.filter(t => t.type === typeFilter)
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(t =>
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.category?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.subcategory?.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredTransactions(filtered)
  }, [transactions, typeFilter, searchTerm])

  // Calculate totals
  const totals = filteredTransactions.reduce(
    (acc, t) => {
      if (t.type === 'income') {
        acc.income += Number(t.amount)
      } else {
        acc.expense += Number(t.amount)
      }
      return acc
    },
    { income: 0, expense: 0 }
  )

  // Group transactions by date
  const groupedTransactions = filteredTransactions.reduce((groups, transaction) => {
    const date = new Date(transaction.date).toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    if (!groups[date]) {
      groups[date] = []
    }

    groups[date].push(transaction)
    return groups
  }, {} as Record<string, Transaction[]>)

  // Calculate daily totals for each group
  const dailyTotals = Object.entries(groupedTransactions).reduce((acc, [date, txs]) => {
    acc[date] = txs.reduce((sum, t) => {
      return sum + Number(t.amount) * (t.type === 'income' ? 1 : -1)
    }, 0)
    return acc
  }, {} as Record<string, number>)

  // Calculate insights
  const insights = {
    topExpense: filteredTransactions
      .filter(t => t.type === 'expense')
      .sort((a, b) => Number(b.amount) - Number(a.amount))[0],
    topCategory: Object.entries(
      filteredTransactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => {
          const cat = t.category?.name || 'Sem categoria'
          acc[cat] = (acc[cat] || 0) + Number(t.amount)
          return acc
        }, {} as Record<string, number>)
    ).sort(([, a], [, b]) => b - a)[0],
    averageExpense: filteredTransactions.filter(t => t.type === 'expense').length > 0
      ? filteredTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0) / filteredTransactions.filter(t => t.type === 'expense').length
      : 0
  }

  return (
    <>
      <MobileHeader title="Transações" />
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="relative">
          {/* Decorative gradient blobs - optimized for mobile */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-primary/10 rounded-full blur-2xl md:blur-3xl -z-10 animate-pulse-subtle will-change-transform" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-2xl md:blur-3xl -z-10 will-change-transform" />

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-h1 text-gray-900">Transações</h1>
              <p className="text-muted-foreground mt-2 text-body-lg">
                Gerencie suas receitas e despesas
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center justify-center h-12 px-8 text-base font-medium rounded-xl bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 md:self-start text-white min-h-[48px]"
            >
              <Plus className="h-5 w-5 mr-2 text-white" />
              <span className="text-white">Nova Transação</span>
            </button>
          </div>
        </div>

        {/* Period Filter */}
        <Card className="p-4">
          <PeriodSelector
            period={period}
            onPeriodChange={setPeriod}
            onCustomRangeChange={(start, end) => setCustomRange({ start, end })}
          />
        </Card>

        {/* Stats Cards */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
          <div className="animate-slide-in-up" style={{ animationDelay: '0.1s' }}>
            <div className="bg-white rounded-2xl border border-green-100 shadow-lg shadow-green-500/5 hover:shadow-xl hover:shadow-green-500/10 hover:-translate-y-1 transition-all duration-300 overflow-hidden">
              <div className="h-1 gradient-success" />
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Receitas</p>
                    <p className="text-3xl font-bold text-green-600 mt-1">
                      {formatCurrency(totals.income)}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-green-50 text-green-600">
                    <ArrowUpCircle className="h-8 w-8" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="animate-slide-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="bg-white rounded-2xl border border-red-100 shadow-lg shadow-red-500/5 hover:shadow-xl hover:shadow-red-500/10 hover:-translate-y-1 transition-all duration-300 overflow-hidden">
              <div className="h-1 gradient-danger" />
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Despesas</p>
                    <p className="text-3xl font-bold text-red-600 mt-1">
                      {formatCurrency(totals.expense)}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-red-50 text-red-600">
                    <ArrowDownCircle className="h-8 w-8" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="animate-slide-in-up" style={{ animationDelay: '0.3s' }}>
            <div className={`bg-white rounded-2xl border shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden ${totals.income - totals.expense >= 0
              ? 'border-blue-100 shadow-blue-500/5 hover:shadow-blue-500/10'
              : 'border-red-100 shadow-red-500/5 hover:shadow-red-500/10'
              }`}>
              <div className={totals.income - totals.expense >= 0 ? 'h-1 gradient-primary-soft' : 'h-1 gradient-danger'} />
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Saldo</p>
                    <p className={`text-3xl font-bold mt-1 ${totals.income - totals.expense >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                      {formatCurrency(totals.income - totals.expense)}
                    </p>
                  </div>
                  <div className={`p-3 rounded-xl ${totals.income - totals.expense >= 0 ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'}`}>
                    {totals.income - totals.expense >= 0 ? (
                      <ArrowUpCircle className="h-8 w-8" />
                    ) : (
                      <ArrowDownCircle className="h-8 w-8" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Transaction Count Card */}
          <div className="animate-slide-in-up" style={{ animationDelay: '0.4s' }}>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-lg shadow-gray-500/5 hover:shadow-xl hover:shadow-gray-500/10 hover:-translate-y-1 transition-all duration-300 overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-gray-400 to-gray-500" />
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Transações</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">
                      {filteredTransactions.length}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 text-gray-600">
                    <Search className="h-8 w-8" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Average Transaction Card */}
          <div className="animate-slide-in-up col-span-2 md:col-span-1" style={{ animationDelay: '0.5s' }}>
            <div className="bg-white rounded-2xl border border-purple-100 shadow-lg shadow-purple-500/5 hover:shadow-xl hover:shadow-purple-500/10 hover:-translate-y-1 transition-all duration-300 overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-purple-400 to-purple-500" />
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Média</p>
                    <p className="text-3xl font-bold text-purple-600 mt-1">
                      {formatCurrency(filteredTransactions.length > 0
                        ? (totals.income + totals.expense) / filteredTransactions.length
                        : 0)}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-purple-50 text-purple-600">
                    <ArrowUpCircle className="h-8 w-8" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Insights Card */}
        {filteredTransactions.length > 0 && (
          <div className="animate-slide-in-up" style={{ animationDelay: '0.6s' }}>
            <Card className="overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 border-blue-200/60 shadow-xl">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/20">
                    <Lightbulb className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Insights Financeiros</h3>
                    <p className="text-sm text-gray-600">Análise do seu comportamento financeiro</p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  {/* Top Expense */}
                  {insights.topExpense && (
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200/60 shadow-sm">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-red-100 text-red-600">
                          <TrendingUp className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Maior Despesa</p>
                          <p className="font-bold text-gray-900 truncate" title={insights.topExpense.description}>
                            {insights.topExpense.description}
                          </p>
                          <p className="text-lg font-bold text-red-600 mt-1">
                            {formatCurrency(insights.topExpense.amount)}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {insights.topExpense.category?.name || 'Sem categoria'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Top Category */}
                  {insights.topCategory && (
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200/60 shadow-sm">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                          <ArrowDownCircle className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Categoria com Mais Gastos</p>
                          <p className="font-bold text-gray-900 truncate" title={insights.topCategory[0]}>
                            {insights.topCategory[0]}
                          </p>
                          <p className="text-lg font-bold text-purple-600 mt-1">
                            {formatCurrency(insights.topCategory[1])}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Total acumulado
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Average Expense */}
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200/60 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                        <ArrowUpCircle className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Despesa Média</p>
                        <p className="font-bold text-gray-900">
                          Por transação
                        </p>
                        <p className="text-lg font-bold text-blue-600 mt-1">
                          {formatCurrency(insights.averageExpense)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {filteredTransactions.filter(t => t.type === 'expense').length} despesas
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-4 animate-slide-in-up" style={{ animationDelay: '0.5s' }}>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-gray-400 pointer-events-none z-10" />
              <Input
                placeholder="Buscar transações..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-200 focus:border-primary-500 focus:ring-primary-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setTypeFilter('all')}
                className={`inline-flex items-center justify-center h-11 px-5 py-2.5 min-h-[44px] rounded-lg text-sm font-medium transition-all duration-200 active:scale-95 ${typeFilter === 'all'
                  ? 'bg-blue-600 hover:bg-blue-700 shadow-lg text-white'
                  : 'border-2 border-gray-300 bg-white text-gray-900 hover:bg-gray-50 hover:border-gray-400'
                  }`}
              >
                <span className={typeFilter === 'all' ? 'text-white' : 'text-gray-900'}>
                  Todas
                </span>
              </button>
              <Button
                variant={typeFilter === 'income' ? 'default' : 'outline'}
                onClick={() => setTypeFilter('income')}
                className={typeFilter === 'income'
                  ? 'bg-gradient-to-r from-green-500 to-green-600 shadow-lg shadow-green-500/30'
                  : 'border-green-300 text-green-700 hover:bg-green-50 hover:border-green-400'}
              >
                Receitas
              </Button>
              <Button
                variant={typeFilter === 'expense' ? 'default' : 'outline'}
                onClick={() => setTypeFilter('expense')}
                className={typeFilter === 'expense'
                  ? 'bg-gradient-to-r from-red-500 to-red-600 shadow-lg shadow-red-500/30'
                  : 'border-red-300 text-red-700 hover:bg-red-50 hover:border-red-400'}
              >
                Despesas
              </Button>
            </div>
          </div>
        </div>

        {/* Transactions List - Mobile Cards */}
        <div className="md:hidden space-y-4 animate-slide-in-up" style={{ animationDelay: '0.6s' }}>
          {isLoading ? (
            <div className="flex flex-col items-center gap-3 py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-500 border-t-transparent"></div>
              <p className="text-sm text-muted-foreground">Carregando transações...</p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="bg-white rounded-2xl p-8">
              <EmptyState
                icon={Search}
                title="Nenhuma transação encontrada"
                description="Tente ajustar seus filtros ou crie uma nova transação"
              />
            </div>
          ) : (
            Object.entries(groupedTransactions).map(([date, dayTransactions]) => (
              <div key={date} className="space-y-3">
                {/* Date Header with Daily Total */}
                <div className="sticky top-0 z-10 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-3 border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-gray-900 capitalize">{date}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">{dayTransactions.length} transações</span>
                      <span className={`text-sm font-bold ${dailyTotals[date] >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {dailyTotals[date] >= 0 ? '+' : ''}{formatCurrency(dailyTotals[date])}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Transactions for this date */}
                {dayTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm active:scale-[0.98] transition-all"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 truncate">{transaction.description}</h4>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(transaction.date).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <span className={`text-lg font-bold ml-3 flex-shrink-0 ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                    {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
                  </span>
                </div>

                {/* Info Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                      {transaction.category?.name || 'Sem categoria'}
                    </span>

                    {transaction.type === 'income' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-50 border border-green-200">
                        <ArrowUpCircle className="w-3.5 h-3.5 text-green-600" />
                        <span className="text-xs font-medium text-green-700">Receita</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-50 border border-red-200">
                        <ArrowDownCircle className="w-3.5 h-3.5 text-red-600" />
                        <span className="text-xs font-medium text-red-700">Despesa</span>
                      </span>
                    )}

                    {transaction.source === 'chat' && (
                      <span className="inline-flex items-center gap-1 text-xs text-purple-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                        Chat IA
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1 ml-2 flex-shrink-0">
                    <button
                      onClick={() => handleEdit(transaction)}
                      className="p-2.5 hover:bg-blue-50 rounded-lg transition-colors active:scale-95 touch-target"
                      aria-label="Editar"
                    >
                      <Pencil className="w-4 h-4 text-blue-600" />
                    </button>
                    <button
                      onClick={() => handleDelete(transaction.id)}
                      className="p-2.5 hover:bg-red-50 rounded-lg transition-colors active:scale-95 touch-target"
                      aria-label="Excluir"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>

                {/* Subcategory if exists */}
                {transaction.subcategory && (
                  <div className="mt-2 pt-2 border-t border-gray-100">
                    <span className="text-xs text-gray-500">
                      Subcategoria: {transaction.subcategory.name}
                    </span>
                  </div>
                )}
              </div>
                ))}
              </div>
            ))
          )}
        </div>

        {/* Transactions Table - Desktop Only */}
        <div className="hidden md:block bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden animate-slide-in-up" style={{ animationDelay: '0.6s' }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/50 border-b border-gray-100">
                <tr className="text-left">
                  <th className="p-4 font-semibold text-gray-600 text-sm">Data</th>
                  <th className="p-4 font-semibold text-gray-600 text-sm">Descrição</th>
                  <th className="p-4 font-semibold text-gray-600 text-sm">Categoria</th>
                  <th className="p-4 font-semibold text-gray-600 text-sm">Tipo</th>
                  <th className="p-4 font-semibold text-gray-600 text-sm text-right">Valor</th>
                  <th className="p-4 font-semibold text-gray-600 text-sm">Origem</th>
                  <th className="p-4 font-semibold text-gray-600 text-sm text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-500 border-t-transparent"></div>
                        <p className="text-sm text-muted-foreground animate-pulse-subtle">Carregando transações...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-12">
                      <EmptyState
                        icon={Search}
                        title="Nenhuma transação encontrada"
                        description="Tente ajustar seus filtros ou crie uma nova transação"
                      />
                    </td>
                  </tr>
                ) : (
                  Object.entries(groupedTransactions).flatMap(([date, dayTransactions]) => [
                    // Date header row
                    <tr key={`date-${date}`} className="bg-gradient-to-r from-gray-50 to-gray-100">
                      <td colSpan={7} className="p-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-bold text-gray-900 capitalize">{date}</h3>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-gray-500">{dayTransactions.length} transações</span>
                            <span className={`text-sm font-bold ${dailyTotals[date] >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {dailyTotals[date] >= 0 ? '+' : ''}{formatCurrency(dailyTotals[date])}
                            </span>
                          </div>
                        </div>
                      </td>
                    </tr>,
                    // Transaction rows for this date
                    ...dayTransactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50/50 transition-colors duration-150">
                      <td className="p-4 text-sm text-gray-600">
                        {new Date(transaction.date).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-gray-900">{transaction.description}</div>
                        {transaction.subcategory && (
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {transaction.subcategory.name}
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-sm">
                        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                          {transaction.category?.name || 'Sem categoria'}
                        </span>
                      </td>
                      <td className="p-4">
                        {transaction.type === 'income' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-green-50 border border-green-200">
                            <ArrowUpCircle className="h-3.5 w-3.5 text-green-600" />
                            <span className="text-xs font-medium text-green-700">Receita</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-50 border border-red-200">
                            <ArrowDownCircle className="h-3.5 w-3.5 text-red-600" />
                            <span className="text-xs font-medium text-red-700">Despesa</span>
                          </span>
                        )}
                      </td>
                      <td className={`p-4 text-right font-bold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {transaction.source === 'chat' ? (
                          <span className="inline-flex items-center gap-1" title="Criado via Chat IA">
                            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                            Chat IA
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1" title="Criado manualmente">
                            <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                            Manual
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(transaction)}
                            className="hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(transaction.id)}
                            className="hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                    ))
                  ])
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Transaction Modal */}
        {familyId && (
          <TransactionModal
            open={isModalOpen}
            onClose={handleModalClose}
            onSave={handleSave}
            transaction={editingTransaction}
            familyId={familyId}
          />
        )}
      </div>
    </>
  )
}
