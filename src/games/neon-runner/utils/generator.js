export const SEGMENT_LENGTH = 20
export const OBSTACLE_CHANCE = 0.7
export const JUMP_DURATION = 0.6
export const JUMP_HEIGHT = 2.5

export function createSegmentContent(offset, speed) {
    const obstacles = []
    const minerals = []

    let z = Math.max(Math.ceil(offset), 2) // Start after offset

    // Loop through the segment length
    while (z < 18) { // Leave buffer at end
        const roll = Math.random()

        // 1. OBSTACLE (40% chance)
        if (roll < 0.40) {
            // Check bounds: Obstacle is single point.
            if (z + 2 >= 20) { // Needs space for itself + buffer
                z = 20 // Finish
                continue
            }
            const lane = [-3, 0, 3][Math.floor(Math.random() * 3)]
            obstacles.push({ position: [lane, 0.4, z + 0.5] })

            // HIGH CHANCE to spawn a mineral in a DIFFERENT lane (Simultaneous content)
            if (Math.random() < 0.7) {
                // Pick a lane that is NOT the obstacle lane
                const otherLanes = [-3, 0, 3].filter(l => l !== lane)
                const minLane = otherLanes[Math.floor(Math.random() * otherLanes.length)]
                minerals.push({ position: [minLane, 0.5, z + 0.5], id: Math.random(), type: 'min' })
            }

            // Gap based on speed: Ensure ~0.5s reaction/recovery time
            const gap = Math.max(5, speed * 0.4)
            z += gap
        }
        // 2. JUMP ARC (Air Minerals) (30% chance)
        else if (roll < 0.70) {
            const jumpDist = (speed * JUMP_DURATION) * 1.1
            const count = 5
            const spacing = jumpDist / count

            // BOUNDARY CHECK
            // Last mineral will be at z + (count-1)*spacing
            // We need it to be < 20 strict.
            const finishZ = z + (count - 1) * spacing
            if (finishZ >= 19.5) { // Leave slight margin
                // Won't fit. Skip this pattern.
                // Try to fit something else or just finish?
                // Let's just finish the segment to be safe.
                z = 20
                continue
            }

            const laneIdx = Math.floor(Math.random() * 3)
            const lane = [-3, 0, 3][laneIdx]

            let endLaneIdx = laneIdx
            if (Math.random() < 0.5) {
                const adj = []
                if (laneIdx > 0) adj.push(laneIdx - 1)
                if (laneIdx < 2) adj.push(laneIdx + 1)
                endLaneIdx = adj[Math.floor(Math.random() * adj.length)]
            }

            for (let i = 0; i < count; i++) {
                const progress = i / (count - 1)
                const y = Math.sin(progress * Math.PI) * JUMP_HEIGHT + 0.5
                const x = ([-3, 0, 3][laneIdx]) + (([-3, 0, 3][endLaneIdx]) - ([-3, 0, 3][laneIdx])) * progress

                // Middle item (index 2) is a Star
                const type = (i === 2) ? 'star' : 'min'
                minerals.push({ position: [x, y, z + i * spacing], id: Math.random(), type })
            }

            // STRICT GAP LOGIC:
            // The last mineral is at `z + (count - 1) * spacing`
            // We want the NEXT spawn to be at `lastMineralZ + gap`
            const lastItemZ = finishZ
            const gap = Math.max(8, speed * 0.8) // Strong buffer after jump (0.8s)
            z = lastItemZ + gap
        }
        // 3. GROUND STREAK (25% chance)
        else if (roll < 0.95) {
            const count = 5 + Math.floor(Math.random() * 3)
            const spacing = 1.8

            // BOUNDARY CHECK
            const finishZ = z + (count - 1) * spacing
            if (finishZ >= 19.5) {
                z = 20
                continue
            }

            const laneIdx = Math.floor(Math.random() * 3)
            const lane = [-3, 0, 3][laneIdx]

            for (let i = 0; i < count; i++) {
                minerals.push({ position: [lane, 0.5, z + i * spacing], id: Math.random(), type: 'min' })
            }

            const lastItemZ = finishZ
            const gap = Math.max(5, speed * 0.5) // Standard buffer (0.5s)
            z = lastItemZ + gap
        }
        else {
            z += speed * 0.2 // Minimum gap
        }
    }

    // --- SAFETY PASS: STRICT DEDUPLICATION ---
    // Merge and sort all items by Z to check for any accidental closeness
    const allItems = [
        ...obstacles.map(o => ({ ...o, type: 'obs', ref: o })),
        ...minerals.map(m => ({ ...m, type: 'min', ref: m }))
    ].sort((a, b) => a.position[2] - b.position[2])

    // Filter out items that are too close to predecessor
    // Filter out items that are too close to predecessor
    const finalObstacles = []
    const finalMinerals = []

    const MIN_Z_DIST = 1.0 // Absolute minimum distance between ANY two items (Z-axis)

    // BETTER APPROACH: Eliminate this single-stream loop.
    // Use a simple collision check against result arrays.

    allItems.forEach(item => {
        const p = item.position
        let collision = false

        // Check against kept obstacles
        for (const other of finalObstacles) {
            const dz = Math.abs(p[2] - other.position[2])
            const dx = Math.abs(p[0] - other.position[0])
            if (dz < MIN_Z_DIST && dx < 1.0) { // Same Z (approx) AND Same Lane (approx)
                collision = true; break;
            }
        }

        if (!collision) {
            // Check against kept minerals (optional: do we forbid mineral-mineral overlap? Yes)
            for (const other of finalMinerals) {
                const dz = Math.abs(p[2] - other.position[2])
                const dx = Math.abs(p[0] - other.position[0])
                if (dz < MIN_Z_DIST && dx < 1.0) {
                    collision = true; break;
                }
            }
        }

        if (!collision) {
            if (item.type === 'obs') finalObstacles.push(item.ref)
            else finalMinerals.push(item.ref)
        }
    })

    return { obstacles: finalObstacles, minerals: finalMinerals, nextOffset: Math.max(0, z - 20) }
}
