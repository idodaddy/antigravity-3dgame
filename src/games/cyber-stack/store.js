import { create } from 'zustand'

const INITIAL_SIZE = [3, 1, 3]
const INITIAL_POSITION = [0, 0, 0]
const BASE_SPEED = 0.2

export const useStore = create((set, get) => ({
    // ... (lines 8-20 same)
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
    // ...
    // Called every frame to update active block position
    updateActiveBlock: (time) => {
        const { activeBlock, gameStarted, gameOver } = get()
        if (!gameStarted || gameOver || !activeBlock) return

        const limit = 2.5 // Reduced Movement range for faster feel
        const speed = activeBlock.speed
        // ...
        // Reset position for next spawn based on direction
        if (nextDirection === 'x') nextPos[0] = -3
        else nextPos[2] = -3

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
