'use client'

import { Card } from '@/components/ui/card'
import { TrendingDown } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface Transaction {
  type: 'income' | 'expense'
  amount: number
  category: { name: string } | null
}

interface ExpenseChartProps {
  transactions: Transaction[]
}

// Cores profissionais para categorias
const COLORS = [
  '#ef4444', // Red
  '#f97316', // Orange
  '#f59e0b', // Amber
  '#eab308', // Yellow
  '#84cc16', // Lime
  '#22c55e', // Green
  '#10b981', // Emerald
  '#14b8a6', // Teal
  '#06b6d4', // Cyan
  '#0ea5e9', // Sky
  '#3b82f6', // Blue
  '#6366f1', // Indigo
  '#8b5cf6', // Violet
  '#a855f7', // Purple
  '#d946ef', // Fuchsia
  '#ec4899', // Pink
]

export function ExpenseChart({ transactions }: ExpenseChartProps) {
  // Filter only expenses
  const expenses = transactions.filter(t => t.type === 'expense')

  // Group by category
  const categoryTotals = expenses.reduce((acc, transaction) => {
    const categoryName = transaction.category?.name || 'Sem categoria'
    if (!acc[categoryName]) {
      acc[categoryName] = 0
    }
    acc[categoryName] += Number(transaction.amount)
    return acc
  }, {} as Record<string, number>)

  // Convert to array and sort by value (descending)
  const chartData = Object.entries(categoryTotals)
    .map(([name, value]) => ({
      name,
      value: Number(value.toFixed(2))
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10) // Top 10 categories

  const total = chartData.reduce((sum, d) => sum + d.value, 0)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(value)
  }

  if (chartData.length === 0) {
    return (
      <Card className="overflow-hidden border-gray-200 bg-white p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="rounded-xl bg-gradient-to-br from-red-500 to-red-600 p-3 shadow-lg shadow-red-500/20">
            <TrendingDown className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Despesas por Categoria</h3>
            <p className="text-sm text-gray-500">Análise detalhada dos seus gastos</p>
          </div>
        </div>
        <div className="flex h-64 items-center justify-center rounded-xl border-2 border-dashed border-gray-200">
          <div className="text-center">
            <TrendingDown className="mx-auto mb-3 h-12 w-12 text-gray-300" />
            <p className="text-sm font-medium text-gray-500">Nenhuma despesa para exibir</p>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <Card className="overflow-hidden border-gray-200 bg-gradient-to-br from-white via-white to-red-50/30 shadow-xl">
        {/* Header */}
        <div className="relative overflow-hidden border-b border-gray-100">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-orange-500/5 to-amber-500/5" />
          <div className="relative p-4 md:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-gradient-to-br from-red-500 to-red-600 p-2.5 md:p-3 shadow-lg shadow-red-500/20">
                  <TrendingDown className="h-4 w-4 md:h-5 md:w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base md:text-lg font-bold text-gray-900">Despesas por Categoria</h3>
                  <p className="text-xs md:text-sm text-gray-500">Análise detalhada dos seus gastos</p>
                </div>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-xs md:text-sm text-gray-500">Total gasto</p>
                <p className="text-xl md:text-2xl font-bold text-red-600">{formatCurrency(total)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Horizontal Bars */}
        <div className="p-4 md:p-6">
          <div className="space-y-3">
            {chartData.map((item, index) => {
              const percentage = (item.value / total) * 100
              const isTopExpense = index === 0
              const color = COLORS[index % COLORS.length]

              return (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className={cn(
                    'group relative overflow-hidden rounded-xl p-3 md:p-4 transition-all duration-200',
                    isTopExpense
                      ? 'bg-gradient-to-r from-red-50 to-red-50/50 ring-2 ring-red-200 shadow-md'
                      : 'bg-gray-50/50 hover:bg-gray-100/80 hover:shadow-md'
                  )}
                >
                  {/* Top expense badge - moved to top-left */}
                  {isTopExpense && (
                    <div className="absolute left-3 md:left-4 top-2">
                      <span className="inline-flex items-center rounded-full bg-red-500 px-2 md:px-2.5 py-0.5 text-xs font-bold text-white shadow-sm">
                        Maior
                      </span>
                    </div>
                  )}

                  {/* Category name and amount */}
                  <div className={cn("mb-2 flex items-center justify-between gap-2", isTopExpense && "mt-5 md:mt-6")}>
                    <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                      <div
                        className="h-3 w-3 flex-shrink-0 rounded-full shadow-sm"
                        style={{ backgroundColor: color }}
                      />
                      <span
                        className={cn(
                          'truncate text-sm md:text-base font-semibold',
                          isTopExpense ? 'text-red-900' : 'text-gray-900'
                        )}
                        title={item.name}
                      >
                        {item.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
                      <span
                        className={cn(
                          'text-sm md:text-base font-bold',
                          isTopExpense ? 'text-red-700' : 'text-gray-900'
                        )}
                      >
                        {formatCurrency(item.value)}
                      </span>
                      <span
                        className={cn(
                          'text-xs font-semibold',
                          isTopExpense ? 'text-red-600' : 'text-gray-600'
                        )}
                      >
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="relative h-2 md:h-2.5 w-full overflow-hidden rounded-full bg-gray-200">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 1, delay: index * 0.05 + 0.2, ease: 'easeOut' }}
                      className="absolute inset-y-0 left-0 rounded-full shadow-sm"
                      style={{
                        background: `linear-gradient(90deg, ${color}, ${color}dd)`,
                      }}
                    />
                  </div>

                  {/* Budget info (placeholder for future) */}
                  <div className="mt-1.5 md:mt-2 flex items-center justify-between text-xs text-gray-500">
                    <span>{percentage.toFixed(0)}% do total de despesas</span>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
