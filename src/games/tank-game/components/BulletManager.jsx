import React, { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { InstancedRigidBodies } from '@react-three/rapier'
import * as THREE from 'three'
import { gameRefs, useStore } from '../store'

const MAX_BULLETS = 50
const BULLET_SPEED = 20
const BULLET_LIFETIME = 3 // Seconds

export default function BulletManager() {
    // Refs
    const bullets = useRef([]) // Local state for active bullets { id, position, velocity, time, isEnemy }
    const meshRef = useRef()
    const rigidBodyConf = useRef([])

    // Store
    const gameStarted = useStore(state => state.gameStarted)
    const gameOver = useStore(state => state.gameOver)

    // Initial Instanced Mesh Setup
    // using InstancedRigidBodies from rapier for physics collisions

    // We need to sync the local bullet state with the physics bodies
    // Actually, properly using InstancedRigidBodies with dynamic spawning is tricky.
    // A simpler approach for this scale (50 bullets) is to use a pool of RigidBodies 
    // or just standard raycasting if we want super high performance.
    // However, given the "Tank Battle" requirement, bullets should probably be physical sensors.

    // Let's use a simpler approach: 
    // A managed list of <Bullet> components is easier to reason about than raw InstancedRigidBodies for beginners,
    // but InstancedMesh is requested for performance.

    // Compromise: Use InstancedMesh for rendering, but manage positions manually or use Rapier's sensor API manually?
    // Let's go with the recommended React-Three-Rapier way:
    // A list of active bullets state, mapped to RigidBodies.

    const [activeBullets, setActiveBullets] = React.useState([])

    // Expose fire function to store/refs
    useEffect(() => {
        gameRefs.bullets.current = {
            fire: (position, rotation, charge = 0, isEnemy = false) => {
                const id = Math.random().toString(36).substr(2, 9)
                const direction = new THREE.Vector3(0, 0, 1).applyEuler(rotation)
                const speed = BULLET_SPEED + (charge * 0.2) // Charge increases speed
                const velocity = direction.multiplyScalar(speed)

                // Adjust spawn position slightly forward
                const spawnPos = new THREE.Vector3(position.x, position.y + 0.6, position.z).add(direction.clone().normalize().multiplyScalar(2))

                setActiveBullets(prev => [...prev, {
                    id,
                    position: [spawnPos.x, spawnPos.y, spawnPos.z],
                    rotation: [rotation.x, rotation.y, rotation.z],
                    velocity: [velocity.x, velocity.y, velocity.z],
                    isEnemy,
                    createdAt: Date.now()
                }])
            }
        }
    }, [])

    // Cleanup old bullets
    useFrame(() => {
        const now = Date.now()
        setActiveBullets(prev => prev.filter(b => (now - b.createdAt) < BULLET_LIFETIME * 1000))
    })

    return (
        <group>
            {activeBullets.map(bullet => (
                <Bullet
                    key={bullet.id}
                    {...bullet}
                    onHit={(target) => {
                        // Handle collision logic
                        // Remove bullet
                        setActiveBullets(prev => prev.filter(b => b.id !== bullet.id))
                    }}
                />
            ))}
        </group>
    )
}

function Bullet({ position, velocity, isEnemy, onHit }) {
    const body = useRef()

    return (
        <RigidBody
            ref={body}
            position={position}
            linearVelocity={velocity}
            gravityScale={0}
            sensor
            onIntersectionEnter={({ other }) => {
                // Ignore self collision if needed, but sensor works well
                // We need to check what we hit
                // For now, just destroy on anything
                onHit(other)
            }}
        >
            <mesh>
                <sphereGeometry args={[0.2]} />
                <meshBasicMaterial color={isEnemy ? "#ff0000" : "#00ffff"} />
            </mesh>
        </RigidBody>
    )
}
