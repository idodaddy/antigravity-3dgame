import { useEffect } from 'react'
import { useStore } from '../store'

export default function MobileControls() {
    useEffect(() => {
        let touchStartX = 0
        let touchStartY = 0

        const handleTouchStart = (e) => {
            touchStartX = e.changedTouches[0].screenX
            touchStartY = e.changedTouches[0].screenY
        }

        const handleTouchEnd = (e) => {
            // Ignore if touching an interactive element
            if (e.target.closest('button, a, input, [role="button"]')) {
                return
            }

            const touchEndX = e.changedTouches[0].screenX
            const touchEndY = e.changedTouches[0].screenY

            const diffX = touchEndX - touchStartX
            const diffY = touchEndY - touchStartY

            if (Math.abs(diffX) > Math.abs(diffY)) {
                // Horizontal Swipe
                if (Math.abs(diffX) > 30) {
                    if (diffX > 0) {
                        // Swipe Right
                        dispatchKey('ArrowRight')
                    } else {
                        // Swipe Left
                        dispatchKey('ArrowLeft')
                    }
                }
            } else {
                // Vertical Swipe or Tap
                if (Math.abs(diffY) > 30) {
                    if (diffY < 0) {
                        // Swipe Up - Jump
                        dispatchKey('ArrowUp')
                    } else {
                        // Swipe Down - Slide
                        dispatchKey('ArrowDown')
                    }
                } else {
                    // Tap (short movement)
                    dispatchKey(' ')
                }
            }
        }

        const dispatchKey = (key) => {
            const event = new KeyboardEvent('keydown', { key: key, code: key === ' ' ? 'Space' : key })
            window.dispatchEvent(event)
        }

        const handleTouchMove = (e) => {
            e.preventDefault() // Prevent pull-to-refresh / scrolling
        }

        window.addEventListener('touchstart', handleTouchStart, { passive: false })
        window.addEventListener('touchmove', handleTouchMove, { passive: false })
        window.addEventListener('touchend', handleTouchEnd)

        return () => {
            window.removeEventListener('touchstart', handleTouchStart)
            window.removeEventListener('touchmove', handleTouchMove)
            window.removeEventListener('touchend', handleTouchEnd)
        }
    }, [])

    return null
}
