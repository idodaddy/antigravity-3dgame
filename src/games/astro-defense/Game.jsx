import React, { useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { useStore } from './store'
import HUD from './components/HUD'
import PlayerShip from './components/PlayerShip'
import EnemyManager from './components/EnemyManager'
import BulletManager from './components/BulletManager'
import EffectManager from './components/EffectManager'
import { startBGM, stopBGM } from './audio'
import { submitScore } from '../../services/leaderboardService'
import { getUserID, getUserNickname } from '../../utils/userStore'

function GameLogic() {
    const gameOver = useStore(state => state.gameOver)
    const gameStarted = useStore(state => state.gameStarted)
    const score = useStore(state => state.score)
    const setRank = useStore(state => state.setRank)
    const reset = useStore(state => state.reset)

    // Reset on mount
    useEffect(() => {
        reset()
        return () => reset()
    }, [])

    // Audio Control
    useEffect(() => {
        if (gameStarted && !gameOver) {
            startBGM()
        } else {
            stopBGM()
        }
        return () => stopBGM()
    }, [gameStarted, gameOver])

    // Keyboard Controls (Start/Restart)
    const startGame = useStore(state => state.startGame)
    const gameOverTime = React.useRef(0)

    useEffect(() => {
        if (gameOver) {
            gameOverTime.current = Date.now()
        }
    }, [gameOver])

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.code === 'Space') {
                e.preventDefault()
                const now = Date.now()

                if (!gameStarted && !gameOver) {
                    startGame()
                } else if (gameOver) {
                    // Prevent accidental double-tap/spam restart
                    if (now - gameOverTime.current > 1000) {
                        startGame()
                    }
                }
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [gameStarted, gameOver])

    // State for rank (local state to ensure re-render)
    const [rank, setLocalRank] = React.useState(null)
    const setGameRank = useStore(state => state.setRank)

    // Submit Score on Game Over
    useEffect(() => {
        if (gameOver) {
            const uuid = getUserID()
            const nickname = getUserNickname()
            submitScore('astro-defense', uuid, nickname, score).then(r => {
                console.log("Score submitted, rank:", r)
                setLocalRank(r)
            })
        } else {
            setLocalRank(null)
        }
    }, [gameOver]) // Removed score from dependency to prevent double submit if score changes (it shouldn't)

    // Sync local rank to store
    useEffect(() => {
        if (rank) setGameRank(rank)
    }, [rank])

    return null
}

export default function Game() {
    return (
        <div className="relative w-full h-screen bg-black overflow-hidden">
            {/* Camera: Perspective, looking slightly down */}
            <Canvas camera={{ position: [0, 15, 20], fov: 45 }}>
                <color attach="background" args={['#050510']} />

                {/* Lighting */}
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />

                {/* Environment */}
                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                <gridHelper args={[60, 20, '#222', '#111']} position={[0, -5, 0]} />

                {/* Game Components */}
                <PlayerShip />
                <EnemyManager />
                <BulletManager />
                <EffectManager />
                <GameLogic />

                {/* Post Processing */}
                <EffectComposer>
                    <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} intensity={1.5} />
                </EffectComposer>

                <OrbitControls enabled={false} />
            </Canvas>
            <HUD />
        </div>
    )
}
