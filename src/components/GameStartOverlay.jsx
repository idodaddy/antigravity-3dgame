import React from 'react'
import Button from './Button'

export default function GameStartOverlay({ title, instructions, onStart }) {
    const handleStart = () => {

        // Strict mobile check using User Agent to avoid triggering on Desktop with touch or small screens
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

        if (isMobile) {
            try {
                if (document.documentElement.requestFullscreen) {
                    document.documentElement.requestFullscreen().catch(err => {
                        console.log('Fullscreen request failed:', err);
                    });
                }
            } catch (e) {
                console.log('Fullscreen error:', e);
            }
        }
        onStart()
    }

    return (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center pointer-events-auto animate-fade-in p-4 z-50">
            <div className="relative bg-black/90 border border-white/10 rounded-2xl p-8 max-w-sm w-full shadow-[0_0_50px_rgba(6,182,212,0.2)] overflow-hidden">
                {/* Decorative background elements */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-cyan-400 to-purple-500" />
                <div className="absolute -top-20 -left-20 w-40 h-40 bg-cyan-500/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl" />

                <div className="relative z-10 flex flex-col items-center text-center">
                    <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mb-6 tracking-tight">
                        {title}
                    </h2>

                    {instructions && (
                        <div className="mb-8 p-4 rounded-xl bg-white/5 border border-white/10 w-full">
                            <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                                {instructions}
                            </p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-4 w-full">
                        <Button onClick={handleStart} variant="primary" className="py-4 text-xl shadow-[0_0_30px_rgba(6,182,212,0.4)]">
                            Start Game
                        </Button>
                        <Button to="/" variant="outline" className="flex items-center justify-center gap-2" onClick={(e) => e.stopPropagation()}>
                            <span className="text-lg">🏠</span> Home
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
