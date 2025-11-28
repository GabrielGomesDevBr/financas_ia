/**
 * Formatting utilities for currency, dates, and numbers
 */

/**
 * Formats a number as Brazilian Real currency
 * @param value - The numeric value to format
 * @returns Formatted currency string (e.g., "R$ 1.234,56")
 * @example
 * formatCurrency(1234.56) // "R$ 1.234,56"
 * formatCurrency(0) // "R$ 0,00"
 */
export function formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value)
}

/**
 * Formats a date using pt-BR locale
 * @param date - Date to format (Date object or ISO string)
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date string
 * @example
 * formatDate(new Date()) // "28/11/2024"
 * formatDate(new Date(), { month: 'long' }) // "28 de novembro de 2024"
 */
export function formatDate(
    date: Date | string,
    options?: Intl.DateTimeFormatOptions
): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return new Intl.DateTimeFormat('pt-BR', options).format(dateObj)
}

/**
 * Formats a date as relative time (e.g., "há 2 horas")
 * @param date - Date to format
 * @returns Relative time string
 * @example
 * formatRelativeTime(new Date(Date.now() - 3600000)) // "há 1 hora"
 */
export function formatRelativeTime(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    const now = new Date()
    const diffMs = now.getTime() - dateObj.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'agora'
    if (diffMins < 60) return `há ${diffMins} minuto${diffMins > 1 ? 's' : ''}`
    if (diffHours < 24) return `há ${diffHours} hora${diffHours > 1 ? 's' : ''}`
    if (diffDays < 7) return `há ${diffDays} dia${diffDays > 1 ? 's' : ''}`

    return formatDate(dateObj, { day: '2-digit', month: 'short' })
}

/**
 * Formats a number with thousands separator
 * @param value - Number to format
 * @returns Formatted number string
 * @example
 * formatNumber(1234567) // "1.234.567"
 */
export function formatNumber(value: number): string {
    return new Intl.NumberFormat('pt-BR').format(value)
}

/**
 * Formats a percentage
 * @param value - Percentage value (0-100)
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted percentage string
 * @example
 * formatPercentage(75.5) // "75,5%"
 * formatPercentage(100, 0) // "100%"
 */
export function formatPercentage(value: number, decimals: number = 1): string {
    return `${value.toFixed(decimals).replace('.', ',')}%`
}
