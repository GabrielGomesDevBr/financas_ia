'use client'

import { Card } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { TrendingDown } from 'lucide-react'

interface Transaction {
  type: 'income' | 'expense'
  amount: number
  category: { name: string } | null
}

interface ExpenseChartProps {
  transactions: Transaction[]
}

// Professional color palette for financial charts
const COLORS = [
  '#6366f1', // Indigo - Primary
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#3b82f6', // Blue
  '#ef4444', // Red
  '#14b8a6', // Teal
  '#f97316', // Orange
  '#a855f7', // Purple
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

  // Convert to array for chart
  const chartData = Object.entries(categoryTotals)
    .map(([name, value]) => ({
      name,
      value: Number(value.toFixed(2))
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10) // Top 10 categories

  if (chartData.length === 0) {
    return (
      <Card className="p-6 bg-gradient-to-br from-white to-gray-50/50 border-gray-200/60 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg shadow-red-500/20">
            <TrendingDown className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Despesas por Categoria</h3>
            <p className="text-sm text-gray-500">Distribuição dos seus gastos</p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64 text-muted-foreground border-2 border-dashed border-gray-200 rounded-xl">
          <div className="text-center">
            <TrendingDown className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm font-medium">Nenhuma despesa para exibir</p>
          </div>
        </div>
      </Card>
    )
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const total = chartData.reduce((sum, d) => sum + d.value, 0)

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]
      const percentage = ((data.value / total) * 100).toFixed(1)
      return (
        <div className="bg-white/95 backdrop-blur-xl border border-gray-200/60 rounded-xl shadow-2xl p-4 min-w-[200px]">
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-3 h-3 rounded-full shadow-sm"
              style={{ backgroundColor: data.payload.fill }}
            />
            <p className="font-semibold text-gray-900 text-sm">{data.name}</p>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(data.value)}</p>
            <p className="text-xs text-gray-500 font-medium">{percentage}% do total</p>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <Card className="overflow-hidden bg-gradient-to-br from-white via-white to-gray-50/30 border-gray-200/60 shadow-xl">
      {/* Header with gradient accent */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-purple-500/5 to-blue-500/5" />
        <div className="relative p-6 pb-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg shadow-red-500/20">
              <TrendingDown className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Despesas por Categoria</h3>
              <p className="text-sm text-gray-500">Análise detalhada dos seus gastos</p>
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900">{formatCurrency(total)}</span>
            <span className="text-sm text-gray-500 font-medium">total gasto</span>
          </div>
        </div>
      </div>

      {/* Chart and Legends Container */}
      <div className="p-4 lg:p-6 pt-2">
        <div className="flex flex-col lg:flex-row lg:items-start gap-6 lg:gap-8">
          {/* Pie Chart */}
          <div className="flex-shrink-0 lg:w-[380px] w-full">
            <ResponsiveContainer width="100%" height={280} className="lg:!h-[320px]">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={90}
                  innerRadius={55}
                  fill="#8884d8"
                  dataKey="value"
                  strokeWidth={3}
                  stroke="#fff"
                  className="lg:!outerRadius-[130] lg:!innerRadius-[75]"
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                      className="hover:opacity-80 transition-opacity cursor-pointer"
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            {/* Center label */}
            <div className="relative -mt-44 lg:-mt-56 pointer-events-none">
              <div className="text-center">
                <p className="text-[10px] lg:text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</p>
                <p className="text-base lg:text-xl font-bold text-gray-900 mt-1">{formatCurrency(total)}</p>
              </div>
            </div>
          </div>

          {/* Enhanced Legends */}
          <div className="flex-1 min-w-0">
            <div className="space-y-2">
              {chartData.map((item, index) => {
                const percentage = (item.value / total) * 100
                const isTopExpense = index === 0

                return (
                  <div
                    key={item.name}
                    className={`group relative rounded-xl p-3 lg:p-4 transition-all duration-200 cursor-pointer ${
                      isTopExpense
                        ? 'bg-gradient-to-r from-red-50 to-red-50/50 border-2 border-red-200 shadow-sm'
                        : 'bg-gray-50/50 border border-gray-200/60 hover:bg-gray-100/80 hover:border-gray-300 hover:shadow-md'
                    }`}
                  >
                    {isTopExpense && (
                      <div className="absolute top-2 right-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-red-500 text-white shadow-sm">
                          Maior
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      {/* Color indicator with shadow */}
                      <div className="relative">
                        <div
                          className="w-4 h-4 rounded-full ring-2 ring-white shadow-lg"
                          style={{
                            backgroundColor: COLORS[index % COLORS.length],
                            boxShadow: `0 2px 8px ${COLORS[index % COLORS.length]}40`
                          }}
                        />
                      </div>

                      {/* Category info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <p className={`text-sm lg:text-base font-semibold truncate ${
                            isTopExpense ? 'text-red-900' : 'text-gray-900'
                          }`} title={item.name}>
                            {item.name}
                          </p>
                          <span className={`text-xs lg:text-sm font-bold ${
                            isTopExpense ? 'text-red-600' : 'text-gray-600'
                          }`}>
                            {percentage.toFixed(1)}%
                          </span>
                        </div>

                        {/* Progress bar */}
                        <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="absolute inset-y-0 left-0 rounded-full transition-all duration-500 ease-out"
                            style={{
                              width: `${percentage}%`,
                              background: `linear-gradient(90deg, ${COLORS[index % COLORS.length]}, ${COLORS[index % COLORS.length]}dd)`
                            }}
                          />
                        </div>

                        <div className="flex items-center justify-between mt-1.5">
                          <span className={`text-base lg:text-lg font-bold ${
                            isTopExpense ? 'text-red-700' : 'text-gray-900'
                          }`}>
                            {formatCurrency(item.value)}
                          </span>
                          <span className="text-[10px] lg:text-xs text-gray-500 font-medium">
                            {((item.value / total) * 100).toFixed(0)}% do orçamento
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
