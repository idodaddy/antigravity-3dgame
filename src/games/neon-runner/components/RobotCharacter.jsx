import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'

// Helper to lerp Euler rotations
const lerpRot = (current, targetX, targetY, targetZ, alpha) => {
    current.x = THREE.MathUtils.lerp(current.x, targetX, alpha)
    current.y = THREE.MathUtils.lerp(current.y, targetY, alpha)
    current.z = THREE.MathUtils.lerp(current.z, targetZ, alpha)
}

// Helper to lerp Position
const lerpPos = (current, targetX, targetY, targetZ, alpha) => {
    current.x = THREE.MathUtils.lerp(current.x, targetX, alpha)
    current.y = THREE.MathUtils.lerp(current.y, targetY, alpha)
    current.z = THREE.MathUtils.lerp(current.z, targetZ, alpha)
}

export default function RobotCharacter({ isJumping, isSliding, speed, shocked }) {
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

    const ghostRedMat = useMemo(() => new THREE.MeshBasicMaterial({
        color: "#FF0000", // Red Channel
        wireframe: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    }), [])

    const ghostBlueMat = useMemo(() => new THREE.MeshBasicMaterial({
        color: "#00FFFF", // Cyan/Blue Channel
        wireframe: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    }), [])

    useFrame((state, delta) => {
        if (!group.current) return

        // Glitch Logic for Shock
        // Glitch Logic for Shock
        if (shocked) {
            ghostRedMat.opacity = Math.random() * 0.8
            ghostRedMat.visible = Math.random() > 0.1

            ghostBlueMat.opacity = Math.random() * 0.8
            ghostBlueMat.visible = Math.random() > 0.1
        } else {
            ghostRedMat.opacity = 0
            ghostRedMat.visible = false
            ghostBlueMat.opacity = 0
            ghostBlueMat.visible = false
        }

        const t = state.clock.elapsedTime
        const runCycle = t * speed * 1.2
        const lerpSpeed = delta * 15 // smooth transition speed

        // Target Values container
        const targets = {
            body: { pos: { x: 0, y: 0.08, z: 0 }, rot: { x: 0.17, y: Math.PI, z: 0 } },
            head: { rot: { x: 0, y: 0, z: 0 } },
            leftUpperArm: { rot: { x: 0, y: 0, z: 0 } },
            rightUpperArm: { rot: { x: 0, y: 0, z: 0 } },
            leftForearm: { rot: { x: -1.2, y: 0, z: 0 } },
            rightForearm: { rot: { x: -1.2, y: 0, z: 0 } },
            leftThigh: { rot: { x: 0, y: 0, z: 0 } },
            rightThigh: { rot: { x: 0, y: 0, z: 0 } },
            leftShin: { rot: { x: 0, y: 0, z: 0 } },
            rightShin: { rot: { x: 0, y: 0, z: 0 } },
        }

        if (isJumping) {
            // --- JUMP POSE (Dynamic X / Hang Style) ---
            targets.body.pos.y = 0.6
            targets.body.rot.x = 0.4 // Lean back

            targets.head.rot.x = -0.3

            targets.leftUpperArm.rot = { x: -0.5, y: 0, z: -1.0 } // Arms less spread (was -2.3)
            targets.rightUpperArm.rot = { x: -0.5, y: 0, z: 1.0 } // Arms less spread (was 2.3)

            targets.leftForearm.rot.x = -0.2
            targets.rightForearm.rot.x = -0.2

            targets.leftThigh.rot = { x: -0.8, y: 0, z: -0.2 } // Legs higher up (-0.5 -> -0.8) & less spread (-0.6 -> -0.2)
            targets.rightThigh.rot = { x: -0.8, y: 0, z: 0.2 } // Legs higher up & less spread

            targets.leftShin.rot.x = 2.0 // Knees more bent (was 1.2)
            targets.rightShin.rot.x = 2.0 // Knees more bent (was 1.2)

        } else if (isSliding) {
            // --- BASEBALL SIDE SLIDE POSE ---
            // Concept: Sliding on Right Hip/Thigh. 
            // Body rotated to face slightly side/up.

            targets.body.pos.y = 0.1 // Low to ground

            // Body Rotation:
            // X: ~1.4 (Leaning back flat-ish)
            // Y: Math.PI - 0.5 (Turned to side)
            // Z: -0.2 (Tilted)
            targets.body.rot = { x: 1.4, y: Math.PI - 0.8, z: -0.3 }

            // Head: Look forward/up
            // Compensate for body rotation to look at camera/forward
            // Body X is 1.4. To look level, Head X should be -1.4.
            // To tuck chin (look down), we need more negative. Let's go -1.7.
            targets.head.rot = { x: -1.7, y: 0.8, z: 0 }

            // Arms: Balance
            // Left Arm (Top arm): Forward/Up
            targets.leftUpperArm.rot = { x: -1.5, y: 0.5, z: 0 }
            targets.leftForearm.rot.x = -2.0 // Flexed

            // Right Arm (Bottom arm): Back/Support
            targets.rightUpperArm.rot = { x: 0.5, y: -0.5, z: 1.0 }
            targets.rightForearm.rot.x = -0.5

            // Legs:
            // Right Leg (Bottom): Extended forward
            targets.rightThigh.rot = { x: 0.2, y: 0, z: 0.2 }
            targets.rightShin.rot.x = 0

            // Left Leg (Top): Bent knee, stylish
            targets.leftThigh.rot = { x: -0.5, y: -0.2, z: -0.3 }
            targets.leftShin.rot.x = 1.5

        } else {
            // --- RUN CYCLE (Procedural) ---
            targets.body.pos.y = Math.abs(Math.sin(runCycle)) * 0.08
            targets.body.rot.x = 0.17

            const armAmp = 0.8
            targets.leftUpperArm.rot.x = Math.sin(runCycle) * armAmp
            targets.rightUpperArm.rot.x = Math.sin(runCycle + Math.PI) * armAmp

            const leftArmPhase = Math.sin(runCycle)
            const rightArmPhase = Math.sin(runCycle + Math.PI)
            targets.leftForearm.rot.x = -1.2 + (leftArmPhase > 0 ? -0.5 * leftArmPhase : 0)
            targets.rightForearm.rot.x = -1.2 + (rightArmPhase > 0 ? -0.5 * rightArmPhase : 0)

            const legAmp = 1.0
            targets.leftThigh.rot.x = Math.sin(runCycle + Math.PI) * legAmp
            targets.rightThigh.rot.x = Math.sin(runCycle) * legAmp

            const getKneeAngle = (t) => Math.max(0, 0.8 + 0.6 * Math.cos(t) + 0.6 * Math.cos(2 * t) + 0.2 * Math.sin(t))
            targets.leftShin.rot.x = getKneeAngle(runCycle + Math.PI)
            targets.rightShin.rot.x = getKneeAngle(runCycle)
        }

        // --- APPLY LERP ---
        lerpPos(group.current.position, targets.body.pos.x, targets.body.pos.y, targets.body.pos.z, lerpSpeed)
        lerpRot(group.current.rotation, targets.body.rot.x, targets.body.rot.y, targets.body.rot.z, lerpSpeed)

        if (head.current) lerpRot(head.current.rotation, targets.head.rot.x, targets.head.rot.y, targets.head.rot.z, lerpSpeed)

        lerpRot(leftUpperArm.current.rotation, targets.leftUpperArm.rot.x, targets.leftUpperArm.rot.y, targets.leftUpperArm.rot.z, lerpSpeed)
        lerpRot(rightUpperArm.current.rotation, targets.rightUpperArm.rot.x, targets.rightUpperArm.rot.y, targets.rightUpperArm.rot.z, lerpSpeed)

        lerpRot(leftForearm.current.rotation, targets.leftForearm.rot.x, targets.leftForearm.rot.y, targets.leftForearm.rot.z, lerpSpeed)
        lerpRot(rightForearm.current.rotation, targets.rightForearm.rot.x, targets.rightForearm.rot.y, targets.rightForearm.rot.z, lerpSpeed)

        lerpRot(leftThigh.current.rotation, targets.leftThigh.rot.x, targets.leftThigh.rot.y, targets.leftThigh.rot.z, lerpSpeed)
        lerpRot(rightThigh.current.rotation, targets.rightThigh.rot.x, targets.rightThigh.rot.y, targets.rightThigh.rot.z, lerpSpeed)

        lerpRot(leftShin.current.rotation, targets.leftShin.rot.x, targets.leftShin.rot.y, targets.leftShin.rot.z, lerpSpeed)
        lerpRot(rightShin.current.rotation, targets.rightShin.rot.x, targets.rightShin.rot.y, targets.rightShin.rot.z, lerpSpeed)
    })

    return (
        <group ref={group} scale={[1.1, 1.1, 1.1]}>
            {/* --- TORSO --- */}
            <group ref={torso} position={[0, 0.45, 0]}>
                {shocked && (
                    <>
                        <mesh position={[-0.04, -0.12, 0]} material={ghostRedMat}><RoundedBox args={[0.2, 0.25, 0.12]} radius={0.04} smoothness={4} /></mesh>
                        <mesh position={[0.04, -0.12, 0]} material={ghostBlueMat}><RoundedBox args={[0.2, 0.25, 0.12]} radius={0.04} smoothness={4} /></mesh>
                    </>
                )}
                {/* Abdomen */}
                <mesh position={[0, -0.12, 0]} material={blackInnerMat}>
                    <RoundedBox args={[0.2, 0.25, 0.12]} radius={0.04} smoothness={4} />
                </mesh>

                {shocked && (
                    <>
                        <mesh position={[-0.04, 0.15, 0]} material={ghostRedMat}><RoundedBox args={[0.32, 0.28, 0.16]} radius={0.05} smoothness={4} /></mesh>
                        <mesh position={[0.04, 0.15, 0]} material={ghostBlueMat}><RoundedBox args={[0.32, 0.28, 0.16]} radius={0.05} smoothness={4} /></mesh>
                    </>
                )}
                {/* Chest */}
                <mesh position={[0, 0.15, 0]} material={whiteArmorMat}>
                    <RoundedBox args={[0.32, 0.28, 0.16]} radius={0.05} smoothness={4} />
                </mesh>

                {shocked && (
                    <>
                        <mesh position={[-0.04, 0.28, 0]} material={ghostRedMat}><RoundedBox args={[0.34, 0.08, 0.14]} radius={0.02} smoothness={4} /></mesh>
                        <mesh position={[0.04, 0.28, 0]} material={ghostBlueMat}><RoundedBox args={[0.34, 0.08, 0.14]} radius={0.02} smoothness={4} /></mesh>
                    </>
                )}
                {/* Upper Chest */}
                <mesh position={[0, 0.28, 0]} material={whiteArmorMat}>
                    <RoundedBox args={[0.34, 0.08, 0.14]} radius={0.02} smoothness={4} />
                </mesh>
            </group>

            {/* --- HEAD --- */}
            <group ref={head} position={[0, 0.85, 0]}>
                {shocked && (
                    <>
                        <mesh position={[-0.03, 0.08, 0]} material={ghostRedMat}><RoundedBox args={[0.16, 0.20, 0.18]} radius={0.07} smoothness={8} /></mesh>
                        <mesh position={[0.03, 0.08, 0]} material={ghostBlueMat}><RoundedBox args={[0.16, 0.20, 0.18]} radius={0.07} smoothness={8} /></mesh>
                    </>
                )}

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
                {shocked && (
                    <>
                        <mesh position={[-0.02, 0, 0]} material={ghostRedMat}><RoundedBox args={[0.08, 0.12, 0.12]} radius={0.04} smoothness={4} /></mesh>
                        <mesh position={[0.02, 0, 0]} material={ghostBlueMat}><RoundedBox args={[0.08, 0.12, 0.12]} radius={0.04} smoothness={4} /></mesh>
                    </>
                )}
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
                        {shocked && (
                            <>
                                <mesh position={[-0.02, -0.134, 0]} material={ghostRedMat}><cylinderGeometry args={[0.045, 0.035, 0.2375, 16]} /></mesh>
                                <mesh position={[0.02, -0.134, 0]} material={ghostBlueMat}><cylinderGeometry args={[0.045, 0.035, 0.2375, 16]} /></mesh>
                            </>
                        )}
                        <mesh position={[0, -0.134, 0]} material={whiteArmorMat}>
                            <cylinderGeometry args={[0.045, 0.035, 0.2375, 16]} />
                        </mesh>
                        {/* Hand - 10% Larger */}
                        {shocked && (
                            <>
                                <mesh position={[-0.02, -0.308, 0]} rotation={[0, Math.PI / 4, 0]} material={ghostRedMat}><cylinderGeometry args={[0.039, 0.033, 0.18, 4]} /></mesh>
                                <mesh position={[0.02, -0.308, 0]} rotation={[0, Math.PI / 4, 0]} material={ghostBlueMat}><cylinderGeometry args={[0.039, 0.033, 0.18, 4]} /></mesh>
                            </>
                        )}
                        <mesh position={[0, -0.308, 0]} rotation={[0, Math.PI / 4, 0]} material={whiteArmorMat}>
                            <cylinderGeometry args={[0.039, 0.033, 0.18, 4]} />
                        </mesh>
                    </group>
                </group>
            </group>

            {/* Right Arm */}
            <group ref={rightUpperArm} position={[0.22, 0.72, 0]}>
                {shocked && (
                    <>
                        <mesh position={[-0.02, 0, 0]} material={ghostRedMat}><RoundedBox args={[0.08, 0.12, 0.12]} radius={0.04} smoothness={4} /></mesh>
                        <mesh position={[0.02, 0, 0]} material={ghostBlueMat}><RoundedBox args={[0.08, 0.12, 0.12]} radius={0.04} smoothness={4} /></mesh>
                    </>
                )}
                {/* Shoulder Cap (Integrated) */}
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
                        {shocked && (
                            <>
                                <mesh position={[-0.02, -0.134, 0]} material={ghostRedMat}><cylinderGeometry args={[0.045, 0.035, 0.2375, 16]} /></mesh>
                                <mesh position={[0.02, -0.134, 0]} material={ghostBlueMat}><cylinderGeometry args={[0.045, 0.035, 0.2375, 16]} /></mesh>
                            </>
                        )}
                        <mesh position={[0, -0.134, 0]} material={whiteArmorMat}>
                            <cylinderGeometry args={[0.045, 0.035, 0.2375, 16]} />
                        </mesh>
                        {/* Hand - 10% Larger */}
                        {shocked && (
                            <>
                                <mesh position={[-0.02, -0.308, 0]} rotation={[0, Math.PI / 4, 0]} material={ghostRedMat}><cylinderGeometry args={[0.039, 0.033, 0.18, 4]} /></mesh>
                                <mesh position={[0.02, -0.308, 0]} rotation={[0, Math.PI / 4, 0]} material={ghostBlueMat}><cylinderGeometry args={[0.039, 0.033, 0.18, 4]} /></mesh>
                            </>
                        )}
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

                {shocked && (
                    <>
                        <mesh position={[-0.02, -0.18, 0]} material={ghostRedMat}><cylinderGeometry args={[0.08, 0.06, 0.35, 16]} /></mesh>
                        <mesh position={[0.02, -0.18, 0]} material={ghostBlueMat}><cylinderGeometry args={[0.08, 0.06, 0.35, 16]} /></mesh>
                    </>
                )}
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
                        {shocked && (
                            <>
                                <mesh position={[-0.02, -0.18, 0]} material={ghostRedMat}><cylinderGeometry args={[0.06, 0.045, 0.35, 16]} /></mesh>
                                <mesh position={[0.02, -0.18, 0]} material={ghostBlueMat}><cylinderGeometry args={[0.06, 0.045, 0.35, 16]} /></mesh>
                            </>
                        )}
                        <mesh position={[0, -0.18, 0]} material={whiteArmorMat}>
                            <cylinderGeometry args={[0.06, 0.045, 0.35, 16]} />
                        </mesh>

                        {/* Foot - Tapered Box */}
                        <group position={[0, -0.42, 0.05]}>
                            {shocked && (
                                <>
                                    <mesh rotation={[Math.PI / 2, Math.PI / 4, 0]} material={ghostRedMat}><cylinderGeometry args={[0.05, 0.03, 0.22, 4]} /></mesh>
                                    <mesh rotation={[Math.PI / 2, Math.PI / 4, 0]} material={ghostBlueMat}><cylinderGeometry args={[0.05, 0.03, 0.22, 4]} /></mesh>
                                </>
                            )}
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

                {shocked && (
                    <>
                        <mesh position={[-0.02, -0.18, 0]} material={ghostRedMat}><cylinderGeometry args={[0.08, 0.06, 0.35, 16]} /></mesh>
                        <mesh position={[0.02, -0.18, 0]} material={ghostBlueMat}><cylinderGeometry args={[0.08, 0.06, 0.35, 16]} /></mesh>
                    </>
                )}
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
                        {shocked && (
                            <>
                                <mesh position={[-0.02, -0.18, 0]} material={ghostRedMat}><cylinderGeometry args={[0.06, 0.045, 0.35, 16]} /></mesh>
                                <mesh position={[0.02, -0.18, 0]} material={ghostBlueMat}><cylinderGeometry args={[0.06, 0.045, 0.35, 16]} /></mesh>
                            </>
                        )}
                        <mesh position={[0, -0.18, 0]} material={whiteArmorMat}>
                            <cylinderGeometry args={[0.06, 0.045, 0.35, 16]} />
                        </mesh>

                        {/* Foot - Tapered Box */}
                        <group position={[0, -0.42, 0.05]}>
                            {shocked && (
                                <>
                                    <mesh rotation={[Math.PI / 2, Math.PI / 4, 0]} material={ghostRedMat}><cylinderGeometry args={[0.05, 0.03, 0.22, 4]} /></mesh>
                                    <mesh rotation={[Math.PI / 2, Math.PI / 4, 0]} material={ghostBlueMat}><cylinderGeometry args={[0.05, 0.03, 0.22, 4]} /></mesh>
                                </>
                            )}
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
