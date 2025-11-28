'use client'

import { useEffect } from 'react'
import { logger } from './logger'

export function registerServiceWorker() {
    if (typeof window === 'undefined') return

    const register = async () => {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js', {
                    scope: '/',
                })

                logger.info('PWA', 'Service Worker registered successfully', {
                    scope: registration.scope,
                })

                // Check for updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing
                    logger.info('PWA', 'Service Worker update found')

                    if (newWorker) {
                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                logger.info('PWA', 'New content available, please refresh')
                            }
                        })
                    }
                })
            } catch (error) {
                logger.error('PWA', 'Service Worker registration failed', error)
            }
        }
    }

    if (document.readyState === 'complete') {
        register()
    } else {
        window.addEventListener('load', register)
    }
}

export function useServiceWorker() {
    useEffect(() => {
        registerServiceWorker()
    }, [])
}
