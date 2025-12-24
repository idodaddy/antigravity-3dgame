import React from 'react'
import { useStore } from '../store'
import GameStartOverlay from '../../../components/GameStartOverlay'
import GameEndOverlay from '../../../components/GameEndOverlay'
import GameBackButton from '../../../components/GameBackButton'

export default function HUD() {
    const score = useStore(state => state.score)
    const lives = useStore(state => state.lives)
    const gameStarted = useStore(state => state.gameStarted)
    const gameOver = useStore(state => state.gameOver)
    const rank = useStore(state => state.rank)
    const startGame = useStore(state => state.startGame)

    return (
        <div className="absolute inset-0 pointer-events-none select-none font-mono z-50">
            {/* Top Bar - Only visible when game is running or if we want checking items */}
            <div className="absolute top-0 w-full p-4 flex justify-between items-start text-white bg-gradient-to-b from-black/80 to-transparent z-10">

                {/* Common Back Button */}
                {!gameStarted && !gameOver && <GameBackButton className="relative top-0 left-0" />}
                {(gameStarted || gameOver) && <div className="w-10"></div>} {/* Spacer if needed or just empty */}

                {/* Score */}
                <div className="flex flex-col items-center">
                    <span className="text-xs text-cyan-400 uppercase tracking-widest">Score</span>
                    <span className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-cyan-300 to-blue-500 filter drop-shadow-[0_0_10px_rgba(0,255,255,0.5)]">
                        {score.toLocaleString()}
                    </span>
                </div>

                {/* Lives */}
                <div className="flex flex-col items-end">
                    <span className="text-xs text-red-400 uppercase tracking-widest">Shields</span>
                    <div className="flex gap-1 mt-1">
                        {[...Array(3)].map((_, i) => (
                            <div
                                key={i}
                                className={`w-8 h-2 rounded-sm transform skew-x-[-12deg] transition-all duration-300 ${i < lives ? 'bg-red-500 shadow-[0_0_8px_rgba(255,0,0,0.8)]' : 'bg-white/10'
                                    }`}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Back Button (Ingame) */}
            {/* We can also have it always visible using the component directly, positioned absolutely */}
            {gameStarted && <GameBackButton />}

            {/* Start Screen */}
            {!gameStarted && !gameOver && (
                <GameStartOverlay
                    title={<>ASTRO<br />DEFENSE</>}
                    instructions="Drag to Move • Auto-Fire"
                    onStart={startGame}
                />
            )}

            {/* Game Over Screen */}
            {gameOver && (
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 100, pointerEvents: 'auto' }}>
                    <GameEndOverlay
                        score={score || 0}
                        rank={rank}
                        onRestart={startGame}
                    />
                </div>
            )}
        </div>
    )
}
