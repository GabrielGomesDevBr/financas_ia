/**
 * Helper utilities for common operations
 */

/**
 * Safely parses JSON with fallback
 * @param jsonString - JSON string to parse
 * @param fallback - Fallback value if parsing fails
 * @returns Parsed object or fallback
 * @example
 * safeJsonParse('{"key": "value"}') // { key: "value" }
 * safeJsonParse('invalid', {}) // {}
 */
export function safeJsonParse<T = any>(jsonString: string, fallback: T): T {
    try {
        return JSON.parse(jsonString)
    } catch {
        return fallback
    }
}

/**
 * Debounces a function call
 * @param func - Function to debounce
 * @param wait - Wait time in milliseconds
 * @returns Debounced function
 * @example
 * const debouncedSearch = debounce(searchFunction, 300)
 */
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout

    return function executedFunction(...args: Parameters<T>) {
        const later = () => {
            clearTimeout(timeout)
            func(...args)
        }

        clearTimeout(timeout)
        timeout = setTimeout(later, wait)
    }
}

/**
 * Generates a random string
 * @param length - Length of string to generate
 * @returns Random alphanumeric string
 * @example
 * generateRandomString(10) // "a3Bc5Fg7Hi"
 */
export function generateRandomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
}

/**
 * Truncates a string with ellipsis
 * @param str - String to truncate
 * @param maxLength - Maximum length
 * @returns Truncated string
 * @example
 * truncate("Hello World", 8) // "Hello..."
 */
export function truncate(str: string, maxLength: number): string {
    if (str.length <= maxLength) return str
    return str.slice(0, maxLength - 3) + '...'
}

/**
 * Capitalizes first letter of string
 * @param str - String to capitalize
 * @returns Capitalized string
 * @example
 * capitalize("hello") // "Hello"
 */
export function capitalize(str: string): string {
    if (!str) return ''
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

/**
 * Groups array of objects by key
 * @param array - Array to group
 * @param key - Key to group by
 * @returns Grouped object
 * @example
 * groupBy([{type: 'A', val: 1}, {type: 'B', val: 2}], 'type')
 * // { A: [{type: 'A', val: 1}], B: [{type: 'B', val: 2}] }
 */
export function groupBy<T extends Record<string, any>>(
    array: T[],
    key: keyof T
): Record<string, T[]> {
    return array.reduce((result, item) => {
        const groupKey = String(item[key])
        if (!result[groupKey]) {
            result[groupKey] = []
        }
        result[groupKey].push(item)
        return result
    }, {} as Record<string, T[]>)
}

/**
 * Sleeps for specified milliseconds
 * @param ms - Milliseconds to sleep
 * @returns Promise that resolves after delay
 * @example
 * await sleep(1000) // Wait 1 second
 */
export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Clamps a number between min and max
 * @param value - Value to clamp
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Clamped value
 * @example
 * clamp(15, 0, 10) // 10
 * clamp(-5, 0, 10) // 0
 * clamp(5, 0, 10) // 5
 */
export function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max)
}
