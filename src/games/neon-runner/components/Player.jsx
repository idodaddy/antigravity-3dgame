import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Vector3, Object3D } from 'three'
import * as THREE from 'three'
import { useStore } from '../store'
import { playJumpSound, playCrashSound } from '../audio'

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

// --- Simple Neon Mannequin (Thin & Blue) ---
function SimpleNeonMannequin({ isJumping, speed, color }) {
    const group = useRef()
    const leftArm = useRef()
    const rightArm = useRef()
    const leftLeg = useRef()
    const rightLeg = useRef()

    // Default Color: Neon Blue (#0066ff) if no valid color provided
    const baseColor = (color === "#ff0000" || color === "#ffffff") ? color : "#0066ff"

    const material = useMemo(() => new THREE.MeshStandardMaterial({
        color: baseColor,
        emissive: baseColor,
        emissiveIntensity: 1.0,
        roughness: 0.2
    }), [baseColor])

    // Reusable Geometries
    const headGeo = useMemo(() => new THREE.SphereGeometry(0.12, 16, 16), [])
    const jointGeo = useMemo(() => new THREE.SphereGeometry(0.045, 16, 16), [])
    const limbGeo = useMemo(() => new THREE.CylinderGeometry(0.035, 0.035, 0.35, 12), [])

    useFrame((state) => {
        if (!group.current) return

        const t = state.clock.elapsedTime
        const runCycle = t * speed * 2.5

        if (isJumping) {
            // --- JUMP POSE (STAR SHAPE / X) ---
            group.current.position.y = 0.5
            group.current.rotation.set(0, 0, 0)

            // Arms: Up and Out (Wide V)
            // Left Arm (x<0): Needs NEGATIVE Z to rotate Out/Left-Up
            leftArm.current.rotation.set(0, 0, -2.5)
            // Right Arm (x>0): Needs POSITIVE Z to rotate Out/Right-Up
            rightArm.current.rotation.set(0, 0, 2.5)

            // Legs: Down and Out (Inverted V)
            // Left Leg (x<0): Negative Z -> Out
            leftLeg.current.rotation.set(0, 0, -0.6)
            // Right Leg (x>0): Positive Z -> Out
            rightLeg.current.rotation.set(0, 0, 0.6)

        } else {
            // --- RUN POSE (PARALLEL WIPERS) ---

            // Sway Factor
            const sway = Math.sin(runCycle * 5) * 0.4

            // Left Arm: Base -0.6 (Out-Left). Range [-1.0, -0.2]
            // -1.0 is Wide Left (\), -0.2 is Near Vertical (|)
            leftArm.current.rotation.z = -0.6 + sway

            // Right Arm: Base +0.6 (Out-Right). Range [0.2, 1.0]
            // 0.2 is Near Vertical (|), 1.0 is Wide Right (/)
            // We use SAME SIGN (+sway) to synchronize:
            // If sway=+0.4: L=-0.2 (|), R=1.0 (/). Visual: | / (Lean Right)
            // If sway=-0.4: L=-1.0 (\), R=0.2 (|). Visual: \ | (Lean Left)
            // Result: Parallel Wipers!
            rightArm.current.rotation.z = 0.6 + sway

            // Arm Swing (Front/Back X-Axis)
            const armSwing = Math.sin(runCycle) * 0.5
            leftArm.current.rotation.x = armSwing
            rightArm.current.rotation.x = -armSwing

            // Leg Run Logic
            const legAmp = 1.0
            leftLeg.current.rotation.set(Math.sin(runCycle + Math.PI) * legAmp, 0, 0)
            rightLeg.current.rotation.set(Math.sin(runCycle) * legAmp, 0, 0)

            // Body Physics
            group.current.position.y = Math.abs(Math.cos(runCycle)) * 0.15
            group.current.rotation.z = 0
            group.current.rotation.x = 0.1
        }
    })

    const armLen = 0.35 // Limb Length

    return (
        <group ref={group} scale={[1.4, 1.4, 1.4]}>
            {/* --- TORSO & HEAD --- */}
            <group position={[0, 0.45, 0]}>
                {/* Hips */}
                <mesh position={[0, -0.1, 0]} geometry={jointGeo} material={material} scale={[1.6, 1, 1]} />
                {/* Spine */}
                <mesh position={[0, 0.13, 0]} material={material}>
                    <cylinderGeometry args={[0.035, 0.035, 0.45, 12]} />
                </mesh>
                {/* Shoulders */}
                <mesh position={[0, 0.35, 0]} geometry={jointGeo} material={material} scale={[2.0, 0.8, 0.8]} />
                {/* Head (Oval) */}
                <mesh position={[0, 0.6, 0]} geometry={headGeo} material={material} scale={[0.8, 1.2, 0.9]} />
            </group>

            {/* --- ARMS --- */}
            {/* Left Arm Group (Pivots at Shoulder) */}
            <group position={[-0.15, 0.8, 0]} ref={leftArm}>
                <mesh position={[0, -armLen / 2, 0]} geometry={limbGeo} material={material} />
                <mesh position={[0, -armLen, 0]} geometry={jointGeo} material={material} />
                <mesh position={[0, -armLen * 1.5, 0]} geometry={limbGeo} material={material} />
                <mesh position={[0, -armLen * 2, 0]} geometry={jointGeo} material={material} />
            </group>

            {/* Right Arm Group (Pivots at Shoulder) */}
            <group position={[0.15, 0.8, 0]} ref={rightArm}>
                <mesh position={[0, -armLen / 2, 0]} geometry={limbGeo} material={material} />
                <mesh position={[0, -armLen, 0]} geometry={jointGeo} material={material} />
                <mesh position={[0, -armLen * 1.5, 0]} geometry={limbGeo} material={material} />
                <mesh position={[0, -armLen * 2, 0]} geometry={jointGeo} material={material} />
            </group>

            {/* --- LEGS --- */}
            <group position={[-0.08, 0.35, 0]} ref={leftLeg}>
                <mesh position={[0, -0.22, 0]} material={material}>
                    <cylinderGeometry args={[0.035, 0.035, 0.45, 12]} />
                </mesh>
                <mesh position={[0, -0.45, 0]} geometry={jointGeo} material={material} />
                <mesh position={[0, -0.67, -0.05]} material={material} rotation={[-0.2, 0, 0]}>
                    <cylinderGeometry args={[0.035, 0.035, 0.45, 12]} />
                </mesh>
                <mesh position={[0, -0.9, 0.05]} scale={[0.5, 0.3, 1.2]}>
                    <boxGeometry args={[0.1, 0.1, 0.1]} />
                    <primitive object={material} />
                </mesh>
            </group>

            <group position={[0.08, 0.35, 0]} ref={rightLeg}>
                <mesh position={[0, -0.22, 0]} material={material}>
                    <cylinderGeometry args={[0.035, 0.035, 0.45, 12]} />
                </mesh>
                <mesh position={[0, -0.45, 0]} geometry={jointGeo} material={material} />
                <mesh position={[0, -0.67, -0.05]} material={material} rotation={[-0.2, 0, 0]}>
                    <cylinderGeometry args={[0.035, 0.035, 0.45, 12]} />
                </mesh>
                <mesh position={[0, -0.9, 0.05]} scale={[0.5, 0.3, 1.2]}>
                    <boxGeometry args={[0.1, 0.1, 0.1]} />
                    <primitive object={material} />
                </mesh>
            </group>
        </group>
    )
}

// ------------------------------------

export default function Player() {
    const mesh = useRef()
    const [lane, setLane] = useState(0) // -1, 0, 1
    const setPlayerLane = useStore(state => state.setPlayerLane)
    const setPlayerY = useStore(state => state.setPlayerY)
    const setPlayerX = useStore(state => state.setPlayerX)
    const [jumping, setJumping] = useState(false)
    const [jumpStartTime, setJumpStartTime] = useState(0)
    const lives = useStore(state => state.lives)
    const [lastLives, setLastLives] = useState(lives)
    const [hitTrigger, setHitTrigger] = useState(0)
    const [isBlinking, setIsBlinking] = useState(false)
    const [flashColorState, setFlashColorState] = useState(false) // false = Red, true = White

    useEffect(() => {
        if (lives < lastLives) {
            // Hit detected
            setHitTrigger(t => t + 1)
            playCrashSound()

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
            } else if ((e.key === 'ArrowUp' || e.key === 'w' || e.key === ' ') && !jumping) {
                setJumping(true)
                setJumpStartTime(Date.now())
                playJumpSound()
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [gameStarted, gameOver, jumping])

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

        // Update global Y and X state for collision detection
        setPlayerY(mesh.current.position.y)
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
                <SimpleNeonMannequin
                    isJumping={jumping}
                    speed={speed}
                    color={playerColor}
                />
            </group>
        </group>
    )
}
