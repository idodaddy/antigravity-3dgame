import React, { useRef } from 'react'
import { useStore } from '../store'
import { useFrame } from '@react-three/fiber'

export default function Food() {
    const food = useStore(state => state.food)
    const ref = useRef()

    useFrame((state) => {
        if (ref.current) {
            const t = state.clock.getElapsedTime()
            ref.current.position.y = 0.5 + Math.sin(t * 5) * 0.2
            ref.current.rotation.y += 0.05
            ref.current.scale.setScalar(0.8 + Math.sin(t * 10) * 0.1)

            // Flashing Color
            ref.current.material.color.setHSL((t * 0.5) % 1, 1, 0.5)
            ref.current.material.emissive.setHSL((t * 0.5) % 1, 1, 0.5)
            ref.current.material.emissiveIntensity = 2 + Math.sin(t * 15) * 1.5
        }
    })

    return (
        <mesh ref={ref} position={[food[0], 0.5, food[1]]}>
            <octahedronGeometry args={[0.7, 0]} />
            <meshStandardMaterial
                toneMapped={false}
            />
            <pointLight distance={3} intensity={2} color="#ffffff" />
        </mesh>
    )
}
