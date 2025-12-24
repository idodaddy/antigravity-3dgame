import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Object3D, Color } from 'three'
import { useStore, gameRefs } from '../store'
import { playExplosionSound, playDamageSound } from '../audio'

export default function EnemyManager() {
    const standardRef = useRef()
    const eliteRef = useRef()
    const { addScore, takeDamage, gameStarted, gameOver } = useStore()

    // Config
    const MAX_ENEMIES = 50
    const SPAWN_RATE = 1.0 // Seconds
    const lastSpawnTime = useRef(0)
    const tempObj = useMemo(() => new Object3D(), [])

    useFrame((state, delta) => {
        if (!standardRef.current || !eliteRef.current) return
        if (gameOver) return

        const now = state.clock.elapsedTime
        const enemies = gameRefs.enemies.current
        const bullets = gameRefs.bullets.current
        const playerPos = gameRefs.player.current?.position
        const { width, height } = state.viewport

        // 1. Spawning
        if (gameStarted && now - lastSpawnTime.current > SPAWN_RATE) {
            if (enemies.length < MAX_ENEMIES) {
                const spawnWidth = Math.min(width * 0.7, 15)
                const isElite = Math.random() > 0.8 // 20% chance

                enemies.push({
                    x: (Math.random() - 0.5) * spawnWidth,
                    y: height / 2 + 2,
                    z: 0,
                    speed: (isElite ? 6 : 3) + Math.random() * 2,
                    type: isElite ? 'elite' : 'standard',
                    hp: isElite ? 2 : 1,
                    active: true,
                    startX: 0,
                    timeOffset: Math.random() * 10,
                    lastShot: 0
                })
                enemies[enemies.length - 1].startX = enemies[enemies.length - 1].x
                lastSpawnTime.current = now
            }
        }

        let standardCount = 0
        let eliteCount = 0

        // 2. Update & Collision
        for (let i = enemies.length - 1; i >= 0; i--) {
            const e = enemies[i]

            e.y -= e.speed * delta
            // Dynamic movement
            e.x = e.startX + Math.sin(now * 3 + e.timeOffset) * (e.type === 'elite' ? 3 : 1.5)

            // Shooting for Elite
            if (e.type === 'elite') {
                // Rate: 1.0 (2x often), Speed: 5.5 (30% slower)
                if (now - e.lastShot > 1.0 && e.y < height / 2 && e.y > -height / 2) {
                    gameRefs.bullets.current.push({
                        x: e.x,
                        y: e.y - 1,
                        z: e.z,
                        vx: 0,
                        vy: -5.5,
                        isPlayer: false,
                        active: true
                    })
                    e.lastShot = now
                }
            }

            // Despawn
            if (e.y < -height / 2 - 2) {
                e.active = false
                enemies.splice(i, 1)
                continue
            }

            if (playerPos) {
                const dx = e.x - playerPos.x
                const dy = e.y - playerPos.y
                const dist = Math.sqrt(dx * dx + dy * dy)
                if (dist < 1.0) { // Tighter collision
                    enemies.splice(i, 1)
                    takeDamage()
                    playDamageSound()
                    gameRefs.events.current.push({ type: 'EXPLOSION', x: e.x, y: e.y, z: e.z })
                    continue
                }
            }

            let hit = false
            for (let j = bullets.length - 1; j >= 0; j--) {
                const b = bullets[j]
                if (!b.active || !b.isPlayer) continue

                const dx = e.x - b.x
                const dy = e.y - b.y
                const dist = Math.sqrt(dx * dx + dy * dy)
                const hitRadius = e.type === 'elite' ? 0.8 : 0.6

                if (dist < hitRadius) {
                    b.active = false

                    e.hp--
                    if (e.hp <= 0) {
                        const points = e.type === 'elite' ? 5 : 1
                        addScore(points)
                        playExplosionSound()

                        gameRefs.events.current.push({ type: 'EXPLOSION', x: e.x, y: e.y, z: e.z })
                        gameRefs.events.current.push({ type: 'SCORE', value: points, x: e.x, y: e.y, z: e.z })

                        hit = true
                    }
                    break
                }
            }

            if (hit) {
                enemies.splice(i, 1)
                continue
            }

            // Render Update
            tempObj.position.set(e.x, e.y, e.z)
            tempObj.rotation.x = Math.PI
            tempObj.rotation.z = Math.sin(now * 10 + e.timeOffset) * 0.2

            if (e.type === 'elite') {
                if (eliteCount < MAX_ENEMIES) {
                    const scale = 0.6
                    tempObj.scale.set(scale, scale, scale)
                    tempObj.updateMatrix()
                    eliteRef.current.setMatrixAt(eliteCount, tempObj.matrix)
                    eliteCount++
                }
            } else {
                if (standardCount < MAX_ENEMIES) {
                    const scale = 0.4
                    tempObj.scale.set(scale, scale, scale)
                    tempObj.updateMatrix()
                    standardRef.current.setMatrixAt(standardCount, tempObj.matrix)
                    standardCount++
                }
            }
        }

        standardRef.current.count = standardCount
        standardRef.current.instanceMatrix.needsUpdate = true

        eliteRef.current.count = eliteCount
        eliteRef.current.instanceMatrix.needsUpdate = true
    })

    return (
        <group>
            {/* Standard Enemies (Red) */}
            <instancedMesh ref={standardRef} args={[null, null, MAX_ENEMIES]}>
                <coneGeometry args={[1, 2, 4]} />
                <meshStandardMaterial
                    color="#ff0000"
                    emissive="#ff0000"
                    emissiveIntensity={2}
                    toneMapped={false}
                />
            </instancedMesh>

            {/* Elite Enemies (Gold) */}
            <instancedMesh ref={eliteRef} args={[null, null, MAX_ENEMIES]}>
                <coneGeometry args={[1, 2, 4]} />
                <meshStandardMaterial
                    color="#ffd700"
                    emissive="#ffd700"
                    emissiveIntensity={2}
                    toneMapped={false}
                />
            </instancedMesh>
        </group>
    )
}
