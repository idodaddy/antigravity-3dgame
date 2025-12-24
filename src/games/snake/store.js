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
    directionQueue: [], // Queue for buffered inputs

    startGame: () => {
        set({
            snake: INITIAL_SNAKE,
            food: generateFood(INITIAL_SNAKE),
            direction: INITIAL_DIRECTION,
            nextDirection: INITIAL_DIRECTION,
            directionQueue: [],
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
            snake: INITIAL_SNAKE,
            directionQueue: []
        })
    },

    setDirection: (inputDir) => {
        set((state) => {
            // Determine the reference direction: either the last queued move or current direction
            const lastDir = state.directionQueue.length > 0
                ? state.directionQueue[state.directionQueue.length - 1]
                : state.direction;

            // Prevent 180 degree turns based on the LAST PLANNED move
            if (inputDir[0] === -lastDir[0] && inputDir[1] === -lastDir[1]) return {};

            // Should also prevent clogging the queue with too many moves? Max 3?
            if (state.directionQueue.length >= 3) return {};

            return { directionQueue: [...state.directionQueue, inputDir] };
        });
    },

    tick: () => {
        const state = get();
        if (!state.gameStarted || state.gameOver) return;

        let { snake, direction, directionQueue, food, score, speed } = state;

        // Process Input Queue
        let nextDir = direction;
        let newQueue = directionQueue;

        if (directionQueue.length > 0) {
            nextDir = directionQueue[0];
            newQueue = directionQueue.slice(1);
        }

        const head = snake[0];
        const newHead = [head[0] + nextDir[0], head[1] + nextDir[1]];

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
                direction: nextDir,
                directionQueue: newQueue
            });
        } else {
            newSnake.pop(); // Remove tail
            set({
                snake: newSnake,
                direction: nextDir,
                directionQueue: newQueue
            });
        }
    }
}));

const generateFood = (snake) => {
    let newFood;
    let attempts = 0;
    while (attempts < 50) {
        const x = Math.floor(Math.random() * BOARD_SIZE) - BOARD_SIZE / 2;
        const z = Math.floor(Math.random() * BOARD_SIZE) - BOARD_SIZE / 2;
        newFood = [x, z];

        // Check if on snake
        const onSnake = snake.some(s => s[0] === x && s[1] === z);
        if (!onSnake) return newFood;
        attempts++;
    }

    // Fallback: Linear search if random fails
    for (let x = -BOARD_SIZE / 2; x < BOARD_SIZE / 2; x++) {
        for (let z = -BOARD_SIZE / 2; z < BOARD_SIZE / 2; z++) {
            const onSnake = snake.some(s => s[0] === x && s[1] === z);
            if (!onSnake) {
                return [x, z];
            }
        }
    }

    // Win condition or board full? Just return current food or null
    return [0, 0]; // Should handle properly but for now prevents crash.
};
