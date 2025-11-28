'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

interface Category {
  id: string
  name: string
  type: 'income' | 'expense'
}

interface Budget {
  id?: string
  category_id: string
  limit_amount: number
  period: 'monthly' | 'weekly' | 'yearly'
  start_date: string
  end_date: string
  alert_threshold: number
}

interface BudgetModalProps {
  open: boolean
  onClose: () => void
  onSave: () => void
  budget?: Budget | null
  familyId: string
}

export function BudgetModal({ open, onClose, onSave, budget, familyId }: BudgetModalProps) {
  const [formData, setFormData] = useState<Budget>({
    category_id: '',
    limit_amount: 0,
    period: 'monthly',
    start_date: '',
    end_date: '',
    alert_threshold: 80,
  })
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      const { data } = await supabase
        .from('categories')
        .select('id, name, type')
        .or(`is_default.eq.true,family_id.eq.${familyId}`)
        .eq('type', 'expense') // Orçamentos apenas para despesas
        .order('name')

      if (data) {
        setCategories(data as Category[])
      }
    }

    if (open) {
      loadCategories()
    }
  }, [open, familyId, supabase])

  // Load budget data if editing
  useEffect(() => {
    if (budget) {
      setFormData({
        id: budget.id,
        category_id: budget.category_id,
        limit_amount: budget.limit_amount,
        period: budget.period,
        start_date: budget.start_date,
        end_date: budget.end_date,
        alert_threshold: budget.alert_threshold,
      })
    } else {
      // Auto-calculate dates based on period for new budgets
      const today = new Date()
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0)

      setFormData({
        category_id: '',
        limit_amount: 0,
        period: 'monthly',
        start_date: firstDay.toISOString().split('T')[0],
        end_date: lastDay.toISOString().split('T')[0],
        alert_threshold: 80,
      })
    }
  }, [budget])

  // Auto-update dates when period changes
  const handlePeriodChange = (period: 'monthly' | 'weekly' | 'yearly') => {
    const today = new Date()
    let start_date = ''
    let end_date = ''

    if (period === 'monthly') {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0)
      start_date = firstDay.toISOString().split('T')[0]
      end_date = lastDay.toISOString().split('T')[0]
    } else if (period === 'weekly') {
      const dayOfWeek = today.getDay()
      const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)
      const monday = new Date(today.setDate(diff))
      const sunday = new Date(monday)
      sunday.setDate(monday.getDate() + 6)
      start_date = monday.toISOString().split('T')[0]
      end_date = sunday.toISOString().split('T')[0]
    } else if (period === 'yearly') {
      const firstDay = new Date(today.getFullYear(), 0, 1)
      const lastDay = new Date(today.getFullYear(), 11, 31)
      start_date = firstDay.toISOString().split('T')[0]
      end_date = lastDay.toISOString().split('T')[0]
    }

    setFormData({ ...formData, period, start_date, end_date })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const toastId = toast.loading(formData.id ? 'Salvando alterações...' : 'Criando orçamento...')

    try {
      const payload = {
        category_id: formData.category_id,
        limit_amount: formData.limit_amount,
        period: formData.period,
        start_date: formData.start_date,
        end_date: formData.end_date,
        alert_threshold: formData.alert_threshold,
      }

      if (formData.id) {
        // Update existing budget via API
        const response = await fetch(`/api/budgets/${formData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Erro ao atualizar orçamento')
        }

        toast.success('Orçamento atualizado com sucesso!', { id: toastId })
      } else {
        // Create new budget via API
        const response = await fetch('/api/budgets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Erro ao criar orçamento')
        }

        toast.success('Orçamento criado com sucesso!', { id: toastId })
      }

      onSave()
      onClose()
    } catch (error) {
      console.error('Erro ao salvar orçamento:', error)
      toast.error(
        error instanceof Error ? error.message : 'Erro ao salvar orçamento',
        { id: toastId }
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {budget ? 'Editar Orçamento' : 'Novo Orçamento'}
          </DialogTitle>
          <DialogDescription>
            {budget
              ? 'Atualize as informações do orçamento selecionado.'
              : 'Defina um limite de gastos para uma categoria específica.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Categoria</label>
            <select
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={formData.category_id}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
            >
              <option value="">Selecione uma categoria</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Limit Amount */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Valor Limite</label>
            <Input
              required
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={formData.limit_amount || ''}
              onChange={(e) => setFormData({ ...formData, limit_amount: parseFloat(e.target.value) || 0 })}
            />
          </div>

          {/* Period */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Período</label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                type="button"
                variant={formData.period === 'weekly' ? 'default' : 'outline'}
                onClick={() => handlePeriodChange('weekly')}
              >
                Semanal
              </Button>
              <Button
                type="button"
                variant={formData.period === 'monthly' ? 'default' : 'outline'}
                onClick={() => handlePeriodChange('monthly')}
              >
                Mensal
              </Button>
              <Button
                type="button"
                variant={formData.period === 'yearly' ? 'default' : 'outline'}
                onClick={() => handlePeriodChange('yearly')}
              >
                Anual
              </Button>
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Data Início</label>
              <Input
                required
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Data Fim</label>
              <Input
                required
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              />
            </div>
          </div>

          {/* Alert Threshold */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Alerta em {formData.alert_threshold}% do limite
            </label>
            <Input
              type="range"
              min="50"
              max="100"
              step="5"
              value={formData.alert_threshold}
              onChange={(e) => setFormData({ ...formData, alert_threshold: parseInt(e.target.value) })}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Você será alertado ao atingir este percentual do orçamento
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
