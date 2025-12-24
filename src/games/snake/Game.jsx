import React, { useEffect, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { OrbitControls, Stars } from '@react-three/drei'
import { useStore } from './store'
import Snake from './components/Snake'
import Food from './components/Food'
import Board from './components/Board'
import HUD from './components/HUD'
import EatEffect from './components/EatEffect'
import { startBGM, stopBGM } from './utils/audio'
import { submitScore } from '../../services/leaderboardService'
import { getUserID, getUserNickname } from '../../utils/userStore'
import { EffectComposer, Bloom } from '@react-three/postprocessing'

function ResponsiveCamera() {
    const { camera, size } = useThree()

    useFrame(() => {
        const aspect = size.width / size.height
        const boardSize = 28 // 20 + margin

        let targetY, targetZ, lookAtZ;

        if (aspect < 1) {
            // Mobile (Portrait)
            // Fit width
            const dist = boardSize / (2 * 0.466 * aspect)

            targetY = dist * 0.9
            targetZ = dist * 0.5

            // Look at positive Z to shift board UP
            // This clears the bottom 35% for controls and top for safe area
            // Increased to 8 to ensure board is clear of the large trapezoid controls
            lookAtZ = 8
        } else {
            // PC (Landscape)
            // Fit height
            const dist = boardSize / (2 * 0.466) * 1.2 // Extra zoom out to prevent top cutoff

            targetY = dist * 0.8
            targetZ = dist * 0.5
            lookAtZ = 0 // Center
        }

        // Smoothly interpolate
        camera.position.y += (targetY - camera.position.y) * 0.1
        camera.position.z += (targetZ - camera.position.z) * 0.1

        // Interpolate lookAt target (manual lerp for smooth transition if resizing)
        const currentLookAt = camera.userData.currentLookAt || new THREE.Vector3(0, 0, 0)
        currentLookAt.z += (lookAtZ - currentLookAt.z) * 0.1
        camera.userData.currentLookAt = currentLookAt

        camera.lookAt(0, 0, currentLookAt.z)
    })
    return null
}

function GameLogic() {
    const tick = useStore(state => state.tick)
    const speed = useStore(state => state.speed)
    const setDirection = useStore(state => state.setDirection)
    const gameStarted = useStore(state => state.gameStarted)
    const gameOver = useStore(state => state.gameOver)
    const score = useStore(state => state.score)
    const setRank = useStore(state => state.setRank)

    const reset = useStore(state => state.reset)

    const lastTick = useRef(0)

    useEffect(() => {
        reset()
        return () => reset()
    }, [])

    useFrame((state) => {
        if (state.clock.getElapsedTime() - lastTick.current > speed) {
            tick()
            lastTick.current = state.clock.getElapsedTime()
        }
    })

    const startGame = useStore(state => state.startGame)

    // Controls
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
                e.preventDefault();
            }

            if (e.code === 'Space') {
                if (!gameStarted) startGame()
                else if (gameOver) startGame() // Restart immediately
                return
            }

            if (!gameStarted) return; // Don't move if not started

            switch (e.key) {
                case 'ArrowUp': setDirection([0, -1]); break;
                case 'ArrowDown': setDirection([0, 1]); break;
                case 'ArrowLeft': setDirection([-1, 0]); break;
                case 'ArrowRight': setDirection([1, 0]); break;
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [gameStarted, gameOver])

    // Touch Controls (Swipe)
    const touchStart = useRef(null)
    useEffect(() => {
        const handleTouchStart = (e) => {
            touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
        }
        const handleTouchEnd = (e) => {
            if (!touchStart.current) return
            const dx = e.changedTouches[0].clientX - touchStart.current.x
            const dy = e.changedTouches[0].clientY - touchStart.current.y

            if (Math.abs(dx) > Math.abs(dy)) {
                if (Math.abs(dx) > 30) setDirection(dx > 0 ? [1, 0] : [-1, 0])
            } else {
                if (Math.abs(dy) > 30) setDirection(dy > 0 ? [0, 1] : [0, -1])
            }
            touchStart.current = null
        }
        window.addEventListener('touchstart', handleTouchStart)
        window.addEventListener('touchend', handleTouchEnd)
        return () => {
            window.removeEventListener('touchstart', handleTouchStart)
            window.removeEventListener('touchend', handleTouchEnd)
        }
    }, [])

    // Audio & Score
    useEffect(() => {
        if (gameStarted && !gameOver) {
            startBGM()
        } else {
            stopBGM()
        }

        if (gameOver) {
            const uuid = getUserID()
            const nickname = getUserNickname()
            submitScore('neon-snake', uuid, nickname, score).then(r => setRank(r))
        }
    }, [gameStarted, gameOver, score])

    return null
}

export default function Game() {
    return (
        <div className="w-full h-screen bg-black">
            <Canvas camera={{ position: [0, 15, 10], fov: 50 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

                <Board />
                <Snake />
                <Food />
                <EatEffect />
                <GameLogic />
                <ResponsiveCamera />

                <EffectComposer>
                    <Bloom luminanceThreshold={0.1} luminanceSmoothing={0.9} intensity={1.5} />
                </EffectComposer>

                <OrbitControls enabled={false} />
            </Canvas>
            <HUD />
        </div>
    )
}
