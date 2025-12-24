import React, { useRef, useState, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { gameRefs } from '../store'
import * as THREE from 'three'

function ExplosionParticles({ instances }) {
    const meshRef = useRef()
    const dummy = useMemo(() => new THREE.Object3D(), [])

    useFrame((state, delta) => {
        if (!meshRef.current) return
        let count = 0

        // Iterate through active particles
        for (let i = instances.length - 1; i >= 0; i--) {
            const p = instances[i]
            p.life -= delta * 2 // Fade out speed

            if (p.life <= 0) {
                instances.splice(i, 1)
                continue
            }

            p.x += p.vx * delta
            p.y += p.vy * delta
            p.z += p.vz * delta

            // Expand and fade
            dummy.position.set(p.x, p.y, p.z)
            const scale = p.life * p.size
            dummy.scale.set(scale, scale, scale)
            dummy.updateMatrix()

            meshRef.current.setMatrixAt(count, dummy.matrix)
            // Color can be handled if we use instanceColor, but minimal is fine for now
            count++
        }

        meshRef.current.count = count
        meshRef.current.instanceMatrix.needsUpdate = true
    })

    return (
        <instancedMesh ref={meshRef} args={[null, null, 1000]}>
            <sphereGeometry args={[0.2, 4, 4]} />
            <meshBasicMaterial color="#ffaa00" toneMapped={false} />
        </instancedMesh>
    )
}

export default function EffectManager() {
    const [floatingTexts, setFloatingTexts] = useState([]) // { id, text, x, y, z, createdAt }

    // Imperative particle system to avoid React overhead for 1000s of particles
    const particles = useRef([])

    // Helper to add particles
    const spawnExplosion = (x, y, z, color) => {
        for (let i = 0; i < 8; i++) {
            particles.current.push({
                x, y, z,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                vz: (Math.random() - 0.5) * 10,
                life: 1.0,
                size: 0.5 + Math.random() * 0.5
            })
        }
    }

    useFrame((state, delta) => {
        // 1. Process Event Queue
        const events = gameRefs.events.current
        if (events.length > 0) {
            // Process all events
            while (events.length > 0) {
                const e = events.shift()
                if (e.type === 'EXPLOSION') {
                    spawnExplosion(e.x, e.y, e.z)
                } else if (e.type === 'SCORE') {
                    // Add Floating Text
                    setFloatingTexts(prev => [
                        ...prev,
                        { id: Math.random(), text: `+${e.value}`, x: e.x, y: e.y, z: e.z, createdAt: Date.now() }
                    ])
                }
            }
        }
    })

    // Auto-cleanup floating texts
    React.useEffect(() => {
        if (floatingTexts.length === 0) return

        // Remove items older than 600ms
        const timer = setTimeout(() => {
            const now = Date.now()
            setFloatingTexts(prev => prev.filter(t => now - t.createdAt < 600))
        }, 100)

        return () => clearTimeout(timer)
    }, [floatingTexts])

    return (
        <group>
            {/* Particles */}
            <ExplosionParticles instances={particles.current} />

            {/* Floating Texts */}
            {floatingTexts.map(t => (
                <Html key={t.id} position={[t.x, t.y, t.z]} center style={{ pointerEvents: 'none' }}>
                    <div className="text-yellow-400 font-bold text-2xl animate-float-up drop-shadow-[0_0_10px_rgba(255,255,0,0.8)]"
                        style={{ textShadow: '0 0 10px yellow' }}>
                        {t.text}
                    </div>
                </Html>
            ))}
        </group>
    )
}
