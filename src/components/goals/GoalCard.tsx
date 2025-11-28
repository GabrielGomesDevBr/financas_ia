'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Pencil,
  Trash2,
  Target,
  Calendar,
  TrendingUp,
  Plus,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface GoalCardProps {
  goal: {
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
  }
  onEdit: () => void
  onDelete: () => void
  onDeposit: () => void
}

export function GoalCard({ goal, onEdit, onDelete, onDeposit }: GoalCardProps) {
  const getStatusColor = () => {
    if (goal.status === 'completed') return 'bg-green-500'
    if (goal.status === 'cancelled') return 'bg-gray-500'

    // Para metas ativas, baseado no progresso
    if (goal.percentage >= 75) return 'bg-green-500'
    if (goal.percentage >= 50) return 'bg-blue-500'
    if (goal.percentage >= 25) return 'bg-yellow-500'
    return 'bg-orange-500'
  }

  const getStatusBadge = () => {
    switch (goal.status) {
      case 'completed':
        return (
          <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
            <CheckCircle className="h-3 w-3" />
            Concluída
          </div>
        )
      case 'cancelled':
        return (
          <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">
            <XCircle className="h-3 w-3" />
            Cancelada
          </div>
        )
      default:
        return (
          <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
            <Target className="h-3 w-3" />
            Em progresso
          </div>
        )
    }
  }

  const getDaysRemainingText = () => {
    if (!goal.days_remaining) return null

    if (goal.days_remaining < 0) {
      return (
        <div className="flex items-center gap-1 text-xs text-red-600">
          <Calendar className="h-3 w-3" />
          Prazo vencido há {Math.abs(goal.days_remaining)} dias
        </div>
      )
    }

    if (goal.days_remaining === 0) {
      return (
        <div className="flex items-center gap-1 text-xs text-orange-600">
          <Calendar className="h-3 w-3" />
          Vence hoje
        </div>
      )
    }

    if (goal.days_remaining <= 7) {
      return (
        <div className="flex items-center gap-1 text-xs text-orange-600">
          <Calendar className="h-3 w-3" />
          {goal.days_remaining} dias restantes
        </div>
      )
    }

    return (
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <Calendar className="h-3 w-3" />
        {goal.days_remaining} dias restantes
      </div>
    )
  }

  return (
    <Card className="p-6 hover:shadow-md transition-shadow">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{goal.name}</h3>
            {goal.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {goal.description}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            {goal.status === 'active' && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onDeposit}
                title="Adicionar depósito"
              >
                <Plus className="h-4 w-4 text-green-600" />
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={onEdit}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onDelete}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2">{getStatusBadge()}</div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progresso</span>
            <span className="font-medium">{goal.percentage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full ${getStatusColor()} transition-all duration-300`}
              style={{ width: `${Math.min(goal.percentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Amounts */}
        <div className="grid grid-cols-2 gap-4 pt-2 border-t">
          <div>
            <p className="text-xs text-muted-foreground">Economizado</p>
            <p className="font-semibold text-sm">
              {formatCurrency(goal.current_amount)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Meta</p>
            <p className="font-semibold text-sm">
              {formatCurrency(goal.target_amount)}
            </p>
          </div>
        </div>

        {/* Remaining */}
        {goal.status === 'active' && (
          <div className="p-3 rounded-lg bg-blue-50">
            <p className="text-xs text-muted-foreground">Faltam</p>
            <p className="font-bold text-blue-600">
              {formatCurrency(goal.remaining_amount)}
            </p>
          </div>
        )}

        {/* Footer Info */}
        <div className="flex justify-between items-center pt-2 border-t text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            {goal.total_deposits} depósitos
          </div>
          {goal.deadline && getDaysRemainingText()}
        </div>
      </div>
    </Card>
  )
}
