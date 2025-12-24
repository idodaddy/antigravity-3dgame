import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Object3D } from 'three'
import { gameRefs } from '../store' // Access global bullets

export default function BulletManager() {
    const meshRef = useRef()

    // We use an InstancedMesh for performance if we had many, 
    // but for <100 bullets, map rendering is fine. 
    // Actually, "Bullet Hell" might have many. Let's try simple mesh mapping first for simplicity of logic.
    // Optimization: We will just update a React state? No, avoid re-renders.
    // We will use a ref to a Group and update children manually? 
    // React-Three-Fiber handles this well if we don't change the React tree structure frequently.

    // Better Approach: 
    // Single geometry, multiple meshes updated in useFrame?
    // Let's stick to the content of gameRefs.bullets.current and render them? 
    // But React won't re-render when that array changes.
    // Solution: We need a component that FORCES updates or uses Instances.

    // Let's loop through gameRefs.bullets and update a hidden pool of meshes?
    // Or simpler: Just render a fixed pool of 50 bullets and cycle them.

    // For this MVP, I will use a simple "Dummy" component that manages the visuals manually 
    // OR just use InstancedMesh.

    // Let's use InstancedMesh. It's the "Right Way" for bullets.
    const playerBulletsRef = useRef()
    const enemyBulletsRef = useRef()
    const MAX_BULLETS = 200
    const tempObj = new Object3D() // Helper

    useFrame((state, delta) => {
        if (!playerBulletsRef.current || !enemyBulletsRef.current) return

        const bullets = gameRefs.bullets.current
        const { height } = state.viewport
        const limitY = height / 2 + 5

        let playerCount = 0
        let enemyCount = 0

        // Update Logic
        for (let i = bullets.length - 1; i >= 0; i--) {
            const b = bullets[i]

            // Move
            b.x += b.vx * delta
            b.y += b.vy * delta

            // Bounds check (Kill if off screen)
            if (b.y > limitY || b.y < -limitY) {
                b.active = false
                bullets.splice(i, 1)
                continue
            }

            // Set Instance Matrix
            tempObj.position.set(b.x, b.y, b.z)
            tempObj.updateMatrix()

            if (b.isPlayer) {
                if (playerCount < MAX_BULLETS) {
                    playerBulletsRef.current.setMatrixAt(playerCount, tempObj.matrix)
                    playerCount++
                }
            } else {
                if (enemyCount < MAX_BULLETS) {
                    enemyBulletsRef.current.setMatrixAt(enemyCount, tempObj.matrix)
                    enemyCount++
                }
            }
        }

        playerBulletsRef.current.count = playerCount
        playerBulletsRef.current.instanceMatrix.needsUpdate = true

        enemyBulletsRef.current.count = enemyCount
        enemyBulletsRef.current.instanceMatrix.needsUpdate = true
    })

    return (
        <group>
            {/* Player Bullets (Purple) */}
            <instancedMesh ref={playerBulletsRef} args={[null, null, MAX_BULLETS]}>
                <sphereGeometry args={[0.15, 8, 8]} />
                <meshBasicMaterial color="#ff00ff" />
            </instancedMesh>

            {/* Enemy Bullets (Orange/Red) */}
            <instancedMesh ref={enemyBulletsRef} args={[null, null, MAX_BULLETS]}>
                <sphereGeometry args={[0.2, 8, 8]} />
                <meshBasicMaterial color="#ffaa00" />
            </instancedMesh>
        </group>
    )
}


