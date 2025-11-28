'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2, AlertCircle, CheckCircle, TrendingUp } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface BudgetCardProps {
  budget: {
    budget_id: string
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
  onEdit: () => void
  onDelete: () => void
}

export function BudgetCard({ budget, onEdit, onDelete }: BudgetCardProps) {
  const getStatusColor = () => {
    switch (budget.status) {
      case 'ok':
        return 'bg-green-500'
      case 'warning':
        return 'bg-yellow-500'
      case 'exceeded':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getStatusIcon = () => {
    switch (budget.status) {
      case 'ok':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />
      case 'exceeded':
        return <TrendingUp className="h-5 w-5 text-red-600" />
      default:
        return null
    }
  }

  const getStatusText = () => {
    switch (budget.status) {
      case 'ok':
        return 'Dentro do orçamento'
      case 'warning':
        return 'Atenção: Próximo do limite'
      case 'exceeded':
        return 'Orçamento excedido'
      default:
        return ''
    }
  }

  const getPeriodText = () => {
    switch (budget.period) {
      case 'monthly':
        return 'Mensal'
      case 'weekly':
        return 'Semanal'
      case 'yearly':
        return 'Anual'
      default:
        return budget.period
    }
  }

  return (
    <Card className="p-6 hover:shadow-md transition-shadow">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{budget.category_name}</h3>
            <p className="text-sm text-muted-foreground">{getPeriodText()}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={onEdit}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onDelete}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className="text-sm font-medium">{getStatusText()}</span>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progresso</span>
            <span className="font-medium">{budget.percentage_used.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full ${getStatusColor()} transition-all duration-300`}
              style={{ width: `${Math.min(budget.percentage_used, 100)}%` }}
            />
          </div>
        </div>

        {/* Amounts */}
        <div className="grid grid-cols-2 gap-4 pt-2 border-t">
          <div>
            <p className="text-xs text-muted-foreground">Gasto</p>
            <p className="font-semibold text-sm">{formatCurrency(budget.spent_amount)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Limite</p>
            <p className="font-semibold text-sm">{formatCurrency(budget.limit_amount)}</p>
          </div>
        </div>

        {/* Remaining */}
        <div className={`p-3 rounded-lg ${budget.remaining_amount < 0 ? 'bg-red-50' : 'bg-green-50'}`}>
          <p className="text-xs text-muted-foreground">Restante</p>
          <p className={`font-bold ${budget.remaining_amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
            {formatCurrency(Math.abs(budget.remaining_amount))}
            {budget.remaining_amount < 0 && ' acima do limite'}
          </p>
        </div>

        {/* Period */}
        <div className="flex justify-between text-xs text-muted-foreground pt-2 border-t">
          <span>{new Date(budget.start_date).toLocaleDateString('pt-BR')}</span>
          <span>até</span>
          <span>{new Date(budget.end_date).toLocaleDateString('pt-BR')}</span>
        </div>
      </div>
    </Card>
  )
}
