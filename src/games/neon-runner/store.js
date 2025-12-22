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
    rank: null, // User rank on leaderboard

    setPlayerLane: (lane) => set({ playerLane: lane }),
    setPlayerY: (y) => set({ playerY: y }),
    setPlayerX: (x) => set({ playerX: x }),
    setRank: (rank) => set({ rank }),

    startGame: () => set({ gameStarted: true, gameOver: false, score: 0, lives: 3, level: 1, speed: 15, playerLane: 0, playerY: 0.3, rank: null }),
    endGame: () => set({ gameOver: true, gameStarted: false }),
    hit: () => set((state) => {
        const newLives = state.lives - 1
        if (newLives <= 0) {
            return { lives: 0, gameOver: true, gameStarted: false }
        }
        return { lives: newLives }
    }),
    collectMineral: (points = 1) => set((state) => {
        const newScore = state.score + points
        return { score: newScore }
    }),
    increaseLevel: () => set((state) => {
        const newLevel = state.level + 1
        const newSpeed = 15 + (newLevel - 1) * 2
        return { level: newLevel, speed: newSpeed }
    }),
    restart: () => set({ gameStarted: true, gameOver: false, score: 0, lives: 3, level: 1, speed: 15, playerLane: 0, playerY: 0.3, rank: null }),
    reset: () => set({ score: 0, gameOver: false, gameStarted: false, speed: 15, playerLane: 0, playerY: 0.3, level: 1, lives: 3, rank: null }),
}))
