'use client'

import { Card } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

interface Transaction {
  type: 'income' | 'expense'
  amount: number
  category: { name: string } | null
}

interface ExpenseChartProps {
  transactions: Transaction[]
}

const COLORS = [
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#f59e0b', // amber
  '#10b981', // emerald
  '#3b82f6', // blue
  '#ef4444', // red
  '#14b8a6', // teal
  '#f97316', // orange
  '#a855f7', // violet
  '#06b6d4', // cyan
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
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Despesas por Categoria</h3>
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          Nenhuma despesa para exibir
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

  return (
    <Card className="p-4 md:p-6">
      <h3 className="text-lg font-semibold mb-4">Despesas por Categoria</h3>

      {/* Chart Container */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-6">
        {/* Pie Chart */}
        <div className="flex-shrink-0">
          <ResponsiveContainer width="100%" height={240} className="md:min-w-[300px]">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => formatCurrency(Number(value))}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend - Responsive Grid */}
        <div className="flex-1 min-w-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {chartData.map((item, index) => {
              const percentage = (item.value / total) * 100

              return (
                <div key={item.name} className="flex items-center gap-2 min-w-0">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" title={item.name}>
                      {item.name}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-medium text-gray-900">{formatCurrency(item.value)}</span>
                      <span>•</span>
                      <span>{percentage.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </Card>
  )
}
