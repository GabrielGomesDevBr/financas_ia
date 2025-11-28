/**
 * Professional logging utility
 * Logs only in development, errors always logged
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug'

const isDev = process.env.NODE_ENV === 'development'

class Logger {
    private formatMessage(level: LogLevel, context: string, ...args: any[]): string {
        const timestamp = new Date().toISOString()
        return `[${timestamp}] [${level.toUpperCase()}] [${context}]`
    }

    info(context: string, ...args: any[]) {
        if (isDev) {
            console.log(this.formatMessage('info', context), ...args)
        }
    }

    warn(context: string, ...args: any[]) {
        if (isDev) {
            console.warn(this.formatMessage('warn', context), ...args)
        }
    }

    error(context: string, ...args: any[]) {
        // Always log errors, even in production
        console.error(this.formatMessage('error', context), ...args)
    }

    debug(context: string, ...args: any[]) {
        if (isDev) {
            console.debug(this.formatMessage('debug', context), ...args)
        }
    }
}

export const logger = new Logger()
