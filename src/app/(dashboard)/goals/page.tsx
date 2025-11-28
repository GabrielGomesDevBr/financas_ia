'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { GoalCard } from '@/components/goals/GoalCard'
import { GoalModal } from '@/components/goals/GoalModal'
import { DepositModal } from '@/components/goals/DepositModal'
import { MobileHeader } from '@/components/mobile/MobileHeader'
import { Plus, Target, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Goal {
  id: string
  name: string
  description?: string
  target_amount: number
  current_amount: number
  deadline?: string
  status: 'active' | 'completed' | 'cancelled'
  percentage: number
  remaining_amount: number
  days_remaining?: number | null
  total_deposits: number
  deposits?: any[]
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false)
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [depositingGoal, setDepositingGoal] = useState<Goal | null>(null)

  // Load goals
  useEffect(() => {
    loadGoals()
  }, [])

  const loadGoals = async () => {
    try {
      const response = await fetch('/api/goals')
      if (!response.ok) throw new Error('Erro ao carregar metas')

      const data = await response.json()
      setGoals(data.goals || [])
    } catch (error) {
      console.error('[Goals] Erro ao carregar metas:', error)
      toast.error('Erro ao carregar metas')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle edit goal
  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal)
    setIsGoalModalOpen(true)
  }

  // Handle delete goal
  const handleDelete = async (goalId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta meta?')) return

    const toastId = toast.loading('Excluindo meta...')

    try {
      const response = await fetch(`/api/goals/${goalId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao excluir meta')
      }

      toast.success('Meta excluída com sucesso!', { id: toastId })
      await loadGoals()
    } catch (error) {
      console.error('[Goals] Erro ao deletar meta:', error)
      toast.error(
        error instanceof Error ? error.message : 'Erro ao excluir meta',
        { id: toastId }
      )
    }
  }

  // Handle deposit
  const handleDeposit = (goal: Goal) => {
    setDepositingGoal(goal)
    setIsDepositModalOpen(true)
  }

  // Handle modal close
  const handleGoalModalClose = () => {
    setIsGoalModalOpen(false)
    setEditingGoal(null)
  }

  const handleDepositModalClose = () => {
    setIsDepositModalOpen(false)
    setDepositingGoal(null)
  }

  // Handle save
  const handleSave = async () => {
    await loadGoals()
  }

  // Filter goals by status
  const activeGoals = goals.filter((g) => g.status === 'active')
  const completedGoals = goals.filter((g) => g.status === 'completed')

  // Calculate totals
  const totals = activeGoals.reduce(
    (acc, g) => {
      acc.totalTarget += g.target_amount
      acc.totalCurrent += g.current_amount
      acc.totalRemaining += g.remaining_amount
      return acc
    },
    { totalTarget: 0, totalCurrent: 0, totalRemaining: 0 }
  )

  const overallPercentage =
    totals.totalTarget > 0 ? (totals.totalCurrent / totals.totalTarget) * 100 : 0

  return (
    <>
      <MobileHeader title="Metas" />
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="relative">
          {/* Decorative gradient blobs */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-accent/10 rounded-full blur-2xl md:blur-3xl -z-10 animate-pulse-subtle will-change-transform" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-2xl md:blur-3xl -z-10 will-change-transform" />

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-h1 text-gray-900">Metas Financeiras</h1>
              <p className="text-muted-foreground mt-1 text-sm md:text-body-lg">Alcance seus objetivos financeiros</p>
            </div>
            <button
              onClick={() => setIsGoalModalOpen(true)}
              className="inline-flex items-center justify-center h-12 px-8 text-base font-medium rounded-xl bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 hover:-translate-y-0.5 transition-all duration-200 text-white min-h-[48px] md:self-start"
            >
              <Plus className="h-5 w-5 mr-2 text-white" />
              <span className="text-white">Nova Meta</span>
            </button>
          </div>
        </div>

        {/* Summary Card */}
        <div className="animate-slide-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="relative overflow-hidden rounded-2xl shadow-2xl shadow-purple-500/20">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-blue-600" />
            <div className="absolute inset-0 mesh-gradient-soft opacity-30" />

            <div className="relative p-6 md:p-8 text-white">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4 md:mb-6">
                <div>
                  <p className="text-purple-100 text-xs md:text-sm font-medium mb-1">Total Economizado</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl md:text-4xl font-bold tracking-tight text-white">
                      {formatCurrency(totals.totalCurrent)}
                    </p>
                    <p className="text-purple-200 text-xs md:text-sm">
                      de {formatCurrency(totals.totalTarget)}
                    </p>
                  </div>
                </div>
                <div className="p-3 md:p-4 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10 shadow-lg self-start">
                  <Target className="w-6 h-6 md:w-8 md:h-8 text-white" />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-xs md:text-sm font-medium text-purple-100">
                  <span>Progresso geral</span>
                  <span>{overallPercentage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-black/20 rounded-full h-3 overflow-hidden backdrop-blur-sm">
                  <div
                    className="h-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-all duration-1000 ease-out"
                    style={{ width: `${Math.min(overallPercentage, 100)}%` }}
                  />
                </div>
              </div>

              <div className="flex flex-col xs:flex-row xs:items-center gap-3 md:gap-6 mt-4 md:mt-6 pt-4 md:pt-6 border-t border-white/10">
                <div className="flex items-center gap-2 text-purple-50">
                  <div className="p-1.5 rounded-lg bg-white/10">
                    <TrendingUp className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xs md:text-sm font-medium text-white">{activeGoals.length} metas ativas</span>
                </div>
                <div className="flex items-center gap-2 text-purple-50">
                  <div className="p-1.5 rounded-lg bg-white/10">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xs md:text-sm font-medium text-white">{completedGoals.length} concluídas</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {activeGoals.length > 0 && (
          <div className="grid gap-3 grid-cols-1 xs:grid-cols-3 animate-slide-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-4 md:p-6 hover:-translate-y-1 transition-transform duration-300">
              <div>
                <p className="text-xs md:text-sm font-medium text-muted-foreground">Meta Total</p>
                <p className="text-xl md:text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(totals.totalTarget)}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-green-100 shadow-lg shadow-green-500/5 p-4 md:p-6 hover:-translate-y-1 transition-transform duration-300">
              <div>
                <p className="text-xs md:text-sm font-medium text-muted-foreground">
                  Já Economizado
                </p>
                <p className="text-xl md:text-2xl font-bold text-green-600 mt-1">
                  {formatCurrency(totals.totalCurrent)}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-blue-100 shadow-lg shadow-blue-500/5 p-4 md:p-6 hover:-translate-y-1 transition-transform duration-300">
              <div>
                <p className="text-xs md:text-sm font-medium text-muted-foreground">
                  Ainda Falta
                </p>
                <p className="text-xl md:text-2xl font-bold text-blue-600 mt-1">
                  {formatCurrency(totals.totalRemaining)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Active Goals */}
        <div className="space-y-4 animate-slide-in-up" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-gradient-to-b from-accent-500 to-accent-600 rounded-full" />
            <h2 className="text-h3 text-gray-900">
              Metas Ativas ({activeGoals.length})
            </h2>
          </div>

          {isLoading ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-12 text-center">
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-accent-500 border-t-transparent"></div>
                <p className="text-sm text-muted-foreground animate-pulse-subtle">Carregando metas...</p>
              </div>
            </div>
          ) : activeGoals.length === 0 ? (
            <EmptyState
              icon={Target}
              title="Nenhuma meta ativa"
              description="Crie sua primeira meta financeira e comece a economizar para seus objetivos"
              actionLabel="Criar Primeira Meta"
              onAction={() => setIsGoalModalOpen(true)}
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {activeGoals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onEdit={() => handleEdit(goal)}
                  onDelete={() => handleDelete(goal.id)}
                  onDeposit={() => handleDeposit(goal)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Completed Goals */}
        {completedGoals.length > 0 && (
          <div className="space-y-4 animate-slide-in-up" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 bg-gradient-to-b from-green-500 to-green-600 rounded-full" />
              <h2 className="text-h3 text-gray-900">
                Metas Concluídas ({completedGoals.length})
              </h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {completedGoals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onEdit={() => handleEdit(goal)}
                  onDelete={() => handleDelete(goal.id)}
                  onDeposit={() => handleDeposit(goal)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Modals */}
        <GoalModal
          open={isGoalModalOpen}
          onClose={handleGoalModalClose}
          onSave={handleSave}
          goal={editingGoal}
        />

        <DepositModal
          open={isDepositModalOpen}
          onClose={handleDepositModalClose}
          onSave={handleSave}
          goal={depositingGoal}
        />
      </div>
    </>
  )
}
