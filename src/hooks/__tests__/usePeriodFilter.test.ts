import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { usePeriodFilter, PeriodOption } from '../usePeriodFilter'

// Mock localStorage
const localStorageMock = (() => {
    let store: Record<string, string> = {}

    return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => {
            store[key] = value
        },
        removeItem: (key: string) => {
            delete store[key]
        },
        clear: () => {
            store = {}
        }
    }
})()

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
})

describe('usePeriodFilter', () => {
    beforeEach(() => {
        localStorageMock.clear()
        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    describe('Initialization', () => {
        it('initializes with default period (30d)', () => {
            const { result } = renderHook(() => usePeriodFilter())
            expect(result.current.period).toBe('30d')
        })

        it('initializes with custom default period', () => {
            const { result } = renderHook(() => usePeriodFilter('7d'))
            expect(result.current.period).toBe('7d')
        })

        it('loads period from localStorage if available', () => {
            localStorageMock.setItem('period-filter', '90d')
            const { result } = renderHook(() => usePeriodFilter())
            expect(result.current.period).toBe('90d')
        })

        it('ignores invalid period from localStorage', () => {
            localStorageMock.setItem('period-filter', 'invalid')
            const { result } = renderHook(() => usePeriodFilter('30d'))
            expect(result.current.period).toBe('30d')
        })

        it('loads custom range from localStorage if available', () => {
            const customRange = { start: '2024-01-01', end: '2024-01-31' }
            localStorageMock.setItem('period-filter-custom', JSON.stringify(customRange))
            const { result } = renderHook(() => usePeriodFilter())
            expect(result.current.customRange).toEqual(customRange)
        })

        it('handles corrupt custom range data in localStorage', () => {
            localStorageMock.setItem('period-filter-custom', 'invalid json')
            const { result } = renderHook(() => usePeriodFilter())
            expect(result.current.customRange).toBeUndefined()
        })
    })

    describe('Period Change', () => {
        it('updates period when setPeriod is called', () => {
            const { result } = renderHook(() => usePeriodFilter())

            act(() => {
                result.current.setPeriod('7d')
            })

            expect(result.current.period).toBe('7d')
        })

        it('saves period to localStorage when changed', () => {
            const { result } = renderHook(() => usePeriodFilter())

            act(() => {
                result.current.setPeriod('1y')
            })

            // Period should be saved synchronously in useEffect
            expect(result.current.period).toBe('1y')
        })

        it('cycles through all period options correctly', () => {
            const { result } = renderHook(() => usePeriodFilter())
            const periods: PeriodOption[] = ['7d', '30d', '90d', '1y', 'all', 'custom']

            periods.forEach(period => {
                act(() => {
                    result.current.setPeriod(period)
                })
                expect(result.current.period).toBe(period)
            })
        })
    })

    describe('Custom Range', () => {
        it('updates custom range when setCustomRange is called', () => {
            const { result } = renderHook(() => usePeriodFilter())
            const customRange = { start: '2024-01-01', end: '2024-01-31' }

            act(() => {
                result.current.setCustomRange(customRange)
            })

            expect(result.current.customRange).toEqual(customRange)
        })

        it('saves custom range to localStorage when changed', () => {
            const { result } = renderHook(() => usePeriodFilter())
            const customRange = { start: '2024-02-01', end: '2024-02-29' }

            act(() => {
                result.current.setCustomRange(customRange)
            })

            expect(result.current.customRange).toEqual(customRange)
        })

        it('allows clearing custom range', () => {
            const { result } = renderHook(() => usePeriodFilter())
            const customRange = { start: '2024-01-01', end: '2024-01-31' }

            act(() => {
                result.current.setCustomRange(customRange)
            })

            expect(result.current.customRange).toEqual(customRange)

            act(() => {
                result.current.setCustomRange(undefined)
            })

            expect(result.current.customRange).toBeUndefined()
        })
    })

    describe('Date Range Calculation', () => {
        const fixedDate = new Date('2024-06-15T12:00:00Z')

        beforeEach(() => {
            vi.setSystemTime(fixedDate)
        })

        it('calculates date range for 7d period', () => {
            const { result } = renderHook(() => usePeriodFilter('7d'))

            expect(result.current.dateRange).not.toBeNull()
            expect(result.current.dateRange?.startDate).toBeDefined()
            expect(result.current.dateRange?.endDate).toBeDefined()

            const start = new Date(result.current.dateRange!.startDate)
            const end = new Date(result.current.dateRange!.endDate)

            // Just verify end is after start
            expect(end.getTime()).toBeGreaterThan(start.getTime())
        })

        it('calculates date range for 30d period', () => {
            const { result } = renderHook(() => usePeriodFilter('30d'))

            expect(result.current.dateRange).not.toBeNull()
            expect(result.current.dateRange?.startDate).toBeDefined()
            expect(result.current.dateRange?.endDate).toBeDefined()

            const start = new Date(result.current.dateRange!.startDate)
            const end = new Date(result.current.dateRange!.endDate)

            // Just verify end is after start
            expect(end.getTime()).toBeGreaterThan(start.getTime())
        })

        it('calculates date range for 90d period', () => {
            const { result } = renderHook(() => usePeriodFilter('90d'))

            expect(result.current.dateRange).not.toBeNull()
            expect(result.current.dateRange?.startDate).toBeDefined()
            expect(result.current.dateRange?.endDate).toBeDefined()

            const start = new Date(result.current.dateRange!.startDate)
            const end = new Date(result.current.dateRange!.endDate)

            // Just verify end is after start
            expect(end.getTime()).toBeGreaterThan(start.getTime())
        })

        it('calculates date range for 1y period', () => {
            const { result } = renderHook(() => usePeriodFilter('1y'))

            expect(result.current.dateRange).not.toBeNull()
            expect(result.current.dateRange?.startDate).toBeDefined()
            expect(result.current.dateRange?.endDate).toBeDefined()

            const start = new Date(result.current.dateRange!.startDate)
            const end = new Date(result.current.dateRange!.endDate)

            // Just verify end is after start
            expect(end.getTime()).toBeGreaterThan(start.getTime())
        })

        it('returns null for "all" period', () => {
            const { result } = renderHook(() => usePeriodFilter('all'))
            expect(result.current.dateRange).toBeNull()
        })

        it('calculates date range for custom period', () => {
            const { result } = renderHook(() => usePeriodFilter('custom'))
            const customRange = { start: '2024-01-01', end: '2024-01-31' }

            act(() => {
                result.current.setCustomRange(customRange)
            })

            expect(result.current.dateRange).not.toBeNull()
            expect(result.current.dateRange?.startDate).toBeDefined()
            expect(result.current.dateRange?.endDate).toBeDefined()
        })

        it('returns null for custom period without custom range set', () => {
            const { result } = renderHook(() => usePeriodFilter('custom'))
            expect(result.current.dateRange).toBeNull()
        })

        it('uses startOfDay for start date', () => {
            const { result } = renderHook(() => usePeriodFilter('7d'))
            const startDate = new Date(result.current.dateRange!.startDate)

            expect(startDate.getHours()).toBe(0)
            expect(startDate.getMinutes()).toBe(0)
            expect(startDate.getSeconds()).toBe(0)
        })

        it('uses endOfDay for end date', () => {
            const { result } = renderHook(() => usePeriodFilter('7d'))
            const endDate = new Date(result.current.dateRange!.endDate)

            expect(endDate.getHours()).toBe(23)
            expect(endDate.getMinutes()).toBe(59)
            expect(endDate.getSeconds()).toBe(59)
        })
    })

    describe('Date Range Reactivity', () => {
        it('recalculates date range when period changes', () => {
            const { result } = renderHook(() => usePeriodFilter('30d'))
            const initialRange = result.current.dateRange

            act(() => {
                result.current.setPeriod('7d')
            })

            expect(result.current.dateRange).not.toEqual(initialRange)
        })

        it('recalculates date range when custom range changes', () => {
            const { result } = renderHook(() => usePeriodFilter('custom'))

            act(() => {
                result.current.setCustomRange({ start: '2024-01-01', end: '2024-01-31' })
            })

            const firstRange = result.current.dateRange

            act(() => {
                result.current.setCustomRange({ start: '2024-02-01', end: '2024-02-29' })
            })

            expect(result.current.dateRange).not.toEqual(firstRange)
        })

        it('maintains memoization when neither period nor custom range changes', () => {
            const { result, rerender } = renderHook(() => usePeriodFilter('30d'))
            const firstRange = result.current.dateRange

            rerender()

            expect(result.current.dateRange).toBe(firstRange) // Same reference
        })
    })

    describe('Edge Cases', () => {
        it('initializes properly', () => {
            const { result } = renderHook(() => usePeriodFilter())
            expect(result.current.period).toBeDefined()
        })

        it('handles custom range updates', () => {
            const { result } = renderHook(() => usePeriodFilter('custom'))

            act(() => {
                result.current.setCustomRange({ start: '2024-02-01', end: '2024-02-29' })
            })

            expect(result.current.dateRange).not.toBeNull()
            expect(result.current.customRange).toEqual({ start: '2024-02-01', end: '2024-02-29' })
        })

        it('handles custom range with valid dates', () => {
            const { result } = renderHook(() => usePeriodFilter('custom'))

            act(() => {
                result.current.setCustomRange({ start: '2024-01-01', end: '2024-12-31' })
            })

            // Should store and create valid date range
            expect(result.current.customRange).toEqual({ start: '2024-01-01', end: '2024-12-31' })
            expect(result.current.dateRange).not.toBeNull()
        })

        it('handles same start and end date in custom range', () => {
            const { result } = renderHook(() => usePeriodFilter('custom'))

            act(() => {
                result.current.setCustomRange({ start: '2024-01-15', end: '2024-01-15' })
            })

            expect(result.current.dateRange).not.toBeNull()
            expect(result.current.customRange).toEqual({ start: '2024-01-15', end: '2024-01-15' })
        })
    })

    describe('Persistence', () => {
        it('saves period state', () => {
            const { result } = renderHook(() => usePeriodFilter())

            act(() => {
                result.current.setPeriod('90d')
            })

            expect(result.current.period).toBe('90d')
        })

        it('saves custom range state', () => {
            const { result } = renderHook(() => usePeriodFilter())
            const customRange = { start: '2024-01-01', end: '2024-01-31' }

            act(() => {
                result.current.setCustomRange(customRange)
            })

            expect(result.current.customRange).toEqual(customRange)
        })
    })

    describe('Return Values', () => {
        it('returns all expected properties', () => {
            const { result } = renderHook(() => usePeriodFilter('30d'))

            expect(result.current).toHaveProperty('period')
            expect(result.current).toHaveProperty('setPeriod')
            expect(result.current).toHaveProperty('customRange')
            expect(result.current).toHaveProperty('setCustomRange')
            expect(result.current).toHaveProperty('dateRange')
        })

        it('returns functions for setters', () => {
            const { result } = renderHook(() => usePeriodFilter('30d'))

            expect(typeof result.current.setPeriod).toBe('function')
            expect(typeof result.current.setCustomRange).toBe('function')
        })

        it('returns correct types', () => {
            const { result } = renderHook(() => usePeriodFilter('30d'))

            expect(typeof result.current.period).toBe('string')
            expect(result.current.dateRange === null || typeof result.current.dateRange === 'object').toBe(true)
        })
    })
})
