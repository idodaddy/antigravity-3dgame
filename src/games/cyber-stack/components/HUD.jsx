import React from 'react'
import { useStore } from '../store'
import Button from '../../../components/Button'

export default function HUD() {
    const score = useStore(state => state.score)
    const gameOver = useStore(state => state.gameOver)
    const reset = useStore(state => state.reset)

    return (
        <div className="absolute inset-0 pointer-events-none">
            {/* Score */}
            <div className="absolute top-8 left-1/2 -translate-x-1/2 text-center w-full px-4">
                <h1 className="text-4xl md:text-6xl font-black text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                    {score}
                </h1>
                <p className="text-cyan-400 text-xs md:text-sm font-bold tracking-widest uppercase">Blocks Stacked</p>
            </div>

            {/* Game Over */}
            {gameOver && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center pointer-events-auto animate-fade-in p-4 text-center">
                    <h2 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600 mb-4 drop-shadow-lg">
                        GAME OVER
                    </h2>
                    <p className="text-xl md:text-2xl text-white mb-8 font-light">
                        Tower Height: <span className="text-cyan-400 font-bold">{score}</span>
                    </p>

                    <div className="flex gap-4">
                        <Button to="/" variant="outline">
                            Exit
                        </Button>
                        <Button onClick={reset} variant="primary" className="px-8">
                            Try Again
                        </Button>
                    </div>
                </div>
            )}

            {/* Controls Hint */}
            {!gameOver && (
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50 text-sm w-full text-center px-4">
                    Press <span className="text-white font-bold">SPACE</span> or <span className="text-white font-bold">TAP</span> to Place Block
                </div>
            )}
        </div>
    )
}
