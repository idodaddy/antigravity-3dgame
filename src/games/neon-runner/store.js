import { create } from 'zustand'

export const useStore = create((set) => ({
    score: 0,
    gameOver: false,
    gameStarted: false,
    speed: 15, // Increased base speed
    playerLane: 0, // -1, 0, 1
    playerY: 0.3, // Vertical position
    playerX: 0, // Actual X position
    level: 1,
    lives: 3,

    setPlayerLane: (lane) => set({ playerLane: lane }),
    setPlayerY: (y) => set({ playerY: y }),
    setPlayerX: (x) => set({ playerX: x }),
    startGame: () => set({ gameStarted: true, gameOver: false, score: 0, speed: 15, playerLane: 0, playerY: 0.3, level: 1, lives: 3 }),
    endGame: () => set({ gameOver: true, gameStarted: false }),
    hit: () => set((state) => {
        const newLives = state.lives - 1
        if (newLives <= 0) {
            return { lives: 0, gameOver: true, gameStarted: false }
        }
        return { lives: newLives }
    }),
    collectMineral: () => set((state) => {
        const newScore = state.score + 1
        const newLevel = Math.floor(newScore / 10) + 1 // Level up every 10 minerals
        // Speed increases with level
        const newSpeed = 15 + (newLevel - 1) * 2
        return { score: newScore, level: newLevel, speed: newSpeed }
    }),
    reset: () => set({ score: 0, gameOver: false, gameStarted: false, speed: 15, playerLane: 0, playerY: 0.3, level: 1, lives: 3 }),
}))
