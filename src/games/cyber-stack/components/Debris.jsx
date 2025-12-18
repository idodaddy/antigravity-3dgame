import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useStore } from '../store'

function DebrisItem({ data }) {
    const mesh = useRef()

    useFrame(() => {
        if (mesh.current) {
            mesh.current.position.y -= 0.1
            mesh.current.rotation.x += 0.05
            mesh.current.rotation.z += 0.05
        }
    })

    return (
        <mesh ref={mesh} position={data.position}>
            <boxGeometry args={data.size} />
            <meshStandardMaterial
                color={data.color}
                transparent
                opacity={0.8}
            />
        </mesh>
    )
}

export default function Debris() {
    const debris = useStore(state => state.debris)

    return (
        <group>
            {debris.map((item, index) => (
                <DebrisItem key={index} data={item} />
            ))}
        </group>
    )
}
