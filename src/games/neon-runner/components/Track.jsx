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

// Star Shape Definition
const starShape = new THREE.Shape()
const pts = 5
const outerRadius = 0.4
const innerRadius = 0.2
for (let i = 0; i < pts * 2; i++) {
    const r = i % 2 === 0 ? outerRadius : innerRadius
    const a = (i / (pts * 2)) * Math.PI * 2
    const x = Math.cos(a) * r
    const y = Math.sin(a) * r
    if (i === 0) starShape.moveTo(x, y)
    else starShape.lineTo(x, y)
}
starShape.closePath()

const starExtrudeSettings = {
    depth: 0.1,
    bevelEnabled: true,
    bevelThickness: 0.02,
    bevelSize: 0.02,
    bevelSegments: 2
}

function Mineral({ position, type }) {
    const mesh = useRef()
    const halo = useRef()
    const isHigh = position[1] > 1.0
    const isStar = type === 'star'
    const color = isStar ? "#ffff00" : "#00ffff" // Yellow for star, Cyan for min

    useFrame((state, delta) => {
        if (mesh.current) {
            // Rotate around Vertical Axis (Y)
            mesh.current.rotation.y += delta * 2

            // Bobbing
            const t = state.clock.elapsedTime
            const bob = Math.sin(t * 3) * 0.1
            mesh.current.position.y = position[1] + bob

            // Halo Pulse
            if (halo.current) {
                halo.current.rotation.z -= delta // Counter-rotate halo
                const scale = 1 + Math.sin(t * 5) * 0.1
                halo.current.scale.set(scale, scale, scale)
            }
        }
    })

    return (
        <group position={[position[0], 0, position[2]]}>
            {/* The Mineral Itself */}
            <group ref={mesh} position={[0, position[1], 0]}>
                {isStar ? (
                    <group rotation={[0, 0, 0]}> {/* Stand upright (X-Y plane) */}
                        {/* Star Body */}
                        <mesh position={[0, 0, -0.05]}> {/* Center depth */}
                            <extrudeGeometry args={[starShape, starExtrudeSettings]} />
                            <meshStandardMaterial color="#ffff00" emissive="#ffff00" emissiveIntensity={1.0} />
                        </mesh>

                        {/* Neon Halo */}
                        <mesh ref={halo}>
                            <torusGeometry args={[0.6, 0.02, 8, 32]} />
                            <meshBasicMaterial color="#ffff00" transparent opacity={0.5} />
                        </mesh>
                    </group>
                ) : (
                    <mesh castShadow>
                        <octahedronGeometry args={[0.3, 0]} />
                        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} />
                    </mesh>
                )}
            </group>

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
                <Mineral key={`min-${i}`} position={min.position} type={min.type} />
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
    const [startTime, setStartTime] = useState(0)

    const createInitialSegments = () => {
        const initial = []
        nextSpawnOffset.current = 0
        // Use current speed or fallback to BASE_SPEED (10) if store not yet ready
        const currentSpeed = speed > 0 ? speed : BASE_SPEED

        // Create 10 segments total
        for (let i = 0; i < 10; i++) {
            // First 3 segments (0 to -60) are empty for safe start (approx 4 seconds at 15 speed)
            if (i < 3) {
                initial.push({ z: -i * SEGMENT_LENGTH, obstacles: [], minerals: [] })
                continue
            }

            // Generate content for the rest immediately
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

    // Reset segments when game stops (reset) or starts
    React.useEffect(() => {
        if (gameStarted) {
            setStartTime(Date.now())
        } else {
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

                let obstacles = []
                let minerals = []

                // GENERATION SYNC
                // Delay spawning by 3.5 seconds
                if (Date.now() - startTime > 3500) {
                    // Fallback to BASE_SPEED if speed is invalid/0 to prevent infinite NaN loops
                    const currentSpeed = (speed && speed > 0) ? speed : BASE_SPEED
                    const content = createSegmentContent(nextSpawnOffset.current, currentSpeed)
                    obstacles = content.obstacles
                    minerals = content.minerals
                    nextSpawnOffset.current = content.nextOffset
                }

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
                        // dz is minZ (relative to player at 0)

                        const dx = min.position[0] - playerX
                        const dy = min.position[1] - playerY
                        const distSq = dx * dx + dy * dy + minZ * minZ

                        // Collection radius ~0.8
                        if (distSq < 0.8 * 0.8) {
                            // Collected!
                            const points = min.type === 'star' ? 5 : 1
                            collectMineral(points)
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
