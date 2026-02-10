'use client'

import { useEffect, useRef, useCallback } from 'react'
import { signOut } from '@/server/auth'
import { useUserStore } from '@/store/user-store'

const TIMEOUT_DURATION = 60 * 60 * 1000 // 1 hour in milliseconds

/**
 * AuthTimeout component handles automatic sign-out after 1 hour of inactivity.
 * Inactivity is defined by a lack of user interaction (mouse, keyboard, scroll, touch).
 */
export function AuthTimeout() {
    const user = useUserStore(state => state.supabaseUser)
    const resetUser = useUserStore(state => state.resetUser)
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)

    const handleLogout = useCallback(async () => {
        if (user) {
            console.log('[AuthTimeout] Inactivity timeout reached. Logging out...')
            resetUser()
            await signOut()
        }
    }, [user, resetUser])

    const resetTimer = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
        }
        timeoutRef.current = setTimeout(handleLogout, TIMEOUT_DURATION)
    }, [handleLogout])

    useEffect(() => {
        if (!user) {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
                timeoutRef.current = null
            }
            return
        }

        // Set initial timer
        resetTimer()

        // Events that reset the inactivity timer
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']

        const activityHandler = () => resetTimer()

        events.forEach(event => {
            document.addEventListener(event, activityHandler)
        })

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
            events.forEach(event => {
                document.removeEventListener(event, activityHandler)
            })
        }
    }, [user, resetTimer])

    return null
}
