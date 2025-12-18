import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useStore } from '../store'

export default function ActiveBlock() {
    const activeBlock = useStore(state => state.activeBlock)
    const updateActiveBlock = useStore(state => state.updateActiveBlock)

    useFrame((state) => {
        updateActiveBlock(state.clock.getElapsedTime())
    })

    if (!activeBlock) return null

    return (
        <mesh position={activeBlock.position}>
            <boxGeometry args={activeBlock.size} />
            <meshStandardMaterial
                color={activeBlock.color}
                emissive={activeBlock.color}
                emissiveIntensity={0.8}
                roughness={0.1}
                metalness={0.9}
            />
        </mesh>
    )
}
