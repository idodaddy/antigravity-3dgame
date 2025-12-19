import React from 'react'
import { useStore } from '../store'
import GameEndOverlay from '../../../components/GameEndOverlay'

export default function HUD() {
    const score = useStore(state => state.score)
    const level = useStore(state => state.level)
    const speed = useStore(state => state.speed)
    const lives = useStore(state => state.lives)
    const gameOver = useStore(state => state.gameOver)
    const gameStarted = useStore(state => state.gameStarted)
    const startGame = useStore(state => state.startGame)
    const reset = useStore(state => state.reset)

    React.useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.code === 'Space') {
                if (!gameStarted && !gameOver) {
                    startGame()
                } else if (gameOver) {
                    reset()
                }
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [gameStarted, gameOver, startGame, reset])

    return (
        <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            color: 'white',
            fontFamily: 'sans-serif',
            textShadow: '0 0 10px #ff00cc'
        }}>
            <div style={{ position: 'absolute', top: 20, left: 20, fontSize: '24px', textAlign: 'left' }}>
                <div>Score: {Math.floor(score)}</div>
                <div style={{ fontSize: '18px', color: '#00ffcc' }}>Level: {level}</div>
                <div style={{ fontSize: '14px', color: '#aaa' }}>Speed: {speed.toFixed(1)}</div>
                <div style={{ fontSize: '24px', color: '#ff0055', marginTop: '10px' }}>Lives: {'❤️'.repeat(lives)}</div>
            </div>

            {!gameStarted && !gameOver && (
                <div style={{ pointerEvents: 'auto', textAlign: 'center' }}>
                    <h1 style={{ fontSize: '64px', marginBottom: '20px', color: '#00ffcc' }}>NEON RUNNER</h1>
                    <button
                        onClick={startGame}
                        style={{
                            padding: '15px 40px',
                            fontSize: '24px',
                            background: '#ff00cc',
                            border: 'none',
                            color: 'white',
                            cursor: 'pointer',
                            borderRadius: '5px',
                            boxShadow: '0 0 20px #ff00cc'
                        }}
                    >
                        START GAME
                    </button>
                    <p style={{ marginTop: '20px' }}>Press Space, Click, or Tap to Start</p>
                </div>
            )}

            {gameOver && <GameEndOverlay score={Math.floor(score)} onRestart={reset} />}
        </div>
    )
}
