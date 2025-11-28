'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CategoryCard } from '@/components/categories/CategoryCard'
import { CategoryModal } from '@/components/categories/CategoryModal'
import { Plus, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

interface Category {
  id: string
  name: string
  icon?: string
  color?: string
  type: 'income' | 'expense'
  is_default: boolean
  subcategories?: Array<{ id: string; name: string }>
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<any>(null)
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all')

  // Load categories
  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (!response.ok) throw new Error('Erro ao carregar categorias')

      const data = await response.json()
      setCategories(data.categories || [])
    } catch (error) {
      console.error('[Categories] Erro ao carregar categorias:', error)
      toast.error('Erro ao carregar categorias')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle edit category
  const handleEdit = (category: Category) => {
    // Converter subcategories de objeto para array de strings
    const editData = {
      ...category,
      subcategories: category.subcategories?.map((sub) => sub.name) || [],
    }
    setEditingCategory(editData as any)
    setIsModalOpen(true)
  }

  // Handle delete category
  const handleDelete = async (categoryId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta categoria?')) return

    const toastId = toast.loading('Excluindo categoria...')

    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao excluir categoria')
      }

      toast.success('Categoria excluída com sucesso!', { id: toastId })
      await loadCategories()
    } catch (error) {
      console.error('[Categories] Erro ao deletar categoria:', error)
      toast.error(
        error instanceof Error ? error.message : 'Erro ao excluir categoria',
        { id: toastId }
      )
    }
  }

  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false)
    setEditingCategory(null)
  }

  // Handle save
  const handleSave = async () => {
    await loadCategories()
  }

  // Filter categories
  const filteredCategories = categories.filter((cat) => {
    if (typeFilter === 'all') return true
    return cat.type === typeFilter
  })

  // Separate by type for display
  const expenseCategories = filteredCategories.filter((c) => c.type === 'expense')
  const incomeCategories = filteredCategories.filter((c) => c.type === 'income')
  const customCategories = filteredCategories.filter((c) => !c.is_default)
  const defaultCategories = filteredCategories.filter((c) => c.is_default)

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="relative">
        {/* Decorative gradient blobs */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl -z-10 animate-pulse-subtle" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl -z-10" />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-h1 text-gray-900">Categorias</h1>
            <p className="text-muted-foreground mt-2 text-body-lg">
              Gerencie as categorias de suas transações
            </p>
          </div>
          <Button
            size="lg"
            onClick={() => setIsModalOpen(true)}
            className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 hover:-translate-y-0.5 transition-all duration-200"
          >
            <Plus className="h-5 w-5 mr-2" />
            Nova Categoria
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="animate-slide-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-blue-500 to-blue-600" />
            <div className="p-6">
              <p className="text-sm font-medium text-gray-500 mb-1">Total</p>
              <p className="text-3xl font-bold text-blue-600">{categories.length}</p>
              <p className="text-xs text-gray-400 mt-1">Categorias</p>
            </div>
          </div>
        </div>

        <div className="animate-slide-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="bg-white rounded-2xl border border-red-100 shadow-lg shadow-red-500/5 hover:shadow-xl hover:shadow-red-500/10 hover:-translate-y-1 transition-all duration-300 overflow-hidden">
            <div className="h-1 gradient-danger" />
            <div className="p-6">
              <p className="text-sm font-medium text-gray-500 mb-1">Despesas</p>
              <p className="text-3xl font-bold text-red-600">
                {expenseCategories.length}
              </p>
              <p className="text-xs text-gray-400 mt-1">Categorias</p>
            </div>
          </div>
        </div>

        <div className="animate-slide-in-up" style={{ animationDelay: '0.3s' }}>
          <div className="bg-white rounded-2xl border border-green-100 shadow-lg shadow-green-500/5 hover:shadow-xl hover:shadow-green-500/10 hover:-translate-y-1 transition-all duration-300 overflow-hidden">
            <div className="h-1 gradient-success" />
            <div className="p-6">
              <p className="text-sm font-medium text-gray-500 mb-1">Receitas</p>
              <p className="text-3xl font-bold text-green-600">
                {incomeCategories.length}
              </p>
              <p className="text-xs text-gray-400 mt-1">Categorias</p>
            </div>
          </div>
        </div>

        <div className="animate-slide-in-up" style={{ animationDelay: '0.4s' }}>
          <div className="bg-white rounded-2xl border border-purple-100 shadow-lg shadow-purple-500/5 hover:shadow-xl hover:shadow-purple-500/10 hover:-translate-y-1 transition-all duration-300 overflow-hidden">
            <div className="h-1 gradient-accent" />
            <div className="p-6">
              <p className="text-sm font-medium text-gray-500 mb-1">
                Personalizadas
              </p>
              <p className="text-3xl font-bold text-purple-600">
                {customCategories.length}
              </p>
              <p className="text-xs text-gray-400 mt-1">Suas categorias</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 animate-slide-in-up" style={{ animationDelay: '0.5s' }}>
        <Button
          variant={typeFilter === 'all' ? 'default' : 'outline'}
          onClick={() => setTypeFilter('all')}
          className={typeFilter === 'all' ? 'bg-gradient-to-r from-primary-600 to-primary-700 shadow-lg shadow-primary-500/30' : ''}
        >
          Todas
        </Button>
        <Button
          variant={typeFilter === 'expense' ? 'default' : 'outline'}
          onClick={() => setTypeFilter('expense')}
          className={typeFilter === 'expense' ? 'bg-gradient-to-r from-red-500 to-red-600 shadow-lg shadow-red-500/30' : ''}
        >
          Despesas
        </Button>
        <Button
          variant={typeFilter === 'income' ? 'default' : 'outline'}
          onClick={() => setTypeFilter('income')}
          className={typeFilter === 'income' ? 'bg-gradient-to-r from-green-500 to-green-600 shadow-lg shadow-green-500/30' : ''}
        >
          Receitas
        </Button>
      </div>

      {/* Categories List */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-12 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
              <p className="text-sm text-muted-foreground animate-pulse-subtle">Carregando categorias...</p>
            </div>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="relative overflow-hidden bg-white rounded-2xl border border-gray-100 shadow-xl p-12 text-center">
            <div className="absolute inset-0 mesh-gradient-soft -z-10" />
            <div className="relative">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl mb-6 shadow-lg shadow-purple-500/30">
                <AlertCircle className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-h3 text-gray-900 mb-2">
                Nenhuma categoria encontrada
              </h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto text-body-lg">
                Crie sua primeira categoria para organizar suas transações de forma eficiente
              </p>
              <Button
                onClick={() => setIsModalOpen(true)}
                className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 hover:-translate-y-0.5 transition-all duration-200"
              >
                <Plus className="w-5 h-5 mr-2" />
                Criar Primeira Categoria
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Custom Categories */}
            {customCategories.length > 0 && (
              <div className="space-y-4 animate-slide-in-up" style={{ animationDelay: '0.6s' }}>
                <div className="flex items-center gap-3">
                  <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-purple-600 rounded-full" />
                  <h2 className="text-h3 text-gray-900">
                    Minhas Categorias ({customCategories.length})
                  </h2>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {customCategories.map((category) => (
                    <CategoryCard
                      key={category.id}
                      category={category}
                      onEdit={() => handleEdit(category)}
                      onDelete={() => handleDelete(category.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Default Categories */}
            {defaultCategories.length > 0 && (
              <div className="space-y-4 animate-slide-in-up" style={{ animationDelay: '0.7s' }}>
                <div className="flex items-center gap-3">
                  <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full" />
                  <h2 className="text-h3 text-gray-900">
                    Categorias Padrão ({defaultCategories.length})
                  </h2>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {defaultCategories.map((category) => (
                    <CategoryCard key={category.id} category={category} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Category Modal */}
      <CategoryModal
        open={isModalOpen}
        onClose={handleModalClose}
        onSave={handleSave}
        category={editingCategory}
      />
    </div>
  )
}
