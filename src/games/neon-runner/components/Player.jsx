import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Vector3, Object3D } from 'three'
import * as THREE from 'three'
import { Html } from '@react-three/drei'
import { useStore } from '../store'
import { playJumpSound, playCrashSound } from '../audio'
import RobotCharacter from './RobotCharacter'

const LANE_WIDTH = 3
const JUMP_HEIGHT = 2.5
const JUMP_DURATION = 0.6
const PARTICLE_COUNT = 3000

function ParticleTrail({ playerRef, speed, gameStarted }) {
    const mesh = useRef()
    const dummy = useMemo(() => new Object3D(), [])
    const emitIndex = useRef(0)

    // Initialize particles off-screen
    const particles = useMemo(() => {
        const temp = []
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            temp.push({
                x: 0, y: 0, z: 20, // Start off screen
                vx: 0, vy: 0,
                life: 0, // Start dead
                scale: 0
            })
        }
        return temp
    }, [])

    useFrame((state, delta) => {
        if (!mesh.current) return

        // Emit new particles only if game started
        if (gameStarted) {
            // 3000 particles / 1.0 sec life = 3000 per sec.
            // 3000 / 60 fps = 50 per frame.
            const spawnCount = 50

            const px = playerRef.current ? playerRef.current.position.x : 0
            const py = playerRef.current ? playerRef.current.position.y : 0.3

            for (let i = 0; i < spawnCount; i++) {
                const idx = emitIndex.current
                const p = particles[idx]

                p.life = 1.0
                p.x = px + (Math.random() - 0.5) * 0.5
                p.y = py + (Math.random() - 0.5) * 0.5
                p.z = (Math.random() - 0.5) * 0.2
                p.vx = (Math.random() - 0.5) * 0.5
                p.vy = (Math.random() - 0.5) * 0.5
                p.scale = Math.random() * 0.4 + 0.1

                emitIndex.current = (emitIndex.current + 1) % PARTICLE_COUNT
            }
        }

        // Update all particles
        particles.forEach((particle, i) => {
            if (particle.life > 0) {
                particle.life -= delta * 1.0 // Decay over 1 second

                // Move
                particle.z += speed * delta
                particle.x += particle.vx * delta
                particle.y += particle.vy * delta

                // Update Matrix
                dummy.position.set(particle.x, particle.y, particle.z)
                const s = particle.scale * particle.life
                dummy.scale.set(s, s, s)
                dummy.updateMatrix()
                mesh.current.setMatrixAt(i, dummy.matrix)
            } else {
                // Hide dead particles
                dummy.scale.set(0, 0, 0)
                dummy.updateMatrix()
                mesh.current.setMatrixAt(i, dummy.matrix)
            }
        })
        mesh.current.instanceMatrix.needsUpdate = true
    })

    return (
        <instancedMesh ref={mesh} args={[null, null, PARTICLE_COUNT]} frustumCulled={false}>
            <boxGeometry args={[0.04, 0.04, 0.04]} />
            <meshBasicMaterial color="#ccffff" transparent opacity={0.6} />
        </instancedMesh>
    )
}

const EXPLOSION_COUNT = 30
function ExplosionSystem({ playerX, playerY, trigger }) {
    const mesh = useRef()
    const dummy = useMemo(() => new Object3D(), [])
    const particles = useMemo(() => {
        return new Array(EXPLOSION_COUNT).fill(0).map(() => ({
            x: 0, y: 0, z: 0,
            vx: 0, vy: 0, vz: 0,
            life: 0,
            scale: 0
        }))
    }, [])

    useEffect(() => {
        if (trigger > 0) {
            // Explode!
            particles.forEach(p => {
                p.x = playerX
                p.y = playerY
                p.z = 0
                p.vx = (Math.random() - 0.5) * 10
                p.vy = (Math.random() - 0.5) * 10
                p.vz = (Math.random() - 0.5) * 10
                p.life = 1.0
                p.scale = Math.random() * 0.5 + 0.2
            })
        }
    }, [trigger])

    useFrame((state, delta) => {
        if (!mesh.current) return

        particles.forEach((p, i) => {
            if (p.life > 0) {
                p.life -= delta * 2
                p.x += p.vx * delta
                p.y += p.vy * delta
                p.z += p.vz * delta

                dummy.position.set(p.x, p.y, p.z)
                const s = p.scale * p.life
                dummy.scale.set(s, s, s)
                dummy.updateMatrix()
                mesh.current.setMatrixAt(i, dummy.matrix)
            } else {
                // Hide
                dummy.scale.set(0, 0, 0)
                dummy.updateMatrix()
                mesh.current.setMatrixAt(i, dummy.matrix)
            }
        })
        mesh.current.instanceMatrix.needsUpdate = true
    })

    return (
        <instancedMesh ref={mesh} args={[null, null, EXPLOSION_COUNT]}>
            <boxGeometry args={[0.2, 0.2, 0.2]} />
            <meshBasicMaterial color="#ff0000" />
        </instancedMesh>
    )
}



// ------------------------------------

function FloatingScore({ points, onComplete }) {
    const [visible, setVisible] = useState(true)

    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false)
            onComplete()
        }, 800)
        return () => clearTimeout(timer)
    }, [])

    if (!visible) return null

    return (
        <Html position={[0, 2.5, 0]} center style={{ pointerEvents: 'none', transform: 'translate3d(0,0,0)', zIndex: 100 }}>
            <div style={{
                color: points >= 5 ? '#ffff00' : '#00ffcc',
                fontWeight: '900',
                fontFamily: 'Impact, sans-serif',
                fontStyle: 'italic',
                fontSize: points >= 5 ? '64px' : '48px',
                whiteSpace: 'nowrap',
                textShadow: points >= 5 ? '0 0 30px #ff9900, 3px 3px 0 #000' : '0 0 15px #00ffff, 2px 2px 0 #000',
                animation: 'floatUp 0.8s forwards ease-out',
                userSelect: 'none'
            }}>
                +{points}
            </div>
            <style>{`
                @keyframes floatUp {
                    0% { transform: translateY(0) scale(0.5); opacity: 0; }
                    20% { transform: translateY(-20px) scale(1.5); opacity: 1; }
                    80% { transform: translateY(-60px) scale(2.0); opacity: 1; }
                    100% { transform: translateY(-100px) scale(3.0); opacity: 0; }
                }
             `}</style>
        </Html>
    )
}



export default function Player() {
    const mesh = useRef()
    const [lane, setLane] = useState(0) // -1, 0, 1
    const setPlayerLane = useStore(state => state.setPlayerLane)
    const setPlayerY = useStore(state => state.setPlayerY)
    const setPlayerX = useStore(state => state.setPlayerX)
    const [jumping, setJumping] = useState(false)
    const [sliding, setSliding] = useState(false)
    const [jumpStartTime, setJumpStartTime] = useState(0)
    const [slideStartTime, setSlideStartTime] = useState(0)
    const lives = useStore(state => state.lives)
    const [lastLives, setLastLives] = useState(lives)
    const [hitTrigger, setHitTrigger] = useState(0)
    const [isBlinking, setIsBlinking] = useState(false)
    const [flashColorState, setFlashColorState] = useState(false) // false = Red, true = White
    const [shocked, setShocked] = useState(false)

    useEffect(() => {
        if (lives < lastLives) {
            // Hit detected
            setHitTrigger(t => t + 1)
            setHitTrigger(t => t + 1)
            playCrashSound() // Randomly plays one of 3 variants

            // Electric Shock Effect
            setShocked(true)
            setTimeout(() => setShocked(false), 400)

            // Start blinking effect (2 seconds)
            setIsBlinking(true)
            const blinkInterval = setInterval(() => {
                setFlashColorState(v => !v)
            }, 100)

            setTimeout(() => {
                clearInterval(blinkInterval)
                setIsBlinking(false)
                setFlashColorState(false)
            }, 2000)
        }
        setLastLives(lives)
    }, [lives])

    // Sound effect helper removed (using audio.js)

    const gameStarted = useStore(state => state.gameStarted)
    const gameOver = useStore(state => state.gameOver)
    const speed = useStore(state => state.speed)
    const lastScoreEvent = useStore(state => state.lastScoreEvent)

    const [scores, setScores] = useState([])

    useEffect(() => {
        if (lastScoreEvent && gameStarted && !gameOver) {
            setScores(prev => [...prev, lastScoreEvent])
        }
    }, [lastScoreEvent])

    const removeScore = (id) => {
        setScores(prev => prev.filter(s => s.id !== id))
    }

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!gameStarted || gameOver) return

            if (e.key === 'ArrowLeft' || e.key === 'a') {
                setLane(l => {
                    const newLane = Math.max(l - 1, -1)
                    setPlayerLane(newLane)
                    return newLane
                })
            } else if (e.key === 'ArrowRight' || e.key === 'd') {
                setLane(l => {
                    const newLane = Math.min(l + 1, 1)
                    setPlayerLane(newLane)
                    return newLane
                })
            } else if ((e.key === 'ArrowUp' || e.key === 'w' || e.key === ' ') && !jumping && !sliding) {
                setJumping(true)
                setJumpStartTime(Date.now())
                playJumpSound()
            } else if ((e.key === 'ArrowDown' || e.key === 's') && !jumping && !sliding) {
                setSliding(true)
                setSlideStartTime(Date.now())
                // Optional: play slide sound
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [gameStarted, gameOver, jumping, sliding])

    useFrame((state, delta) => {
        if (!mesh.current) return

        // Horizontal movement (Lerp)
        const targetX = lane * LANE_WIDTH
        mesh.current.position.x += (targetX - mesh.current.position.x) * 10 * delta

        // Jumping logic
        if (jumping) {
            const timeElapsed = (Date.now() - jumpStartTime) / 1000
            if (timeElapsed < JUMP_DURATION) {
                // Simple parabolic jump
                const progress = timeElapsed / JUMP_DURATION
                mesh.current.position.y = Math.sin(progress * Math.PI) * JUMP_HEIGHT + 0.3 // +0.3 is base height
            } else {
                mesh.current.position.y = 0.3 // Base height (half of 0.6)
                setJumping(false)
            }
        }
        // Sliding Logic
        else if (sliding) {
            const timeElapsed = (Date.now() - slideStartTime) / 1000
            if (timeElapsed < JUMP_DURATION) { // Same duration as jump
                // Visuals handled in RobotCharacter, here we just keep state
                mesh.current.position.y = 0.3 // Stay on ground
            } else {
                setSliding(false)
            }
        }

        // Update global Y and X state for collision detection
        // Semi-hack: If sliding, report a lower Y to the store so we can dodge High Obstacles
        setPlayerY(sliding ? 0.0 : mesh.current.position.y)
        setPlayerX(mesh.current.position.x)

        // removed rolling effect
    })

    const playerColor = isBlinking ? (flashColorState ? "#ffffff" : "#ff0000") : "#00ffcc"

    return (
        <group>
            {/* Particle Trail System */}
            <ParticleTrail
                playerRef={mesh}
                speed={speed}
                gameStarted={gameStarted}
            />

            {/* Explosion System */}
            <ExplosionSystem
                playerX={mesh.current ? mesh.current.position.x : 0}
                playerY={mesh.current ? mesh.current.position.y : 0.3}
                trigger={hitTrigger}
            />

            {/* Player Container */}
            <group ref={mesh} position={[0, 0.3, 0]} castShadow>
                <RobotCharacter
                    isJumping={jumping}
                    isSliding={sliding}
                    speed={speed}
                    color={playerColor}
                    shocked={shocked}
                />
                {scores.map(s => (
                    <FloatingScore key={s.id} points={s.points} onComplete={() => removeScore(s.id)} />
                ))}
            </group>
        </group>
    )
}
