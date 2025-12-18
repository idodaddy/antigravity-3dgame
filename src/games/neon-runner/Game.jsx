import React, { Suspense, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { PerspectiveCamera, Environment, Stars } from '@react-three/drei'
import Player from './components/Player'
import Track from './components/Track'
import HUD from './components/HUD'
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

export default function Game() {
    return (
        <>
            <Canvas shadows>
                <PerspectiveCamera makeDefault position={[0, 3, 6]} rotation={[-0.2, 0, 0]} fov={60} />
                <color attach="background" args={['#050505']} />
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
            </Canvas>
            <HUD />
        </>
    )
}
