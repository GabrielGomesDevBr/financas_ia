'use client'

import { useState, useEffect } from 'react'

/**
 * Hook to detect scroll direction and control UI visibility
 * Returns true when scrolling up or at top, false when scrolling down
 * 
 * @param threshold - Minimum scroll position before hiding (default: 50px)
 * @returns boolean indicating if UI should be visible
 */
export function useScrollDirection(threshold: number = 50): boolean {
    const [isVisible, setIsVisible] = useState(true)
    const [lastScrollY, setLastScrollY] = useState(0)

    useEffect(() => {
        let ticking = false

        const handleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const currentScrollY = window.scrollY

                    // If at the very top, always show
                    if (currentScrollY <= 10) {
                        setIsVisible(true)
                    }
                    // If scrolling down and past threshold, hide
                    else if (currentScrollY > lastScrollY && currentScrollY > threshold) {
                        setIsVisible(false)
                    }
                    // If scrolling up, show
                    else if (currentScrollY < lastScrollY) {
                        setIsVisible(true)
                    }

                    setLastScrollY(currentScrollY)
                    ticking = false
                })

                ticking = true
            }
        }

        // Initial check
        setLastScrollY(window.scrollY)

        // Add scroll listener with passive flag for better performance
        window.addEventListener('scroll', handleScroll, { passive: true })

        return () => {
            window.removeEventListener('scroll', handleScroll)
        }
    }, [lastScrollY, threshold])

    return isVisible
}
