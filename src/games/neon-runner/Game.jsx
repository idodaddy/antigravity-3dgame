import React, { Suspense, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { PerspectiveCamera, Environment, Stars } from '@react-three/drei'
import Player from './components/Player'
import Track from './components/Track'
import HUD from './components/HUD'
import MobileControls from './components/MobileControls'
import { useStore } from './store'
import { startBGM, stopBGM } from './audio'

function GameLogic() {

    const gameStarted = useStore(state => state.gameStarted)
    const gameOver = useStore(state => state.gameOver)

    const reset = useStore(state => state.reset)

    useEffect(() => {
        // Reset game state on mount
        reset()

        return () => {
            // Stop BGM on unmount
            stopBGM()
            reset() // Optional: reset on leave too
        }
    }, [])

    useEffect(() => {
        if (gameStarted && !gameOver) {
            startBGM()
        } else {
            stopBGM()
        }
    }, [gameStarted, gameOver])

    useFrame((state, delta) => {
        // Score is now handled by collecting minerals
    })
    return null
}

function ResponsiveCamera() {
    const { camera, size } = useThree()

    useFrame(() => {
        const aspect = size.width / size.height
        // We want to ensure a horizontal field of view that covers at least width ~10 (lanes + margin)
        // Visible height at distance D is H = 2 * D * tan(FOV/2)
        // Visible width W = H * aspect = 2 * D * tan(FOV/2) * aspect
        // D = W / (2 * tan(FOV/2) * aspect)
        // FOV 60 -> tan(30) = 0.57735
        // W = 10 -> D = 10 / (1.1547 * aspect) = 8.66 / aspect

        const targetDist = 9.0 / aspect
        const baseZ = 6
        const newZ = Math.max(baseZ, targetDist)

        // Smoothly interpolate
        camera.position.z += (newZ - camera.position.z) * 0.1
    })
    return null
}

export default function Game() {
    return (
        <div className="w-full h-screen bg-[#050505]">
            <Canvas shadows>
                <PerspectiveCamera makeDefault position={[0, 3, 6]} rotation={[-0.2, 0, 0]} fov={60} />
                <fog attach="fog" args={['#000', 10, 90]} />

                <ambientLight intensity={0.5} />
                <directionalLight
                    position={[10, 10, 5]}
                    intensity={1}
                    castShadow
                    shadow-mapSize={[1024, 1024]}
                />

                <Suspense fallback={null}>
                    <Player />
                    <Track />
                </Suspense>
                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

                <GameLogic />
                <ResponsiveCamera />
            </Canvas>
            <MobileControls />
            <HUD />
        </div>
    )
}
