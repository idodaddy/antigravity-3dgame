export const SEGMENT_LENGTH = 20
export const OBSTACLE_CHANCE = 0.70
export const JUMP_DURATION = 0.6
export const JUMP_HEIGHT = 2.5

export function createSegmentContent(offset, speed) {
    const obstacles = []
    const minerals = []

    let z = Math.max(Math.ceil(offset), 2) // Start after offset

    // Loop through the segment length
    // We allow z to go beyond 20. The excess becomes the offset for the next segment.
    while (z < 20) {
        const roll = Math.random()

        // 1. OBSTACLE (70% chance)
        if (roll < OBSTACLE_CHANCE) {
            // Check bounds: Obstacle needs a little space, but we are more aggressive now.
            // If z is way past 20, we stop.
            if (z >= 22) break;

            const lane = [-3, 0, 3][Math.floor(Math.random() * 3)]
            // 40% chance for HIGH obstacle (requires sliding)
            const type = Math.random() < 0.4 ? 'high' : 'low'

            // High obstacle: y=1.2 (Center ~1.2, Size 1.0 -> Bottom 0.7)
            // Low obstacle: y=0.4 (Center ~0.4, Size 0.8 -> Top 0.8)
            const y = type === 'high' ? 1.4 : 0.4 // Lift high one up a bit more safely
            obstacles.push({ position: [lane, y, z + 0.5], type })

            // Guaranteed Star (Mineral) under High Obstacle
            if (type === 'high') {
                minerals.push({ position: [lane, 0.5, z + 0.5], id: Math.random(), type: 'star' })
            }

            // HIGH CHANCE to spawn a mineral CLUSTER/LINE in a DIFFERENT lane
            if (Math.random() < 0.8) {
                const otherLanes = [-3, 0, 3].filter(l => l !== lane)
                const minLane = otherLanes[Math.floor(Math.random() * otherLanes.length)]

                // Spawn a mini line of 3 minerals
                for (let k = 0; k < 3; k++) {
                    minerals.push({ position: [minLane, 0.5, z + k * 1.2], id: Math.random(), type: 'min' })
                }
            }

            // Gap based on speed: Increased density but ensured minimum 8 unit spacing (per user request > 5 empty spaces)
            const gap = Math.max(8, speed * 0.25)
            z += gap
        }
        // 2. JUMP ARC (Air Minerals) (15% chance: 0.70 to 0.85)
        // CRITICAL FIX: Adjusted threshold to ensured it spawns
        else if (roll < 0.85) {
            const jumpDist = (speed * JUMP_DURATION) * 1.1
            const count = 5
            const spacing = jumpDist / count

            const laneIdx = Math.floor(Math.random() * 3)

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

            const finishZ = z + (count - 1) * spacing
            const gap = Math.max(6, speed * 0.6) // Buffer after jump
            z = finishZ + gap
        }
        // 3. GROUND STREAK (30% chance)
        // CRITICAL FIX: Removed boundary check
        else {
            const count = 5 + Math.floor(Math.random() * 3)
            const spacing = 1.8

            const laneIdx = Math.floor(Math.random() * 3)
            const lane = [-3, 0, 3][laneIdx]

            for (let i = 0; i < count; i++) {
                minerals.push({ position: [lane, 0.5, z + i * spacing], id: Math.random(), type: 'min' })
            }

            const finishZ = z + (count - 1) * spacing
            const gap = Math.max(4, speed * 0.4)
            z = finishZ + gap
        }
    }

    // --- SAFETY PASS: STRICT DEDUPLICATION ---
    const allItems = [
        ...obstacles.map(o => ({ ...o, type: 'obs', ref: o })),
        ...minerals.map(m => ({ ...m, type: 'min', ref: m }))
    ].sort((a, b) => a.position[2] - b.position[2])

    const finalObstacles = []
    const finalMinerals = []

    const MIN_Z_DIST = 1.0

    allItems.forEach(item => {
        const p = item.position
        let collision = false

        // Check against kept obstacles
        for (const other of finalObstacles) {
            const dz = Math.abs(p[2] - other.position[2])
            const dx = Math.abs(p[0] - other.position[0])
            if (dz < MIN_Z_DIST && dx < 1.0) {
                // EXCEPTION: Allow Minerals under HIGH obstacles
                if (item.type === 'min' && other.type === 'high') {
                    continue; // Allow it
                }
                collision = true; break;
            }
        }

        if (!collision) {
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
