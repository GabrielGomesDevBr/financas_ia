'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2, ArrowUpCircle, ArrowDownCircle, Tag } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface CategoryCardProps {
  category: {
    id: string
    name: string
    icon?: string
    color?: string
    type: 'income' | 'expense'
    is_default: boolean
    subcategories?: Array<{ id: string; name: string }>
  }
  onEdit?: () => void
  onDelete?: () => void
}

export function CategoryCard({ category, onEdit, onDelete }: CategoryCardProps) {
  const canEdit = !category.is_default
  const hasSubcategories = (category.subcategories?.length || 0) > 0

  return (
    <Card className="group p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 border-l-4" style={{ borderLeftColor: category.color || '#3b82f6' }}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1">
            {/* Icon/Color */}
            {category.icon ? (
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-lg transition-transform duration-300 group-hover:scale-110"
                style={{
                  backgroundColor: category.color || '#3b82f6',
                  boxShadow: `0 10px 25px -5px ${category.color}40`
                }}
              >
                {category.icon}
              </div>
            ) : (
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110"
                style={{
                  backgroundColor: category.color || '#3b82f6',
                  boxShadow: `0 10px 25px -5px ${category.color}40`
                }}
              >
                <Tag className="h-6 w-6 text-white" />
              </div>
            )}

            {/* Name */}
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-gray-900">{category.name}</h3>
              <div className="flex items-center gap-2 mt-1.5">
                {category.type === 'income' ? (
                  <Badge variant="success-soft">
                    <ArrowUpCircle className="h-3 w-3" />
                    Receita
                  </Badge>
                ) : (
                  <Badge variant="danger-soft">
                    <ArrowDownCircle className="h-3 w-3" />
                    Despesa
                  </Badge>
                )}
                {category.is_default && (
                  <Badge variant="primary-soft">
                    Padrão
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          {canEdit && (
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {onEdit && (
                <Button variant="ghost" size="icon" onClick={onEdit} className="hover:bg-blue-50 hover:text-blue-600">
                  <Pencil className="h-4 w-4" />
                </Button>
              )}
              {onDelete && (
                <Button variant="ghost" size="icon" onClick={onDelete} className="hover:bg-red-50 hover:text-red-600">
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Subcategories */}
        {hasSubcategories && (
          <div className="pt-4 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-500 mb-2.5">Subcategorias:</p>
            <div className="flex flex-wrap gap-2">
              {category.subcategories?.map((sub) => (
                <Badge key={sub.id} variant="outline">
                  {sub.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Info */}
        <div className="flex items-center justify-between pt-2 border-t text-xs text-muted-foreground">
          <span>
            {hasSubcategories
              ? `${category.subcategories?.length} subcategorias`
              : 'Sem subcategorias'}
          </span>
          {!canEdit && <span>Categoria do sistema</span>}
        </div>
      </div>
    </Card>
  )
}
