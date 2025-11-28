/**
 * API response types and interfaces
 */

/**
 * Standard API response wrapper
 * @template T - Type of data in response
 */
export interface APIResponse<T = any> {
    success: boolean
    data?: T
    error?: string
    message?: string
}

/**
 * API error response
 */
export interface APIError {
    error: string
    code?: string
    details?: Record<string, any>
}

/**
 * Paginated API response
 * @template T - Type of items in array
 */
export interface PaginatedResponse<T> {
    items: T[]
    total: number
    page: number
    per_page: number
    has_more: boolean
}

/**
 * Family invite API response
 */
export interface InviteResponse {
    id: string
    email: string
    token: string
    status: 'pending' | 'accepted' | 'cancelled' | 'expired'
    expires_at: string
    created_at: string
}

/**
 * User delete account response
 */
export interface DeleteAccountResponse {
    success: boolean
    deletion_date: string
    is_admin_with_members: boolean
    days_until_deletion: number
}

/**
 * Cron cleanup response
 */
export interface CleanupResponse {
    success: boolean
    deleted_count: number
    timestamp: string
}
