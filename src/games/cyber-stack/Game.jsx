import React, { useEffect, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useStore } from './store'
import Stack from './components/Stack'
import ActiveBlock from './components/ActiveBlock'
import HUD from './components/HUD'
import Debris from './components/Debris'

function CameraController() {
    const { camera } = useThree()
    const cameraHeight = useStore(state => state.cameraHeight)

    useFrame(() => {
        // Smoothly move camera up
        camera.position.y += (cameraHeight + 2 - camera.position.y) * 0.05
        camera.lookAt(0, cameraHeight - 4, 0)
    })
    return null
}

function GameContent() {
    const startGame = useStore(state => state.startGame)
    const placeBlock = useStore(state => state.placeBlock)
    const gameStarted = useStore(state => state.gameStarted)
    const gameOver = useStore(state => state.gameOver)

    useEffect(() => {
        startGame()

        const handleKeyDown = (e) => {
            if (e.code === 'Space') {
                const { gameStarted, gameOver, startGame, placeBlock } = useStore.getState()
                if (!gameStarted) startGame()
                else if (!gameOver) placeBlock()
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [])

    return (
        <>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <directionalLight position={[-5, 10, 5]} intensity={0.8} castShadow />

            <CameraController />

            <Stack />
            <ActiveBlock />
            <Debris />

            {/* Background Grid */}
            <gridHelper args={[50, 50, '#333', '#111']} position={[0, -0.5, 0]} />
        </>
    )
}

export default function Game() {
    return (
        <div className="w-full h-screen bg-black">
            <Canvas shadows camera={{ position: [5, 5, 5], fov: 50 }}>
                <GameContent />
                <OrbitControls enabled={false} />
            </Canvas>
            <HUD />
        </div>
    )
}
