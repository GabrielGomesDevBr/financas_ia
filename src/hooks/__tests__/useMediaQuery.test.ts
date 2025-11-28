import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useMediaQuery, useIsMobile, useIsTablet, useIsDesktop } from '../useMediaQuery'

describe('useMediaQuery', () => {
    let matchMediaMock: {
        matches: boolean
        media: string
        addEventListener: ReturnType<typeof vi.fn>
        removeEventListener: ReturnType<typeof vi.fn>
        addListener: ReturnType<typeof vi.fn>
        removeListener: ReturnType<typeof vi.fn>
        dispatchEvent: ReturnType<typeof vi.fn>
    }

    beforeEach(() => {
        // Setup matchMedia mock
        matchMediaMock = {
            matches: false,
            media: '',
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            addListener: vi.fn(),
            removeListener: vi.fn(),
            dispatchEvent: vi.fn(),
        }

        Object.defineProperty(window, 'matchMedia', {
            writable: true,
            value: vi.fn().mockImplementation((query) => ({
                ...matchMediaMock,
                media: query,
            })),
        })
    })

    describe('Basic Functionality', () => {
        it('returns false initially when media query does not match', () => {
            matchMediaMock.matches = false

            const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'))

            expect(result.current).toBe(false)
        })

        it('returns true initially when media query matches', () => {
            matchMediaMock.matches = true
            window.matchMedia = vi.fn().mockImplementation((query) => ({
                ...matchMediaMock,
                matches: true,
                media: query,
            }))

            const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'))

            expect(result.current).toBe(true)
        })

        it('calls window.matchMedia with correct query', () => {
            const query = '(min-width: 1024px)'
            renderHook(() => useMediaQuery(query))

            expect(window.matchMedia).toHaveBeenCalledWith(query)
        })

        it('adds event listener on mount', () => {
            renderHook(() => useMediaQuery('(min-width: 768px)'))

            expect(matchMediaMock.addEventListener).toHaveBeenCalledWith(
                'change',
                expect.any(Function)
            )
        })

        it('removes event listener on unmount', () => {
            const { unmount } = renderHook(() => useMediaQuery('(min-width: 768px)'))

            unmount()

            expect(matchMediaMock.removeEventListener).toHaveBeenCalledWith(
                'change',
                expect.any(Function)
            )
        })
    })

    describe('Query Changes', () => {
        it('updates when query changes', () => {
            const { result, rerender } = renderHook(
                ({ query }) => useMediaQuery(query),
                { initialProps: { query: '(min-width: 768px)' } }
            )

            expect(window.matchMedia).toHaveBeenCalledWith('(min-width: 768px)')

            rerender({ query: '(min-width: 1024px)' })

            expect(window.matchMedia).toHaveBeenCalledWith('(min-width: 1024px)')
        })

        it('cleans up old listener when query changes', () => {
            const { rerender } = renderHook(
                ({ query }) => useMediaQuery(query),
                { initialProps: { query: '(min-width: 768px)' } }
            )

            const firstRemoveCall = matchMediaMock.removeEventListener

            rerender({ query: '(min-width: 1024px)' })

            expect(firstRemoveCall).toHaveBeenCalled()
        })
    })

    describe('Media Query Events', () => {
        it('updates state when media query changes to match', () => {
            let changeListener: ((e: MediaQueryListEvent) => void) | null = null

            matchMediaMock.addEventListener = vi.fn((event, listener) => {
                if (event === 'change') {
                    changeListener = listener as (e: MediaQueryListEvent) => void
                }
            })

            const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'))

            expect(result.current).toBe(false)

            // Simulate media query change
            act(() => {
                if (changeListener) {
                    changeListener({ matches: true } as MediaQueryListEvent)
                }
            })

            expect(result.current).toBe(true)
        })

        it('updates state when media query changes to not match', () => {
            let changeListener: ((e: MediaQueryListEvent) => void) | null = null

            matchMediaMock.matches = true
            matchMediaMock.addEventListener = vi.fn((event, listener) => {
                if (event === 'change') {
                    changeListener = listener as (e: MediaQueryListEvent) => void
                }
            })

            window.matchMedia = vi.fn().mockImplementation((query) => ({
                ...matchMediaMock,
                media: query,
            }))

            const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'))

            expect(result.current).toBe(true)

            // Simulate media query change
            act(() => {
                if (changeListener) {
                    changeListener({ matches: false } as MediaQueryListEvent)
                }
            })

            expect(result.current).toBe(false)
        })

        it('handles multiple media query changes', () => {
            let changeListener: ((e: MediaQueryListEvent) => void) | null = null

            matchMediaMock.addEventListener = vi.fn((event, listener) => {
                if (event === 'change') {
                    changeListener = listener as (e: MediaQueryListEvent) => void
                }
            })

            const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'))

            act(() => {
                if (changeListener) {
                    changeListener({ matches: true } as MediaQueryListEvent)
                }
            })
            expect(result.current).toBe(true)

            act(() => {
                if (changeListener) {
                    changeListener({ matches: false } as MediaQueryListEvent)
                }
            })
            expect(result.current).toBe(false)

            act(() => {
                if (changeListener) {
                    changeListener({ matches: true } as MediaQueryListEvent)
                }
            })
            expect(result.current).toBe(true)
        })
    })

    describe('Different Media Queries', () => {
        it('handles min-width queries', () => {
            renderHook(() => useMediaQuery('(min-width: 1280px)'))
            expect(window.matchMedia).toHaveBeenCalledWith('(min-width: 1280px)')
        })

        it('handles max-width queries', () => {
            renderHook(() => useMediaQuery('(max-width: 639px)'))
            expect(window.matchMedia).toHaveBeenCalledWith('(max-width: 639px)')
        })

        it('handles range queries', () => {
            renderHook(() => useMediaQuery('(min-width: 640px) and (max-width: 1023px)'))
            expect(window.matchMedia).toHaveBeenCalledWith('(min-width: 640px) and (max-width: 1023px)')
        })

        it('handles orientation queries', () => {
            renderHook(() => useMediaQuery('(orientation: portrait)'))
            expect(window.matchMedia).toHaveBeenCalledWith('(orientation: portrait)')
        })

        it('handles resolution queries', () => {
            renderHook(() => useMediaQuery('(min-resolution: 2dppx)'))
            expect(window.matchMedia).toHaveBeenCalledWith('(min-resolution: 2dppx)')
        })

        it('handles prefers-color-scheme queries', () => {
            renderHook(() => useMediaQuery('(prefers-color-scheme: dark)'))
            expect(window.matchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)')
        })

        it('handles complex combined queries', () => {
            const query = '(min-width: 768px) and (max-width: 1024px) and (orientation: landscape)'
            renderHook(() => useMediaQuery(query))
            expect(window.matchMedia).toHaveBeenCalledWith(query)
        })
    })

    describe('useIsMobile', () => {
        it('calls useMediaQuery with mobile breakpoint', () => {
            renderHook(() => useIsMobile())
            expect(window.matchMedia).toHaveBeenCalledWith('(max-width: 639px)')
        })

        it('returns true for mobile viewport', () => {
            matchMediaMock.matches = true
            window.matchMedia = vi.fn().mockImplementation(() => ({
                ...matchMediaMock,
                media: '(max-width: 639px)',
            }))

            const { result } = renderHook(() => useIsMobile())
            expect(result.current).toBe(true)
        })

        it('returns false for non-mobile viewport', () => {
            matchMediaMock.matches = false
            const { result } = renderHook(() => useIsMobile())
            expect(result.current).toBe(false)
        })

        it('updates when viewport changes to mobile', () => {
            let changeListener: ((e: MediaQueryListEvent) => void) | null = null

            matchMediaMock.addEventListener = vi.fn((event, listener) => {
                if (event === 'change') {
                    changeListener = listener as (e: MediaQueryListEvent) => void
                }
            })

            const { result } = renderHook(() => useIsMobile())

            act(() => {
                if (changeListener) {
                    changeListener({ matches: true } as MediaQueryListEvent)
                }
            })

            expect(result.current).toBe(true)
        })
    })

    describe('useIsTablet', () => {
        it('calls useMediaQuery with tablet breakpoint', () => {
            renderHook(() => useIsTablet())
            expect(window.matchMedia).toHaveBeenCalledWith('(min-width: 640px) and (max-width: 1023px)')
        })

        it('returns true for tablet viewport', () => {
            matchMediaMock.matches = true
            window.matchMedia = vi.fn().mockImplementation(() => ({
                ...matchMediaMock,
                media: '(min-width: 640px) and (max-width: 1023px)',
            }))

            const { result } = renderHook(() => useIsTablet())
            expect(result.current).toBe(true)
        })

        it('returns false for non-tablet viewport', () => {
            matchMediaMock.matches = false
            const { result } = renderHook(() => useIsTablet())
            expect(result.current).toBe(false)
        })

        it('updates when viewport changes to tablet', () => {
            let changeListener: ((e: MediaQueryListEvent) => void) | null = null

            matchMediaMock.addEventListener = vi.fn((event, listener) => {
                if (event === 'change') {
                    changeListener = listener as (e: MediaQueryListEvent) => void
                }
            })

            const { result } = renderHook(() => useIsTablet())

            act(() => {
                if (changeListener) {
                    changeListener({ matches: true } as MediaQueryListEvent)
                }
            })

            expect(result.current).toBe(true)
        })
    })

    describe('useIsDesktop', () => {
        it('calls useMediaQuery with desktop breakpoint', () => {
            renderHook(() => useIsDesktop())
            expect(window.matchMedia).toHaveBeenCalledWith('(min-width: 1024px)')
        })

        it('returns true for desktop viewport', () => {
            matchMediaMock.matches = true
            window.matchMedia = vi.fn().mockImplementation(() => ({
                ...matchMediaMock,
                media: '(min-width: 1024px)',
            }))

            const { result } = renderHook(() => useIsDesktop())
            expect(result.current).toBe(true)
        })

        it('returns false for non-desktop viewport', () => {
            matchMediaMock.matches = false
            const { result } = renderHook(() => useIsDesktop())
            expect(result.current).toBe(false)
        })

        it('updates when viewport changes to desktop', () => {
            let changeListener: ((e: MediaQueryListEvent) => void) | null = null

            matchMediaMock.addEventListener = vi.fn((event, listener) => {
                if (event === 'change') {
                    changeListener = listener as (e: MediaQueryListEvent) => void
                }
            })

            const { result } = renderHook(() => useIsDesktop())

            act(() => {
                if (changeListener) {
                    changeListener({ matches: true } as MediaQueryListEvent)
                }
            })

            expect(result.current).toBe(true)
        })
    })

    describe('Edge Cases', () => {
        it('handles empty query string', () => {
            const { result } = renderHook(() => useMediaQuery(''))
            expect(window.matchMedia).toHaveBeenCalledWith('')
            expect(typeof result.current).toBe('boolean')
        })

        it('handles malformed query gracefully', () => {
            const { result } = renderHook(() => useMediaQuery('invalid query!!!'))
            expect(window.matchMedia).toHaveBeenCalledWith('invalid query!!!')
            expect(typeof result.current).toBe('boolean')
        })

        it('does not leak memory on multiple remounts', () => {
            const { unmount: unmount1 } = renderHook(() => useMediaQuery('(min-width: 768px)'))
            const { unmount: unmount2 } = renderHook(() => useMediaQuery('(min-width: 768px)'))
            const { unmount: unmount3 } = renderHook(() => useMediaQuery('(min-width: 768px)'))

            unmount1()
            unmount2()
            unmount3()

            // Each mount should add and remove a listener
            expect(matchMediaMock.addEventListener).toHaveBeenCalledTimes(3)
            expect(matchMediaMock.removeEventListener).toHaveBeenCalledTimes(3)
        })

        it('maintains separate state for multiple instances with same query', () => {
            const { result: result1 } = renderHook(() => useMediaQuery('(min-width: 768px)'))
            const { result: result2 } = renderHook(() => useMediaQuery('(min-width: 768px)'))

            // Both should have the same initial value
            expect(result1.current).toBe(result2.current)
        })

        it('maintains separate state for multiple instances with different queries', () => {
            let listeners: Map<string, (e: MediaQueryListEvent) => void> = new Map()

            window.matchMedia = vi.fn().mockImplementation((query) => {
                const mock = {
                    matches: false,
                    media: query,
                    addEventListener: vi.fn((event: string, listener: (e: MediaQueryListEvent) => void) => {
                        if (event === 'change') {
                            listeners.set(query, listener)
                        }
                    }),
                    removeEventListener: vi.fn(),
                    addListener: vi.fn(),
                    removeListener: vi.fn(),
                    dispatchEvent: vi.fn(),
                }
                return mock
            })

            const { result: mobileResult } = renderHook(() => useIsMobile())
            const { result: desktopResult } = renderHook(() => useIsDesktop())

            // Both should be false initially
            expect(mobileResult.current).toBe(false)
            expect(desktopResult.current).toBe(false)

            // Change mobile to true
            act(() => {
                const mobileListener = listeners.get('(max-width: 639px)')
                if (mobileListener) {
                    mobileListener({ matches: true } as MediaQueryListEvent)
                }
            })

            expect(mobileResult.current).toBe(true)
            expect(desktopResult.current).toBe(false)
        })
    })

    describe('SSR Compatibility', () => {
        it('works in client-side environment', () => {
            // The hook is marked with 'use client' so it runs in browser
            const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'))
            expect(typeof result.current).toBe('boolean')
        })
    })
})
