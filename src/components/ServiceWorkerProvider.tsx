'use client'

import { useServiceWorker } from '@/lib/pwa-register'

export function ServiceWorkerProvider({ children }: { children: React.ReactNode }) {
    useServiceWorker()
    return <>{children}</>
}
