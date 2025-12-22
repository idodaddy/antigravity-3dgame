import React from 'react'
import { useStore } from '../store'
import GameEndOverlay from '../../../components/GameEndOverlay'
import GameStartOverlay from '../../../components/GameStartOverlay'

export default function HUD() {
    const score = useStore(state => state.score)
    const gameOver = useStore(state => state.gameOver)
    const gameStarted = useStore(state => state.gameStarted)
    const reset = useStore(state => state.reset)
    const startGame = useStore(state => state.startGame)

    const rank = useStore(state => state.rank)

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
            {gameOver && <GameEndOverlay score={score} rank={rank} onRestart={startGame} />}

            {/* Start Screen */}
            {!gameStarted && !gameOver && (
                <div className="absolute inset-0 z-50 pointer-events-auto">
                    <GameStartOverlay
                        title="CYBER STACK"
                        instructions="Tap or Press Space to stack blocks. \n Align them perfectly to keep the tower wide!"
                        onStart={useStore.getState().startGame}
                    />
                </div>
            )}

            {/* Controls Hint */}
            {gameStarted && !gameOver && (
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50 text-sm w-full text-center px-4">
                    Press <span className="text-white font-bold">SPACE</span> or <span className="text-white font-bold">TAP</span> to Place Block
                </div>
            )}
        </div>
    )
}
