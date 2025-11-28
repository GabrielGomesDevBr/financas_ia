import { useState, useEffect, useMemo } from 'react'
import { subDays, subMonths, subYears, startOfDay, endOfDay } from 'date-fns'

export type PeriodOption = '7d' | '30d' | '90d' | '1y' | 'all' | 'custom'

interface CustomRange {
    start: string
    end: string
}

interface DateRange {
    startDate: string
    endDate: string
}

export function usePeriodFilter(defaultPeriod: PeriodOption = '30d') {
    const [period, setPeriod] = useState<PeriodOption>(() => {
        // Try to load from localStorage
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('period-filter')
            if (saved && ['7d', '30d', '90d', '1y', 'all', 'custom'].includes(saved)) {
                return saved as PeriodOption
            }
        }
        return defaultPeriod
    })

    const [customRange, setCustomRange] = useState<CustomRange | undefined>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('period-filter-custom')
            if (saved) {
                try {
                    return JSON.parse(saved)
                } catch {
                    return undefined
                }
            }
        }
        return undefined
    })

    // Save to localStorage when period changes
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('period-filter', period)
        }
    }, [period])

    // Save custom range to localStorage
    useEffect(() => {
        if (typeof window !== 'undefined' && customRange) {
            localStorage.setItem('period-filter-custom', JSON.stringify(customRange))
        }
    }, [customRange])

    // Calculate date range based on period
    const dateRange = useMemo<DateRange | null>(() => {
        const now = new Date()
        const endDate = endOfDay(now).toISOString()

        switch (period) {
            case '7d':
                return {
                    startDate: startOfDay(subDays(now, 7)).toISOString(),
                    endDate
                }
            case '30d':
                return {
                    startDate: startOfDay(subDays(now, 30)).toISOString(),
                    endDate
                }
            case '90d':
                return {
                    startDate: startOfDay(subDays(now, 90)).toISOString(),
                    endDate
                }
            case '1y':
                return {
                    startDate: startOfDay(subYears(now, 1)).toISOString(),
                    endDate
                }
            case 'custom':
                if (customRange) {
                    return {
                        startDate: startOfDay(new Date(customRange.start)).toISOString(),
                        endDate: endOfDay(new Date(customRange.end)).toISOString()
                    }
                }
                return null
            case 'all':
                return null // No filter
            default:
                return null
        }
    }, [period, customRange])

    return {
        period,
        setPeriod,
        customRange,
        setCustomRange,
        dateRange
    }
}
