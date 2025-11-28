'use client'

import { Calendar } from 'lucide-react'
import { PeriodOption } from '@/hooks/usePeriodFilter'
import { useState } from 'react'

interface PeriodSelectorProps {
    period: PeriodOption
    onPeriodChange: (period: PeriodOption) => void
    onCustomRangeChange?: (start: string, end: string) => void
}

export function PeriodSelector({ period, onPeriodChange, onCustomRangeChange }: PeriodSelectorProps) {
    const [showCustomPicker, setShowCustomPicker] = useState(false)
    const [customStart, setCustomStart] = useState('')
    const [customEnd, setCustomEnd] = useState('')

    const periods: { value: PeriodOption; label: string }[] = [
        { value: '7d', label: '7 dias' },
        { value: '30d', label: '30 dias' },
        { value: '90d', label: '90 dias' },
        { value: '1y', label: '1 ano' },
        { value: 'all', label: 'Tudo' },
    ]

    const handleCustomApply = () => {
        if (customStart && customEnd && onCustomRangeChange) {
            onCustomRangeChange(customStart, customEnd)
            onPeriodChange('custom')
            setShowCustomPicker(false)
        }
    }

    return (
        <div className="flex flex-col gap-2">
            <div className="flex flex-wrap gap-2">
                {periods.map((p) => (
                    <button
                        key={p.value}
                        onClick={() => onPeriodChange(p.value)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${period === p.value
                                ? 'bg-gradient-primary text-white shadow-md'
                                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                            }`}
                    >
                        {p.label}
                    </button>
                ))}

                <button
                    onClick={() => setShowCustomPicker(!showCustomPicker)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${period === 'custom'
                            ? 'bg-gradient-primary text-white shadow-md'
                            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                        }`}
                >
                    <Calendar className="w-4 h-4" />
                    Personalizado
                </button>
            </div>

            {/* Custom Date Picker */}
            {showCustomPicker && (
                <div className="flex flex-wrap gap-3 p-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800">
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                            Data Inicial
                        </label>
                        <input
                            type="date"
                            value={customStart}
                            onChange={(e) => setCustomStart(e.target.value)}
                            className="px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-sm"
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                            Data Final
                        </label>
                        <input
                            type="date"
                            value={customEnd}
                            onChange={(e) => setCustomEnd(e.target.value)}
                            className="px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-sm"
                        />
                    </div>

                    <div className="flex items-end gap-2">
                        <button
                            onClick={handleCustomApply}
                            disabled={!customStart || !customEnd}
                            className="px-4 py-2 bg-gradient-primary text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Aplicar
                        </button>
                        <button
                            onClick={() => setShowCustomPicker(false)}
                            className="px-4 py-2 bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg text-sm font-medium hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
