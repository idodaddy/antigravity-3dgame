import { create } from 'zustand'

export const useStore = create((set) => ({
    score: 0,
    lives: 3,
    gameStarted: false,
    gameOver: false,
    rank: null,

    startGame: () => {
        // Clear Refs
        gameRefs.enemies.current = []
        gameRefs.bullets.current = []
        gameRefs.events.current = []

        set({
            gameStarted: true,
            gameOver: false,
            score: 0,
            lives: 3,
            rank: null
        })
    },

    reset: () => {
        // Clear Refs
        gameRefs.enemies.current = []
        gameRefs.bullets.current = []
        gameRefs.events.current = []

        set({
            gameStarted: false,
            gameOver: false,
            score: 0,
            lives: 3,
            rank: null
        })
    },

    addScore: (points) => set((state) => ({ score: state.score + points })),

    takeDamage: () => set((state) => {
        const newLives = state.lives - 1
        return {
            lives: newLives,
            gameOver: newLives <= 0,
            gameStarted: newLives > 0
        }
    }),

    setRank: (rank) => set({ rank }),
}))

// Direct access refs for high-frequency updates/collisions
// preventing React re-renders loop
export const gameRefs = {
    player: { current: null }, // Stores position/ref
    bullets: { current: [] },
    enemies: { current: [] },
    events: { current: [] } // For effects (explosions, text)
}
