import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function RobotCharacter({ isJumping, speed, color = "#a855f7" }) { // Default purple
    const group = useRef()
    const leftArm = useRef()
    const rightArm = useRef()
    const leftLeg = useRef()
    const rightLeg = useRef()
    const head = useRef()
    const torso = useRef()

    // --- MATERIALS ---
    // 1. Chrome/Silver for Helmet & Gloves
    const chromeMaterial = useMemo(() => new THREE.MeshStandardMaterial({
        color: "#ffffff",
        roughness: 0.2, // Very shiny
        metalness: 1.0,
        envMapIntensity: 1.0
    }), [])

    // 2. Dark Suit (Leather-like) - Brightened base for visibility
    const suitMaterial = useMemo(() => new THREE.MeshStandardMaterial({
        color: "#505050", // Lighter Grey for better contrast
        roughness: 0.5,
        metalness: 0.3,
    }), [])

    // 3. Neon Piping (Pink Glow as requested)
    const neonMaterial = useMemo(() => new THREE.MeshStandardMaterial({
        color: "#ff00ff", // Hot Pink
        emissive: "#ff00ff",
        emissiveIntensity: 3.0,
        toneMapped: false
    }), [])

    // 4. Black Visor
    const visorMaterial = useMemo(() => new THREE.MeshStandardMaterial({
        color: "#000000",
        roughness: 0.0,
        metalness: 0.8,
    }), [])

    useFrame((state) => {
        if (!group.current) return

        const t = state.clock.elapsedTime
        const runCycle = t * speed * 1.5 // Reduced animation speed

        if (isJumping) {
            group.current.position.y = 0.5
            group.current.rotation.x = 0.2
            leftArm.current.rotation.set(-2, 0, -0.5)
            rightArm.current.rotation.set(-2, 0, 0.5)
            leftLeg.current.rotation.set(-0.5, 0, 0)
            rightLeg.current.rotation.set(-1.0, 0, 0)
        } else {
            const armAmp = 0.8
            const legAmp = 1.2
            group.current.position.y = Math.abs(Math.sin(runCycle)) * 0.1
            group.current.rotation.x = 0.15
            leftArm.current.rotation.x = Math.sin(runCycle) * armAmp
            rightArm.current.rotation.x = Math.sin(runCycle + Math.PI) * armAmp
            leftArm.current.rotation.z = -0.2
            rightArm.current.rotation.z = 0.2
            leftLeg.current.rotation.x = Math.sin(runCycle + Math.PI) * legAmp
            rightLeg.current.rotation.x = Math.sin(runCycle) * legAmp
        }
    })

    return (
        <group ref={group} scale={[1.2, 1.2, 1.2]}>
            {/* Front Light */}
            <pointLight position={[0, 1, 0.5]} intensity={1.5} distance={3} color="#ff00ff" />
            {/* Back Light (Rim Effect) - Bright Pink from behind */}
            <spotLight position={[0, 2, -2]} intensity={5.0} distance={5} color="#ff00ff" angle={1} penumbra={0.5} />

            {/* --- TORSO --- */}
            <group ref={torso} position={[0, 0.4, 0]}>
                {/* Jacket Body */}
                <mesh position={[0, 0.1, 0]} material={suitMaterial}>
                    <boxGeometry args={[0.3, 0.4, 0.18]} />
                </mesh>

                {/* Neon Piping: Zipper/Center Line */}
                <mesh position={[0, 0.1, 0.091]} material={neonMaterial}>
                    <boxGeometry args={[0.02, 0.4, 0.01]} />
                </mesh>
                {/* Neon Piping: Collar/Neck */}
                <mesh position={[0, 0.28, 0]} material={neonMaterial}>
                    <boxGeometry args={[0.2, 0.02, 0.19]} />
                </mesh>
                {/* Neon Piping: Side Ribs */}
                <mesh position={[-0.14, 0.1, 0]} material={neonMaterial}>
                    <boxGeometry args={[0.01, 0.35, 0.1]} />
                </mesh>
                <mesh position={[0.14, 0.1, 0]} material={neonMaterial}>
                    <boxGeometry args={[0.01, 0.35, 0.1]} />
                </mesh>
            </group>

            {/* --- HEAD (Helmet) --- */}
            <group ref={head} position={[0, 0.78, 0]}>
                {/* Main Dome - Chrome */}
                <mesh material={chromeMaterial}>
                    <sphereGeometry args={[0.13, 32, 32]} />
                </mesh>
                {/* Visor - Black Glass */}
                <mesh position={[0, 0.01, 0.08]} rotation={[0.2, 0, 0]} material={visorMaterial}>
                    <boxGeometry args={[0.18, 0.08, 0.1]} />
                </mesh>
                {/* Ear muffs / Tech details */}
                <mesh position={[0.13, 0, 0]} material={suitMaterial}>
                    <cylinderGeometry args={[0.04, 0.04, 0.02]} rotation={[0, 0, Math.PI / 2]} />
                </mesh>
                <mesh position={[-0.13, 0, 0]} material={suitMaterial}>
                    <cylinderGeometry args={[0.04, 0.04, 0.02]} rotation={[0, 0, Math.PI / 2]} />
                </mesh>
            </group>

            {/* --- ARMS --- */}
            <group ref={leftArm} position={[-0.22, 0.6, 0]}>
                {/* Shoulder - suit material (removed neon) */}
                <mesh material={suitMaterial}>
                    <sphereGeometry args={[0.07]} />
                </mesh>
                {/* Upper Arm - suit */}
                <mesh position={[0, -0.15, 0]} material={suitMaterial}>
                    <boxGeometry args={[0.09, 0.25, 0.09]} />
                </mesh>
                {/* Neon Stripe on Arm */}
                <mesh position={[-0.046, -0.15, 0]} material={neonMaterial}>
                    <boxGeometry args={[0.01, 0.25, 0.02]} />
                </mesh>
                {/* Forearm/Lower Arm */}
                <mesh position={[0, -0.4, 0.05]} material={suitMaterial}>
                    <boxGeometry args={[0.08, 0.25, 0.08]} />
                </mesh>
                {/* Glove - Chrome */}
                <mesh position={[0, -0.55, 0.05]} material={chromeMaterial}>
                    <boxGeometry args={[0.09, 0.1, 0.1]} />
                </mesh>
            </group>

            <group ref={rightArm} position={[0.22, 0.6, 0]}>
                {/* Shoulder - suit material (removed neon) */}
                <mesh material={suitMaterial}>
                    <sphereGeometry args={[0.07]} />
                </mesh>
                {/* Upper Arm */}
                <mesh position={[0, -0.15, 0]} material={suitMaterial}>
                    <boxGeometry args={[0.09, 0.25, 0.09]} />
                </mesh>
                {/* Neon Stripe */}
                <mesh position={[0.046, -0.15, 0]} material={neonMaterial}>
                    <boxGeometry args={[0.01, 0.25, 0.02]} />
                </mesh>
                {/* Forearm */}
                <mesh position={[0, -0.4, 0.05]} material={suitMaterial}>
                    <boxGeometry args={[0.08, 0.25, 0.08]} />
                </mesh>
                {/* Glove - Chrome */}
                <mesh position={[0, -0.55, 0.05]} material={chromeMaterial}>
                    <boxGeometry args={[0.09, 0.1, 0.1]} />
                </mesh>
            </group>

            {/* --- LEGS --- */}
            <group ref={leftLeg} position={[-0.1, 0.2, 0]}>
                <mesh material={suitMaterial}>
                    <sphereGeometry args={[0.06]} />
                </mesh>
                {/* Thigh */}
                <mesh position={[0, -0.2, 0]} material={suitMaterial}>
                    <cylinderGeometry args={[0.05, 0.04, 0.35]} />
                </mesh>
                {/* Neon Stripe Side */}
                <mesh position={[-0.05, -0.2, 0]} material={neonMaterial}>
                    <boxGeometry args={[0.01, 0.35, 0.01]} />
                </mesh>
                {/* Shin */}
                <mesh position={[0, -0.5, 0]} material={suitMaterial}>
                    <boxGeometry args={[0.1, 0.35, 0.12]} />
                </mesh>
                {/* Boot - Chrome details? or Black? Let's go black suit boot */}
                <mesh position={[0, -0.7, 0.05]} material={suitMaterial}>
                    <boxGeometry args={[0.09, 0.1, 0.2]} />
                </mesh>
                {/* Neon Sole */}
                <mesh position={[0, -0.75, 0.05]} material={neonMaterial}>
                    <boxGeometry args={[0.095, 0.02, 0.205]} />
                </mesh>
            </group>

            <group ref={rightLeg} position={[0.1, 0.2, 0]}>
                <mesh material={suitMaterial}>
                    <sphereGeometry args={[0.06]} />
                </mesh>
                <mesh position={[0, -0.2, 0]} material={suitMaterial}>
                    <cylinderGeometry args={[0.05, 0.04, 0.35]} />
                </mesh>
                {/* Neon Stripe Side */}
                <mesh position={[0.05, -0.2, 0]} material={neonMaterial}>
                    <boxGeometry args={[0.01, 0.35, 0.01]} />
                </mesh>
                <mesh position={[0, -0.5, 0]} material={suitMaterial}>
                    <boxGeometry args={[0.1, 0.35, 0.12]} />
                </mesh>
                <mesh position={[0, -0.7, 0.05]} material={suitMaterial}>
                    <boxGeometry args={[0.09, 0.1, 0.2]} />
                </mesh>
                {/* Neon Sole */}
                <mesh position={[0, -0.75, 0.05]} material={neonMaterial}>
                    <boxGeometry args={[0.095, 0.02, 0.205]} />
                </mesh>
            </group>
        </group>
    )
}
