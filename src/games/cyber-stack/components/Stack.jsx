import React from 'react'
import { useStore } from '../store'

export default function Stack() {
    const stack = useStore(state => state.stack)

    return (
        <group>
            {stack.map((block, index) => (
                <mesh key={index} position={block.position}>
                    <boxGeometry args={block.size} />
                    <meshStandardMaterial
                        color={block.color}
                        emissive={block.color}
                        emissiveIntensity={0.5}
                        roughness={0.2}
                        metalness={0.8}
                    />
                </mesh>
            ))}
        </group>
    )
}
