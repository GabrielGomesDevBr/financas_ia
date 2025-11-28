/**
 * Validation utilities for common patterns
 */

/**
 * Validates an email address
 * @param email - Email string to validate
 * @returns True if valid email format
 * @example
 * isValidEmail("user@example.com") // true
 * isValidEmail("invalid") // false
 */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}

/**
 * Validates a Brazilian CPF
 * @param cpf - CPF string (with or without formatting)
 * @returns True if valid CPF
 * @example
 * isValidCPF("123.456.789-09") // true (if valid)
 * isValidCPF("00000000000") // false
 */
export function isValidCPF(cpf: string): boolean {
    // Remove formatting
    const cleanCPF = cpf.replace(/[^\d]/g, '')

    if (cleanCPF.length !== 11) return false
    if (/^(\d)\1{10}$/.test(cleanCPF)) return false // All same digits

    // Validate check digits
    let sum = 0
    for (let i = 0; i < 9; i++) {
        sum += parseInt(cleanCPF.charAt(i)) * (10 - i)
    }
    let digit = 11 - (sum % 11)
    if (digit > 9) digit = 0
    if (digit !== parseInt(cleanCPF.charAt(9))) return false

    sum = 0
    for (let i = 0; i < 10; i++) {
        sum += parseInt(cleanCPF.charAt(i)) * (11 - i)
    }
    digit = 11 - (sum % 11)
    if (digit > 9) digit = 0
    if (digit !== parseInt(cleanCPF.charAt(10))) return false

    return true
}

/**
 * Validates a UUID v4
 * @param uuid - UUID string to validate
 * @returns True if valid UUID v4
 * @example
 * isValidUUID("550e8400-e29b-41d4-a716-446655440000") // true
 */
export function isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    return uuidRegex.test(uuid)
}

/**
 * Validates a positive number
 * @param value - Value to validate
 * @returns True if positive number
 * @example
 * isPositiveNumber(10) // true
 * isPositiveNumber(0) // false
 * isPositiveNumber(-5) // false
 */
export function isPositiveNumber(value: number): boolean {
    return typeof value === 'number' && value > 0 && !isNaN(value)
}

/**
 * Validates a date range
 * @param startDate - Start date
 * @param endDate - End date
 * @returns True if valid range (start <= end)
 * @example
 * isValidDateRange(new Date('2024-01-01'), new Date('2024-12-31')) // true
 */
export function isValidDateRange(startDate: Date, endDate: Date): boolean {
    return startDate <= endDate
}

/**
 * Validates a string is not empty
 * @param value - String to validate
 * @returns True if non-empty string
 * @example
 * isNonEmptyString("hello") // true
 * isNonEmptyString("   ") // false
 * isNonEmptyString("") // false
 */
export function isNonEmptyString(value: string): boolean {
    return typeof value === 'string' && value.trim().length > 0
}
