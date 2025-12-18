import { create } from 'zustand'

const INITIAL_SIZE = [3, 1, 3]
const INITIAL_POSITION = [0, 0, 0]
const BASE_SPEED = 0.15

export const useStore = create((set, get) => ({
    stack: [], // Array of { position, size, color }
    debris: [], // Array of { position, size, color, velocity }
    activeBlock: null, // { position, size, direction, speed, color }
    score: 0,
    gameOver: false,
    gameStarted: false,
    cameraHeight: 5,

    startGame: () => {
        set({
            stack: [{ position: INITIAL_POSITION, size: INITIAL_SIZE, color: '#00ffcc' }],
            debris: [],
            score: 0,
            gameOver: false,
            gameStarted: true,
            cameraHeight: 5,
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
        get().startGame()
    },

    // Called every frame to update active block position
    updateActiveBlock: (time) => {
        const { activeBlock, gameStarted, gameOver } = get()
        if (!gameStarted || gameOver || !activeBlock) return

        const limit = 4 // Movement range
        const speed = activeBlock.speed
        const direction = activeBlock.direction

        // Simple ping-pong movement
        const offset = Math.sin(time * speed * 5) * limit

        const newPos = [...activeBlock.position]
        if (direction === 'x') newPos[0] = offset
        else newPos[2] = offset

        set({ activeBlock: { ...activeBlock, position: newPos } })
    },

    placeBlock: () => {
        const { activeBlock, stack, score } = get()
        if (!activeBlock) return

        const lastBlock = stack[stack.length - 1]
        const { position: currentPos, size: currentSize, direction, color } = activeBlock
        const { position: lastPos, size: lastSize } = lastBlock

        let overlap = 0
        let newSize = [...currentSize]
        let newPos = [...currentPos]
        let debrisSize = [...currentSize]
        let debrisPos = [...currentPos]

        const axisIndex = direction === 'x' ? 0 : 2

        // Calculate overlap
        const delta = currentPos[axisIndex] - lastPos[axisIndex]
        const allowedSize = lastSize[axisIndex]
        const size = currentSize[axisIndex]

        // Check if missed completely
        if (Math.abs(delta) >= allowedSize) {
            set({ gameOver: true })
            return
        }

        // Calculate new size and position
        newSize[axisIndex] = allowedSize - Math.abs(delta)
        newPos[axisIndex] = lastPos[axisIndex] + delta / 2

        // Debris logic
        debrisSize[axisIndex] = Math.abs(delta)
        debrisPos[axisIndex] = currentPos[axisIndex] + (delta > 0 ? (allowedSize - Math.abs(delta)) / 2 : -(allowedSize - Math.abs(delta)) / 2)

        const newStackBlock = {
            position: newPos,
            size: newSize,
            color: color
        }

        // Generate next block
        const nextDirection = direction === 'x' ? 'z' : 'x'
        const nextColor = `hsl(${(score + 1) * 15 % 360}, 100%, 50%)`
        const nextPos = [newPos[0], newPos[1] + 1, newPos[2]]

        // Reset position for next spawn based on direction
        if (nextDirection === 'x') nextPos[0] = -4
        else nextPos[2] = -4

        set(state => ({
            stack: [...state.stack, newStackBlock],
            debris: [...state.debris, { position: debrisPos, size: debrisSize, color, velocity: [0, -0.1, 0] }], // Simple debris
            score: state.score + 1,
            cameraHeight: state.cameraHeight + 1,
            activeBlock: {
                position: nextPos,
                size: newSize, // Inherit size
                direction: nextDirection,
                speed: state.activeBlock.speed + 0.005, // Increase speed
                color: nextColor
            }
        }))
    }
}))
