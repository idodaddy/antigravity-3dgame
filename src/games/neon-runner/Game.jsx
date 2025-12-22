import React, { Suspense, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { PerspectiveCamera, Environment, Stars } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import Player from './components/Player'
import Track from './components/Track'
import HUD from './components/HUD'
import MobileControls from './components/MobileControls'
import { useStore } from './store'
import { startBGM, stopBGM } from './audio'

import { submitScore } from '../../services/leaderboardService'
import { getUserID, getUserNickname } from '../../utils/userStore'

function GameLogic() {

    const gameStarted = useStore(state => state.gameStarted)
    const gameOver = useStore(state => state.gameOver)
    const score = useStore(state => state.score)

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

    const increaseLevel = useStore(state => state.increaseLevel)

    useEffect(() => {
        let interval;
        if (gameStarted && !gameOver) {
            startBGM()
            interval = setInterval(() => {
                increaseLevel()
            }, 30000)
        } else {
            stopBGM()
        }

        return () => {
            if (interval) clearInterval(interval)
        }
    }, [gameStarted, gameOver, increaseLevel])

    // State for rank
    const [rank, setRank] = React.useState(null);

    // Submit score on Game Over
    useEffect(() => {
        if (gameOver) {
            const uuid = getUserID();
            const nickname = getUserNickname();
            submitScore('neon-runner', uuid, nickname, score).then(r => setRank(r));
        } else {
            setRank(null);
        }
    }, [gameOver, score])

    useFrame((state, delta) => {
        // Score is now handled by collecting minerals
    })

    // We can't easily pass rank to HUD via store without adding it to store.
    // However, HUD is a sibling. Let's use the store to hold 'lastRank' if we want clean architecture,
    // or just assume HUD can read it?
    // Wait, HUD calls GameEndOverlay. 
    // Let's add 'rank' to the Zustand store for simplicity of passing data.

    // Ideally we update the store with the rank.
    // Let's modify the store in a separate step?
    // Actually, HUD reads from store. Let's create a temp store mechanism or just pass it if possible.
    // Since HUD is a component inside Game.jsx, we can pass props if HUD was a child of GameLogic (it isn't).

    // Quick fix: Add setRank to store.
    const setGameRank = useStore(state => state.setRank)
    useEffect(() => {
        if (rank) setGameRank(rank)
    }, [rank])

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
        // Maintain height
        if (camera.position.y < 5.8) camera.position.y += (6 - camera.position.y) * 0.1
    })
    return null
}

export default function Game() {
    return (
        <div className="w-full h-screen bg-[#050505]">
            <Canvas shadows>
                <PerspectiveCamera makeDefault position={[0, 6, 9]} rotation={[-0.4, 0, 0]} fov={60} />
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

                {/* <EffectComposer>
                    <Bloom luminanceThreshold={0.5} luminanceSmoothing={0.9} height={300} />
                </EffectComposer> */}

                <GameLogic />
                <ResponsiveCamera />
            </Canvas>
            <MobileControls />
            <HUD />
        </div>
    )
}
