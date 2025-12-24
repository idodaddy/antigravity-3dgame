import { create } from 'zustand'
import { playEatSound, playDieSound } from './utils/audio'

const BOARD_SIZE = 20; // 20x20 grid (-10 to 10)
const INITIAL_SNAKE = [[0, 0], [0, 1], [0, 2]]; // Head at [0,0], tail trailing +Z
const INITIAL_DIRECTION = [0, -1]; // Moving -Z (Forward)
const BASE_SPEED = 0.18; // Slower speed (was 0.15)

export const useStore = create((set, get) => ({
    snake: INITIAL_SNAKE,
    food: [5, 5],
    direction: INITIAL_DIRECTION,
    nextDirection: INITIAL_DIRECTION,
    gameStarted: false,
    gameOver: false,
    score: 0,
    speed: BASE_SPEED,
    rank: null,

    setRank: (rank) => set({ rank }),

    startGame: () => {
        set({
            snake: INITIAL_SNAKE,
            food: generateFood(INITIAL_SNAKE),
            direction: INITIAL_DIRECTION,
            nextDirection: INITIAL_DIRECTION,
            gameStarted: true,
            gameOver: false,
            score: 0,
            speed: BASE_SPEED,
            rank: null
        })
    },

    reset: () => {
        set({
            gameStarted: false,
            gameOver: false,
            score: 0,
            snake: INITIAL_SNAKE
        })
    },

    setDirection: (dir) => {
        const { direction } = get();
        // Prevent 180 degree turns
        if (dir[0] === -direction[0] && dir[1] === -direction[1]) return;
        set({ nextDirection: dir });
    },

    tick: () => {
        const { snake, nextDirection, food, score, speed, gameOver, gameStarted } = get();
        if (!gameStarted || gameOver) return;

        const head = snake[0];
        const newHead = [head[0] + nextDirection[0], head[1] + nextDirection[1]];

        // Wall Collision
        if (Math.abs(newHead[0]) > BOARD_SIZE / 2 || Math.abs(newHead[1]) > BOARD_SIZE / 2) {
            try { playDieSound(); } catch (e) { console.warn('Audio error', e); }
            set({ gameOver: true });
            return;
        }

        // Self Collision
        if (snake.some(segment => segment[0] === newHead[0] && segment[1] === newHead[1])) {
            try { playDieSound(); } catch (e) { console.warn('Audio error', e); }
            set({ gameOver: true });
            return;
        }

        const newSnake = [newHead, ...snake];

        // Food Collision
        if (newHead[0] === food[0] && newHead[1] === food[1]) {
            try { playEatSound(); } catch (e) { console.warn('Audio error', e); }
            const newScore = score + 1;
            // Increase speed every 5 points
            const newSpeed = Math.max(0.05, BASE_SPEED - (Math.floor(newScore / 5) * 0.01));

            set({
                snake: newSnake,
                score: newScore,
                food: generateFood(newSnake),
                speed: newSpeed,
                direction: nextDirection
            });
        } else {
            newSnake.pop(); // Remove tail
            set({
                snake: newSnake,
                direction: nextDirection
            });
        }
    }
}));

const generateFood = (snake) => {
    let newFood;
    while (true) {
        const x = Math.floor(Math.random() * BOARD_SIZE) - BOARD_SIZE / 2;
        const z = Math.floor(Math.random() * BOARD_SIZE) - BOARD_SIZE / 2;
        newFood = [x, z];
        // Check if on snake
        const onSnake = snake.some(s => s[0] === x && s[1] === z);
        if (!onSnake) break;
    }
    return newFood;
};
