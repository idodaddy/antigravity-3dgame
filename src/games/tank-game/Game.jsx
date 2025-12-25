import React, { Suspense, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { Physics } from '@react-three/rapier'
import { KeyboardControls, OrbitControls } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { useStore } from './store'
import GameStartOverlay from '../../components/GameStartOverlay'
import GameEndOverlay from '../../components/GameEndOverlay'
import GameBackButton from '../../components/GameBackButton'

import Map from './components/Map'
import PlayerTank from './components/PlayerTank'
import BulletManager from './components/BulletManager'
import EffectManager from './components/EffectManager'
import HUD from './components/HUD'

// Placeholders for now
const EnemyManager = () => null

export default function TankBattleGame() {
    const { gameStarted, gameOver, score, startGame, reset, setGameOver } = useStore()

    // Key map
    const keyboardMap = [
        { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
        { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
        { name: 'left', keys: ['ArrowLeft', 'KeyA'] },
        { name: 'right', keys: ['ArrowRight', 'KeyD'] },
        { name: 'fire', keys: ['Space'] },
    ]

    return (
        <div className="relative w-full h-screen bg-black overflow-hidden select-none">
            <KeyboardControls map={keyboardMap}>
                <Canvas shadows camera={{ position: [0, 20, 20], fov: 45 }}>
                    <color attach="background" args={['#050510']} />


                    {/* Lighting */}
                    <ambientLight intensity={0.5} />
                    <directionalLight position={[10, 20, 10]} intensity={1} castShadow />

                    <Map />

                    {gameStarted && !gameOver && (
                        <>
                            <PlayerTank />
                            <EnemyManager />
                            <BulletManager />
                        </>
                    )}

                    <EffectManager />

                    {/* Post Processing */}
                    <EffectComposer disableNormalPass>
                        <Bloom luminanceThreshold={0.5} intensity={1.5} radius={0.5} />
                    </EffectComposer>
                </Canvas>
            </KeyboardControls>

            <HUD />
            <GameBackButton />

            {/* Overlays */}
            {!gameStarted && !gameOver && (
                <GameStartOverlay
                    title="Tank Battle"
                    instructions="WASD to Move, SPACE to Charge Shot. Destroy all enemies!"
                    onStart={startGame}
                    onHome={() => window.location.href = '/'}
                />
            )}

            {gameOver && (
                <GameEndOverlay
                    score={score}
                    onRestart={startGame}
                    onHome={() => window.location.href = '/'}
                />
            )}
        </div>
    )
}
