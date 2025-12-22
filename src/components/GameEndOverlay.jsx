import React, { useState } from 'react'
import Button from './Button'
import { getUserID, getUserNickname, setNickname } from '../utils/userStore'
import { updateNickname } from '../services/leaderboardService'

export default function GameEndOverlay({ score, rank, onRestart }) {
    const [name, setName] = useState(getUserNickname())
    const [isEditing, setIsEditing] = useState(false)

    const handleSave = async () => {
        if (name.trim()) {
            const newName = name.trim();
            setNickname(newName)
            try {
                await updateNickname(getUserID(), newName);
            } catch (error) {
                console.error("Failed to update nickname on leaderboard:", error);
            }
            setIsEditing(false)
        }
    }

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

                    {/* Name Editor */}
                    <div className="w-full mb-6 min-h-[40px] flex items-center justify-center">
                        {isEditing ? (
                            <div className="flex flex-col gap-2 w-full animate-fade-in">
                                <input
                                    className="w-full bg-white/10 border border-white/20 rounded px-3 h-10 text-white focus:outline-none focus:border-cyan-400 text-sm placeholder:text-gray-500"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    placeholder="Enter Name"
                                    onKeyDown={e => {
                                        e.stopPropagation(); // Prevent game keys (Space/Arrows)
                                        if (e.key === 'Enter') handleSave();
                                    }}
                                    autoFocus
                                />
                                <div className="grid grid-cols-2 gap-2 w-full">
                                    <Button onClick={handleSave} variant="primary" className="h-9 text-xs font-bold">
                                        SAVE
                                    </Button>
                                    <Button onClick={() => setIsEditing(false)} variant="secondary" className="h-9 text-xs font-bold">
                                        CANCEL
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center gap-2 text-gray-400 group cursor-pointer hover:bg-white/5 px-4 py-2 rounded-lg transition-colors" onClick={() => setIsEditing(true)}>
                                <span className="text-sm">Player:</span>
                                <span className="text-white font-bold text-lg border-b border-white/20 group-hover:border-cyan-400 transition-colors">{name}</span>
                                <button
                                    className="w-6 h-6 rounded-full bg-white/10 group-hover:bg-cyan-400 group-hover:text-black transition-all flex items-center justify-center text-xs ml-1"
                                    title="Edit Name"
                                >
                                    ✎
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="text-xs text-cyan-400 font-bold uppercase tracking-wider animate-pulse mb-4">
                        ✓ Score Submitted
                    </div>

                    <div className="grid grid-cols-2 gap-3 w-full mb-4">
                        <Button onClick={onRestart} variant="primary" className="col-span-2 py-3 text-lg shadow-[0_0_20px_rgba(34,211,238,0.3)]">
                            Try Again
                        </Button>
                        <Button to="/leaderboard" variant="secondary" className="col-span-1 py-2 text-sm">
                            🏆 Leaderboard
                        </Button>
                        <Button to="/" variant="outline" className="col-span-1 py-2 text-sm" onClick={(e) => e.stopPropagation()}>
                            🏠 Home
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
