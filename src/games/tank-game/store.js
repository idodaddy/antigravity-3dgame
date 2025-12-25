import { create } from 'zustand'
import { createRef } from 'react'

export const gameRefs = {
    player: createRef(),
    enemies: createRef([]),
    bullets: createRef([]),
    camera: createRef(),
}

export const useStore = create((set, get) => ({
    // Game State
    gameStarted: false,
    gameOver: false,
    level: 1,
    score: 0,
    lives: 3,
    mapSeed: Math.random(),

    // Player State
    playerCharge: 0, // 0-100
    isCharging: false,
    isMaxCharge: false,

    // Actions
    startGame: () => set({
        gameStarted: true,
        gameOver: false,
        level: 1,
        score: 0,
        lives: 3,
        mapSeed: Math.random(),
        playerCharge: 0
    }),

    reset: () => set({
        gameStarted: false,
        gameOver: false,
        level: 1,
        score: 0,
        lives: 3
    }),

    nextLevel: () => set(state => ({
        level: state.level + 1,
        mapSeed: Math.random() // New map per level
    })),

    addScore: (points) => set(state => ({ score: state.score + points })),

    setPlayerCharge: (val) => set({ playerCharge: val }),
    setIsCharging: (val) => set({ isCharging: val }),

    takeDamage: () => {
        const { lives } = get()
        if (lives > 1) {
            set({ lives: lives - 1 })
        } else {
            set({ lives: 0, gameOver: true })
        }
    },

    setGameOver: () => set({ gameOver: true }),
}))
