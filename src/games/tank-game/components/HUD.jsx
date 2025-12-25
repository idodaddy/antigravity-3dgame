import React, { useEffect, useRef } from 'react'
import { useStore, gameRefs } from '../store'
import nipplejs from 'nipplejs'

export default function HUD() {
    const score = useStore(state => state.score)
    const level = useStore(state => state.level)
    const lives = useStore(state => state.lives)
    const playerCharge = useStore(state => state.playerCharge)
    const isCharging = useStore(state => state.isCharging)

    // Joystick
    const joystickRef = useRef()

    // Initialize Mobile Controls
    useEffect(() => {
        // Detect mobile? Or just always show for now as per request "Mobile has joystick"
        // But usually we hide on desktop. Request says "PC uses WASD... Mobile uses Joystick".
        // Let's check user agent or just render it if touch events are supported?
        // For simplicity/debugging, let's render controls but maybe make them subtle on PC.
        // Actually, nipplejs works on mouse too.

        const manager = nipplejs.create({
            zone: joystickRef.current,
            mode: 'static',
            position: { left: '50%', top: '50%' },
            color: 'cyan',
            size: 100
        })

        manager.on('move', (evt, data) => {
            // Interface with store/gameRefs to act as keyboard input
            // We might need a "setJoystickInput" action in store to bridge this to PlayerTank
            // Or direct ref manipulation.
            // For now, let's just scaffold the UI.
        })

        return () => manager.destroy()
    }, [])

    return (
        <div className="absolute inset-0 pointer-events-none">
            {/* Top Bar */}
            <div className="flex justify-between items-start p-6">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tighter italic" style={{ textShadow: '0 0 20px cyan' }}>
                        LEVEL {level}
                    </h1>
                    <div className="text-cyan-400 font-mono text-xl tracking-widest mt-1">
                        SCORE: {score.toString().padStart(6, '0')}
                    </div>
                </div>

                {/* Lives */}
                <div className="flex gap-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div
                            key={i}
                            className={`w-8 h-2 skew-x-12 ${i < lives ? 'bg-cyan-500 shadow-[0_0_10px_cyan]' : 'bg-gray-800'}`}
                        />
                    ))}
                </div>
            </div>

            {/* Crosshair / Charge Meter */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-4 transition-opacity duration-300" style={{ opacity: isCharging ? 1 : 0.3 }}>
                {/* Simple Crosshair */}
                <div className="w-4 h-4 border border-cyan-500/50 rounded-full" />

                {/* Charge Bar */}
                <div className="w-32 h-2 bg-gray-900 rounded-full overflow-hidden border border-white/10">
                    <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-white transition-all duration-75 ease-out"
                        style={{ width: `${playerCharge}%`, boxShadow: '0 0 10px cyan' }}
                    />
                </div>
            </div>

            {/* Mobile Controls Container (Visible on touch devices or always for testing) */}
            <div className="absolute bottom-10 left-10 w-32 h-32 pointer-events-auto" ref={joystickRef}></div>

            <button
                className="absolute bottom-10 right-10 w-24 h-24 rounded-full border-4 border-red-500/50 bg-red-500/20 active:bg-red-500/80 active:scale-95 transition-all flex items-center justify-center pointer-events-auto"
                onTouchStart={() => {/* Fire logic */ }}
                onMouseDown={() => {/* Fire logic */ }}
            >
                <div className="w-16 h-16 bg-red-500 rounded-full shadow-[0_0_20px_red]" />
            </button>
        </div>
    )
}
