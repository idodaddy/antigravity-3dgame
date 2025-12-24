import React, { useRef, useEffect } from 'react'
import { useStore } from '../store'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function EatEffect() {
    const score = useStore(state => state.score)
    const prevScore = useRef(score)
    const particles = useRef([])
    const group = useRef()

    useEffect(() => {
        if (score > prevScore.current) {
            // Spawn particles
            const foodPos = useStore.getState().snake[0]; // Approximate at head
            for (let i = 0; i < 20; i++) {
                particles.current.push({
                    position: new THREE.Vector3(foodPos[0], 0.5, foodPos[1]),
                    velocity: new THREE.Vector3((Math.random() - 0.5) * 0.5, Math.random() * 0.5, (Math.random() - 0.5) * 0.5),
                    life: 1.0,
                    color: new THREE.Color().setHSL(Math.random(), 1, 0.5)
                })
            }
        }
        prevScore.current = score
    }, [score])

    useFrame((state, delta) => {
        if (!group.current) return

        // Clear previous meshes
        group.current.clear()

        // Update and render particles
        for (let i = particles.current.length - 1; i >= 0; i--) {
            const p = particles.current[i]
            p.life -= delta * 2
            p.position.add(p.velocity)
            p.velocity.y -= delta * 1 // Gravity

            if (p.life <= 0) {
                particles.current.splice(i, 1)
                continue
            }

            const mesh = new THREE.Mesh(
                new THREE.BoxGeometry(0.2, 0.2, 0.2),
                new THREE.MeshBasicMaterial({ color: p.color, transparent: true, opacity: p.life })
            )
            mesh.position.copy(p.position)
            group.current.add(mesh)
        }
    })

    return <group ref={group} />
}
