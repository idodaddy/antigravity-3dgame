import { create } from 'zustand'

const INITIAL_SIZE = [3, 1, 3]
const INITIAL_POSITION = [0, 0, 0]
const BASE_SPEED = 2.0 // Increased speed for challenge

export const useStore = create((set, get) => ({
    stack: [],
    activeBlock: null,
    debris: [],
    gameStarted: false,
    gameOver: false,
    score: 0,
    cameraHeight: 5,
    rank: null,

    setRank: (rank) => set({ rank }),

    startGame: () => {
        set({
            stack: [{ position: INITIAL_POSITION, size: INITIAL_SIZE, color: '#00ffcc' }],
            debris: [],
            score: 0,
            gameOver: false,
            gameStarted: true,
            cameraHeight: 5,
            rank: null,
            activeBlock: {
                position: [0, 1, 0], // Start one level up
                size: INITIAL_SIZE,
                direction: 'x', // 'x' or 'z'
                speed: BASE_SPEED,
                color: '#ff00cc' // Next color
            }
        })
    },

    reset: () => {
        set({
            gameStarted: false,
            gameOver: false,
            score: 0,
            stack: [],
            debris: [],
            activeBlock: null
        })
    },

    updateActiveBlock: (time) => {
        const { activeBlock, gameStarted, gameOver } = get()
        if (!gameStarted || gameOver || !activeBlock) return

        // Oscillate back and forth
        // Range approx -4 to 4
        // Speed affects frequency
        const offset = Math.sin(time * activeBlock.speed) * 4.5

        const newPos = [...activeBlock.position]
        if (activeBlock.direction === 'x') {
            newPos[0] = offset
        } else {
            newPos[2] = offset
        }

        set(state => ({
            activeBlock: {
                ...state.activeBlock,
                position: newPos
            }
        }))
    },

    placeBlock: () => {
        const { activeBlock, stack, score } = get()
        if (!activeBlock) return

        const lastBlock = stack[stack.length - 1]
        const { position, size, direction } = activeBlock

        // Calculate overlap
        // 0 = x, 1 = y, 2 = z
        const axisIdx = direction === 'x' ? 0 : 2

        const delta = position[axisIdx] - lastBlock.position[axisIdx]
        const overlap = size[axisIdx] - Math.abs(delta)

        if (overlap <= 0) {
            // Missed!
            set({ gameOver: true })
            return
        }

        // Hit!
        // New size
        const newSize = [...size]
        newSize[axisIdx] = overlap

        // New position (center of overlap)
        const newPos = [...position]
        // If delta > 0, we overshot to positive, so new center shifted negative relative to active center?
        // Let's use lastBlock edge logic.
        // Center = lastBlockPos + delta/2
        newPos[axisIdx] = lastBlock.position[axisIdx] + delta / 2

        const newStackBlock = {
            position: newPos,
            size: newSize,
            color: activeBlock.color
        }

        // Debris
        // Size of cut off part = abs(delta)
        // Position of debris
        const debrisSize = [...size]
        debrisSize[axisIdx] = Math.abs(delta)

        const debrisPos = [...position]
        // If delta > 0 (moved +), debris is on +, so pos is newPos + newSize/2 + debrisSize/2 = too complex
        // Simple: activePos + (size/2 - debrisSize/2) * sign
        const sign = Math.sign(delta)
        // Edge of last block is lastPos + size/2 * sign
        // Debris center is Edge + debrisSize/2 * sign
        debrisPos[axisIdx] = lastBlock.position[axisIdx] + (lastBlock.size[axisIdx] / 2 + debrisSize[axisIdx] / 2) * sign

        // Generate next color (Hue shift)
        const hue = (score * 10 + 300) % 360
        const nextColor = `hsl(${hue}, 100%, 50%)`

        const nextDirection = direction === 'x' ? 'z' : 'x'
        const nextActivePos = [...newPos]
        nextActivePos[1] += 1 // One level up
        // Reset offset for next spawn? Usually start far.
        // In update loop we rely on sin(time), but we should probably reset phase.
        // But since we use absolute time, we can't easily reset phase without offset state.
        // For simplicity, just use newPos as base Y/Center, but X/Z determined by time loop.
        // Wait, updateActiveBlock overwrites X/Z. So initialization X/Z doesn't matter much unless we pause.

        const nextSpeed = activeBlock.speed + 0.1

        set(state => ({
            stack: [...state.stack, newStackBlock],
            debris: [...state.debris, { position: debrisPos, size: debrisSize, color: activeBlock.color }],
            score: state.score + 1,
            cameraHeight: state.cameraHeight + 1,
            activeBlock: {
                position: nextActivePos,
                size: newSize,
                direction: nextDirection,
                speed: nextSpeed,
                color: nextColor
            }
        }))
    }
}))
