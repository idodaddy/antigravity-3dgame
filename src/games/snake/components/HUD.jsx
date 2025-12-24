import React from 'react'
import { useStore } from '../store'
import GameStartOverlay from '../../../components/GameStartOverlay'
import GameEndOverlay from '../../../components/GameEndOverlay'

export default function HUD() {
    const score = useStore(state => state.score)
    const gameStarted = useStore(state => state.gameStarted)
    const gameOver = useStore(state => state.gameOver)
    const startGame = useStore(state => state.startGame)
    const rank = useStore(state => state.rank)

    const setDirection = useStore(state => state.setDirection)

    // Calculate length in meters
    const lengthMeters = 3 + score;

    return (
        <div className="absolute inset-0 pointer-events-none">
            {/* Top Info */}
            <div className="absolute top-8 left-1/2 -translate-x-1/2 text-center w-full px-4 z-10">
                <h1 className="text-4xl md:text-6xl font-black text-white drop-shadow-[0_0_10px_rgba(0,255,0,0.8)]">
                    {lengthMeters} <span className="text-2xl md:text-4xl text-gray-400">m</span>
                </h1>
                <p className="text-green-400 text-xs md:text-sm font-bold tracking-widest uppercase shadow-black drop-shadow-md">Snake Length</p>
            </div>

            {/* Mobile Controls - Full Rectangular Trapezoid Layout */}
            {gameStarted && !gameOver && (
                <div className="absolute bottom-0 left-0 w-full h-[35vh] pointer-events-auto md:hidden z-40 bg-black/80 border-t-2 border-cyan-500/50 shadow-[0_-5px_20px_rgba(6,182,212,0.2)]">

                    {/* Background Grid */}
                    <div className="absolute inset-0 bg-[linear-gradient(transparent_49%,rgba(6,182,212,0.1)_50%,transparent_51%)] bg-[length:100%_20px] pointer-events-none" />
                    <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_49%,rgba(6,182,212,0.1)_50%,transparent_51%)] bg-[length:20px_100%] pointer-events-none" />

                    {/* Up Button */}
                    <button
                        className="absolute inset-0 w-full h-full bg-black/40 active:bg-green-500/20 transition-colors group"
                        style={{
                            clipPath: 'polygon(0 0, 100% 0, 65% 35%, 35% 35%)',
                            filter: 'drop-shadow(0 0 2px rgba(34,197,94,0.5))'
                        }}
                        onClick={() => setDirection([0, -1])}
                    >
                        <div className="absolute top-[10%] left-1/2 -translate-x-1/2 flex flex-col items-center group-active:-translate-y-1 transition-transform">
                            <span className="text-5xl text-green-400 font-black drop-shadow-[0_0_10px_rgba(34,197,94,1)]">▲</span>
                        </div>
                    </button>

                    {/* Down Button */}
                    <button
                        className="absolute inset-0 w-full h-full bg-black/40 active:bg-yellow-500/20 transition-colors group"
                        style={{
                            clipPath: 'polygon(35% 65%, 65% 65%, 100% 100%, 0 100%)',
                            filter: 'drop-shadow(0 0 2px rgba(234,179,8,0.5))'
                        }}
                        onClick={() => setDirection([0, 1])}
                    >
                        <div className="absolute bottom-[10%] left-1/2 -translate-x-1/2 flex flex-col items-center group-active:translate-y-1 transition-transform">
                            <span className="text-5xl text-yellow-400 font-black drop-shadow-[0_0_10px_rgba(234,179,8,1)]">▼</span>
                        </div>
                    </button>

                    {/* Left Button */}
                    <button
                        className="absolute inset-0 w-full h-full bg-black/40 active:bg-cyan-500/20 transition-colors group"
                        style={{
                            clipPath: 'polygon(0 0, 35% 35%, 35% 65%, 0 100%)',
                            filter: 'drop-shadow(0 0 2px rgba(6,182,212,0.5))'
                        }}
                        onClick={() => setDirection([-1, 0])}
                    >
                        <div className="absolute left-[10%] top-1/2 -translate-y-1/2 flex flex-col items-center group-active:-translate-x-1 transition-transform">
                            <span className="text-5xl text-cyan-400 font-black drop-shadow-[0_0_10px_rgba(6,182,212,1)]">◀</span>
                        </div>
                    </button>

                    {/* Right Button */}
                    <button
                        className="absolute inset-0 w-full h-full bg-black/40 active:bg-purple-500/20 transition-colors group"
                        style={{
                            clipPath: 'polygon(100% 0, 100% 100%, 65% 65%, 65% 35%)',
                            filter: 'drop-shadow(0 0 2px rgba(168,85,247,0.5))'
                        }}
                        onClick={() => setDirection([1, 0])}
                    >
                        <div className="absolute right-[10%] top-1/2 -translate-y-1/2 flex flex-col items-center group-active:translate-x-1 transition-transform">
                            <span className="text-5xl text-purple-400 font-black drop-shadow-[0_0_10px_rgba(168,85,247,1)]">▶</span>
                        </div>
                    </button>

                    {/* Center Decoration (The Void/Core) */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30%] h-[30%] pointer-events-none flex items-center justify-center">
                        <div className="w-full h-full border-2 border-cyan-500/50 bg-black/80 backdrop-blur-md flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.3)]">
                            <div className="w-1/2 h-1/2 bg-cyan-400/20 animate-pulse shadow-[0_0_20px_rgba(6,182,212,0.8)]" />
                            {/* Tech Lines */}
                            <div className="absolute inset-0 border-t border-b border-cyan-500/20 scale-75" />
                            <div className="absolute inset-0 border-l border-r border-cyan-500/20 scale-75" />
                        </div>
                    </div>

                    {/* Boundary Lines (Visual Overlay to ensure visible borders) */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none z-50 opacity-50">
                        <line x1="0" y1="0" x2="35%" y2="35%" stroke="#06b6d4" strokeWidth="2" />
                        <line x1="100%" y1="0" x2="65%" y2="35%" stroke="#06b6d4" strokeWidth="2" />
                        <line x1="0" y1="100%" x2="35%" y2="65%" stroke="#06b6d4" strokeWidth="2" />
                        <line x1="100%" y1="100%" x2="65%" y2="65%" stroke="#06b6d4" strokeWidth="2" />
                    </svg>
                </div>
            )}

            {/* Start Screen */}
            {!gameStarted && !gameOver && (
                <div className="absolute inset-0 z-50 pointer-events-auto">
                    <GameStartOverlay
                        title="NEON SNAKE"
                        instructions={`Use Arrow Keys or Swipe to control the snake.
Eat energy orbs to grow and speed up!`}
                        onStart={startGame}
                    />
                </div>
            )}

            {/* Game Over */}
            {gameOver && <GameEndOverlay score={score} rank={rank} onRestart={startGame} />}
        </div>
    )
}
