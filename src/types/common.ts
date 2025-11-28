/**
 * Common type interfaces shared across the application
 */

/**
 * User access status
 */
export type AccessStatus = 'active' | 'waitlist' | 'blocked'

/**
 * User type/role
 */
export type UserType = 'super_admin' | 'admin' | 'user'

/**
 * Transaction type
 */
export type TransactionType = 'income' | 'expense'

/** * Transaction source
 */
export type TransactionSource = 'chat' | 'manual'

/**
 * Period filter type
 */
export type PeriodType = '7d' | '30d' | '90d' | '1y' | 'custom' | 'all'

/**
 * Theme type
 */
export type Theme = 'light' | 'dark' | 'auto'
