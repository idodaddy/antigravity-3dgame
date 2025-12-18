import React, { useRef, useState, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useStore } from '../store'
import * as THREE from 'three'
import { playCrashSound, playCollectSound } from '../audio'

const SEGMENT_LENGTH = 20
const OBSTACLE_CHANCE = 0.5 // Increased density
const JUMP_HEIGHT = 2.5
const JUMP_DURATION = 0.6
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

    // Initial segments
    // Initial segments function to be reused
    const createInitialSegments = () => {
        const initial = []
        for (let i = 0; i < 10; i++) {
            const obs = i < 1 ? [] : generateObstacles()
            const mins = i < 1 ? [] : generateMinerals(obs)
            initial.push({
                z: -i * SEGMENT_LENGTH,
                obstacles: obs,
                minerals: mins
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

    function generateObstacles() {
        const obs = []
        // 3 lanes: -3, 0, 3
        const lanes = [-3, 0, 3]
        if (Math.random() < OBSTACLE_CHANCE) {
            const lane = lanes[Math.floor(Math.random() * lanes.length)]
            obs.push({ position: [lane, 0.4, Math.random() * SEGMENT_LENGTH] })

            // Try to add a second obstacle in a different lane
            if (Math.random() < 0.5) {
                const lane2 = lanes[Math.floor(Math.random() * lanes.length)]
                if (lane2 !== lane) {
                    obs.push({ position: [lane2, 0.4, Math.random() * SEGMENT_LENGTH] })
                }
            }
        }
        return obs
    }

    function generateMinerals(obstacles) {
        const mins = []
        const lanes = [-3, 0, 3]

        // We generate patterns instead of fixed spacing
        let z = 2
        while (z < SEGMENT_LENGTH - 5) {
            // Decide pattern: 0 = Ground Line, 1 = Jump Arc
            const pattern = Math.random() < 0.4 ? 1 : 0
            const lane = lanes[Math.floor(Math.random() * lanes.length)]

            let currentPattern = pattern // Use a local variable to allow modification

            if (currentPattern === 1) {
                // JUMP ARC (6 minerals)
                // Total distance covered during jump = Speed * Duration
                // Use current speed for accurate placement
                // Stretch by 1.1 to match perceived jump length
                const jumpDist = (speed * JUMP_DURATION) * 1.1
                const spacing = jumpDist / 6

                // Diagonal Arc Logic
                // 50% chance to switch lane during jump
                let endLane = lane
                if (Math.random() < 0.5) {
                    const possibleLanes = lanes.filter(l => Math.abs(l - lane) === 3) // Adjacent lanes only
                    if (possibleLanes.length > 0) {
                        endLane = possibleLanes[Math.floor(Math.random() * possibleLanes.length)]
                    }
                }

                // Check for obstacles at Takeoff (startLane) and Landing (endLane)
                const takeoffBlocked = obstacles.some(obs => obs.position[0] === lane && Math.abs(obs.position[2] - z) < 3.0)
                const landingBlocked = obstacles.some(obs => obs.position[0] === endLane && Math.abs(obs.position[2] - (z + jumpDist)) < 3.0)

                if (!takeoffBlocked && !landingBlocked) {
                    for (let i = 0; i < 6; i++) {
                        const progress = i / 5 // 0 to 1
                        const y = Math.sin(progress * Math.PI) * JUMP_HEIGHT + 0.3

                        // Lerp X position for diagonal arc
                        const x = lane + (endLane - lane) * progress

                        const zPos = z + (i * spacing)

                        mins.push({ position: [x, y, zPos], id: Math.random() })
                    }
                    // Advance Z past the arc
                    z += jumpDist + 2
                } else {
                    // Blocked, try ground line instead
                    currentPattern = 0
                }
            }

            if (currentPattern === 0) {
                // GROUND LINE (3 minerals) - Now with Zig-Zag
                // 50% chance to zig-zag
                const zigZag = Math.random() < 0.5
                let currentLane = lane

                for (let i = 0; i < 3; i++) {
                    const zPos = z + (i * 2)

                    if (zigZag && i > 0) {
                        // Try to switch to adjacent lane
                        const possibleLanes = lanes.filter(l => Math.abs(l - currentLane) === 3)
                        if (possibleLanes.length > 0) {
                            const nextLane = possibleLanes[Math.floor(Math.random() * possibleLanes.length)]
                            // Check if next lane is safe
                            const blocked = obstacles.some(obs => obs.position[0] === nextLane && Math.abs(obs.position[2] - zPos) < 3.0)
                            if (!blocked) {
                                currentLane = nextLane
                            }
                        }
                    }

                    // Check obstacle collision (Increased buffer to 3.0)
                    const obstacleHit = obstacles.some(obs => {
                        return obs.position[0] === currentLane && Math.abs(obs.position[2] - zPos) < 3.0
                    })

                    if (!obstacleHit) {
                        mins.push({ position: [currentLane, 0.5, zPos], id: Math.random() })
                    }
                }
                z += 6 + 2
            }
        }
        return mins
    }

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
                const obs = generateObstacles()
                const mins = generateMinerals(obs)
                next.push({
                    z: lastZ - SEGMENT_LENGTH,
                    obstacles: obs,
                    minerals: mins
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
