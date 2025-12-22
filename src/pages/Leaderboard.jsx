import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Button from '../components/Button';
import { getLeaderboard, updateNickname } from '../services/leaderboardService';
import { getUserID, getUserNickname, setNickname as saveLocalNickname } from '../utils/userStore';

const GAMES = [
    { id: 'neon-runner', name: 'Neon Runner' },
    { id: 'cyber-stack', name: 'Cyber Stack' }
];

export default function Leaderboard() {
    const [activeGame, setActiveGame] = useState(GAMES[0].id);
    const [scores, setScores] = useState([]);
    const [loading, setLoading] = useState(false);
    const [nickname, setNickname] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState(null);

    const userID = getUserID();

    useEffect(() => {
        setNickname(getUserNickname());
    }, []);

    useEffect(() => {
        loadScores(activeGame);
    }, [activeGame]);

    const loadScores = async (gameId) => {
        setLoading(true);
        const data = await getLeaderboard(gameId);
        setScores(data);
        setLoading(false);
    };

    const handleNicknameSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            await updateNickname(userID, nickname);
            saveLocalNickname(nickname);
            setIsEditing(false);
            // Reload scores to reflect changes if user is on leaderboard
            loadScores(activeGame);
        } catch (err) {
            setError(err.message || 'Failed to update nickname');
        }
    };

    return (
        <Layout>
            <div className="max-w-4xl mx-auto py-8">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <h1 className="text-4xl font-black text-white tracking-widest uppercase text-glow">
                        Leaderboards
                    </h1>

                    {/* Nickname Editor */}
                    <div className="flex items-center gap-2 bg-white/5 p-2 rounded-lg border border-white/10">
                        <span className="text-gray-400 text-sm pl-2">Player:</span>
                        {isEditing ? (
                            <form onSubmit={handleNicknameSubmit} className="flex gap-2">
                                <input
                                    type="text"
                                    value={nickname}
                                    onChange={(e) => setNickname(e.target.value)}
                                    className="bg-black/50 border border-cyan-500/50 rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-cyan-400"
                                    placeholder="Enter Nickname"
                                    autoFocus
                                    maxLength={15}
                                />
                                <button type="submit" className="text-cyan-400 hover:text-cyan-300 text-xs uppercase font-bold">Save</button>
                                <button type="button" onClick={() => setIsEditing(false)} className="text-red-400 hover:text-red-300 text-xs uppercase font-bold">Cancel</button>
                            </form>
                        ) : (
                            <div className="flex items-center gap-2">
                                <span className="text-white font-bold">{nickname}</span>
                                <button onClick={() => setIsEditing(true)} className="text-gray-500 hover:text-white transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                                    </svg>
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {error && (
                    <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded mb-6 text-sm">
                        {error}
                    </div>
                )}

                {/* Game Tabs */}
                <div className="flex gap-4 mb-8 border-b border-white/10">
                    {GAMES.map(game => (
                        <button
                            key={game.id}
                            onClick={() => setActiveGame(game.id)}
                            className={`px-6 py-3 text-sm font-bold tracking-wider uppercase transition-all border-b-2 ${activeGame === game.id
                                    ? 'border-cyan-500 text-cyan-400 bg-cyan-500/5'
                                    : 'border-transparent text-gray-500 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {game.name}
                        </button>
                    ))}
                </div>

                {/* Score List */}
                <div className="bg-black/20 backdrop-blur-md rounded-2xl border border-white/5 overflow-hidden">
                    <div className="flex bg-white/5 px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        <div className="w-16 text-center">Rank</div>
                        <div className="flex-1">Player</div>
                        <div className="w-32 text-right">Score</div>
                    </div>

                    {loading ? (
                        <div className="p-12 text-center text-gray-500 animate-pulse">Loading scores...</div>
                    ) : scores.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">No scores yet. Be the first!</div>
                    ) : (
                        <div className="divide-y divide-white/5">
                            {scores.map((score, index) => (
                                <div key={score.id} className={`flex items-center px-6 py-4 transition-colors ${score.uuid === userID ? 'bg-cyan-500/10' : 'hover:bg-white/5'}`}>
                                    <div className="w-16 text-center">
                                        {index === 0 && <span className="text-2xl">🥇</span>}
                                        {index === 1 && <span className="text-2xl">🥈</span>}
                                        {index === 2 && <span className="text-2xl">🥉</span>}
                                        {index > 2 && <span className="text-gray-500 font-mono">#{index + 1}</span>}
                                    </div>
                                    <div className="flex-1 font-medium text-white flex items-center gap-2">
                                        {score.nickname}
                                        {score.uuid === userID && <span className="text-[10px] bg-cyan-500 text-black px-1.5 py-0.5 rounded font-bold uppercase">You</span>}
                                    </div>
                                    <div className="w-32 text-right font-mono text-cyan-400 font-bold text-lg">
                                        {score.score.toLocaleString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
}
