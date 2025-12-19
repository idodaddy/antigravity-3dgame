
import { createSegmentContent, SEGMENT_LENGTH } from '../src/games/neon-runner/utils/generator.js'

// Mock environment since we are running in Node context but using ES modules? 
// Actually, using `run_command` with node usually requires ESM setup or .mjs extension if "type": "module" is in package.json.
// The project is Vite/React, likely "type": "module".
// I'll assume Node can run this if it imports properly. I might need to rename to .mjs or ensure imports work.
// Since I can't easily see package.json configuration, I'll try to execute it.

const TEST_SEGMENTS = 1000
const SPEED = 10

console.log(`Starting Verification: ${TEST_SEGMENTS} segments at speed ${SPEED}...`)

let currentOffset = 0
let totalObstacles = 0
let totalMinerals = 0
let overlaps = 0

// We need to track ALL objects with their Z positions.
// Since we simulate an infinite track, we can just use a sliding window logic or relative Z?
// "createSegmentContent" returns items relative to the segment start (0 to 20).
// BUT the "infinite runner" logic places them at global Z. 
// Actually, `createSegmentContent` returns items within [0, 20].
// So we can simulate "Absolute Z" by adding (segmentIndex * 20) to their positions.

const allItems = []

for (let i = 0; i < TEST_SEGMENTS; i++) {
    const { obstacles, minerals, nextOffset } = createSegmentContent(currentOffset, SPEED)
    currentOffset = nextOffset

    // Process items to absolute Z
    const segmentBaseZ = i * SEGMENT_LENGTH

    obstacles.forEach(o => {
        allItems.push({ type: 'OBS', z: segmentBaseZ + o.position[2], lane: o.position[0] })
        totalObstacles++
    })

    minerals.forEach(m => {
        allItems.push({ type: 'MIN', z: segmentBaseZ + m.position[2], lane: m.position[0] })
        totalMinerals++
    })
}

// Sort by Z
allItems.sort((a, b) => a.z - b.z)

// Check for Overlaps
// An overlap is defined as two items being TOO close in Z (e.g. < 0.1) AND in the SAME lane (or affecting same space).
// For Jump Arcs, even if Z is unique, we want to ensure no other item is "visually overlapping".
// But my logic guarantees ONE item type per Z-slice.
// So let's check: Is there ANY pair of items with |z1 - z2| < threshold that occupy the same space?

const Z_THRESHOLD = 0.5 // Should be at least 0.5 apart
const failures = []

for (let i = 0; i < allItems.length - 1; i++) {
    const a = allItems[i]
    const b = allItems[i + 1]

    if (Math.abs(a.z - b.z) < Z_THRESHOLD) {
        // Check lanes
        // Note: Minerals in diagonal jump might have float lanes. Obstacles have int lanes.
        // Simple check: Are they "close" in X as well?
        const laneDiff = Math.abs(a.lane - b.lane)
        if (laneDiff < 1.0) { // Same laneish
            overlaps++
            failures.push(`Overlap at Z=${a.z.toFixed(2)}: ${a.type} vs ${b.type} (Lane ${a.lane} vs ${b.lane})`)
        }
    }
}

console.log(`Simulation Complete.`)
console.log(`Total Objs: ${totalObstacles + totalMinerals}`)
console.log(`Obstacles: ${totalObstacles}`)
console.log(`Minerals: ${totalMinerals}`)
console.log(`OVERLAPS DETECTED: ${overlaps}`)

if (overlaps === 0) {
    console.log("SUCCESS: No overlaps found.")
} else {
    console.log("FAILURE: Overlaps found!")
    console.log(failures.slice(0, 5))
}
