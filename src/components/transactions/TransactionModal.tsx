'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

interface Category {
  id: string
  name: string
  type: 'income' | 'expense'
  subcategories?: Subcategory[]
}

interface Subcategory {
  id: string
  name: string
}

interface Transaction {
  id?: string
  type: 'income' | 'expense'
  amount: number
  description: string
  date: string
  category_id?: string
  subcategory_id?: string
}

interface TransactionModalProps {
  open: boolean
  onClose: () => void
  onSave: () => void
  transaction?: Transaction | null
  familyId: string
}

export function TransactionModal({ open, onClose, onSave, transaction, familyId }: TransactionModalProps) {
  const [formData, setFormData] = useState<Transaction>({
    type: 'expense',
    amount: 0,
    description: '',
    date: new Date().toISOString().split('T')[0],
  })
  const [categories, setCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      const { data } = await supabase
        .from('categories')
        .select('id, name, type, subcategories(id, name)')
        .or(`is_default.eq.true,family_id.eq.${familyId}`)
        .order('name')

      if (data) {
        setCategories(data as Category[])
      }
    }

    if (open) {
      loadCategories()
    }
  }, [open, familyId, supabase])

  // Load transaction data if editing
  useEffect(() => {
    if (transaction) {
      setFormData({
        id: transaction.id,
        type: transaction.type,
        amount: transaction.amount,
        description: transaction.description,
        date: transaction.date,
        category_id: transaction.category_id,
        subcategory_id: transaction.subcategory_id,
      })
    } else {
      setFormData({
        type: 'expense',
        amount: 0,
        description: '',
        date: new Date().toISOString().split('T')[0],
      })
    }
  }, [transaction])

  // Update subcategories when category changes
  useEffect(() => {
    if (formData.category_id) {
      const category = categories.find(c => c.id === formData.category_id)
      setSubcategories(category?.subcategories || [])
    } else {
      setSubcategories([])
    }
  }, [formData.category_id, categories])

  // Filter categories by type
  const filteredCategories = categories.filter(c => c.type === formData.type)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const toastId = toast.loading(formData.id ? 'Salvando alterações...' : 'Criando transação...')

    try {
      const payload = {
        type: formData.type,
        amount: formData.amount,
        description: formData.description,
        date: formData.date,
        category_id: formData.category_id || null,
        subcategory_id: formData.subcategory_id || null,
      }

      if (formData.id) {
        // Update existing transaction via API
        const response = await fetch(`/api/transactions/${formData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Erro ao atualizar transação')
        }

        toast.success('Transação atualizada com sucesso!', { id: toastId })
      } else {
        // Create new transaction via API
        const response = await fetch('/api/transactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Erro ao criar transação')
        }

        toast.success('Transação criada com sucesso!', { id: toastId })
      }

      onSave()
      onClose()
    } catch (error) {
      console.error('Erro ao salvar transação:', error)
      toast.error(
        error instanceof Error ? error.message : 'Erro ao salvar transação',
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
            {transaction ? 'Editar Transação' : 'Nova Transação'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Tipo</label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={formData.type === 'expense' ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => {
                  setFormData({ ...formData, type: 'expense', category_id: undefined, subcategory_id: undefined })
                }}
              >
                Despesa
              </Button>
              <Button
                type="button"
                variant={formData.type === 'income' ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => {
                  setFormData({ ...formData, type: 'income', category_id: undefined, subcategory_id: undefined })
                }}
              >
                Receita
              </Button>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Descrição</label>
            <Input
              required
              placeholder="Ex: Compra no supermercado"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Valor</label>
            <Input
              required
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={formData.amount || ''}
              onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
            />
          </div>

          {/* Date */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Data</label>
            <Input
              required
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Categoria</label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={formData.category_id || ''}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value || undefined, subcategory_id: undefined })}
            >
              <option value="">Selecione uma categoria</option>
              {filteredCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Subcategory */}
          {subcategories.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Subcategoria</label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.subcategory_id || ''}
                onChange={(e) => setFormData({ ...formData, subcategory_id: e.target.value || undefined })}
              >
                <option value="">Selecione uma subcategoria</option>
                {subcategories.map((subcategory) => (
                  <option key={subcategory.id} value={subcategory.id}>
                    {subcategory.name}
                  </option>
                ))}
              </select>
            </div>
          )}

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
