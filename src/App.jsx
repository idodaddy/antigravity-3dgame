import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import NeonRunnerGame from './games/neon-runner/Game'
import CyberStackGame from './games/cyber-stack/Game'

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/game/neon-runner" element={<NeonRunnerGame />} />
                <Route path="/game/cyber-stack" element={<CyberStackGame />} />
            </Routes>
        </BrowserRouter>
    )
}
