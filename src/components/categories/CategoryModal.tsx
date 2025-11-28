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
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'
import toast from 'react-hot-toast'

interface Category {
  id?: string
  name: string
  icon?: string
  color?: string
  type: 'income' | 'expense'
  subcategories?: string[]
}

interface CategoryModalProps {
  open: boolean
  onClose: () => void
  onSave: () => void
  category?: Category | null
}

const PRESET_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#f59e0b', // amber
  '#eab308', // yellow
  '#84cc16', // lime
  '#22c55e', // green
  '#10b981', // emerald
  '#14b8a6', // teal
  '#06b6d4', // cyan
  '#0ea5e9', // sky
  '#3b82f6', // blue
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#a855f7', // purple
  '#d946ef', // fuchsia
  '#ec4899', // pink
]

const PRESET_ICONS = ['🍔', '🏠', '🚗', '💼', '🎓', '🏥', '🎮', '✈️', '🛒', '💰', '📱', '⚡']

export function CategoryModal({ open, onClose, onSave, category }: CategoryModalProps) {
  const [formData, setFormData] = useState<Category>({
    name: '',
    icon: '',
    color: '#3b82f6',
    type: 'expense',
    subcategories: [],
  })
  const [newSubcategory, setNewSubcategory] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Load category data if editing
  useEffect(() => {
    if (category) {
      setFormData({
        id: category.id,
        name: category.name,
        icon: category.icon || '',
        color: category.color || '#3b82f6',
        type: category.type,
        subcategories: category.subcategories || [],
      })
    } else {
      setFormData({
        name: '',
        icon: '',
        color: '#3b82f6',
        type: 'expense',
        subcategories: [],
      })
    }
    setNewSubcategory('')
  }, [category, open])

  const handleAddSubcategory = () => {
    if (!newSubcategory.trim()) return

    setFormData({
      ...formData,
      subcategories: [...(formData.subcategories || []), newSubcategory.trim()],
    })
    setNewSubcategory('')
  }

  const handleRemoveSubcategory = (index: number) => {
    setFormData({
      ...formData,
      subcategories: formData.subcategories?.filter((_, i) => i !== index),
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const toastId = toast.loading(
      formData.id ? 'Salvando alterações...' : 'Criando categoria...'
    )

    try {
      const payload = {
        name: formData.name,
        icon: formData.icon || null,
        color: formData.color,
        type: formData.type,
        subcategories: formData.subcategories || [],
      }

      if (formData.id) {
        // Update existing category via API
        const response = await fetch(`/api/categories/${formData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Erro ao atualizar categoria')
        }

        toast.success('Categoria atualizada com sucesso!', { id: toastId })
      } else {
        // Create new category via API
        const response = await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Erro ao criar categoria')
        }

        toast.success('Categoria criada com sucesso!', { id: toastId })
      }

      onSave()
      onClose()
    } catch (error) {
      console.error('Erro ao salvar categoria:', error)
      toast.error(
        error instanceof Error ? error.message : 'Erro ao salvar categoria',
        { id: toastId }
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {category ? 'Editar Categoria' : 'Nova Categoria'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Nome da Categoria</label>
            <Input
              required
              placeholder="Ex: Alimentação"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          {/* Type */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Tipo</label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={formData.type === 'expense' ? 'default' : 'outline'}
                onClick={() => setFormData({ ...formData, type: 'expense' })}
              >
                Despesa
              </Button>
              <Button
                type="button"
                variant={formData.type === 'income' ? 'default' : 'outline'}
                onClick={() => setFormData({ ...formData, type: 'income' })}
              >
                Receita
              </Button>
            </div>
          </div>

          {/* Icon */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Ícone <span className="text-muted-foreground">(opcional)</span>
            </label>
            <div className="grid grid-cols-6 gap-2">
              {PRESET_ICONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  className={`p-3 text-2xl border rounded-lg hover:bg-muted transition-colors ${
                    formData.icon === icon ? 'border-primary bg-muted' : ''
                  }`}
                  onClick={() => setFormData({ ...formData, icon })}
                >
                  {icon}
                </button>
              ))}
            </div>
            <Input
              placeholder="Ou digite um emoji"
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              maxLength={2}
            />
          </div>

          {/* Color */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Cor</label>
            <div className="grid grid-cols-8 gap-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`w-10 h-10 rounded-lg border-2 transition-transform hover:scale-110 ${
                    formData.color === color ? 'border-foreground scale-110' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setFormData({ ...formData, color })}
                />
              ))}
            </div>
            <Input
              type="color"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
            />
          </div>

          {/* Subcategories */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Subcategorias <span className="text-muted-foreground">(opcional)</span>
            </label>

            {/* List of subcategories */}
            {formData.subcategories && formData.subcategories.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.subcategories.map((sub, index) => (
                  <Badge key={index} variant="primary-soft" className="gap-1">
                    {sub}
                    <button
                      type="button"
                      onClick={() => handleRemoveSubcategory(index)}
                      className="ml-1 hover:text-red-600 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            {/* Add subcategory */}
            <div className="flex gap-2">
              <Input
                placeholder="Nome da subcategoria"
                value={newSubcategory}
                onChange={(e) => setNewSubcategory(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddSubcategory()
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddSubcategory}
                disabled={!newSubcategory.trim()}
              >
                Adicionar
              </Button>
            </div>
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
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
