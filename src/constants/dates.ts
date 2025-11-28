/**
 * Date and period related constants
 */

/**
 * Date formats using date-fns
 */
export const DATE_FORMATS = {
    DISPLAY: 'dd/MM/yyyy',
    DISPLAY_WITH_TIME: 'dd/MM/yyyy HH:mm',
    ISO: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
    API: 'yyyy-MM-dd',
    MONTH_YEAR: 'MMMM yyyy',
    SHORT: 'dd/MM',
} as const

/**
 * Period durations in days
 */
export const PERIOD_DAYS = {
    '7d': 7,
    '30d': 30,
    '90d': 90,
    '1y': 365,
    custom: 0,
    all: 0,
} as const

/**
 * Invite expiration in days
 */
export const INVITE_EXPIRATION_DAYS = 7

/**
 * Account deletion recovery period in days
 */
export const DELETION_RECOVERY_DAYS = 30
