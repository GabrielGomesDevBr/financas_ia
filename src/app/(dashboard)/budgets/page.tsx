'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BudgetCard } from '@/components/budgets/BudgetCard'
import { BudgetModal } from '@/components/budgets/BudgetModal'
import { MobileHeader } from '@/components/mobile/MobileHeader'
import { Plus, TrendingDown, AlertCircle } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import toast from 'react-hot-toast'

interface BudgetStatus {
  budget_id: string
  category_id: string
  category_name: string
  limit_amount: number
  period: 'monthly' | 'weekly' | 'yearly'
  start_date: string
  end_date: string
  spent_amount: number
  percentage_used: number
  remaining_amount: number
  status: 'ok' | 'warning' | 'exceeded'
  alert_threshold: number
}

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<BudgetStatus[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [familyId, setFamilyId] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBudget, setEditingBudget] = useState<any | null>(null)

  // Load family ID and budgets
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/user/me')
        if (!response.ok) throw new Error('Erro ao buscar dados do usuário')

        const data = await response.json()
        if (data.user?.dbData?.family_id) {
          const familyId = data.user.dbData.family_id
          setFamilyId(familyId)
          await loadBudgets()
        }
      } catch (error) {
        console.error('[Budgets] Erro ao buscar dados:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // Load budgets with status
  const loadBudgets = async () => {
    try {
      const response = await fetch('/api/budgets/status')
      if (!response.ok) throw new Error('Erro ao carregar orçamentos')

      const data = await response.json()
      setBudgets(data.budgets || [])
    } catch (error) {
      console.error('[Budgets] Erro ao carregar orçamentos:', error)
      toast.error('Erro ao carregar orçamentos')
    }
  }

  // Handle edit budget
  const handleEdit = (budget: BudgetStatus) => {
    setEditingBudget({
      id: budget.budget_id,
      category_id: budget.category_id,
      limit_amount: budget.limit_amount,
      period: budget.period,
      start_date: budget.start_date,
      end_date: budget.end_date,
      alert_threshold: budget.alert_threshold,
    })
    setIsModalOpen(true)
  }

  // Handle delete budget
  const handleDelete = async (budgetId: string) => {
    if (!confirm('Tem certeza que deseja excluir este orçamento?')) return

    const toastId = toast.loading('Excluindo orçamento...')

    try {
      const response = await fetch(`/api/budgets/${budgetId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao excluir orçamento')
      }

      toast.success('Orçamento excluído com sucesso!', { id: toastId })
      await loadBudgets()
    } catch (error) {
      console.error('[Budgets] Erro ao deletar orçamento:', error)
      toast.error(
        error instanceof Error ? error.message : 'Erro ao excluir orçamento',
        { id: toastId }
      )
    }
  }

  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false)
    setEditingBudget(null)
  }

  // Handle save budget
  const handleSave = async () => {
    await loadBudgets()
  }

  // Calculate totals
  const totals = budgets.reduce(
    (acc, b) => {
      acc.totalLimit += b.limit_amount
      acc.totalSpent += b.spent_amount
      acc.totalRemaining += b.remaining_amount
      return acc
    },
    { totalLimit: 0, totalSpent: 0, totalRemaining: 0 }
  )

  // Count budgets by status
  const statusCounts = budgets.reduce(
    (acc, b) => {
      acc[b.status] = (acc[b.status] || 0) + 1
      return acc
    },
    { ok: 0, warning: 0, exceeded: 0 } as Record<string, number>
  )

  return (
    <>
      <MobileHeader title="Orçamentos" />
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="relative">
          {/* Decorative gradient blobs */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500/10 rounded-full blur-2xl md:blur-3xl -z-10 animate-pulse-subtle will-change-transform" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/5 rounded-full blur-2xl md:blur-3xl -z-10 will-change-transform" />

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-h1 text-gray-900">Orçamentos</h1>
              <p className="text-muted-foreground mt-1 text-sm md:text-body-lg">
                Defina e acompanhe limites de gastos
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center justify-center h-12 px-8 text-base font-medium rounded-xl bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all duration-200 text-white min-h-[48px] md:self-start"
            >
              <Plus className="h-5 w-5 mr-2 text-white" />
              <span className="text-white">Novo Orçamento</span>
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-3 grid-cols-1 xs:grid-cols-3 animate-slide-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="bg-white rounded-2xl border border-blue-100 shadow-lg shadow-blue-500/5 p-4 md:p-6 hover:-translate-y-1 transition-transform duration-300">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <p className="text-xs md:text-sm font-medium text-gray-500">Total Orçado</p>
                <div className="p-2 md:p-3 rounded-xl bg-blue-50 text-blue-600">
                  <TrendingDown className="h-5 w-5 md:h-6 md:w-6" />
                </div>
              </div>
              <p className="text-2xl md:text-3xl font-bold text-blue-600">
                {formatCurrency(totals.totalLimit)}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-orange-100 shadow-lg shadow-orange-500/5 p-4 md:p-6 hover:-translate-y-1 transition-transform duration-300">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <p className="text-xs md:text-sm font-medium text-gray-500">Total Gasto</p>
                <div className="p-2 md:p-3 rounded-xl bg-orange-50 text-orange-600">
                  <TrendingDown className="h-5 w-5 md:h-6 md:w-6" />
                </div>
              </div>
              <p className="text-2xl md:text-3xl font-bold text-orange-600">
                {formatCurrency(totals.totalSpent)}
              </p>
            </div>
          </div>

          <div className={`bg-white rounded-2xl border shadow-lg p-4 md:p-6 hover:-translate-y-1 transition-transform duration-300 ${totals.totalRemaining >= 0
            ? 'border-green-100 shadow-green-500/5'
            : 'border-red-100 shadow-red-500/5'
            }`}>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <p className="text-xs md:text-sm font-medium text-gray-500">Restante</p>
                <div className={`p-2 md:p-3 rounded-xl ${totals.totalRemaining >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                  <TrendingDown className="h-5 w-5 md:h-6 md:w-6" />
                </div>
              </div>
              <p className={`text-2xl md:text-3xl font-bold ${totals.totalRemaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(totals.totalRemaining)}
              </p>
            </div>
          </div>
        </div>

        {/* Status Overview */}
        {budgets.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-4 md:p-6 animate-slide-in-up" style={{ animationDelay: '0.2s' }}>
            <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4 md:mb-6">Visão Geral</h3>
            <div className="grid grid-cols-1 xs:grid-cols-3 gap-3 md:gap-6">
              <div className="flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl bg-green-50 border border-green-100">
                <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)] flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs md:text-sm font-medium text-green-700">Dentro do limite</p>
                  <p className="text-xl md:text-2xl font-bold text-green-900">{statusCounts.ok || 0}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl bg-yellow-50 border border-yellow-100">
                <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)] flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs md:text-sm font-medium text-yellow-700">Próximo do limite</p>
                  <p className="text-xl md:text-2xl font-bold text-yellow-900">{statusCounts.warning || 0}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl bg-red-50 border border-red-100">
                <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)] flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs md:text-sm font-medium text-red-700">Limite excedido</p>
                  <p className="text-xl md:text-2xl font-bold text-red-900">{statusCounts.exceeded || 0}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Budget List */}
        <div className="space-y-4 animate-slide-in-up" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full" />
            <h2 className="text-h3 text-gray-900">
              Orçamentos Ativos ({budgets.length})
            </h2>
          </div>

          {isLoading ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-12 text-center">
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                <p className="text-sm text-muted-foreground animate-pulse-subtle">Carregando orçamentos...</p>
              </div>
            </div>
          ) : budgets.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-8 md:p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mb-4 md:mb-6 shadow-lg shadow-blue-500/30">
                <AlertCircle className="w-8 h-8 md:w-10 md:h-10 text-white" />
              </div>
              <h3 className="text-xl md:text-h3 text-gray-900 mb-2">
                Nenhum orçamento criado
              </h3>
              <p className="text-sm md:text-body-lg text-muted-foreground mb-6 md:mb-8 max-w-md mx-auto">
                Crie seu primeiro orçamento para começar a controlar seus gastos por categoria
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center justify-center h-12 px-8 text-base font-medium rounded-xl bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all duration-200 text-white min-h-[48px]"
              >
                <Plus className="w-5 h-5 mr-2 text-white" />
                <span className="text-white">Criar Primeiro Orçamento</span>
              </button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {budgets.map((budget) => (
                <BudgetCard
                  key={budget.budget_id}
                  budget={budget}
                  onEdit={() => handleEdit(budget)}
                  onDelete={() => handleDelete(budget.budget_id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Budget Modal */}
        {familyId && (
          <BudgetModal
            open={isModalOpen}
            onClose={handleModalClose}
            onSave={handleSave}
            budget={editingBudget}
            familyId={familyId}
          />
        )}
      </div>
    </>
  )
}
