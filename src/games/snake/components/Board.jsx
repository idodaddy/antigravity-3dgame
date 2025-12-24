import React from 'react'

export default function Board() {
    const SIZE = 21; // Boundary size
    return (
        <group>
            {/* Floor Grid */}
            <gridHelper args={[20, 20, '#3300aa', '#3300aa']} position={[0, 0, 0]} />

            {/* Floor Glow */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
                <planeGeometry args={[22, 22]} />
                <meshBasicMaterial color="#000022" transparent opacity={0.8} />
            </mesh>

            {/* Boundary Walls - Brighter Neon Pink/Purple */}
            <mesh position={[0, 0.5, -10.5]}>
                <boxGeometry args={[21, 1, 1]} />
                <meshStandardMaterial color="#d946ef" emissive="#d946ef" emissiveIntensity={2} transparent opacity={0.5} toneMapped={false} />
            </mesh>
            <mesh position={[0, 0.5, 10.5]}>
                <boxGeometry args={[21, 1, 1]} />
                <meshStandardMaterial color="#d946ef" emissive="#d946ef" emissiveIntensity={2} transparent opacity={0.5} toneMapped={false} />
            </mesh>
            <mesh position={[-10.5, 0.5, 0]}>
                <boxGeometry args={[1, 1, 21]} />
                <meshStandardMaterial color="#d946ef" emissive="#d946ef" emissiveIntensity={2} transparent opacity={0.5} toneMapped={false} />
            </mesh>
            <mesh position={[10.5, 0.5, 0]}>
                <boxGeometry args={[1, 1, 21]} />
                <meshStandardMaterial color="#d946ef" emissive="#d946ef" emissiveIntensity={2} transparent opacity={0.5} toneMapped={false} />
            </mesh>
        </group>
    )
}
