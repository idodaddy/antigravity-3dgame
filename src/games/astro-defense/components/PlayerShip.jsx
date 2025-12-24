import React, { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useStore, gameRefs } from '../store'
import { playLaserSound, playDamageSound } from '../audio'

export default function PlayerShip() {
    const ref = useRef()
    const { viewport } = useThree()
    const gameStarted = useStore(state => state.gameStarted)
    const gameOver = useStore(state => state.gameOver)
    const takeDamage = useStore(state => state.takeDamage)

    // Weapon vars
    const lastShotTime = useRef(0)
    const FIRE_RATE = 0.2 // Seconds

    const spawnBullet = (x, y, z) => {
        playLaserSound()
        // Add to global bullets array
        gameRefs.bullets.current.push({
            id: Date.now() + Math.random(),
            x: x,
            y: y + 1, // Start slightly above ship
            z: z,
            vx: 0,
            vy: 20, // Speed up
            vz: 0,
            isPlayer: true,
            active: true
        })
    }

    useFrame((state) => {
        if (!ref.current) return

        // 1. Movement: Follow pointer X (clamped)
        // Convert pointer normalized coords (-1 to 1) to world units
        const targetX = (state.pointer.x * viewport.width) / 2

        // Lerp for smoothness
        ref.current.position.x += (targetX - ref.current.position.x) * 0.2

        // Clamp to screen bounds (offset by ship width approx 1)
        const limit = (viewport.width / 2) - 1
        ref.current.position.x = Math.max(-limit, Math.min(limit, ref.current.position.x))

        // Update global ref for collision
        if (gameRefs.player.current) {
            gameRefs.player.current.position.copy(ref.current.position)
        }

        // Tilt effect
        ref.current.rotation.z = (ref.current.position.x - targetX) * -0.5

        // 2. Auto-Fire
        if (gameStarted && !gameOver) {
            if (state.clock.elapsedTime - lastShotTime.current > FIRE_RATE) {
                spawnBullet(ref.current.position.x, ref.current.position.y, ref.current.position.z)
                lastShotTime.current = state.clock.elapsedTime
            }
        }

        // 3. Collision with Enemy Bullets
        // Only check if playing
        if (gameStarted && !gameOver) {
            const bullets = gameRefs.bullets.current
            for (let i = 0; i < bullets.length; i++) {
                const b = bullets[i]
                if (!b.active || b.isPlayer) continue

                const dx = b.x - ref.current.position.x
                const dy = b.y - ref.current.position.y
                const dist = Math.sqrt(dx * dx + dy * dy)

                if (dist < 1.0) { // Hit radius
                    // Hit!
                    b.active = false
                    takeDamage()
                    playDamageSound()

                    // Events for visual flair
                    gameRefs.events.current.push({ type: 'EXPLOSION', x: b.x, y: b.y, z: b.z })

                    // Break to avoid multi-hit in same frame
                    break;
                }
            }
        }
    })

    // Init global ref
    useEffect(() => {
        gameRefs.player.current = ref.current
    }, [])

    return (
        <group ref={ref} position={[0, -6, 0]}>
            {/* Ship Body */}
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
                <coneGeometry args={[0.8, 2, 4]} />
                <meshStandardMaterial color="#00ffff" emissive="#0088aa" emissiveIntensity={2} wireframe />
            </mesh>
            {/* Engine Glow */}
            <pointLight position={[0, -1, 0]} color="#00ffff" distance={3} decay={2} />
        </group>
    )
}
