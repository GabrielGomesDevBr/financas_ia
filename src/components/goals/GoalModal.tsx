'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import toast from 'react-hot-toast'

interface Goal {
  id?: string
  name: string
  description?: string
  target_amount: number
  current_amount?: number
  deadline?: string
  status?: 'active' | 'completed' | 'cancelled'
}

interface GoalModalProps {
  open: boolean
  onClose: () => void
  onSave: () => void
  goal?: Goal | null
}

export function GoalModal({ open, onClose, onSave, goal }: GoalModalProps) {
  const [formData, setFormData] = useState<Goal>({
    name: '',
    description: '',
    target_amount: 0,
    current_amount: 0,
    deadline: '',
  })
  const [isLoading, setIsLoading] = useState(false)

  // Load goal data if editing
  useEffect(() => {
    if (goal) {
      setFormData({
        id: goal.id,
        name: goal.name,
        description: goal.description || '',
        target_amount: goal.target_amount,
        current_amount: goal.current_amount || 0,
        deadline: goal.deadline || '',
        status: goal.status || 'active',
      })
    } else {
      setFormData({
        name: '',
        description: '',
        target_amount: 0,
        current_amount: 0,
        deadline: '',
      })
    }
  }, [goal])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const toastId = toast.loading(
      formData.id ? 'Salvando alterações...' : 'Criando meta...'
    )

    try {
      const payload: any = {
        name: formData.name,
        description: formData.description || null,
        target_amount: formData.target_amount,
        deadline: formData.deadline || null,
      }

      // Se for criação, incluir current_amount
      if (!formData.id) {
        payload.current_amount = formData.current_amount || 0
      }

      // Se for edição e tiver status
      if (formData.id && formData.status) {
        payload.status = formData.status
      }

      if (formData.id) {
        // Update existing goal via API
        const response = await fetch(`/api/goals/${formData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Erro ao atualizar meta')
        }

        toast.success('Meta atualizada com sucesso!', { id: toastId })
      } else {
        // Create new goal via API
        const response = await fetch('/api/goals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Erro ao criar meta')
        }

        toast.success('Meta criada com sucesso!', { id: toastId })
      }

      onSave()
      onClose()
    } catch (error) {
      console.error('Erro ao salvar meta:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao salvar meta', {
        id: toastId,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{goal ? 'Editar Meta' : 'Nova Meta'}</DialogTitle>
          <DialogDescription>
            {goal
              ? 'Atualize as informações da meta selecionada.'
              : 'Crie uma nova meta financeira e acompanhe seu progresso.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Nome da Meta</label>
            <Input
              required
              placeholder="Ex: Viagem para Paris"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Descrição <span className="text-muted-foreground">(opcional)</span>
            </label>
            <textarea
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Descreva sua meta..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          {/* Target Amount */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Valor da Meta</label>
            <Input
              required
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={formData.target_amount || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  target_amount: parseFloat(e.target.value) || 0,
                })
              }
            />
          </div>

          {/* Current Amount - apenas na criação */}
          {!formData.id && (
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Valor Inicial{' '}
                <span className="text-muted-foreground">(opcional)</span>
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.current_amount || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    current_amount: parseFloat(e.target.value) || 0,
                  })
                }
              />
              <p className="text-xs text-muted-foreground">
                Se já tiver economizado algum valor para esta meta
              </p>
            </div>
          )}

          {/* Deadline */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Prazo <span className="text-muted-foreground">(opcional)</span>
            </label>
            <Input
              type="date"
              value={formData.deadline}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) =>
                setFormData({ ...formData, deadline: e.target.value })
              }
            />
          </div>

          {/* Status - apenas na edição */}
          {formData.id && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as 'active' | 'completed' | 'cancelled',
                  })
                }
              >
                <option value="active">Ativa</option>
                <option value="completed">Concluída</option>
                <option value="cancelled">Cancelada</option>
              </select>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
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
