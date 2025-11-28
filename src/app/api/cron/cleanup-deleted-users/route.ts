import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'

// POST /api/cron/cleanup-deleted-users - Manual cleanup endpoint for deleted users
// This can be called by external cron service (e.g., Vercel Cron, GitHub Actions, etc.)
export async function POST(request: Request) {
    try {
        // Verify cron secret to prevent unauthorized access
        const authHeader = request.headers.get('authorization')
        const cronSecret = process.env.CRON_SECRET

        if (!cronSecret) {
            logger.error('Cleanup Cron', 'CRON_SECRET not configured')
            return NextResponse.json(
                { error: 'Cron not configured' },
                { status: 500 }
            )
        }

        if (authHeader !== `Bearer ${cronSecret}`) {
            logger.warn('Cleanup Cron', 'Unauthorized access attempt')
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const supabase = await createClient()

        // Call the cleanup function
        const { data, error } = await supabase.rpc('cleanup_expired_user_deletions')

        if (error) {
            logger.error('Cleanup Cron', 'Error running cleanup:', error)
            return NextResponse.json(
                { error: 'Cleanup failed', details: error.message },
                { status: 500 }
            )
        }

        const deletedCount = data || 0

        logger.info('Cleanup Cron', `Cleanup completed. Deleted ${deletedCount} users`)

        return NextResponse.json({
            success: true,
            deleted_count: deletedCount,
            timestamp: new Date().toISOString(),
        })
    } catch (error: any) {
        logger.error('Cleanup Cron', 'Error:', error)
        return NextResponse.json(
            { error: 'Internal server error', details: error.message },
            { status: 500 }
        )
    }
}

// GET /api/cron/cleanup-deleted-users - Check pending deletions (for monitoring)
export async function GET(request: Request) {
    try {
        // Verify cron secret
        const authHeader = request.headers.get('authorization')
        const cronSecret = process.env.CRON_SECRET

        if (!cronSecret) {
            return NextResponse.json(
                { error: 'Cron not configured' },
                { status: 500 }
            )
        }

        if (authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const supabase = await createClient()

        // Get count of users pending deletion
        const { count: pendingCount } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true })
            .not('deleted_at', 'is', null)
            .is('deletion_scheduled_at', null)

        // Get count of users ready for deletion
        const { count: readyCount } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true })
            .not('deletion_scheduled_at', 'is', null)
            .lte('deletion_scheduled_at', new Date().toISOString())

        return NextResponse.json({
            pending_deletion: pendingCount || 0,
            ready_for_deletion: readyCount || 0,
            timestamp: new Date().toISOString(),
        })
    } catch (error: any) {
        logger.error('Cleanup Cron', 'Error checking status:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
