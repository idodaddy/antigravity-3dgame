import React, { useRef, useEffect, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { useKeyboardControls } from '@react-three/drei'
import { useStore, gameRefs } from '../store'
import * as THREE from 'three'
import { playShootSound, playChargeSound, playMaxChargeSound } from '../audio'

const MOVE_SPEED = 15
const ROTATION_SPEED = 3
const FRICTION = 0.9
const TANK_SIZE = 1.0 // Half-width for collision

export default function PlayerTank() {
    const meshRef = useRef()
    const [chargeLevel, setChargeLevel] = useState(0)
    const [isCharging, setIsCharging] = useState(false)

    // Store actions
    const setStoreCharge = useStore(state => state.setPlayerCharge)
    const setStoreIsCharging = useStore(state => state.setIsCharging)

    // Controls
    const [sub, get] = useKeyboardControls()

    // Physics state
    const velocity = useRef(new THREE.Vector3(0, 0, 0))
    const rotation = useRef(0) // radians

    // Audio refs
    const chargeAudioRef = useRef(null)

    useEffect(() => {
        // Link ref for external access
        gameRefs.player.current = meshRef.current

        // Initial spawn
        meshRef.current.position.set(0, 0.5, 0) // Y=0.5 (half height of 1 unit tank)

        return () => { gameRefs.player.current = null }
    }, [])

    useFrame((state, delta) => {
        if (!meshRef.current) return

        const { forward, backward, left, right, fire } = get()

        // --- Rotation ---
        if (left) rotation.current += ROTATION_SPEED * delta
        if (right) rotation.current -= ROTATION_SPEED * delta
        meshRef.current.rotation.y = rotation.current

        // --- Movement Acceleration ---
        const moveDir = new THREE.Vector3(0, 0, 0)
        if (forward) moveDir.z -= 1
        if (backward) moveDir.z += 1

        // Apply rotation to moveDir
        moveDir.applyAxisAngle(new THREE.Vector3(0, 1, 0), rotation.current)

        if (moveDir.length() > 0) {
            moveDir.normalize().multiplyScalar(MOVE_SPEED * delta)
            velocity.current.add(moveDir)
        }

        // Friction
        velocity.current.multiplyScalar(FRICTION)

        // --- Collision Detection (Predictive) ---
        const proposedPos = meshRef.current.position.clone().add(velocity.current)
        const barriers = gameRefs.barriers.current || []

        let collideX = false
        let collideZ = false

        // Check Barriers
        for (const b of barriers) {
            // AABB Check
            // Player AABB: [x-s, x+s], [z-s, z+s]
            // Barrier AABB: [b.minX, b.maxX], [b.minZ, b.maxZ]

            // Check axis separately for sliding
            if (
                proposedPos.x + TANK_SIZE > b.minX && proposedPos.x - TANK_SIZE < b.maxX &&
                meshRef.current.position.z + TANK_SIZE > b.minZ && meshRef.current.position.z - TANK_SIZE < b.maxZ
            ) {
                collideX = true
            }

            if (
                meshRef.current.position.x + TANK_SIZE > b.minX && meshRef.current.position.x - TANK_SIZE < b.maxX &&
                proposedPos.z + TANK_SIZE > b.minZ && proposedPos.z - TANK_SIZE < b.maxZ
            ) {
                collideZ = true
            }
        }

        // Apply allowed movement
        if (!collideX) meshRef.current.position.x = proposedPos.x
        else velocity.current.x = 0

        if (!collideZ) meshRef.current.position.z = proposedPos.z
        else velocity.current.z = 0

        // --- Firing Mechanics ---
        if (fire) {
            if (!isCharging) {
                setIsCharging(true)
                setStoreIsCharging(true)
                chargeAudioRef.current = playChargeSound()
            }
            if (chargeLevel < 100) {
                setChargeLevel(prev => Math.min(prev + delta * 50, 100))
            } else {
                // Max charge effect?
            }
        } else {
            if (isCharging) {
                // Fire!
                const charge = chargeLevel
                const pos = meshRef.current.position.clone()
                const rot = rotation.current

                // Offset fire position to gun tip
                const gunOffset = new THREE.Vector3(0, 0, -2)
                gunOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), rot)
                const firePos = pos.add(gunOffset)

                // Fire Bullet
                if (gameRefs.bullets.current && gameRefs.bullets.current.fire) {
                    gameRefs.bullets.current.fire(firePos, rot, charge)
                }

                playShootSound(charge)
                if (chargeAudioRef.current) {
                    chargeAudioRef.current.stop()
                    chargeAudioRef.current = null
                }

                setIsCharging(false)
                setStoreIsCharging(false)
                setChargeLevel(0)
            }
        }

        // Sync to store for HUD
        setStoreCharge(chargeLevel)
    })

    return (
        <group ref={meshRef}>
            {/* Chassis */}
            <mesh castShadow receiveShadow position={[0, 0, 0]}>
                <boxGeometry args={[1.8, 1, 2.2]} />
                <meshStandardMaterial color={isCharging ? '#ff5500' : '#00aaff'} />
            </mesh>
            {/* Turret */}
            <mesh castShadow position={[0, 0.8, -0.2]}>
                <boxGeometry args={[1.2, 0.8, 1.2]} />
                <meshStandardMaterial color="#222" />
            </mesh>
            {/* Barrel */}
            <mesh castShadow position={[0, 0.8, -1.2]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.15, 0.15, 2, 16]} />
                <meshStandardMaterial color="#333" />
            </mesh>

            {/* Glow Ring for Charge */}
            {isCharging && (
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.4, 0]}>
                    <ringGeometry args={[1.5, 1.6 + (chargeLevel / 100) * 0.5, 32]} />
                    <meshBasicMaterial color="orange" transparent opacity={0.5} />
                </mesh>
            )}
        </group>
    )
}
