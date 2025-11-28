import { describe, it, expect } from 'vitest'
import { formatCurrency, cn } from '../utils'

describe('formatCurrency', () => {
    describe('Basic Formatting', () => {
        it('formats whole numbers correctly', () => {
            expect(formatCurrency(100)).toMatch(/R\$\s100,00/)
        })

        it('formats decimal numbers correctly', () => {
            expect(formatCurrency(123.45)).toMatch(/R\$\s123,45/)
        })

        it('formats large numbers with thousands separator', () => {
            expect(formatCurrency(1000)).toMatch(/R\$\s1\.000,00/)
        })

        it('formats very large numbers correctly', () => {
            expect(formatCurrency(1234567.89)).toMatch(/R\$\s1\.234\.567,89/)
        })

        it('formats zero correctly', () => {
            expect(formatCurrency(0)).toMatch(/R\$\s0,00/)
        })

        it('formats negative numbers correctly', () => {
            expect(formatCurrency(-100.50)).toMatch(/-R\$\s100,50/)
        })
    })

    describe('Decimal Precision', () => {
        it('rounds to 2 decimal places', () => {
            expect(formatCurrency(10.999)).toMatch(/R\$\s11,00/)
        })

        it('pads single decimal to 2 places', () => {
            expect(formatCurrency(10.5)).toMatch(/R\$\s10,50/)
        })

        it('handles very small decimals', () => {
            expect(formatCurrency(0.01)).toMatch(/R\$\s0,01/)
        })

        it('handles very small decimals that round to zero', () => {
            expect(formatCurrency(0.001)).toMatch(/R\$\s0,00/)
        })

        it('handles trailing zeros correctly', () => {
            expect(formatCurrency(10.10)).toMatch(/R\$\s10,10/)
        })
    })

    describe('Edge Cases', () => {
        it('handles very large numbers', () => {
            expect(formatCurrency(999999999.99)).toMatch(/R\$\s999\.999\.999,99/)
        })

        it('handles very small positive numbers', () => {
            expect(formatCurrency(0.99)).toMatch(/R\$\s0,99/)
        })

        it('handles very small negative numbers', () => {
            expect(formatCurrency(-0.99)).toMatch(/-R\$\s0,99/)
        })

        it('handles floating point precision issues', () => {
            // 0.1 + 0.2 = 0.30000000000000004 in JavaScript
            expect(formatCurrency(0.1 + 0.2)).toMatch(/R\$\s0,30/)
        })

        it('handles numbers with many decimal places', () => {
            expect(formatCurrency(123.456789)).toMatch(/R\$\s123,46/) // Rounds
        })

        it('handles negative zero', () => {
            expect(formatCurrency(-0)).toMatch(/R\$\s0,00/)
        })
    })

    describe('Special Values', () => {
        it('handles Infinity as a number', () => {
            const result = formatCurrency(Infinity)
            expect(result).toContain('∞')
        })

        it('handles -Infinity as a number', () => {
            const result = formatCurrency(-Infinity)
            expect(result).toContain('∞')
        })

        it('handles NaN', () => {
            const result = formatCurrency(NaN)
            expect(result).toContain('NaN')
        })
    })

    describe('Real World Examples', () => {
        it('formats typical expense amounts', () => {
            expect(formatCurrency(15.50)).toMatch(/R\$\s15,50/)
            expect(formatCurrency(45.99)).toMatch(/R\$\s45,99/)
            expect(formatCurrency(123.45)).toMatch(/R\$\s123,45/)
        })

        it('formats salary amounts', () => {
            expect(formatCurrency(3500)).toMatch(/R\$\s3\.500,00/)
            expect(formatCurrency(5420.33)).toMatch(/R\$\s5\.420,33/)
        })

        it('formats large purchase amounts', () => {
            expect(formatCurrency(45000)).toMatch(/R\$\s45\.000,00/)
            expect(formatCurrency(125000.50)).toMatch(/R\$\s125\.000,50/)
        })

        it('formats small transaction amounts', () => {
            expect(formatCurrency(0.50)).toMatch(/R\$\s0,50/)
            expect(formatCurrency(1.99)).toMatch(/R\$\s1,99/)
            expect(formatCurrency(9.90)).toMatch(/R\$\s9,90/)
        })
    })

    describe('Brazilian Currency Specifics', () => {
        it('uses Brazilian Real symbol', () => {
            expect(formatCurrency(100)).toContain('R$')
        })

        it('uses comma as decimal separator', () => {
            expect(formatCurrency(100.50)).toContain(',50')
        })

        it('uses dot as thousands separator', () => {
            expect(formatCurrency(1000)).toContain('1.000')
        })

        it('maintains pt-BR locale formatting', () => {
            const formatted = formatCurrency(1234567.89)
            expect(formatted).toMatch(/R\$\s1\.234\.567,89/)
            expect(formatted).toMatch(/R\$\s\d{1,3}(\.\d{3})*,\d{2}/)
        })
    })
})

describe('cn (className merger)', () => {
    describe('Basic Functionality', () => {
        it('merges class names', () => {
            expect(cn('class1', 'class2')).toBe('class1 class2')
        })

        it('handles single class name', () => {
            expect(cn('class1')).toBe('class1')
        })

        it('handles empty input', () => {
            expect(cn()).toBe('')
        })

        it('handles multiple class names', () => {
            expect(cn('class1', 'class2', 'class3')).toBe('class1 class2 class3')
        })
    })

    describe('Conditional Classes', () => {
        it('handles conditional classes with objects', () => {
            const result = cn({
                'class1': true,
                'class2': false,
                'class3': true
            })
            expect(result).toContain('class1')
            expect(result).toContain('class3')
            expect(result).not.toContain('class2')
        })

        it('handles arrays of classes', () => {
            expect(cn(['class1', 'class2'])).toBe('class1 class2')
        })

        it('handles mixed arrays and strings', () => {
            const result = cn('class1', ['class2', 'class3'], 'class4')
            expect(result).toContain('class1')
            expect(result).toContain('class2')
            expect(result).toContain('class3')
            expect(result).toContain('class4')
        })

        it('handles nested arrays', () => {
            expect(cn(['class1', ['class2', 'class3']])).toContain('class1')
        })
    })

    describe('Falsy Values', () => {
        it('ignores undefined', () => {
            expect(cn('class1', undefined, 'class2')).toBe('class1 class2')
        })

        it('ignores null', () => {
            expect(cn('class1', null, 'class2')).toBe('class1 class2')
        })

        it('ignores false', () => {
            expect(cn('class1', false, 'class2')).toBe('class1 class2')
        })

        it('ignores empty strings', () => {
            expect(cn('class1', '', 'class2')).toBe('class1 class2')
        })

        it('handles all falsy values', () => {
            expect(cn('class1', null, undefined, false, '', 'class2')).toBe('class1 class2')
        })
    })

    describe('Tailwind Merge Functionality', () => {
        it('merges conflicting Tailwind classes correctly', () => {
            // Later class should override earlier class
            const result = cn('bg-red-500', 'bg-blue-500')
            expect(result).toBe('bg-blue-500')
        })

        it('keeps non-conflicting Tailwind classes', () => {
            const result = cn('bg-red-500', 'text-white')
            expect(result).toContain('bg-red-500')
            expect(result).toContain('text-white')
        })

        it('merges padding classes correctly', () => {
            const result = cn('p-4', 'px-6')
            expect(result).toContain('px-6')
            // Note: tailwind-merge may keep or remove p-4 depending on version
            // We just check that px-6 is present
        })

        it('handles responsive Tailwind classes', () => {
            const result = cn('bg-red-500', 'md:bg-blue-500')
            expect(result).toContain('bg-red-500')
            expect(result).toContain('md:bg-blue-500')
        })

        it('handles hover and state variants', () => {
            const result = cn('bg-red-500', 'hover:bg-blue-500')
            expect(result).toContain('bg-red-500')
            expect(result).toContain('hover:bg-blue-500')
        })

        it('merges dark mode classes correctly', () => {
            const result = cn('bg-white', 'dark:bg-gray-800')
            expect(result).toContain('bg-white')
            expect(result).toContain('dark:bg-gray-800')
        })
    })

    describe('Complex Scenarios', () => {
        it('handles component variant pattern', () => {
            const baseClasses = 'px-4 py-2 rounded'
            const variantClasses = {
                primary: 'bg-blue-500 text-white',
                secondary: 'bg-gray-200 text-gray-800'
            }
            const result = cn(baseClasses, variantClasses.primary)
            expect(result).toContain('px-4')
            expect(result).toContain('bg-blue-500')
        })

        it('handles conditional variants', () => {
            const isActive = true
            const isDisabled = false
            const result = cn(
                'base-class',
                isActive && 'active-class',
                isDisabled && 'disabled-class'
            )
            expect(result).toContain('base-class')
            expect(result).toContain('active-class')
            expect(result).not.toContain('disabled-class')
        })

        it('merges user-provided classes with defaults', () => {
            const defaultClasses = 'bg-blue-500 text-white p-4'
            const userClasses = 'bg-red-500 p-6'
            const result = cn(defaultClasses, userClasses)
            expect(result).toContain('bg-red-500') // Overrides bg-blue-500
            expect(result).toContain('text-white') // Preserved
            expect(result).toContain('p-6') // Overrides p-4
        })

        it('handles multiple conflicting classes', () => {
            const result = cn('text-sm', 'text-base', 'text-lg')
            expect(result).toBe('text-lg')
        })
    })

    describe('Real World Usage', () => {
        it('button with variant and state', () => {
            const isDisabled = false
            const variant = 'primary'
            const result = cn(
                'px-4 py-2 rounded font-medium',
                variant === 'primary' && 'bg-blue-500 text-white',
                variant === 'secondary' && 'bg-gray-200 text-gray-800',
                isDisabled && 'opacity-50 cursor-not-allowed'
            )
            expect(result).toContain('px-4')
            expect(result).toContain('bg-blue-500')
            expect(result).not.toContain('opacity-50')
        })

        it('card with responsive and dark mode classes', () => {
            const result = cn(
                'bg-white dark:bg-gray-800',
                'p-4 md:p-6',
                'rounded-lg shadow-sm'
            )
            expect(result).toContain('bg-white')
            expect(result).toContain('dark:bg-gray-800')
            expect(result).toContain('p-4')
            expect(result).toContain('md:p-6')
        })

        it('input with validation state', () => {
            const hasError = true
            const result = cn(
                'border rounded px-3 py-2',
                hasError ? 'border-red-500' : 'border-gray-300',
                'focus:outline-none focus:ring-2',
                hasError ? 'focus:ring-red-500' : 'focus:ring-blue-500'
            )
            expect(result).toContain('border-red-500')
            expect(result).toContain('focus:ring-red-500')
            expect(result).not.toContain('border-gray-300')
        })
    })

    describe('Edge Cases', () => {
        it('handles very long class strings', () => {
            const longClass = 'class-' + '1'.repeat(1000)
            expect(cn(longClass)).toBe(longClass)
        })

        it('handles special characters in class names', () => {
            expect(cn('class-1_2', 'class:3')).toContain('class-1_2')
        })

        it('handles numbers in class names', () => {
            expect(cn('col-12', 'row-3')).toContain('col-12')
        })

        it('handles identical classes', () => {
            const result = cn('class1', 'class1', 'class1')
            // clsx/tailwind-merge may or may not deduplicate non-conflicting classes
            expect(result).toContain('class1')
        })
    })

    describe('Type Safety', () => {
        it('accepts string arguments', () => {
            expect(() => cn('class1', 'class2')).not.toThrow()
        })

        it('accepts object arguments', () => {
            expect(() => cn({ class1: true, class2: false })).not.toThrow()
        })

        it('accepts array arguments', () => {
            expect(() => cn(['class1', 'class2'])).not.toThrow()
        })

        it('accepts mixed argument types', () => {
            expect(() => cn('class1', { class2: true }, ['class3'])).not.toThrow()
        })
    })
})
