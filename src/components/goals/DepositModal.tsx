'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatCurrency } from '@/lib/utils'
import toast from 'react-hot-toast'

interface DepositModalProps {
  open: boolean
  onClose: () => void
  onSave: () => void
  goal: {
    id: string
    name: string
    target_amount: number
    current_amount: number
    remaining_amount: number
  } | null
}

export function DepositModal({ open, onClose, onSave, goal }: DepositModalProps) {
  const [amount, setAmount] = useState<number>(0)
  const [note, setNote] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setAmount(0)
      setNote('')
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!goal) return

    setIsLoading(true)

    const toastId = toast.loading('Adicionando depósito...')

    try {
      const response = await fetch(`/api/goals/${goal.id}/deposit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          note: note || null,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao adicionar depósito')
      }

      const result = await response.json()

      // Verificar se a meta foi concluída com este depósito
      if (result.goal.status === 'completed') {
        toast.success('🎉 Parabéns! Você atingiu sua meta!', { id: toastId })
      } else {
        toast.success('Depósito adicionado com sucesso!', { id: toastId })
      }

      onSave()
      onClose()
    } catch (error) {
      console.error('Erro ao adicionar depósito:', error)
      toast.error(
        error instanceof Error ? error.message : 'Erro ao adicionar depósito',
        { id: toastId }
      )
    } finally {
      setIsLoading(false)
    }
  }

  if (!goal) return null

  // Calcular novo progresso com o valor digitado
  const newCurrent = goal.current_amount + (amount || 0)
  const newPercentage = goal.target_amount > 0 ? (newCurrent / goal.target_amount) * 100 : 0
  const newRemaining = Math.max(goal.target_amount - newCurrent, 0)
  const willComplete = newCurrent >= goal.target_amount

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Adicionar Depósito</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Goal Info */}
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <h3 className="font-semibold">{goal.name}</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Economizado</p>
                <p className="font-semibold">{formatCurrency(goal.current_amount)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Meta</p>
                <p className="font-semibold">{formatCurrency(goal.target_amount)}</p>
              </div>
            </div>
            <div className="pt-2 border-t">
              <p className="text-muted-foreground text-xs">Faltam</p>
              <p className="font-bold text-blue-600">
                {formatCurrency(goal.remaining_amount)}
              </p>
            </div>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Valor do Depósito</label>
            <Input
              required
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              value={amount || ''}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              autoFocus
            />
          </div>

          {/* Preview */}
          {amount > 0 && (
            <div className="p-4 bg-blue-50 rounded-lg space-y-2">
              <h4 className="text-sm font-semibold text-blue-900">
                Após este depósito:
              </h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700">Novo saldo:</span>
                  <span className="font-semibold text-blue-900">
                    {formatCurrency(newCurrent)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Progresso:</span>
                  <span className="font-semibold text-blue-900">
                    {newPercentage.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Faltam:</span>
                  <span className="font-semibold text-blue-900">
                    {formatCurrency(newRemaining)}
                  </span>
                </div>
              </div>
              {willComplete && (
                <div className="mt-2 pt-2 border-t border-blue-200">
                  <p className="text-sm font-bold text-green-700">
                    🎉 Você vai atingir sua meta!
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Note */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Observação <span className="text-muted-foreground">(opcional)</span>
            </label>
            <Input
              placeholder="Ex: Bônus do trabalho"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading || amount <= 0}>
              {isLoading ? 'Adicionando...' : 'Adicionar Depósito'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
