import React, { useRef, useState, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { createSegmentContent, SEGMENT_LENGTH, OBSTACLE_CHANCE, JUMP_DURATION, JUMP_HEIGHT } from '../utils/generator'
import { useStore } from '../store'
import * as THREE from 'three'
import { playCrashSound, playCollectSound } from '../audio'

// Constants imported from generator
const BASE_SPEED = 10 // Approximate base speed for calculation

function Obstacle({ position }) {
    return (
        <mesh position={position} castShadow receiveShadow>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="#ff0055" emissive="#ff0055" emissiveIntensity={0.8} />
        </mesh>
    )
}

function Mineral({ position }) {
    const mesh = useRef()
    const isHigh = position[1] > 1.0
    const color = "#00ffff" // Uniform Cyan

    useFrame((state, delta) => {
        if (mesh.current) {
            mesh.current.rotation.y += delta * 2
            mesh.current.rotation.x += delta

            // Bobbing for high minerals
            if (isHigh) {
                mesh.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 3) * 0.2
            }
        }
    })

    return (
        <group position={[position[0], 0, position[2]]}>
            {/* The Mineral Itself */}
            <mesh ref={mesh} position={[0, position[1], 0]} castShadow>
                <octahedronGeometry args={[0.3, 0]} />
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} />
            </mesh>

            {/* Tether for High Minerals */}
            {isHigh && (
                <mesh position={[0, position[1] / 2, 0]}>
                    <cylinderGeometry args={[0.02, 0.02, position[1], 8]} />
                    <meshBasicMaterial color={color} opacity={0.3} transparent />
                </mesh>
            )}
        </group>
    )
}

function Segment({ position, obstacles, minerals }) {
    return (
        <group position={position}>
            {/* Ground */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, SEGMENT_LENGTH / 2]} receiveShadow>
                <planeGeometry args={[20, SEGMENT_LENGTH]} />
                <meshStandardMaterial color="#1a1a1a" roughness={0.8} metalness={0.2} />
                {/* Grid lines for synthwave look */}
                <gridHelper args={[20, 20, 0xff00cc, 0x222222]} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} />
            </mesh>

            {/* Obstacles */}
            {obstacles.map((obs, i) => (
                <Obstacle key={`obs-${i}`} position={obs.position} />
            ))}

            {/* Minerals */}
            {minerals && minerals.map((min, i) => (
                <Mineral key={`min-${i}`} position={min.position} />
            ))}
        </group>
    )
}

export default function Track() {
    const group = useRef()
    const speed = useStore(state => state.speed)
    const gameStarted = useStore(state => state.gameStarted)
    const gameOver = useStore(state => state.gameOver)
    const endGame = useStore(state => state.endGame)
    const hit = useStore(state => state.hit)
    const collectMineral = useStore(state => state.collectMineral)
    const playerLane = useStore(state => state.playerLane)
    const lastHitTime = useRef(0)
    const lastMineralState = useRef({ lane: 0, height: 0.5 })

    // Initial segments function to be reused
    const nextSpawnOffset = useRef(0)

    const createInitialSegments = () => {
        const initial = []
        nextSpawnOffset.current = 0 // Reset
        // Use current speed or fallback to BASE_SPEED (10) if store not yet ready
        // Note: speed variable here comes from useStore hook at top of component.
        // During first render, it should be the initial state (0 or 10). 
        // If initial state is 0 (game not started), we should use BASE_SPEED for generation math.
        const currentSpeed = speed > 0 ? speed : BASE_SPEED

        for (let i = 0; i < 10; i++) {
            if (i < 1) {
                initial.push({ z: 0, obstacles: [], minerals: [] })
                continue
            }
            const { obstacles, minerals, nextOffset } = createSegmentContent(nextSpawnOffset.current, currentSpeed)
            nextSpawnOffset.current = nextOffset

            initial.push({
                z: -i * SEGMENT_LENGTH,
                obstacles,
                minerals
            })
        }
        return initial
    }

    // Initial segments state
    const [segments, setSegments] = useState(createInitialSegments)

    // Reset segments when game stops (reset)
    React.useEffect(() => {
        if (!gameStarted) {
            setSegments(createInitialSegments())
        }
    }, [gameStarted])

    // Removing old generateObstacles/generateMinerals separate functions since they are merged

    useFrame((state, delta) => {
        if (!gameStarted || gameOver) return

        // Move segments towards camera (positive Z)
        setSegments(prev => {
            const next = prev.map(seg => ({
                ...seg,
                z: seg.z + speed * delta
            }))

            // Remove segments that are behind camera (z > 10) and add new ones
            if (next[0].z > SEGMENT_LENGTH) {
                next.shift()
                const lastZ = next[next.length - 1].z

                // GENERATION SYNC
                // Fallback to BASE_SPEED if speed is invalid/0 to prevent infinite NaN loops
                const currentSpeed = (speed && speed > 0) ? speed : BASE_SPEED
                const { obstacles, minerals, nextOffset } = createSegmentContent(nextSpawnOffset.current, currentSpeed)
                nextSpawnOffset.current = nextOffset

                next.push({
                    z: lastZ - SEGMENT_LENGTH,
                    obstacles,
                    minerals
                })
            }
            return next
        })

        // Collision Detection
        segments.forEach(seg => {
            seg.obstacles.forEach(obs => {
                const obsZ = seg.z + obs.position[2]
                const obsLane = obs.position[0]

                // Check Z distance
                // Obstacle depth 1 -> radius 0.5. Player depth 0.6 -> radius 0.3. Sum = 0.8.
                // Give a little buffer, say 0.9
                if (Math.abs(obsZ) < 0.9) {
                    // Check Lane
                    // Player lane is integer -1, 0, 1. Obs lane is -3, 0, 3.
                    if (obsLane === playerLane * 3) {
                        // Check Vertical Collision
                        // Obstacle height 0.8. Top is 0.8.
                        // Player size 0.6. Bottom is playerY - 0.3.
                        const playerY = useStore.getState().playerY
                        // Forgiveness: hit if player bottom is below obstacle top (minus buffer)
                        // If player bottom > 0.6, they clear the 0.8 obstacle (very forgiving)
                        if (playerY - 0.3 < 0.6) {
                            if (Date.now() - lastHitTime.current > 1000) { // 1 second invulnerability
                                hit()
                                playCrashSound()
                                lastHitTime.current = Date.now()
                            }
                        }
                    }
                }
            })

            // Mineral Collision
            if (seg.minerals) {
                const remainingMinerals = []
                let collected = false
                seg.minerals.forEach(min => {
                    const minZ = seg.z + min.position[2]
                    const minLane = min.position[0]

                    // Check Z distance (radius 0.3 + player 0.3 = 0.6)
                    if (Math.abs(minZ) < 0.8) {
                        // Check 3D Distance for smooth collection
                        const playerX = useStore.getState().playerX
                        const playerY = useStore.getState().playerY

                        const dx = min.position[0] - playerX
                        const dy = min.position[1] - playerY
                        // dz is minZ (relative to player at 0)

                        const distSq = dx * dx + dy * dy + minZ * minZ
                        // Collection radius ~0.8
                        if (distSq < 0.8 * 0.8) {
                            // Collected!
                            collectMineral()
                            playCollectSound()
                            collected = true
                            return // Don't add to remaining
                        }
                    }
                    remainingMinerals.push(min)
                })

                // Update segment minerals if collected
                if (collected) {
                    seg.minerals = remainingMinerals
                }
            }
        })
    })

    return (
        <group ref={group}>
            {segments.map((seg, i) => (
                <Segment key={i} position={[0, 0, seg.z]} obstacles={seg.obstacles} minerals={seg.minerals} />
            ))}
        </group>
    )
}
