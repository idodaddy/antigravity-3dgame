import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Leaderboard from './pages/Leaderboard'
import NeonRunnerGame from './games/neon-runner/Game'
import CyberStackGame from './games/cyber-stack/Game'
import NeonSnakeGame from './games/snake/Game'
import AstroDefenseGame from './games/astro-defense/Game'

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/game/neon-runner" element={<NeonRunnerGame />} />
                <Route path="/game/cyber-stack" element={<CyberStackGame />} />
                <Route path="/game/neon-snake" element={<NeonSnakeGame />} />
                <Route path="/game/astro-defense" element={<AstroDefenseGame />} />
            </Routes>
        </BrowserRouter>
    )
}
