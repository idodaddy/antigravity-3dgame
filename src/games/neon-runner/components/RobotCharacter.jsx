import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'

export default function RobotCharacter({ isJumping, speed }) {
    const group = useRef()

    // Refs for hierarchical animation
    const leftUpperArm = useRef()
    const leftForearm = useRef()
    const rightUpperArm = useRef()
    const rightForearm = useRef()

    const leftThigh = useRef()
    const leftShin = useRef()
    const rightThigh = useRef()
    const rightShin = useRef()

    const head = useRef()
    const torso = useRef()

    // --- MATERIALS ---
    const whiteArmorMat = useMemo(() => new THREE.MeshStandardMaterial({
        color: "#FFFFFF", // Pure White
        roughness: 0.3,
        metalness: 0.1,
    }), [])

    const blackInnerMat = useMemo(() => new THREE.MeshStandardMaterial({
        color: "#151515",
        roughness: 0.7,
        metalness: 0.2,
    }), [])

    const visorMat = useMemo(() => new THREE.MeshStandardMaterial({
        color: "#252525",
        roughness: 0.2,
        metalness: 0.8,
        envMapIntensity: 1.5
    }), [])

    const neonBlueMat = useMemo(() => new THREE.MeshStandardMaterial({
        color: "#00FFFF",
        emissive: "#00FFFF",
        emissiveIntensity: 3.0,
        toneMapped: false
    }), [])

    useFrame((state) => {
        if (!group.current) return

        const t = state.clock.elapsedTime
        const runCycle = t * speed * 1.2

        if (isJumping) {
            // --- JUMP POSE (Dynamic X / Hang Style) ---
            // Body: Arch back significantly, Face forward (180 deg)
            group.current.position.y = 0.6
            group.current.rotation.set(0.4, Math.PI, 0) // Lean back ~23 deg

            // Head: Look up/forward (compensate for lean)
            if (head.current) head.current.rotation.set(-0.3, 0, 0)

            // Arms: Spread Out & Back (Dynamic X)
            // Left Arm: Back (-0.5) and Out (-2.3)
            leftUpperArm.current.rotation.set(-0.5, 0, -2.3)
            // Right Arm: Back (-0.5) and Out (2.3)
            rightUpperArm.current.rotation.set(-0.5, 0, 2.3)

            // Forearms: Slight bend for natural feel
            leftForearm.current.rotation.set(-0.2, 0, 0)
            rightForearm.current.rotation.set(-0.2, 0, 0)

            // Legs: Spread Out & Back (Dynamic X)
            // Left Leg: Back (-0.5) and Out (-0.6)
            leftThigh.current.rotation.set(-0.5, 0, -0.6)
            // Right Leg: Back (-0.5) and Out (0.6)
            rightThigh.current.rotation.set(-0.5, 0, 0.6)

            // Shins: Bend knees back (Hang style)
            leftShin.current.rotation.set(1.2, 0, 0)
            rightShin.current.rotation.set(1.2, 0, 0)

        } else {
            // --- RUN CYCLE ---
            // Body: Bobbing, Lean forward (10 deg = 0.17 rad), Face forward
            group.current.position.y = Math.abs(Math.sin(runCycle)) * 0.08
            group.current.rotation.set(0.17, Math.PI, 0)

            // Head: Reset
            if (head.current) head.current.rotation.set(0, 0, 0)

            // Arms: Swing X, Reset Y/Z
            const armAmp = 0.8
            leftUpperArm.current.rotation.set(Math.sin(runCycle) * armAmp, 0, 0)
            rightUpperArm.current.rotation.set(Math.sin(runCycle + Math.PI) * armAmp, 0, 0)

            // Forearms: Dynamic Bend X, Reset Y/Z
            // Natural bend: -1.2 base, plus dynamic bend when swinging up
            const leftArmPhase = Math.sin(runCycle)
            const rightArmPhase = Math.sin(runCycle + Math.PI)
            leftForearm.current.rotation.set(-1.2 + (leftArmPhase > 0 ? -0.5 * leftArmPhase : 0), 0, 0)
            rightForearm.current.rotation.set(-1.2 + (rightArmPhase > 0 ? -0.5 * rightArmPhase : 0), 0, 0)

            // Legs: Swing X, Reset Y/Z
            const legAmp = 1.0
            leftThigh.current.rotation.set(Math.sin(runCycle + Math.PI) * legAmp, 0, 0)
            rightThigh.current.rotation.set(Math.sin(runCycle) * legAmp, 0, 0)

            // Shins: Realistic Knee Gait
            // Function: 0.8 + 0.6*cos(t) + 0.6*cos(2t) + 0.2*sin(t)
            const getKneeAngle = (t) => {
                const val = 0.8 + 0.6 * Math.cos(t) + 0.6 * Math.cos(2 * t) + 0.2 * Math.sin(t)
                return Math.max(0, val)
            }

            // Left Leg Phase: runCycle + PI
            leftShin.current.rotation.set(getKneeAngle(runCycle + Math.PI), 0, 0)
            // Right Leg Phase: runCycle
            rightShin.current.rotation.set(getKneeAngle(runCycle), 0, 0)
        }
    })

    return (
        <group ref={group} scale={[1.1, 1.1, 1.1]}>
            {/* --- TORSO --- */}
            <group ref={torso} position={[0, 0.45, 0]}>
                {/* Abdomen */}
                <mesh position={[0, -0.12, 0]} material={blackInnerMat}>
                    <RoundedBox args={[0.2, 0.25, 0.12]} radius={0.04} smoothness={4} />
                </mesh>

                {/* Chest */}
                <mesh position={[0, 0.15, 0]} material={whiteArmorMat}>
                    <RoundedBox args={[0.32, 0.28, 0.16]} radius={0.05} smoothness={4} />
                </mesh>

                {/* Upper Chest */}
                <mesh position={[0, 0.28, 0]} material={whiteArmorMat}>
                    <RoundedBox args={[0.34, 0.08, 0.14]} radius={0.02} smoothness={4} />
                </mesh>
            </group>

            {/* --- HEAD --- */}
            <group ref={head} position={[0, 0.85, 0]}>
                <mesh position={[0, -0.08, 0]} material={blackInnerMat}>
                    <cylinderGeometry args={[0.045, 0.054, 0.1, 16]} />
                </mesh>

                {/* Head - 10% Smaller */}
                <RoundedBox args={[0.16, 0.20, 0.18]} radius={0.07} smoothness={8} position={[0, 0.08, 0]} material={whiteArmorMat} />

                {/* Visor - 10% Smaller */}
                <mesh position={[0, 0.08, 0.08]} material={visorMat}>
                    <RoundedBox args={[0.135, 0.16, 0.05]} radius={0.035} smoothness={4} />
                </mesh>

                {/* Forehead Neon */}
                <mesh position={[0, 0.15, 0.095]} rotation={[0, 0, 0]} material={neonBlueMat}>
                    <boxGeometry args={[0.10, 0.015, 0.02]} />
                </mesh>

                {/* Side Neon (Ears) */}
                <mesh position={[0.085, 0.08, 0]} material={neonBlueMat}>
                    <boxGeometry args={[0.01, 0.12, 0.02]} />
                </mesh>
                <mesh position={[-0.085, 0.08, 0]} material={neonBlueMat}>
                    <boxGeometry args={[0.01, 0.12, 0.02]} />
                </mesh>
            </group>

            {/* --- ARMS --- */}
            {/* Left Arm */}
            <group ref={leftUpperArm} position={[-0.22, 0.72, 0]}>
                {/* Shoulder Cap (Integrated) */}
                <mesh position={[0, 0, 0]} material={whiteArmorMat}>
                    <RoundedBox args={[0.08, 0.12, 0.12]} radius={0.04} smoothness={4} />
                </mesh>

                {/* Upper Arm Bone - White (5% Shorter: 0.25 -> 0.2375) */}
                <mesh position={[0, -0.144, 0]} material={whiteArmorMat}>
                    <cylinderGeometry args={[0.045, 0.035, 0.2375, 16]} />
                </mesh>
                <mesh position={[-0.04, -0.15, 0]} material={neonBlueMat}>
                    <boxGeometry args={[0.02, 0.15, 0.02]} />
                </mesh>

                <group position={[0, -0.268, 0]}>
                    <mesh material={blackInnerMat} scale={[0.8, 0.8, 0.8]}>
                        <sphereGeometry args={[0.04]} />
                    </mesh>

                    <group ref={leftForearm}>
                        <mesh position={[0, -0.134, 0]} material={whiteArmorMat}>
                            <cylinderGeometry args={[0.045, 0.035, 0.2375, 16]} />
                        </mesh>
                        {/* Hand - 10% Larger */}
                        <mesh position={[0, -0.308, 0]} rotation={[0, Math.PI / 4, 0]} material={whiteArmorMat}>
                            <cylinderGeometry args={[0.039, 0.033, 0.18, 4]} />
                        </mesh>
                    </group>
                </group>
            </group>

            {/* Right Arm */}
            <group ref={rightUpperArm} position={[0.22, 0.72, 0]}>
                <mesh position={[0, 0, 0]} material={whiteArmorMat}>
                    <RoundedBox args={[0.08, 0.12, 0.12]} radius={0.04} smoothness={4} />
                </mesh>

                {/* Upper Arm Bone - White (5% Shorter) */}
                <mesh position={[0, -0.144, 0]} material={whiteArmorMat}>
                    <cylinderGeometry args={[0.045, 0.035, 0.2375, 16]} />
                </mesh>
                <mesh position={[0.04, -0.15, 0]} material={neonBlueMat}>
                    <boxGeometry args={[0.02, 0.15, 0.02]} />
                </mesh>

                <group position={[0, -0.268, 0]}>
                    <mesh material={blackInnerMat} scale={[0.8, 0.8, 0.8]}>
                        <sphereGeometry args={[0.04]} />
                    </mesh>

                    <group ref={rightForearm}>
                        <mesh position={[0, -0.134, 0]} material={whiteArmorMat}>
                            <cylinderGeometry args={[0.045, 0.035, 0.2375, 16]} />
                        </mesh>
                        {/* Hand - 10% Larger */}
                        <mesh position={[0, -0.308, 0]} rotation={[0, Math.PI / 4, 0]} material={whiteArmorMat}>
                            <cylinderGeometry args={[0.039, 0.033, 0.18, 4]} />
                        </mesh>
                    </group>
                </group>
            </group>

            {/* --- LEGS --- */}
            {/* Left Leg */}
            <group ref={leftThigh} position={[-0.1, 0.3, 0]}>
                <mesh material={blackInnerMat}>
                    <sphereGeometry args={[0.06]} />
                </mesh>

                <mesh position={[0, -0.18, 0]} material={whiteArmorMat}>
                    <cylinderGeometry args={[0.08, 0.06, 0.35, 16]} />
                </mesh>
                <mesh position={[-0.055, -0.18, 0]} material={neonBlueMat}>
                    <boxGeometry args={[0.02, 0.2, 0.02]} />
                </mesh>

                <group position={[0, -0.38, 0]}>
                    <mesh material={blackInnerMat}>
                        <sphereGeometry args={[0.055]} />
                    </mesh>

                    <group ref={leftShin}>
                        <mesh position={[0, -0.18, 0]} material={whiteArmorMat}>
                            <cylinderGeometry args={[0.06, 0.045, 0.35, 16]} />
                        </mesh>

                        {/* Foot - Tapered Box */}
                        <group position={[0, -0.42, 0.05]}>
                            <mesh rotation={[Math.PI / 2, Math.PI / 4, 0]} material={whiteArmorMat}>
                                <cylinderGeometry args={[0.05, 0.03, 0.22, 4]} />
                            </mesh>
                        </group>
                    </group>
                </group>
            </group>

            {/* Right Leg */}
            <group ref={rightThigh} position={[0.1, 0.3, 0]}>
                <mesh material={blackInnerMat}>
                    <sphereGeometry args={[0.06]} />
                </mesh>

                <mesh position={[0, -0.18, 0]} material={whiteArmorMat}>
                    <cylinderGeometry args={[0.08, 0.06, 0.35, 16]} />
                </mesh>
                <mesh position={[0.055, -0.18, 0]} material={neonBlueMat}>
                    <boxGeometry args={[0.02, 0.2, 0.02]} />
                </mesh>

                <group position={[0, -0.38, 0]}>
                    <mesh material={blackInnerMat}>
                        <sphereGeometry args={[0.055]} />
                    </mesh>

                    <group ref={rightShin}>
                        <mesh position={[0, -0.18, 0]} material={whiteArmorMat}>
                            <cylinderGeometry args={[0.06, 0.045, 0.35, 16]} />
                        </mesh>

                        {/* Foot - Tapered Box */}
                        <group position={[0, -0.42, 0.05]}>
                            <mesh rotation={[Math.PI / 2, Math.PI / 4, 0]} material={whiteArmorMat}>
                                <cylinderGeometry args={[0.05, 0.03, 0.22, 4]} />
                            </mesh>
                        </group>
                    </group>
                </group>
            </group>
        </group>
    )
}
