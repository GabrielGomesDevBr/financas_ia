/**
 * Custom error classes for better error handling
 */

export class AppError extends Error {
    constructor(
        message: string,
        public code: string,
        public statusCode: number = 500,
        public details?: any
    ) {
        super(message)
        this.name = 'AppError'
    }
}

export class ValidationError extends AppError {
    constructor(message: string, details?: any) {
        super(message, 'VALIDATION_ERROR', 400, details)
        this.name = 'ValidationError'
    }
}

export class AuthenticationError extends AppError {
    constructor(message: string = 'Not authenticated') {
        super(message, 'AUTH_ERROR', 401)
        this.name = 'AuthenticationError'
    }
}

export class AuthorizationError extends AppError {
    constructor(message: string = 'Not authorized') {
        super(message, 'AUTHORIZATION_ERROR', 403)
        this.name = 'AuthorizationError'
    }
}

export class NotFoundError extends AppError {
    constructor(resource: string = 'Resource') {
        super(`${resource} not found`, 'NOT_FOUND', 404)
        this.name = 'NotFoundError'
    }
}

/**
 * Error handler for API routes
 */
export function handleApiError(error: unknown) {
    if (error instanceof AppError) {
        return {
            error: error.message,
            code: error.code,
            details: error.details,
            statusCode: error.statusCode,
        }
    }

    // Unknown error
    return {
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
        statusCode: 500,
    }
}
