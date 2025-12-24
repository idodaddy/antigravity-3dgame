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

function TutorialOverlay() {
    const [visible, setVisible] = React.useState(true)
    const gameStarted = useStore(state => state.gameStarted)

    useEffect(() => {
        if (gameStarted) {
            const timer = setTimeout(() => setVisible(false), 3000)
            return () => clearTimeout(timer)
        }
    }, [gameStarted])

    if (!visible || !gameStarted) return null

    return (
        <div className="absolute inset-0 z-50 flex items-end justify-center pointer-events-none pb-8">
            <div className="bg-black/80 backdrop-blur-md border border-white/10 px-8 py-4 rounded-3xl flex flex-row items-center gap-8 animate-in fade-in slide-in-from-bottom-10 duration-500 shadow-2xl">

                {/* Horizontal Swipe Instruction */}
                <div className="flex flex-col items-center gap-2">
                    <div className="relative w-14 h-14 flex items-center justify-center">
                        <div className="bg-white/10 rounded-xl w-14 h-14 flex items-center justify-center border border-white/20 z-10">
                            <div className="animate-[swipeHorizontal_1.5s_ease-in-out_infinite]">
                                <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Left / Right</span>
                </div>

                {/* Vertical Swipe Instruction */}
                <div className="flex flex-col items-center gap-2">
                    <div className="relative w-14 h-14 flex items-center justify-center">
                        <div className="absolute -top-4.5 text-[10px] font-bold text-yellow-400 uppercase tracking-wider animate-pulse">Jump</div>
                        <div className="absolute -bottom-4.5 text-[10px] font-bold text-yellow-400 uppercase tracking-wider animate-pulse">Slide</div>

                        <div className="bg-white/10 rounded-xl w-14 h-14 flex items-center justify-center border border-white/20 z-10">
                            <div className="animate-[swipeVertical_1.5s_ease-in-out_infinite]">
                                <svg className="w-6 h-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Vertical Divider */}
                <div className="w-px h-10 bg-white/10" />

                {/* Keyboard Instruction */}
                <div className="flex flex-col items-center gap-2">
                    <div className="flex gap-0.5 opacity-80 scale-75 items-end">
                        {/* Mock Arrow Keys */}
                        <div className="w-6 h-6 border border-white/40 rounded flex items-center justify-center"><svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></div>
                        <div className="flex flex-col gap-0.5">
                            <div className="w-6 h-6 border border-white/40 rounded flex items-center justify-center"><svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg></div>
                            <div className="w-6 h-6 border border-white/40 rounded flex items-center justify-center"><svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></div>
                        </div>
                        <div className="w-6 h-6 border border-white/40 rounded flex items-center justify-center"><svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></div>
                    </div>
                    <span className="text-[9px] font-bold text-white/50 uppercase tracking-widest">Keys</span>
                </div>

            </div>

            <style>{`
                @keyframes swipeHorizontal {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-8px) rotate(-5deg); }
                    75% { transform: translateX(8px) rotate(5deg); }
                }
                @keyframes swipeVertical {
                    0%, 100% { transform: translateY(0); }
                    25% { transform: translateY(-8px); }
                    75% { transform: translateY(8px); }
                }
            `}</style>
        </div>
    )
}

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
            reset()
        }
    }, [])

    const increaseLevel = useStore(state => state.increaseLevel)

    useEffect(() => {
        let interval;
        if (gameStarted && !gameOver) {
            startBGM()
            interval = setInterval(() => {
                increaseLevel()
            }, 20000)
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

        // Adjust Camera Height based on Aspect Ratio
        // PC (Wide, aspect > 1): Lower camera (e.g., 4.5) to raise runner
        // Mobile (Tall, aspect < 1): Higher camera (e.g., 7.5) to lower runner
        const targetY = aspect > 1 ? 4.5 : 7.5

        // Smoothly interpolate
        camera.position.z += (newZ - camera.position.z) * 0.1
        camera.position.y += (targetY - camera.position.y) * 0.1
    })
    return null
}

export default function Game() {
    return (
        <div className="w-full h-screen bg-[#050505]" style={{ touchAction: 'none' }}>
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
            <TutorialOverlay />
        </div>
    )
}
