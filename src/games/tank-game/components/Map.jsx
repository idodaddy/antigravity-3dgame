import React, { useMemo, useEffect } from 'react'
import { useStore, gameRefs } from '../store'

const GRID_SIZE = 4
const MAP_SIZE = 50

const generateMap = (seed, level) => {
    const random = (x, y) => {
        const val = Math.sin(x * 12.9898 + y * 78.233 + seed) * 43758.5453
        return val - Math.floor(val)
    }

    const barriers = []

    // Bounds (Thick walls)
    const T = 2
    const H = MAP_SIZE / 2 + T / 2

    // Top/Bottom (Z-axis)
    barriers.push({ x: 0, z: -H, width: MAP_SIZE + T * 2, depth: T, type: 'border' })
    barriers.push({ x: 0, z: H, width: MAP_SIZE + T * 2, depth: T, type: 'border' })
    // Left/Right (X-axis)
    barriers.push({ x: -H, z: 0, width: T, depth: MAP_SIZE, type: 'border' })
    barriers.push({ x: H, z: 0, width: T, depth: MAP_SIZE, type: 'border' })

    for (let x = -MAP_SIZE / 2; x < MAP_SIZE / 2; x += GRID_SIZE) {
        for (let z = -MAP_SIZE / 2; z < MAP_SIZE / 2; z += GRID_SIZE) {
            // Keep center clear (spawn area)
            if (Math.abs(x) < 8 && Math.abs(z) < 8) continue

            // Random generation logic
            if (random(x, z) > 0.82 - (level * 0.02)) {
                // Determine type
                const rType = random(x, z + 1)
                let type = 'cube'
                let width = GRID_SIZE - 0.5
                let depth = GRID_SIZE - 0.5

                if (rType > 0.6) {
                    // Horizontal Wall
                    type = 'wall_h'
                    width = GRID_SIZE * 2 - 0.5
                    depth = 1
                } else if (rType > 0.3) {
                    // Vertical Wall
                    type = 'wall_v'
                    width = 1
                    depth = GRID_SIZE * 2 - 0.5
                }

                // Offset center
                const cx = x + GRID_SIZE / 2
                const cz = z + GRID_SIZE / 2

                barriers.push({ x: cx, z: cz, width, depth, type })
            }
        }
    }
    return barriers
}

export default function Map() {
    const { level, mapSeed } = useStore()

    const barriers = useMemo(() => generateMap(mapSeed, level), [mapSeed, level])

    useEffect(() => {
        // Expose barriers for manual collision detection
        // Format: { minX, maxX, minZ, maxZ } for fast AABB
        gameRefs.barriers.current = barriers.map(b => ({
            ...b,
            minX: b.x - b.width / 2,
            maxX: b.x + b.width / 2,
            minZ: b.z - b.depth / 2,
            maxZ: b.z + b.depth / 2
        }))
    }, [barriers])

    return (
        <group>
            {/* Floor */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
                <planeGeometry args={[100, 100]} />
                <meshStandardMaterial color="#111" />
            </mesh>

            <gridHelper args={[100, 50, '#00ffff', '#222']} position={[0, 0.01, 0]} />

            {/* Render Barriers */}
            {barriers.map((b, i) => (
                <group key={i} position={[b.x, 1, b.z]}>
                    <mesh castShadow receiveShadow>
                        <boxGeometry args={[b.width, 2, b.depth]} />
                        <meshStandardMaterial
                            color={b.type === 'border' ? '#444' : '#222'}
                            emissive={b.type === 'border' ? '#000' : (b.type === 'cube' ? '#00aaaa' : '#0044aa')}
                            emissiveIntensity={0.2}
                        />
                    </mesh>
                    {/* Wireframe Glow */}
                    <mesh>
                        <boxGeometry args={[b.width + 0.1, 2.1, b.depth + 0.1]} />
                        <meshBasicMaterial
                            wireframe
                            color={b.type === 'border' ? 'red' : 'cyan'}
                            opacity={0.3}
                            transparent
                        />
                    </mesh>
                </group>
            ))}
        </group>
    )
}
