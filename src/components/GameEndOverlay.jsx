import React from 'react'
import Button from './Button'

export default function GameEndOverlay({ score, rank, onRestart }) {
    return (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center pointer-events-auto animate-fade-in p-4 z-50">
            <div className="relative bg-black/90 border border-white/10 rounded-2xl p-8 max-w-sm w-full shadow-[0_0_50px_rgba(168,85,247,0.2)] overflow-hidden">
                {/* Decorative background elements */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 via-purple-500 to-cyan-400" />
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-cyan-500/20 rounded-full blur-3xl" />

                <div className="relative z-10 flex flex-col items-center text-center">
                    <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mb-2 tracking-tight">
                        GAME OVER
                    </h2>

                    <div className="my-6 p-4 rounded-xl bg-white/5 border border-white/10 w-full grid grid-cols-2 divide-x divide-white/10">
                        <div className="px-2">
                            <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Score</p>
                            <p className="text-3xl font-black text-white">{score}</p>
                        </div>
                        <div className="px-2">
                            <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Rank</p>
                            <p className="text-3xl font-black text-cyan-400">{rank ? `#${rank}` : '-'}</p>
                        </div>
                    </div>

                    <div className="text-xs text-cyan-400 font-bold uppercase tracking-wider animate-pulse mb-4">
                        ✓ Score Submitted
                    </div>

                    <div className="grid grid-cols-2 gap-3 w-full mb-4">
                        <Button onClick={onRestart} variant="primary" className="col-span-2 py-3 text-lg">
                            Try Again
                        </Button>
                        <Button to="/leaderboard" variant="secondary" className="col-span-2 py-2 text-sm flex items-center justify-center gap-2">
                            Is that you? Change Name
                        </Button>
                        <Button to="/" variant="outline" className="col-span-2 flex items-center justify-center gap-2">
                            <span className="text-lg">🏠</span> Home
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
