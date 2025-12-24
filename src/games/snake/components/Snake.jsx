import React, { useRef, useLayoutEffect, useMemo } from 'react'
import { useStore } from '../store'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const _object = new THREE.Object3D()
const _color = new THREE.Color()

export default function Snake() {
    const meshRef = useRef()

    // Transient update: Read state directly in useFrame to avoid React re-renders
    useFrame(() => {
        if (!meshRef.current) return

        const snake = useStore.getState().snake

        // Update instances
        for (let i = 0; i < 1000; i++) {
            if (i < snake.length) {
                const segment = snake[i]
                _object.position.set(segment[0], 0.5, segment[1])

                // Head is slightly larger
                const s = i === 0 ? 0.95 : 0.9
                _object.scale.set(s, s, s)

                _object.updateMatrix()
                meshRef.current.setMatrixAt(i, _object.matrix)

                // Color Gradient
                if (i === 0) {
                    _color.setHex(0xffffff) // Head: White
                } else {
                    // Gradient from Cyan to Neon Green
                    const t = Math.min(1, i / (snake.length + 5))
                    _color.setHSL(0.4 - t * 0.1, 1.0, 0.6)
                }
                meshRef.current.setColorAt(i, _color)
            } else {
                // Hide unused instances
                _object.scale.setScalar(0)
                _object.position.set(0, -100, 0)
                _object.updateMatrix()
                meshRef.current.setMatrixAt(i, _object.matrix)
            }
        }

        meshRef.current.instanceMatrix.needsUpdate = true
        if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true
    })

    return (
        <instancedMesh ref={meshRef} args={[null, null, 1000]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial
                toneMapped={false}
                emissive="#00ff00"
                emissiveIntensity={2.0}
            />
        </instancedMesh>
    )
}
